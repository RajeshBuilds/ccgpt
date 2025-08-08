'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import { fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { useArtifact, useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import type { Session } from 'next-auth';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
export function Chat({
  id,
  initialMessages,
  initialChatModel,
  isReadonly,
  session,
  autoResume,
  complaintId,
  updateCurrentComplaintDetails,
  updateComplaintSummary,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  complaintId: string;
  updateCurrentComplaintDetails?: (details: any) => void;
  updateComplaintSummary?: (summary: any) => void;
}) {
  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  const {artifact} = useArtifact();
  const artifactRef = useRef(artifact);
  useEffect(() => {
    artifactRef.current = artifact;
  }, [artifact]);

  const userType = session.user.type;
  const apiUrl = userType === 'customer' ? '/api/chat' : '/api/ws';

    // Server-side upload function
  const uploadFile = async (file: File): Promise<{ url: string; filename: string }> => {
    console.log('🚀 Starting server-side file upload for:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Sending file to server...');
    const response = await fetch('/api/s3/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Server response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Server upload failed:', error);
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('✅ Server-side upload completed:', result);

    return {
      url: result.url,
      filename: result.filename || file.name,
    };
  };

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: apiUrl,
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            complaintId,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onToolCall: async ({ toolCall }) => {
      const toolName = toolCall.toolName;
      if (!toolName) return;
      if (toolName === 'updateComplaintSummary') {
        if (updateComplaintSummary) {
          const summary = typeof toolCall.input === 'string' ? toolCall.input : toolCall.input;
          updateComplaintSummary(summary);
        }
        console.log('[onToolCall] updateComplaintSummary:', toolCall.input);
      } else if (toolName === 'updateCurrentComplaintDetails') {
        if (updateCurrentComplaintDetails) {
          updateCurrentComplaintDetails(toolCall.input);
        }
      } else if (toolName === `uploadComplaintSummaryToDatabase`) {
        if (!artifactRef.current.content || artifactRef.current.content.trim() === '') {
          return;
        }
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10 margin on each side
        const lines = doc.splitTextToSize(artifactRef.current.content, pageWidth);
        doc.text(lines, 10, 10);
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], 'complaint-summary.pdf', { type: 'application/pdf' });
        try{
            const result = await uploadFile(file)
            toast.success(`File uploaded successfully: ${result.filename}`);
        } catch (error) {
            toast.error(`File upload failed: ${error}`);
        }
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      }
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });
  return (
    <>
      <div className="flex flex-col min-w-0 h-full ">
        <Messages
          chatId={id}
          status={status}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          session={session}
        />

        <form className="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl shrink-0">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        isReadonly={isReadonly}
      />
    </>
  );
}
