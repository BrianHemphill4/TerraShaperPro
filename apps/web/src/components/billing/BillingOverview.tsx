'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';

import { BillingAlerts } from './BillingAlerts';
import { InvoiceHistory } from './InvoiceHistory';
import { PaymentMethodsManager } from './PaymentMethodsManager';
import { SubscriptionManager } from './SubscriptionManager';
import { UsageAnalytics } from './UsageAnalytics';

export function BillingOverview() {
  const { data: subscription, isLoading } = api.billing.getSubscription.useQuery();
  const { data: usage } = api.billing.getUsage.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
      </div>

      <BillingAlerts />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription?.plan?.name || 'Free'}</div>
            <p className="text-xs text-muted-foreground">
              {subscription?.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renders Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage?.renders?.used || 0}
              <span className="text-sm font-normal text-muted-foreground">
                /{usage?.renders?.limit || '∞'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">This billing period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((usage?.storage?.used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              of {((usage?.storage?.limit || 0) / 1024 / 1024 / 1024).toFixed(1)} GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${subscription?.nextInvoice?.amount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.nextInvoice?.date
                ? new Date(subscription.nextInvoice.date).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <UsageAnalytics />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceHistory />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <PaymentMethodsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}