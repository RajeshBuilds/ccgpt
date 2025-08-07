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
    <Sidebar {...sidebarProps}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/employee/dashboard">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Landmark className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Citi Welath</span>
                <span className="truncate text-xs">Customer Support</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Search">
                <Link href="/employee/search">
                  <Search className="mr-2 size-4" /> Search
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="My Open Tickets">
                <Link href="/employee/dashboard?view=tickets">
                  <ListChecks className="mr-2 size-4" /> Assigned to me
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Resolution assistant">
                <Link href={chatId ? `/employee/workspace/${chatId}` : "/employee/workspace/"}>
                  <MessageCircle className="mr-2 size-4" /> Resolution assistant
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
