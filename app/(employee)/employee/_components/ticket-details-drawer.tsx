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
      className={`fixed top-0 right-0 h-full max-h-full flex flex-col w-full max-w-md bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-l border-zinc-200 dark:border-zinc-800 rounded-l-2xl shadow-2xl z-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: open ? 'rgba(0,0,0,0.2) -4px 0px 24px' : 'none' }}
    >
      <div className="flex items-center justify-between px-8 py-5 border-b bg-white/80 dark:bg-zinc-900/80 rounded-tl-2xl">
        <div className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
          Ticket Details
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-2xl px-2 py-1 rounded-full transition-colors" title="Close">
          ×
        </button>
      </div>
      <div className="px-8 pt-8 py-4 flex flex-col gap-5 h-full overflow-y-auto">
        {/* Render all fields except assignedTo, which will be rendered separately below */}
        {Object.entries(ticket).map(([key, value]) => {
          if (key === 'assignedTo') return null;
          const nonEditableFields = [
            'id', 'referenceNumber', 'complaintId', 'customerId',
            'createdAt', 'resolvedAt', 'updatedAt'
          ];
          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              {key === 'status' ? (
                <select
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
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
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                  onChange={e => onChange({ ...ticket, [key]: e.target.value })}
                  rows={4}
                  readOnly={nonEditableFields.includes(key)}
                />
              ) : (
                <input
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                  readOnly={nonEditableFields.includes(key)}
                  onChange={e => onChange({ ...ticket, [key]: e.target.value })}
                />
              )}
            </div>
          );
        })}
        {/* Assigned To field as a non-editable field */}
        <div className="flex flex-col gap-1">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
            Assigned To
          </label>
          <input
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            value={ticket.assignedTo ? ticket.assignedTo : 'Unassigned'}
            readOnly
          />
        </div>
      </div>
      {/* Sticky footer for action buttons */}
      <div className="sticky bottom-0 left-0 w-full bg-gradient-to-t from-white/90 via-white/80 to-white/60 dark:from-zinc-900/90 dark:via-zinc-950/80 dark:to-zinc-900/60 px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 z-10 shadow-[0_-2px_12px_0_rgba(0,0,0,0.08)]" style={{ minHeight: '80px' }}>
        <div className="flex items-center gap-2">
          {!isAssignedToUser && (
            <Button onClick={onAssign} disabled={assigning} variant="outline" className="rounded-lg px-4 py-2">
              {assigning ? "Assigning..." : "Assign to me"}
            </Button>
          )}
        </div>
        <Button type="button" variant="default" className="rounded-lg px-5 py-2 font-semibold" onClick={() => onSave(ticket)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
