'use client';

import { ComplaintConfirmationCard } from '../../_components/chat/complaint-confirmation-card';

export default function ComplaintConfirmPage() {
  // Dummy complaint data for demonstration
  const dummyComplaint = {
    id: "COMP-2024-001234",
    customerId: 12345,
    preferredContactMethod: "email" as const,
    preferredContactInfo: "john.doe@example.com",
    preferredContactTime: "morning" as const,
    categoryId: 1,
    subCategoryId: 2,
    description: "I was trying to transfer $500 to my savings account yesterday, but the transaction failed. I received an error message saying 'Insufficient funds' even though I have more than $2000 in my checking account. This is the third time this has happened this month. I need this issue resolved immediately as I have bills due.",
    incidentDate: new Date("2024-01-15"),
    incidentTime: new Date("2024-01-15T14:30:00"),
    transactionReference: "TXN-2024-001234",
    transactionAmount: 500.00,
    productDetails: "Online Banking Transfer",
    deviceDetails: "iPhone 15 Pro, iOS 17.2",
    appDetails: "XYZ Bank Mobile App v3.2.1",
    browserDetails: "Safari 17.2 on macOS",
    attachmentUrls: "screenshot1.png,screenshot2.png,error_log.txt",
    branchDetails: "Downtown Branch - 123 Main Street",
    branchEmployee: "Sarah Johnson",
    atmLocation: undefined,
    fraudDetails: undefined,
    fraudType: undefined,
    fraudAmount: undefined,
    desiredResolution: "I want the transfer to be processed immediately, and I need compensation for the late fees I incurred due to this technical issue. I also want assurance that this won't happen again.",
    sentiment: "negative" as const,
    urgencyLevel: "high" as const,
    assistantNotes: "Customer has experienced this issue multiple times. Technical investigation required. Consider escalating to IT department. Customer is frustrated and needs immediate resolution.",
    assignedTo: 67890,
    isDraft: false,
    status: "open" as const,
    resolutionNotes: undefined,
    resolvedAt: undefined,
    createdAt: new Date("2024-01-16T09:00:00"),
    updatedAt: new Date("2024-01-16T09:00:00"),
  };

  const handleConfirm = () => {
    console.log('Complaint confirmed');
    // Add your confirmation logic here
  };

  const handleEdit = () => {
    console.log('Edit complaint');
    // Add your edit logic here
  };

  const handleCancel = () => {
    console.log('Cancel complaint');
    // Add your cancel logic here
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Complaint Confirmation</h1>
        <p className="text-muted-foreground mt-2">
          Please review your complaint details below and confirm if everything is correct.
        </p>
      </div>
      
      <ComplaintConfirmationCard
        complaint={dummyComplaint}
        onConfirm={handleConfirm}
        onEdit={handleEdit}
        onCancel={handleCancel}
        isLoading={false}
      />
    </div>
  );
}