'use server';

import { generateObject, generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import { myProvider } from '@/lib/ai/providers';
import { getComplaintById } from '@/lib/db/queries';
import { z } from 'zod';

const ComplaintReadinessSchema = z.object({
  isReady: z.boolean().describe('Whether all required information has been collected and both assistant and user have indicated that no further information is needed'),
  complaintSummary: z.object({
    description: z.string().describe('The complaint description'),
    desiredResolution: z.string().optional().describe('The desired resolution if provided'),
    additionalDetails: z.string().optional().describe('Additional details relevant to the complaint if provided. These are helpful for the support team to understand the complaint better.'),
  }).describe('Structured summary of the complaint data'),
});

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function checkComplaintReadiness(complaintId: string, messages: UIMessage[]) {
  try {
    const complaint = await getComplaintById(complaintId);
    
    if (!complaint) {
      return null;
    }
    
    const recentMessages = messages.slice(-4);
    const conversationContext = recentMessages.map(msg => 
      `${msg.role}: ${msg.parts.map(part => 
        part.type === 'text' ? part.text : ''
      ).join(' ')}`
    ).join('\n');

    const { object: complaintReadiness } = await generateObject({
      model: myProvider.languageModel('chat-model-reasoning'),
      schema: ComplaintReadinessSchema,
      prompt: `You are a complaint readiness checker agent. Analyze the provided complaint data and determine if all required information has been collected.

VALIDATION RULES:
1. Check if all mandatory fields are present (description)
2. Assess if the description is detailed enough and understandable (at least 50 characters)
3. Verify that both assistant and user have indicated no further information is needed
4. Determine if the complaint is ready for confirmation

Complaint data to validate:
- Description: ${complaint.description || 'NOT SET'}
- Desired Resolution: ${complaint.desiredResolution || 'NOT SET'}
- Additional Details: ${complaint.additionalDetails || 'NOT SET'}

Recent conversation context:
${conversationContext}

Analyze both the complaint data completeness AND the conversation context to determine if the user and assistant have both indicated the information collection is complete.`,
    });

    return complaintReadiness;
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}


