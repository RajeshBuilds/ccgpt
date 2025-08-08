import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG, validateFile, generateUniqueFilename } from '@/lib/s3';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
  console.log('🌐 Presigned URL API called');
  
  try {
    // Check authentication
    console.log('🔐 Checking authentication...');
    const session = await auth();
    console.log(' Session:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
    });

    if (!session) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📥 Parsing request body...');
    const { filename, contentType, fileSize } = await request.json();
    
    console.log(' Request data:', {
      filename,
      contentType,
      fileSize,
    });

    if (!filename || !contentType) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Filename and content type are required' }, { status: 400 });
    }

    // Create a mock file object for validation
    console.log(' Creating mock file for validation...');
    const mockFile = new File([], filename, { type: contentType });
    Object.defineProperty(mockFile, 'size', { value: fileSize || 0 });

    // Validate file
    console.log('✅ Validating file...');
    const validation = validateFile(mockFile);
    console.log('🔍 Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ File validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log('📝 Generating unique filename...');
    const uniqueFilename = generateUniqueFilename(filename);
    console.log('📝 Unique filename generated:', uniqueFilename);

    console.log('🔧 Creating S3 command...');
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: `uploads/${uniqueFilename}`,
      ContentType: contentType,
      Metadata: {
        originalName: filename,
        uploadedBy: session.user?.email || 'unknown',
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log(' S3 command created:', {
      bucket: S3_CONFIG.BUCKET_NAME,
      key: `uploads/${uniqueFilename}`,
      contentType,
      metadata: {
        originalName: filename,
        uploadedBy: session.user?.email || 'unknown',
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate presigned URL (expires in 1 hour)
    console.log('🔗 Generating presigned URL...');
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('🔗 Presigned URL generated (length):', presignedUrl.length);

    const responseData = {
      success: true,
      presignedUrl,
      filename: uniqueFilename,
      uploadUrl: `https://${S3_CONFIG.BUCKET_NAME}.s3.${S3_CONFIG.REGION}.amazonaws.com/uploads/${uniqueFilename}`,
    };

    console.log('✅ Presigned URL API response:', {
      success: responseData.success,
      filename: responseData.filename,
      uploadUrl: responseData.uploadUrl,
      hasPresignedUrl: !!responseData.presignedUrl,
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Presigned URL API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
} 