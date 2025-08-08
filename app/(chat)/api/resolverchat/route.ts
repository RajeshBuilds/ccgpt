import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import {
  createStreamId,
  getChatById,
  getComplaintById,
  getMessagesByChatId,
  saveChat,
  saveComplaintDetails,
  saveMessages,
  submitComplaint,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { myProvider } from '@/lib/ai/providers';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import { complaintResolverPrompt } from '@/lib/ai/prompts';
import { generateTitleFromUserMessage } from '../../actions';
import { fetchComplaintByRef } from '@/lib/ai/tools/complaint/fetch-complaint-by-ref';
import { assignComplaint } from '@/lib/ai/tools/complaint/assign-complaint';
import { updateCurrentComplaintDetails } from '@/lib/ai/tools/complaint/update-current-complaint-details';
import { updateComplaintSummary } from '@/lib/ai/tools/complaint/update-complaint-summary';
import { fetchComplaintsByAssignee } from '@/lib/ai/tools/complaint/fetch-complaints-by-assignee';
import { fetchComplaintsWithNaturalLanguageQuery } from '@/lib/ai/tools/complaint/fetch-complaints-with-natural-language-query';


export const maxDuration = 120;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id']
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        userType: session.user.type,
        title,
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {


        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: `
Current user interacting with you is an employee responsible for resolving any complaints. The user details are as follows:
- User ID: ${session.user.id}
- User Type: ${session.user.type}
- User Role: ${session.user.role}
- User Name: ${session.user.name}
- User Email: ${session.user.email}
- User Phone: ${session.user.phone}

          ${complaintResolverPrompt}
`,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getComplaintDetailsById',
                  'assignToCurrentUser',
                  'updateCurrentComplaintDetails',
                  'updateComplaintSummary',
                  'fetchComplaintsByAssignee',
                  'fetchComplaintsWithNaturalLanguageQuery'
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            getComplaintDetailsById: fetchComplaintByRef,
            assignToCurrentUser: assignComplaint,
            updateCurrentComplaintDetails : updateCurrentComplaintDetails,
            updateComplaintSummary : updateComplaintSummary,
            fetchComplaintsByAssignee : fetchComplaintsByAssignee,
            fetchComplaintsWithNaturalLanguageQuery : fetchComplaintsWithNaturalLanguageQuery
          },
          experimental_telemetry: {
            isEnabled: false,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            chatId: id,
            createdAt: new Date(),
            attachments: [],
            updatedAt: new Date(),
          })),
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}
