import { z } from "zod";

export const argumentSchema = z.object({
  name: z.string().min(1, "Argument name is required"),
  description: z.string().optional(),
  type: z.enum(["string", "number"]),
});

export type Argument = z.infer<typeof argumentSchema>;
