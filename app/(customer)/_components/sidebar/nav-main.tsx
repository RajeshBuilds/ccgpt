"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  complaints,
}: {
  complaints: {
    id: string
    title: string
    status?: string
    createdAt?: string
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>My Complaints</SidebarGroupLabel>
      <SidebarMenu>
        {complaints.length === 0 ? (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            You haven't submitted any complaints yet.
          </div>
        ) : (
          complaints.map((complaint) => (
            <SidebarMenuItem key={complaint.id}>
              <SidebarMenuButton asChild tooltip={complaint.title} className="py-3">
                <a href={`/complaint/${complaint.id}`}>
                  <span className="truncate">{complaint.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
