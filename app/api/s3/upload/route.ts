import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG, validateFile, generateUniqueFilename } from '@/lib/s3';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {  
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!docType || !['policy', 'resolution'].includes(docType)) {
      return NextResponse.json({ error: 'Valid docType is required (policy or resolution)' }, { status: 400 });
    }

    const validation = validateFile(file);

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const uniqueFilename = generateUniqueFilename(file.name);

    // Determine the S3 key prefix based on docType
    const keyPrefix = docType === 'policy' ? 'policies' : 'resolved-tickets';
    const s3Key = `${keyPrefix}/${uniqueFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: session.user?.email || 'unknown',
        uploadedAt: new Date().toISOString(),
        docType: docType,
      },
    });

    await s3Client.send(command);

    const uploadUrl = `https://${S3_CONFIG.BUCKET_NAME}.s3.${S3_CONFIG.REGION}.amazonaws.com/${s3Key}`;
    
    const responseData = {
      success: true,
      url: uploadUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file to S3' },
      { status: 500 }
    );
  }
} 