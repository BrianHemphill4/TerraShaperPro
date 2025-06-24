'use client';

import type { User, UserRole } from '@terrashaper/shared';
import { MoreVertical, Shield, UserX } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type TeamMembersListProps = {
  currentUserId: string;
  currentUserRole: UserRole;
};

const roleColors: Record<UserRole, string> = {
  owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  designer: 'bg-green-500',
  member: 'bg-gray-500',
  viewer: 'bg-yellow-500',
};

export function TeamMembersList({ currentUserId, currentUserRole }: TeamMembersListProps) {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.team.listMembers.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  const updateRoleMutation = api.team.updateUserRole.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const removeUserMutation = api.team.removeUser.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    setMemberToRemove(memberId);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      removeUserMutation.mutate({ userId: memberToRemove });
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.members.map((member: User) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                    {member.full_name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.full_name || member.email}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <Badge className={roleColors[member.role]}>{member.role}</Badge>
                </div>

                {canManageTeam && member.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'admin')}
                        disabled={member.role === 'admin'}
                      >
                        <Shield className="mr-2 size-4" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'designer')}
                        disabled={member.role === 'designer'}
                      >
                        Make Designer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'member')}
                        disabled={member.role === 'member'}
                      >
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'viewer')}
                        disabled={member.role === 'viewer'}
                      >
                        Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600"
                      >
                        <UserX className="mr-2 size-4" />
                        Remove from team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>

          {data && data.total > pageSize && (
            <div className="mt-4 flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= data.total}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveMember}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
