import { Queue, Job } from 'bullmq';
import { Pool } from 'pg';
import fetch from 'node-fetch';
import { sendAdminNotification } from '../utils/notifications';

// Configure these via env / secret manager
const DLQ_QUEUE_NAME = process.env.DLQ_QUEUE_NAME || 'social-dlq';
const NOTIFY_WEBHOOK = process.env.ADMIN_NOTIFY_WEBHOOK || '';
const pg = new Pool({ connectionString: process.env.DATABASE_URL });

export async function moveToDlq(job: Job, reason: string) {
    const dlq = new Queue(DLQ_QUEUE_NAME, { connection: (job as any).queue.opts.connection });
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
    const q = (job as any).queue;
    if (q) await q.pause();
    // Persist DLQ record in DB for audit and manual remediation
    const client = await pg.connect();
    try {
        await client.query(
            `INSERT INTO dlq_jobs (job_id, job_name, payload, failed_reason, attempts, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
            [job.id, job.name, JSON.stringify(job.data), reason, job.attemptsMade]
        );
    } finally {
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
            await fetch(NOTIFY_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
        } catch (err) {
            console.error('Failed to notify webhook', err);
        }
    } else {
        // fallback: internal notifier
        try {
            await sendAdminNotification(message);
        } catch (err) {
            console.error('Failed to send admin notification', err);
        }
    }
}

export async function requeueDlqItem(dlqJobId: string) {
    const client = await pg.connect();
    try {
        const res = await client.query('SELECT payload FROM dlq_jobs WHERE job_id = $1', [dlqJobId]);
        if (res.rowCount === 0) throw new Error('DLQ job not found');
        const payload = res.rows[0].payload;
        const queueName = payload.queueName || process.env.DEFAULT_QUEUE || 'social-publish';
        const queue = new Queue(queueName, { connection: { host: process.env.REDIS_HOST } });
        await queue.add(payload.name || 'retry-job', payload.data || payload);
        await client.query('DELETE FROM dlq_jobs WHERE job_id = $1', [dlqJobId]);
        return true;
    } finally {
        client.release();
    }
}
