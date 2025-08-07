"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { SidebarEmployee } from "./_components/sidebar";
import React from "react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataStreamProvider>
      <SidebarProvider>
        <div className="flex h-screen relative w-full">
          <SidebarEmployee />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    </DataStreamProvider>
  );
}