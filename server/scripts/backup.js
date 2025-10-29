import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
});

const backupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Starting database backup...');

    const collections = await mongoose.connection.db.collections();
    const backupData = {};

    for (const collection of collections) {
      const collectionName = collection.collectionName;
      const documents = await collection.find({}).toArray();
      backupData[collectionName] = documents;
    }

    const backupJson = JSON.stringify(backupData);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `backups/aquabeacon-backup-${timestamp}.json.gz`;

    // Compress and upload to S3
    const gzip = createGzip();
    const buffer = Buffer.from(backupJson, 'utf8');

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: backupKey,
      Body: buffer,
      ContentEncoding: 'gzip',
      ContentType: 'application/json'
    });

    await s3Client.send(command);
    console.log(`Backup completed: ${backupKey}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
};

backupDatabase();
