export type FailurePattern = {
    type: 'timeout' | 'quality' | 'api_error' | 'invalid_prompt' | 'resource_limit';
    count: number;
    timeframe: number;
    threshold: number;
};
export type FailureAlert = {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: Record<string, any>;
    createdAt: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
};
export declare class FailureDetectionService {
    private supabase;
    private patterns;
    private alertCallbacks;
    constructor();
    checkForFailurePatterns(): Promise<FailureAlert[]>;
    private checkPattern;
    private categorizeApiErrors;
    private createAlert;
    private mapSeverityToSentryLevel;
    onAlert(callback: (alert: FailureAlert) => void): void;
    acknowledgeAlert(alertId: string, userId: string): Promise<void>;
    getActiveAlerts(): Promise<FailureAlert[]>;
    getAlertHistory(days?: number): Promise<FailureAlert[]>;
    healthCheck(): Promise<{
        healthy: boolean;
        recentFailureRate: number;
        activeAlerts: number;
    }>;
}
//# sourceMappingURL=failure-detection.service.d.ts.map