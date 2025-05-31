import { customAlphabet } from "nanoid";

export function generateApiKey(): string {
  // Generate a 32-character alphanumeric key
  const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    32,
  );
  return nanoid();
}
