import crypto from "crypto";

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
