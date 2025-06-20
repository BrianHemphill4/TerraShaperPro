'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User,
  MoreVertical,
  Mail,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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
          <div className="h-40 bg-muted animate-pulse rounded" />
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
            <CardDescription>
              Manage your team members and seat allocation
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push('/settings/team/invite')}
            disabled={seatsAvailable <= 0}
          >
            <UserPlus className="h-4 w-4 mr-2" />
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
          {seatLimit?.limit !== -1 && (
            <Progress value={percentageUsed} />
          )}
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
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.full_name || member.email}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
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
                  className="flex items-center justify-between p-3 rounded-lg border border-dashed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
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
                      className="h-8 w-8"
                      onClick={() => {
                        if (confirm('Cancel this invitation?')) {
                          cancelInvitation.mutate({ invitationId: invitation.id });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Info */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Your {currentTier} plan includes {seatLimit?.limit === -1 ? 'unlimited' : seatLimit?.limit} team seats.
            </p>
            {seatLimit?.limit !== -1 && seatsAvailable <= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/settings/billing')}
              >
                <Users className="h-4 w-4 mr-2" />
                Add More Seats
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}