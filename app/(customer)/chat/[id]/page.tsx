import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { createDraftComplaint, getChatById, getMessagesByChatId, saveChat } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  let complaintId = generateUUID();
  
  console.log('Attempting to load chat with ID:', id);
  
  const session = await auth();

  if (!session) {
    redirect('/login/customer');
  }
  
  let chat = await getChatById({ id });
  console.log('Chat found:', chat);

  if (!chat) {
    console.log('Chat not found, creating new chat');
    // Create a new chat if it doesn't exist
    await saveChat({
      id,
      userId: session.user.id,
      userType: session.user.type,
      title: 'New Chat',
    });
    chat = await getChatById({ id });
  }

  await createDraftComplaint({
    id: complaintId,
    customerId: session.user.id,
    chatId: chat.id,
  });

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <SidebarInset className="flex flex-col h-screen relative">
      <header className="absolute top-0 left-0 right-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Complaint Registration Assistant</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header> 
      <div className="flex-1 overflow-hidden pt-16">
        <div className="h-full flex flex-col">
          <Chat
            id={chat.id}
            complaintId={complaintId}
            initialMessages={uiMessages}
            initialChatModel={DEFAULT_CHAT_MODEL}
            isReadonly={false}
            session={session}
            autoResume={true}
          />
          <DataStreamHandler />
        </div>
      </div>
    </SidebarInset>
  );
}
