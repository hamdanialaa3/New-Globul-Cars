// src/config/google-cloud.config.ts
import { z } from 'zod';
import { logger } from '@/services/logger-service';

const googleConfigSchema = z.object({
  firebase: {
    apiKey: z.string().min(1, "Firebase API Key is missing! Check .env"),
    authDomain: z.string().min(1),
    projectId: z.string().min(1),
    storageBucket: z.string().min(1),
    messagingSenderId: z.string().min(1),
    appId: z.string().min(1),
  },
  gcp: {
    indexingServiceAccount: z.string().optional(),
    bigQueryDataset: z.string().default('car_market_analytics'),
  },
  marketing: {
    gtmId: z.string().default('GTM-MKZSPCNC'),
    ga4Id: z.string().default('G-R8JY5KM421'),
  }
});

const processEnv = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  gcp: {
    indexingServiceAccount: process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT,
    bigQueryDataset: process.env.BIGQUERY_DATASET,
  },
  marketing: {
    gtmId: import.meta.env.VITE_GTM_ID || 'GTM-MKZSPCNC',
    ga4Id: import.meta.env.VITE_GA4_ID || 'G-R8JY5KM421',
  }
};

// Validate config (safe parsing to avoid crash during build if envs are missing in CI)
const parsed = googleConfigSchema.safeParse(processEnv);

if (!parsed.success) {
  logger.warn('Google Cloud Configuration Invalid', { errors: parsed.error.format() });
}

export const googleConfig = parsed.success ? parsed.data : processEnv as z.infer<typeof googleConfigSchema>;
