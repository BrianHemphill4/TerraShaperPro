'use client';

import { AlertTriangle, Database, FileImage, HardDrive, Layout } from 'lucide-react';

import { Button } from '../button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Progress } from '../progress';

export type StorageBreakdown = {
  project_uploads: { bytes: number; count: number };
  renders: { bytes: number; count: number };
  templates: { bytes: number; count: number };
}

export type StorageUsageProps = {
  current: number;
  limit: number;
  percentage: number;
  breakdown?: StorageBreakdown;
  currentTier?: string;
  onViewBreakdown?: () => void;
  onUpgradeStorage?: () => void;
  formatBytes?: (bytes: number) => string;
  loading?: boolean;
}

const defaultFormatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export function StorageUsage({
  current,
  limit,
  percentage,
  breakdown,
  currentTier = 'current',
  onViewBreakdown,
  onUpgradeStorage,
  formatBytes = defaultFormatBytes,
  loading = false,
}: StorageUsageProps) {
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage >= 100;

  if (loading) {
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
              {current.toFixed(2)} GB /{' '}
              {limit === -1 ? 'Unlimited' : `${limit} GB`}
            </span>
          </div>
          <Progress
            value={limit === -1 ? 0 : percentage}
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
        {breakdown && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Storage Breakdown</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="text-muted-foreground size-4" />
                  <span className="text-sm">Project Uploads</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatBytes(breakdown.project_uploads.bytes)} (
                  {breakdown.project_uploads.count} files)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="text-muted-foreground size-4" />
                  <span className="text-sm">Renders</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatBytes(breakdown.renders.bytes)} (
                  {breakdown.renders.count} files)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="text-muted-foreground size-4" />
                  <span className="text-sm">Templates</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatBytes(breakdown.templates.bytes)} (
                  {breakdown.templates.count} files)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!breakdown && onViewBreakdown && (
            <Button variant="outline" size="sm" onClick={onViewBreakdown}>
              <Database className="mr-2 size-4" />
              View Breakdown
            </Button>
          )}

          {(isNearLimit || isOverLimit) && onUpgradeStorage && (
            <Button size="sm" onClick={onUpgradeStorage}>
              Upgrade Storage
            </Button>
          )}
        </div>

        {/* Current Plan Info */}
        <div className="border-t pt-4">
          <p className="text-muted-foreground text-xs">
            Your {currentTier} plan includes{' '}
            {limit === -1 ? 'unlimited' : `${limit} GB of`} storage.
            {limit !== -1 && ' Additional storage may incur extra charges.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}