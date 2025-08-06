import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon, MailIcon, AlertTriangleIcon, CheckCircleIcon, EditIcon, DollarSignIcon, FileTextIcon } from 'lucide-react';

// Types based on the complaint schema
interface ComplaintConfirmationCardProps {
  complaint: {
    id: string;
    customerId?: number;
    preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
    preferredContactInfo?: string;
    preferredContactTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    categoryId?: number;
    subCategoryId?: number;
    description?: string;
    incidentDate?: Date;
    incidentTime?: Date;
    transactionReference?: string;
    transactionAmount?: number;
    productDetails?: string;
    deviceDetails?: string;
    appDetails?: string;
    browserDetails?: string;
    attachmentUrls?: string;
    branchDetails?: string;
    branchEmployee?: string;
    atmLocation?: string;
    fraudDetails?: string;
    fraudType?: 'card_fraud' | 'account_fraud' | 'other';
    fraudAmount?: number;
    desiredResolution?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
    assistantNotes?: string;
    assignedTo?: number;
    isDraft: boolean;
    status?: 'open' | 'in_progress' | 'closed' | 'escalated';
    resolutionNotes?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
  };
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'closed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'escalated':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getUrgencyColor = (urgency?: string) => {
  switch (urgency) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getContactMethodIcon = (method?: string) => {
  switch (method) {
    case 'email':
      return <MailIcon className="h-3 w-3" />;
    case 'phone':
      return <PhoneIcon className="h-3 w-3" />;
    case 'whatsapp':
      return <PhoneIcon className="h-3 w-3" />;
    default:
      return <UserIcon className="h-3 w-3" />;
  }
};

const formatCurrency = (amount?: number) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date?: Date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const formatTime = (date?: Date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export function ComplaintConfirmationCard({
  complaint,
  onConfirm,
  onEdit,
  onCancel,
  isLoading = false,
}: ComplaintConfirmationCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <CardTitle className="text-base">Complaint Summary</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {complaint.status && (
              <Badge className={`text-xs ${getStatusColor(complaint.status)}`}>
                {complaint.status.replace('_', ' ')}
              </Badge>
            )}
            {complaint.urgencyLevel && (
              <Badge className={`text-xs ${getUrgencyColor(complaint.urgencyLevel)}`}>
                {complaint.urgencyLevel}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          ID: {complaint.id} • Review and confirm details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Quick Info Row */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span className="font-medium">Date:</span>
            <span>{formatDate(complaint.incidentDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span className="font-medium">Time:</span>
            <span>{formatTime(complaint.incidentTime)}</span>
          </div>
          {complaint.branchDetails && (
            <div className="flex items-center gap-1 col-span-2">
              <MapPinIcon className="h-3 w-3" />
              <span className="font-medium">Location:</span>
              <span className="truncate">{complaint.branchDetails}</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {complaint.preferredContactMethod && (
          <div className="flex items-center gap-1 text-xs">
            {getContactMethodIcon(complaint.preferredContactMethod)}
            <span className="font-medium">Contact:</span>
            <span className="capitalize">{complaint.preferredContactMethod}</span>
            {complaint.preferredContactInfo && (
              <>
                <span>•</span>
                <span>{complaint.preferredContactInfo}</span>
              </>
            )}
          </div>
        )}

        {/* Transaction Details */}
        {(complaint.transactionReference || complaint.transactionAmount) && (
          <div className="flex items-center gap-1 text-xs">
            <DollarSignIcon className="h-3 w-3" />
            <span className="font-medium">Transaction:</span>
            {complaint.transactionReference && <span>{complaint.transactionReference}</span>}
            {complaint.transactionAmount && (
              <>
                <span>•</span>
                <span>{formatCurrency(complaint.transactionAmount)}</span>
              </>
            )}
          </div>
        )}

        {/* Fraud Alert */}
        {(complaint.fraudDetails || complaint.fraudType) && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertTriangleIcon className="h-3 w-3" />
            <span className="font-medium">Fraud:</span>
            <span>{complaint.fraudType?.replace('_', ' ') || 'Reported'}</span>
            {complaint.fraudAmount && (
              <>
                <span>•</span>
                <span>{formatCurrency(complaint.fraudAmount)}</span>
              </>
            )}
          </div>
        )}

        {/* Description Preview */}
        {complaint.description && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <FileTextIcon className="h-3 w-3" />
              <span className="font-medium">Issue:</span>
            </div>
            <div className="bg-muted/50 p-2 rounded text-xs">
              <p className="line-clamp-3">{complaint.description}</p>
            </div>
          </div>
        )}

        {/* Desired Resolution Preview */}
        {complaint.desiredResolution && (
          <div className="space-y-1">
            <div className="text-xs font-medium">Desired Resolution:</div>
            <div className="bg-muted/50 p-2 rounded text-xs">
              <p className="line-clamp-2">{complaint.desiredResolution}</p>
            </div>
          </div>
        )}

        {/* Attachments */}
        {complaint.attachmentUrls && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileTextIcon className="h-3 w-3" />
            <span>{complaint.attachmentUrls.split(',').length} attachment(s)</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="text-xs text-muted-foreground">
          Created {formatDate(complaint.createdAt)}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} disabled={isLoading} className="h-7 px-2 text-xs">
              <EditIcon className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading} className="h-7 px-2 text-xs">
              Cancel
            </Button>
          )}
          {onConfirm && (
            <Button size="sm" onClick={onConfirm} disabled={isLoading} className="h-7 px-3 text-xs">
              {isLoading ? 'Confirming...' : 'Confirm'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
