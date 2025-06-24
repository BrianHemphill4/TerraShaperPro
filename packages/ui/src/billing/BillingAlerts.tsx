'use client';

import { AlertCircle, Calendar, CreditCard, Zap } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '../alert';
import { Button } from '../button';

export interface BillingAlert {
  id: string;
  type: 'payment_failed' | 'subscription_expiring' | 'usage_limit' | string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface BillingAlertsProps {
  alerts?: BillingAlert[];
  onActionClick?: (alert: BillingAlert) => void;
}

export function BillingAlerts({ alerts, onActionClick }: BillingAlertsProps) {
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
                  <Button 
                    size="sm" 
                    variant={alert.severity === 'error' ? 'default' : 'outline'}
                    onClick={() => onActionClick?.(alert)}
                  >
                    {alert.action.label}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}