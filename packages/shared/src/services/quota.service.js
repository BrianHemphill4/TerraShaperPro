"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotaService = exports.QuotaService = void 0;
const db_1 = require("@terrasherper/db");
class QuotaService {
    /**
     * Check current quota status for an organization
     */
    async checkQuota(organizationId) {
        const [org] = await db_1.db
            .select({
            renderQuota: db_1.organizations.renderQuota,
            renderQuotaUsed: db_1.organizations.renderQuotaUsed,
            quotaRefreshDate: db_1.organizations.quotaRefreshDate,
        })
            .from(db_1.organizations)
            .where((0, db_1.eq)(db_1.organizations.id, organizationId));
        if (!org) {
            throw new Error('Organization not found');
        }
        return {
            total: org.renderQuota,
            used: org.renderQuotaUsed,
            remaining: org.renderQuota - org.renderQuotaUsed,
            refreshDate: org.quotaRefreshDate ? new Date(org.quotaRefreshDate) : null,
        };
    }
    /**
     * Consume quota for an organization
     */
    async consumeQuota(organizationId, amount = 1) {
        await this.refreshQuotaIfNeeded(organizationId);
        const quota = await this.checkQuota(organizationId);
        if (quota.remaining < amount) {
            return false;
        }
        await db_1.db
            .update(db_1.organizations)
            .set({
            renderQuotaUsed: quota.used + amount,
        })
            .where((0, db_1.eq)(db_1.organizations.id, organizationId));
        return true;
    }
    /**
     * Check if quota needs refresh (monthly) and reset if needed
     */
    async refreshQuotaIfNeeded(organizationId) {
        const [org] = await db_1.db
            .select({
            quotaRefreshDate: db_1.organizations.quotaRefreshDate,
        })
            .from(db_1.organizations)
            .where((0, db_1.eq)(db_1.organizations.id, organizationId));
        if (!org) {
            throw new Error('Organization not found');
        }
        const now = new Date();
        const refreshDate = org.quotaRefreshDate ? new Date(org.quotaRefreshDate) : null;
        const needsRefresh = !refreshDate ||
            now.getTime() > refreshDate.getTime();
        if (needsRefresh) {
            const nextRefresh = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            await db_1.db
                .update(db_1.organizations)
                .set({
                renderQuotaUsed: 0,
                quotaRefreshDate: nextRefresh.toISOString().split('T')[0],
            })
                .where((0, db_1.eq)(db_1.organizations.id, organizationId));
        }
    }
    /**
     * Set quota limit for an organization
     */
    async setQuotaLimit(organizationId, newLimit) {
        await db_1.db
            .update(db_1.organizations)
            .set({
            renderQuota: newLimit,
        })
            .where((0, db_1.eq)(db_1.organizations.id, organizationId));
    }
}
exports.QuotaService = QuotaService;
exports.quotaService = new QuotaService();
