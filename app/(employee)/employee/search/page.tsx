'use client';

import { useSession } from "next-auth/react";
import { TicketSearch } from "../_components/ticket-search";


export default function EmployeeSearchPage() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return (
    <div className="flex min-h-svh w-full p-6 md:p-10">
      <div className="w-full mx-auto flex flex-col items-start justify-start">
        <TicketSearch userId={String(session.user.id)} />
      </div>
    </div>
  );
}
