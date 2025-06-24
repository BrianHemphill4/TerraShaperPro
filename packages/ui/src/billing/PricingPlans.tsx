'use client';

import { Check, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../badge';
import { Button } from '../button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_yearly?: number;
  stripe_price_id: string;
  render_credits_monthly: number;
  max_projects: number;
  max_team_members: number;
  features: {
    watermark?: boolean;
    exportFormats?: string[];
    support?: string;
    customBranding?: boolean;
    apiAccess?: boolean;
    sso?: boolean;
    [key: string]: any;
  };
}

export interface PricingPlansProps {
  plans: SubscriptionPlan[];
  currentTier?: string;
  onSubscribe?: (plan: SubscriptionPlan) => void;
  loading?: string | null;
}

export function PricingPlans({ 
  plans, 
  currentTier, 
  onSubscribe, 
  loading 
}: PricingPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-6">
      {/* Billing period toggle */}
      <div className="flex justify-center">
        <div className="rounded-lg bg-gray-100 p-1">
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition ${
              billingPeriod === 'monthly' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition ${
              billingPeriod === 'yearly' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const isCurrentPlan = plan.tier === currentTier;
          const features = plan.features;

          return (
            <Card key={plan.id} className={isCurrentPlan ? 'border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && <Badge variant="secondary">Current Plan</Badge>}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">
                    ${billingPeriod === 'yearly' && price ? (price / 12).toFixed(0) : price}
                  </span>
                  <span className="text-gray-500">/month</span>
                  {billingPeriod === 'yearly' && price && (
                    <div className="text-sm text-green-600">${price}/year</div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="mr-2 size-4 text-green-500" />
                    {plan.render_credits_monthly} renders/month
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 size-4 text-green-500" />
                    {plan.max_projects === -1 ? 'Unlimited' : plan.max_projects} projects
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 size-4 text-green-500" />
                    {plan.max_team_members === -1 ? 'Unlimited' : plan.max_team_members} team
                    members
                  </li>
                  <li className="flex items-center">
                    {features.watermark ? (
                      <X className="mr-2 size-4 text-gray-400" />
                    ) : (
                      <Check className="mr-2 size-4 text-green-500" />
                    )}
                    {features.watermark ? 'Watermarked exports' : 'No watermarks'}
                  </li>
                  {features.exportFormats && (
                    <li className="flex items-center">
                      <Check className="mr-2 size-4 text-green-500" />
                      Export: {features.exportFormats.join(', ')}
                    </li>
                  )}
                  {features.support && (
                    <li className="flex items-center">
                      <Check className="mr-2 size-4 text-green-500" />
                      {features.support} support
                    </li>
                  )}
                  {features.customBranding && (
                    <li className="flex items-center">
                      <Check className="mr-2 size-4 text-green-500" />
                      Custom branding
                    </li>
                  )}
                  {features.apiAccess && (
                    <li className="flex items-center">
                      <Check className="mr-2 size-4 text-green-500" />
                      API access
                    </li>
                  )}
                  {features.sso && (
                    <li className="flex items-center">
                      <Check className="mr-2 size-4 text-green-500" />
                      SSO integration
                    </li>
                  )}
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || loading === plan.id}
                  onClick={() => onSubscribe?.(plan)}
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