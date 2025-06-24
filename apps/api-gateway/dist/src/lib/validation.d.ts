import { Buffer } from 'node:buffer';
import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    page?: number | undefined;
}>;
export declare const filePathSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const urlSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const emailSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const phoneSchema: z.ZodString;
export declare function sanitizeHtml(dirty: string): string;
export declare function sanitizeJson<T extends object>(obj: T): T;
export declare const fileUploadSchema: z.ZodObject<{
    filename: z.ZodString;
    mimetype: z.ZodEnum<["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf", "application/json", "text/csv"]>;
    size: z.ZodNumber;
    buffer: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
}, "strip", z.ZodTypeAny, {
    size: number;
    filename: string;
    mimetype: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml" | "application/pdf" | "application/json" | "text/csv";
    buffer?: Buffer<ArrayBufferLike> | undefined;
}, {
    size: number;
    filename: string;
    mimetype: "image/jpeg" | "image/png" | "image/webp" | "image/svg+xml" | "application/pdf" | "application/json" | "text/csv";
    buffer?: Buffer<ArrayBufferLike> | undefined;
}>;
export declare function escapeSqlIdentifier(identifier: string): string;
export declare function validateSortParams(sortBy: string | undefined, allowedFields: string[]): string | undefined;
export declare function getEnvVar(name: string, required?: boolean): string;
export declare function validateWebhookSignature(payload: string, signature: string, secret: string): boolean;
export declare function isValidIpAddress(ip: string): boolean;
export declare function createSafeError(error: unknown): string;
