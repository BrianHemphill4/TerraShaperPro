'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Database, HardDrive, FileImage, Layout, AlertTriangle } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useFeatureGate } from '@/hooks/useFeatureGate';

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
    setStorageData(prev => ({
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
          <div className="h-20 bg-muted animate-pulse rounded" />
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
              {storageData.current.toFixed(2)} GB / {storageData.limit === -1 ? 'Unlimited' : `${storageData.limit} GB`}
            </span>
          </div>
          <Progress 
            value={storageData.limit === -1 ? 0 : storageData.percentage} 
            className={isOverLimit ? 'bg-destructive/20' : isNearLimit ? 'bg-amber-500/20' : ''}
          />
          {isNearLimit && !isOverLimit && (
            <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4" />
              You're approaching your storage limit
            </p>
          )}
          {isOverLimit && (
            <p className="text-sm text-destructive flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4" />
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
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Project Uploads</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatBytes(storageData.breakdown.project_uploads.bytes)} ({storageData.breakdown.project_uploads.count} files)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Renders</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatBytes(storageData.breakdown.renders.bytes)} ({storageData.breakdown.renders.count} files)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Templates</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatBytes(storageData.breakdown.templates.bytes)} ({storageData.breakdown.templates.count} files)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!storageData.breakdown && (
            <Button
              variant="outline"
              size="sm"
              onClick={getStorageBreakdown}
            >
              <Database className="h-4 w-4 mr-2" />
              View Breakdown
            </Button>
          )}
          
          {(isNearLimit || isOverLimit) && (
            <Button
              size="sm"
              onClick={() => router.push('/settings/billing')}
            >
              Upgrade Storage
            </Button>
          )}
        </div>

        {/* Current Plan Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Your {currentTier} plan includes {storageData.limit === -1 ? 'unlimited' : `${storageData.limit} GB of`} storage.
            {storageData.limit !== -1 && ' Additional storage may incur extra charges.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

