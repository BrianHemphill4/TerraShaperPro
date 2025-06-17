export interface RenderJobData {
  renderId: string;
  projectId: string;
  sceneId: string;
  userId: string;
  organizationId: string;
  subscriptionTier: 'starter' | 'pro' | 'growth';
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
}

export interface RenderJobResult {
  renderId: string;
  imageUrl: string;
  thumbnailUrl: string;
  processingTime: number;
  promptHash: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    fileSize: number;
  };
}

export interface NotificationJobData {
  type: 'email' | 'in-app' | 'push';
  userId: string;
  template: string;
  data: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';