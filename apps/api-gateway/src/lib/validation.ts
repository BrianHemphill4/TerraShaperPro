import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { TRPCError } from '@trpc/server';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const filePathSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-_/. ]+$/, 'Invalid file path')
  .refine(
    (path) => !path.includes('..') && !path.includes('~'),
    'Path traversal detected'
  );

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'Only HTTP(S) URLs are allowed'
  );

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .transform((email) => email.trim());

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// Sanitize HTML content
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

// Sanitize JSON to prevent prototype pollution
export function sanitizeJson<T extends object>(obj: T): T {
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  
  function clean(item: any): any {
    if (item && typeof item === 'object') {
      if (Array.isArray(item)) {
        return item.map(clean);
      }
      
      const cleaned: any = {};
      for (const key in item) {
        if (item.hasOwnProperty(key) && !dangerous.includes(key)) {
          cleaned[key] = clean(item[key]);
        }
      }
      return cleaned;
    }
    return item;
  }
  
  return clean(obj) as T;
}

// Validate and sanitize file uploads
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .regex(/^[a-zA-Z0-9-_. ]+$/, 'Invalid filename')
    .max(255, 'Filename too long'),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/json',
    'text/csv',
  ]),
  size: z
    .number()
    .positive()
    .max(50 * 1024 * 1024, 'File size must be less than 50MB'),
  buffer: z.instanceof(Buffer).optional(),
});

// SQL injection prevention
export function escapeSqlIdentifier(identifier: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid identifier',
    });
  }
  return `"${identifier}"`;
}

// Validate sorting parameters
export function validateSortParams(
  sortBy: string | undefined,
  allowedFields: string[]
): string | undefined {
  if (!sortBy) return undefined;
  
  if (!allowedFields.includes(sortBy)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
    });
  }
  
  return sortBy;
}

// Create a validated environment variable getter
export function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  return value || '';
}

// Validate webhook signatures
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Time-constant comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

// IP address validation
export function isValidIpAddress(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Create a safe error message (no sensitive data)
export function createSafeError(error: unknown): string {
  if (error instanceof TRPCError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    if (process.env.NODE_ENV === 'production') {
      return 'An unexpected error occurred';
    }
    return error.message;
  }
  
  return 'An unknown error occurred';
}