import { assignComplaint } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const assignComplaintToCurrentUser = tool({
  description: 'Assign a complaint to a particular user (employee)',
  inputSchema: z.object({
    complaintId: z.string().describe('The id of the complaint and NOT its reference number'),
    employeeId: z.number().describe('The user/employee ID to assign the complaint to'),
    remarks:z.string().optional().describe('Optional remarks for the assignment'),
  }),
  execute: async ({ complaintId, employeeId, remarks }) => {
    try {
      await assignComplaint({
        complaintId,
        employeeId,
        remarks
      });
      return {
        success: true,
        message: `Complaint assigned to user ${employeeId}`,
        employeeId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to assign complaint to user`,
      };
    }
  },
});
