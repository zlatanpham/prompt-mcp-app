import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createDeepSeek } from "@ai-sdk/deepseek";

export function getModel(model: string, apiKey: string) {
  const [provider, modelId] = model.split("/");
  if (!modelId) {
    throw new Error(`Invalid model format: ${model}`);
  }
  if (!apiKey) {
    throw new Error(`API key is required for model provider: ${provider}`);
  }
  switch (provider) {
    case "openai":
      const openAI = createOpenAI({
        apiKey,
      });
      return openAI(modelId);
    case "anthropic":
      const anthropic = createAnthropic({
        apiKey,
      });
      return anthropic(modelId);
    case "google":
      const google = createGoogleGenerativeAI({
        apiKey,
      });
      return google(modelId);
    case "x-ai":
      const xai = createXai({
        apiKey,
      });
      return xai(modelId);
    case "deepseek":
      const deepseek = createDeepSeek({
        apiKey,
      });
      return deepseek(modelId);
    default:
      throw new Error(`Unknown model provider: ${provider}`);
  }
}
