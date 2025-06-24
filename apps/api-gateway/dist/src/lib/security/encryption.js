"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionConfig = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.generateSecureToken = generateSecureToken;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateHmac = generateHmac;
exports.verifyHmac = verifyHmac;
const node_buffer_1 = require("node:buffer");
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * Encryption configuration using industry-standard algorithms
 */
exports.encryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000,
    keyLength: 32,
    saltLength: 16,
    tagLength: 16,
};
/**
 * Derive encryption key from password using PBKDF2
 */
function deriveKey(password, salt) {
    return node_crypto_1.default.pbkdf2Sync(password, salt, exports.encryptionConfig.iterations, exports.encryptionConfig.keyLength, 'sha256');
}
/**
 * Encrypt data using AES-256-GCM
 */
function encrypt(data, password) {
    // Generate random salt and IV
    const salt = node_crypto_1.default.randomBytes(exports.encryptionConfig.saltLength);
    const iv = node_crypto_1.default.randomBytes(12); // GCM recommends 12-byte IV
    // Derive key from password
    const key = deriveKey(password, salt);
    // Create cipher using proper modern API
    const cipher = node_crypto_1.default.createCipheriv(exports.encryptionConfig.algorithm, key, iv);
    cipher.setAAD(salt); // Use salt as additional authenticated data
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    // Get authentication tag
    const tag = cipher.getAuthTag();
    return {
        encrypted,
        salt: salt.toString('base64'),
        tag: tag.toString('base64'),
        iv: iv.toString('base64'),
    };
}
/**
 * Decrypt data using AES-256-GCM
 */
function decrypt(encryptedData, password) {
    try {
        // Convert from base64
        const salt = node_buffer_1.Buffer.from(encryptedData.salt, 'base64');
        const tag = node_buffer_1.Buffer.from(encryptedData.tag, 'base64');
        const iv = node_buffer_1.Buffer.from(encryptedData.iv, 'base64');
        // Derive key from password
        const key = deriveKey(password, salt);
        // Create decipher using proper modern API
        const decipher = node_crypto_1.default.createDecipheriv(exports.encryptionConfig.algorithm, key, iv);
        decipher.setAuthTag(tag);
        decipher.setAAD(salt);
        // Decrypt data
        let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch {
        throw new Error('Decryption failed - invalid password or corrupted data');
    }
}
/**
 * Generate cryptographically secure random string
 */
function generateSecureToken(length = 32) {
    return node_crypto_1.default.randomBytes(length).toString('base64url');
}
/**
 * Hash password using bcrypt-compatible method
 */
async function hashPassword(password, _saltRounds = 12) {
    const salt = node_crypto_1.default.randomBytes(16);
    const hash = node_crypto_1.default.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
    // Format: $pbkdf2$rounds$salt$hash (bcrypt-like format)
    return `$pbkdf2$${_saltRounds}$${salt.toString('base64')}$${hash.toString('base64')}`;
}
/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
    try {
        const parts = hash.split('$');
        if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
            return false;
        }
        const salt = node_buffer_1.Buffer.from(parts[3], 'base64');
        const storedHash = node_buffer_1.Buffer.from(parts[4], 'base64');
        const computedHash = node_crypto_1.default.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
        return node_crypto_1.default.timingSafeEqual(storedHash, computedHash);
    }
    catch {
        return false;
    }
}
/**
 * Generate HMAC signature for data integrity
 */
function generateHmac(data, secret) {
    return node_crypto_1.default.createHmac('sha256', secret).update(data).digest('hex');
}
/**
 * Verify HMAC signature
 */
function verifyHmac(data, signature, secret) {
    const expectedSignature = generateHmac(data, secret);
    return node_crypto_1.default.timingSafeEqual(node_buffer_1.Buffer.from(signature, 'hex'), node_buffer_1.Buffer.from(expectedSignature, 'hex'));
}
