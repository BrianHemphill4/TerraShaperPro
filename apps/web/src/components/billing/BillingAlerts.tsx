'use client';

import { AlertCircle, Calendar, CreditCard, Zap } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export function BillingAlerts() {
  const { data: alerts } = api.billing.getBillingAlerts.useQuery();
  
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment_failed':
        return CreditCard;
      case 'subscription_expiring':
        return Calendar;
      case 'usage_limit':
        return Zap;
      default:
        return AlertCircle;
    }
  };

  const getAlertVariant = (severity: string): 'default' | 'destructive' => {
    return severity === 'error' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        
        return (
          <Alert key={alert.id} variant={getAlertVariant(alert.severity)}>
            <Icon className="size-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex items-start justify-between">
                <p>{alert.message}</p>
                {alert.action && (
                  <Link href={alert.action.url}>
                    <Button size="sm" variant={alert.severity === 'error' ? 'default' : 'outline'}>
                      {alert.action.label}
                    </Button>
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}