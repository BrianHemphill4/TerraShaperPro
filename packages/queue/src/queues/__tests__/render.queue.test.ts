import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Queue, QueueEvents, Worker, Job } from 'bullmq';
import {
  getRenderQueue,
  getRenderQueueEvents,
  addRenderJob,
  createRenderWorker,
  getRenderJobCount,
  canUserSubmitRender,
  getQueueMetrics,
  closeRenderQueue,
} from '../render.queue';
import { RenderJobData, RenderJobResult } from '../../types';

// Mock BullMQ
vi.mock('bullmq', () => ({
  Queue: vi.fn(),
  QueueEvents: vi.fn(),
  Worker: vi.fn(),
}));

const MockedQueue = vi.mocked(Queue);
const MockedQueueEvents = vi.mocked(QueueEvents);
const MockedWorker = vi.mocked(Worker);

describe('Render Queue', () => {
  let mockQueue: any;
  let mockQueueEvents: any;
  let mockWorker: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock instances
    mockQueue = {
      add: vi.fn(),
      getJobs: vi.fn(),
      getWaitingCount: vi.fn(),
      getActiveCount: vi.fn(),
      getCompletedCount: vi.fn(),
      getFailedCount: vi.fn(),
      getDelayedCount: vi.fn(),
      close: vi.fn(),
    };

    mockQueueEvents = {
      close: vi.fn(),
    };

    mockWorker = {
      close: vi.fn(),
    };

    MockedQueue.mockImplementation(() => mockQueue);
    MockedQueueEvents.mockImplementation(() => mockQueueEvents);
    MockedWorker.mockImplementation(() => mockWorker);
  });

  afterEach(async () => {
    await closeRenderQueue();
  });

  describe('getRenderQueue', () => {
    it('should create a queue instance', () => {
      const queue = getRenderQueue();

      expect(MockedQueue).toHaveBeenCalledWith('render', expect.any(Object));
      expect(queue).toBe(mockQueue);
    });

    it('should return the same instance on subsequent calls', () => {
      const queue1 = getRenderQueue();
      const queue2 = getRenderQueue();

      expect(queue1).toBe(queue2);
      expect(MockedQueue).toHaveBeenCalledTimes(1);
    });

    it('should use provided connection options', () => {
      const connectionOptions = { host: 'localhost', port: 6379 };
      getRenderQueue(connectionOptions);

      expect(MockedQueue).toHaveBeenCalledWith(
        'render',
        expect.objectContaining({
          connection: connectionOptions,
        })
      );
    });
  });

  describe('getRenderQueueEvents', () => {
    it('should create a queue events instance', () => {
      const queueEvents = getRenderQueueEvents();

      expect(MockedQueueEvents).toHaveBeenCalledWith('render', expect.any(Object));
      expect(queueEvents).toBe(mockQueueEvents);
    });

    it('should return the same instance on subsequent calls', () => {
      const events1 = getRenderQueueEvents();
      const events2 = getRenderQueueEvents();

      expect(events1).toBe(events2);
      expect(MockedQueueEvents).toHaveBeenCalledTimes(1);
    });
  });

  describe('addRenderJob', () => {
    const mockJobData: RenderJobData = {
      renderId: 'render-123',
      projectId: 'project-456',
      sceneId: 'scene-789',
      userId: 'user-123',
      organizationId: 'org-456',
      subscriptionTier: 'pro',
      sourceImageUrl: 'https://example.com/image.jpg',
      prompt: {
        system: 'Generate a landscape',
        user: 'Make it beautiful',
      },
      annotations: [],
      settings: {
        provider: 'google-imagen',
        resolution: '1024x1024',
        format: 'PNG',
        quality: 80,
      },
    };

    beforeEach(() => {
      const mockJob = { id: 'job-123' };
      mockQueue.add.mockResolvedValue(mockJob);
    });

    it('should add a job to the queue', async () => {
      const job = await addRenderJob(mockJobData);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'render',
        mockJobData,
        expect.objectContaining({
          priority: expect.any(Number),
        })
      );
      expect(job).toEqual({ id: 'job-123' });
    });

    it('should set priority based on subscription tier', async () => {
      await addRenderJob({ ...mockJobData, subscriptionTier: 'starter' });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'render',
        expect.objectContaining({ subscriptionTier: 'starter' }),
        expect.objectContaining({
          priority: expect.any(Number),
        })
      );
    });

    it('should use provided priority over tier-based priority', async () => {
      const customPriority = 999;
      await addRenderJob(mockJobData, { priority: customPriority });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'render',
        mockJobData,
        expect.objectContaining({
          priority: customPriority,
        })
      );
    });

    it('should handle delay option', async () => {
      const delay = 5000;
      await addRenderJob(mockJobData, { delay });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'render',
        mockJobData,
        expect.objectContaining({
          delay: delay,
        })
      );
    });
  });

  describe('createRenderWorker', () => {
    it('should create a worker instance', () => {
      const processFunction = vi.fn();
      const worker = createRenderWorker(processFunction);

      expect(MockedWorker).toHaveBeenCalledWith(
        'render',
        processFunction,
        expect.objectContaining({
          concurrency: 5,
          autorun: true,
        })
      );
      expect(worker).toBe(mockWorker);
    });

    it('should use custom concurrency', () => {
      const processFunction = vi.fn();
      const concurrency = 10;
      createRenderWorker(processFunction, undefined, concurrency);

      expect(MockedWorker).toHaveBeenCalledWith(
        'render',
        processFunction,
        expect.objectContaining({
          concurrency: concurrency,
        })
      );
    });

    it('should use provided connection options', () => {
      const processFunction = vi.fn();
      const connectionOptions = { host: 'localhost', port: 6379 };
      createRenderWorker(processFunction, connectionOptions);

      expect(MockedWorker).toHaveBeenCalledWith(
        'render',
        processFunction,
        expect.objectContaining({
          connection: connectionOptions,
        })
      );
    });
  });

  describe('getRenderJobCount', () => {
    beforeEach(() => {
      const now = Date.now();
      const jobs = [
        { data: { userId: 'user-1' }, timestamp: now - 30000 }, // 30s ago
        { data: { userId: 'user-1' }, timestamp: now - 90000 }, // 90s ago
        { data: { userId: 'user-2' }, timestamp: now - 30000 }, // different user
        { data: { userId: 'user-1' }, timestamp: now - 10000 }, // 10s ago
      ];
      mockQueue.getJobs.mockResolvedValue(jobs);
    });

    it('should count jobs for a specific user within time window', async () => {
      const count = await getRenderJobCount('user-1', 60000); // 60s window

      expect(mockQueue.getJobs).toHaveBeenCalledWith(['active', 'waiting', 'delayed']);
      expect(count).toBe(2); // Only jobs within 60s for user-1
    });

    it('should use default 60s window', async () => {
      const count = await getRenderJobCount('user-1');

      expect(count).toBe(2);
    });

    it('should return 0 for user with no jobs', async () => {
      const count = await getRenderJobCount('user-3');

      expect(count).toBe(0);
    });

    it('should handle jobs without timestamp', async () => {
      mockQueue.getJobs.mockResolvedValue([
        { data: { userId: 'user-1' } }, // no timestamp
      ]);

      const count = await getRenderJobCount('user-1');
      expect(count).toBe(0);
    });
  });

  describe('canUserSubmitRender', () => {
    beforeEach(() => {
      // Mock getRenderJobCount to return different values based on window
      vi.doMock('../render.queue', async () => {
        const actual = await vi.importActual('../render.queue');
        return {
          ...actual,
          getRenderJobCount: vi.fn((userId: string, windowMs: number) => {
            if (windowMs === 60000) return 1; // 1 job in last minute
            if (windowMs === 3600000) return 10; // 10 jobs in last hour
            return 0;
          }),
        };
      });
    });

    it('should allow submission when under rate limits', async () => {
      // Mock low usage
      mockQueue.getJobs.mockResolvedValue([]);

      const result = await canUserSubmitRender('user-1', 'starter');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block when minute limit exceeded for starter', async () => {
      // Mock high minute usage
      const jobs = Array(3)
        .fill(null)
        .map(() => ({
          data: { userId: 'user-1' },
          timestamp: Date.now() - 30000,
        }));
      mockQueue.getJobs.mockResolvedValue(jobs);

      const result = await canUserSubmitRender('user-1', 'starter');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('2 renders per minute');
    });

    it('should block when hour limit exceeded for pro', async () => {
      // Mock high hour usage but low minute usage
      const jobs = Array(101)
        .fill(null)
        .map((_, i) => ({
          data: { userId: 'user-1' },
          timestamp: Date.now() - i * 30000, // Spread over time
        }));
      mockQueue.getJobs.mockResolvedValue(jobs);

      const result = await canUserSubmitRender('user-1', 'pro');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('100 renders per hour');
    });

    it('should have higher limits for growth tier', async () => {
      // Mock usage that would block starter but not growth
      const jobs = Array(15)
        .fill(null)
        .map(() => ({
          data: { userId: 'user-1' },
          timestamp: Date.now() - 30000,
        }));
      mockQueue.getJobs.mockResolvedValue(jobs);

      const result = await canUserSubmitRender('user-1', 'growth');

      expect(result.allowed).toBe(true);
    });
  });

  describe('getQueueMetrics', () => {
    beforeEach(() => {
      mockQueue.getWaitingCount.mockResolvedValue(5);
      mockQueue.getActiveCount.mockResolvedValue(3);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(2);
      mockQueue.getDelayedCount.mockResolvedValue(1);
    });

    it('should return queue metrics', async () => {
      const metrics = await getQueueMetrics();

      expect(metrics).toEqual({
        waiting: 5,
        active: 3,
        completed: 100,
        failed: 2,
        delayed: 1,
        paused: 0,
        total: 9, // waiting + active + delayed + paused
      });
    });

    it('should call all count methods', async () => {
      await getQueueMetrics();

      expect(mockQueue.getWaitingCount).toHaveBeenCalled();
      expect(mockQueue.getActiveCount).toHaveBeenCalled();
      expect(mockQueue.getCompletedCount).toHaveBeenCalled();
      expect(mockQueue.getFailedCount).toHaveBeenCalled();
      expect(mockQueue.getDelayedCount).toHaveBeenCalled();
    });
  });

  describe('closeRenderQueue', () => {
    it('should close queue and events', async () => {
      // Create instances first
      getRenderQueue();
      getRenderQueueEvents();

      await closeRenderQueue();

      expect(mockQueue.close).toHaveBeenCalled();
      expect(mockQueueEvents.close).toHaveBeenCalled();
    });

    it('should handle being called when no instances exist', async () => {
      await expect(closeRenderQueue()).resolves.not.toThrow();
    });

    it('should reset instances to null', async () => {
      getRenderQueue();
      await closeRenderQueue();

      // Getting queue again should create new instance
      getRenderQueue();
      expect(MockedQueue).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle queue creation errors gracefully', () => {
      MockedQueue.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      expect(() => getRenderQueue()).toThrow('Connection failed');
    });

    it('should handle missing job data gracefully in rate limiting', async () => {
      mockQueue.getJobs.mockResolvedValue([
        { data: null, timestamp: Date.now() },
        { data: undefined, timestamp: Date.now() },
      ]);

      const count = await getRenderJobCount('user-1');
      expect(count).toBe(0);
    });

    it('should handle queue method failures in metrics', async () => {
      mockQueue.getWaitingCount.mockRejectedValue(new Error('Redis error'));
      mockQueue.getActiveCount.mockResolvedValue(0);
      mockQueue.getCompletedCount.mockResolvedValue(0);
      mockQueue.getFailedCount.mockResolvedValue(0);
      mockQueue.getDelayedCount.mockResolvedValue(0);

      await expect(getQueueMetrics()).rejects.toThrow('Redis error');
    });
  });
});
