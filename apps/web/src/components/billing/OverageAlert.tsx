'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, CreditCard, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

interface OverageData {
  charge_type: 'render' | 'storage' | 'team_seats';
  quantity_used: number;
  quantity_included: number;
  overage_quantity: number;
  unit_price: number;
  total_amount: number;
  percentage_used: number;
}

export function OverageAlert() {
  const router = useRouter();
  const [overages, setOverages] = useState<OverageData[]>([]);
  const [totalOverageAmount, setTotalOverageAmount] = useState(0);

  const { data: overageData } = api.billing.getCurrentOverages.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  useEffect(() => {
    if (overageData) {
      const activeOverages = overageData.filter(o => o.overage_quantity > 0);
      setOverages(activeOverages);
      setTotalOverageAmount(activeOverages.reduce((sum, o) => sum + o.total_amount, 0));
    }
  }, [overageData]);

  const getOverageTypeDisplay = (type: string) => {
    switch (type) {
      case 'render':
        return { label: 'Renders', unit: 'renders' };
      case 'storage':
        return { label: 'Storage', unit: 'GB' };
      case 'team_seats':
        return { label: 'Team Seats', unit: 'seats' };
      default:
        return { label: type, unit: '' };
    }
  };

  if (overages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Alert Banner */}
      {totalOverageAmount > 0 && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Usage Overages Detected</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              You've exceeded your plan limits this month. Additional charges of{' '}
              <span className="font-semibold">{formatCurrency(totalOverageAmount)}</span> will apply.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push('/settings/billing')}>
                Upgrade Plan
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push('/settings/billing/usage')}>
                View Details
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Overage Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Overages</CardTitle>
              <CardDescription>
                Usage beyond your plan limits for the current billing period
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated charges</p>
              <p className="text-2xl font-bold">{formatCurrency(totalOverageAmount)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {overages.map((overage) => {
            const display = getOverageTypeDisplay(overage.charge_type);
            return (
              <div key={overage.charge_type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{display.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {overage.quantity_used} / {overage.quantity_included} {display.unit}
                  </span>
                </div>
                <Progress 
                  value={Math.min(overage.percentage_used, 100)} 
                  className={overage.percentage_used > 100 ? 'bg-amber-100' : ''}
                />
                {overage.overage_quantity > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-600">
                      +{overage.overage_quantity} {display.unit} over limit
                    </span>
                    <span className="font-medium">
                      {formatCurrency(overage.total_amount)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t space-y-2">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 mt-0.5" />
              <p>
                Overage charges will be added to your next invoice at the end of the billing period.
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mt-0.5" />
              <p>
                Consider upgrading your plan to avoid overage charges and get better rates.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => router.push('/settings/billing/invoices')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Invoices
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push('/settings/billing')}
            >
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Utility function - should be in lib/utils
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}