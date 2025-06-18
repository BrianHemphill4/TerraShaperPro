import { captureMessage } from './sentry';

export type Logger = {
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, error?: Error | any, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
};

class SimpleLogger implements Logger {
  info(message: string, meta?: any): void {
    const logData = meta ? `${message} ${JSON.stringify(meta)}` : message;
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${logData}`);
    captureMessage(message, 'info');
  }

  warn(message: string, meta?: any): void {
    const logData = meta ? `${message} ${JSON.stringify(meta)}` : message;

    console.warn(`[WARN] ${logData}`);
    captureMessage(message, 'warning');
  }

  error(message: string, error?: Error | any, meta?: any): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const logData = meta ? `${message} ${errorMsg} ${JSON.stringify(meta)}` : `${message} ${errorMsg}`;

    console.error(`[ERROR] ${logData}`);
    captureMessage(message, 'error');
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const logData = meta ? `${message} ${JSON.stringify(meta)}` : message;
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${logData}`);
    }
  }
}

export const logger: Logger = new SimpleLogger();
