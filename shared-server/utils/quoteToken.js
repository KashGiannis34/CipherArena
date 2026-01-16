import crypto from 'crypto';

const SECRET_KEY = process.env.QUOTE_TOKEN_SECRET;

// check key is exactly 32 bytes for AES-256
const getKey = () => {
    return crypto.createHash('sha256').update(SECRET_KEY).digest();
};

/**
 * Encrypts a quote ID with a random IV so the same quote produces different tokens each time.
 * @param {string} quoteId - The MongoDB ObjectId as a string
 * @returns {string} - Base64 encoded encrypted token (IV + ciphertext)
 */
export function encryptQuoteId(quoteId) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);

    let encrypted = cipher.update(quoteId, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64')]);
    return combined.toString('base64');
}

/**
 * Decrypts a quote token back to the original quote ID.
 * @param {string} token - The encrypted token from encryptQuoteId
 * @returns {string|null} - The original quote ID, or null if decryption fails
 */
export function decryptQuoteToken(token) {
    try {
        const combined = Buffer.from(token, 'base64');
        const iv = combined.subarray(0, 16);
        const encrypted = combined.subarray(16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);

        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Failed to decrypt quote token:', error.message);
        return null;
    }
}
