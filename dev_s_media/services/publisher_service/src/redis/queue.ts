import { Queue } from 'bullmq';
import { config } from '../config/env';

export const socialQueue = new Queue('social-publish-queue', {
    connection: {
        host: config.REDIS_HOST,
        port: parseInt(config.REDIS_PORT)
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: 100, // Keep last 100 success
        removeOnFail: 500      // Keep last 500 failed (for inspection)
    }
});
