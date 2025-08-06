import { saveComplaintDetails } from "@/lib/db/queries";
import { tool } from "ai";
import { z } from "zod";

export const registerComplaint = (id: string) => tool({
  description: "Register a complaint", 
  inputSchema: z.object({
    description: z.string().describe('The description of the complaint'),
    additionalDetails: z.string().optional().describe('Additional details relevant to the complaint if provided. These are helpful for the support team to understand the complaint better.'),
    attachmentUrls: z.string().optional().describe('Any URLs to photos, videos, or documents related to the complaint.'),
    desiredResolution: z.string().optional().describe('What outcome or resolution the customer wants (e.g., refund, replacement, repair).'), 
  }),
  execute: async ({ description, additionalDetails, attachmentUrls, desiredResolution }) => {
    console.log(description, additionalDetails, attachmentUrls, desiredResolution);
    try {
      await saveComplaintDetails({
        id,
        description,
        additionalDetails,
        attachmentUrls,
        desiredResolution,
      });

      return {
        success: true,
        message: "Complaint details saved successfully",
        description,
        additionalDetails,
        attachmentUrls,
        desiredResolution,  
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: "Failed to save complaint details",
      };
    }
  },
}); 