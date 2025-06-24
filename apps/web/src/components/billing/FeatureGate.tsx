'use client';

import type { PlanFeatures } from '@terrashaper/shared/types/billing';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useFeatureGate } from '@terrashaper/hooks/useFeatureGate';
import { cn } from '@/lib/utils';

type FeatureGateProps = {
  feature: keyof typeof PlanFeatures.starter;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
};

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
      <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm">
        <div className="max-w-sm p-6 text-center">
          <Lock className="text-muted-foreground mx-auto mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">Premium Feature</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            This feature is not available on the {currentTier} plan. Upgrade to unlock it.
          </p>
          <Button onClick={() => router.push('/settings/billing')}>Upgrade Plan</Button>
        </div>
      </div>
      <div className="pointer-events-none opacity-30">{children}</div>
    </div>
  );
}

type UsageLimitGateProps = {
  limitType: 'maxProjects' | 'maxTeamMembers' | 'maxStorageGb' | 'maxRendersPerMonth';
  currentUsage: number;
  children: ReactNode;
  onLimitReached?: () => void;
  className?: string;
};

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
      <div className="border-muted-foreground/20 rounded-lg border-2 border-dashed p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold">Limit Reached</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          You've reached your limit of {limitCheck.limit} {limitTypeDisplay[limitType]}. Upgrade
          your plan to continue.
        </p>
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{limitCheck.usage}</div>
            <div className="text-muted-foreground text-xs">Current</div>
          </div>
          <div className="text-muted-foreground">/</div>
          <div className="text-center">
            <div className="text-2xl font-bold">{limitCheck.limit}</div>
            <div className="text-muted-foreground text-xs">Limit</div>
          </div>
        </div>
        <Button onClick={() => router.push('/settings/billing')}>Upgrade Plan</Button>
      </div>
    </div>
  );
}

type FeatureBadgeProps = {
  feature: keyof typeof PlanFeatures.starter;
  className?: string;
};

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
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
        'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
        className
      )}
    >
      <Lock className="size-3" />
      {tierRequired}
    </span>
  );
}
