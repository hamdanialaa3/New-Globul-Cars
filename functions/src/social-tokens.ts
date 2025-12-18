// functions/src/social-tokens.ts
// Secure token exchange endpoints (Phase 1 -> Phase 2 migration)
// Provides short-lived social media access tokens to frontend via callable HTTPS function.
// NOTE: Currently returns existing environment tokens (development bridge). Replace with
// real OAuth exchange / token minting in later phase.

import { onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';

// Initialize admin if not already (safe idempotent)
try { if (!admin.apps.length) { admin.initializeApp(); } } catch { /* noop */ }
// Optional Secret Manager integration (lazy required)
// Using 'any' to avoid needing @types; dynamic import keeps optional nature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let secretManagerClient: unknown = null;
async function getSecretManager() {
  if (!process.env.ENABLE_SECRET_MANAGER) return null;
  if (!secretManagerClient) {
    try {
      // Dynamically import to avoid cold-start penalty if unused
  const sm: unknown = await import('@google-cloud/secret-manager');
  secretManagerClient = new sm.SecretManagerServiceClient();
    } catch (e) {
      logger.warn('[social-tokens] Secret Manager unavailable, continuing with env tokens');
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
  issuer?: string; // identifies backend source variant
  wrapped?: boolean; // indicates token is ephemeral wrapped form
  rawIncluded?: boolean; // whether raw token also included (debug/dev only)
  ephemeral?: {
    value: string; // signed opaque token
    expiresAt: number;
  };
  ops?: string[]; // allowed operations (claims)
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
  secretFetchFailures: 0,
  ephemeralIssued: 0,
  ephemeralVerified: 0,
  ephemeralInvalid: 0,
  ephemeralExpired: 0,
  ephemeralVerifiedPrev: 0,
  snapshotStored: 0,
  snapshotFailures: 0,
  secretReloads: 0,
  secretReloadFailures: 0,
  rotations: 0,
  rotationsSkipped: 0
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
const EPHEMERAL_TOKEN_TTL_SECONDS = 60 * 5; // 5 minutes short-lived
const ENABLE_EPHEMERAL = process.env.ENABLE_EPHEMERAL_TOKENS === '1';
const HIDE_RAW_TOKENS = process.env.HIDE_RAW_TOKENS === '1'; // safer gating than NODE_ENV only
// --- Rotation Manifest & Signing Secrets Management ---
// Firestore document holding current & previous signing secrets and generations
const ROTATION_DOC_PATH = 'social_tokens/rotation_state';
const EPHEMERAL_GRACE_MINUTES = Number(process.env.EPHEMERAL_GRACE_MINUTES || '45');
interface SigningSecretsManifest {
  currentGeneration: number;
  previousGeneration?: number;
  currentSecret: string;
  previousSecret?: string;
  graceUntil?: number; // timestamp after which previous is no longer valid
  lastRotationAt: number;
}

let manifestCache: { value: SigningSecretsManifest; loadedAt: number } | null = null;
const MANIFEST_CACHE_TTL_MS = 60_000; // refresh at most every 60s
let cachedSecrets: { currentSecret: string; previousSecret?: string; currentGeneration: number; previousGeneration?: number; graceUntil?: number } = {
  currentSecret: process.env.EPHEMERAL_SIGNING_SECRET || 'dev-insecure-secret-change',
  previousSecret: process.env.EPHEMERAL_SIGNING_SECRET_PREVIOUS,
  currentGeneration: Number(process.env.EPHEMERAL_GENERATION || '1'),
  previousGeneration: process.env.EPHEMERAL_SIGNING_SECRET_PREVIOUS ? Number(process.env.EPHEMERAL_GENERATION || '1') - 1 : undefined,
  graceUntil: undefined
};

async function loadRotationManifest(force = false): Promise<SigningSecretsManifest> {
  const now = Date.now();
  if (!force && manifestCache && (now - manifestCache.loadedAt) < MANIFEST_CACHE_TTL_MS) {
    return manifestCache.value;
  }
  try {
    const docRef = admin.firestore().doc(ROTATION_DOC_PATH);
    const snap = await docRef.get();
    if (!snap.exists) {
      // Initialize manifest using env bootstrap secrets
      const initial: SigningSecretsManifest = {
        currentGeneration: cachedSecrets.currentGeneration,
        previousGeneration: cachedSecrets.previousGeneration,
        currentSecret: cachedSecrets.currentSecret,
        previousSecret: cachedSecrets.previousSecret,
        lastRotationAt: now,
        graceUntil: cachedSecrets.graceUntil
      };
      await docRef.set(initial, { merge: true });
      manifestCache = { value: initial, loadedAt: now };
      metrics.secretReloads++;
      return initial;
    }
    const data = snap.data() as SigningSecretsManifest;
    manifestCache = { value: data, loadedAt: now };
    cachedSecrets = {
      currentSecret: data.currentSecret,
      previousSecret: data.previousSecret,
      currentGeneration: data.currentGeneration,
      previousGeneration: data.previousGeneration,
      graceUntil: data.graceUntil
    };
    metrics.secretReloads++;
    return data;
  } catch (e) {
    metrics.secretReloadFailures++;
    // Fallback to in-memory bootstrap
    return {
      currentGeneration: cachedSecrets.currentGeneration,
      previousGeneration: cachedSecrets.previousGeneration,
      currentSecret: cachedSecrets.currentSecret,
      previousSecret: cachedSecrets.previousSecret,
      graceUntil: cachedSecrets.graceUntil,
      lastRotationAt: cachedSecrets.currentGeneration === 1 ? (Date.now()) : (Date.now())
    };
  }
}

function getCachedSecrets() {
  return cachedSecrets; // synchronous access for verification
}

function createEphemeralToken(platform: string, ops: string[], secret: string, generation: number): { value: string; expiresAt: number; ops: string[] } {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + EPHEMERAL_TOKEN_TTL_SECONDS * 1000;
  const payloadObj = { p: platform, iat: issuedAt, exp: expiresAt, v: 1, g: generation, ops };
  const payload = JSON.stringify(payloadObj);
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const value = Buffer.from(payload).toString('base64url') + '.' + hmac;
  return { value, expiresAt, ops };
}

export interface EphemeralVerificationResult {
  valid: boolean;
  platform?: string;
  issuedAt?: number;
  expiresAt?: number;
  version?: number;
  reason?: string;
}

export function verifyEphemeralToken(token: string): EphemeralVerificationResult {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      metrics.ephemeralInvalid++;
      return { valid: false, reason: 'format' };
    }
    const payloadB64 = parts[0];
    const sig = parts[1];
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const obj = JSON.parse(payloadJson);
    const gen: number | undefined = obj.g;

    const { currentSecret, previousSecret, currentGeneration, previousGeneration, graceUntil } = getCachedSecrets();
    // If generation expired (outside grace) and token references previous – treat as invalid
    if (gen === previousGeneration && graceUntil && Date.now() > graceUntil) {
      metrics.ephemeralInvalid++;
      return { valid: false, reason: 'stale-generation' };
    }

    const expectedCurrent = crypto.createHmac('sha256', currentSecret).update(payloadJson).digest('base64url');
    let match = expectedCurrent.length === sig.length && crypto.timingSafeEqual(Buffer.from(expectedCurrent), Buffer.from(sig));
    let usedPrev = false;
    if (!match && previousSecret && previousGeneration !== undefined) {
      const expectedPrev = crypto.createHmac('sha256', previousSecret).update(payloadJson).digest('base64url');
      match = expectedPrev.length === sig.length && crypto.timingSafeEqual(Buffer.from(expectedPrev), Buffer.from(sig));
      if (match) usedPrev = true;
    }
    if (!match) {
      metrics.ephemeralInvalid++;
      return { valid: false, reason: 'signature' };
    }
    const now = Date.now();
    if (now > obj.exp) {
      metrics.ephemeralExpired++;
      return { valid: false, reason: 'expired', platform: obj.p, issuedAt: obj.iat, expiresAt: obj.exp, version: obj.v };
    }
    if (usedPrev) {
      metrics.ephemeralVerifiedPrev++;
    } else {
      metrics.ephemeralVerified++;
    }
    return { valid: true, platform: obj.p, issuedAt: obj.iat, expiresAt: obj.exp, version: obj.v };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    metrics.ephemeralInvalid++;
    return { valid: false, reason: 'exception' };
  }
}

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

async function coreGetToken(platform: string, opts?: { purpose?: string }): Promise<TokenResponse> {
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
    throw new Error(`No token configured for ${platform}`);
  }

  const expiresAt = now + DEFAULT_TTL_SECONDS * 1000;
  memoryCache[cacheKey] = { token: raw, expiresAt };

  const base: TokenResponse = {
      platform,
      token: raw,
      expiresIn: DEFAULT_TTL_SECONDS,
      issuedAt: now,
      issuer: secretManagerClient ? 'secret-manager' : 'env'
  };
  if (ENABLE_EPHEMERAL) {
    // Derive allowed ops from purpose (very basic mapping for now)
    const purpose = opts?.purpose || 'generic';
    const ops = deriveOpsForPurpose(purpose);
    // Ensure latest manifest loaded (tolerate errors silently)
    await loadRotationManifest();
    const { currentSecret, currentGeneration } = getCachedSecrets();
    const eph = createEphemeralToken(platform, ops, currentSecret, currentGeneration);
    metrics.ephemeralIssued++;
    base.ephemeral = eph;
    base.wrapped = true;
    base.ops = ops;
    // In production we should avoid including raw token when ephemeral is enabled.
    if (HIDE_RAW_TOKENS) {
      base.rawIncluded = false;
      // Replace exposed token with opaque ephemeral value to clients
      base.token = eph.value;
      base.expiresIn = Math.floor((eph.expiresAt - now) / 1000);
    } else {
      base.rawIncluded = true; // allow inspection in dev
    }
  }
  return base;
}

function deriveOpsForPurpose(purpose: string): string[] {
  switch (purpose) {
    case 'read_profile': return ['read'];
    case 'post_content': return ['create','read'];
    case 'analytics': return ['read','insights'];
    default: return ['read'];
  }
}

export const getSocialAccessToken = onCall({ cors: true, region: 'europe-west1' }, async (request): Promise<TokenResponse> => {
  const platform = request.data?.platform;
  if (!platform) {
    throw new Error('platform is required');
  }

  // Basic auth enforcement (Phase 1). Allow unauth only in emulator / development.
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (!request.auth && !isEmulator) {
    throw new Error('Authentication required');
  }

  // Rate limiting (per UID or anonymous tag)
  const uidKey = request.auth?.uid || '__anon__';
  const limit = request.auth ? rateLimitConfig.maxPerUid : Math.min(rateLimitConfig.maxPerIp, 5); // tighten anon callable
  const ok = checkAndIncrementRateLimit(uidKey, userBuckets, limit);
  if (!ok) {
    metrics.rateLimitHits++;
    throw new Error('Rate limit exceeded');
  }

  metrics.requests++;
  metrics.perPlatform[platform] = (metrics.perPlatform[platform] || 0) + 1;
  metrics.lastRequestAt = Date.now();

  // Cache key includes platform only (purpose not yet differentiating tokens in bridge mode)
  return coreGetToken(platform, { purpose: request.data?.purpose });
});

// (Future) HTTP function variant for non-Firebase callers
export const fetchSocialAccessToken = onRequest({ cors: true, region: 'europe-west1' }, async (req, res) => {
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
  const response = await coreGetToken(platform, { purpose: req.query.purpose as string });
    res.setHeader('X-Social-Token-Issuer', response.issuer || 'unknown');
    res.status(200).json(response as TokenResponse);
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    res.status(500).json({ error: error.message || 'internal error' });
  }
});

