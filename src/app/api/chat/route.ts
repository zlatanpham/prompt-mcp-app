import { streamText, type CoreMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek"; // Import DeepSeek

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, apiKeys, model } = (await req.json()) as {
    messages: CoreMessage[];
    apiKeys: Record<string, string>;
    model: string;
  };

  if (!model) {
    return new Response("Model is missing.", { status: 400 });
  }

  const [provider, modelCode] = model.split("/");

  let selectedModel;
  let selectedApiKey;

  switch (provider) {
    case "google":
      selectedApiKey = apiKeys.google;
      if (!selectedApiKey) {
        return new Response("Google AI API Key is missing.", { status: 400 });
      }
      selectedModel = createGoogleGenerativeAI({ apiKey: selectedApiKey })(
        `models/${modelCode}`, // Prepend 'models/' for Google
      );
      break;
    case "deepseek":
      selectedApiKey = apiKeys.deepseek;
      if (!selectedApiKey) {
        return new Response("DeepSeek AI API Key is missing.", { status: 400 });
      }
      selectedModel = createDeepSeek({ apiKey: selectedApiKey })(
        modelCode as "deepseek-chat",
      );
      break;
    default:
      return new Response(`Unsupported AI provider: ${provider}`, {
        status: 400,
      });
  }

  const result = streamText({
    model: selectedModel,
    messages,
  });

  return result.toDataStreamResponse();
}
