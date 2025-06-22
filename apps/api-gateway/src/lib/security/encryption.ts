import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

/**
 * Encryption configuration using industry-standard algorithms
 */
export const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  iterations: 100000,
  keyLength: 32,
  saltLength: 16,
  tagLength: 16,
};

export type EncryptedData = {
  encrypted: string;
  salt: string;
  tag: string;
  iv: string;
};

/**
 * Derive encryption key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    encryptionConfig.iterations,
    encryptionConfig.keyLength,
    'sha256'
  );
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(data: string, password: string): EncryptedData {
  // Generate random salt and IV
  const salt = crypto.randomBytes(encryptionConfig.saltLength);
  const iv = crypto.randomBytes(12); // GCM recommends 12-byte IV

  // Derive key from password
  const key = deriveKey(password, salt);

  // Create cipher using proper modern API
  const cipher = crypto.createCipheriv(encryptionConfig.algorithm, key, iv) as crypto.CipherGCM;
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
export function decrypt(encryptedData: EncryptedData, password: string): string {
  try {
    // Convert from base64
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');

    // Derive key from password
    const key = deriveKey(password, salt);

    // Create decipher using proper modern API
    const decipher = crypto.createDecipheriv(
      encryptionConfig.algorithm,
      key,
      iv
    ) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);
    decipher.setAAD(salt);

    // Decrypt data
    let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    throw new Error('Decryption failed - invalid password or corrupted data');
  }
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Hash password using bcrypt-compatible method
 */
export async function hashPassword(password: string, _saltRounds: number = 12): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');

  // Format: $pbkdf2$rounds$salt$hash (bcrypt-like format)
  return `$pbkdf2$${_saltRounds}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split('$');
    if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
      return false;
    }

    const salt = Buffer.from(parts[3], 'base64');
    const storedHash = Buffer.from(parts[4], 'base64');

    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');

    return crypto.timingSafeEqual(storedHash, computedHash);
  } catch {
    return false;
  }
}

/**
 * Generate HMAC signature for data integrity
 */
export function generateHmac(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHmac(data: string, signature: string, secret: string): boolean {
  const expectedSignature = generateHmac(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
