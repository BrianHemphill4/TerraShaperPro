'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  Zap, 
  AlertTriangle,
  CreditCard,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { SubscriptionTier, PlanFeatures } from '@terrashaper/shared';
import { FeatureGateService } from '@terrashaper/shared';

const planDetails = {
  starter: {
    name: 'Starter',
    price: 0,
    description: 'For individuals and small projects',
    color: 'bg-gray-500',
  },
  professional: {
    name: 'Professional',
    price: 79,
    description: 'For growing teams and advanced features',
    color: 'bg-blue-500',
  },
  growth: {
    name: 'Growth',
    price: 299,
    description: 'For scaling businesses with high demands',
    color: 'bg-purple-500',
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    description: 'Custom solutions for large organizations',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
};

export function SubscriptionManager() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: subscription, refetch } = api.billing.getSubscription.useQuery();
  const { data: usage } = api.billing.getUsageSummary.useQuery();
  const updateSubscriptionMutation = api.billing.updateSubscription.useMutation();
  const cancelSubscriptionMutation = api.billing.cancelSubscription.useMutation();
  const reactivateSubscriptionMutation = api.billing.reactivateSubscription.useMutation();

  const currentTier = subscription?.plan?.tier || 'starter';

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    try {
      setIsProcessing(true);
      await updateSubscriptionMutation.mutateAsync({ 
        tier: selectedPlan,
        immediate: !FeatureGateService.isUpgrade(currentTier as SubscriptionTier, selectedPlan)
      });
      
      toast({
        title: 'Subscription updated',
        description: `You've been ${FeatureGateService.isUpgrade(currentTier as SubscriptionTier, selectedPlan) ? 'upgraded' : 'downgraded'} to the ${planDetails[selectedPlan].name} plan.`,
      });
      
      refetch();
      setShowConfirmDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscriptionMutation.mutateAsync({ 
        cancelAtPeriodEnd: true,
        reason: 'User requested cancellation'
      });
      
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription will remain active until the end of the billing period.',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription.',
        variant: 'destructive',
      });
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscriptionMutation.mutateAsync();
      
      toast({
        title: 'Subscription reactivated',
        description: 'Your subscription has been reactivated.',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reactivate subscription.',
        variant: 'destructive',
      });
    }
  };

  const renderPlanCard = (tier: SubscriptionTier) => {
    const plan = planDetails[tier];
    const features = PlanFeatures[tier];
    const isCurrentPlan = currentTier === tier;
    const isUpgrade = FeatureGateService.isUpgrade(currentTier as SubscriptionTier, tier);
    
    return (
      <Card 
        key={tier}
        className={`relative ${isCurrentPlan ? 'border-primary shadow-lg' : ''}`}
      >
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge>Current Plan</Badge>
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </div>
            {isUpgrade && tier !== 'enterprise' && (
              <Badge variant="secondary" className="gap-1">
                <ArrowUp className="h-3 w-3" />
                Upgrade
              </Badge>
            )}
          </div>
          
          <div className="mt-4">
            {tier === 'enterprise' ? (
              <p className="text-3xl font-bold">Contact Sales</p>
            ) : (
              <p className="text-3xl font-bold">
                {formatCurrency(plan.price)}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {features.maxProjects === -1 ? 'Unlimited' : features.maxProjects} projects
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {features.maxTeamMembers === -1 ? 'Unlimited' : features.maxTeamMembers} team members
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {features.maxRendersPerMonth === -1 ? 'Unlimited' : features.maxRendersPerMonth} renders/month
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {features.maxStorageGb === -1 ? 'Unlimited' : `${features.maxStorageGb} GB`} storage
                </span>
              </div>
              
              {features.apiAccess && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API access</span>
                </div>
              )}
              
              {features.customBranding && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom branding</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            {tier === 'enterprise' ? (
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            ) : isCurrentPlan ? (
              <Button className="w-full" disabled variant="secondary">
                Current Plan
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => {
                  setSelectedPlan(tier);
                  setShowConfirmDialog(true);
                }}
              >
                {isUpgrade ? 'Upgrade' : 'Downgrade'} to {plan.name}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and billing preferences
                </CardDescription>
              </div>
              <Badge variant={subscription.subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Current Period</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.subscription.currentPeriodStart).toLocaleDateString()} - 
                    {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Next Billing Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {subscription.subscription.cancelAtPeriodEnd && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription is set to cancel on {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}.
                    <Button
                      variant="link"
                      className="ml-2 p-0 h-auto"
                      onClick={handleReactivateSubscription}
                    >
                      Reactivate subscription
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['starter', 'professional', 'growth', 'enterprise'] as SubscriptionTier[]).map(renderPlanCard)}
        </div>
      </div>

      {/* Usage Warning */}
      {usage && (usage.overages.renders > 0 || usage.overages.storage > 0) && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            You have exceeded your plan limits. Consider upgrading to avoid overage charges.
          </AlertDescription>
        </Alert>
      )}

      {/* Cancel Subscription */}
      {subscription && subscription.subscription.status === 'active' && !subscription.subscription.cancelAtPeriodEnd && (
        <Card>
          <CardHeader>
            <CardTitle>Cancel Subscription</CardTitle>
            <CardDescription>
              Cancel your subscription at the end of the billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your subscription will remain active until the end of your current billing period.
              You can reactivate anytime before then.
            </p>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              {selectedPlan && FeatureGateService.isUpgrade(currentTier as SubscriptionTier, selectedPlan)
                ? `You're upgrading to the ${planDetails[selectedPlan].name} plan. You'll be charged the prorated difference immediately.`
                : `You're downgrading to the ${selectedPlan && planDetails[selectedPlan].name} plan. The change will take effect at the end of your current billing period.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlanChange} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}