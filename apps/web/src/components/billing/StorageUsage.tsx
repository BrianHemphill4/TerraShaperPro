'use client';

import { AlertTriangle, Database, FileImage, HardDrive, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { api } from '@/lib/api';
import { formatBytes } from '@/lib/utils';

export function StorageUsage() {
  const router = useRouter();
  const { checkUsageLimit, currentTier } = useFeatureGate();
  const [storageData, setStorageData] = useState<{
    current: number;
    limit: number;
    percentage: number;
    breakdown?: {
      project_uploads: { bytes: number; count: number };
      renders: { bytes: number; count: number };
      templates: { bytes: number; count: number };
    };
  } | null>(null);

  const { data: usage, isLoading } = api.billing.getUsage.useQuery();

  useEffect(() => {
    if (usage) {
      setStorageData({
        current: usage.usage,
        limit: usage.limit,
        percentage: usage.percentage,
      });
    }
  }, [usage]);

  const getStorageBreakdown = async () => {
    // This would need an API endpoint to get detailed breakdown
    // For now, using mock data
    setStorageData((prev) => ({
      ...prev!,
      breakdown: {
        project_uploads: { bytes: prev!.current * 0.4 * 1024 * 1024 * 1024, count: 150 },
        renders: { bytes: prev!.current * 0.5 * 1024 * 1024 * 1024, count: 500 },
        templates: { bytes: prev!.current * 0.1 * 1024 * 1024 * 1024, count: 20 },
      },
    }));
  };

  if (isLoading || !storageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Loading storage information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-20 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const isNearLimit = storageData.percentage > 80;
  const isOverLimit = storageData.percentage >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
        <CardDescription>
          Track your organization's storage usage across all projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total Storage Used</span>
            <span className="text-muted-foreground">
              {storageData.current.toFixed(2)} GB /{' '}
              {storageData.limit === -1 ? 'Unlimited' : `${storageData.limit} GB`}
            </span>
          </div>
          <Progress
            value={storageData.limit === -1 ? 0 : storageData.percentage}
            className={isOverLimit ? 'bg-destructive/20' : isNearLimit ? 'bg-amber-500/20' : ''}
          />
          {isNearLimit && !isOverLimit && (
            <p className="mt-2 flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="size-4" />
              You're approaching your storage limit
            </p>
          )}
          {isOverLimit && (
            <p className="text-destructive mt-2 flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4" />
              Storage limit exceeded - uploads may be blocked
            </p>
          )}
        </div>

        {/* Storage Breakdown */}
        {storageData.breakdown && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Storage Breakdown</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="text-muted-foreground size-4" />
                  <span className="text-sm">Project Uploads</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatBytes(storageData.breakdown.project_uploads.bytes)} (
                  {storageData.breakdown.project_uploads.count} files)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="text-muted-foreground size-4" />
                  <span className="text-sm">Renders</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatBytes(storageData.breakdown.renders.bytes)} (
                  {storageData.breakdown.renders.count} files)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="text-muted-foreground size-4" />
                  <span className="text-sm">Templates</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatBytes(storageData.breakdown.templates.bytes)} (
                  {storageData.breakdown.templates.count} files)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!storageData.breakdown && (
            <Button variant="outline" size="sm" onClick={getStorageBreakdown}>
              <Database className="mr-2 size-4" />
              View Breakdown
            </Button>
          )}

          {(isNearLimit || isOverLimit) && (
            <Button size="sm" onClick={() => router.push('/settings/billing')}>
              Upgrade Storage
            </Button>
          )}
        </div>

        {/* Current Plan Info */}
        <div className="border-t pt-4">
          <p className="text-muted-foreground text-xs">
            Your {currentTier} plan includes{' '}
            {storageData.limit === -1 ? 'unlimited' : `${storageData.limit} GB of`} storage.
            {storageData.limit !== -1 && ' Additional storage may incur extra charges.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
