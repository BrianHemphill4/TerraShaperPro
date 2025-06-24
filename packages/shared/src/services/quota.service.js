var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { db, organizations, eq } from '@terrashaper/db';
export class QuotaService {
    /**
     * Check current quota status for an organization
     */
    checkQuota(organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [org] = yield db
                .select({
                renderQuota: organizations.renderQuota,
                renderQuotaUsed: organizations.renderQuotaUsed,
                quotaRefreshDate: organizations.quotaRefreshDate,
            })
                .from(organizations)
                .where(eq(organizations.id, organizationId));
            if (!org) {
                throw new Error('Organization not found');
            }
            return {
                total: org.renderQuota,
                used: org.renderQuotaUsed,
                remaining: org.renderQuota - org.renderQuotaUsed,
                refreshDate: org.quotaRefreshDate ? new Date(org.quotaRefreshDate) : null,
            };
        });
    }
    /**
     * Consume quota for an organization
     */
    consumeQuota(organizationId_1) {
        return __awaiter(this, arguments, void 0, function* (organizationId, amount = 1) {
            yield this.refreshQuotaIfNeeded(organizationId);
            const quota = yield this.checkQuota(organizationId);
            if (quota.remaining < amount) {
                return false;
            }
            yield db
                .update(organizations)
                .set({
                renderQuotaUsed: quota.used + amount,
            })
                .where(eq(organizations.id, organizationId));
            return true;
        });
    }
    /**
     * Check if quota needs refresh (monthly) and reset if needed
     */
    refreshQuotaIfNeeded(organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [org] = yield db
                .select({
                quotaRefreshDate: organizations.quotaRefreshDate,
            })
                .from(organizations)
                .where(eq(organizations.id, organizationId));
            if (!org) {
                throw new Error('Organization not found');
            }
            const now = new Date();
            const refreshDate = org.quotaRefreshDate ? new Date(org.quotaRefreshDate) : null;
            const needsRefresh = !refreshDate ||
                now.getTime() > refreshDate.getTime();
            if (needsRefresh) {
                const nextRefresh = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                yield db
                    .update(organizations)
                    .set({
                    renderQuotaUsed: 0,
                    quotaRefreshDate: nextRefresh.toISOString().split('T')[0],
                })
                    .where(eq(organizations.id, organizationId));
            }
        });
    }
    /**
     * Set quota limit for an organization
     */
    setQuotaLimit(organizationId, newLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db
                .update(organizations)
                .set({
                renderQuota: newLimit,
            })
                .where(eq(organizations.id, organizationId));
        });
    }
}
export const quotaService = new QuotaService();
