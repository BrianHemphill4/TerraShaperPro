import { Buffer } from 'node:buffer';
import path from 'node:path';

/**
 * File upload configuration and limits
 */
export const fileUploadConfig = {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10, // Max 10 files per request
    fields: 50, // Max 50 fields
    headerPairs: 100, // Max 100 header pairs
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp',
  preserveExtension: true,
  safeFileNames: true,
  stripBasename: {
    errorOnNull: true,
    maintainCase: false,
  },
};

/**
 * Allowed file types and their MIME types
 */
export const allowedFileTypes = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  documents: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  data: {
    extensions: ['.json', '.csv'],
    mimeTypes: ['application/json', 'text/csv'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

export type FileValidationResult = {
  isValid: boolean;
  error?: string;
  fileType?: keyof typeof allowedFileTypes;
};

/**
 * Validate file type and size
 */
export function validateFile(
  filename: string,
  mimeType: string,
  fileSize: number
): FileValidationResult {
  const extension = path.extname(filename).toLowerCase();

  // Find matching file type category
  for (const [category, config] of Object.entries(allowedFileTypes)) {
    if (config.extensions.includes(extension) && config.mimeTypes.includes(mimeType)) {
      if (fileSize > config.maxSize) {
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB for ${category}`,
        };
      }

      return {
        isValid: true,
        fileType: category as keyof typeof allowedFileTypes,
      };
    }
  }

  return {
    isValid: false,
    error: `File type not allowed. Extension: ${extension}, MIME type: ${mimeType}`,
  };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[^\w\-.]/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Generate secure filename with timestamp
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = path.extname(originalFilename);
  const basename = path.basename(originalFilename, extension);
  const sanitizedBasename = sanitizeFilename(basename);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${sanitizedBasename}_${timestamp}_${randomSuffix}${extension}`;
}

/**
 * Check if file is potentially malicious
 */
export function checkForMaliciousFile(filename: string, fileBuffer: Buffer): boolean {
  // Check for executable file extensions
  const executableExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar'];
  const extension = path.extname(filename).toLowerCase();

  if (executableExtensions.includes(extension)) {
    return true;
  }

  // Check for suspicious file headers (magic numbers)
  const suspiciousHeaders = [
    [0x4d, 0x5a], // DOS/Windows executable (MZ)
    [0x7f, 0x45, 0x4c, 0x46], // ELF executable
    [0xca, 0xfe, 0xba, 0xbe], // Java class file
  ];

  for (const header of suspiciousHeaders) {
    if (fileBuffer.subarray(0, header.length).equals(Buffer.from(header))) {
      return true;
    }
  }

  return false;
}
