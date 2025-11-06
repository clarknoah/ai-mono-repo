/**
 * BullMQ job queue platform package.
 */
export { createQueue, createWorker, closeQueue, closeWorker } from './queue';
export type { JobOptions, Job, Worker, Queue } from 'bullmq';
