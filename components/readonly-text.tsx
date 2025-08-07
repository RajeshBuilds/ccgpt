import { CopyIcon } from '@/components/icons';
import { Download as DownloadIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import React from 'react';

export interface ReadonlyTextProps {
  content: string;
  header: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ReadonlyText({ content, header, className = '', style }: ReadonlyTextProps) {
  // Helper to generate PDF blob
  const generatePdfBlob = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 20);
    return doc.output('blob');
  };

  // Upload handler
  const handleUpload = async () => {
    try {
      const pdfBlob = generatePdfBlob();
      const formData = new FormData();
      formData.append('file', pdfBlob, `${header || 'document'}.pdf`);
      // Replace with your actual API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        toast.success('Uploaded PDF to cloud!');
      } else {
        toast.error('Upload failed');
      }
    } catch (e) {
      toast.error('Failed to upload PDF');
    }
  };

  return (
    <div className={`relative p-8 md:p-20 pt-16 ${className}`} style={style}>
      {/* Header Row */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4">
        <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex-1 text-center select-none">
          {header}
        </span>
        <div className="flex gap-2 items-center">
          <button
            title="Copy"
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success('Copied to clipboard!');
            }}
          >
            <CopyIcon size={18} />
          </button>
          <button
            title="Download as PDF"
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => {
              try {
                const doc = new jsPDF();
                const lines = doc.splitTextToSize(content, 180);
                doc.text(lines, 10, 20);
                doc.save(`${header || 'document'}.pdf`);
                toast.success('Downloaded as PDF!');
              } catch (e) {
                toast.error('Failed to generate PDF');
              }
            }}
          >
            <DownloadIcon size={18} />
          </button>
          <button
            title="Upload PDF to Cloud"
            className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={handleUpload}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 16v4H8v-4M12 12v8m0 0l-4-4m4 4l4-4M20 16.58A5 5 0 0 0 18 7a5 5 0 0 0-9.9 1.5"/></svg>
          </button>
        </div>
      </div>
      <div className="prose max-w-none whitespace-pre-line text-base md:text-lg mt-2">{content}</div>
    </div>
  );
}
