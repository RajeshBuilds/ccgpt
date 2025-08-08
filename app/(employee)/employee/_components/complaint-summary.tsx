import { CopyIcon } from '@/components/icons';
import { Download as DownloadIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import React from 'react';

export interface ComplaintSummaryProps {
  content: string;
  header: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ComplaintSummary({ content, header, className = '', style }: ComplaintSummaryProps) {
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
    <div className={`relative bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 md:p-16 pt-20 ${className} flex flex-col`} style={style}>
      {/* Header Row */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-5 rounded-t-xl bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <span className="font-bold text-xl md:text-2xl text-zinc-900 dark:text-zinc-100 flex-1 text-center select-none tracking-tight">
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
      <div className="prose max-w-none whitespace-pre-line text-base md:text-lg mt-4 text-zinc-800 dark:text-zinc-100 flex-1 min-h-0 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
