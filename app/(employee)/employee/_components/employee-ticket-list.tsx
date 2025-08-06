"use client";


import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TicketTable } from "@/components/ticket-table";
import { TicketDetailsDrawer } from "@/components/ticket-details-drawer";


export function EmployeeTicketList() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        const assigned = (data.complaints || []).filter((t: any) => t.assignedTo === session?.user?.id);
        if (assigned.length > 0) {
          setTickets(assigned);
        } else {
          setTickets([
            {
              id: "TCK-1001",
              referenceNumber: "REF-1001",
              subject: "Account Access",
              category: "Account",
              status: "Open",
              description: "Unable to login to online banking portal.",
              criticality: "High",
              assignedTo: session?.user?.id,
            },
            {
              id: "TCK-1002",
              referenceNumber: "REF-1002",
              subject: "Card Issue",
              category: "Card",
              status: "Open",
              description: "Credit card not working for online purchases.",
              criticality: "Medium",
              assignedTo: session?.user?.id,
            },
            {
              id: "TCK-1003",
              referenceNumber: "REF-1003",
              subject: "Loan Query",
              category: "Loan",
              status: "Closed",
              description: "Need information about loan prepayment.",
              criticality: "Low",
              assignedTo: session?.user?.id,
            },
          ]);
        }
      } else {
        setTickets([
          {
            id: "TCK-1001",
            referenceNumber: "REF-1001",
            subject: "Account Access",
            category: "Account",
            status: "Open",
            description: "Unable to login to online banking portal.",
            criticality: "High",
            assignedTo: session?.user?.id,
          },
          {
            id: "TCK-1002",
            referenceNumber: "REF-1002",
            subject: "Card Issue",
            category: "Card",
            status: "Open",
            description: "Credit card not working for online purchases.",
            criticality: "Medium",
            assignedTo: session?.user?.id,
          },
          {
            id: "TCK-1003",
            referenceNumber: "REF-1003",
            subject: "Loan Query",
            category: "Loan",
            status: "Closed",
            description: "Need information about loan prepayment.",
            criticality: "Low",
            assignedTo: session?.user?.id,
          },
        ]);
      }
      setLoading(false);
    }
    if (session?.user?.id) {
      fetchTickets();
    }
  }, [session?.user?.id]);

  const handleReferenceClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedTicket(null);
  };
  const handleDrawerChange = (ticket: any) => {
    setSelectedTicket(ticket);
    setTickets(ts => ts.map((t: any) => t.id === ticket.id ? ticket : t));
  };
  const handleDrawerStatusChange = (status: string) => {
    if (!selectedTicket) return;
    const updated = { ...selectedTicket, status };
    setSelectedTicket(updated);
    setTickets(ts => ts.map((t: any) => t.id === updated.id ? updated : t));
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="text-center py-8">Loading tickets...</div>
      ) : (
        <>
          <TicketTable tickets={tickets} onReferenceClick={handleReferenceClick} />
          <TicketDetailsDrawer
            ticket={selectedTicket}
            open={drawerOpen}
            onClose={handleDrawerClose}
            userId={session?.user?.id}
            onChange={handleDrawerChange}
            onStatusChange={handleDrawerStatusChange}
            onAssign={() => {}}
            isAssignedToUser={true}
            assigning={false}
          />
        </>
      )}
    </div>
  );
}
