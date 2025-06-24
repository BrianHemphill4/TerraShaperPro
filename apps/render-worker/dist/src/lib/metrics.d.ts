export type JobMetrics = {
    jobId: string;
    jobType: string;
    duration: number;
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
};
export declare class WorkerMetrics {
    private static instance;
    private metricsBuffer;
    private flushInterval;
    private constructor();
    static getInstance(): WorkerMetrics;
    recordJobStart(jobId: string, jobType: string): void;
    recordJobComplete(metrics: JobMetrics): void;
    private checkPerformance;
    recordQueueMetrics(queueName: string, size: number, waiting: number, active: number): void;
    recordMemoryUsage(): void;
    recordCpuUsage(): void;
    private flushMetrics;
    destroy(): void;
}
export declare const workerMetrics: WorkerMetrics;
