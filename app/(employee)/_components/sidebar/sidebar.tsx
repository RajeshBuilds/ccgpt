"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

import { NavUser } from "./nav-user"
import { SidebarHeaderMenu } from "./sidebar-header-menu"
import { CategoriesNav } from "./categories-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Home } from "lucide-react"
import { usePathname } from "next/navigation"

export function SidebarEmployee({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <Sidebar {...props}
    className="bg-gradient-to-b from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border-r border-zinc-200 dark:border-zinc-800 rounded-r-2xl shadow-xl min-h-screen flex flex-col"
    >
      <SidebarHeader>
        <SidebarHeaderMenu />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <SidebarGroupLabel>My Tickets</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Assigned Tickets">
                <Link href="/employee/assigned">
                  <span>Assigned</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="In Progress Tickets">
                <Link href="/employee/in-progress">
                  <span>In Progress</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Escalated Tickets">
                <Link href="/employee/escalated">
                  <span>Escalated</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Closed Tickets">
                <Link href="/employee/closed">
                  <span>Closed</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <CategoriesNav />
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter>
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
  )
}
