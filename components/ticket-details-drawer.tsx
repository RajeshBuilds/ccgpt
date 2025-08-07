
import React from "react";
import { Button } from "@/components/ui/button";

type TicketDetailsDrawerProps = {
  ticket: any;
  open: boolean;
  onClose: () => void;
  onAssign: () => void;
  isAssignedToUser: boolean;
  assigning: boolean;
  userId?: string | number;
  onChange: (ticket: any) => void;
  onStatusChange: (status: string) => void;
  onSave: (ticket: any) => void;
};

export function TicketDetailsDrawer({
  ticket,
  open,
  onClose,
  onAssign,
  isAssignedToUser,
  assigning,
  userId,
  onChange,
  onStatusChange,
  onSave,
}: TicketDetailsDrawerProps) {
  if (!ticket) return null;
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: open ? 'rgba(0,0,0,0.2) -4px 0px 24px' : 'none' }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="text-lg font-bold">Ticket Details</div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
      </div>
      <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        {Object.entries(ticket).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            {key === 'status' ? (
              <select
                className="w-full px-3 py-2 border rounded"
                value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                onChange={e => onStatusChange(e.target.value)}
              >
                <option value="">Select status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            ) : key === 'description' ? (
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                onChange={e => onChange({ ...ticket, [key]: e.target.value })}
                rows={4}
              />
            ) : (
              <input
                className="w-full px-3 py-2 border rounded"
                value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                readOnly={key === 'id' || key === 'referenceNumber' || key === 'createdAt' || key === 'resolvedAt'}
                onChange={e => onChange({ ...ticket, [key]: e.target.value })}
              />
            )}
          </div>
        ))}
        <div className="flex items-center mt-4 justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">Assigned To: {ticket.assignedTo ? ticket.assignedTo : "Unassigned"}</div>
            {!isAssignedToUser && (
              <Button onClick={onAssign} disabled={assigning} variant="outline">
                {assigning ? "Assigning..." : "Assign to me"}
              </Button>
            )}
          </div>
          <Button type="button" variant="default" onClick={() => onSave(ticket)}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
