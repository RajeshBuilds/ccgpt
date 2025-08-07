"use client";

import EmployeeWorkspace from "../../_components/employee-workspace";
import { useSession } from "next-auth/react";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

export default function EmployeeResolutionAssistantPage() {
  const { data: session } = useSession();
  let chatId: string | null = null;
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    chatId = urlParams.get('chatId') || sessionStorage.getItem('employee_chat_id');
  }
  if (!session?.user) return null;
  return (
    <SidebarInset className="flex flex-col h-screen relative">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <EmployeeWorkspace
            chatId={chatId || generateUUID()}
            initialMessages={[]}
            initialChatModel={DEFAULT_CHAT_MODEL}
            isReadonly={false}
            session={session}
            autoResume={false}
            complaintId={chatId || generateUUID()}
          />
          <DataStreamHandler />
        </div>
      </div>
    </SidebarInset>
  );
}
