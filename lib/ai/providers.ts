import { openai } from '@ai-sdk/openai';
import { customProvider, wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const bedrock = createAmazonBedrock({
  region: 'us-east-1',
  credentialProvider: fromNodeProviderChain(),
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
    'chat-model-reasoning': wrapLanguageModel({
      model: bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'complaint-assistant-model': openai('gpt-4o'),
    'title-model': openai('gpt-4o-mini'),
  }
});