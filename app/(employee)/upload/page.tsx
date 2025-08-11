'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('🚀 UploadPage component rendered');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const validateFile = (file: File): string | null => {
    console.log('🔍 Client-side file validation:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    if (file.size > maxSize) {
      console.log('❌ Client validation failed: File too large');
      return 'File size should be less than 5MB';
    }

    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Client validation failed: Invalid file type');
      return 'Only JPEG, PNG, GIF, WebP images and PDF files are allowed';
    }

    console.log('✅ Client validation passed');
    return null;
  };

  // Server-side upload function
  const uploadFile = async (file: File): Promise<{ url: string; filename: string }> => {
    console.log('🚀 Starting server-side file upload for:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Sending file to server...');
    const response = await fetch('/api/s3/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Server response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Server upload failed:', error);
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('✅ Server-side upload completed:', result);

    return {
      url: result.url,
      filename: result.filename || file.name,
    };
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    console.log('📁 handleFileUpload called with files:', {
      count: files.length,
      files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type })),
    });

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      console.log(' Processing file:', file.name);

      const validationError = validateFile(file);
      if (validationError) {
        console.log('❌ File validation failed:', validationError);
        toast.error(`${file.name}: ${validationError}`);
        continue;
      }

      const fileId = Math.random().toString(36).substr(2, 9);
      console.log('🆔 Generated file ID:', fileId);

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };

      console.log('📝 Adding file to upload list:', uploadedFile);
      setUploadedFiles(prev => [...prev, uploadedFile]);

      let progressInterval: NodeJS.Timeout | undefined;
      
      try {
        console.log('⏱️ Starting progress simulation...');
        // Simulate upload progress
        progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 100);

        console.log('🚀 Starting actual file upload...');
        const result = await uploadFile(file);
        
        console.log('✅ File upload completed:', result);
        
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'success', progress: 100, url: result.url }
              : f
          )
        );

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error('❌ File upload failed:', error);
        
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        );

        toast.error(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    console.log('📥 Drag drop event triggered');
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    console.log('📁 Dropped files:', {
      count: files.length,
      files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type })),
    });

    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input change event');
    const files = e.target.files;
    console.log('📁 Selected files:', {
      count: files?.length || 0,
      files: files ? Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type })) : [],
    });

    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  }, [handleFileUpload]);

  const removeFile = useCallback((fileId: string) => {
    console.log('🗑️ Removing file with ID:', fileId);
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleBrowseClick = useCallback(() => {
    console.log('🔍 Browse button clicked');
    fileInputRef.current?.click();
  }, []);

  console.log('📊 Current state:', {
    uploadedFilesCount: uploadedFiles.length,
    isDragOver,
    uploadedFiles: uploadedFiles.map(f => ({ id: f.id, name: f.name, status: f.status, progress: f.progress })),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Files to Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Upload your files securely. Supported formats: JPEG, PNG, GIF, WebP, PDF (max 5MB)
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
            <p className="text-muted-foreground mb-4">
              or click the button below to select files
            </p>
            <Button onClick={handleBrowseClick} className="mb-4">
              Browse Files
            </Button>
            <p className="text-sm text-muted-foreground">
              Maximum file size: 5MB • Supported formats: JPEG, PNG, GIF, WebP, PDF
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <Badge variant={file.status === 'success' ? 'default' : file.status === 'error' ? 'destructive' : 'secondary'}>
                        {file.status === 'uploading' && 'Uploading...'}
                        {file.status === 'success' && 'Success'}
                        {file.status === 'error' && 'Error'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type}</span>
                    </div>

                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-2" />
                    )}

                    {file.status === 'error' && file.error && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{file.error}</span>
                      </div>
                    )}

                    {file.status === 'success' && file.url && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Uploaded successfully</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          View file
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {uploadedFiles.filter(f => f.status === 'success').length} of {uploadedFiles.length} files uploaded successfully
              </div>
              <Button
                variant="outline"
                onClick={() => setUploadedFiles([])}
                disabled={uploadedFiles.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
