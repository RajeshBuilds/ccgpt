import { updateComplaintField } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const updateComplaint = (id: string) => tool({
  description: 'Update a specific field in the complaint record',
  inputSchema: z.object({
    field: z.enum([
      'category',
      'subCategory',
      'description',
      'additionalDetails',
      'attachmentUrls',
      'desiredResolution',
    ]).describe('The field name to update'),
    value: z.string().describe('The value to set for the field'),
  }),
  execute: async ({ field, value }) => {
    try {
      await updateComplaintField({
        id,
        field,
        value,
      });

      return {
        success: true,
        message: `Updated ${field} to "${value}"`,
        field,
        value,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to update ${field}`,
      };
    }
  },
});