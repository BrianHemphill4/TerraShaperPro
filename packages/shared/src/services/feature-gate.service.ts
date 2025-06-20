import { SubscriptionTier, PlanFeatures } from '../types/billing';

export class FeatureGateService {
  /**
   * Check if a feature is available for a given subscription tier
   */
  static hasFeature(tier: SubscriptionTier | null, featureName: keyof typeof PlanFeatures.starter): boolean {
    const currentTier = tier || 'starter';
    const features = PlanFeatures[currentTier];
    
    if (!features) {
      return false;
    }

    const featureValue = features[featureName];

    // Handle different types of feature values
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }

    if (typeof featureValue === 'number') {
      return featureValue > 0 || featureValue === -1; // -1 means unlimited
    }

    if (typeof featureValue === 'string') {
      return featureValue.length > 0;
    }

    if (Array.isArray(featureValue)) {
      return featureValue.length > 0;
    }

    return featureValue != null;
  }

  /**
   * Check if a usage limit is exceeded
   */
  static checkUsageLimit(
    tier: SubscriptionTier | null,
    limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth',
    currentUsage: number
  ): {
    limit: number;
    usage: number;
    remaining: number;
    exceeded: boolean;
    percentage: number;
  } {
    const currentTier = tier || 'starter';
    const features = PlanFeatures[currentTier];
    
    if (!features) {
      return {
        limit: 0,
        usage: currentUsage,
        remaining: 0,
        exceeded: true,
        percentage: 100,
      };
    }

    const limit = (features as any)[limitType] as number;
    const isUnlimited = limit === -1;

    return {
      limit,
      usage: currentUsage,
      remaining: isUnlimited ? -1 : Math.max(0, limit - currentUsage),
      exceeded: !isUnlimited && currentUsage > limit,
      percentage: isUnlimited ? 0 : Math.round((currentUsage / limit) * 100),
    };
  }

  /**
   * Get all features for a given tier
   */
  static getFeaturesForTier(tier: SubscriptionTier | null) {
    const currentTier = tier || 'starter';
    return PlanFeatures[currentTier] || PlanFeatures.starter;
  }

  /**
   * Compare features between two tiers
   */
  static compareFeatures(fromTier: SubscriptionTier, toTier: SubscriptionTier) {
    const fromFeatures = PlanFeatures[fromTier];
    const toFeatures = PlanFeatures[toTier];

    const comparison: {
      feature: string;
      from: any;
      to: any;
      isUpgrade: boolean;
    }[] = [];

    // Compare all features
    const allFeatureKeys = new Set([
      ...Object.keys(fromFeatures),
      ...Object.keys(toFeatures),
    ]) as Set<keyof typeof PlanFeatures.starter>;

    for (const key of allFeatureKeys) {
      const fromValue = fromFeatures[key];
      const toValue = toFeatures[key];

      let isUpgrade = false;

      if (typeof fromValue === 'boolean' && typeof toValue === 'boolean') {
        isUpgrade = !fromValue && toValue;
      } else if (typeof fromValue === 'number' && typeof toValue === 'number') {
        isUpgrade = toValue > fromValue || (toValue === -1 && fromValue !== -1);
      } else if (Array.isArray(fromValue) && Array.isArray(toValue)) {
        isUpgrade = toValue.length > fromValue.length;
      } else if (typeof fromValue === 'string' && typeof toValue === 'string') {
        // Custom logic for support levels
        if (key === 'support') {
          const supportLevels = ['community', 'email', 'priority', 'dedicated'];
          isUpgrade = supportLevels.indexOf(toValue) > supportLevels.indexOf(fromValue);
        } else if (key === 'renderResolution') {
          const resolutionLevels = ['standard', 'high', 'ultra'];
          isUpgrade = resolutionLevels.indexOf(toValue) > resolutionLevels.indexOf(fromValue);
        }
      }

      comparison.push({
        feature: key,
        from: fromValue,
        to: toValue,
        isUpgrade,
      });
    }

    return comparison;
  }

  /**
   * Get tier ranking (for upgrade/downgrade logic)
   */
  static getTierRank(tier: SubscriptionTier): number {
    const ranks: Record<SubscriptionTier, number> = {
      starter: 0,
      professional: 1,
      growth: 2,
      enterprise: 3,
    };
    return ranks[tier] ?? 0;
  }

  /**
   * Check if moving from one tier to another is an upgrade
   */
  static isUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
    return this.getTierRank(toTier) > this.getTierRank(fromTier);
  }

  /**
   * Get available export formats for a tier
   */
  static getExportFormats(tier: SubscriptionTier | null): string[] {
    const features = this.getFeaturesForTier(tier);
    return [...(features.exportFormats || ['png', 'jpg'])];
  }

  /**
   * Check if a specific export format is available
   */
  static canExportFormat(tier: SubscriptionTier | null, format: string): boolean {
    const formats = this.getExportFormats(tier);
    return formats.includes(format.toLowerCase());
  }

  /**
   * Get render resolution for a tier
   */
  static getRenderResolution(tier: SubscriptionTier | null): 'standard' | 'high' | 'ultra' {
    const features = this.getFeaturesForTier(tier);
    return features.renderResolution || 'standard';
  }

  /**
   * Check if a feature requires a specific minimum tier
   */
  static getMinimumTierForFeature(featureName: keyof typeof PlanFeatures.starter): SubscriptionTier | null {
    const tiers: SubscriptionTier[] = ['starter', 'professional', 'growth', 'enterprise'];
    
    for (const tier of tiers) {
      if (this.hasFeature(tier, featureName)) {
        return tier;
      }
    }
    
    return null;
  }
}