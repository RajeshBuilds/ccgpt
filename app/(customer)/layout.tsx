import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarCustomer } from "./_components/sidebar/sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (    
    <DataStreamProvider>  
      <SidebarProvider>
        <SidebarCustomer />
        {children}
      </SidebarProvider>
    </DataStreamProvider>
  )
}