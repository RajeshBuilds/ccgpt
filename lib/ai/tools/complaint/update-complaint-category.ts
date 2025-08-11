import { updateComplaintCategoryById } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const updateComplaintCategory = tool({
  description: 'Update the category and subCategory of a complaint by its ID',
  inputSchema: z.object({
    complaintId: z.string().describe('The complaintId of the complaint to update'),
    category: z.string().optional().describe('The new category value (optional, only update if provided)'),
    subCategory: z.string().optional().describe('The new subCategory value (optional, only update if provided)'),
  }),
  execute: async ({ complaintId, category, subCategory }) => {
    try {
      await updateComplaintCategoryById({ complaintId, category, subCategory });
      return {
        success: true,
        message: 'Complaint category updated successfully',
        complaintId,
        category,
        subCategory,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to update complaint category',
      };
    }
  },
});
