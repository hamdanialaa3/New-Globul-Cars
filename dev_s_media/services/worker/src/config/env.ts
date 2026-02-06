import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env.production') });

const envSchema = z.object({
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    PAGE_ACCESS_TOKEN: z.string(),
    FB_PAGE_ID: z.string(),
    // IG ID is optional now
    IG_USER_ID: z.string().optional(),
    DATABASE_URL: z.string(),
    LLM_API_URL: z.string().default('http://localhost:5000/generate')
});

export const config = envSchema.parse(process.env);
