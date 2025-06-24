"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordPolicy = exports.apiKeyConfig = exports.sessionConfig = void 0;
exports.validatePassword = validatePassword;
exports.generateApiKey = generateApiKey;
exports.isValidApiKeyFormat = isValidApiKeyFormat;
/**
 * Session configuration for secure user sessions
 */
exports.sessionConfig = {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        path: '/',
    },
};
/**
 * API Key configuration for service authentication
 */
exports.apiKeyConfig = {
    header: 'X-API-Key',
    prefix: 'tsp_',
    length: 32,
    expirationDays: 90,
};
/**
 * Password policy configuration
 */
exports.passwordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxConsecutiveChars: 3,
    preventCommonPasswords: true,
    preventUserInfoInPassword: true,
    passwordHistoryCount: 5,
    maxAge: 90, // days
};
/**
 * Validate password against policy
 */
function validatePassword(password, userInfo) {
    const errors = [];
    // Check minimum length
    if (password.length < exports.passwordPolicy.minLength) {
        errors.push(`Password must be at least ${exports.passwordPolicy.minLength} characters long`);
    }
    // Check for uppercase letters
    if (exports.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    // Check for lowercase letters
    if (exports.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    // Check for numbers
    if (exports.passwordPolicy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    // Check for special characters
    if (exports.passwordPolicy.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    // Check for consecutive characters
    if (exports.passwordPolicy.maxConsecutiveChars > 0) {
        const consecutivePattern = new RegExp(`(.)\\1{${exports.passwordPolicy.maxConsecutiveChars},}`);
        if (consecutivePattern.test(password)) {
            errors.push(`Password cannot contain more than ${exports.passwordPolicy.maxConsecutiveChars} consecutive identical characters`);
        }
    }
    // Check against user information
    if (exports.passwordPolicy.preventUserInfoInPassword && userInfo) {
        const lowerPassword = password.toLowerCase();
        if (userInfo.name && lowerPassword.includes(userInfo.name.toLowerCase())) {
            errors.push('Password cannot contain your name');
        }
        if (userInfo.email) {
            const emailParts = userInfo.email.toLowerCase().split('@');
            if (emailParts[0] && lowerPassword.includes(emailParts[0])) {
                errors.push('Password cannot contain your email username');
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Generate secure API key
 */
function generateApiKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < exports.apiKeyConfig.length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${exports.apiKeyConfig.prefix}${result}`;
}
/**
 * Validate API key format
 */
function isValidApiKeyFormat(apiKey) {
    const expectedLength = exports.apiKeyConfig.prefix.length + exports.apiKeyConfig.length;
    return (apiKey.length === expectedLength &&
        apiKey.startsWith(exports.apiKeyConfig.prefix) &&
        /^[A-Z0-9]+$/i.test(apiKey.slice(exports.apiKeyConfig.prefix.length)));
}
