import { S3Client } from '@aws-sdk/client-s3';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

// S3 Client Configuration with credentials chain
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: fromNodeProviderChain(),
});

console.log('🔧 S3 Client initialized with config:', {
  region: process.env.AWS_REGION || 'us-east-1',
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  hasSessionToken: !!process.env.AWS_SESSION_TOKEN,
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  accessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
});

// S3 Configuration Constants
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

console.log('📋 S3 Config loaded:', {
  bucketName: S3_CONFIG.BUCKET_NAME,
  region: S3_CONFIG.REGION,
  maxFileSize: S3_CONFIG.MAX_FILE_SIZE,
  allowedTypes: S3_CONFIG.ALLOWED_FILE_TYPES,
});

// File validation helper
export function validateFile(file: File): { isValid: boolean; error?: string } {
  console.log(' Validating file:', {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  // Check file size
  if (file.size > S3_CONFIG.MAX_FILE_SIZE) {
    console.log('❌ File size validation failed:', {
      fileSize: file.size,
      maxSize: S3_CONFIG.MAX_FILE_SIZE,
    });
    return {
      isValid: false,
      error: `File size must be less than ${S3_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!S3_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    console.log('❌ File type validation failed:', {
      fileType: file.type,
      allowedTypes: S3_CONFIG.ALLOWED_FILE_TYPES,
    });
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${S3_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  console.log('✅ File validation passed');
  return { isValid: true };
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const uniqueName = `${timestamp}-${randomString}.${extension}`;
  
  console.log('📝 Generated unique filename:', {
    originalName,
    uniqueName,
    timestamp,
    randomString,
    extension,
  });
  
  return uniqueName;
} 