// Lightweight metrics callable for observability (no tokens returned)
export const getSocialTokenMetrics = onCall({ cors: true, region: 'europe-west1' }, async (request) => {
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (!request.auth && !isEmulator) {
    throw new Error('Authentication required');
  }
  return {
    ...metrics,
    cacheHitRate: metrics.requests ? +(metrics.cacheHits / metrics.requests).toFixed(3) : 0,
    rateLimitConfig,
    now: Date.now()
  };
});

// --- Rotation & Anomaly (Stub Implementations) ---
interface RotationResult { rotated: boolean; details: Record<string, any>; skipped?: boolean; }

// Real HMAC signing secret rotation (platform raw token rotation remains placeholder)
export const rotateSocialPlatformTokens = onSchedule('every 24 hours', async (event) => {
  const details: Record<string, any> = {};
  const enable = process.env.ENABLE_HMAC_ROTATION === '1' && ENABLE_EPHEMERAL;
  if (!enable) {
    metrics.rotationsSkipped++;
    logger.info('Token rotation skipped:', { rotated: false, skipped: true, details: { reason: 'rotation-disabled-or-ephemeral-off' } });
    return;
  }

  // Load current manifest
  const manifest = await loadRotationManifest(true);
  details.before = { currentGeneration: manifest.currentGeneration, previousGeneration: manifest.previousGeneration };

  // Basic anomaly heuristic: invalid + expired > 10% of issued
  const issued = metrics.ephemeralIssued || 0;
  const problematic = metrics.ephemeralInvalid + metrics.ephemeralExpired;
  const anomaly = issued > 50 && problematic / (issued || 1) > 0.10;
  if (anomaly) {
    details.anomalyDetected = true;
    details.problematicRatio = +(problematic / issued).toFixed(3);
  }

  // If previous still in grace window, optionally skip unless forced
  const now = Date.now();
  if (manifest.graceUntil && now < manifest.graceUntil) {
    details.skippedReason = 'grace-active';
    metrics.rotationsSkipped++;
    logger.info('Rotation skipped (grace active):', { rotated: false, skipped: true, details });
    return;
  }

  // Generate new secret
  const newSecret = crypto.randomBytes(32).toString('hex');
  const newGeneration = (manifest.currentGeneration || 1) + 1;
  const graceUntil = now + EPHEMERAL_GRACE_MINUTES * 60_000;

  const newManifest: SigningSecretsManifest = {
    currentGeneration: newGeneration,
    previousGeneration: manifest.currentGeneration,
    currentSecret: newSecret,
    previousSecret: manifest.currentSecret,
    graceUntil,
    lastRotationAt: now
  };

  await admin.firestore().doc(ROTATION_DOC_PATH).set(newManifest, { merge: false });
  // Update caches synchronously for immediate verification correctness
  manifestCache = { value: newManifest, loadedAt: now };
  cachedSecrets = {
    currentSecret: newManifest.currentSecret,
    previousSecret: newManifest.previousSecret,
    currentGeneration: newManifest.currentGeneration,
    previousGeneration: newManifest.previousGeneration,
    graceUntil: newManifest.graceUntil
  };
  metrics.rotations++;

  details.after = { currentGeneration: newManifest.currentGeneration, previousGeneration: newManifest.previousGeneration, graceUntil };
  logger.info('Token rotation completed:', { rotated: true, details });
});

