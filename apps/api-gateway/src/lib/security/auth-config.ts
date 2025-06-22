/**
 * Session configuration for secure user sessions
 */
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    path: '/',
  },
};

/**
 * API Key configuration for service authentication
 */
export const apiKeyConfig = {
  header: 'X-API-Key',
  prefix: 'tsp_',
  length: 32,
  expirationDays: 90,
};

/**
 * Password policy configuration
 */
export const passwordPolicy = {
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
export function validatePassword(
  password: string,
  userInfo?: { name?: string; email?: string }
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  }

  // Check for uppercase letters
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for consecutive characters
  if (passwordPolicy.maxConsecutiveChars > 0) {
    const consecutivePattern = new RegExp(`(.)\\1{${passwordPolicy.maxConsecutiveChars},}`);
    if (consecutivePattern.test(password)) {
      errors.push(
        `Password cannot contain more than ${passwordPolicy.maxConsecutiveChars} consecutive identical characters`
      );
    }
  }

  // Check against user information
  if (passwordPolicy.preventUserInfoInPassword && userInfo) {
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
export function generateApiKey(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < apiKeyConfig.length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `${apiKeyConfig.prefix}${result}`;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  const expectedLength = apiKeyConfig.prefix.length + apiKeyConfig.length;

  return (
    apiKey.length === expectedLength &&
    apiKey.startsWith(apiKeyConfig.prefix) &&
    /^[A-Z0-9]+$/i.test(apiKey.slice(apiKeyConfig.prefix.length))
  );
}
