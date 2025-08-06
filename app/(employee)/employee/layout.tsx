"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { SidebarEmployee } from "./_components/sidebar";
import React from "react";
import { Chat } from "@/components/chat";
import { useSession } from "next-auth/react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [showAssistant, setShowAssistant] = React.useState(false);
  const { data: session } = useSession();
  return (
    <DataStreamProvider>
      <SidebarProvider>
        <div className="flex h-screen relative w-full">
          <SidebarEmployee />
          <main className="flex-1 overflow-auto">{children}</main>
          {/* Floating Assistant Button */}
          <button
            className="fixed z-50 bottom-6 right-6 bg-primary text-white rounded-full shadow-lg p-4 flex items-center hover:bg-primary/90 transition"
            onClick={() => setShowAssistant((v) => !v)}
            aria-pressed={showAssistant}
          >
            <span className="sr-only">Toggle Assistant</span>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 17v-1a4 4 0 0 0-3-3.87M9 17v-1a4 4 0 0 1 3-3.87m0 0V9a4 4 0 1 0-4 4h1m3-4a4 4 0 1 1 4 4h-1"/></svg>
          </button>
          {/* Chat Panel (not overlay, fixed to bottom right) */}
          {showAssistant && session?.user && (
            <div className="fixed bottom-24 right-6 w-[400px] max-w-lg h-[600px] border rounded-lg bg-background shadow-xl flex flex-col z-50">
              <Chat
                id={`assistant-${session.user.id}`}
                initialMessages={[]}
                initialChatModel={"default"}
                isReadonly={false}
                session={session}
                autoResume={false}
                complaintId={""}
              />
            </div>
          )}
        </div>
      </SidebarProvider>
    </DataStreamProvider>
  );
}