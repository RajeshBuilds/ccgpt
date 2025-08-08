'use server';

import { generateObject, generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import { myProvider } from '@/lib/ai/providers';
import { assignComplaint, findEmployeeForAssignment, getComplaintById } from '@/lib/db/queries';
import { z } from 'zod';
import { ChatSDKError } from '@/lib/errors';

const ComplaintReadinessSchema = z.object({
  description: z.string().describe('The complaint description'),
  desiredResolution: z.string().optional().describe('The desired resolution if provided'),
  additionalDetails: z.string().optional().describe('Additional details relevant to the complaint if provided. These are helpful for the support team to understand the complaint better.'),
  isReady: z.boolean().describe('Whether all required information has been collected and both assistant and user have indicated that no further information is needed'),
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
    - you will generate a short title ONLY when user provides the description of the complaint for the first time
    - if the message is not a complaint description (e.g., greetings, questions, clarifications, follow-ups), return "null"
    - ensure it is not more than 30 characters long
    - the title should be a summary of the user's message
    - be as specific as possible, do not use generic titles like "Complaint" or "Support" or "Assistance Needed" etc
    - Do not append anything like "issue reported", "assistance needed" etc
    - do not use quotes or colons
    - only generate title for initial complaint descriptions, not for subsequent messages`,
    prompt: JSON.stringify(message),
  });

  return title === "null" ? null : title;
}

export async function checkComplaintReadiness(complaintId: string, messages: UIMessage[]) {
  try {
    const complaint = await getComplaintById(complaintId);
    
    if (!complaint) {
      return null;
    }
    
    const conversationContext = messages.map(msg => 
      `${msg.role}: ${msg.parts.map(part => 
        part.type === 'text' ? part.text : ''
      ).join(' ')}`
    ).join('\n');

    const { object: complaintReadiness } = await generateObject({
      model: myProvider.languageModel('chat-model-reasoning'),
      schema: ComplaintReadinessSchema,
      system: `You are a complaint readiness checker agent. Based on the provided conversation context, check if all required information has been collected and both assistant and user have indicated that no further information is needed.

VALIDATION RULES:
** Check if all these fields are present:
- Description: Check if the description is present and assess if it is detailed enough and understandable
- Desired Resolution: Check if the desired resolution is present and assess if it is detailed enough and understandable
- Additional Details: Check if the additional details which can be helpful for the support team to understand the complaint better are present

** MUST CHECK THAT BOTH ASSISTANT AND USER HAVE INDICATED THAT NO FURTHER INFORMATION IS NEEDED

** If the complaint is ready for confirmation, return the complaint readiness object with the following fields:
- description: the description of the complaint
- desiredResolution: the desired resolution of the complaint
- additionalDetails: the additional details of the complaint
- isReady: If you are sure that all required information has been collected and **both assistant and user have indicated that no further information is needed** based on the conversation context, return true, otherwise return false
`,
      prompt: `Conversation context:
${conversationContext}`,
    });

    return complaintReadiness;
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

export async function assignComplaintToEmployee(complaintId: string) {
  try {
    const employee = await findEmployeeForAssignment();
    if (!employee) {
      throw new ChatSDKError('not_found:database', 'No available employee found');
    }

    const assignment = await assignComplaint({ complaintId, employeeId: employee.id });
    
    console.log('✅ Complaint assigned successfully:', {
      assignmentId: assignment.id,
      complaintId: complaintId,
      employeeId: employee.id,
      assignedAt: assignment.assignedAt,
    });

    console.log('Sending email notification...');

    sendNotification();
  } catch (error) {
    console.error('Error assigning complaint to employee:', error);
  }
}

function sendNotification() {
  fetch('https://bv6lbqib2kyyzcvgbbvdrjenoq0bgssk.lambda-url.us-east-1.on.aws/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  }).catch(error => {
    console.error('Lambda function call failed:', error);
  });
}
