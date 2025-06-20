# Render Endpoints

Create and manage AI-powered landscape visualizations.

## render.create

Create a new render job for a project.

### Request
```typescript
{
  projectId: string;                    // Required
  prompt?: {
    user?: string;                      // Custom prompt text
    style?: string;                     // Style modifier
  };
  annotations: Array<{                  // Design elements to render
    type: 'assetInstance';
    data: {
      id: string;
      category: string;
      name: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      attributes?: Record<string, any>;
    };
  }>;
  settings: {
    resolution: string;                 // e.g., "1920x1080", "2048x1536"
    quality?: number;                   // 1-100, default: 75
    provider?: 'auto' | 'openai' | 'google-imagen';
    style?: 'realistic' | 'artistic' | 'sketch';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    weather?: 'clear' | 'cloudy' | 'rainy';
    cameraAngle?: 'eye-level' | 'aerial' | 'bird-eye';
    format?: 'jpg' | 'png' | 'webp';
  };
  priority?: 'low' | 'normal' | 'high'; // Queue priority
}
```

### Response
```typescript
{
  renderId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queuePosition: number;
  estimatedTime: number;                // Seconds
  creditsRequired: number;
  message: string;
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/render.create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "projectId": "proj_abc123",
      "annotations": [
        {
          "type": "assetInstance",
          "data": {
            "id": "1",
            "category": "tree",
            "name": "Live Oak",
            "position": { "x": 100, "y": 200 },
            "size": { "width": 150, "height": 180 }
          }
        }
      ],
      "settings": {
        "resolution": "1920x1080",
        "quality": 85,
        "style": "realistic",
        "timeOfDay": "afternoon",
        "season": "spring"
      }
    }
  }'
```

## render.status

Check the status of a render job.

### Request
```typescript
{
  renderId: string;
}
```

### Response
```typescript
{
  renderId: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;                     // 0-100
  queuePosition?: number;               // If queued
  result?: {
    imageUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    format: string;
    fileSize: number;                   // Bytes
    metadata: {
      promptHash: string;
      provider: string;
      processingTime: number;           // Milliseconds
      quality: {
        score: number;                  // 0-100
        issues: string[];
      };
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/render.status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"renderId": "rnd_xyz789"}}'
```

## render.list

List all renders for a project or organization.

### Request
```typescript
{
  projectId?: string;                   // Filter by project
  status?: ('queued' | 'processing' | 'completed' | 'failed')[];
  qualityStatus?: ('pending' | 'approved' | 'rejected')[];
  dateRange?: {
    start: string;                      // ISO date
    end: string;
  };
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'completedAt' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}
```

### Response
```typescript
{
  renders: Array<{
    renderId: string;
    projectId: string;
    projectName: string;
    status: string;
    thumbnailUrl?: string;
    imageUrl?: string;
    resolution: string;
    fileSize?: number;
    creditsUsed: number;
    qualityScore?: number;
    createdAt: string;
    completedAt?: string;
    creator: {
      id: string;
      name: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalRenders: number;
    successRate: number;
    averageTime: number;
    creditsUsed: number;
  };
}
```

## render.retry

Retry a failed render job.

### Request
```typescript
{
  renderId: string;
  settings?: {                          // Override original settings
    provider?: string;
    quality?: number;
  };
}
```

### Response
```typescript
{
  renderId: string;                     // New render ID
  status: string;
  queuePosition: number;
  message: string;
}
```

## render.delete

Delete a render and its associated files.

### Request
```typescript
{
  renderId: string;
}
```

### Response
```typescript
{
  success: boolean;
  message: string;
}
```

## render.download

Get a temporary download URL for a render.

### Request
```typescript
{
  renderId: string;
  format?: 'original' | 'optimized';   // Default: 'original'
}
```

### Response
```typescript
{
  downloadUrl: string;
  expiresAt: string;                    // ISO timestamp
  filename: string;
  size: number;                         // Bytes
  format: string;
}
```

## render.feedback

Submit quality feedback for a render.

### Request
```typescript
{
  renderId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: {
    issues?: ('lighting' | 'perspective' | 'plant_accuracy' | 'colors' | 'other')[];
    comments?: string;
    suggestedImprovements?: string;
  };
}
```

### Response
```typescript
{
  success: boolean;
  message: string;
  creditsRefunded?: number;             // If quality issues warrant refund
}
```

## render.estimate

Estimate credits and time for a render without creating it.

### Request
```typescript
{
  resolution: string;
  quality?: number;
  annotationCount: number;
  settings?: {
    provider?: string;
    style?: string;
  };
}
```

### Response
```typescript
{
  credits: number;
  estimatedTime: {
    min: number;                        // Seconds
    max: number;
    average: number;
  };
  queueLength: number;
  priceEstimate?: {
    amount: number;
    currency: string;
  };
}
```

## Webhooks

### render.completed
```json
{
  "event": "render.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "renderId": "rnd_xyz789",
    "projectId": "proj_abc123",
    "status": "completed",
    "imageUrl": "https://storage.terrashaperpro.com/renders/...",
    "thumbnailUrl": "https://storage.terrashaperpro.com/thumbs/...",
    "processingTime": 45000,
    "creditsUsed": 2
  }
}
```

### render.failed
```json
{
  "event": "render.failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "renderId": "rnd_xyz789",
    "projectId": "proj_abc123",
    "status": "failed",
    "error": {
      "code": "PROVIDER_ERROR",
      "message": "Image generation failed"
    },
    "creditsRefunded": 2
  }
}
```

## Error Responses

### 402 Payment Required
```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Not enough credits. Required: 2, Available: 0"
  }
}
```

### 429 Too Many Requests
```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Render limit exceeded. Maximum 10 renders per minute."
  }
}
```

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid resolution format. Use format: WIDTHxHEIGHT"
  }
}
```