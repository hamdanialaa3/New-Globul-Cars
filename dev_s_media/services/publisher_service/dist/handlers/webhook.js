"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAdPublished = void 0;
const queue_1 = require("../redis/queue");
const crypto_1 = __importDefault(require("crypto"));
const pg_1 = require("pg");
const env_1 = require("../config/env");
const db = new pg_1.Pool({ connectionString: env_1.config.DATABASE_URL });
const handleAdPublished = async (req, res) => {
    const { ad_id, content } = req.body;
    const requestId = req.headers['x-request-id'] || crypto_1.default.randomUUID();
    // 1. Validate Input
    if (!ad_id || !content) {
        return res.status(400).json({ error: 'Missing ad_id or content' });
    }
    // 2. Generate Idempotency Key
    const idempotencyKey = crypto_1.default
        .createHash('sha256')
        .update(`${ad_id}-${JSON.stringify(content)}`)
        .digest('hex');
    // 3. Database Check (Idempotency)
    // We use a transaction to ensure atomic check-and-insert
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const existing = await client.query('SELECT post_id, status FROM social_posts WHERE idempotency_key = $1', [idempotencyKey]);
        if ((existing.rowCount || 0) > 0) {
            await client.query('ROLLBACK');
            console.log(`Duplicate Request avoided: ${ad_id}`);
            return res.status(200).json({
                message: 'Already processed',
                post_id: existing.rows[0].post_id,
                status: existing.rows[0].status
            });
        }
        // 4. Create Initial DB Record
        const insertRes = await client.query(`INSERT INTO social_posts (ad_id, platform, idempotency_key, status) 
       VALUES ($1, 'all', $2, 'queued') 
       RETURNING post_id`, [ad_id, idempotencyKey]);
        const postId = insertRes.rows[0].post_id;
        // 5. Add to Redis Queue
        await queue_1.socialQueue.add('publish-job', {
            adId: ad_id,
            postId: postId,
            content: content,
            traceId: requestId
        }, {
            jobId: postId // Use DB ID as Job ID for easy tracking
        });
        await client.query('COMMIT');
        console.log(`[Publisher] Job Enqueued: ${postId} for Ad: ${ad_id}`);
        return res.status(202).json({
            message: 'Queued for publishing',
            job_id: postId,
            trace_id: requestId
        });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Publisher Error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message }); // In prod hide details
    }
    finally {
        client.release();
    }
};
exports.handleAdPublished = handleAdPublished;
