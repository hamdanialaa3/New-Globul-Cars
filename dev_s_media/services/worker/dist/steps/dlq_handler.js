"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToDlq = moveToDlq;
exports.requeueDlqItem = requeueDlqItem;
const bullmq_1 = require("bullmq");
const pg_1 = require("pg");
const node_fetch_1 = __importDefault(require("node-fetch"));
const notifications_1 = require("../utils/notifications");
// Configure these via env / secret manager
const DLQ_QUEUE_NAME = process.env.DLQ_QUEUE_NAME || 'social-dlq';
const NOTIFY_WEBHOOK = process.env.ADMIN_NOTIFY_WEBHOOK || '';
const pg = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
async function moveToDlq(job, reason) {
    const dlq = new bullmq_1.Queue(DLQ_QUEUE_NAME, { connection: job.queue.opts.connection });
    await dlq.add('dlq-item', {
        originalJobId: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        failedReason: reason,
        timestamp: Date.now()
    });
    // Force access queue to pause it (using any to bypass protected check for emergency)
    // 1. Pause the queue immediately (using cast to bypass protected)
    const q = job.queue;
    if (q)
        await q.pause();
    // Persist DLQ record in DB for audit and manual remediation
    const client = await pg.connect();
    try {
        await client.query(`INSERT INTO dlq_jobs (job_id, job_name, payload, failed_reason, attempts, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`, [job.id, job.name, JSON.stringify(job.data), reason, job.attemptsMade]);
    }
    finally {
        client.release();
    }
    // Notify admins via webhook or internal notification
    const message = {
        title: 'DLQ: job moved to dead-letter queue',
        jobId: job.id,
        jobName: job.name,
        reason,
        attempts: job.attemptsMade
    };
    if (NOTIFY_WEBHOOK) {
        try {
            await (0, node_fetch_1.default)(NOTIFY_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
        }
        catch (err) {
            console.error('Failed to notify webhook', err);
        }
    }
    else {
        // fallback: internal notifier
        try {
            await (0, notifications_1.sendAdminNotification)(message);
        }
        catch (err) {
            console.error('Failed to send admin notification', err);
        }
    }
}
async function requeueDlqItem(dlqJobId) {
    const client = await pg.connect();
    try {
        const res = await client.query('SELECT payload FROM dlq_jobs WHERE job_id = $1', [dlqJobId]);
        if (res.rowCount === 0)
            throw new Error('DLQ job not found');
        const payload = res.rows[0].payload;
        const queueName = payload.queueName || process.env.DEFAULT_QUEUE || 'social-publish';
        const queue = new bullmq_1.Queue(queueName, { connection: { host: process.env.REDIS_HOST } });
        await queue.add(payload.name || 'retry-job', payload.data || payload);
        await client.query('DELETE FROM dlq_jobs WHERE job_id = $1', [dlqJobId]);
        return true;
    }
    finally {
        client.release();
    }
}
