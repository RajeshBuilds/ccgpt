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
    <div className="w-full">
      <div className="flex gap-4 mb-4 items-center">
        {filterFields.map(field => (
          <select
            key={field}
            className="border rounded px-2 py-1"
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
          className="ml-2 px-3 py-1 border rounded text-sm bg-gray-50 hover:bg-gray-100"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Reference</th>
              <th className="px-4 py-2 border-b text-left">ID</th>
              <th className="px-4 py-2 border-b text-left">Chat ID</th>
              <th className="px-4 py-2 border-b text-left">Customer ID</th>
              <th className="px-4 py-2 border-b text-left">Category</th>
              <th className="px-4 py-2 border-b text-left">SubCategory</th>
              <th className="px-4 py-2 border-b text-left">Description</th>
              <th className="px-4 py-2 border-b text-left">Additional Details</th>
              <th className="px-4 py-2 border-b text-left">Attachment URLs</th>
              <th className="px-4 py-2 border-b text-left">Desired Resolution</th>
              <th className="px-4 py-2 border-b text-left">Sentiment</th>
              <th className="px-4 py-2 border-b text-left">Urgency Level</th>
              <th className="px-4 py-2 border-b text-left">Assistant Notes</th>
              <th className="px-4 py-2 border-b text-left">Assigned To</th>
              <th className="px-4 py-2 border-b text-left">Is Draft</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Resolution Notes</th>
              <th className="px-4 py-2 border-b text-left">Resolved At</th>
              <th className="px-4 py-2 border-b text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={19} className="text-center py-4 text-gray-500">No tickets found.</td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border-b">
                    <button
                      className="text-primary underline hover:text-primary/80 focus:outline-none"
                      onClick={e => { e.preventDefault(); onReferenceClick && onReferenceClick(ticket); }}
                      type="button"
                    >
                      {ticket.referenceNumber || ticket.id}
                    </button>
                  </td>
                  <td className="px-4 py-2 border-b">{ticket.id}</td>
                  <td className="px-4 py-2 border-b">{ticket.chatId}</td>
                  <td className="px-4 py-2 border-b">{ticket.customerId}</td>
                  <td className="px-4 py-2 border-b">{ticket.category}</td>
                  <td className="px-4 py-2 border-b">{ticket.subCategory}</td>
                  <td className="px-4 py-2 border-b">{ticket.description}</td>
                  <td className="px-4 py-2 border-b">{ticket.additionalDetails}</td>
                  <td className="px-4 py-2 border-b">{ticket.attachmentUrls}</td>
                  <td className="px-4 py-2 border-b">{ticket.desiredResolution}</td>
                  <td className="px-4 py-2 border-b">{ticket.sentiment}</td>
                  <td className="px-4 py-2 border-b">{ticket.urgencyLevel}</td>
                  <td className="px-4 py-2 border-b">{ticket.assistantNotes}</td>
                  <td className="px-4 py-2 border-b">{ticket.assignedTo}</td>
                  <td className="px-4 py-2 border-b">{String(ticket.isDraft)}</td>
                  <td className="px-4 py-2 border-b">{ticket.status}</td>
                  <td className="px-4 py-2 border-b">{ticket.resolutionNotes}</td>
                  <td className="px-4 py-2 border-b">{ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2 border-b">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
