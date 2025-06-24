import { createServiceLogger } from '@terrashaper/shared';

import { captureMessage } from './sentry';

// Create render-worker specific logger
const baseLogger = createServiceLogger('render-worker');

// Extend with Sentry integration
export const logger = {
  info: (message: string, meta?: any) => {
    baseLogger.info(message, meta);
    captureMessage(message, 'info');
  },

  warn: (message: string, meta?: any) => {
    baseLogger.warn(message, meta);
    captureMessage(message, 'warning');
  },

  error: (message: string, error?: Error | any, meta?: any) => {
    baseLogger.error(message, error, meta);
    captureMessage(message, 'error');
  },

  debug: (message: string, meta?: any) => {
    baseLogger.debug(message, meta);
  },

  trace: (message: string, meta?: any) => {
    baseLogger.trace(message, meta);
  },

  fatal: (message: string, error?: Error | any, meta?: any) => {
    baseLogger.fatal(message, error, meta);
    captureMessage(message, 'fatal');
  },

  time: (label: string) => baseLogger.time(label),
  metric: (name: string, value: number, unit?: string, tags?: Record<string, string>) =>
    baseLogger.metric(name, value, unit, tags),
};

// Re-export the Logger type for backward compatibility
export type Logger = typeof logger;
