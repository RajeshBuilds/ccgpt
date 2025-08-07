'use client';

import { useSession } from "next-auth/react";
import { TicketSearch } from "../_components/ticket-search";


export default function EmployeeSearchPage() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return (
    <div className="flex min-h-svh w-full">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-start justify-start mt-8">
        <h1 className="text-2xl font-bold mb-6">Ticket search</h1>
        <TicketSearch userId={String(session.user.id)} />
      </div>
    </div>
  );
}
