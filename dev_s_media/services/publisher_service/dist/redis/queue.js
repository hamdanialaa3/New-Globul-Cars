"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialQueue = void 0;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
exports.socialQueue = new bullmq_1.Queue('social-publish-queue', {
    connection: {
        host: env_1.config.REDIS_HOST,
        port: parseInt(env_1.config.REDIS_PORT)
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: 100, // Keep last 100 success
        removeOnFail: 500 // Keep last 500 failed (for inspection)
    }
});
