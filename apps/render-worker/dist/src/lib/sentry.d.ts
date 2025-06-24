import * as Sentry from '@sentry/node';
export declare function initSentry(): void;
export declare function captureException(error: Error, context?: Record<string, any>): void;
export declare function captureMessage(message: string, level?: Sentry.SeverityLevel): void;
export declare function setJobContext(jobId: string, jobData: any): void;
export declare function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void;
export declare function startTransaction(name: string, op: string): void;
export declare function withSentry<T extends (...args: any[]) => any>(fn: T, options?: {
    name?: string;
    op?: string;
}): T;
