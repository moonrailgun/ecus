import crypto from "crypto";
import { join } from "path";
import os from "os";
import { mkdir } from "fs/promises";

/**
 * generate a random hash value which length: 64
 */
export function generateRandomSHA256(input: string) {
  const salt = crypto.randomBytes(32).toString("hex");

  return crypto
    .createHash("sha256")
    .update(input + salt)
    .digest("hex");
}

export const TEMP_UPLOAD_DIR = join(os.tmpdir(), "ecus/uploads");

// Create a temp directory for file uploads if it doesn't exist
export async function ensureTempDir() {
  try {
    await mkdir(TEMP_UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create temp directory:", error);
  }
}
