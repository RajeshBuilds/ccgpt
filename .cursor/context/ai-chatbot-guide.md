# AI Chatbot Implementation Guide

This guide provides a comprehensive step-by-step approach to implementing the chat feature from this AI chatbot project into another project.

## Overview

The chat system consists of:
- **Frontend**: React components for chat UI and real-time messaging
- **Backend**: Next.js API routes for chat handling and AI integration
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **AI Integration**: Vercel AI SDK with streaming capabilities
- **Authentication**: NextAuth.js for user management
- **Real-time Features**: Server-sent events (SSE) for streaming responses

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ and npm/pnpm/yarn
- PostgreSQL database
- AI provider API key (XAI/OpenAI/Anthropic)
- Basic knowledge of Next.js, React, and TypeScript

## Step 1: Project Setup and Dependencies

### 1.1 Install Core Dependencies

```bash
npm install ai @ai-sdk/react @ai-sdk/xai
npm install next-auth bcrypt-ts
npm install drizzle-orm @vercel/postgres postgres
npm install zod
npm install swr
npm install sonner
npm install usehooks-ts
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install framer-motion
npm install resumable-stream
npm install @vercel/functions
npm install date-fns
```

### 1.2 Install Development Dependencies

```bash
npm install -D drizzle-kit
npm install -D @types/node
npm install -D typescript
```

### 1.3 Environment Variables

Create a `.env.local` file:

```bash
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/chatbot_db"

# AI Provider (XAI example)
XAI_API_KEY="your_xai_api_key_here"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Redis (optional, for resumable streams)
REDIS_URL="your_redis_url_here"
```

## Step 2: Database Schema Setup

### 2.1 Create Database Schema

Create `lib/db/schema.ts`:

```typescript
import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;
```

### 2.2 Database Configuration

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
```

### 2.3 Database Utilities

Create `lib/db/utils.ts`:

```typescript
import { createHash } from 'crypto';

export function generateHashedPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}
```

### 2.4 Database Migration

Create `lib/db/migrate.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const client = postgres(process.env.POSTGRES_URL!, { max: 1 });
const db = drizzle(client);

async function main() {
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  await client.end();
}

main().catch(console.error);
```

## Step 3: Authentication Setup

### 3.1 NextAuth Configuration

Create `app/(auth)/auth.config.ts`:

```typescript
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/chat');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnChat || isOnRegister || isOnLogin) {
        return true;
      }

      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

### 3.2 Auth Implementation

Create `app/(auth)/auth.ts`:

```typescript
import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser, getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;

        const [user] = users;
        if (!user.password) return null;

        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;

        return { ...user, type: 'regular' };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      return session;
    },
  },
});
```

## Step 4: Database Queries

### 4.1 Core Database Operations

Create `lib/db/queries.ts`:

```typescript
import 'server-only';
import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user, chat, message, stream, type User, type Chat, type DBMessage } from './schema';
import { generateHashedPassword } from './utils';
import { generateUUID } from '../utils';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  return await db.select().from(user).where(eq(user.email, email));
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);
  return await db.insert(user).values({ email, password: hashedPassword });
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());
  
  return await db.insert(user).values({ email, password }).returning({
    id: user.id,
    email: user.email,
  });
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: 'public' | 'private';
}) {
  return await db.insert(chat).values({
    id,
    createdAt: new Date(),
    userId,
    title,
    visibility,
  });
}

export async function getChatById({ id }: { id: string }): Promise<Chat> {
  const [chat] = await db.select().from(chat).where(eq(chat.id, id));
  return chat;
}

export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id: string;
    chatId: string;
    role: string;
    parts: any;
    attachments: any[];
    createdAt: Date;
  }>;
}) {
  return await db.insert(message).values(messages);
}

export async function getMessagesByChatId({
  id,
}: {
  id: string;
}): Promise<Array<DBMessage>> {
  return await db
    .select()
    .from(message)
    .where(eq(message.chatId, id))
    .orderBy(asc(message.createdAt));
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  return await db.insert(stream).values({
    id: streamId,
    chatId,
    createdAt: new Date(),
  });
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  const timeLimit = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);
  
  const result = await db
    .select({ count: count() })
    .from(message)
    .join(chat, eq(message.chatId, chat.id))
    .where(
      and(
        eq(chat.userId, id),
        gte(message.createdAt, timeLimit)
      )
    );
    
  return result[0]?.count || 0;
}
```

## Step 5: AI Integration Setup

### 5.1 AI Provider Configuration

Create `lib/ai/providers.ts`:

```typescript
import { customProvider } from 'ai';
import { xai } from '@ai-sdk/xai';

export const myProvider = customProvider({
  languageModels: {
    'chat-model': xai('grok-2-vision-1212'),
    'chat-model-reasoning': xai('grok-2-1212'),
    'title-model': xai('grok-2-1212'),
  },
});
```

### 5.2 AI Models Configuration

Create `lib/ai/models.ts`:

```typescript
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model', 
    description: 'Uses advanced reasoning',
  },
];
```

### 5.3 System Prompts

Create `lib/ai/prompts.ts`:

