'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import type { SubscriptionPlan } from '@terrashaper/shared';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingPlansProps {
  currentTier?: string;
}

export function PricingPlans({ currentTier }: PricingPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const { data: plans, isLoading } = api.billing.getPlans.useQuery();
  const createCheckoutMutation = api.billing.createCheckoutSession.useMutation();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setLoading(plan.id);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        priceId: plan.stripe_price_id,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing period toggle */}
      <div className="flex justify-center">
        <div className="rounded-lg bg-gray-100 p-1">
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition ${
              billingPeriod === 'monthly'
                ? 'bg-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition ${
              billingPeriod === 'yearly'
                ? 'bg-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans?.map((plan: SubscriptionPlan) => {
          const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const isCurrentPlan = plan.tier === currentTier;
          const features = plan.features as any;

          return (
            <Card key={plan.id} className={isCurrentPlan ? 'border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="secondary">Current Plan</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">
                    ${billingPeriod === 'yearly' ? (price! / 12).toFixed(0) : price}
                  </span>
                  <span className="text-gray-500">/month</span>
                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-green-600">
                      ${price}/year
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {plan.render_credits_monthly} renders/month
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {plan.max_projects === -1 ? 'Unlimited' : plan.max_projects} projects
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {plan.max_team_members === -1 ? 'Unlimited' : plan.max_team_members} team members
                  </li>
                  <li className="flex items-center">
                    {features.watermark ? (
                      <X className="mr-2 h-4 w-4 text-gray-400" />
                    ) : (
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                    )}
                    {features.watermark ? 'Watermarked exports' : 'No watermarks'}
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Export: {features.exportFormats?.join(', ')}
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {features.support} support
                  </li>
                  {features.customBranding && (
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Custom branding
                    </li>
                  )}
                  {features.apiAccess && (
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      API access
                    </li>
                  )}
                  {features.sso && (
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      SSO integration
                    </li>
                  )}
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || loading === plan.id}
                  onClick={() => handleSubscribe(plan)}
                >
                  {loading === plan.id
                    ? 'Loading...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : plan.tier === 'enterprise'
                    ? 'Contact Sales'
                    : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}