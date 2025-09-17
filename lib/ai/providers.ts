import { openai } from '@ai-sdk/openai';
import { customProvider, wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

const BEDROCK_CLAUDE_SONNET_4 = 'us.anthropic.claude-sonnet-4-20250514-v1:0';
const GPT_4O = 'gpt-4o';
const GPT_4O_MINI = 'gpt-4o-mini';
const GPT_O3_MINI = 'o3-mini';

const bedrock = createAmazonBedrock({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai(GPT_4O),
    'chat-model-reasoning': wrapLanguageModel({
      model: openai(GPT_4O),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'complaint-assistant-model': openai(GPT_4O),
    'title-model': openai(GPT_4O),
    'artifact-model': openai(GPT_4O),
  }
});