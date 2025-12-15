import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Connect to your DB from the server
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { messages, workflowId } = await req.json();

    // 1. Fetch the specific Workflow saved in Convex
    const workflow = await convex.query(api.workflows.getWorkflowById, {
      id: workflowId,
    });

    if (!workflow || !workflow.definition) {
      return new Response("Workflow not found", { status: 404 });
    }

    // 2. Parse the JSON to find the AI Node
    const body = JSON.parse(workflow.definition);
    // Find the node with type 'process' (our AI Agent node)
    const aiNode = body.nodes.find((n: any) => n.type === "process");

    // 3. Extract the user's custom instructions
    const systemPrompt =
      aiNode?.data?.systemPrompt || "You are a helpful AI assistant.";

    // 4. Call Google Gemini with those instructions
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages,
    });

    // 5. Stream the text back to the frontend
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
