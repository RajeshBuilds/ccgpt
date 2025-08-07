"use client";

import { auth } from "@/app/(auth)/auth";
import { EmployeeTicketList } from "../_components/employee-ticket-list";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import React from "react";
import { useSession } from "next-auth/react";

export default function EmployeeDashboardPage() {
  const searchParams = useSearchParams();
  const showTickets = searchParams.get("view") === "tickets";
  const [chatId, setChatId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setChatId(sessionStorage.getItem('employee_chat_id'));
    }
  }, []);

  return (
    <div className="flex min-h-svh w-full">
      <main className="flex flex-col items-center justify-center w-full">
        {showTickets ? (
          <>
            <h1 className="text-2xl font-bold mb-10 mt-8 text-center">My Assigned Tickets</h1>
            <div className="flex w-full justify-center flex-1 min-h-0">
              <div className="max-w-5xl w-full flex-1 min-h-0 p-4">
                <EmployeeTicketList />
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8 mt-4 text-center">Welcome to Citi Wealth Support Portal</h1>
            <p className="text-lg text-muted-foreground mb-8 text-center">Welcome !!</p>
            <div className="flex justify-center mt-8">
              <a
                href={chatId ? `/employee/workspace/${chatId}` : '#'}
                className="inline-block px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-zinc-800 transition-colors font-medium text-base"
              >
                Open Resolution Assistant
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
