"use client";

import * as React from "react";
import Link from "next/link";
// Removed Sheet and Chat imports, not needed here
import { useSession } from "next-auth/react";
import { Settings2, ListChecks, Bot, Search, Landmark, MessageCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavUser } from "@/app/(customer)/_components/sidebar/nav-user";

export function SidebarEmployee(props: React.ComponentProps<typeof Sidebar> & { onToggleAssistant?: () => void; assistantOpen?: boolean }) {
  const { data: session } = useSession();
  const [chatId, setChatId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setChatId(sessionStorage.getItem('employee_chat_id'));
    }
  }, []);
  const { onToggleAssistant, assistantOpen, ...sidebarProps } = props;

  return (
    <Sidebar
      {...sidebarProps}
      className="bg-gradient-to-b from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-r border-zinc-200 dark:border-zinc-800 rounded-r-2xl shadow-xl min-h-screen flex flex-col"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/employee/dashboard">
                <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex aspect-square size-10 items-center justify-center rounded-xl shadow-md">
                  <Landmark className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-base leading-tight ml-2">
                  <span className="truncate font-bold tracking-tight">Citi Wealth</span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">Customer Support</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 dark:text-zinc-400 font-semibold tracking-wide uppercase text-xs mb-2 mt-2">Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Search" className="transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800/60 rounded-lg">
                <Link href="/employee/search" className="flex items-center px-2 py-2">
                  <Search className="mr-3 size-5 text-zinc-500 dark:text-zinc-400" /> <span className="font-medium">Search</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="My Open Tickets" className="transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800/60 rounded-lg">
                <Link href="/employee/dashboard?view=tickets" className="flex items-center px-2 py-2">
                  <ListChecks className="mr-3 size-5 text-zinc-500 dark:text-zinc-400" /> <span className="font-medium">Assigned to me</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Resolution assistant" className="transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800/60 rounded-lg">
                <Link href={chatId ? `/employee/workspace/${chatId}` : "/employee/workspace/"} className="flex items-center px-2 py-2">
                  <MessageCircle className="mr-3 size-5 text-zinc-500 dark:text-zinc-400" /> <span className="font-medium">Resolution assistant</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        {session?.user && (
          <NavUser
            user={{
              id: session.user.id,
              name: session.user.name || "Unknown User",
              avatar: "/avatars/default.jpg"
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
