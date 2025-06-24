import { createServiceLogger } from '@terrashaper/shared';

// Create web-specific logger instance
export const logger = createServiceLogger('web');

// Browser-safe logger that only logs in development
export const browserLogger = {
  trace: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      logger.trace(message, data);
    }
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, data);
    }
  },
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info(message, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    logger.warn(message, data);
  },
  error: (message: string, error?: Error | unknown, data?: unknown) => {
    logger.error(message, error, data);
  },
};
