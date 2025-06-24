import pino from 'pino';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const createLogger = (options = {}) => {
    const { level = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'), service = process.env.SERVICE_NAME || 'terrashaper', environment = process.env.NODE_ENV || 'development', } = options;
    const baseOptions = {
        level,
        base: {
            service,
            environment,
            pid: process.pid,
        },
    };
    if (isDevelopment && !isTest) {
        return pino(Object.assign(Object.assign({}, baseOptions), { transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                },
            } }));
    }
    return pino(baseOptions);
};
class Logger {
    constructor(options = {}) {
        this.context = {};
        this.logger = createLogger(options);
    }
    setContext(context) {
        this.context = Object.assign(Object.assign({}, this.context), context);
    }
    clearContext() {
        this.context = {};
    }
    child(bindings) {
        const childLogger = new Logger();
        childLogger.logger = this.logger.child(bindings);
        childLogger.context = Object.assign({}, this.context);
        return childLogger;
    }
    trace(message, data) {
        this.logger.trace(Object.assign(Object.assign({}, this.context), data), message);
    }
    debug(message, data) {
        this.logger.debug(Object.assign(Object.assign({}, this.context), data), message);
    }
    info(message, data) {
        this.logger.info(Object.assign(Object.assign({}, this.context), data), message);
    }
    warn(message, data) {
        this.logger.warn(Object.assign(Object.assign({}, this.context), data), message);
    }
    error(message, error, data) {
        const errorData = error instanceof Error
            ? Object.assign({ error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                } }, (data || {})) : Object.assign({ error }, (data || {}));
        this.logger.error(Object.assign(Object.assign({}, this.context), errorData), message);
    }
    fatal(message, error, data) {
        const errorData = error instanceof Error
            ? Object.assign({ error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                } }, (data || {})) : Object.assign({ error }, (data || {}));
        this.logger.fatal(Object.assign(Object.assign({}, this.context), errorData), message);
    }
    // Performance logging
    time(label) {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.info(`${label} completed`, { duration, label });
        };
    }
    // Metric logging
    metric(name, value, unit, tags) {
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
export const createServiceLogger = (serviceName) => {
    return new Logger({ service: serviceName });
};
