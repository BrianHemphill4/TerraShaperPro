/**
 * Session configuration for secure user sessions
 */
export declare const sessionConfig: {
    secret: string;
    cookie: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "strict";
        maxAge: number;
        path: string;
    };
};
/**
 * API Key configuration for service authentication
 */
export declare const apiKeyConfig: {
    header: string;
    prefix: string;
    length: number;
    expirationDays: number;
};
/**
 * Password policy configuration
 */
export declare const passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxConsecutiveChars: number;
    preventCommonPasswords: boolean;
    preventUserInfoInPassword: boolean;
    passwordHistoryCount: number;
    maxAge: number;
};
/**
 * Validate password against policy
 */
export declare function validatePassword(password: string, userInfo?: {
    name?: string;
    email?: string;
}): {
    isValid: boolean;
    errors: string[];
};
/**
 * Generate secure API key
 */
export declare function generateApiKey(): string;
/**
 * Validate API key format
 */
export declare function isValidApiKeyFormat(apiKey: string): boolean;
