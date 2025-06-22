'use client';

import { formatDistanceToNow } from 'date-fns';
import { History, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

type VersionTimelineProps = {
  projectId: string;
}

export function VersionTimeline({ projectId }: VersionTimelineProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, refetch, fetchNextPage: _fetchNextPage } = (trpc as any).project.listVersions.useInfiniteQuery(
    {
      projectId,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage: any) =>
        lastPage.hasMore ? lastPage.versions[lastPage.versions.length - 1]?.id : undefined,
    }
  );

  const restoreMutation = (trpc as any).project.restoreVersion.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const pages = data?.pages ?? [];
  const versions = pages.flatMap((p: any) => p.versions);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading versions…</p>;
  }

  if (versions.length === 0) {
    return <p className="text-muted-foreground">No versions yet.</p>;
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      return [...prev.slice(-1), id]; // keep max 2 selections
    });
  };

  const diffQuery = (trpc as any).project.getVersionDiff.useQuery(
    selectedIds.length === 2
      ? { versionIdA: selectedIds[0], versionIdB: selectedIds[1] }
      : undefined,
    {
      enabled: selectedIds.length === 2,
    }
  );

  return (
    <div className="space-y-4">
      {versions.map((version: any) => (
        <Card key={version.id} className={selectedIds.includes(version.id) ? 'border-primary' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <History className="size-4" />
              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleSelect(version.id)}
              >
                {selectedIds.includes(version.id) ? 'Unselect' : 'Select'}
              </Button>
              <Button
                size="sm"
                onClick={() => restoreMutation.mutate({ versionId: version.id })}
                disabled={restoreMutation.isLoading}
              >
                <RefreshCcw className="mr-1 size-3" /> Restore
              </Button>
            </div>
          </CardHeader>
          {version.comment && (
            <CardContent className="text-sm text-muted-foreground">
              {version.comment}
            </CardContent>
          )}
        </Card>
      ))}

      {selectedIds.length === 2 && diffQuery.data && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-semibold">Diff</h3>
          <ReactDiffViewer
            oldValue={JSON.stringify(diffQuery.data.snapshotA, null, 2)}
            newValue={JSON.stringify(diffQuery.data.snapshotB, null, 2)}
            splitView
          />
        </div>
      )}
    </div>
  );
} 