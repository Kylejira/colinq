const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Cloudflare R2 uses S3-compatible API
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;

// Upload a file to R2
const uploadFile = async (key, buffer, contentType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the public URL or signed URL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

// Get a signed URL for private file access
const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Generate a unique file key
const generateFileKey = (prefix, filename) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = filename.split('.').pop();
  return `${prefix}/${timestamp}-${random}.${extension}`;
};

module.exports = {
  uploadFile,
  getSignedDownloadUrl,
  generateFileKey,
};



