// src/services/social-token-provider.ts
// Social Media Token Provider Abstraction
// Provides a single interface to acquire tokens for social platforms without exposing long-lived secrets in client bundles.
// NOTE: In production this should call a backend endpoint that returns short-lived tokens.

import { logger } from './logger-service';
import { socialMediaCache } from './cache-service';

// Lightweight verifier for opaque ephemeral tokens issued by backend (must mirror backend HMAC logic / but here we only structure-validate to avoid exposing secret)
// Full cryptographic verification intentionally server-side; client only parses base64 segment for exp & platform to fail-fast on obviously expired tokens.
interface ParsedEphemeral { platform?: string; exp?: number; iat?: number; ops?: string[]; }
function parseEphemeral(token: string): ParsedEphemeral | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    const obj = JSON.parse(payloadJson);
    if (!obj || typeof obj !== 'object') return null;
    return { platform: obj.p, exp: obj.exp, iat: obj.iat, ops: obj.ops };
  } catch {
    return null;
  }
}
// Lazy import firebase functions to avoid hard dependency during SSR or build phases
let functionsModule: any = null;
let httpsCallable: any = null;
async function loadFunctions() {
  if (!functionsModule) {
    try {
      const mod = await import('firebase/functions');
      functionsModule = mod;
      httpsCallable = mod.httpsCallable;
    } catch {
      // silent: backend not yet available
    }
  }
  return { functionsModule, httpsCallable };
}

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'threads';

export interface TokenAcquisitionOptions {
  platform: SocialPlatform;
  forceRefresh?: boolean;
}

export interface SocialToken {
  platform: SocialPlatform;
  token: string;
  expiresAt?: number; // epoch ms
  issuedAt: number;
  source: 'env' | 'backend' | 'memory';
  ops?: string[];
  wrapped?: boolean;
}

/**
 * SocialTokenProvider
 * Phase 0/1 abstraction layer. Currently uses environment variables as fallback.
 * Future (Phase 1): integrate with secure backend proxy returning ephemeral tokens.
 */
export class SocialTokenProvider {
  private static instance: SocialTokenProvider;
  private logger: any;
  private inMemory: Map<SocialPlatform, SocialToken> = new Map();
  private CACHE_PREFIX = 'social_token';

  private constructor() {
    // Using global logger instance
    this.logger = logger;
  }

  static getInstance(): SocialTokenProvider {
    if (!this.instance) this.instance = new SocialTokenProvider();
    return this.instance;
  }

  /**
   * Acquire token for a platform with caching.
   * Strategy order: memory -> cache -> backend (TODO) -> env fallback.
   */
  async getToken(opts: TokenAcquisitionOptions): Promise<SocialToken | null> {
    const { platform, forceRefresh } = opts;
    const cacheKey = `${this.CACHE_PREFIX}:${platform}`;

    if (!forceRefresh) {
      const mem = this.inMemory.get(platform);
      if (mem && !this.isExpired(mem)) return mem;

      const cached = socialMediaCache.get<SocialToken>(cacheKey);
      if (cached && !this.isExpired(cached)) {
        this.inMemory.set(platform, cached);
        return { ...cached, source: 'memory' };
      }
    }

    // Attempt backend callable (Phase 1 bridge -> Phase 2). Non-blocking fallback to env.
    try {
      const { functionsModule, httpsCallable } = await loadFunctions();
      if (functionsModule && httpsCallable) {
        const regionFn = (window as any)?.socialRegion || 'us-central1';
        const app = (await import('firebase/app')).getApps?.()[0];
        if (app) {
          const f = functionsModule.getFunctions(app, regionFn);
          const callable = httpsCallable(f, 'getSocialAccessToken');
          const result: any = await callable({ platform });
          if (result?.data?.token) {
            const backendToken: SocialToken = {
              platform,
              token: result.data.token,
              issuedAt: result.data.issuedAt || Date.now(),
              expiresAt: result.data.expiresIn ? Date.now() + result.data.expiresIn * 1000 : undefined,
              source: 'backend',
              ops: result.data.ops,
              wrapped: !!result.data.wrapped
            };

            // If wrapped & raw hidden, attempt lightweight structural/expiry validation
            if (backendToken.wrapped && result.data.rawIncluded === false) {
              const parsed = parseEphemeral(backendToken.token);
              if (parsed?.exp && Date.now() > parsed.exp) {
                this.logger.warn('Received already expired ephemeral token (client reject)', { platform });
                throw new Error('Expired ephemeral token');
              }
              if (parsed?.platform && parsed.platform !== platform) {
                this.logger.warn('Ephemeral token platform mismatch', { expected: platform, got: parsed.platform });
                throw new Error('Platform mismatch');
              }
              if (!parsed?.ops || parsed.ops.length === 0) {
                this.logger.warn('Ephemeral token missing ops claims');
              } else {
                backendToken.ops = parsed.ops;
              }
            } else if (backendToken.wrapped && result.data.rawIncluded) {
              // Misconfiguration if HIDE_RAW_TOKENS expected in production
              if (process.env.NODE_ENV === 'production') {
                this.logger.error('Security warning: wrapped token delivered with rawIncluded=true in production');
              }
            }
            this.inMemory.set(platform, backendToken);
            socialMediaCache.set(cacheKey, backendToken, (result.data.expiresIn || 600) * 1000);
            return backendToken;
          }
        }
      }
    } catch (e) {
      this.logger.debug('Backend token callable unavailable, falling back to env', { platform });
    }

    const envToken = this.readEnv(platform);
    if (envToken) {
      const token: SocialToken = {
        platform,
        token: envToken,
        issuedAt: Date.now(),
        source: 'env'
      };
      this.inMemory.set(platform, token);
      // short cache TTL (5 min) to allow rotation
      socialMediaCache.set(cacheKey, token, 5 * 60 * 1000);
      return token;
    }

    this.logger.warn(`No token available for platform: ${platform}`);
    return null;
  }

  private isExpired(token: SocialToken): boolean {
    return !!token.expiresAt && Date.now() > token.expiresAt;
  }

  private readEnv(platform: SocialPlatform): string | null {
    switch (platform) {
      case 'tiktok':
        return process.env.REACT_APP_TIKTOK_ACCESS_TOKEN || null;
      case 'instagram':
        return process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || null;
      case 'facebook':
        return process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN || null;
      case 'threads':
        // Threads may reuse Instagram or have separate token strategy later
        return process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || null;
      default:
        return null;
    }
  }
}

export const socialTokenProvider = SocialTokenProvider.getInstance();
