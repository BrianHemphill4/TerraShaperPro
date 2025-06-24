/**
 * Encryption configuration using industry-standard algorithms
 */
export declare const encryptionConfig: {
    algorithm: string;
    keyDerivation: string;
    iterations: number;
    keyLength: number;
    saltLength: number;
    tagLength: number;
};
export type EncryptedData = {
    encrypted: string;
    salt: string;
    tag: string;
    iv: string;
};
/**
 * Encrypt data using AES-256-GCM
 */
export declare function encrypt(data: string, password: string): EncryptedData;
/**
 * Decrypt data using AES-256-GCM
 */
export declare function decrypt(encryptedData: EncryptedData, password: string): string;
/**
 * Generate cryptographically secure random string
 */
export declare function generateSecureToken(length?: number): string;
/**
 * Hash password using bcrypt-compatible method
 */
export declare function hashPassword(password: string, _saltRounds?: number): Promise<string>;
/**
 * Verify password against hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate HMAC signature for data integrity
 */
export declare function generateHmac(data: string, secret: string): string;
/**
 * Verify HMAC signature
 */
export declare function verifyHmac(data: string, signature: string, secret: string): boolean;
