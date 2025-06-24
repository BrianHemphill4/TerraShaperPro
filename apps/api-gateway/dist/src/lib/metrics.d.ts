export type MetricData = {
    name: string;
    value: number;
    unit: string;
    tags?: Record<string, string>;
};
export type PerformanceBudget = {
    metric: string;
    budget: number;
    unit: string;
    threshold?: 'error' | 'warning';
};
export declare class ApiMetrics {
    private static instance;
    private budgets;
    private metricsBuffer;
    private flushInterval;
    private constructor();
    static getInstance(): ApiMetrics;
    private initializeDefaultBudgets;
    setBudget(metric: string, budget: number, unit: string, threshold?: 'error' | 'warning'): void;
    recordMetric(metric: MetricData): void;
    private handleBudgetViolation;
    private flushMetrics;
    recordTrpcCall(procedure: string, duration: number, success: boolean, metadata?: Record<string, string>): void;
    recordDatabaseQuery(operation: string, table: string, duration: number, rowCount?: number): void;
    recordExternalCall(service: string, operation: string, duration: number, success: boolean): void;
    recordQueueOperation(operation: string, queue: string, duration: number, metadata?: Record<string, string>): void;
    recordCustom(name: string, value: number, unit?: string, tags?: Record<string, string>): void;
    destroy(): void;
}
export declare const apiMetrics: ApiMetrics;
