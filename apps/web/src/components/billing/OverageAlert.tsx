'use client';

import { AlertTriangle, CreditCard,Zap } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';

export function OverageAlert() {
  const { data: usage } = (trpc as any).billing.getCurrentUsage.useQuery();
  const { data: subscription } = (trpc as any).billing.getSubscription.useQuery();

  if (!usage) return null;

  const renderUsage = usage.renders?.used || 0;
  const renderLimit = usage.renders?.limit || 0;
  const storageUsage = usage.storage?.used || 0;
  const storageLimit = usage.storage?.limit || 0;

  const renderPercentage = renderLimit > 0 ? (renderUsage / renderLimit) * 100 : 0;
  const storagePercentage = storageLimit > 0 ? (storageUsage / storageLimit) * 100 : 0;

  const showRenderWarning = renderPercentage >= 80;
  const showStorageWarning = storagePercentage >= 80;
  const showRenderOverage = renderUsage > renderLimit && renderLimit > 0;
  const showStorageOverage = storageUsage > storageLimit && storageLimit > 0;

  if (!showRenderWarning && !showStorageWarning && !showRenderOverage && !showStorageOverage) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Render Overage Alert */}
      {showRenderOverage && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Render Limit Exceeded</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              You've used {renderUsage} renders this billing period, exceeding your plan limit of {renderLimit}.
              Additional renders will be charged at ${subscription?.plan?.overageRates?.renders || 0.50} each.
            </p>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/billing?tab=subscription">Upgrade Plan</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/billing?tab=usage">View Usage</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Overage Alert */}
      {showStorageOverage && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Storage Limit Exceeded</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              You're using {(storageUsage / 1024 / 1024 / 1024).toFixed(2)} GB of storage, 
              exceeding your plan limit of {(storageLimit / 1024 / 1024 / 1024).toFixed(2)} GB.
              Additional storage is charged at ${subscription?.plan?.overageRates?.storage || 0.10} per GB.
            </p>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/billing?tab=subscription">Upgrade Plan</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/projects">Manage Projects</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Render Warning Alert */}
      {showRenderWarning && !showRenderOverage && (
        <Alert>
          <Zap className="size-4" />
          <AlertTitle>Approaching Render Limit</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              You've used {renderUsage} of your {renderLimit} monthly renders ({renderPercentage.toFixed(0)}%).
            </p>
            <Progress value={renderPercentage} className="mb-3" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/billing?tab=subscription">View Plans</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/billing?tab=usage">View Usage</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Warning Alert */}
      {showStorageWarning && !showStorageOverage && (
        <Alert>
          <CreditCard className="size-4" />
          <AlertTitle>Approaching Storage Limit</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              You're using {(storageUsage / 1024 / 1024 / 1024).toFixed(2)} GB of your{' '}
              {(storageLimit / 1024 / 1024 / 1024).toFixed(2)} GB storage limit ({storagePercentage.toFixed(0)}%).
            </p>
            <Progress value={storagePercentage} className="mb-3" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/billing?tab=subscription">View Plans</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/projects">Manage Projects</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}