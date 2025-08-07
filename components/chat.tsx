'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import type { Session } from 'next-auth';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { toast } from 'sonner';
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
  const isEmployeeLogin = session.user.type === 'employee';

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
      api: isEmployeeLogin? '/api/resolverchat' : '/api/chat',
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
    onToolCall: ({ toolCall }) => {
      const toolName = toolCall.toolName;
      if (!toolName) return;
      if (toolName === 'updateComplaintSummary') {
        if (updateComplaintSummary) {
          // toolCall.input may be a string or object with summary
          const summary = typeof toolCall.input === 'string' ? toolCall.input : toolCall.input;
          updateComplaintSummary(summary);
        }
        console.log('[onToolCall] updateComplaintSummary:', toolCall.input);
      } else if (toolName === 'updateCurrentComplaintDetails') {
        if (updateCurrentComplaintDetails) {
          updateCurrentComplaintDetails(toolCall.input);
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
