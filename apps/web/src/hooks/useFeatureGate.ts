import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { FeatureGateService } from '@terrashaper/shared/services/feature-gate.service';
import { SubscriptionTier, PlanFeatures } from '@terrashaper/shared/types/billing';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useFeatureGate() {
  const { user } = useUser();
  const router = useRouter();

  // Get current organization subscription
  const { data: subscription } = api.billing.getSubscription.useQuery(undefined, {
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const currentTier = subscription?.subscription?.tier || 'starter';

  /**
   * Check if a feature is available
   */
  const hasFeature = (featureName: keyof typeof PlanFeatures.starter): boolean => {
    return FeatureGateService.hasFeature(currentTier as SubscriptionTier, featureName);
  };

  /**
   * Check usage limit and get details
   */
  const checkUsageLimit = (
    limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth',
    currentUsage: number
  ) => {
    return FeatureGateService.checkUsageLimit(currentTier as SubscriptionTier, limitType, currentUsage);
  };

  /**
   * Require a feature - shows upgrade prompt if not available
   */
  const requireFeature = (
    featureName: keyof typeof PlanFeatures.starter,
    options?: {
      message?: string;
      redirectToUpgrade?: boolean;
    }
  ): boolean => {
    const hasAccess = hasFeature(featureName);

    if (!hasAccess) {
      const minimumTier = FeatureGateService.getMinimumTierForFeature(featureName);
      const defaultMessage = `This feature requires a ${minimumTier} plan or higher.`;
      
      toast.error(options?.message || defaultMessage, {
        action: {
          label: 'Upgrade',
          onClick: () => router.push('/settings/billing'),
        },
      });

      if (options?.redirectToUpgrade) {
        router.push('/settings/billing');
      }
    }

    return hasAccess;
  };

  /**
   * Check if user can perform action based on usage limits
   */
  const canPerformAction = (
    limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth',
    currentUsage: number,
    options?: {
      showError?: boolean;
      redirectToUpgrade?: boolean;
    }
  ): boolean => {
    const limitCheck = checkUsageLimit(limitType, currentUsage);

    if (limitCheck.exceeded) {
      if (options?.showError !== false) {
        toast.error(
          `You've reached your ${limitType} limit (${limitCheck.limit}). Please upgrade to continue.`,
          {
            action: {
              label: 'Upgrade',
              onClick: () => router.push('/settings/billing'),
            },
          }
        );
      }

      if (options?.redirectToUpgrade) {
        router.push('/settings/billing');
      }

      return false;
    }

    return true;
  };

  /**
   * Get all features for current tier
   */
  const getCurrentFeatures = () => {
    return FeatureGateService.getFeaturesForTier(currentTier as SubscriptionTier);
  };

  /**
   * Check if user can export a specific format
   */
  const canExportFormat = (format: string): boolean => {
    return FeatureGateService.canExportFormat(currentTier as SubscriptionTier, format);
  };

  /**
   * Get available export formats
   */
  const getExportFormats = (): string[] => {
    return FeatureGateService.getExportFormats(currentTier as SubscriptionTier);
  };

  /**
   * Get render resolution for current tier
   */
  const getRenderResolution = (): 'standard' | 'high' | 'ultra' => {
    return FeatureGateService.getRenderResolution(currentTier as SubscriptionTier);
  };

  return {
    currentTier: currentTier as SubscriptionTier,
    subscription,
    hasFeature,
    requireFeature,
    checkUsageLimit,
    canPerformAction,
    getCurrentFeatures,
    canExportFormat,
    getExportFormats,
    getRenderResolution,
    isLoading: !subscription,
  };
}