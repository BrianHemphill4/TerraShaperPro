'use client';

import { api } from '~/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export function BillingOverview() {
  const { data: subscription, isLoading: subLoading } = api.billing.getCurrentSubscription.useQuery();
  const { data: usage, isLoading: usageLoading } = api.billing.getUsageSummary.useQuery();
  const createPortalMutation = api.billing.createPortalSession.useMutation();

  const handleManageSubscription = async () => {
    const result = await createPortalMutation.mutateAsync({
      returnUrl: window.location.href,
    });

    if (result.url) {
      window.location.href = result.url;
    }
  };

  if (subLoading || usageLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderUsagePercentage = usage ? (usage.usage.renders / usage.limits.renders) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Subscription Status
              <CreditCard className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plan</span>
                  <Badge>{subscription.items.data[0]?.price.nickname || 'Custom'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge
                    variant={subscription.status === 'active' ? 'default' : 'destructive'}
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Next billing</span>
                  <span className="text-sm font-medium">
                    {format(new Date(subscription.current_period_end * 1000), 'MMM d, yyyy')}
                  </span>
                </div>
                {subscription.cancel_at && (
                  <div className="rounded-lg bg-yellow-50 p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="ml-2 text-sm text-yellow-800">
                        Cancels on {format(new Date(subscription.cancel_at * 1000), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No active subscription</p>
                <Button size="sm">Choose a Plan</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Usage This Month
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usage && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Renders</span>
                    <span className="text-sm font-medium">
                      {usage.usage.renders} / {usage.limits.renders}
                    </span>
                  </div>
                  <Progress value={renderUsagePercentage} className="h-2" />
                </div>
                <div className="text-xs text-gray-500">
                  Period: {format(new Date(usage.period.start), 'MMM d')} - {format(new Date(usage.period.end), 'MMM d')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Quick Actions
              <Calendar className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={handleManageSubscription}
                disabled={createPortalMutation.isLoading}
              >
                Manage Subscription
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.href = '/settings/billing/invoices'}
              >
                View Invoices
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.href = '/settings/billing/payment-methods'}
              >
                Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}