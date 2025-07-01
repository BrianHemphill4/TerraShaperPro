export enum ErrorType {
  CANVAS_RENDER = 'CANVAS_RENDER',
  TOOL_OPERATION = 'TOOL_OPERATION',
  STATE_CORRUPTION = 'STATE_CORRUPTION',
  NETWORK = 'NETWORK',
  FILE_UPLOAD = 'FILE_UPLOAD',
  WEBGL = 'WEBGL',
  MEMORY = 'MEMORY',
  VALIDATION = 'VALIDATION',
  EXPORT = 'EXPORT',
  SYNC = 'SYNC',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  userMessage?: string;
  technicalDetails?: string;
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export class AnnotationError extends Error implements AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  userMessage?: string;
  technicalDetails?: string;
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: Partial<AppError>
  ) {
    super(message);
    this.name = 'AnnotationError';
    this.type = type;
    this.severity = severity;
    this.timestamp = new Date();
    this.recoverable = options?.recoverable ?? true;
    this.code = options?.code;
    this.context = options?.context;
    this.userMessage = options?.userMessage;
    this.technicalDetails = options?.technicalDetails;
    this.retryable = options?.retryable ?? false;
    this.retryCount = options?.retryCount ?? 0;
    this.maxRetries = options?.maxRetries ?? 3;
  }
}

export class CanvasError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.CANVAS_RENDER, ErrorSeverity.HIGH, options);
    this.name = 'CanvasError';
  }
}

export class ToolError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.TOOL_OPERATION, ErrorSeverity.MEDIUM, options);
    this.name = 'ToolError';
  }
}

export class StateError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.STATE_CORRUPTION, ErrorSeverity.CRITICAL, options);
    this.name = 'StateError';
  }
}

export class NetworkError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, {
      ...options,
      retryable: true,
      recoverable: true
    });
    this.name = 'NetworkError';
  }
}

export class FileUploadError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.FILE_UPLOAD, ErrorSeverity.MEDIUM, {
      ...options,
      retryable: true
    });
    this.name = 'FileUploadError';
  }
}

export class WebGLError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.WEBGL, ErrorSeverity.CRITICAL, {
      ...options,
      recoverable: false
    });
    this.name = 'WebGLError';
  }
}

export class MemoryError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.MEMORY, ErrorSeverity.CRITICAL, options);
    this.name = 'MemoryError';
  }
}

export class ValidationError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.LOW, options);
    this.name = 'ValidationError';
  }
}

export class ExportError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.EXPORT, ErrorSeverity.MEDIUM, {
      ...options,
      retryable: true
    });
    this.name = 'ExportError';
  }
}

export class SyncError extends AnnotationError {
  constructor(message: string, options?: Partial<AppError>) {
    super(message, ErrorType.SYNC, ErrorSeverity.MEDIUM, {
      ...options,
      retryable: true
    });
    this.name = 'SyncError';
  }
}

export interface ErrorRecoveryStrategy {
  type: ErrorType;
  execute: (error: AppError) => Promise<boolean>;
  fallback?: () => Promise<void>;
}

export interface ErrorReport {
  error: AppError;
  userAgent: string;
  url: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  additionalContext?: Record<string, any>;
}