// src/config/google-cloud.config.ts
import { z } from 'zod';

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
    gtmId: z.string().optional(),
    ga4Id: z.string().optional(),
  }
});

const processEnv = {
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },
  gcp: {
    indexingServiceAccount: process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT,
    bigQueryDataset: process.env.BIGQUERY_DATASET,
  },
  marketing: {
    gtmId: process.env.REACT_APP_GTM_ID,
    ga4Id: process.env.REACT_APP_GA4_ID,
  }
};

// Validate config (safe parsing to avoid crash during build if envs are missing in CI)
const parsed = googleConfigSchema.safeParse(processEnv);

if (!parsed.success) {
  console.warn("⚠️ Google Cloud Configuration Invalid:", parsed.error.format());
}

export const googleConfig = parsed.success ? parsed.data : processEnv as z.infer<typeof googleConfigSchema>;
