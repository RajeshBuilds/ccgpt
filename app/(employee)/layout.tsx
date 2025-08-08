import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarEmployee } from "./_components/sidebar/sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { SessionProvider } from "next-auth/react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (    
    <SessionProvider>
      <DataStreamProvider>  
        <SidebarProvider>
          <SidebarEmployee />
          {children}
        </SidebarProvider>
      </DataStreamProvider>
    </SessionProvider>
  )
}