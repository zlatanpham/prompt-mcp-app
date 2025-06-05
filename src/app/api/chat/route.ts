import { streamText, type CoreMessage, tool as aiTool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek"; // Import DeepSeek
import { type Tool } from "@/types/tool";
import * as z from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, apiKeys, model, tools } = (await req.json()) as {
    messages: CoreMessage[];
    apiKeys: Record<string, string>;
    model: string;
    tools: Tool[];
  };

  const aiTools = tools.reduce(
    (acc, tool) => {
      acc[tool.name] = aiTool({
        description: tool.description ?? "",
        execute: async (args: Record<string, any>): Promise<string> => {
          const resultString = tool.prompt.replace(/{(\w+)}/g, (_, key) => {
            if (key in args) {
              if (Array.isArray(args[key])) {
                return args[key].map((item: string) => `"${item}"`).join(", ");
              }
              return args[key];
            }
            return `{${key}}`;
          });
          return resultString;
        },
        parameters: z.object(
          (tool.args || []).reduce(
            (acc, arg) => {
              let argType: z.ZodTypeAny;

              if (arg.type === "array") {
                argType = z.array(z.string()).describe(arg.description);
              } else if (arg.type === "number") {
                argType = z.number().describe(arg.description);
              } else if (arg.type === "string") {
                argType = z.string().describe(arg.description);
              } else {
                throw new Error(`Unsupported argument type: ${arg.type}`);
              }

              acc[arg.name] = argType;
              return acc;
            },
            {} as Record<string, z.ZodTypeAny>,
          ),
        ),
      });
      return acc;
    },
    {} as Record<string, ReturnType<typeof aiTool>>,
  );

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
    tools: aiTools,
  });

  return result.toDataStreamResponse();
}
