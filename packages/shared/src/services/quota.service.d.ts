export interface QuotaStatus {
    remaining: number;
    total: number;
    used: number;
    refreshDate: Date | null;
}
export declare class QuotaService {
    /**
     * Check current quota status for an organization
     */
    checkQuota(organizationId: string): Promise<QuotaStatus>;
    /**
     * Consume quota for an organization
     */
    consumeQuota(organizationId: string, amount?: number): Promise<boolean>;
    /**
     * Check if quota needs refresh (monthly) and reset if needed
     */
    refreshQuotaIfNeeded(organizationId: string): Promise<void>;
    /**
     * Set quota limit for an organization
     */
    setQuotaLimit(organizationId: string, newLimit: number): Promise<void>;
}
export declare const quotaService: QuotaService;
