import { z } from "zod";
import { toolNameSchema } from "@/lib/validators/tool";

export const argumentSchema = z.object({
  name: toolNameSchema,
  description: z.string().min(1, "Argument description is required"),
  type: z.enum(["string", "number", "array"], {
    required_error: "Argument type is required",
  }),
});

export type Argument = z.infer<typeof argumentSchema>;
