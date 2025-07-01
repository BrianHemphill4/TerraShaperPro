import { performanceMonitor } from '../lib/performance/performanceMonitor';

interface WorkerTask<T = any> {
  id: string;
  priority: number;
  timeout?: number;
  resolve: (result: T) => void;
  reject: (error: Error) => void;
  message: any;
  startTime?: number;
}

interface PooledWorker {
  worker: Worker;
  busy: boolean;
  currentTask?: string;
  lastUsed: number;
}

export interface WorkerPoolConfig {
  workerScript: string | URL;
  minWorkers: number;
  maxWorkers: number;
  idleTimeout: number;
  taskTimeout: number;
  warmup?: boolean;
}

export class WorkerPool<TMessage = any, TResponse = any> {
  private workers: PooledWorker[] = [];
  private taskQueue: WorkerTask<TResponse>[] = [];
  private pendingTasks = new Map<string, WorkerTask<TResponse>>();
  private config: WorkerPoolConfig;
  private terminated = false;
  private stats = {
    tasksCompleted: 0,
    tasksFailed: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0
  };

  constructor(config: WorkerPoolConfig) {
    this.config = {
      minWorkers: navigator.hardwareConcurrency || 2,
      maxWorkers: navigator.hardwareConcurrency * 2 || 4,
      idleTimeout: 30000, // 30 seconds
      taskTimeout: 60000, // 60 seconds
      warmup: true,
      ...config
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Create minimum number of workers
    for (let i = 0; i < this.config.minWorkers; i++) {
      this.createWorker();
    }

    // Warmup workers if requested
    if (this.config.warmup) {
      await this.warmupWorkers();
    }

    // Start idle timeout checker
    this.startIdleChecker();
  }

  private createWorker(): PooledWorker {
    const worker = new Worker(this.config.workerScript);
    const pooledWorker: PooledWorker = {
      worker,
      busy: false,
      lastUsed: Date.now()
    };

    worker.addEventListener('message', (event) => {
      this.handleWorkerMessage(pooledWorker, event);
    });

    worker.addEventListener('error', (event) => {
      this.handleWorkerError(pooledWorker, event);
    });

    this.workers.push(pooledWorker);
    return pooledWorker;
  }

  private handleWorkerMessage(pooledWorker: PooledWorker, event: MessageEvent): void {
    const taskId = pooledWorker.currentTask;
    if (!taskId) return;

    const task = this.pendingTasks.get(taskId);
    if (!task) return;

    // Clear timeout
    const timeoutId = (task as any).timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Update stats
    const processingTime = Date.now() - (task.startTime || Date.now());
    this.stats.tasksCompleted++;
    this.stats.totalProcessingTime += processingTime;
    this.stats.averageProcessingTime = 
      this.stats.totalProcessingTime / this.stats.tasksCompleted;

    // Record metrics
    performanceMonitor.recordMetric({
      name: 'worker-task',
      value: processingTime,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        taskId,
        workerIndex: this.workers.indexOf(pooledWorker).toString()
      }
    });

    // Resolve task
    task.resolve(event.data);
    this.pendingTasks.delete(taskId);

    // Mark worker as available
    pooledWorker.busy = false;
    pooledWorker.currentTask = undefined;
    pooledWorker.lastUsed = Date.now();

    // Process next task
    this.processNextTask();
  }

  private handleWorkerError(pooledWorker: PooledWorker, event: ErrorEvent): void {
    const taskId = pooledWorker.currentTask;
    console.error('Worker error:', event);

    if (taskId) {
      const task = this.pendingTasks.get(taskId);
      if (task) {
        this.stats.tasksFailed++;
        task.reject(new Error(event.message));
        this.pendingTasks.delete(taskId);
      }
    }

    // Replace the failed worker
    const index = this.workers.indexOf(pooledWorker);
    if (index >= 0) {
      this.workers.splice(index, 1);
      pooledWorker.worker.terminate();
    }

    // Create a new worker if below minimum
    if (this.workers.length < this.config.minWorkers && !this.terminated) {
      this.createWorker();
    }

    // Process next task
    this.processNextTask();
  }

  async execute(message: TMessage, priority = 0, timeout?: number): Promise<TResponse> {
    if (this.terminated) {
      throw new Error('Worker pool has been terminated');
    }

    return new Promise((resolve, reject) => {
      const task: WorkerTask<TResponse> = {
        id: this.generateTaskId(),
        priority,
        timeout: timeout || this.config.taskTimeout,
        resolve,
        reject,
        message
      };

      this.taskQueue.push(task);
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      this.processNextTask();
    });
  }

  private processNextTask(): void {
    if (this.taskQueue.length === 0) return;

    // Find an available worker
    let availableWorker = this.workers.find(w => !w.busy);

    // Create a new worker if needed and under limit
    if (!availableWorker && this.workers.length < this.config.maxWorkers) {
      availableWorker = this.createWorker();
    }

    if (!availableWorker) return;

    // Get the highest priority task
    const task = this.taskQueue.shift();
    if (!task) return;

    // Assign task to worker
    availableWorker.busy = true;
    availableWorker.currentTask = task.id;
    availableWorker.lastUsed = Date.now();
    task.startTime = Date.now();

    // Set task timeout
    if (task.timeout) {
      (task as any).timeoutId = setTimeout(() => {
        this.handleTaskTimeout(availableWorker, task);
      }, task.timeout);
    }

    // Add to pending tasks
    this.pendingTasks.set(task.id, task);

    // Send message to worker
    availableWorker.worker.postMessage({
      id: task.id,
      ...task.message
    });
  }

