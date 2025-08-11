import { updateComplaintStatusById } from '@/lib/db/queries';
import { complaint } from '@/lib/db/schema';
import { tool } from 'ai';
import { z } from 'zod';

export const updateComplaintStatus =  tool({
  description: 'Resolve a complaint in the system by updating its status and relevant fields',
  inputSchema: z.object({
    complaintId: z.string().describe('The complaintId of the complaint to resolve and NOT its reference number'),
    status: z.enum(['open' , 'assigned' , 'in_progress' , 'closed' , 'escalated']).describe('The new status to be assigned'),
    resolutionRemarks: z.string().optional().describe('Remarks or notes regarding the resolution of the complaint. ONLY USE for status "closed"'),
  }),
  execute: async ({ complaintId, status, resolutionRemarks }) => {
    try {
      await updateComplaintStatusById({
        complaintId,
        status,
        resolutionNotes: resolutionRemarks,
      });
      return {
        success: true,
        message: `Complaint ${complaintId} updated to status '${status}'` + (resolutionRemarks ? ` with remarks: ${resolutionRemarks}` : ''),
        complaintId,
        status,
        resolutionRemarks,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to update complaint status`,
      };
    }
  },
});