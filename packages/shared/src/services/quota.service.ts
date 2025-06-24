import { db, organizations, eq } from '@terrashaper/db';

export interface QuotaStatus {
  remaining: number;
  total: number;
  used: number;
  refreshDate: Date | null;
}

export class QuotaService {
  /**
   * Check current quota status for an organization
   */
  async checkQuota(organizationId: string): Promise<QuotaStatus> {
    const [org] = await db
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
  }

  /**
   * Consume quota for an organization
   */
  async consumeQuota(organizationId: string, amount: number = 1): Promise<boolean> {
    await this.refreshQuotaIfNeeded(organizationId);

    const quota = await this.checkQuota(organizationId);
    if (quota.remaining < amount) {
      return false;
    }

    await db
      .update(organizations)
      .set({
        renderQuotaUsed: quota.used + amount,
      })
      .where(eq(organizations.id, organizationId));

    return true;
  }

  /**
   * Check if quota needs refresh (monthly) and reset if needed
   */
  async refreshQuotaIfNeeded(organizationId: string): Promise<void> {
    const [org] = await db
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
    const needsRefresh =
      !refreshDate ||
      now.getTime() > refreshDate.getTime();

    if (needsRefresh) {
      const nextRefresh = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await db
        .update(organizations)
        .set({
          renderQuotaUsed: 0,
          quotaRefreshDate: nextRefresh.toISOString().split('T')[0],
        })
        .where(eq(organizations.id, organizationId));
    }
  }

  /**
   * Set quota limit for an organization
   */
  async setQuotaLimit(organizationId: string, newLimit: number): Promise<void> {
    await db
      .update(organizations)
      .set({
        renderQuota: newLimit,
      })
      .where(eq(organizations.id, organizationId));
  }
}

export const quotaService = new QuotaService();