
import React from "react";
import { Button } from "@/components/ui/button";

type TicketDetailsDrawerProps = {
  ticket: any;
  open: boolean;
  onClose: () => void;
  onAssign?: () => void;
  isAssignedToUser?: boolean;
  assigning?: boolean;
  userId?: string | number;
  onChange: (ticket: any) => void;
  onStatusChange: (status: string) => void;
};

export function TicketDetailsDrawer({
  ticket,
  open,
  onClose,
  onAssign = () => {},
  isAssignedToUser = false,
  assigning = false,
  userId,
  onChange,
  onStatusChange,
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
      <div className="p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reference</label>
          <input className="w-full px-3 py-2 border rounded" value={ticket.referenceNumber} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input className="w-full px-3 py-2 border rounded" value={ticket.subject} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input className="w-full px-3 py-2 border rounded" value={ticket.category} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full px-3 py-2 border rounded" value={ticket.status} onChange={e => onStatusChange(e.target.value)}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full px-3 py-2 border rounded" value={ticket.description} onChange={e => onChange({ ...ticket, description: e.target.value })} rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Criticality</label>
          <input className="w-full px-3 py-2 border rounded" value={ticket.criticality} readOnly />
        </div>
        <div className="flex items-center mt-4 justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">Assigned To: {ticket.assignedTo ? ticket.assignedTo : "Unassigned"}</div>
            {!isAssignedToUser && (
              <Button onClick={onAssign} disabled={assigning} variant="outline">
                {assigning ? "Assigning..." : "Assign to me"}
              </Button>
            )}
          </div>
          <Button type="button" variant="default" onClick={() => onChange(ticket)}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
