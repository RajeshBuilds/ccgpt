"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

export function TicketTable({ tickets, onReferenceClick }: { tickets: any[], onReferenceClick?: (ticket: any) => void }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("");

  function handleResetFilters() {
    setStatusFilter("");
    setCategoryFilter("");
    setCriticalityFilter("");
  }

  // Extract unique values for filters
  const statusOptions = Array.from(new Set(tickets.map(t => t.status).filter(Boolean)));
  const categoryOptions = Array.from(new Set(tickets.map(t => t.category).filter(Boolean)));
  const criticalityOptions = Array.from(new Set(tickets.map(t => t.criticality).filter(Boolean)));

  const filteredTickets = tickets.filter(ticket => {
    return (
      (!statusFilter || ticket.status === statusFilter) &&
      (!categoryFilter || ticket.category === categoryFilter) &&
      (!criticalityFilter || ticket.criticality === criticalityFilter)
    );
  });

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-4 items-center">
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoryOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={criticalityFilter}
          onChange={e => setCriticalityFilter(e.target.value)}
        >
          <option value="">All Criticality</option>
          {criticalityOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
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
              <th className="px-4 py-2 border-b text-left">Category</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Criticality</th>
              <th className="px-4 py-2 border-b text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No tickets found.</td>
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
                  <td className="px-4 py-2 border-b">{ticket.category}</td>
                  <td className="px-4 py-2 border-b">{ticket.status}</td>
                  <td className="px-4 py-2 border-b">{ticket.criticality || '-'} </td>
                  <td className="px-4 py-2 border-b">{ticket.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
