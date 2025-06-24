"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadSchema = exports.phoneSchema = exports.emailSchema = exports.urlSchema = exports.filePathSchema = exports.paginationSchema = exports.uuidSchema = void 0;
exports.sanitizeHtml = sanitizeHtml;
exports.sanitizeJson = sanitizeJson;
exports.escapeSqlIdentifier = escapeSqlIdentifier;
exports.validateSortParams = validateSortParams;
exports.getEnvVar = getEnvVar;
exports.validateWebhookSignature = validateWebhookSignature;
exports.isValidIpAddress = isValidIpAddress;
exports.createSafeError = createSafeError;
const node_buffer_1 = require("node:buffer");
const node_crypto_1 = __importDefault(require("node:crypto"));
const server_1 = require("@trpc/server");
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const zod_1 = require("zod");
// Common validation schemas
exports.uuidSchema = zod_1.z.string().uuid('Invalid ID format');
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
exports.filePathSchema = zod_1.z
    .string()
    .regex(/^[\w\-/. ]+$/, 'Invalid file path')
    .refine((path) => !path.includes('..') && !path.includes('~'), 'Path traversal detected');
exports.urlSchema = zod_1.z
    .string()
    .url('Invalid URL')
    .refine((url) => {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    }
    catch {
        return false;
    }
}, 'Only HTTP(S) URLs are allowed');
exports.emailSchema = zod_1.z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .transform((email) => email.trim());
exports.phoneSchema = zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
// Sanitize HTML content
function sanitizeHtml(dirty) {
    return isomorphic_dompurify_1.default.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    });
}
// Sanitize JSON to prevent prototype pollution
function sanitizeJson(obj) {
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    function clean(item) {
        if (item && typeof item === 'object') {
            if (Array.isArray(item)) {
                return item.map(clean);
            }
            const cleaned = {};
            for (const key in item) {
                if (Object.prototype.hasOwnProperty.call(item, key) && !dangerous.includes(key)) {
                    cleaned[key] = clean(item[key]);
                }
            }
            return cleaned;
        }
        return item;
    }
    return clean(obj);
}
// Validate and sanitize file uploads
exports.fileUploadSchema = zod_1.z.object({
    filename: zod_1.z
        .string()
        .regex(/^[\w-. ]+$/, 'Invalid filename')
        .max(255, 'Filename too long'),
    mimetype: zod_1.z.enum([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/json',
        'text/csv',
    ]),
    size: zod_1.z
        .number()
        .positive()
        .max(50 * 1024 * 1024, 'File size must be less than 50MB'),
    buffer: zod_1.z.instanceof(node_buffer_1.Buffer).optional(),
});
// SQL injection prevention
function escapeSqlIdentifier(identifier) {
    if (!/^[a-z_]\w*$/i.test(identifier)) {
        throw new server_1.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid identifier',
        });
    }
    return `"${identifier}"`;
}
// Validate sorting parameters
function validateSortParams(sortBy, allowedFields) {
    if (!sortBy)
        return undefined;
    if (!allowedFields.includes(sortBy)) {
        throw new server_1.TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
        });
    }
    return sortBy;
}
// Create a validated environment variable getter
function getEnvVar(name, required = true) {
    const value = process.env[name];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || '';
}
// Validate webhook signatures
function validateWebhookSignature(payload, signature, secret) {
    const expectedSignature = node_crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
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
function isValidIpAddress(ip) {
    // IPv4
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
    // IPv6
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
// Create a safe error message (no sensitive data)
function createSafeError(error) {
    if (error instanceof server_1.TRPCError) {
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
