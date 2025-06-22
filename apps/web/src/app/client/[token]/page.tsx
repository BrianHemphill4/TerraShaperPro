'use client';

import { 
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare, 
  XCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import DesignCanvas from '@/components/canvas/DesignCanvas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

export default function ClientPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
  });
  const [isIdentified, setIsIdentified] = useState(false);

  const { data: projectData, isLoading, error } = api.clientPortal.getClientProject.useQuery(
    { token },
    { enabled: isIdentified || !clientInfo.name }
  );

  const [comment, setComment] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const createCommentMutation = api.clientPortal.createClientComment.useMutation();
  const submitApprovalMutation = api.clientPortal.submitClientApproval.useMutation();

  const handleIdentify = () => {
    if (clientInfo.name && clientInfo.email) {
      setIsIdentified(true);
    }
  };

  const handleAddComment = () => {
    if (comment.trim() && projectData?.project) {
      createCommentMutation.mutate({
        token,
        projectId: projectData.project.id,
        content: comment,
        authorEmail: clientInfo.email,
        authorName: clientInfo.name,
      });
      setComment('');
    }
  };

  const handleApproval = (approvalId: string, status: 'approved' | 'rejected' | 'revision_requested') => {
    submitApprovalMutation.mutate({
      token,
      approvalId,
      status,
      notes: approvalNotes,
      approverEmail: clientInfo.email,
      approverName: clientInfo.name,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 size-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {error.message || 'This link is invalid or has expired.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Client identification form
  if (!isIdentified && projectData?.clientName === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to TerraShaper Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleIdentify(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                View Project
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const project = projectData?.project;
  const permissions = projectData?.permissions || { view: true, comment: false, approve: false };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{project?.name}</h1>
              <p className="text-gray-600">{project?.description}</p>
            </div>
            <Badge>
              <Eye className="mr-1 size-3" />
              View Only
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="design" className="space-y-6">
          <TabsList>
            <TabsTrigger value="design">Design</TabsTrigger>
            {permissions.comment && <TabsTrigger value="comments">Comments</TabsTrigger>}
            {permissions.approve && <TabsTrigger value="approval">Approval</TabsTrigger>}
          </TabsList>

          <TabsContent value="design">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <DesignCanvas
                    initialData={project?.canvas_data}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {permissions.comment && (
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add your feedback..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button onClick={handleAddComment}>
                        <MessageSquare className="size-4" />
                      </Button>
                    </div>
                    
                    {/* Comments would be loaded here */}
                    <p className="text-sm text-gray-500">
                      Your comments will be visible to the design team.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {permissions.approve && (
            <TabsContent value="approval">
              <Card>
                <CardHeader>
                  <CardTitle>Design Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Your Decision</Label>
                      <Textarea
                        placeholder="Add notes about your decision..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApproval('approval-id', 'approved')}
                        className="flex-1"
                        variant="default"
                      >
                        <CheckCircle className="mr-2 size-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval('approval-id', 'revision_requested')}
                        className="flex-1"
                        variant="outline"
                      >
                        <AlertCircle className="mr-2 size-4" />
                        Request Changes
                      </Button>
                      <Button
                        onClick={() => handleApproval('approval-id', 'rejected')}
                        className="flex-1"
                        variant="destructive"
                      >
                        <XCircle className="mr-2 size-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}