import { tool } from 'ai';
import { z } from 'zod';

export const updateCurrentComplaintDetails = tool({
  description: 'Update the UI with the current complaint details (no backend effect)',
  inputSchema: z.object({
    complaint: z.any().describe('The full complaint details object to show in the UI'),
  }),
  execute: async ({ complaint }) => {
    // This tool is UI-only, so just return the data for the UI to consume
    return {
      success: true,
      complaint,
      message: 'UI updated with current complaint details',
    };
  },
});
