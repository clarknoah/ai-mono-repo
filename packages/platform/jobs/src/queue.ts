/**
 * BullMQ queue and worker management.
 */
import { Queue, Worker, Job } from 'bullmq';
import { redis } from '@iam/cache';
import { logger } from '@iam/shared-utils';

/**
 * Redis connection configuration for BullMQ.
 */
const connection = {
  host: redis.options.host,
  port: redis.options.port,
};

/**
 * Creates a BullMQ queue.
 *
 * @param name - Queue name
 * @returns Queue instance
 */
export function createQueue<T = any>(name: string): Queue<T> {
  const queue = new Queue<T>(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        count: 100,
        age: 3600, // 1 hour
      },
      removeOnFail: {
        count: 1000,
        age: 86400, // 24 hours
      },
    },
  });

  logger.info('Queue created', { name });

  return queue;
}

/**
 * Creates a BullMQ worker.
 *
 * @param name - Queue name
 * @param processor - Job processor function
 * @returns Worker instance
 */
export function createWorker<T = any>(
  name: string,
  processor: (job: Job<T>) => Promise<any>
): Worker<T> {
  const worker = new Worker<T>(name, processor, {
    connection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info('Job completed', {
      queue: name,
      jobId: job.id,
      duration: job.finishedOn! - job.processedOn!,
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('Job failed', error, {
      queue: name,
      jobId: job?.id,
      attempts: job?.attemptsMade,
    });
  });

  worker.on('error', (error) => {
    logger.error('Worker error', error, { queue: name });
  });

  logger.info('Worker created', { name });

  return worker;
}

/**
 * Closes a queue gracefully.
 *
 * @param queue - Queue to close
 */
export async function closeQueue(queue: Queue): Promise<void> {
  await queue.close();
  logger.info('Queue closed', { name: queue.name });
}

/**
 * Closes a worker gracefully.
 *
 * @param worker - Worker to close
 */
export async function closeWorker(worker: Worker): Promise<void> {
  await worker.close();
  logger.info('Worker closed', { name: worker.name });
}
