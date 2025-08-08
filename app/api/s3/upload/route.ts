import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG, validateFile, generateUniqueFilename } from '@/lib/s3';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
  console.log('🌐 S3 Upload API called');
  
  try {
    // Check authentication
    console.log('🔐 Checking authentication...');
    const session = await auth();
    
    if (!session) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📥 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📁 File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    console.log('✅ Validating file...');
    const validation = validateFile(file);
    console.log('🔍 Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ File validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log('📝 Generating unique filename...');
    const uniqueFilename = generateUniqueFilename(file.name);
    console.log('📝 Unique filename generated:', uniqueFilename);

    // Convert file to buffer
    console.log(' Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✅ File converted to buffer, size:', buffer.length);

    console.log('🔧 Creating S3 command...');
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: `uploads/${uniqueFilename}`,
      Body: buffer, // Use buffer instead of file
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: session.user?.email || 'unknown',
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('☁️ Uploading to S3...');
    await s3Client.send(command);
    console.log('✅ S3 upload successful');

    const uploadUrl = `https://${S3_CONFIG.BUCKET_NAME}.s3.${S3_CONFIG.REGION}.amazonaws.com/uploads/${uniqueFilename}`;
    
    const responseData = {
      success: true,
      url: uploadUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    };

    console.log('✅ Upload API response:', responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ S3 Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to S3' },
      { status: 500 }
    );
  }
} 