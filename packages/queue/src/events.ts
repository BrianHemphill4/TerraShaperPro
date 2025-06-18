import { EventEmitter } from 'events';
import { QueueEvents } from 'bullmq';
import { getRenderQueueEvents } from './queues/render.queue';

export interface RenderQueueEventData {
  progress: { jobId: string; progress: number };
  completed: { jobId: string; result: any };
  failed: { jobId: string; error: Error };
}

class QueueEventEmitter extends EventEmitter {
  private queueEvents!: QueueEvents;
  private initialized = false;

  constructor() {
    super();
    this.setMaxListeners(100); // Allow many SSE connections
  }

  initialize() {
    if (this.initialized) return;
    
    this.queueEvents = getRenderQueueEvents();
    
    // Set up queue event listeners
    this.queueEvents.on('progress', (data) => {
      this.emit('progress', {
        jobId: data.jobId,
        progress: data.data,
      });
    });

    this.queueEvents.on('completed', (data) => {
      this.emit('completed', {
        jobId: data.jobId,
        result: data.returnvalue,
      });
    });

    this.queueEvents.on('failed', (data) => {
      this.emit('failed', {
        jobId: data.jobId,
        error: new Error(data.failedReason || 'Job failed'),
      });
    });

    this.initialized = true;
  }

  async close() {
    if (this.queueEvents) {
      await this.queueEvents.close();
    }
    this.removeAllListeners();
  }
}

// Singleton instance
let queueEventEmitter: QueueEventEmitter | null = null;

export function getQueueEventEmitter(): QueueEventEmitter {
  if (!queueEventEmitter) {
    queueEventEmitter = new QueueEventEmitter();
    queueEventEmitter.initialize();
  }
  return queueEventEmitter;
}

export { getRenderQueueEvents };