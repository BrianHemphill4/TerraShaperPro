# Queue Package

BullMQ-based job queue system for managing background tasks, particularly AI rendering jobs, with Redis as the backing store.

## Purpose

- **Job Management**: Scalable background job processing with BullMQ
- **Render Queue**: Specialized queue for AI landscape rendering jobs
- **Event System**: Type-safe event handling for job lifecycle
- **Priority Handling**: Subscription-based job prioritization
- **Rate Limiting**: Queue-level rate limiting and concurrency control

## Core Components

### RenderQueue
Main queue class for render job management:

```typescript
import { RenderQueue } from '@terrashaper/queue'

const queue = new RenderQueue()

// Add render job
await queue.addRenderJob({
  projectId: 'proj_123',
  userId: 'user_456',
  annotations: [...],
  priority: 'high',
  subscriptionTier: 'pro'
})

// Process jobs
queue.process(async (job) => {
  const { projectId, annotations } = job.data
  // Render processing logic
})
```

### Event System
Type-safe event handling for job lifecycle:

```typescript
import { QueueEvents } from '@terrashaper/queue'

// Job events
queue.on('job:started', (job) => {
  console.log(`Render job ${job.id} started`)
})

queue.on('job:completed', (job, result) => {
  console.log(`Render job ${job.id} completed`)
})

queue.on('job:failed', (job, error) => {
  console.error(`Render job ${job.id} failed:`, error)
})
```

## Job Types

### Render Jobs
AI landscape rendering with the following data structure:

```typescript
interface RenderJobData {
  projectId: string
  userId: string
  organizationId: string
  annotations: DesignAnnotation[]
  style: RenderStyle
  quality: RenderQuality
  subscriptionTier: SubscriptionTier
  priority: JobPriority
}
```

### Future Job Types
- **Email Jobs**: Notification delivery
- **Analytics Jobs**: Usage data processing  
- **Backup Jobs**: Data archival
- **Cleanup Jobs**: Temporary file removal

## Queue Configuration

```typescript
const queueConfig = {
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  },
  settings: {
    stalledInterval: 30000,
    maxStalledCount: 1
  }
}
```

## Priority System

Jobs are prioritized based on subscription tiers:

- **Growth**: Priority 1 (highest)
- **Pro**: Priority 2  
- **Starter**: Priority 3 (lowest)

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Run tests (requires Redis)
npm run test

# Type check
npm run typecheck
```

## Redis Requirements

The queue requires Redis 6.0+ for optimal performance:

```bash
# Start Redis locally
docker run -d -p 6379:6379 redis:alpine

# Or use Redis Cloud/ElastiCache in production
```

## Dependencies

- **BullMQ**: Job queue system
- **Redis**: In-memory data store
- **IORedis**: Redis client for Node.js