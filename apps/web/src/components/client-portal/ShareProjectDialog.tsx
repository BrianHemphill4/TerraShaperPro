'use client';

import { Copy, Link, Mail } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/modal';
import { api } from '@/lib/api';

type ShareProjectDialogProps = {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareProjectDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ShareProjectDialogProps) {
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [expiresIn, setExpiresIn] = useState('168'); // 7 days
  const [permissions, setPermissions] = useState({
    view: true,
    comment: true,
    approve: false,
  });
  const [shareUrl, setShareUrl] = useState('');

  const createLinkMutation = api.clientPortal.createAccessLink.useMutation({
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
    },
  });

  const handleCreateLink = () => {
    createLinkMutation.mutate({
      projectId,
      clientEmail: clientEmail || undefined,
      clientName: clientName || undefined,
      permissions,
      expiresIn: expiresIn ? Number.parseInt(expiresIn) : undefined,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Create a secure link to share "{projectName}" with your client
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name (Optional)</Label>
              <Input
                id="clientName"
                placeholder="John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresIn">Link Expires In (Hours)</Label>
              <Input
                id="expiresIn"
                type="number"
                placeholder="168"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave empty for no expiration. Default is 7 days (168 hours).
              </p>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view"
                    checked={permissions.view}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, view: !!checked })
                    }
                  />
                  <Label htmlFor="view" className="font-normal">
                    View project
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="comment"
                    checked={permissions.comment}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, comment: !!checked })
                    }
                  />
                  <Label htmlFor="comment" className="font-normal">
                    Add comments and feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approve"
                    checked={permissions.approve}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, approve: !!checked })
                    }
                  />
                  <Label htmlFor="approve" className="font-normal">
                    Approve or reject designs
                  </Label>
                </div>
              </div>
            </div>

            {createLinkMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>{createLinkMutation.error.message}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleCreateLink}
              className="w-full"
              disabled={createLinkMutation.isLoading}
            >
              <Link className="mr-2 size-4" />
              {createLinkMutation.isLoading ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Share link created successfully! Your client can use this link to view the project.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex space-x-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopyLink} size="sm">
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={() => {
                setShareUrl('');
                setClientEmail('');
                setClientName('');
                onOpenChange(false);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
