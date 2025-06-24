import pino from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerOptions {
  level?: LogLevel;
  service?: string;
  environment?: string;
}

export interface LogContext {
  userId?: string;
  organizationId?: string;
  projectId?: string;
  requestId?: string;
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const createLogger = (options: LoggerOptions = {}): pino.Logger => {
  const {
    level = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    service = process.env.SERVICE_NAME || 'terrashaper',
    environment = process.env.NODE_ENV || 'development',
  } = options;

  const baseOptions: pino.LoggerOptions = {
    level,
    base: {
      service,
      environment,
      pid: process.pid,
    },
  };

  if (isDevelopment && !isTest) {
    return pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino(baseOptions);
};

class Logger {
  private logger: pino.Logger;
  private context: LogContext = {};

  constructor(options: LoggerOptions = {}) {
    this.logger = createLogger(options);
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  child(bindings: pino.Bindings): Logger {
    const childLogger = new Logger();
    childLogger.logger = this.logger.child(bindings);
    childLogger.context = { ...this.context };
    return childLogger;
  }

  trace(message: string, data?: unknown): void {
    this.logger.trace({ ...this.context, ...data }, message);
  }

  debug(message: string, data?: unknown): void {
    this.logger.debug({ ...this.context, ...data }, message);
  }

  info(message: string, data?: unknown): void {
    this.logger.info({ ...this.context, ...data }, message);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn({ ...this.context, ...data }, message);
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    const errorData =
      error instanceof Error
        ? {
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            ...data,
          }
        : { error, ...data };

    this.logger.error({ ...this.context, ...errorData }, message);
  }

  fatal(message: string, error?: Error | unknown, data?: unknown): void {
    const errorData =
      error instanceof Error
        ? {
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            ...data,
          }
        : { error, ...data };

    this.logger.fatal({ ...this.context, ...errorData }, message);
  }

  // Performance logging
  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.info(`${label} completed`, { duration, label });
    };
  }

  // Metric logging
  metric(name: string, value: number, unit?: string, tags?: Record<string, string>): void {
    this.info('Metric recorded', {
      metric: {
        name,
        value,
        unit,
        tags,
      },
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Factory function for creating service-specific loggers
export const createServiceLogger = (serviceName: string): Logger => {
  return new Logger({ service: serviceName });
};

// Re-export pino types for convenience
export type { Logger as PinoLogger } from 'pino';
