import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';

// Import the router after setup mocks are in place
const { appRouter } = await import('../../router');

describe('Quota Check Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock context following existing test patterns
  const mockContext = {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    user: { 
      id: 'test-user-id',
      organizationId: 'test-org-id'
    },
  };

  describe('billing.checkUsageLimit', () => {
    it('should check render quota successfully', async () => {
      const { quotaService } = await vi.importMock('@terrashaper/shared');
      
      const mockQuotaStatus = {
        total: 100,
        used: 25,
        remaining: 75,
        refreshDate: new Date('2024-02-01'),
      };
      
      quotaService.checkQuota.mockResolvedValue(mockQuotaStatus);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.billing.checkUsageLimit({
        limitType: 'renders',
      });

      expect(result).toEqual({
        limit: 100,
        usage: 25,
        remaining: 75,
        exceeded: false,
        percentage: 25,
      });
      expect(quotaService.checkQuota).toHaveBeenCalledWith('test-org-id');
    });

    it('should check project quota successfully', async () => {
      const { subscriptionService } = await vi.importMock('@terrashaper/stripe');
      
      const mockPlan = {
        maxProjects: 10,
        maxTeamMembers: 5,
        renderCreditsMonthly: 100,
      };
      
      subscriptionService.getCurrentPlan.mockResolvedValue(mockPlan);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.billing.checkUsageLimit({
        limitType: 'projects',
        currentUsage: 3,
      });

      expect(result).toEqual({
        limit: 10,
        usage: 3,
        remaining: 7,
        exceeded: false,
        percentage: 30,
      });
    });

    it('should detect quota exceeded for renders', async () => {
      const { quotaService } = await vi.importMock('@terrashaper/shared');
      
      const mockQuotaStatus = {
        total: 100,
        used: 105, // Exceeded
        remaining: -5,
        refreshDate: new Date('2024-02-01'),
      };
      
      quotaService.checkQuota.mockResolvedValue(mockQuotaStatus);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.billing.checkUsageLimit({
        limitType: 'renders',
      });

      expect(result).toEqual({
        limit: 100,
        usage: 105,
        remaining: -5,
        exceeded: true,
        percentage: 105,
      });
    });

    it('should handle unlimited quota (null limit)', async () => {
      const { subscriptionService } = await vi.importMock('@terrashaper/stripe');
      
      const mockPlan = {
        maxProjects: null, // Unlimited
        maxTeamMembers: 10,
        renderCreditsMonthly: 100,
      };
      
      subscriptionService.getCurrentPlan.mockResolvedValue(mockPlan);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.billing.checkUsageLimit({
        limitType: 'projects',
        currentUsage: 100,
      });

      expect(result).toEqual({
        limit: -1, // Indicates unlimited
        usage: 100,
        remaining: -1, // Indicates unlimited
        exceeded: false,
        percentage: 0,
      });
    });

    it('should handle storage quota check', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.billing.checkUsageLimit({
        limitType: 'storage_gb',
        currentUsage: 2.5,
      });

      // Default storage limit for basic plans
      expect(result).toEqual({
        limit: 10,
        usage: 2.5,
        remaining: 7.5,
        exceeded: false,
        percentage: 25,
      });
    });

    it('should reject invalid limit types', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.billing.checkUsageLimit({
          limitType: 'invalid_type' as any,
        })
      ).rejects.toThrow();
    });

    it('should handle quota service failures for renders', async () => {
      const { quotaService } = await vi.importMock('@terrashaper/shared');
      
      quotaService.checkQuota.mockRejectedValue(new Error('Database error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.billing.checkUsageLimit({
          limitType: 'renders',
        })
      ).rejects.toThrow();
    });

    it('should handle subscription service failures', async () => {
      const { subscriptionService } = await vi.importMock('@terrashaper/stripe');
      
      subscriptionService.getCurrentPlan.mockRejectedValue(new Error('Stripe error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.billing.checkUsageLimit({
          limitType: 'projects',
        })
      ).rejects.toThrow();
    });

    it('should handle missing organization context', async () => {
      const mockContextWithoutOrg = {
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        },
        user: { 
          id: 'test-user-id',
          organizationId: undefined // Missing org
        },
      };

      const caller = appRouter.createCaller(mockContextWithoutOrg);

      await expect(
        caller.billing.checkUsageLimit({
          limitType: 'renders',
        })
      ).rejects.toThrow();
    });

    it('should calculate percentage correctly for edge cases', async () => {
      const { quotaService } = await vi.importMock('@terrashaper/shared');
      
      // Test zero usage
      quotaService.checkQuota.mockResolvedValue({
        total: 100,
        used: 0,
        remaining: 100,
        refreshDate: new Date(),
      });

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.billing.checkUsageLimit({
        limitType: 'renders',
      });

      expect(result.percentage).toBe(0);
      expect(result.exceeded).toBe(false);
    });

    it('should handle current usage parameter properly', async () => {
      const { subscriptionService } = await vi.importMock('@terrashaper/stripe');
      
      const mockPlan = {
        maxProjects: 20,
        maxTeamMembers: 10,
        renderCreditsMonthly: 200,
      };
      
      subscriptionService.getCurrentPlan.mockResolvedValue(mockPlan);

      const caller = appRouter.createCaller(mockContext);
      
      // Test with current usage provided
      const result = await caller.billing.checkUsageLimit({
        limitType: 'projects',
        currentUsage: 15,
      });

      expect(result).toEqual({
        limit: 20,
        usage: 15,
        remaining: 5,
        exceeded: false,
        percentage: 75,
      });
    });
  });
});