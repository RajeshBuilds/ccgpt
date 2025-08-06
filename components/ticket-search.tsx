"use client";
import React, { useState } from "react";
import { TicketTable } from "@/components/ticket-table";
import { TicketDetailsDrawer } from "./ticket-details-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from 'sonner';

// ...existing code...
export function TicketSearch({ userId }: { userId: string }) {
  // Hardcoded tickets
  const initialTickets = [
    {
      id: "TCK-1001",
      referenceNumber: "REF-1001",
      subject: "Account Access",
      category: "Account",
      status: "Open",
      description: "Unable to login to online banking portal.",
      criticality: "High",
    },
    {
      id: "TCK-1002",
      referenceNumber: "REF-1002",
      subject: "Card Issue",
      category: "Card",
      status: "Open",
      description: "Credit card not working for online purchases.",
      criticality: "Medium",
    },
    {
      id: "TCK-1003",
      referenceNumber: "REF-1003",
      subject: "Loan Query",
      category: "Loan",
      status: "Closed",
      description: "Need information about loan prepayment.",
      criticality: "Low",
    },
    {
      id: "TCK-1004",
      referenceNumber: "REF-1004",
      subject: "Cheque Book Request",
      category: "Account",
      status: "In Progress",
      description: "Requested new cheque book, not received yet.",
      criticality: "Medium",
    },
    {
      id: "TCK-1005",
      referenceNumber: "REF-1005",
      subject: "ATM Issue",
      category: "ATM",
      status: "Open",
      description: "ATM did not dispense cash but amount debited.",
      criticality: "High",
    },
    {
      id: "TCK-1006",
      referenceNumber: "REF-1006",
      subject: "Mobile App Bug",
      category: "App",
      status: "Closed",
      description: "App crashes on login screen.",
      criticality: "Low",
    },
    {
      id: "TCK-1007",
      referenceNumber: "REF-1007",
      subject: "Statement Request",
      category: "Account",
      status: "In Progress",
      description: "Need bank statement for last 6 months.",
      criticality: "Low",
    },
    {
      id: "TCK-1008",
      referenceNumber: "REF-1008",
      subject: "Netbanking Password Reset",
      category: "Account",
      status: "Open",
      description: "Forgot netbanking password, need reset.",
      criticality: "Medium",
    },
    {
      id: "TCK-1009",
      referenceNumber: "REF-1009",
      subject: "FD Closure",
      category: "Deposit",
      status: "Closed",
      description: "Want to close fixed deposit prematurely.",
      criticality: "Medium",
    },
    {
      id: "TCK-1010",
      referenceNumber: "REF-1010",
      subject: "Address Update",
      category: "Account",
      status: "In Progress",
      description: "Requested address update, not reflected yet.",
      criticality: "Low",
    },
  ];

  const [ticketId, setTicketId] = useState("");
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [filteredTickets, setFilteredTickets] = useState<any[]>(initialTickets);
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
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-xl relative">
        <div className="relative flex-1">
          <Input
            placeholder="Search by Ticket ID, Reference, Subject, or Category"
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            className="pr-8"
          />
          {ticketId && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
              tabIndex={-1}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      {loading ? (
        <div className="text-center py-8">Loading tickets...</div>
      ) : (
        <>
          <TicketTable tickets={filteredTickets} onReferenceClick={handleDrawerOpen} />
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
          />
        </>
      )}
      {/* Success toast handled via toast() */}
    </div>
  );
}


  
