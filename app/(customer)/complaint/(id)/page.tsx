import { Suspense } from 'react';
import { notFound } from 'next/navigation';

interface ComplaintPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ComplaintPage({ params }: ComplaintPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Complaint Details</h1>
        
        <Suspense fallback={<div>Loading complaint details...</div>}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <span className="text-sm text-gray-500">Complaint ID</span>
              <p className="text-lg font-medium">{id}</p>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-600">Complaint details will be displayed here.</p>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
