import { z } from "zod";

export const TOOL_NAME_REGEX = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const TOOL_NAME_MIN_LENGTH = 1;
export const TOOL_NAME_MAX_LENGTH = 100;
export const TOOL_NAME_REGEX_MESSAGE =
  "Only lowercase letters and numbers, joined by single underscores (e.g., do_an_action)";
export const TOOL_NAME_MIN_LENGTH_MESSAGE = `Minimum ${TOOL_NAME_MIN_LENGTH} character`;
export const TOOL_NAME_MAX_LENGTH_MESSAGE = `Maximum ${TOOL_NAME_MAX_LENGTH} characters`;

export const toolNameSchema = z
  .string()
  .min(TOOL_NAME_MIN_LENGTH, TOOL_NAME_MIN_LENGTH_MESSAGE)
  .max(TOOL_NAME_MAX_LENGTH, TOOL_NAME_MAX_LENGTH_MESSAGE)
  .regex(TOOL_NAME_REGEX, TOOL_NAME_REGEX_MESSAGE);

export const argumentSchema = z.object({
  name: toolNameSchema,
  description: z.string().min(1, "Argument description is required"),
  type: z.enum(["string", "number", "array"], {
    required_error: "Argument type is required",
  }),
});

export const createToolSchema = z.object({
  name: toolNameSchema,
  description: z.string().min(1, "Description is required"),
  prompt: z.string().min(1, "Prompt is required"),
  args: z.array(argumentSchema).optional(),
});
