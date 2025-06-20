'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send } from 'lucide-react';
import type { UserRole } from '@terrashaper/shared';

interface InviteUserFormProps {
  onInviteSent?: () => void;
}

export function InviteUserForm({ onInviteSent }: InviteUserFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [showSuccess, setShowSuccess] = useState(false);

  const inviteMutation = api.team.createInvitation.useMutation({
    onSuccess: () => {
      setEmail('');
      setRole('member');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      onInviteSent?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email, role });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full organization management</SelectItem>
                <SelectItem value="designer">Designer - Create and manage projects</SelectItem>
                <SelectItem value="member">Member - View and collaborate</SelectItem>
                <SelectItem value="viewer">Viewer - View only access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inviteMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {inviteMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <Alert>
              <AlertDescription>
                Invitation sent successfully! The user will receive an email to join your organization.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={inviteMutation.isLoading || !email}
          >
            <Send className="mr-2 h-4 w-4" />
            {inviteMutation.isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}