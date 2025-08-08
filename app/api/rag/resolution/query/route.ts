import { BedrockAgentRuntimeClient, InvokeAgentCommand, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { NextResponse } from "next/server";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const command = await new RetrieveAndGenerateCommand({
        input: { text: query },
        retrieveAndGenerateConfiguration: {
          type: "KNOWLEDGE_BASE",
          knowledgeBaseConfiguration: {
            knowledgeBaseId: process.env.BEDROCK_KB_ID!,
            modelArn: process.env.BEDROCK_MODEL_ARN!,
          }
        }
      })

    const response = await client.send(command);

    // Extract the response from RetrieveAndGenerate
    const responseText = response.output?.text || "No response generated";

    return NextResponse.json({
      response: responseText,
      sessionId: response.sessionId,
    });

  } catch (error) {
    console.error("Error querying Bedrock Agent:", error);
    return NextResponse.json(
      { error: "Failed to query knowledge base" },
      { status: 500 }
    );
  }
}