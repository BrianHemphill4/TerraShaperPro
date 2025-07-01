'use client';

import { formatDistanceToNow } from 'date-fns';
import { Crown, Mail, MoreVertical, Shield, User, UserPlus, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { api } from '@/lib/api';

export function TeamSeatsManagement() {
  const router = useRouter();
  const { checkUsageLimit, currentTier } = useFeatureGate();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const { data: members, isLoading: membersLoading } = api.team.listMembers.useQuery({
    limit: 100,
  });

  const { data: invitations, isLoading: invitationsLoading } = api.team.listInvitations.useQuery({
    status: 'pending',
  });

  const { data: seatLimit } = api.billing.checkUsageLimit.useQuery({
    limitType: 'team_members',
  });

  const updateRole = api.team.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success('Team member role updated');
    },
  });

  const removeUser = api.team.removeUser.useMutation({
    onSuccess: () => {
      toast.success('Team member removed');
    },
  });

  const cancelInvitation = api.team.cancelInvitation.useMutation({
    onSuccess: () => {
      toast.success('Invitation cancelled');
    },
  });

  const resendInvitation = api.team.resendInvitation.useMutation({
    onSuccess: () => {
      toast.success('Invitation resent');
    },
  });

  const totalSeatsUsed = (members?.members.length || 0) + (invitations?.invitations.length || 0);
  const seatsAvailable = seatLimit ? seatLimit.limit - totalSeatsUsed : 0;
  const percentageUsed = seatLimit ? (totalSeatsUsed / seatLimit.limit) * 100 : 0;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="size-4" />;
      case 'admin':
        return <Shield className="size-4" />;
      default:
        return <User className="size-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (membersLoading || invitationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Seats</CardTitle>
          <CardDescription>Loading team information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-40 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Seats</CardTitle>
            <CardDescription>Manage your team members and seat allocation</CardDescription>
          </div>
          <Button
            onClick={() => router.push('/settings/team/invite')}
            disabled={seatsAvailable <= 0}
          >
            <UserPlus className="mr-2 size-4" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seat Usage Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Seats Used</span>
            <span className="text-muted-foreground">
              {totalSeatsUsed} / {seatLimit?.limit === -1 ? 'Unlimited' : seatLimit?.limit || 0}
            </span>
          </div>
          {seatLimit?.limit !== -1 && <Progress value={percentageUsed} />}
          {seatsAvailable <= 0 && seatLimit?.limit !== -1 && (
            <p className="text-sm text-amber-600">
              No seats available. Remove members or upgrade your plan to add more.
            </p>
          )}
        </div>

        {/* Active Members */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Active Members ({members?.members.length || 0})</h4>
          <div className="space-y-2">
            {members?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.full_name || member.email}</p>
                    <p className="text-muted-foreground text-xs">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeColor(member.role)}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1 capitalize">{member.role}</span>
                  </Badge>

                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            updateRole.mutate({
                              userId: member.id,
                              role: member.role === 'admin' ? 'member' : 'admin',
                            });
                          }}
                        >
                          {member.role === 'admin' ? 'Change to Member' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Remove ${member.email} from the team?`)) {
                              removeUser.mutate({ userId: member.id });
                            }
                          }}
                        >
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations && invitations.invitations.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              Pending Invitations ({invitations.invitations.length})
            </h4>
            <div className="space-y-2">
              {invitations.invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border border-dashed p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                      <Mail className="text-muted-foreground size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invitation.email}</p>
                      <p className="text-muted-foreground text-xs">
                        Invited{' '}
                        {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getRoleIcon(invitation.role)}
                      <span className="ml-1 capitalize">{invitation.role}</span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resendInvitation.mutate({ invitationId: invitation.id })}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        if (confirm('Cancel this invitation?')) {
                          cancelInvitation.mutate({ invitationId: invitation.id });
                        }
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Info */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Your {currentTier} plan includes{' '}
              {seatLimit?.limit === -1 ? 'unlimited' : seatLimit?.limit} team seats.
            </p>
            {seatLimit?.limit !== -1 && seatsAvailable <= 2 && (
              <Button variant="outline" size="sm" onClick={() => router.push('/settings/billing')}>
                <Users className="mr-2 size-4" />
                Add More Seats
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
