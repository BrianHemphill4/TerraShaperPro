"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@terrashaper/shared");
const vitest_1 = require("vitest");
// Simple unit tests for billing router related logic
(0, vitest_1.describe)('Billing Router Logic Tests', () => {
    (0, vitest_1.describe)('Input Validation', () => {
        (0, vitest_1.it)('should validate CreateCheckoutSession input', () => {
            const valid = {
                priceId: 'price_123',
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            };
            (0, vitest_1.expect)(() => shared_1.CreateCheckoutSessionSchema.parse(valid)).not.toThrow();
            // Missing priceId
            (0, vitest_1.expect)(() => shared_1.CreateCheckoutSessionSchema.parse({
                successUrl: 'https://example.com',
                cancelUrl: 'https://example.com',
            })).toThrow();
        });
        (0, vitest_1.it)('should validate CreatePortalSession input', () => {
            (0, vitest_1.expect)(() => shared_1.CreatePortalSessionSchema.parse({ returnUrl: 'https://example.com' })).not.toThrow();
            (0, vitest_1.expect)(() => shared_1.CreatePortalSessionSchema.parse({ returnUrl: 'invalid-url' })).toThrow();
        });
        (0, vitest_1.it)('should validate UpdateSubscription input', () => {
            const valid = { priceId: 'price_123', prorationBehavior: 'none' };
            (0, vitest_1.expect)(() => shared_1.UpdateSubscriptionSchema.parse(valid)).not.toThrow();
            // Invalid prorationBehavior
            (0, vitest_1.expect)(() => shared_1.UpdateSubscriptionSchema.parse({ priceId: 'price_123', prorationBehavior: 'invalid' })).toThrow();
        });
        (0, vitest_1.it)('should validate CancelSubscription input', () => {
            (0, vitest_1.expect)(() => shared_1.CancelSubscriptionSchema.parse({ cancelAtPeriodEnd: false })).not.toThrow();
            // cancelAtPeriodEnd default true
            const parsed = shared_1.CancelSubscriptionSchema.parse({});
            (0, vitest_1.expect)(parsed.cancelAtPeriodEnd).toBe(true);
        });
        (0, vitest_1.it)('should validate AddPaymentMethod input', () => {
            const valid = { paymentMethodId: 'pm_123', setAsDefault: true };
            (0, vitest_1.expect)(() => shared_1.AddPaymentMethodSchema.parse(valid)).not.toThrow();
            // Missing paymentMethodId
            (0, vitest_1.expect)(() => shared_1.AddPaymentMethodSchema.parse({ setAsDefault: false })).toThrow();
        });
    });
    (0, vitest_1.describe)('Business Logic Utilities', () => {
        (0, vitest_1.it)('should calculate subscription proration correctly', () => {
            const calculateProration = (oldPrice, newPrice) => {
                return newPrice - oldPrice;
            };
            (0, vitest_1.expect)(calculateProration(1000, 1500)).toBe(500);
            (0, vitest_1.expect)(calculateProration(2000, 1000)).toBe(-1000);
        });
    });
});
