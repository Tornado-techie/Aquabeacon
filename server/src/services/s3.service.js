const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Check if S3 is configured - for development, force local storage
const isS3Configured = false; // Temporarily disable S3 for development

let s3Client = null;

if (isS3Configured) {
  s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
  });
  logger.info('S3 client initialized');
} else {
  logger.warn('S3 not configured, using local file storage for development');
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'aquabeacon';

const uploadToS3 = async (fileBuffer, key, contentType, metadata = {}) => {
  try {
    if (isS3Configured && s3Client) {
      // Use S3 storage
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata
      });

      await s3Client.send(command);

      const url = process.env.S3_ENDPOINT 
        ? `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`
        : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

      logger.info(`File uploaded to S3: ${key}`);
      return url;
    } else {
      // Use local file storage for development
      const uploadsDir = path.join(process.cwd(), '..', 'uploads');
      const filePath = path.join(uploadsDir, key);
      const fileDir = path.dirname(filePath);

      // Ensure directory exists
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Write file to local storage
      fs.writeFileSync(filePath, fileBuffer);

      // Generate accessible URL (assuming server serves files from /uploads route)
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      const url = `${baseUrl.replace(':5173', ':5000')}/uploads/${key}`;
      logger.info(`File uploaded to local storage: ${key}`);
      return url;
    }
  } catch (error) {
    logger.error('File upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
};

const uploadMultipleToS3 = async (files) => {
  const uploadPromises = files.map(file => 
    uploadToS3(file.buffer, file.key, file.mimetype, file.metadata)
  );
  
  return Promise.all(uploadPromises);
};

const deleteFromS3 = async (key) => {
  try {
    if (isS3Configured && s3Client) {
      // Delete from S3
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });

      await s3Client.send(command);
      logger.info(`File deleted from S3: ${key}`);
    } else {
      // Delete from local storage
      const uploadsDir = path.join(process.cwd(), '..', 'uploads');
      const filePath = path.join(uploadsDir, key);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`File deleted from local storage: ${key}`);
      }
    }
    
    return true;

  } catch (error) {
    logger.error('File delete error:', error);
    return false;
  }
};

const generateFileKey = (folder, originalName) => {
  const timestamp = Date.now();
  const uuid = uuidv4();
  const extension = originalName.split('.').pop();
  return `${folder}/${timestamp}-${uuid}.${extension}`;
};

module.exports = {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  generateFileKey
};