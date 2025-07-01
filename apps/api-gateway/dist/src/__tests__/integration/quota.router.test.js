"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Import the router after setup mocks are in place
const { appRouter } = await Promise.resolve().then(() => __importStar(require('../../router')));
(0, vitest_1.describe)('Quota Check Integration Tests', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // Mock context following existing test patterns
    const mockContext = {
        supabase: {
            from: vitest_1.vi.fn(() => ({
                select: vitest_1.vi.fn().mockReturnThis(),
                insert: vitest_1.vi.fn().mockReturnThis(),
                update: vitest_1.vi.fn().mockReturnThis(),
                eq: vitest_1.vi.fn().mockReturnThis(),
                single: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
        },
        user: {
            id: 'test-user-id',
            organizationId: 'test-org-id'
        },
    };
    (0, vitest_1.describe)('billing.checkUsageLimit', () => {
        (0, vitest_1.it)('should check render quota successfully', async () => {
            const { quotaService } = await vitest_1.vi.importMock('@terrashaper/shared');
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
            (0, vitest_1.expect)(result).toEqual({
                limit: 100,
                usage: 25,
                remaining: 75,
                exceeded: false,
                percentage: 25,
            });
            (0, vitest_1.expect)(quotaService.checkQuota).toHaveBeenCalledWith('test-org-id');
        });
        (0, vitest_1.it)('should check project quota successfully', async () => {
            const { subscriptionService } = await vitest_1.vi.importMock('@terrashaper/stripe');
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
            (0, vitest_1.expect)(result).toEqual({
                limit: 10,
                usage: 3,
                remaining: 7,
                exceeded: false,
                percentage: 30,
            });
        });
        (0, vitest_1.it)('should detect quota exceeded for renders', async () => {
            const { quotaService } = await vitest_1.vi.importMock('@terrashaper/shared');
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
            (0, vitest_1.expect)(result).toEqual({
                limit: 100,
                usage: 105,
                remaining: -5,
                exceeded: true,
                percentage: 105,
            });
        });
        (0, vitest_1.it)('should handle unlimited quota (null limit)', async () => {
            const { subscriptionService } = await vitest_1.vi.importMock('@terrashaper/stripe');
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
            (0, vitest_1.expect)(result).toEqual({
                limit: -1, // Indicates unlimited
                usage: 100,
                remaining: -1, // Indicates unlimited
                exceeded: false,
                percentage: 0,
            });
        });
        (0, vitest_1.it)('should handle storage quota check', async () => {
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.billing.checkUsageLimit({
                limitType: 'storage_gb',
                currentUsage: 2.5,
            });
            // Default storage limit for basic plans
            (0, vitest_1.expect)(result).toEqual({
                limit: 10,
                usage: 2.5,
                remaining: 7.5,
                exceeded: false,
                percentage: 25,
            });
        });
        (0, vitest_1.it)('should reject invalid limit types', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.billing.checkUsageLimit({
                limitType: 'invalid_type',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle quota service failures for renders', async () => {
            const { quotaService } = await vitest_1.vi.importMock('@terrashaper/shared');
            quotaService.checkQuota.mockRejectedValue(new Error('Database error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.billing.checkUsageLimit({
                limitType: 'renders',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle subscription service failures', async () => {
            const { subscriptionService } = await vitest_1.vi.importMock('@terrashaper/stripe');
            subscriptionService.getCurrentPlan.mockRejectedValue(new Error('Stripe error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.billing.checkUsageLimit({
                limitType: 'projects',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle missing organization context', async () => {
            const mockContextWithoutOrg = {
                supabase: {
                    from: vitest_1.vi.fn(() => ({
                        select: vitest_1.vi.fn().mockReturnThis(),
                        eq: vitest_1.vi.fn().mockReturnThis(),
                        single: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                },
                user: {
                    id: 'test-user-id',
                    organizationId: undefined // Missing org
                },
            };
            const caller = appRouter.createCaller(mockContextWithoutOrg);
            await (0, vitest_1.expect)(caller.billing.checkUsageLimit({
                limitType: 'renders',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should calculate percentage correctly for edge cases', async () => {
            const { quotaService } = await vitest_1.vi.importMock('@terrashaper/shared');
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
            (0, vitest_1.expect)(result.percentage).toBe(0);
            (0, vitest_1.expect)(result.exceeded).toBe(false);
        });
        (0, vitest_1.it)('should handle current usage parameter properly', async () => {
            const { subscriptionService } = await vitest_1.vi.importMock('@terrashaper/stripe');
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
            (0, vitest_1.expect)(result).toEqual({
                limit: 20,
                usage: 15,
                remaining: 5,
                exceeded: false,
                percentage: 75,
            });
        });
    });
});
