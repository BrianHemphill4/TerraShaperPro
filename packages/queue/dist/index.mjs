var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/queues/render.queue.ts
import { Queue, Worker, QueueEvents } from "bullmq";

// src/config.ts
function getRedisConnection() {
  const redisHost = process.env.REDIS_HOST;
  if (redisHost && redisHost.startsWith("https://")) {
    const url = new URL(redisHost);
    return {
      host: url.hostname,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      tls: {},
      maxRetriesPerRequest: null
    };
  }
  return {
    host: redisHost || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
  };
}
var redisConnection = getRedisConnection();
var defaultQueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1e3
    },
    removeOnComplete: {
      age: 3600,
      // 1 hour
      count: 100
    },
    removeOnFail: {
      age: 24 * 3600
      // 24 hours
    }
  }
};
var QUEUE_NAMES = {
  RENDER: "renderQueue",
  NOTIFICATION: "notificationQueue"
};
var QUEUE_PRIORITIES = {
  STARTER: 5,
  PRO: 3,
  GROWTH: 1
};

// src/queues/render.queue.ts
var renderQueue = null;
var renderQueueEvents = null;
function getRenderQueue(connection) {
  if (!renderQueue) {
    renderQueue = new Queue(QUEUE_NAMES.RENDER, __spreadValues(__spreadValues({}, defaultQueueOptions), connection && { connection }));
  }
  return renderQueue;
}
function getRenderQueueEvents(connection) {
  if (!renderQueueEvents) {
    renderQueueEvents = new QueueEvents(QUEUE_NAMES.RENDER, {
      connection: connection || defaultQueueOptions.connection
    });
  }
  return renderQueueEvents;
}
async function addRenderJob(data, options) {
  var _a;
  const queue = getRenderQueue();
  const priority = (_a = options == null ? void 0 : options.priority) != null ? _a : QUEUE_PRIORITIES[data.subscriptionTier.toUpperCase()];
  return queue.add("render", data, {
    priority,
    delay: options == null ? void 0 : options.delay
  });
}
function createRenderWorker(processFunction, connection, concurrency = 5) {
  return new Worker(QUEUE_NAMES.RENDER, processFunction, {
    connection: connection || defaultQueueOptions.connection,
    concurrency,
    autorun: true
  });
}
async function getRenderJobCount(userId, windowMs = 6e4) {
  const queue = getRenderQueue();
  const jobs = await queue.getJobs(["active", "waiting", "delayed"]);
  const cutoff = Date.now() - windowMs;
  return jobs.filter((job) => job.data.userId === userId && (job.timestamp || 0) > cutoff).length;
}
async function canUserSubmitRender(userId, subscriptionTier) {
  const limits = {
    starter: { perMinute: 2, perHour: 20 },
    pro: { perMinute: 10, perHour: 100 },
    growth: { perMinute: 20, perHour: 300 }
  };
  const limit = limits[subscriptionTier];
  const minuteCount = await getRenderJobCount(userId, 6e4);
  const hourCount = await getRenderJobCount(userId, 36e5);
  if (minuteCount >= limit.perMinute) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${limit.perMinute} renders per minute`
    };
  }
  if (hourCount >= limit.perHour) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${limit.perHour} renders per hour`
    };
  }
  return { allowed: true };
}
async function getQueueMetrics() {
  const queue = getRenderQueue();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);
  const paused = 0;
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused,
    total: waiting + active + delayed + paused
  };
}
async function closeRenderQueue() {
  if (renderQueue) {
    await renderQueue.close();
    renderQueue = null;
  }
  if (renderQueueEvents) {
    await renderQueueEvents.close();
    renderQueueEvents = null;
  }
}

// src/events.ts
import { EventEmitter } from "events";
var QueueEventEmitter = class extends EventEmitter {
  constructor() {
    super();
    this.initialized = false;
    this.setMaxListeners(100);
  }
  initialize() {
    if (this.initialized) return;
    this.queueEvents = getRenderQueueEvents();
    this.queueEvents.on("progress", (data) => {
      this.emit("progress", {
        jobId: data.jobId,
        progress: data.data
      });
    });
    this.queueEvents.on("completed", (data) => {
      this.emit("completed", {
        jobId: data.jobId,
        result: data.returnvalue
      });
    });
    this.queueEvents.on("failed", (data) => {
      this.emit("failed", {
        jobId: data.jobId,
        error: new Error(data.failedReason || "Job failed")
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
};
var queueEventEmitter = null;
function getQueueEventEmitter() {
  if (!queueEventEmitter) {
    queueEventEmitter = new QueueEventEmitter();
    queueEventEmitter.initialize();
  }
  return queueEventEmitter;
}
export {
  QUEUE_NAMES,
  QUEUE_PRIORITIES,
  addRenderJob,
  canUserSubmitRender,
  closeRenderQueue,
  createRenderWorker,
  defaultQueueOptions,
  getQueueEventEmitter,
  getQueueMetrics,
  getRenderJobCount,
  getRenderQueue,
  getRenderQueueEvents,
  redisConnection
};
//# sourceMappingURL=index.mjs.map