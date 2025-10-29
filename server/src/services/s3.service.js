const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'aquabeacon';

const uploadToS3 = async (fileBuffer, key, contentType, metadata = {}) => {
  try {
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

  } catch (error) {
    logger.error('S3 upload error:', error);
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
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    logger.info(`File deleted from S3: ${key}`);

    return true;

  } catch (error) {
    logger.error('S3 delete error:', error);
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