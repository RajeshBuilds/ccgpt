import { getCustomer, getMessagesByChatId } from '@/lib/db/queries';
import { tool } from 'ai';
import { z } from 'zod';

export const getCustomerDetailsById = tool({
  description: 'get the customer details by customer_id',
  inputSchema: z.object({
    customerId: z.number().describe('The customer_id of the customer who made the current complaint')
  }),
  execute: async ({ customerId}) => {
    try {
      const customers = await getCustomer(customerId);
      const customer = customers[0];
      return {
        success: true,
        message: `Customer details fetched successfully`,
        customer
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `failed to fetch customer details`,
      };
    }
  },
});
