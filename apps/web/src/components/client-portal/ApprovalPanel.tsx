'use client';

import { useState } from 'react';
import { api } from '~/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import type { ProjectApproval, ApprovalStatus } from '@terrashaper/shared';

interface ApprovalPanelProps {
  projectId: string;
  versionId?: string;
}

const statusConfig: Record<ApprovalStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-500',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-500',
  },
  revision_requested: {
    label: 'Revision Requested',
    icon: AlertCircle,
    color: 'bg-orange-500',
  },
};

export function ApprovalPanel({ projectId, versionId }: ApprovalPanelProps) {
  const [notes, setNotes] = useState('');

  const { data: approvals, refetch } = api.clientPortal.listApprovals.useQuery({
    projectId,
  });

  const createApprovalMutation = api.clientPortal.createApprovalRequest.useMutation({
    onSuccess: () => {
      setNotes('');
      refetch();
    },
  });

  const handleRequestApproval = () => {
    createApprovalMutation.mutate({
      projectId,
      versionId,
      notes,
    });
  };

  const currentApproval = approvals?.find(
    (a: ProjectApproval) => !versionId || a.version_id === versionId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Status</CardTitle>
      </CardHeader>
      <CardContent>
        {currentApproval ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {(() => {
                  const config = statusConfig[currentApproval.status];
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon className={`h-5 w-5 ${config.color} text-white rounded-full p-1`} />
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                    </>
                  );
                })()}
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(currentApproval.created_at), { addSuffix: true })}
              </span>
            </div>

            {currentApproval.notes && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium">Notes:</p>
                <p className="text-sm text-gray-600">{currentApproval.notes}</p>
              </div>
            )}

            {currentApproval.approved_by && (
              <p className="text-sm text-gray-500">
                {currentApproval.status === 'approved' ? 'Approved' : 'Reviewed'} by{' '}
                {currentApproval.approved_by}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                No approval has been requested for this project yet.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Textarea
                placeholder="Add notes for the reviewer (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleRequestApproval}
                className="w-full"
                disabled={createApprovalMutation.isLoading}
              >
                {createApprovalMutation.isLoading ? 'Requesting...' : 'Request Approval'}
              </Button>
            </div>
          </div>
        )}

        {/* Approval history */}
        {approvals && approvals.length > 1 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">Approval History</h4>
            <div className="space-y-2">
              {approvals.slice(1).map((approval: ProjectApproval & {
                requested_by_user?: { email: string; full_name?: string }
              }) => (
                <div key={approval.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {statusConfig[approval.status].label}
                    </Badge>
                    <span className="text-gray-500">
                      by {approval.requested_by_user?.full_name || approval.requested_by_user?.email}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}