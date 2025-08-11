import { tool } from 'ai';
import { z } from 'zod';

export const queryKnowledgeBase = tool({
  description: `Query the knowledge base for relevant information about complaint resolution, policies, and procedures. 
  knowledge base has the data of all complaint resolutions till date. Based on the input question, knowledge base returns the best inference. 
  it can be used for knowing the past resolutions of similar complaints, or to get the context of the current complaint.`,
  inputSchema: z.object({
    query: z.string().describe('The question to ask the knowledge base'),
  }),
  execute: async ({ query}) => {

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rag/resolution/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json()
        console.error('Error querying knowledge base:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          query,
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        query,
        data
      };
    } catch (error) {
      console.error('Error querying knowledge base:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        query,
      };
    }
  },
});
