'use client';

import type { ProjectComment } from '@terrashaper/shared';
import { formatDistanceToNow } from 'date-fns';
import { Check, MapPin, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

type CommentsPanelProps = {
  projectId: string;
  canResolve?: boolean;
};

export function CommentsPanel({ projectId, canResolve = true }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [includeResolved, setIncludeResolved] = useState(false);

  const {
    data: comments,
    isLoading,
    refetch,
  } = api.clientPortal.listComments.useQuery({
    projectId,
    includeResolved,
  });

  const createCommentMutation = api.clientPortal.createComment.useMutation({
    onSuccess: () => {
      setNewComment('');
      refetch();
    },
  });

  const resolveCommentMutation = api.clientPortal.resolveComment.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      createCommentMutation.mutate({
        projectId,
        content: newComment,
      });
    }
  };

  const handleResolveComment = (commentId: string, resolved: boolean) => {
    resolveCommentMutation.mutate({
      commentId,
      resolved,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments & Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
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
        <CardTitle className="flex items-center justify-between">
          <span>Comments & Feedback</span>
          <Button variant="ghost" size="sm" onClick={() => setIncludeResolved(!includeResolved)}>
            {includeResolved ? 'Hide' : 'Show'} Resolved
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new comment */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || createCommentMutation.isLoading}
            >
              <MessageSquare className="size-4" />
            </Button>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {comments?.map(
              (
                comment: ProjectComment & {
                  author?: { email: string; full_name?: string };
                  replies: ProjectComment[];
                }
              ) => (
                <div
                  key={comment.id}
                  className={`rounded-lg border p-4 ${comment.is_resolved ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {comment.author?.full_name ||
                            comment.author?.email ||
                            comment.author_name ||
                            comment.author_email}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {comment.position && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="mr-1 size-3" />
                            On canvas
                          </Badge>
                        )}
                        {comment.is_resolved && (
                          <Badge variant="secondary" className="text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm">{comment.content}</p>
                    </div>

                    {canResolve && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveComment(comment.id, !comment.is_resolved)}
                      >
                        {comment.is_resolved ? (
                          <X className="size-4" />
                        ) : (
                          <Check className="size-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-4 space-y-2">
                      {comment.replies.map((reply: ProjectComment) => (
                        <div key={reply.id} className="rounded border-l-2 pl-3">
                          <p className="text-sm font-medium">
                            {reply.author_name || reply.author_email}
                          </p>
                          <p className="text-sm text-gray-600">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
