import { fetchComplaintsWithQuery } from '@/lib/db/queries';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { myProvider } from '../../providers';

export const fetchComplaintsWithNaturalLanguageQuery = tool({
  description: 'Convert a natural language statement to a SQL query, execute it and return the result from complaints database',
  inputSchema: z.object({
    question: z.any().describe('The natural language request to convert and run as a SQL query.'),
  }),
  execute: async ({ question }) => {

    console.log('Received question:', question);
    // natural language to db conversion logic would go here
    const sqlQuery = await convertNaturalLanguageToSQL(question); // Assuming this function exists to convert the question to SQL
    const data = await fetchComplaintsWithQuery(sqlQuery); // Assuming fetchData is a function that executes the SQL query

    if (!data) {
      return {
        success: false,
        message: 'No data found for the given query',
      };
    }
    return {
      success: true,
      data,
      message: 'UI updated with current complaint details',
    };
  },
});

async function convertNaturalLanguageToSQL(question: string): Promise<string> {
  const chatModel = myProvider.languageModel('chat-model');

  const schema = `
    You are an expert SQL assistant.

    Here is the database schema:

    - complaint: Contains all complaint records.
      - id: integer, primary key
      - reference_number: string, unique
      - chat_id: uuid, foreign key to identify chat
      - customer_id: integer, foreign key to identify who made the complaint
      - category: string, category of the complaint
      - sub_category: string, sub-category of the complaint
      - description: text, description of the complaint
      - additional_details: text, any extra details provided by the customer
      - attachment_urls: text, URLs to any attachments related to the complaint
      - desired_resolution: text, what the customer wants as a resolution
      - sentiment: string, sentiment of the complaint (e.g., positive, negative, neutral)
      - urgency_level: string, urgency level of the complaint
      - assistant_notes: text, notes from the registration AI assistant
      - assigned_to: integer, foreign key to identify employees to whom the complaint is assigned
      - is_draft: boolean, whether the complaint is a draft or not
      - resolution_notes: text, notes on how the complaint was resolved
      - resolved_at: datetime, when the complaint was resolved
      - status: string
      - created_at: datetime
      - updated_at: datetime

    Convert the following natural language question into a SQL SELECT query.

    Question: ${question}

    ONLY return the SQL query without explanation or markdown formatting.
    `;

 const { text: sql } = await generateText({
    model: chatModel,
    prompt: schema
  });

  if (!sql.toLowerCase().startsWith('select')) {
    return ""
  }
  return sql;
}

