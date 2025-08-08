"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  BotMessageSquare,
  Landmark,
  Plus,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { ChatHistory } from "./chat-history"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { generateUUID } from "@/lib/utils"

const data = {
  complaints: [
    
  ],
}

export function SidebarCustomer({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleNewComplaint = () => {
    const newChatId = generateUUID()
    router.push(`/chat/${newChatId}`)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Landmark className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Citibank</span>
                  <span className="truncate text-xs">Customer Support</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ChatHistory customerId={session?.user?.id || 0} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <Button variant="default" size="sm" className="w-full" onClick={handleNewComplaint}>
            New Complaint
          </Button>
        </div>
        <Separator />
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
