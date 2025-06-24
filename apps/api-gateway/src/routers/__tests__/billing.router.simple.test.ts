import {
  AddPaymentMethodSchema,
  CancelSubscriptionSchema,
  CreateCheckoutSessionSchema,
  CreatePortalSessionSchema,
  UpdateSubscriptionSchema,
} from '@terrashaper/shared';
import { describe, expect,it } from 'vitest';

// Simple unit tests for billing router related logic

describe('Billing Router Logic Tests', () => {
  describe('Input Validation', () => {
    it('should validate CreateCheckoutSession input', () => {
      const valid = {
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      expect(() => CreateCheckoutSessionSchema.parse(valid)).not.toThrow();

      // Missing priceId
      expect(() =>
        CreateCheckoutSessionSchema.parse({
          successUrl: 'https://example.com',
          cancelUrl: 'https://example.com',
        } as any)
      ).toThrow();
    });

    it('should validate CreatePortalSession input', () => {
      expect(() => CreatePortalSessionSchema.parse({ returnUrl: 'https://example.com' })).not.toThrow();
      expect(() => CreatePortalSessionSchema.parse({ returnUrl: 'invalid-url' })).toThrow();
    });

    it('should validate UpdateSubscription input', () => {
      const valid = { priceId: 'price_123', prorationBehavior: 'none' as const };

      expect(() => UpdateSubscriptionSchema.parse(valid)).not.toThrow();

      // Invalid prorationBehavior
      expect(() => UpdateSubscriptionSchema.parse({ priceId: 'price_123', prorationBehavior: 'invalid' } as any)).toThrow();
    });

    it('should validate CancelSubscription input', () => {
      expect(() => CancelSubscriptionSchema.parse({ cancelAtPeriodEnd: false })).not.toThrow();

      // cancelAtPeriodEnd default true
      const parsed = CancelSubscriptionSchema.parse({});

      expect(parsed.cancelAtPeriodEnd).toBe(true);
    });

    it('should validate AddPaymentMethod input', () => {
      const valid = { paymentMethodId: 'pm_123', setAsDefault: true };

      expect(() => AddPaymentMethodSchema.parse(valid)).not.toThrow();

      // Missing paymentMethodId
      expect(() => AddPaymentMethodSchema.parse({ setAsDefault: false } as any)).toThrow();
    });
  });

  describe('Business Logic Utilities', () => {
    it('should calculate subscription proration correctly', () => {
      const calculateProration = (oldPrice: number, newPrice: number): number => {
        return newPrice - oldPrice;
      };

      expect(calculateProration(1000, 1500)).toBe(500);
      expect(calculateProration(2000, 1000)).toBe(-1000);
    });
  });
}); 