import { getComplaintsAssignedToEmployeeA } from "@/lib/db/queries";
import { tool } from "ai";
import { z } from "zod";

export const fetchComplaintsByAssignee = tool({
  description: "Fetch all complaints assigned to a particular employee",
  inputSchema: z.object({
    assignee: z.number().describe("The employee's identifier (e.g., id)"),
  }),
  execute: async ({ assignee }) => {
    try {
      const complaints = await getComplaintsAssignedToEmployeeA(assignee);
      return {
        success: true,
        complaints,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: "Failed to fetch complaints for assignee",
      };
    }
  },
});
