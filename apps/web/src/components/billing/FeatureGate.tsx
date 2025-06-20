'use client';

import { ReactNode } from 'react';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanFeatures } from '@terrashaper/shared/types/billing';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  feature: keyof typeof PlanFeatures.starter;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  className,
}: FeatureGateProps) {
  const { hasFeature, currentTier } = useFeatureGate();
  const router = useRouter();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Premium Feature</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This feature is not available on the {currentTier} plan. Upgrade to unlock it.
          </p>
          <Button onClick={() => router.push('/settings/billing')}>
            Upgrade Plan
          </Button>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">{children}</div>
    </div>
  );
}

interface UsageLimitGateProps {
  limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth';
  currentUsage: number;
  children: ReactNode;
  onLimitReached?: () => void;
  className?: string;
}

export function UsageLimitGate({
  limitType,
  currentUsage,
  children,
  onLimitReached,
  className,
}: UsageLimitGateProps) {
  const { checkUsageLimit } = useFeatureGate();
  const router = useRouter();

  const limitCheck = checkUsageLimit(limitType, currentUsage);

  if (!limitCheck.exceeded) {
    return <>{children}</>;
  }

  if (onLimitReached) {
    onLimitReached();
  }

  const limitTypeDisplay = {
    maxProjects: 'projects',
    maxTeamMembers: 'team members',
    maxStorageGb: 'storage',
    maxRendersPerMonth: 'renders this month',
  };

  return (
    <div className={cn('relative', className)}>
      <div className="p-6 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Limit Reached</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You've reached your limit of {limitCheck.limit} {limitTypeDisplay[limitType]}.
          Upgrade your plan to continue.
        </p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{limitCheck.usage}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="text-muted-foreground">/</div>
          <div className="text-center">
            <div className="text-2xl font-bold">{limitCheck.limit}</div>
            <div className="text-xs text-muted-foreground">Limit</div>
          </div>
        </div>
        <Button onClick={() => router.push('/settings/billing')}>
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}

interface FeatureBadgeProps {
  feature: keyof typeof PlanFeatures.starter;
  className?: string;
}

export function FeatureBadge({ feature, className }: FeatureBadgeProps) {
  const { hasFeature, currentTier } = useFeatureGate();

  if (hasFeature(feature)) {
    return null;
  }

  const minimumTier = {
    apiAccess: 'Growth',
    sso: 'Enterprise',
    whiteLabel: 'Growth',
    advancedAnalytics: 'Growth',
    customIntegrations: 'Enterprise',
    dedicatedAccountManager: 'Enterprise',
  };

  const tierRequired = minimumTier[feature as keyof typeof minimumTier] || 'Professional';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
        'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
        className
      )}
    >
      <Lock className="h-3 w-3" />
      {tierRequired}
    </span>
  );
}