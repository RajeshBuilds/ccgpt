import { CheckCircle, FileText, Info, Calendar, ClipboardList, Users, AlertCircle } from "lucide-react";
import React from "react";

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex items-start gap-2 bg-white/60 dark:bg-zinc-800/60 rounded-md px-3 py-2 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <span className="mt-0.5">{icon}</span>
      <div>
        <div className="font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-zinc-900 dark:text-zinc-100 break-words whitespace-pre-line">{value || <span className="italic text-zinc-400">N/A</span>}</div>
      </div>
    </div>
  );
}

export default function TicketDetails({ onClose, complaint }: { onClose: () => void; complaint?: any }) {
  return (
    <div className="relative bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg px-8 py-4 h-full w-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-blue-600 dark:text-blue-400" size={22} />
          <h2 className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">Ticket Details</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Close Ticket Details"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
      </div>
      {complaint ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-800 dark:text-zinc-200 overflow-y-auto flex-1">
          <DetailRow icon={<FileText className="text-violet-600" size={18} />} label="Reference #" value={complaint.referenceNumber} />
          <DetailRow icon={<CheckCircle className="text-green-600" size={18} />} label="Status" value={complaint.status} />
          <DetailRow icon={<Info className="text-blue-500" size={18} />} label="Description" value={complaint.description} />
          <DetailRow icon={<AlertCircle className="text-yellow-500" size={18} />} label="Additional Details" value={complaint.additionalDetails} />
          <DetailRow icon={<ClipboardList className="text-indigo-500" size={18} />} label="Desired Resolution" value={complaint.desiredResolution} />
          <DetailRow icon={<Users className="text-pink-500" size={18} />} label="Assigned To" value={complaint.assignedTo} />
          <DetailRow icon={<Calendar className="text-gray-500" size={18} />} label="Created At" value={complaint.createdAt} />
          <DetailRow icon={<Calendar className="text-gray-500" size={18} />} label="Updated At" value={complaint.updatedAt} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
          <Info size={32} className="mb-2" />
          <span>Selected ticket details go here.</span>
        </div>
      )}
    </div>
  );
}
