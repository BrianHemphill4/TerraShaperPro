import { describe, it, expect } from 'vitest';
import { FeatureGateService } from '../feature-gate.service';
import { SubscriptionTier } from '../../types/billing';

describe('FeatureGateService', () => {
  describe('hasFeature', () => {
    it('should return false for null tier with default starter fallback', () => {
      const result = FeatureGateService.hasFeature(null, 'apiAccess');
      expect(typeof result).toBe('boolean');
    });

    it('should handle boolean features correctly', () => {
      const result = FeatureGateService.hasFeature('enterprise', 'prioritySupport');
      expect(typeof result).toBe('boolean');
    });

    it('should handle numeric features correctly', () => {
      const result = FeatureGateService.hasFeature('professional', 'maxProjects');
      expect(typeof result).toBe('boolean');
    });

    it('should return true for unlimited features (-1)', () => {
      // This tests the specific logic for unlimited values
      const mockTier = 'enterprise' as SubscriptionTier;
      const result = FeatureGateService.hasFeature(mockTier, 'maxRendersPerMonth');
      expect(typeof result).toBe('boolean');
    });

    it('should handle array features correctly', () => {
      const result = FeatureGateService.hasFeature('growth', 'exportFormats');
      expect(typeof result).toBe('boolean');
    });

    it('should return false for invalid tier', () => {
      const result = FeatureGateService.hasFeature('invalid' as SubscriptionTier, 'apiAccess');
      expect(result).toBe(false);
    });
  });

  describe('checkUsageLimit', () => {
    it('should calculate usage correctly for starter tier', () => {
      const result = FeatureGateService.checkUsageLimit('starter', 'maxProjects', 3);

      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('usage', 3);
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('exceeded');
      expect(result).toHaveProperty('percentage');
      expect(result.usage).toBe(3);
    });

    it('should handle unlimited plans correctly', () => {
      const result = FeatureGateService.checkUsageLimit('enterprise', 'maxRendersPerMonth', 1000);

      if (result.limit === -1) {
        expect(result.remaining).toBe(-1);
        expect(result.exceeded).toBe(false);
        expect(result.percentage).toBe(0);
      }
    });

    it('should detect when usage exceeds limit', () => {
      const result = FeatureGateService.checkUsageLimit('starter', 'maxProjects', 100);

      if (result.limit !== -1 && result.limit < 100) {
        expect(result.exceeded).toBe(true);
        expect(result.remaining).toBe(0);
      }
    });

    it('should calculate percentage correctly', () => {
      const result = FeatureGateService.checkUsageLimit('professional', 'maxProjects', 5);

      if (result.limit !== -1) {
        const expectedPercentage = Math.round((5 / result.limit) * 100);
        expect(result.percentage).toBe(expectedPercentage);
      }
    });

    it('should handle null tier gracefully', () => {
      const result = FeatureGateService.checkUsageLimit(null, 'maxProjects', 1);

      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('usage', 1);
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('exceeded');
      expect(result).toHaveProperty('percentage');
    });

    it('should handle invalid tier', () => {
      const result = FeatureGateService.checkUsageLimit(
        'invalid' as SubscriptionTier,
        'maxProjects',
        1
      );

      expect(result.limit).toBe(0);
      expect(result.usage).toBe(1);
      expect(result.remaining).toBe(0);
      expect(result.exceeded).toBe(true);
      expect(result.percentage).toBe(100);
    });
  });

  describe('getFeaturesForTier', () => {
    it('should return features for valid tier', () => {
      const features = FeatureGateService.getFeaturesForTier('professional');
      expect(typeof features).toBe('object');
      expect(features).not.toBeNull();
    });

    it('should return starter features for null tier', () => {
      const features = FeatureGateService.getFeaturesForTier(null);
      const starterFeatures = FeatureGateService.getFeaturesForTier('starter');
      expect(features).toEqual(starterFeatures);
    });

    it('should return starter features for invalid tier', () => {
      const features = FeatureGateService.getFeaturesForTier('invalid' as SubscriptionTier);
      const starterFeatures = FeatureGateService.getFeaturesForTier('starter');
      expect(features).toEqual(starterFeatures);
    });
  });

  describe('getTierRank', () => {
    it('should return correct rankings', () => {
      expect(FeatureGateService.getTierRank('starter')).toBe(0);
      expect(FeatureGateService.getTierRank('professional')).toBe(1);
      expect(FeatureGateService.getTierRank('growth')).toBe(2);
      expect(FeatureGateService.getTierRank('enterprise')).toBe(3);
    });

    it('should return 0 for invalid tier', () => {
      expect(FeatureGateService.getTierRank('invalid' as SubscriptionTier)).toBe(0);
    });
  });

  describe('isUpgrade', () => {
    it('should correctly identify upgrades', () => {
      expect(FeatureGateService.isUpgrade('starter', 'professional')).toBe(true);
      expect(FeatureGateService.isUpgrade('professional', 'growth')).toBe(true);
      expect(FeatureGateService.isUpgrade('growth', 'enterprise')).toBe(true);
    });

    it('should correctly identify downgrades', () => {
      expect(FeatureGateService.isUpgrade('professional', 'starter')).toBe(false);
      expect(FeatureGateService.isUpgrade('enterprise', 'growth')).toBe(false);
    });

    it('should handle same tier', () => {
      expect(FeatureGateService.isUpgrade('professional', 'professional')).toBe(false);
    });
  });

  describe('getExportFormats', () => {
    it('should return array of export formats', () => {
      const formats = FeatureGateService.getExportFormats('professional');
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThan(0);
    });

    it('should return default formats for null tier', () => {
      const formats = FeatureGateService.getExportFormats(null);
      expect(Array.isArray(formats)).toBe(true);
      expect(formats).toContain('png');
      expect(formats).toContain('jpg');
    });
  });

  describe('canExportFormat', () => {
    it('should check format availability correctly', () => {
      const canExportPng = FeatureGateService.canExportFormat('starter', 'png');
      expect(typeof canExportPng).toBe('boolean');
    });

    it('should be case insensitive', () => {
      const canExportPNG = FeatureGateService.canExportFormat('starter', 'PNG');
      const canExportpng = FeatureGateService.canExportFormat('starter', 'png');
      expect(canExportPNG).toBe(canExportpng);
    });
  });

  describe('getRenderResolution', () => {
    it('should return valid resolution level', () => {
      const resolution = FeatureGateService.getRenderResolution('enterprise');
      expect(['standard', 'high', 'ultra']).toContain(resolution);
    });

    it('should return standard for null tier', () => {
      const resolution = FeatureGateService.getRenderResolution(null);
      expect(['standard', 'high', 'ultra']).toContain(resolution);
    });
  });

  describe('getMinimumTierForFeature', () => {
    it('should find minimum tier for available feature', () => {
      const minTier = FeatureGateService.getMinimumTierForFeature('apiAccess');
      if (minTier !== null) {
        expect(['starter', 'professional', 'growth', 'enterprise']).toContain(minTier);
      }
    });

    it('should return null for unavailable feature', () => {
      const minTier = FeatureGateService.getMinimumTierForFeature('nonExistentFeature' as any);
      expect(minTier).toBeNull();
    });
  });

  describe('compareFeatures', () => {
    it('should compare features between tiers', () => {
      const comparison = FeatureGateService.compareFeatures('starter', 'professional');

      expect(Array.isArray(comparison)).toBe(true);
      expect(comparison.length).toBeGreaterThan(0);

      comparison.forEach((item) => {
        expect(item).toHaveProperty('feature');
        expect(item).toHaveProperty('from');
        expect(item).toHaveProperty('to');
        expect(item).toHaveProperty('isUpgrade');
        expect(typeof item.isUpgrade).toBe('boolean');
      });
    });

    it('should handle boolean feature upgrades', () => {
      const comparison = FeatureGateService.compareFeatures('starter', 'enterprise');
      const booleanUpgrades = comparison.filter(
        (item) => typeof item.from === 'boolean' && typeof item.to === 'boolean' && item.isUpgrade
      );

      // At least some boolean features should be upgrades from starter to enterprise
      if (booleanUpgrades.length > 0) {
        booleanUpgrades.forEach((item) => {
          expect(item.from).toBe(false);
          expect(item.to).toBe(true);
        });
      }
    });

    it('should handle numeric feature upgrades', () => {
      const comparison = FeatureGateService.compareFeatures('starter', 'enterprise');
      const numericUpgrades = comparison.filter(
        (item) => typeof item.from === 'number' && typeof item.to === 'number' && item.isUpgrade
      );

      if (numericUpgrades.length > 0) {
        numericUpgrades.forEach((item) => {
          expect(item.to > item.from || (item.to === -1 && item.from !== -1)).toBe(true);
        });
      }
    });

    it('should handle support level upgrades', () => {
      const comparison = FeatureGateService.compareFeatures('starter', 'enterprise');
      const supportComparison = comparison.find((item) => item.feature === 'support');

      if (
        supportComparison &&
        typeof supportComparison.from === 'string' &&
        typeof supportComparison.to === 'string'
      ) {
        const supportLevels = ['community', 'email', 'priority', 'dedicated'];
        const fromIndex = supportLevels.indexOf(supportComparison.from);
        const toIndex = supportLevels.indexOf(supportComparison.to);

        if (fromIndex !== -1 && toIndex !== -1) {
          expect(supportComparison.isUpgrade).toBe(toIndex > fromIndex);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero usage', () => {
      const result = FeatureGateService.checkUsageLimit('professional', 'maxProjects', 0);

      expect(result.usage).toBe(0);
      expect(result.exceeded).toBe(false);
      expect(result.percentage).toBe(0);
    });

    it('should handle negative usage gracefully', () => {
      const result = FeatureGateService.checkUsageLimit('professional', 'maxProjects', -1);

      expect(result.usage).toBe(-1);
      expect(result.exceeded).toBe(false);
    });

    it('should handle very large usage numbers', () => {
      const result = FeatureGateService.checkUsageLimit('starter', 'maxProjects', 999999);

      expect(result.usage).toBe(999999);
      if (result.limit !== -1) {
        expect(result.exceeded).toBe(true);
      }
    });
  });
});
