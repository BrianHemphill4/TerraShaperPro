// Simple console logger for now
 
const logger = {
  // eslint-disable-next-line no-console
  debug: (message: string, data?: any) => console.debug(message, data),
  // eslint-disable-next-line no-console
  info: (message: string, data?: any) => console.info(message, data),
   
  warn: (message: string, data?: any) => console.warn(message, data),
   
  error: (message: string, data?: any) => console.error(message, data),
};

export type RetryOptions = {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  shouldRetry?: (error: Error) => boolean;
};

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  shouldRetry: (error) => {
    // Retry on network errors and specific status codes
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('429') || // Rate limit
      message.includes('500') || // Server error
      message.includes('502') || // Bad gateway
      message.includes('503') || // Service unavailable
      message.includes('504') // Gateway timeout
    );
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === opts.maxAttempts || !opts.shouldRetry!(lastError)) {
        throw lastError;
      }

      logger.debug('Retry attempt failed', {
        attempt,
        maxAttempts: opts.maxAttempts,
        error: lastError.message,
        nextDelay: delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));

      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw new Error(`All retry attempts failed: ${lastError!.message}`);
}