  private handleTaskTimeout(worker: PooledWorker, task: WorkerTask<TResponse>): void {
    console.error(`Task ${task.id} timed out after ${task.timeout}ms`);
    
    // Reject the task
    task.reject(new Error('Task timeout'));
    this.pendingTasks.delete(task.id);
    this.stats.tasksFailed++;

    // Terminate and replace the worker
    const index = this.workers.indexOf(worker);
    if (index >= 0) {
      this.workers.splice(index, 1);
      worker.worker.terminate();
    }

    // Create a new worker if below minimum
    if (this.workers.length < this.config.minWorkers && !this.terminated) {
      this.createWorker();
    }

    // Process next task
    this.processNextTask();
  }

  private startIdleChecker(): void {
    setInterval(() => {
      if (this.terminated) return;

      const now = Date.now();
      const idleWorkers = this.workers.filter(w => 
        !w.busy && 
        now - w.lastUsed > this.config.idleTimeout &&
        this.workers.length > this.config.minWorkers
      );

      // Terminate idle workers
      idleWorkers.forEach(worker => {
        const index = this.workers.indexOf(worker);
        if (index >= 0) {
          this.workers.splice(index, 1);
          worker.worker.terminate();
        }
      });
    }, 5000); // Check every 5 seconds
  }

  private async warmupWorkers(): Promise<void> {
    // Send a simple warmup task to each worker
    const warmupPromises = this.workers.map(pooledWorker => {
      return new Promise<void>((resolve) => {
        const warmupId = `warmup-${this.generateTaskId()}`;
        
        const handler = (event: MessageEvent) => {
          if (event.data.id === warmupId) {
            pooledWorker.worker.removeEventListener('message', handler);
            resolve();
          }
        };

        pooledWorker.worker.addEventListener('message', handler);
        pooledWorker.worker.postMessage({
          id: warmupId,
          type: 'warmup'
        });

        // Timeout after 1 second
        setTimeout(resolve, 1000);
      });
    });

    await Promise.all(warmupPromises);
  }

  private generateTaskId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  getStats() {
    return {
      ...this.stats,
      activeWorkers: this.workers.filter(w => w.busy).length,
      idleWorkers: this.workers.filter(w => !w.busy).length,
      totalWorkers: this.workers.length,
      queueLength: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size
    };
  }

  getQueueLength(): number {
    return this.taskQueue.length;
  }

  getActiveTaskCount(): number {
    return this.pendingTasks.size;
  }

  async executeBatch<T extends TMessage>(
    messages: T[],
    priority = 0,
    timeout?: number
  ): Promise<TResponse[]> {
    const promises = messages.map(message => 
      this.execute(message, priority, timeout)
    );
    return Promise.all(promises);
  }

  async executeMap<T, R>(
    items: T[],
    mapFn: (item: T) => TMessage,
    priority = 0,
    timeout?: number
  ): Promise<R[]> {
    const messages = items.map(mapFn);
    const results = await this.executeBatch(messages, priority, timeout);
    return results as unknown as R[];
  }

  clearQueue(): void {
    this.taskQueue.forEach(task => {
      task.reject(new Error('Queue cleared'));
    });
    this.taskQueue = [];
  }

  async terminate(): Promise<void> {
    this.terminated = true;
    
    // Clear the queue
    this.clearQueue();

    // Wait for pending tasks to complete (with timeout)
    const timeout = new Promise(resolve => setTimeout(resolve, 5000));
    const pending = Array.from(this.pendingTasks.values()).map(task => 
      new Promise(resolve => {
        task.resolve = resolve as any;
        task.reject = resolve as any;
      })
    );

    await Promise.race([Promise.all(pending), timeout]);

    // Terminate all workers
    this.workers.forEach(worker => {
      worker.worker.terminate();
    });

    this.workers = [];
    this.pendingTasks.clear();
  }

  resize(minWorkers: number, maxWorkers: number): void {
    this.config.minWorkers = minWorkers;
    this.config.maxWorkers = maxWorkers;

    // Add workers if below minimum
    while (this.workers.length < minWorkers) {
      this.createWorker();
    }

    // Remove excess idle workers
    const idleWorkers = this.workers.filter(w => !w.busy);
    const toRemove = Math.max(0, this.workers.length - maxWorkers);
    
    for (let i = 0; i < toRemove && i < idleWorkers.length; i++) {
      const worker = idleWorkers[i];
      const index = this.workers.indexOf(worker);
      if (index >= 0) {
        this.workers.splice(index, 1);
        worker.worker.terminate();
      }
    }
  }
}

// Specialized worker pools
export class AnnotationWorkerPool extends WorkerPool {
  constructor() {
    super({
      workerScript: new URL('./annotationWorker.ts', import.meta.url),
      minWorkers: 2,
      maxWorkers: navigator.hardwareConcurrency || 4,
      idleTimeout: 30000,
      taskTimeout: 30000
    });
  }

  async processAnnotations(annotations: any[], operation: string, options?: any) {
    return this.execute({
      type: operation,
      data: { annotations, ...options }
    });
  }

  async simplifyPaths(annotations: any[], tolerance = 1) {
    return this.processAnnotations(annotations, 'simplify', { tolerance });
  }

  async clusterAnnotations(annotations: any[], threshold = 50) {
    return this.processAnnotations(annotations, 'cluster', { threshold });
  }

  async exportAnnotations(annotations: any[], format: 'geojson' | 'svg' | 'json') {
    return this.processAnnotations(annotations, 'export', { format });
  }
}