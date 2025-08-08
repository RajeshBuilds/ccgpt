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
import { artifactsPrompt, regularPrompt } from '@/lib/ai/prompts';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { complaintResolverPrompt } from '@/lib/ai/prompts';
import { fetchComplaintsWithNaturalLanguageQuery } from '@/lib/ai/tools/complaint/fetch-complaints-with-natural-language-query';
import { uploadComplaintSummaryToDatabase } from '@/lib/ai/tools/complaint/upload-complaint-summary-to-database';
import { queryKnowledgeBase } from '@/lib/ai/tools/complaint/query-knowledge-base';
import { updateComplaintStatus } from '@/lib/ai/tools/complaint/update-complaint-status';
import { updateComplaintCategory } from '@/lib/ai/tools/complaint/update-complaint-category';
import { getCustomerDetailsById } from '@/lib/ai/tools/complaint/get-customer-details-by-id';


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
    const complaint = await getComplaintById(complaintId);
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
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: `
          Current user interacting with you is an employee responsible for resolving a particular complaint. 
          
          The user details are as follows:
          - User ID: ${session.user.id}
          - User Type: ${session.user.type}
          - User Role: ${session.user.role}
          - User Name: ${session.user.name}
          - User Email: ${session.user.email}
          - User Phone: ${session.user.phone}

          Complaint details are as follows:
           - id: ${complaint.id}
           - reference_number: ${complaint.referenceNumber}
          - customer_id: ${complaint.customerId}
          - category: ${complaint.category}
          - sub_category: ${complaint.subCategory}
          - description: ${complaint.description}
          - additional_details: ${complaint.additionalDetails}
          - attachment_urls: ${complaint.attachmentUrls}
          - desired_resolution: ${complaint.desiredResolution}
          - sentiment: ${complaint.sentiment}
          - urgency_level: ${complaint.urgencyLevel}
          - assistant_notes: ${complaint.assistantNotes}
          - assigned_to: ${complaint.assignedTo}
          - is_draft: ${complaint.isDraft}
          - status: ${complaint.status}
          - resolution_notes: ${complaint.resolutionNotes}
          - resolved_at: ${complaint.resolvedAt}
          - created_at: ${complaint.createdAt}
          - updated_at: ${complaint.updatedAt}
          
          your chat_id is ${id}, use this to retrieve the past conversation history & context.

                    ${complaintResolverPrompt} 
                   
            
          ## POINTS TO REMEMBER WHEN CLOSING / RESOLVING A COMPLAINT:  
            - Create an elaborate summary of this complaint resolution based on the chat history. 
            - AFTER GENERATING THE SUMMARY, SHOW THE COMPLAINT SUMMARY TO THE USER VIA ARTIFACT TOOLS LIKE  \`createDocument\` and \`updateDocument\` AND GET CONFIRMATION.
            - ONLY UPON CONFIRMATION, upload the summary to the database using the \`uploadComplaintSummaryToDatabase\` tool.
           
            ##ARTIFACT DETAILS
            ${artifactsPrompt}

            ## STRUCTURE OF THE COMPLAINT RESOLUTION SUMMARY:
            - The complaint summary with all complaint details.
            - Investigartion process starting with initial assessment till final analysis and gathered information.
            - Steps talken to resolve the complaint.
            
            THE COMPLAINT IS CONSIDERED CLOSED ONLY WHEN THE USER CONFIRMS THE RESOLUTION SUMMARY.

          `,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'queryKnowledgeBase',
                  'createDocument',
                  'updateDocument',
                  'fetchComplaintsWithNaturalLanguageQuery',
                  'uploadComplaintSummaryToDatabase',
                  'updateComplaintStatus',
                  'updateComplaintCategory',
                  'getCustomerDetails'
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
                      tools: {
              createDocument: createDocument({ session, dataStream, chatId: id }),
              updateDocument: updateDocument({ session, dataStream }),
              fetchComplaintsWithNaturalLanguageQuery : fetchComplaintsWithNaturalLanguageQuery,
              uploadComplaintSummaryToDatabase: uploadComplaintSummaryToDatabase,
              queryKnowledgeBase: queryKnowledgeBase,
              updateComplaintStatus: updateComplaintStatus,
              updateComplaintCategory:updateComplaintCategory,
              getCustomerDetails:getCustomerDetailsById
              
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


