import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1, "API Key name is required"),
  projectIds: z
    .array(z.string())
    .min(1, "At least one project must be selected"),
});

export const editApiKeySchema = z.object({
  name: z.string().min(1, "API Key name is required"),
  projectIds: z.array(z.string()),
});
