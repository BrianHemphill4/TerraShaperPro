import type { Buffer } from 'node:buffer';
import { createHash, randomBytes } from 'node:crypto';

import { z } from 'zod';

// OWASP-compliant password policy
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Z0-9]/i, 'Password must contain at least one special character');

// Input validation schemas
export const sanitizedStringSchema = z
  .string()
  .trim()
  .regex(/^[^<>'"&]*$/, 'Invalid characters detected');

export const fileUploadSchema = z.object({
  name: z.string().regex(/^[\w\-. ]+$/, 'Invalid filename'),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Validate CSRF token
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  return token === sessionToken;
}

// Hash sensitive data
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || process.env.HASH_SALT || 'default-salt';
  return createHash('sha256')
    .update(data + actualSalt)
    .digest('hex');
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];

    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }

    // Remove any potential XSS vectors from URL
    parsed.search = parsed.search.replace(/[<>'"]/g, '');
    parsed.hash = parsed.hash.replace(/[<>'"]/g, '');

    return parsed.toString();
  } catch {
    return null;
  }
}

// Rate limiting helper
type RateLimitEntry = {
  count: number;
  resetTime: number;
};

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const renderRateLimiter = new RateLimiter(10, 60 * 1000); // 10 renders per minute

// Cleanup rate limiters periodically
setInterval(() => {
  apiRateLimiter.cleanup();
  authRateLimiter.cleanup();
  renderRateLimiter.cleanup();
}, 60 * 1000);

// Security headers for API responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  };
}

// Validate file type by magic bytes
export async function validateFileType(buffer: Buffer, expectedType: string): Promise<boolean> {
  const magicBytes: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/webp': [
      [0x52, 0x49, 0x46, 0x46],
      [0x57, 0x45, 0x42, 0x50],
    ],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  };

  const signatures = magicBytes[expectedType];
  if (!signatures) return false;

  return signatures.every((signature, index) => {
    if (index === 0) {
      return signature.every((byte, i) => buffer[i] === byte);
    }
    // For formats like WebP that have multiple signatures
    const offset = index === 1 ? 8 : 0;
    return signature.every((byte, i) => buffer[offset + i] === byte);
  });
}

// Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

// Time-constant string comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
