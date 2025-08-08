import { redirect } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "lucide-react"
import { createWorkspace, getComplaintByReferenceNum, getMessagesByChatId, getWorkspaceByComplaintId, saveChat } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();

  if (!session) {
    redirect('/login/employee');
  }

  const complaint = await getComplaintByReferenceNum(id);
  let workspace = await getWorkspaceByComplaintId({ complaintId: complaint.id });

  if (!workspace) {
    const chatId = generateUUID();
    await saveChat({
      id: chatId,
      userId: session.user.id,
      userType: session.user.type,
      title: `Workspace for ${complaint.referenceNumber}`,
    });

    const workspaceId = generateUUID();
    await createWorkspace({
      id: workspaceId,
      chatId: chatId,
      employeeId: session.user.id,
      documentId: null,
      documentCreatedAt: null,
      complaintId: complaint.id,
    });
    workspace = await getWorkspaceByComplaintId({ complaintId: complaint.id });
  }

  const messagesFromDb = await getMessagesByChatId({
    id: workspace.chatId,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <SidebarInset className="flex flex-col h-screen">
      <header className="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Workspace</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className="flex-1 min-h-0">
        <Chat
          id={workspace.chatId}
          complaintId={complaint.id}
          initialMessages={uiMessages}
          initialChatModel={DEFAULT_CHAT_MODEL}
          isReadonly={false}
          session={session}
          autoResume={true}
        />
        <DataStreamHandler />
      </div>
    </SidebarInset>
  );
}
