"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Landmark } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarHeaderMenu({
  initialIsAvailable = true,
}: {
  initialIsAvailable?: boolean
}) {
  const [isAvailable, setIsAvailable] = React.useState(initialIsAvailable)
  
  const availabilityText = isAvailable ? "Available" : "Offline"

  const handleAvailabilityChange = (newAvailability: boolean) => {
    setIsAvailable(newAvailability)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Landmark className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Citibank CMS</span>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs">{availabilityText}</span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            <DropdownMenuItem
              onSelect={() => handleAvailabilityChange(true)}
            >
              Available
              {isAvailable && <Check className="ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleAvailabilityChange(false)}
            >
              Offline
              {!isAvailable && <Check className="ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
