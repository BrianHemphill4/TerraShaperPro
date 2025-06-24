'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';

type RenderProgressProps = {
  renderId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
};

export function RenderProgress({ renderId, onComplete, onError }: RenderProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>(
    'pending'
  );
  const [error, setError] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  const { data: renderStatus } = trpc.render.status.useQuery(
    { renderId },
    {
      refetchInterval: status === 'completed' || status === 'failed' ? false : 2000,
    }
  );

  const { data: queueMetrics } = trpc.render.metrics.useQuery(undefined, {
    refetchInterval: status === 'completed' || status === 'failed' ? false : 5000,
  });

  const retryMutation = trpc.render.retry.useMutation({
    onSuccess: () => {
      setStatus('pending');
      setProgress(0);
      setError(null);
    },
  });

  // Subscribe to real-time updates
  trpc.render.subscribe.useSubscription(
    { renderId },
    {
      onData: (data) => {
        if (data.type === 'progress' && data.progress) {
          setProgress(data.progress);
          setStatus('processing');
        } else if (data.type === 'completed' && data.result) {
          setProgress(100);
          setStatus('completed');
          onComplete?.(data.result);
        } else if (data.type === 'failed' && data.error) {
          setStatus('failed');
          setError(data.error);
          onError?.(data.error);
        }
      },
    }
  );

  // Update status from query
  useEffect(() => {
    if (renderStatus) {
      setStatus(renderStatus.status as any);
      setProgress(renderStatus.progress || 0);
      if (renderStatus.error) {
        setError(renderStatus.error);
      }
    }
  }, [renderStatus]);

  // Calculate queue position
  useEffect(() => {
    if (queueMetrics && status === 'pending') {
      // Find position in queue
      const position = queueMetrics.waiting + 1;
      setQueuePosition(position);

      // Estimate time based on average processing time
      const avgTime =
        queueMetrics.completed > 0 ? queueMetrics.processingTime / queueMetrics.completed : 30000; // Default 30s

      const estimatedMs = position * avgTime;
      setEstimatedTime(Math.ceil(estimatedMs / 1000)); // Convert to seconds
    }
  }, [queueMetrics, status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="size-5 text-orange-500" />;
      case 'processing':
        return <Loader2 className="size-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="size-5 text-green-500" />;
      case 'failed':
        return <XCircle className="size-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle>Render Progress</CardTitle>
          </div>
          <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
        </div>
        <CardDescription>
          {status === 'pending' && 'Your render is queued and will start soon'}
          {status === 'processing' && 'AI is generating your landscape visualization'}
          {status === 'completed' && 'Your render is ready!'}
          {status === 'failed' && 'Something went wrong with your render'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {(status === 'pending' || status === 'processing') && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>{progress}%</span>
              {estimatedTime && status === 'pending' && (
                <span>~{formatTime(estimatedTime)} remaining</span>
              )}
            </div>
          </div>
        )}

        {/* Queue Position */}
        {status === 'pending' && queuePosition && (
          <Alert>
            <Users className="size-4" />
            <AlertTitle>Queue Position</AlertTitle>
            <AlertDescription>
              You are #{queuePosition} in the queue.
              {queueMetrics?.active && queueMetrics.active > 0 && (
                <span>
                  {' '}
                  {queueMetrics.active} render{queueMetrics.active > 1 ? 's' : ''} currently
                  processing.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Processing Steps */}
        {status === 'processing' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles
                className={`size-4 ${progress >= 20 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span
                className={`text-sm ${progress >= 20 ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Analyzing design elements
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles
                className={`size-4 ${progress >= 50 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span
                className={`text-sm ${progress >= 50 ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Generating landscape visualization
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles
                className={`size-4 ${progress >= 80 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span
                className={`text-sm ${progress >= 80 ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Finalizing render quality
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'failed' && error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Render Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Retry Button */}
        {status === 'failed' && (
          <Button
            onClick={() => retryMutation.mutate({ renderId })}
            disabled={retryMutation.isLoading}
            className="w-full"
          >
            {retryMutation.isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Retry Render
          </Button>
        )}

        {/* Success State */}
        {status === 'completed' && renderStatus?.imageUrl && (
          <div className="space-y-4">
            <Image
              src={renderStatus.imageUrl}
              alt="Rendered landscape"
              width={800}
              height={600}
              className="rounded-lg shadow-lg"
              priority
            />
            <div className="flex space-x-2">
              <Button asChild className="flex-1">
                <a href={renderStatus.imageUrl} download>
                  Download Full Resolution
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
