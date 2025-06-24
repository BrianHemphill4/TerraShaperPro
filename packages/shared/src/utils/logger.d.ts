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
declare class Logger {
    private logger;
    private context;
    constructor(options?: LoggerOptions);
    setContext(context: LogContext): void;
    clearContext(): void;
    child(bindings: pino.Bindings): Logger;
    trace(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    time(label: string): () => void;
    metric(name: string, value: number, unit?: string, tags?: Record<string, string>): void;
}
export declare const logger: Logger;
export declare const createServiceLogger: (serviceName: string) => Logger;
export type { Logger as PinoLogger } from 'pino';
