'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BillingOverview } from '@/components/billing/BillingOverview';
import { UsageAnalytics } from '@/components/billing/UsageAnalytics';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';
import { PaymentMethodsManager } from '@/components/billing/PaymentMethodsManager';
import { SubscriptionManager } from '@/components/billing/SubscriptionManager';
import { BillingAlerts } from '@/components/billing/BillingAlerts';
import { OverageAlert } from '@/components/billing/OverageAlert';
import { 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Settings,
  Download,
  AlertCircle
} from 'lucide-react';
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription, usage, and billing information
          </p>
        </div>
        <Button onClick={handleExportBillingData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Overage Alerts */}
      <OverageAlert />
      
      {/* Billing Alerts */}
      <BillingAlerts />

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BillingOverview />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Bill</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${((subscription?.plan?.price_monthly || 0) + (usageSummary?.estimatedOverages || 0)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
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
                <p className="text-xs text-muted-foreground mt-1">
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
                <p className="text-xs text-muted-foreground mt-1">
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