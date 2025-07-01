"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditService = void 0;
const db_1 = require("@terrashaper/db");
/**
 * Service responsible for credit management and billing operations
 */
class CreditService {
    constructor() {
        this.supabase = (0, db_1.createWorkerClient)();
    }
    /**
     * Calculate credit cost based on render settings
     */
    calculateCreditCost(settings) {
        let cost = 1; // Base cost
        // Higher resolution costs more
        const [width, height] = settings.resolution.split('x').map(Number);
        const pixels = width * height;
        if (pixels > 1024 * 1024) {
            cost += 1; // 2 credits for > 1MP
        }
        if (pixels > 2048 * 2048) {
            cost += 2; // 4 credits for > 4MP
        }
        // Ultra quality costs extra
        if (settings.quality && settings.quality > 75) {
            cost += 1;
        }
        return cost;
    }
    /**
     * Consume credits for a render operation
     */
    async consumeCredits(organizationId, userId, renderId, settings) {
        const creditCost = this.calculateCreditCost(settings);
        const { data: consumeResult, error: consumeError } = await this.supabase.rpc('consume_credits', {
            p_organization_id: organizationId,
            p_user_id: userId,
            p_render_id: renderId,
            p_amount: creditCost,
            p_description: `Render: ${settings.resolution} @ ${settings.quality || 'high'} quality`,
        });
        if (consumeError || !consumeResult) {
            throw new Error('Insufficient credits');
        }
        return true;
    }
    /**
     * Refund credits when render fails
     */
    async refundCredits(organizationId, userId, renderId, settings, reason) {
        const creditCost = this.calculateCreditCost(settings);
        await this.supabase.rpc('refund_credits', {
            p_organization_id: organizationId,
            p_user_id: userId,
            p_render_id: renderId,
            p_amount: creditCost,
            p_reason: reason,
        });
    }
    /**
     * Record usage for billing tracking
     */
    async recordUsage(organizationId, renderId, projectId, settings) {
        const creditCost = this.calculateCreditCost(settings);
        await this.supabase.from('usage_records').insert({
            organization_id: organizationId,
            record_type: 'render',
            quantity: 1,
            unit_amount: creditCost,
            total_amount: creditCost,
            description: `Render completed: ${settings.resolution} @ ${settings.quality || 'high'} quality`,
            metadata: {
                render_id: renderId,
                project_id: projectId,
                resolution: settings.resolution,
                quality: settings.quality,
                format: settings.format,
                provider: settings.provider,
            },
        });
    }
}
exports.CreditService = CreditService;
