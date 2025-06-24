// Simple console logger for now
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger = {
    // eslint-disable-next-line no-console
    debug: (message, data) => console.debug(message, data),
    // eslint-disable-next-line no-console
    info: (message, data) => console.info(message, data),
    warn: (message, data) => console.warn(message, data),
    error: (message, data) => console.error(message, data),
};
const defaultOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
        // Retry on network errors and specific status codes
        const message = error.message.toLowerCase();
        return (message.includes('network') ||
            message.includes('timeout') ||
            message.includes('429') || // Rate limit
            message.includes('500') || // Server error
            message.includes('502') || // Bad gateway
            message.includes('503') || // Service unavailable
            message.includes('504') // Gateway timeout
        );
    },
};
export function withRetry(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, options = {}) {
        const opts = Object.assign(Object.assign({}, defaultOptions), options);
        let lastError;
        let delay = opts.initialDelay;
        for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
            try {
                return yield fn();
            }
            catch (error) {
                lastError = error;
                if (attempt === opts.maxAttempts || !opts.shouldRetry(lastError)) {
                    throw lastError;
                }
                logger.debug('Retry attempt failed', {
                    attempt,
                    maxAttempts: opts.maxAttempts,
                    error: lastError.message,
                    nextDelay: delay,
                });
                yield new Promise((resolve) => setTimeout(resolve, delay));
                delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
            }
        }
        throw new Error(`All retry attempts failed: ${lastError.message}`);
    });
}
