"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from 'sonner';
import { TicketTable } from "./ticket-table";
import { TicketDetailsDrawer } from "./ticket-details-drawer";


// ...existing code...
export function TicketSearch({ userId }: { userId: string }) {
  const [ticketId, setTicketId] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  // Fetch tickets from DB on mount
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tickets');
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();
        // Unwrap the complaints array from the API response
        const ticketsArray = Array.isArray(data.complaints) ? data.complaints : [];
        setTickets(ticketsArray);
        setFilteredTickets(ticketsArray);
      } catch (err) {
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignSuccess(false);
    if (!ticketId) {
      setFilteredTickets(tickets);
      return;
    }
    const filtered = tickets.filter(
      (t: any) =>
        t.id?.toLowerCase().includes(ticketId.toLowerCase()) ||
        t.referenceNumber?.toLowerCase().includes(ticketId.toLowerCase()) ||
        t.subject?.toLowerCase().includes(ticketId.toLowerCase()) ||
        t.category?.toLowerCase().includes(ticketId.toLowerCase())
    );
    setFilteredTickets(filtered);
  };

  const handleClearSearch = () => {
    setTicketId("");
    setFilteredTickets(tickets);
    setAssignSuccess(false);
  };

  // Assignment logic for drawer
  const assignTicketToMe = async (ticketId: string) => {
    // Replace with actual API call
    return { success: true };
  };

  const handleAssign = async () => {
    if (!selectedTicket) return;
    setAssigning(true);
    const res = await assignTicketToMe(selectedTicket.id);
    setAssigning(false);
    if (res.success) {
      setAssignSuccess(true);
      setSelectedTicket({ ...selectedTicket, assignedTo: String(userId) });
      setTickets(ts => ts.map((t: any) => t.id === selectedTicket.id ? { ...t, assignedTo: String(userId) } : t));
      setFilteredTickets(ts => ts.map((t: any) => t.id === selectedTicket.id ? { ...t, assignedTo: String(userId) } : t));
      toast.success("Ticket assigned successfully");
    }
  };

  const handleDrawerOpen = (ticket: any) => {
    setSelectedTicket(ticket);
    setDrawerOpen(true);
    setAssignSuccess(false);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedTicket(null);
  };
  const handleDrawerChange = (ticket: any) => {
    setSelectedTicket(ticket);
    setTickets(ts => ts.map((t: any) => t.id === ticket.id ? ticket : t));
    setFilteredTickets(ts => ts.map((t: any) => t.id === ticket.id ? ticket : t));
  };
  const handleDrawerStatusChange = (status: string) => {
    if (!selectedTicket) return;
    const updated = { ...selectedTicket, status };
    setSelectedTicket(updated);
    setTickets(ts => ts.map((t: any) => t.id === updated.id ? updated : t));
    setFilteredTickets(ts => ts.map((t: any) => t.id === updated.id ? updated : t));
  };

  return (
    <div className="w-full">
      <div className="w-full mb-8">
        <div className="flex flex-col w-full items-start gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Ticket Search</h2>
          <form onSubmit={handleSearch} className="flex w-full gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search by Ticket ID, Reference, Subject, or Category"
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
                className="pr-10 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
              {ticketId && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-base font-semibold bg-primary text-white hover:bg-primary/90 transition"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading tickets...</div>
      ) : (
        <>
          <div className="w-full max-h-full">
            <TicketTable tickets={filteredTickets} onReferenceClick={handleDrawerOpen} />
          </div>
          <TicketDetailsDrawer
            ticket={selectedTicket}
            open={drawerOpen}
            onClose={handleDrawerClose}
            onAssign={handleAssign}
            isAssignedToUser={selectedTicket && selectedTicket.assignedTo === String(userId)}
            assigning={assigning}
            userId={userId}
            onChange={handleDrawerChange}
            onStatusChange={handleDrawerStatusChange}
            onSave={handleDrawerChange}
          />
        </>
      )}
      {/* Success toast handled via toast() */}
    </div>
  );
}
