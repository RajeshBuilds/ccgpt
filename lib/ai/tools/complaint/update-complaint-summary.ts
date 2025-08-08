import { tool } from 'ai';
import { z } from 'zod';

export const updateComplaintSummary = tool({
  description: 'Update the UI with the current complaint resolution summary (no backend effect)',
  inputSchema: z.object({
    summary: z.any().describe('The resolution summary object with header and a body to show in the UI'),
  }),
  execute: async ({ summary }) => {
    // This tool is UI-only, so just return the data for the UI to consume
    return {
      success: true,
      summary,
      message: 'UI updated with complaint resolution summary',
    };
  },
});
