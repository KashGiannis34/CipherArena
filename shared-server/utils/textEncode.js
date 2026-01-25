import crypto from "crypto";

const SECRET_KEY = process.env.QUOTE_TOKEN_SECRET;

// check key is exactly 32 bytes for AES-256
const getKey = () => {
  return crypto.createHash("sha256").update(SECRET_KEY).digest();
};

/**
 * Encrypts a text with a random IV so the same quote produces different tokens each time.
 * @param {string} text - The text to encrypt
 * @returns {string} - Base64 encoded encrypted token (IV + ciphertext)
 */
export function encryptText(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const combined = Buffer.concat([iv, Buffer.from(encrypted, "base64")]);
  return combined.toString("base64");
}

/**
 * Decrypts a token back to the original text.
 * @param {string} token - The encrypted token from encryptText
 * @returns {string|null} - The original text, or null if decryption fails
 */
export function decryptToken(token) {
  try {
    const combined = Buffer.from(token, "base64");
    const iv = combined.subarray(0, 16);
    const encrypted = combined.subarray(16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt token:", error.message);
    return null;
  }
}
