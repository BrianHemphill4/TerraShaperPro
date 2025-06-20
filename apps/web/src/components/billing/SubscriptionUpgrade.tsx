'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { FeatureGateService } from '@terrashaper/shared/services/feature-gate.service';
import { SubscriptionTier, PlanFeatures } from '@terrashaper/shared/types/billing';
import { cn } from '@/lib/utils';

interface SubscriptionUpgradeProps {
  currentTier: SubscriptionTier;
  targetTier?: SubscriptionTier;
  onSuccess?: () => void;
}

export function SubscriptionUpgrade({
  currentTier,
  targetTier,
  onSuccess,
}: SubscriptionUpgradeProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(targetTier || null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plans } = api.billing.getPlans.useQuery();
  const createCheckoutSession = api.billing.createCheckoutSession.useMutation();
  const updateSubscription = api.billing.updateSubscription.useMutation();

  const tiers: SubscriptionTier[] = ['starter', 'professional', 'growth', 'enterprise'];

  const handleUpgrade = async () => {
    if (!selectedTier || selectedTier === currentTier) return;

    setIsProcessing(true);

    try {
      const selectedPlan = plans?.find(p => p.tier === selectedTier);
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      const isUpgrade = FeatureGateService.isUpgrade(currentTier, selectedTier);

      if (currentTier === 'starter' || !isUpgrade) {
        // New subscription or downgrade - use checkout
        const session = await createCheckoutSession.mutateAsync({
          priceId: selectedPlan.stripe_price_id,
          successUrl: `${window.location.origin}/settings/billing?upgraded=true`,
          cancelUrl: `${window.location.origin}/settings/billing`,
        });

        if (session.url) {
          window.location.href = session.url;
        }
      } else {
        // Upgrade existing subscription
        await updateSubscription.mutateAsync({
          priceId: selectedPlan.stripe_price_id,
          prorationBehavior: 'always_invoice',
        });

        toast.success(`Successfully upgraded to ${selectedTier} plan!`);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to process subscription change');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFeatureComparison = () => {
    if (!selectedTier || selectedTier === currentTier) return null;

    const comparison = FeatureGateService.compareFeatures(currentTier, selectedTier);
    const upgrades = comparison.filter(c => c.isUpgrade);
    const downgrades = comparison.filter(c => !c.isUpgrade && c.from !== c.to);

    return (
      <div className="mt-6 space-y-4">
        {upgrades.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2">Upgrades</h4>
            <ul className="space-y-2">
              {upgrades.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="capitalize">{item.feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-muted-foreground">
                    {formatFeatureValue(item.from)} → {formatFeatureValue(item.to)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {downgrades.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-amber-600 mb-2">Downgrades</h4>
            <ul className="space-y-2">
              {downgrades.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <ArrowDown className="h-4 w-4 text-amber-600" />
                  <span className="capitalize">{item.feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-muted-foreground">
                    {formatFeatureValue(item.from)} → {formatFeatureValue(item.to)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const formatFeatureValue = (value: any): string => {
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'number') return value === -1 ? 'Unlimited' : value.toString();
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const plan = plans?.find(p => p.tier === tier);
          const features = PlanFeatures[tier];
          const isCurrentPlan = tier === currentTier;
          const isSelected = tier === selectedTier;
          const isUpgrade = FeatureGateService.isUpgrade(currentTier, tier);

          return (
            <Card
              key={tier}
              className={cn(
                'relative cursor-pointer transition-all',
                isCurrentPlan && 'border-primary',
                isSelected && 'ring-2 ring-primary',
                tier === 'enterprise' && 'md:col-span-2 lg:col-span-1'
              )}
              onClick={() => !isCurrentPlan && setSelectedTier(tier)}
            >
              {isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="capitalize">{tier}</CardTitle>
                <CardDescription>
                  {tier === 'starter' && 'Perfect for getting started'}
                  {tier === 'professional' && 'For growing businesses'}
                  {tier === 'growth' && 'Scale your operations'}
                  {tier === 'enterprise' && 'Custom solutions'}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    ${plan?.price_monthly || 0}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  {plan?.price_yearly && (
                    <div className="text-sm text-muted-foreground">
                      or ${plan.price_yearly}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Render Credits</span>
                    <span className="font-medium">
                      {plan?.render_credits_monthly === -1 ? 'Unlimited' : plan?.render_credits_monthly || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Projects</span>
                    <span className="font-medium">
                      {plan?.max_projects === -1 ? 'Unlimited' : plan?.max_projects || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Team Members</span>
                    <span className="font-medium">
                      {plan?.max_team_members === -1 ? 'Unlimited' : plan?.max_team_members || 0}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {Object.entries(features).slice(0, 5).map(([key, value]) => {
                    const hasFeature = typeof value === 'boolean' ? value : true;
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {hasFeature ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {!isCurrentPlan && (
                  <Button
                    className="w-full"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                  >
                    {isUpgrade ? 'Upgrade' : 'Downgrade'} to {tier}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTier && selectedTier !== currentTier && (
        <Card>
          <CardHeader>
            <CardTitle>
              {FeatureGateService.isUpgrade(currentTier, selectedTier) ? 'Upgrade' : 'Downgrade'} Summary
            </CardTitle>
            <CardDescription>
              Review the changes to your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderFeatureComparison()}

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {FeatureGateService.isUpgrade(currentTier, selectedTier)
                    ? 'You will be charged a prorated amount for the remainder of your billing period.'
                    : 'Your downgrade will take effect at the end of your current billing period.'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTier(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm {FeatureGateService.isUpgrade(currentTier, selectedTier) ? 'Upgrade' : 'Downgrade'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}