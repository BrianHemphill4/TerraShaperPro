"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGateService = void 0;
const billing_1 = require("../types/billing");
class FeatureGateService {
    /**
     * Check if a feature is available for a given subscription tier
     */
    static hasFeature(tier, featureName) {
        const currentTier = tier || 'starter';
        const features = billing_1.PlanFeatures[currentTier];
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
    static checkUsageLimit(tier, limitType, currentUsage) {
        const currentTier = tier || 'starter';
        const features = billing_1.PlanFeatures[currentTier];
        if (!features) {
            return {
                limit: 0,
                usage: currentUsage,
                remaining: 0,
                exceeded: true,
                percentage: 100,
            };
        }
        const limit = features[limitType];
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
    static getFeaturesForTier(tier) {
        const currentTier = tier || 'starter';
        return billing_1.PlanFeatures[currentTier] || billing_1.PlanFeatures.starter;
    }
    /**
     * Compare features between two tiers
     */
    static compareFeatures(fromTier, toTier) {
        const fromFeatures = billing_1.PlanFeatures[fromTier];
        const toFeatures = billing_1.PlanFeatures[toTier];
        const comparison = [];
        // Compare all features
        const allFeatureKeys = new Set([
            ...Object.keys(fromFeatures),
            ...Object.keys(toFeatures),
        ]);
        for (const key of allFeatureKeys) {
            const fromValue = fromFeatures[key];
            const toValue = toFeatures[key];
            let isUpgrade = false;
            if (typeof fromValue === 'boolean' && typeof toValue === 'boolean') {
                isUpgrade = !fromValue && toValue;
            }
            else if (typeof fromValue === 'number' && typeof toValue === 'number') {
                isUpgrade = toValue > fromValue || (toValue === -1 && fromValue !== -1);
            }
            else if (Array.isArray(fromValue) && Array.isArray(toValue)) {
                isUpgrade = toValue.length > fromValue.length;
            }
            else if (typeof fromValue === 'string' && typeof toValue === 'string') {
                // Custom logic for support levels
                if (key === 'support') {
                    const supportLevels = ['community', 'email', 'priority', 'dedicated'];
                    isUpgrade = supportLevels.indexOf(toValue) > supportLevels.indexOf(fromValue);
                }
                else if (key === 'renderResolution') {
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
    static getTierRank(tier) {
        const ranks = {
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
    static isUpgrade(fromTier, toTier) {
        return this.getTierRank(toTier) > this.getTierRank(fromTier);
    }
    /**
     * Get available export formats for a tier
     */
    static getExportFormats(tier) {
        const features = this.getFeaturesForTier(tier);
        return [...(features.exportFormats || ['png', 'jpg'])];
    }
    /**
     * Check if a specific export format is available
     */
    static canExportFormat(tier, format) {
        const formats = this.getExportFormats(tier);
        return formats.includes(format.toLowerCase());
    }
    /**
     * Get render resolution for a tier
     */
    static getRenderResolution(tier) {
        const features = this.getFeaturesForTier(tier);
        return features.renderResolution || 'standard';
    }
    /**
     * Check if a feature requires a specific minimum tier
     */
    static getMinimumTierForFeature(featureName) {
        const tiers = ['starter', 'professional', 'growth', 'enterprise'];
        for (const tier of tiers) {
            if (this.hasFeature(tier, featureName)) {
                return tier;
            }
        }
        return null;
    }
}
exports.FeatureGateService = FeatureGateService;
