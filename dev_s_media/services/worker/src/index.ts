import { Job, Worker } from 'bullmq';
import { config } from './config/env';
import { publishToFacebook, publishToInstagram } from './steps/socialPublisher';
import { moveToDlq } from './steps/dlq_handler';

const QUEUE_NAME = 'social-publish-queue';

export const worker = new Worker(QUEUE_NAME, async (job: Job) => {
    console.log(`[Worker] Picked up job ${job.id}`);
    const { content, adId } = job.data;

    // NOTE: Simple version without LLM/Media processing for first test
    // In full version: MediaProcessor -> LLM -> Validation -> Publisher

    // 1. Publish to Facebook
    try {
        const fbRes = await publishToFacebook(content.description, content.images[0]);
        console.log(`[Worker] FB Success: ${fbRes.post_id}`);

        // 2. Publish to Instagram (Optional)
        const igRes = await publishToInstagram(content.description, content.images[0]);
        if (igRes.success) console.log(`[Worker] IG Success: ${igRes.id}`);

        return { fb: fbRes, ig: igRes };

    } catch (err: any) {
        console.error(`[Worker] Failed job ${job.id}:`, err.message);
        throw err; // BullMQ will retry based on exponential backoff
    }

}, {
    connection: {
        host: config.REDIS_HOST,
        port: parseInt(config.REDIS_PORT)
    },
    concurrency: 5 // Process 5 posts at once
});

// Event Listeners
worker.on('completed', job => {
    console.log(`✅ Job ${job.id} has completed!`);
});

worker.on('failed', async (job, err) => {
    console.error(`❌ Job ${job?.id} has failed with ${err.message}`);

    // Check if retries are exhausted
    if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
        console.error(`💀 Job ${job.id} is dead. Moving to DLQ.`);
        await moveToDlq(job, err.message);
    }
});

console.log(`👷 Worker Engine Started. Listening on ${QUEUE_NAME}...`);
