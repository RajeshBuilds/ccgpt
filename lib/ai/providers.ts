import { openai } from '@ai-sdk/openai';
import { customProvider, wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const BEDROCK_CLAUDE_SONNET_4 = 'us.anthropic.claude-sonnet-4-20250514-v1:0';
const GPT_4O = 'gpt-4o';
const GPT_4O_MINI = 'gpt-4o-mini';
const GPT_O3_MINI = 'o3-mini';

const bedrock = createAmazonBedrock({
  region: 'us-east-1',
  credentialProvider: fromNodeProviderChain(),
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai(GPT_4O),
    'chat-model-reasoning': wrapLanguageModel({
      model: openai(GPT_O3_MINI),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'complaint-assistant-model': openai(GPT_4O),
    'title-model': openai(GPT_4O_MINI),
    'artifact-model': openai(GPT_4O),
  }
});