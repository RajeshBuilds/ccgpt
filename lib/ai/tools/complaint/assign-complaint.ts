import { assignComplaintToEmployeeByRef } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const assignComplaint = tool({
  description: 'Assign a complaint to a particular user (employee)',
  inputSchema: z.object({
    referenceNumber: z.string().describe('The reference number of the complaint'),
    employeeId: z.number().describe('The user/employee ID to assign the complaint to'),
  }),
  execute: async ({ referenceNumber, employeeId }) => {
    try {
      await assignComplaintToEmployeeByRef({
        referenceNumber,
        employeeId,
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
