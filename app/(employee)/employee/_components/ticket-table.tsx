"use client";


import { useState } from "react";

// Choose any three fields for filtering (dynamically from the first ticket)
const getFilterFields = (tickets: any[]) => {
  if (!tickets.length) return ["status", "category", "assignedTo"];
  // Pick the first three string fields that are not id or referenceNumber
  const sample = tickets[0];
  const exclude = ["id", "referenceNumber", "createdAt", "chatId", "customerId"];
  const stringFields = Object.keys(sample).filter(
    key => typeof sample[key] === "string" && !exclude.includes(key)
  );
  return stringFields.slice(0, 3).length === 3 ? stringFields.slice(0, 3) : ["status", "category", "assignedTo"];
};

export function TicketTable({ tickets, onReferenceClick }: { tickets: any[], onReferenceClick?: (ticket: any) => void }) {
  const filterFields = getFilterFields(tickets);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  function handleResetFilters() {
    setFilters({});
  }

  // Extract unique values for each filter field
  const filterOptions: { [key: string]: string[] } = {};
  filterFields.forEach(field => {
    filterOptions[field] = Array.from(new Set(tickets.map(t => t[field]).filter(Boolean)));
  });

  const filteredTickets = tickets.filter(ticket => {
    return filterFields.every(field => !filters[field] || ticket[field] === filters[field]);
  });

  return (
    <div className="w-full max-h-full flex-1 min-h-0 max-w-full bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {filterFields.map(field => (
          <select
            key={field}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
            value={filters[field] || ""}
            onChange={e => setFilters(f => ({ ...f, [field]: e.target.value }))}
          >
            <option value="">All {field.charAt(0).toUpperCase() + field.slice(1)}</option>
            {filterOptions[field].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
        <button
          type="button"
          className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 border border-gray-300 transition"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>
      <div className="max-w-full h-full">
        <div className="max-w-full rounded-xl border border-gray-200 shadow h-full min-h-0 flex flex-col overflow-x-auto">
          <table className=" max-h-full bg-white">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Reference</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">ID</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Chat ID</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Customer ID</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Category</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">SubCategory</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Description</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Additional Details</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Attachment URLs</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Desired Resolution</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Sentiment</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Urgency Level</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Assistant Notes</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Assigned To</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Is Draft</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Resolution Notes</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Resolved At</th>
                <th className="px-4 py-3 border-b text-left font-semibold whitespace-nowrap">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100" style={{ maxHeight: '420px', display: 'table-row-group' }}>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-8 text-gray-400">No tickets found.</td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[180px]">
                      <button
                        className="text-primary underline hover:text-primary/80 focus:outline-none"
                        onClick={e => { e.preventDefault(); onReferenceClick && onReferenceClick(ticket); }}
                        type="button"
                      >
                        {ticket.referenceNumber || ticket.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.id}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.chatId}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.customerId}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.category}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.subCategory}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[200px]">{ticket.description}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[200px]">{ticket.additionalDetails}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[200px]">{ticket.attachmentUrls}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[180px]">{ticket.desiredResolution}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.sentiment}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.urgencyLevel}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[200px]">{ticket.assistantNotes}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[140px]">{ticket.assignedTo}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[100px]">{String(ticket.isDraft)}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[120px]">{ticket.status}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[200px]">{ticket.resolutionNotes}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[180px]">{ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap align-top w-[180px]">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
