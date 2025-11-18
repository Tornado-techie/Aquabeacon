import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: true // Required for MinIO
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      'image/jpeg': true,
      'image/png': true,
      'image/gif': true,
      'application/pdf': true
    };
    
    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileKey = `${Date.now()}-${req.file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'private'
    });

    await s3Client.send(command);

    const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileKey}`;

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: fileKey,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

export default router;
