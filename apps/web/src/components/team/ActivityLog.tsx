'use client';

import type { ActivityLog } from '@terrashaper/shared';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity,
  AlertCircle,
  FileText, 
  Palette, 
  Shield, 
  UserMinus, 
  UserPlus
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'user.invited': UserPlus,
  'user.joined': UserPlus,
  'user.role_changed': Shield,
  'user.removed': UserMinus,
  'project.created': FileText,
  'project.updated': FileText,
  'project.deleted': FileText,
  'project.shared': FileText,
  'render.started': Palette,
  'render.completed': Palette,
  'render.failed': AlertCircle,
  'org.settings_updated': Activity,
  'org.subscription_changed': Activity,
};

const actionLabels: Record<string, string> = {
  'user.invited': 'invited',
  'user.joined': 'joined the team',
  'user.role_changed': 'changed role of',
  'user.removed': 'removed',
  'project.created': 'created project',
  'project.updated': 'updated project',
  'project.deleted': 'deleted project',
  'project.shared': 'shared project',
  'render.started': 'started render',
  'render.completed': 'completed render',
  'render.failed': 'render failed',
  'org.settings_updated': 'updated organization settings',
  'org.subscription_changed': 'changed subscription',
};

export function ActivityLogComponent() {
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const { data, isLoading } = api.team.getActivityLogs.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.logs.map((log: ActivityLog & { user?: { email: string; full_name?: string } }) => {
            const Icon = actionIcons[log.action] || Activity;
            const actionLabel = actionLabels[log.action] || log.action;

            return (
              <div key={log.id} className="flex items-start space-x-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                  <Icon className="size-4 text-gray-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {log.user?.full_name || log.user?.email || 'System'}
                    </span>{' '}
                    {actionLabel}
                    {log.metadata?.email && (
                      <> <span className="font-medium">{log.metadata.email}</span></>
                    )}
                    {log.metadata?.newRole && (
                      <> to <Badge variant="outline" className="ml-1">{log.metadata.newRole}</Badge></>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {data && data.total > pageSize && (
          <div className="mt-4 flex justify-center space-x-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              Previous
            </button>
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * pageSize >= data.total}
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}