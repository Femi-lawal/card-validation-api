const crypto = require('crypto');

/**
 * Encryption utility for PII fields
 * Uses AES-256-GCM for field-level encryption
 */

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a value using AES-256-GCM
 * @param {string} value - Plain text to encrypt
 * @param {string} key - 32-byte hex encryption key
 * @returns {string} - Encrypted value in format: iv:authTag:encrypted
 */
const encryptPII = (value, key = process.env.ENCRYPTION_KEY) => {
    if (!value) return value;

    // Use a default key for development if not set
    if (!key) {
        console.warn('ENCRYPTION_KEY not set - using development key (NOT FOR PRODUCTION)');
        key = crypto.randomBytes(32).toString('hex');
    }

    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);

        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        // In development, store unencrypted if encryption fails
        if (process.env.NODE_ENV !== 'production') {
            return value;
        }
        throw error;
    }
};

/**
 * Decrypt a value encrypted with encryptPII
 * @param {string} encryptedValue - Encrypted value in format: iv:authTag:encrypted
 * @param {string} key - 32-byte hex encryption key
 * @returns {string} - Decrypted plain text
 */
const decryptPII = (encryptedValue, key = process.env.ENCRYPTION_KEY) => {
    if (!encryptedValue || !encryptedValue.includes(':')) {
        // If not encrypted format, return as-is (backwards compatibility)
        return encryptedValue;
    }

    if (!key) {
        console.warn('ENCRYPTION_KEY not set - cannot decrypt');
        return encryptedValue;
    }

    try {
        const parts = encryptedValue.split(':');
        if (parts.length !== 3) return encryptedValue;

        const [ivHex, authTagHex, encrypted] = parts;

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(key, 'hex'),
            Buffer.from(ivHex, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedValue; // Return as-is if decryption fails
    }
};

module.exports = {
    encryptPII,
    decryptPII,
};
