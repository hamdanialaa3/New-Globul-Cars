import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load from root .env.production with absolute path
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.production') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.string().default('3005'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    WEBHOOK_SECRET: z.string(),
    DATABASE_URL: z.string()
});

export const config = envSchema.parse(process.env);
