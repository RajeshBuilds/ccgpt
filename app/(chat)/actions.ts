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

const ComplaintCategorySchema = z.object({
  category: z.enum([
    'Banking Accounts & Services',
    'Cards',
    'Payments & Transfers',
    'Loans & Credit',
    'Digital Banking & Channels',
    'Customer Service & Experience',
    'ATM & Branch Services',
    'Security & Fraud',
    'Fees & Charges',
    'General Inquiry'
  ]).describe('The predicted category of the complaint based on the conversation content'),
  confidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1 for the category prediction'),
  reasoning: z.string().describe('Brief explanation for why this category was selected'),
  sentiment: z.enum([
    'negative', 
    'neutral',
    'positive',
  ]).describe('The overall sentiment of the customer based on the conversation'),
  sentimentConfidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1 for the sentiment prediction'),
  sentimentReasoning: z.string().describe('Brief explanation for the sentiment assessment')
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
      system: `You are a complaint readiness checker agent. Based on the provided conversation context, check if all required information has been collected and the user has explicitly confirmed they want to proceed with complaint registration.

VALIDATION RULES:
** Check if all these fields are present:
- Description: Check if the description is present and assess if it is detailed enough and understandable
- Desired Resolution: Check if the desired resolution is present and assess if it is detailed enough and understandable
- Additional Details: Check if the additional details which can be helpful for the support team to understand the complaint better are present

** CRITICAL: EXPLICIT USER CONFIRMATION REQUIRED
The user MUST have explicitly confirmed they want to proceed with complaint registration. Look for:
- Direct confirmation phrases like: "yes", "correct", "proceed", "submit", "confirm", "that's right", "looks good", "go ahead"
- Responses to questions like "Is this information correct? Should I proceed with registering your complaint?"
- Clear affirmative responses after the assistant presents a complaint summary

** IMPORTANT: Do NOT set isReady to true unless:
1. ALL required information is collected
2. The assistant has presented a summary to the user
3. The user has explicitly confirmed they want to proceed (not just provided more information)

** If the user is still providing additional information, asking questions, or making corrections, set isReady to false

** Return the complaint readiness object with the following fields:
- description: the description of the complaint
- desiredResolution: the desired resolution of the complaint
- additionalDetails: the additional details of the complaint
- isReady: Only return true if ALL information is collected AND the user has explicitly confirmed they want to proceed with registration
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

export async function predictComplaintCategory(messages: UIMessage[]) {
  try {
    const conversationContext = messages.map(msg => 
      `${msg.role}: ${msg.parts.map(part => 
        part.type === 'text' ? part.text : ''
      ).join(' ')}`
    ).join('\n');

    const { object: categoryPrediction } = await generateObject({
      model: myProvider.languageModel('chat-model-reasoning'),
      schema: ComplaintCategorySchema,
      system: `You are a complaint categorization and sentiment analysis agent. Analyze the conversation context and predict the most appropriate category for the complaint, as well as assess the customer's sentiment.

CATEGORIES AND THEIR DESCRIPTIONS:
- "Banking Accounts & Services": Issues with opening, closing, managing bank accounts, account statements, balance inquiries
- "Cards": Credit card, debit card, prepaid card issues including transactions, limits, activations, replacements
- "Payments & Transfers": Money transfers, wire transfers, payment processing, failed transactions, payment delays
- "Loans & Credit": Personal loans, mortgages, credit lines, loan applications, interest rates, repayment issues
- "Digital Banking & Channels": Online banking, mobile app issues, website problems, digital service failures
- "Customer Service & Experience": Staff behavior, service quality, communication issues, complaint handling
- "ATM & Branch Services": ATM malfunctions, branch service issues, waiting times, facility problems
- "Security & Fraud": Unauthorized transactions, account security, fraud reporting, identity theft, suspicious activities
- "Fees & Charges": Service fees, transaction charges, penalty fees, fee disputes, billing issues
- "General Inquiry": Information requests, general questions, or complaints that don't fit other categories

SENTIMENT ANALYSIS GUIDELINES:
- "negative": Clearly frustrated or disappointed. Expresses dissatisfaction with services or outcomes
- "neutral": Factual reporting without strong emotional indicators. Professional or matter-of-fact tone
- "positive": Generally satisfied or optimistic. May express appreciation despite having an issue

CATEGORIZATION INSTRUCTIONS:
- Analyze the conversation to understand the core issue
- Select the category that best matches the primary complaint
- Make sure the category exactly matches the category name in the CATEGORIES AND THEIR DESCRIPTIONS section
- Provide a confidence score (0.0 to 1.0) based on how clearly the complaint fits the category
- Give a brief reasoning for your selection
- If multiple categories could apply, choose the most specific and relevant one

SENTIMENT ANALYSIS INSTRUCTIONS:
- Assess the overall emotional tone of the customer throughout the conversation
- Look for emotional indicators: word choice, tone, urgency, frustration levels, satisfaction expressions
- Consider the customer's attitude towards the bank, the issue, and the resolution process
- Make sure the sentiment exactly matches the sentiment name in the SENTIMENT ANALYSIS GUIDELINES section
- Provide a sentiment confidence score (0.0 to 1.0) based on how clear the emotional indicators are
- Give a brief reasoning for your sentiment assessment
- Focus on the customer's emotional state, not just the severity of the issue`,
      prompt: `Conversation context:
${conversationContext}`,
    });

    return categoryPrediction;
  } catch (error) {
    console.error('Category prediction error:', error);
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
