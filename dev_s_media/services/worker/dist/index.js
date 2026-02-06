"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const env_1 = require("./config/env");
const socialPublisher_1 = require("./steps/socialPublisher");
const dlq_handler_1 = require("./steps/dlq_handler");
const QUEUE_NAME = 'social-publish-queue';
exports.worker = new bullmq_1.Worker(QUEUE_NAME, async (job) => {
    console.log(`[Worker] Picked up job ${job.id}`);
    const { content, adId } = job.data;
    // NOTE: Simple version without LLM/Media processing for first test
    // In full version: MediaProcessor -> LLM -> Validation -> Publisher
    // 1. Publish to Facebook
    try {
        const fbRes = await (0, socialPublisher_1.publishToFacebook)(content.description, content.images[0]);
        console.log(`[Worker] FB Success: ${fbRes.post_id}`);
        // 2. Publish to Instagram (Optional)
        const igRes = await (0, socialPublisher_1.publishToInstagram)(content.description, content.images[0]);
        if (igRes.success)
            console.log(`[Worker] IG Success: ${igRes.id}`);
        return { fb: fbRes, ig: igRes };
    }
    catch (err) {
        console.error(`[Worker] Failed job ${job.id}:`, err.message);
        throw err; // BullMQ will retry based on exponential backoff
    }
}, {
    connection: {
        host: env_1.config.REDIS_HOST,
        port: parseInt(env_1.config.REDIS_PORT)
    },
    concurrency: 5 // Process 5 posts at once
});
// Event Listeners
exports.worker.on('completed', job => {
    console.log(`✅ Job ${job.id} has completed!`);
});
exports.worker.on('failed', async (job, err) => {
    console.error(`❌ Job ${job?.id} has failed with ${err.message}`);
    // Check if retries are exhausted
    if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
        console.error(`💀 Job ${job.id} is dead. Moving to DLQ.`);
        await (0, dlq_handler_1.moveToDlq)(job, err.message);
    }
});
console.log(`👷 Worker Engine Started. Listening on ${QUEUE_NAME}...`);
