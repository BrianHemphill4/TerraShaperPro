'use client';

import {
  CreditCard, 
  Download,
  FileText, 
  Settings,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

import { BillingAlerts } from '@/components/billing/BillingAlerts';
import { BillingOverview } from '@/components/billing/BillingOverview';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';
import { OverageAlert } from '@/components/billing/OverageAlert';
import { PaymentMethodsManager } from '@/components/billing/PaymentMethodsManager';
import { SubscriptionManager } from '@/components/billing/SubscriptionManager';
import { UsageAnalytics } from '@/components/billing/UsageAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: subscription } = api.billing.getSubscription.useQuery();
  const { data: usageSummary } = api.billing.getUsageSummary.useQuery();

  const handleExportBillingData = () => {
    // Export billing data to CSV
    window.open('/api/billing/export?format=csv', '_blank');
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your subscription, usage, and billing information
          </p>
        </div>
        <Button onClick={handleExportBillingData} variant="outline">
          <Download className="mr-2 size-4" />
          Export Data
        </Button>
      </div>

      {/* Overage Alerts */}
      <OverageAlert />
      
      {/* Billing Alerts */}
      <BillingAlerts />

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="size-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Settings className="size-4" />
            Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BillingOverview />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Bill</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${((subscription?.plan?.price_monthly || 0) + (usageSummary?.estimatedOverages || 0)).toFixed(2)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Due on {new Date(subscription?.subscription?.currentPeriodEnd || '').toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageSummary?.limits?.renders || 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Of {subscription?.plan?.render_credits_monthly || 0} monthly credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Next Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(subscription?.subscription?.currentPeriodEnd || '').toLocaleDateString()}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {subscription?.subscription?.status === 'active' ? 'Auto-renewal' : 'Cancelled'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UsageAnalytics />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <InvoiceHistory />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <PaymentMethodsManager />
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <SubscriptionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}