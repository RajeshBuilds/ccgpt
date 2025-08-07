import { getComplaintByReferenceNum } from "@/lib/db/queries";
import { tool } from "ai";
import { z } from "zod";

export const fetchComplaintByRef= tool({
  description: "Fetch a complaint by its reference number",
  inputSchema: z.object({
    id: z.string().describe("The reference number to fetch")
  }),
  execute: async ({ id }) => {
    try {
      const complaint = await getComplaintByReferenceNum(id);
      if (!complaint) {
        return {
          success: false,
          message: "Complaint not found",
        };
      }
      return {
        success: true,
        complaint,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: "Failed to fetch complaint details",
      };
    }
  },
});
