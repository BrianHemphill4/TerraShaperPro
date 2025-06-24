export type RetryOptions = {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    shouldRetry?: (error: Error) => boolean;
};
export declare function withRetry<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
//# sourceMappingURL=retry.d.ts.map