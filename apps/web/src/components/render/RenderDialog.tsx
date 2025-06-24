'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';

import { RenderProgress } from './RenderProgress';

type RenderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sceneId: string;
  sourceImageUrl: string;
  maskImageUrl?: string;
  prompt: {
    system: string;
    user: string;
  };
  annotations: Array<{
    type: 'mask' | 'assetInstance' | 'textLabel';
    data: any;
  }>;
  settings: {
    provider: 'google-imagen' | 'openai-gpt-image';
    resolution: '1024x1024' | '2048x2048' | '4096x4096';
    format: 'PNG' | 'JPEG';
    quality?: number;
  };
  onComplete?: (result: any) => void;
};

export function RenderDialog({
  open,
  onOpenChange,
  projectId,
  sceneId,
  sourceImageUrl,
  maskImageUrl,
  prompt,
  annotations,
  settings,
  onComplete,
}: RenderDialogProps) {
  const [renderId, setRenderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: balance } = trpc.credit.balance.useQuery();

  const createRenderMutation = trpc.render.create.useMutation({
    onSuccess: (data) => {
      setRenderId(data.renderId);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Automatically create render when dialog opens
  useState(() => {
    if (open && !renderId && !createRenderMutation.isLoading) {
      createRenderMutation.mutate({
        projectId,
        sceneId,
        sourceImageUrl,
        maskImageUrl,
        prompt,
        annotations,
        settings,
      });
    }
  });

  const handleComplete = (result: any) => {
    onComplete?.(result);
    // Keep dialog open to show the result
  };

  const handleClose = () => {
    setRenderId(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generating Landscape Visualization</DialogTitle>
          <DialogDescription>
            AI is creating a photorealistic render of your design
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Credit Balance Warning */}
          {balance && balance.balance <= 10 && (
            <Alert variant="warning">
              <AlertCircle className="size-4" />
              <AlertDescription>
                You have {balance.balance} credits remaining.
                {balance.balance === 0 && ' Purchase more credits to continue rendering.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Render Progress */}
          {renderId && (
            <RenderProgress renderId={renderId} onComplete={handleComplete} onError={setError} />
          )}

          {/* Loading State */}
          {!renderId && !error && createRenderMutation.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="space-y-2 text-center">
                <div className="border-primary mx-auto size-8 animate-spin rounded-full border-b-2" />
                <p className="text-muted-foreground text-sm">Initializing render...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
