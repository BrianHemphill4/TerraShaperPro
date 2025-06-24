import { Buffer } from 'node:buffer';
/**
 * File upload configuration and limits
 */
export declare const fileUploadConfig: {
    limits: {
        fileSize: number;
        files: number;
        fields: number;
        headerPairs: number;
    };
    abortOnLimit: boolean;
    useTempFiles: boolean;
    tempFileDir: string;
    preserveExtension: boolean;
    safeFileNames: boolean;
    stripBasename: {
        errorOnNull: boolean;
        maintainCase: boolean;
    };
};
/**
 * Allowed file types and their MIME types
 */
export declare const allowedFileTypes: {
    images: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
    documents: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
    data: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
};
export type FileValidationResult = {
    isValid: boolean;
    error?: string;
    fileType?: keyof typeof allowedFileTypes;
};
/**
 * Validate file type and size
 */
export declare function validateFile(filename: string, mimeType: string, fileSize: number): FileValidationResult;
/**
 * Sanitize filename for safe storage
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Generate secure filename with timestamp
 */
export declare function generateSecureFilename(originalFilename: string): string;
/**
 * Check if file is potentially malicious
 */
export declare function checkForMaliciousFile(filename: string, fileBuffer: Buffer): boolean;
