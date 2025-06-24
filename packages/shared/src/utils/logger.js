"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
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
        return (0, pino_1.default)({
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
    return (0, pino_1.default)(baseOptions);
};
class Logger {
    logger;
    context = {};
    constructor(options = {}) {
        this.logger = createLogger(options);
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    clearContext() {
        this.context = {};
    }
    child(bindings) {
        const childLogger = new Logger();
        childLogger.logger = this.logger.child(bindings);
        childLogger.context = { ...this.context };
        return childLogger;
    }
    trace(message, data) {
        this.logger.trace({ ...this.context, ...data }, message);
    }
    debug(message, data) {
        this.logger.debug({ ...this.context, ...data }, message);
    }
    info(message, data) {
        this.logger.info({ ...this.context, ...data }, message);
    }
    warn(message, data) {
        this.logger.warn({ ...this.context, ...data }, message);
    }
    error(message, error, data) {
        const errorData = error instanceof Error
            ? {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                ...(data || {}),
            }
            : { error, ...(data || {}) };
        this.logger.error({ ...this.context, ...errorData }, message);
    }
    fatal(message, error, data) {
        const errorData = error instanceof Error
            ? {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                ...(data || {}),
            }
            : { error, ...(data || {}) };
        this.logger.fatal({ ...this.context, ...errorData }, message);
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
exports.logger = new Logger();
// Factory function for creating service-specific loggers
const createServiceLogger = (serviceName) => {
    return new Logger({ service: serviceName });
};
exports.createServiceLogger = createServiceLogger;
