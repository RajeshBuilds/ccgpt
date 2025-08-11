import { getMessagesByChatId } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const getChatHistoryById = tool({
  description: 'get the chat history by chat_id. This is used to fetch the past conversation history & context for the current complaint.',
  inputSchema: z.object({
    chatId: z.string().describe('The chat_id of the current chat')
  }),
  execute: async ({ chatId}) => {
    try {
      const messages = await getMessagesByChatId({ id: chatId });
      return {
        success: true,
        message: `Chat history fetched successfully`,
        messages
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed fetch c`,
      };
    }
  },
});
