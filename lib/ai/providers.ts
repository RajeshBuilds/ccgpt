import { openai } from '@ai-sdk/openai';
import { customProvider, wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

const BEDROCK_CLAUDE_SONNET_4 = 'us.anthropic.claude-sonnet-4-20250514-v1:0';
const GPT_4O = 'gpt-4o';
const GPT_4O_MINI = 'gpt-4o-mini';
const GPT_O3_MINI = 'o3-mini';

const bedrock = createAmazonBedrock({
  region: process.env.XYZ_REGION || 'us-east-1',
  accessKeyId: process.env.XYZ_ACCESS_KEY_ID,
  secretAccessKey: process.env.XYZ_SECRET_ACCESS_KEY,
  sessionToken: process.env.XYZ_SESSION_TOKEN,
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': bedrock(BEDROCK_CLAUDE_SONNET_4),
    'chat-model-reasoning': wrapLanguageModel({
      model: bedrock(BEDROCK_CLAUDE_SONNET_4),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'complaint-assistant-model': bedrock(BEDROCK_CLAUDE_SONNET_4),
    'title-model': bedrock(BEDROCK_CLAUDE_SONNET_4),
    'artifact-model': bedrock(BEDROCK_CLAUDE_SONNET_4),
  }
});