```typescript
export interface RequestHints {
  longitude?: number;
  latitude?: number;
  city?: string;
  country?: string;
}

export function systemPrompt({
  selectedChatModel,
  requestHints,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
}): string {
  const location = requestHints.city && requestHints.country 
    ? `The user is located in ${requestHints.city}, ${requestHints.country}.`
    : '';

  return `You are a helpful AI assistant. ${location} 
  
  You have access to tools that can help you provide better responses:
  - Weather information
  - Document creation and editing
  - Suggestions for improvement
  
  Always be helpful, accurate, and concise in your responses.`;
}
```

## Step 6: Type Definitions

### 6.1 Core Types

Create `lib/types.ts`:

```typescript
import { z } from 'zod';
import type { UIMessage } from 'ai';

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type ChatMessage = UIMessage<MessageMetadata>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
```

### 6.2 API Schema

Create `app/(chat)/api/chat/schema.ts`:

```typescript
import { z } from 'zod';

const textPartSchema = z.object({
  type: z.enum(['text']),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(['file']),
  mediaType: z.enum(['image/jpeg', 'image/png']),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(['user']),
    parts: z.array(partSchema),
  }),
  selectedChatModel: z.enum(['chat-model', 'chat-model-reasoning']),
  selectedVisibilityType: z.enum(['public', 'private']),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
```

## Step 7: Utility Functions

### 7.1 Core Utilities

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DBMessage } from '@/lib/db/schema';
import type { ChatMessage } from './types';
import { formatISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

export function convertToUIMessages(
  messages: Array<DBMessage>
): Array<ChatMessage> {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant',
    parts: message.parts,
    experimental_metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function convertToModelMessages(messages: Array<ChatMessage>) {
  return messages.map((message) => ({
    role: message.role,
    content: message.parts?.map(part => 
      part.type === 'text' ? part.text : ''
    ).join('') || '',
  }));
}
```

### 7.2 Error Handling

Create `lib/errors.ts`:

```typescript
export type ErrorCode = 
  | 'unauthorized:chat'
  | 'forbidden:chat'
  | 'rate_limit:chat'
  | 'bad_request:api'
  | 'not_found:chat'
  | 'offline:chat';

export class ChatSDKError extends Error {
  public readonly code: ErrorCode;
  public readonly cause?: string;

  constructor(code: ErrorCode, cause?: string) {
    super(cause || code);
    this.code = code;
    this.cause = cause;
  }

  toResponse() {
    return new Response(
      JSON.stringify({
        code: this.code,
        cause: this.cause,
      }),
      {
        status: this.getStatusCode(),
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private getStatusCode(): number {
    switch (this.code) {
      case 'unauthorized:chat':
        return 401;
      case 'forbidden:chat':
        return 403;
      case 'rate_limit:chat':
        return 429;
      case 'bad_request:api':
        return 400;
      case 'not_found:chat':
        return 404;
      default:
        return 500;
    }
  }
}
```

## Step 8: API Routes

### 8.1 Main Chat API

Create `app/(chat)/api/chat/route.ts`:

```typescript
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { myProvider } from '@/lib/ai/providers';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType } = requestBody;

    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = message.parts?.find(part => part.type === 'text')?.text?.slice(0, 50) || 'New Chat';
      
      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ 
            selectedChatModel, 
            requestHints: { longitude, latitude, city, country }
          }),
          messages: convertToModelMessages(uiMessages),
        });

        result.consumeStream();
        dataStream.merge(result.toUIMessageStream());
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### 8.2 Auth API Routes

Create `app/(auth)/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '../../auth';

export const { GET, POST } = handlers;
```

## Step 9: React Components

### 9.1 Main Chat Component

Create `components/chat.tsx`:

```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { ChatHeader } from './chat-header';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import type { Session } from 'next-auth';
import type { ChatMessage, Attachment } from '@/lib/types';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  isReadonly,
  session,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  isReadonly: boolean;
  session: Session;
}) {
  const [input, setInput] = useState<string>('');
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    generateId: generateUUID,
    body: {
      selectedChatModel: initialChatModel,
      selectedVisibilityType: 'private',
    },
    fetch: fetchWithErrorHandlers,
  });

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader
        chatId={id}
        selectedModelId={initialChatModel}
        isReadonly={isReadonly}
        session={session}
      />

      <Messages
        chatId={id}
        status={status}
        messages={messages}
        setMessages={setMessages}
        isReadonly={isReadonly}
      />

      {!isReadonly && (
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
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
        </form>
      )}
    </div>
  );
}
```

### 9.2 Input Component

Create `components/multimodal-input.tsx`:

```typescript
'use client';

import { useState, useRef, type Dispatch, type SetStateAction } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ArrowUpIcon, StopIcon } from './icons';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage, Attachment } from '@/lib/types';

export function MultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<ChatMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (input.trim()) {
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: input }],
      });
      setInput('');
    }
  };

  return (
    <div className="relative w-full flex flex-col">
      <Textarea
        ref={textareaRef}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[60px] w-full resize-none rounded-xl border border-muted bg-background pr-12 focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      
      {status === 'streaming' ? (
        <Button
          onClick={stop}
          size="icon"
          variant="outline"
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          <StopIcon />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          size="icon"
          disabled={!input.trim()}
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          <ArrowUpIcon />
        </Button>
      )}
    </div>
  );
}
```

