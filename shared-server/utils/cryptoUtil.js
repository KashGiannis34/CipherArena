import crypto from 'crypto';
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives a key from the secret using PBKDF2
 */
function deriveKey(secret, salt) {
	return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts data using AES-256-GCM
 * @param {any} data - Data to encrypt (will be JSON stringified)
 * @param {string} secret - Secret key for encryption
 * @returns {string} Base64 encoded encrypted data with IV, salt, and auth tag
 */
export function encrypt(data, secret=SECRET_JWT_KEY) {
	try {
		const salt = crypto.randomBytes(SALT_LENGTH);
		const iv = crypto.randomBytes(IV_LENGTH);

		const key = deriveKey(secret, salt);

		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

		const jsonData = JSON.stringify(data);
		let encrypted = cipher.update(jsonData, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		const authTag = cipher.getAuthTag();

		const result = Buffer.concat([
			salt,
			iv,
			Buffer.from(encrypted, 'hex'),
			authTag
		]);

		return result.toString('base64');
	} catch (error) {
		console.error('Encryption error:', error);
		throw new Error('Failed to encrypt data');
	}
}

/**
 * Decrypts data using AES-256-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} secret - Secret key for decryption
 * @returns {any} Decrypted and parsed data
 */
export function decrypt(encryptedData, secret=SECRET_JWT_KEY) {
	try {
		const buffer = Buffer.from(encryptedData, 'base64');

		const salt = buffer.subarray(0, SALT_LENGTH);
		const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
		const authTag = buffer.subarray(buffer.length - TAG_LENGTH);
		const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH, buffer.length - TAG_LENGTH);

		const key = deriveKey(secret, salt);

		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(encrypted, undefined, 'utf8');
		decrypted += decipher.final('utf8');

		return JSON.parse(decrypted);
	} catch (error) {
		console.error('Decryption error:', error);
		throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
	}
}

/**
 * Creates a secure hash of data (for verification purposes)
 * @param {any} data - Data to hash
 * @returns {string} Hex encoded hash
 */
export function hash(data) {
	const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
	return crypto.createHash('sha256').update(jsonData).digest('hex');
}

/**
 * Verifies that data matches a hash
 * @param {any} data - Data to verify
 * @param {string} hashToVerify - Hash to compare against
 * @returns {boolean} True if hash matches
 */
export function verifyHash(data, hashToVerify) {
	return hash(data) === hashToVerify;
}
