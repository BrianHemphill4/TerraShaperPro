export enum RenderProvider {
  GOOGLE_IMAGEN = 'google-imagen',
  OPENAI_GPT_IMAGE = 'openai-gpt-image',
}

export interface RenderRequest {
  id: string;
  provider: RenderProvider;
  prompt: string;
  options: {
    width: number;
    height: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    style: 'realistic' | 'artistic' | 'architectural' | 'photographic';
  };
  metadata?: Record<string, any>;
}

export interface RenderResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    imageUrl: string;
    imageBase64?: string;
    metadata: Record<string, any>;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  progress?: number;
  estimatedTimeRemaining?: number;
}