// functions/src/social-tokens.ts
// Secure token exchange endpoints (Phase 1 -> Phase 2 migration)
// Provides short-lived social media access tokens to frontend via callable HTTPS function.
// NOTE: Currently returns existing environment tokens (development bridge). Replace with
// real OAuth exchange / token minting in later phase.

import * as functions from 'firebase-functions';
// Optional Secret Manager integration (lazy required)
// Using 'any' to avoid needing @types; dynamic import keeps optional nature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let secretManagerClient: any = null;
async function getSecretManager() {
  if (!process.env.ENABLE_SECRET_MANAGER) return null;
  if (!secretManagerClient) {
    try {
      // Dynamically import to avoid cold-start penalty if unused
  const sm: any = await import('@google-cloud/secret-manager');
  secretManagerClient = new sm.SecretManagerServiceClient();
    } catch (e) {
      console.warn('[social-tokens] Secret Manager unavailable, continuing with env tokens');
      return null;
    }
  }
  return secretManagerClient;
}

interface TokenRequestData {
  platform: 'facebook' | 'instagram' | 'tiktok';
  purpose?: string; // optional hint (e.g., 'read_profile', 'post_content')
}

interface TokenResponse {
  platform: string;
  token: string;
  expiresIn: number; // seconds
  issuedAt: number;
  // future: scopes, refreshEndpoint, rotationId
}

// Simple in-memory TTL cache to reduce env reads and function invocations cost.
const memoryCache: Record<string, { token: string; expiresAt: number }> = {};
const metrics = {
  requests: 0,
  perPlatform: { facebook: 0, instagram: 0, tiktok: 0 } as Record<string, number>,
  cacheHits: 0,
  backendIssues: 0,
  rateLimitHits: 0,
  lastRequestAt: 0,
  secretFetches: 0,
  secretFetchFailures: 0
};

// Simple in-memory rate limit buckets (ephemeral)
interface Bucket { count: number; windowStart: number; }
const userBuckets: Record<string, Bucket> = {};
const ipBuckets: Record<string, Bucket> = {};
const rateLimitConfig = {
  windowMs: 60_000, // 1 minute window
  maxPerUid: 10, // per authenticated user
  maxPerIp: 20 // HTTP fallback rate for unauthenticated (emulator) or IP-based
};

function checkAndIncrementRateLimit(key: string, bucketMap: Record<string, Bucket>, limit: number): boolean {
  const now = Date.now();
  let bucket = bucketMap[key];
  if (!bucket || now - bucket.windowStart >= rateLimitConfig.windowMs) {
    bucket = { count: 0, windowStart: now };
    bucketMap[key] = bucket;
  }
  if (bucket.count >= limit) {
    return false;
  }
  bucket.count++;
  return true;
}
const DEFAULT_TTL_SECONDS = 60 * 10; // 10 minutes (bridge only)

async function readToken(platform: string): Promise<string | null> {
  // 1. Secret Manager (if enabled)
  try {
    const sm = await getSecretManager();
    if (sm) {
      const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
      if (projectId) {
        const defaultSecretName = `SOCIAL_TOKEN_${platform.toUpperCase()}`; // e.g. SOCIAL_TOKEN_FACEBOOK
        const overrideName = process.env[`SECRET_${platform.toUpperCase()}_NAME`];
        const secretId = overrideName || defaultSecretName;
        const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;
        try {
          const [version] = await sm.accessSecretVersion({ name });
          const payload = version.payload?.data?.toString();
          if (payload) {
            metrics.secretFetches++;
            return payload.trim();
          }
        } catch (e) {
          metrics.secretFetchFailures++;
          // fall through to env fallback
        }
      }
    }
  } catch (e) {
    metrics.secretFetchFailures++;
  }
  // 2. Environment fallback (bridge)
  switch (platform) {
    case 'facebook':
      return process.env.FACEBOOK_LONG_LIVED_TOKEN || process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN || null;
    case 'instagram':
      return process.env.INSTAGRAM_LONG_LIVED_TOKEN || process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || null;
    case 'tiktok':
      return process.env.TIKTOK_LONG_LIVED_TOKEN || process.env.REACT_APP_TIKTOK_ACCESS_TOKEN || null;
    default:
      return null;
  }
}

async function coreGetToken(platform: string): Promise<TokenResponse> {
  const now = Date.now();
  const cacheKey = platform;
  const cached = memoryCache[cacheKey];
  if (cached && cached.expiresAt > now) {
    metrics.cacheHits++;
    return {
      platform,
      token: cached.token,
      expiresIn: Math.floor((cached.expiresAt - now) / 1000),
      issuedAt: now
    };
  }

  const raw = await readToken(platform);
  if (!raw) {
    metrics.backendIssues++;
    throw new functions.https.HttpsError('failed-precondition', `No token configured for ${platform}`);
  }

  const expiresAt = now + DEFAULT_TTL_SECONDS * 1000;
  memoryCache[cacheKey] = { token: raw, expiresAt };

  return {
    platform,
    token: raw,
    expiresIn: DEFAULT_TTL_SECONDS,
    issuedAt: now
  };
}

export const getSocialAccessToken = functions.https.onCall(async (data: TokenRequestData, context): Promise<TokenResponse> => {
  const platform = data?.platform;
  if (!platform) {
    throw new functions.https.HttpsError('invalid-argument', 'platform is required');
  }

  // Basic auth enforcement (Phase 1). Allow unauth only in emulator / development.
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (!context.auth && !isEmulator) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  // Rate limiting (per UID or anonymous tag)
  const uidKey = context.auth?.uid || '__anon__';
  const limit = context.auth ? rateLimitConfig.maxPerUid : Math.min(rateLimitConfig.maxPerIp, 5); // tighten anon callable
  const ok = checkAndIncrementRateLimit(uidKey, userBuckets, limit);
  if (!ok) {
    metrics.rateLimitHits++;
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
  }

  metrics.requests++;
  metrics.perPlatform[platform] = (metrics.perPlatform[platform] || 0) + 1;
  metrics.lastRequestAt = Date.now();

  // Cache key includes platform only (purpose not yet differentiating tokens in bridge mode)
  return coreGetToken(platform);
});

// (Future) HTTP function variant for non-Firebase callers
export const fetchSocialAccessToken = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const platform = (req.query.platform as string) || '';
  if (!platform) {
    res.status(400).json({ error: 'platform required' });
    return;
  }
  try {
    // IP-based rate limiting
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const okIp = checkAndIncrementRateLimit(ip, ipBuckets, rateLimitConfig.maxPerIp);
    if (!okIp) {
      metrics.rateLimitHits++;
      res.status(429).json({ error: 'rate_limit_exceeded' });
      return;
    }
    metrics.requests++;
    metrics.perPlatform[platform] = (metrics.perPlatform[platform] || 0) + 1;
    metrics.lastRequestAt = Date.now();
    const response = await coreGetToken(platform);
  res.status(200).json(response as TokenResponse);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal error' });
  }
});

// Lightweight metrics callable for observability (no tokens returned)
export const getSocialTokenMetrics = functions.https.onCall(async (_data, context) => {
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (!context.auth && !isEmulator) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  return {
    ...metrics,
    cacheHitRate: metrics.requests ? +(metrics.cacheHits / metrics.requests).toFixed(3) : 0,
    rateLimitConfig,
    now: Date.now()
  };
});