// Snapshot metrics to (future) BigQuery / Firestore (stub only)
interface MetricsSnapshotResult { stored: boolean; transport: 'none' | 'bigquery' | 'firestore'; size: number; generation: number; previousGeneration?: number; }
export const snapshotSocialTokenMetrics = onSchedule('every 5 minutes', async () => {
  const manifest = await loadRotationManifest();
  const snapshot = {
    ts: Date.now(),
    generation: manifest.currentGeneration,
    previousGeneration: manifest.previousGeneration,
    ...metrics
  };
  const enableStore = process.env.ENABLE_METRICS_SNAPSHOT_STORE === '1';
  const useFirestore = process.env.METRICS_STORE === 'firestore';
  if (!enableStore) {
    logger.info('Metrics snapshot disabled:', { stored: false, transport: 'none', size: Object.keys(snapshot).length, generation: manifest.currentGeneration, previousGeneration: manifest.previousGeneration });
    return;
  }
  try {
    if (useFirestore) {
      await admin.firestore().collection('social_token_metrics').add(snapshot);
      metrics.snapshotStored++;
      logger.info('Metrics snapshot stored in Firestore:', { stored: true, transport: 'firestore', size: Object.keys(snapshot).length, generation: manifest.currentGeneration, previousGeneration: manifest.previousGeneration });
      return;
    }
    // Placeholder for future BigQuery integration
    logger.info('Metrics snapshot completed:', { stored: false, transport: 'bigquery', size: Object.keys(snapshot).length, generation: manifest.currentGeneration, previousGeneration: manifest.previousGeneration });
  } catch (e) {
    metrics.snapshotFailures++;
    logger.warn('Metrics snapshot failed:', { stored: false, transport: useFirestore ? 'firestore' : 'none', size: Object.keys(snapshot).length, generation: manifest.currentGeneration, previousGeneration: manifest.previousGeneration });
  }
});
