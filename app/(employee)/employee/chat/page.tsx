"use client";

import { Chat } from "@/components/chat";
import { useSession } from "next-auth/react";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import React from "react";

export default function EmployeeResolutionAssistantPage() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return (
    <SidebarInset className="flex flex-col h-screen relative">
      <header className="absolute top-0 left-0 right-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
        <h1 className="text-xl font-bold">Complaint resolution assistant</h1>
      </header>
      <div className="flex-1 overflow-hidden pt-16">
        <div className="h-full flex flex-col">
          <Chat
            id={`resolution-assistant-${session.user.id}`}
            initialMessages={[]}
            initialChatModel={"default"}
            isReadonly={false}
            session={session}
            autoResume={false}
            complaintId={""}
          />
          <DataStreamHandler />
        </div>
      </div>
    </SidebarInset>
  );
}
