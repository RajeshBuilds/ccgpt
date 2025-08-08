"use client";


import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TicketTable } from "./ticket-table";
import { TicketDetailsDrawer } from "./ticket-details-drawer";





export function EmployeeTicketList() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      const res = await fetch(`/api/tickets?employeeId=${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.complaints || []);
      } else {
        setTickets([]);
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
            onAssign={() => {
              if (!selectedTicket) return;
              const updated = { ...selectedTicket, assignedTo: session?.user?.id };
              setSelectedTicket(updated);
              setTickets(ts => ts.map((t: any) => t.id === updated.id ? updated : t));
            }}
            isAssignedToUser={selectedTicket && selectedTicket.assignedTo === session?.user?.id}
            assigning={false}
            onSave={handleDrawerChange}
          />
        </>
      )}
    </div>
  );
}
