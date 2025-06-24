export declare const logger: {
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, error?: Error | any, meta?: any) => void;
    debug: (message: string, meta?: any) => void;
    trace: (message: string, meta?: any) => void;
    fatal: (message: string, error?: Error | any, meta?: any) => void;
    time: (label: string) => () => void;
    metric: (name: string, value: number, unit?: string, tags?: Record<string, string>) => void;
};
export type Logger = typeof logger;
