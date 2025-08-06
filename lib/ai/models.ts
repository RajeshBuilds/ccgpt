export const DEFAULT_CHAT_MODEL: string = 'chat-model';
export const COMPLAINT_ASSISTANT_MODEL: string = 'complaint-assistant-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
  {
    id: 'complaint-assistant-model',
    name: 'Customer Complaint Registration Assistant',
    description: 'Specialized assistant for complaint registration',
  },
];
