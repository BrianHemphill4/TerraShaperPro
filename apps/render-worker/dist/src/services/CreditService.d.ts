/**
 * Service responsible for credit management and billing operations
 */
export declare class CreditService {
    private supabase;
    constructor();
    /**
     * Calculate credit cost based on render settings
     */
    calculateCreditCost(settings: any): number;
    /**
     * Consume credits for a render operation
     */
    consumeCredits(organizationId: string, userId: string, renderId: string, settings: any): Promise<boolean>;
    /**
     * Refund credits when render fails
     */
    refundCredits(organizationId: string, userId: string, renderId: string, settings: any, reason: string): Promise<void>;
    /**
     * Record usage for billing tracking
     */
    recordUsage(organizationId: string, renderId: string, projectId: string, settings: any): Promise<void>;
}
