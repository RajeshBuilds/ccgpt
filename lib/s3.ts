import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_CONFIG = {
  BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME!,
  REGION: process.env.AWS_REGION || 'us-east-1',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ] as string[],
} as const;

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > S3_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${S3_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  if (!S3_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${S3_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  return { isValid: true };
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const uniqueName = `${timestamp}-${randomString}.${extension}`;
  return uniqueName;
} 