import { z } from "zod";

export const TOOL_NAME_REGEX = /^[a-z0-9_]+$/;
export const TOOL_NAME_MIN_LENGTH = 1;
export const TOOL_NAME_MAX_LENGTH = 100;
export const TOOL_NAME_REGEX_MESSAGE =
  "Only lowercase letters, numbers, and underscores (e.g., do_an_action)";
export const TOOL_NAME_MIN_LENGTH_MESSAGE = `Minimum ${TOOL_NAME_MIN_LENGTH} character`;
export const TOOL_NAME_MAX_LENGTH_MESSAGE = `Maximum ${TOOL_NAME_MAX_LENGTH} characters`;

export const toolNameSchema = z
  .string()
  .min(TOOL_NAME_MIN_LENGTH, TOOL_NAME_MIN_LENGTH_MESSAGE)
  .max(TOOL_NAME_MAX_LENGTH, TOOL_NAME_MAX_LENGTH_MESSAGE)
  .regex(TOOL_NAME_REGEX, TOOL_NAME_REGEX_MESSAGE);
