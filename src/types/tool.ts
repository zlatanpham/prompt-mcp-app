import { z } from "zod";
import { toolNameSchema } from "@/lib/validators/tool";
import { type Tool as PrismaTool } from "@prisma/client";

export const argumentSchema = z.object({
  name: toolNameSchema,
  description: z.string().min(1, "Argument description is required"),
  type: z.enum(["string", "number", "array"], {
    required_error: "Argument type is required",
  }),
});

export type Argument = z.infer<typeof argumentSchema>;

export type Tool = PrismaTool & {
  args: Argument[];
};
