import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, apiKey } = await req.json();

  if (!apiKey) {
    return new Response("Google AI API Key is missing.", { status: 400 });
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  const result = streamText({
    model: google("models/gemini-1.5-flash"),
    messages,
  });

  return result.toDataStreamResponse();
}
