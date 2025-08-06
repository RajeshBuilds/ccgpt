"use client";

import { EmployeeTicketList } from "../_components/employee-ticket-list";
// import { TicketTable } from "../_components/ticket-table";
// import { useEffect, useState } from "react";
import Header from "@/components/shared/header";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function EmployeeDashboardPage() {
  const searchParams = useSearchParams();
  const showTickets = searchParams.get("view") === "tickets";


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
            {/* TicketTable removed as requested */}
          </>
        )}
      </main>
    </div>
  );
}
