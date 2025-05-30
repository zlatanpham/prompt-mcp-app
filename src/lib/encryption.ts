import crypto from "crypto";

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.ENCRYPTION_KEY ?? "", "hex");
const ivLength = 12; // AES-GCM standard IV length

if (!key || key.length !== 32) {
  throw new Error(
    "ENCRYPTION_KEY must be set in env and be 32 bytes (64 hex chars)",
  );
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Return iv + tag + encrypted data as hex string
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

export function decrypt(encryptedHex: string): string {
  const data = Buffer.from(encryptedHex, "hex");
  const iv = data.slice(0, ivLength);
  const tag = data.slice(ivLength, ivLength + 16);
  const encrypted = data.slice(ivLength + 16);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
