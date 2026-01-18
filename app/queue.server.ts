import { Queue, Worker, QueueOptions, WorkerOptions, Job } from "bullmq";
import Redis from "ioredis";
import logger from "./logger.server";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create a Redis connection for BullMQ
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Connection event handlers
connection.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

connection.on("connect", () => {
  logger.info("Redis connected successfully");
});

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 500,
      age: 7 * 24 * 3600, // 7 days
    },
  },
};

// Default worker options
export const defaultWorkerOptions: WorkerOptions = {
  connection,
  concurrency: 5,
};

// Export connection for custom use cases
export { connection };

// Helper function to create a queue
export function createQueue<T = unknown>(name: string, options?: QueueOptions) {
  return new Queue<T>(name, {
    ...defaultQueueOptions,
    ...options,
  });
}

// Helper function to create a worker
export function createWorker<T = unknown>(
  name: string,
  processor: (job: Job<T>) => Promise<unknown>,
  options?: Partial<WorkerOptions>,
) {
  return new Worker<T>(name, processor, {
    ...defaultWorkerOptions,
    ...options,
  });
}