### 9.3 Messages Component

Create `components/messages.tsx`:

```typescript
'use client';

import { memo } from 'react';
import { Message } from './message';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<ChatMessage>['status'];
  messages: Array<ChatMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  isReadonly: boolean;
}

export const Messages = memo(function Messages({
  chatId,
  status,
  messages,
  setMessages,
  isReadonly,
}: MessagesProps) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {messages.map((message) => (
        <Message
          key={message.id}
          chatId={chatId}
          message={message}
          isReadonly={isReadonly}
        />
      ))}
      
      {status === 'streaming' && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-pulse">AI is thinking...</div>
        </div>
      )}
    </div>
  );
});
```

### 9.4 Individual Message Component

Create `components/message.tsx`:

```typescript
'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';

interface MessageProps {
  chatId: string;
  message: ChatMessage;
  isReadonly: boolean;
}

export const Message = memo(function Message({
  chatId,
  message,
  isReadonly,
}: MessageProps) {
  return (
    <div
      className={cn(
        'flex w-full gap-4 p-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {message.parts?.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={index} className="whitespace-pre-wrap">
                {part.text}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
});
```

## Step 10: Page Components

### 10.1 Main Chat Page

Create `app/(chat)/page.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const id = generateUUID();

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      initialChatModel={DEFAULT_CHAT_MODEL}
      isReadonly={false}
      session={session}
    />
  );
}
```

### 10.2 Individual Chat Page

Create `app/(chat)/chat/[id]/page.tsx`:

```typescript
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const chat = await getChatById({ id });
  if (!chat) {
    notFound();
  }

  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  if (chat.visibility === 'private' && session.user.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <Chat
      id={chat.id}
      initialMessages={uiMessages}
      initialChatModel={DEFAULT_CHAT_MODEL}
      isReadonly={session?.user?.id !== chat.userId}
      session={session}
    />
  );
}
```

## Step 11: Basic UI Components

You'll need to implement basic UI components. Here are the essential ones:

### 11.1 Button Component

Create `components/ui/button.tsx`:

```typescript
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'h-10 py-2 px-4': size === 'default',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### 11.2 Textarea Component

Create `components/ui/textarea.tsx`:

```typescript
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
```

### 11.3 Icons

Create `components/icons.tsx`:

```typescript
export function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    </svg>
  );
}
```

## Step 12: Configuration Files

### 12.1 TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 12.2 Next.js Configuration

Create `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
};

export default nextConfig;
```

## Step 13: Styling (Optional)

### 13.1 Tailwind CSS Setup

If using Tailwind CSS, create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 13.2 Global Styles

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Step 14: Database Migration and Setup

### 14.1 Generate and Run Migrations

```bash
# Generate migration files
npx drizzle-kit generate

# Run migrations
npm run db:migrate
```

### 14.2 Update Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "npx tsx lib/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Step 15: Testing and Deployment

### 15.1 Local Testing

1. Start your PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Start the development server: `npm run dev`
4. Navigate to `http://localhost:3000`

### 15.2 Environment Variables for Production

For production deployment, ensure you have:

```bash
# Production Database
POSTGRES_URL="your_production_db_url"

# AI Provider
XAI_API_KEY="your_production_api_key"

# NextAuth
NEXTAUTH_SECRET="your_production_secret"
NEXTAUTH_URL="https://yourdomain.com"

# Optional: Redis for resumable streams
REDIS_URL="your_redis_url"
```

## Advanced Features (Optional)

### Rate Limiting

Create `lib/ai/entitlements.ts`:

```typescript
export type UserType = 'guest' | 'regular';

export const entitlementsByUserType = {
  guest: {
    maxMessagesPerDay: 10,
  },
  regular: {
    maxMessagesPerDay: 100,
  },
};
```

### File Attachments

Add file upload handling by extending the schema and implementing file storage with services like Vercel Blob or AWS S3.

### AI Tools Integration

Add tools like weather, document creation by implementing tool definitions and handlers in the `lib/ai/tools/` directory.

## Troubleshooting

### Common Issues

1. **Database Connection Issues**: Ensure your `POSTGRES_URL` is correct
2. **AI Provider Errors**: Verify your API key and model access
3. **Authentication Issues**: Check NextAuth configuration and secrets
4. **Streaming Problems**: Ensure proper SSE handling in your deployment environment

### Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Caching**: Implement Redis caching for sessions and chat data
3. **Message Pagination**: Implement pagination for large chat histories
4. **Rate Limiting**: Add proper rate limiting to prevent abuse

## Conclusion

This guide provides a comprehensive foundation for implementing the chat feature. You can extend it with additional features like:

- Message reactions and voting
- File attachments and media sharing
- Real-time collaborative editing
- Advanced AI tools and integrations
- Multi-language support
- Chat themes and customization

The architecture is designed to be scalable and maintainable, following modern web development best practices with TypeScript, React, and Next.js. 