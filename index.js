const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const ffmpegPath = 'C:/ffmpeg/bin/ffmpeg.exe'; // Replace with the actual path to ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.resolve(req.file.path);
  const outputFilePath = path.resolve('uploads', 'output.wav');

  // Convert .ogg to .wav using ffmpeg
  ffmpeg(filePath)
    .toFormat('wav')
    .on('end', () => {
      console.log('Conversion finished');
      res.download(outputFilePath, 'output.wav', (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error sending file');
        } else {
          // Optionally delete the files after sending
          fs.unlinkSync(filePath);
          fs.unlinkSync(outputFilePath);
        }
      });
    })
    .on('error', (err) => {
      console.error('Error during conversion:', err);
      res.status(500).send('Error during conversion');
    })
    .save(outputFilePath);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
