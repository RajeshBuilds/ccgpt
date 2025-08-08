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
  saveMessages,
  submitComplaint,
  updateChatTitle,
  updateChatIsDraft,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { assignComplaintToEmployee, checkComplaintReadiness, generateTitleFromUserMessage } from '../../actions';
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
import { customerComplaintPrompt } from '@/lib/ai/prompts';
import { registerComplaint } from '@/lib/ai/tools/complaint/register-complaint';

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
      selectedChatModel,
      complaintId,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      complaintId: string;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // Check if complaint exists
    let complaint = await getComplaintById(complaintId);
    let complaintReadiness: { isReady: boolean } | null = null;
    console.log('Complaint details:', complaint);

    if (!complaint) {
      console.error('Complaint not found:', complaintId);
      // You might want to handle this case differently
    }

    const chat = await getChatById({ id });

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

        // Send title update event if title was updated
        if (chat.title === 'New Chat') {
          const title = await generateTitleFromUserMessage({
            message,
          });

          console.log('Title generated:', title);

          if (title) {
            await updateChatTitle({
              id,
              title,
            });
  
            // Send title update event to client
            dataStream.write({
              type: 'data-title',
              data: title,
            });
          }
        }

        // Only check readiness if the complaint is still a draft
        if (complaint && complaint.isDraft) {
          complaintReadiness = await checkComplaintReadiness(complaintId, uiMessages);
          complaint = await getComplaintById(complaintId);
          console.log('Complaint readiness:', complaintReadiness);

          if (complaintReadiness?.isReady) {
            try {
              await submitComplaint({ id: complaintId });
              complaint = await getComplaintById(complaintId);
              await updateChatIsDraft({ id, isDraft: false });
              console.log('Complaint submitted successfully:', complaintId);
              console.log('Complaint details:', complaint);
              console.log('Routing the complaint to the support team...');
              assignComplaintToEmployee(complaintId);
            } catch (error) {
              console.error('Error submitting complaint:', error);
            }
          }
        } else if (complaint && !complaint.isDraft) {
          console.log('Complaint already submitted, skipping readiness check');
        }

        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: `${customerComplaintPrompt}

IMPORTANT: Check if the complaint reference number is generated and provided below after the complaint submission. If it's not null then only tell the customer the reference number.
Also check if the complaint is ready to submit. If the complaint readiness is not true yet, then do not show the reference number. Only show once both are truthy.
Complaint Reference Number: ${complaint?.referenceNumber}
Complaint Readiness: ${complaintReadiness?.isReady}

Do not generate or make up any other reference numbers. Use only the provided reference number above.`,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'registerComplaint',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            registerComplaint: registerComplaint(complaintId),
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


