/**
 * MarketingStatusService
 *
 * Provides real-time health status for all marketing pipeline components:
 * - XML Sitemap freshness and car count
 * - Google Merchant Center feed status
 * - Image optimization pipeline stats
 * - IndexNow submission state
 * - Prerender / SEO crawl pipeline
 *
 * Used by the SuperAdmin MarketingStatusPanel to display live operational status.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

export type StatusLevel = 'ok' | 'warning' | 'error' | 'unknown';

export interface SitemapStatus {
  status: StatusLevel;
  lastGenerated: Date | null;
  carCount: number;
  ageHours: number | null;
  message: string;
}

export interface MerchantFeedStatus {
  status: StatusLevel;
  lastCached: Date | null;
  productCount: number;
  ageHours: number | null;
  message: string;
}

export interface ImageOptimizationStatus {
  status: StatusLevel;
  totalProcessed: number;
  pendingCount: number;
  failedCount: number;
  message: string;
}

export interface IndexNowStatus {
  status: StatusLevel;
  lastSubmission: Date | null;
  urlsSubmitted: number;
  message: string;
}

export interface PrerenderStatus {
  status: StatusLevel;
  cacheHitRate: number | null;
  lastActivity: Date | null;
  message: string;
}

export interface MarketingStatusReport {
  fetchedAt: Date;
  sitemap: SitemapStatus;
  merchantFeed: MerchantFeedStatus;
  imageOptimization: ImageOptimizationStatus;
  indexNow: IndexNowStatus;
  prerender: PrerenderStatus;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Sitemap older than 6 hours is a warning; older than 24 hours is an error. */
const SITEMAP_WARN_HOURS = 6;
const SITEMAP_ERROR_HOURS = 24;

/** Merchant feed older than 12 hours is a warning; older than 48 hours is an error. */
const FEED_WARN_HOURS = 12;
const FEED_ERROR_HOURS = 48;

// ============================================================================
// SERVICE CLASS
// ============================================================================

class MarketingStatusService {
  private static instance: MarketingStatusService;

  private constructor() {}

  static getInstance(): MarketingStatusService {
    if (!MarketingStatusService.instance) {
      MarketingStatusService.instance = new MarketingStatusService();
    }
    return MarketingStatusService.instance;
  }

  /**
   * Returns the full marketing pipeline health report.
   */
  async getMarketingStatus(): Promise<MarketingStatusReport> {
    const [sitemap, merchantFeed, imageOptimization, indexNow, prerender] =
      await Promise.allSettled([
        this.getSitemapStatus(),
        this.getMerchantFeedStatus(),
        this.getImageOptimizationStatus(),
        this.getIndexNowStatus(),
        this.getPrerenderStatus(),
      ]);

    return {
      fetchedAt: new Date(),
      sitemap: this.unwrap(sitemap, this.unknownSitemapStatus()),
      merchantFeed: this.unwrap(merchantFeed, this.unknownMerchantStatus()),
      imageOptimization: this.unwrap(
        imageOptimization,
        this.unknownImageStatus()
      ),
      indexNow: this.unwrap(indexNow, this.unknownIndexNowStatus()),
      prerender: this.unwrap(prerender, this.unknownPrerenderStatus()),
    };
  }

  // ============================================================================
  // SITEMAP
  // ============================================================================

  private async getSitemapStatus(): Promise<SitemapStatus> {
    try {
      const sitemapRef = doc(db, 'system_status', 'sitemap');
      const snap = await getDoc(sitemapRef);

      if (!snap.exists()) {
        return {
          status: 'unknown',
          lastGenerated: null,
          carCount: 0,
          ageHours: null,
          message: 'No sitemap status record found',
        };
      }

      const data = snap.data();
      const lastGenerated: Date | null =
        data.lastGenerated instanceof Timestamp
          ? data.lastGenerated.toDate()
          : null;
      const carCount: number = data.carCount ?? 0;
      const ageHours = lastGenerated
        ? (Date.now() - lastGenerated.getTime()) / 3_600_000
        : null;

      let status: StatusLevel = 'ok';
      let message = `Sitemap current — ${carCount} listings`;
      if (ageHours === null) {
        status = 'unknown';
        message = 'Last generation time unknown';
      } else if (ageHours > SITEMAP_ERROR_HOURS) {
        status = 'error';
        message = `Sitemap is ${Math.round(ageHours)}h old — regeneration needed`;
      } else if (ageHours > SITEMAP_WARN_HOURS) {
        status = 'warning';
        message = `Sitemap is ${Math.round(ageHours)}h old`;
      }

      return { status, lastGenerated, carCount, ageHours, message };
    } catch (err) {
      logger.error('MarketingStatusService: getSitemapStatus failed', err);
      return this.unknownSitemapStatus('Read error');
    }
  }

  // ============================================================================
  // MERCHANT FEED
  // ============================================================================

  private async getMerchantFeedStatus(): Promise<MerchantFeedStatus> {
    try {
      const feedRef = doc(db, 'system_status', 'merchant_feed');
      const snap = await getDoc(feedRef);

      if (!snap.exists()) {
        return {
          status: 'unknown',
          lastCached: null,
          productCount: 0,
          ageHours: null,
          message: 'No feed status record found',
        };
      }

      const data = snap.data();
      const lastCached: Date | null =
        data.lastCached instanceof Timestamp ? data.lastCached.toDate() : null;
      const productCount: number = data.productCount ?? 0;
      const ageHours = lastCached
        ? (Date.now() - lastCached.getTime()) / 3_600_000
        : null;

      let status: StatusLevel = 'ok';
      let message = `Feed current — ${productCount} products`;
      if (ageHours === null) {
        status = 'unknown';
        message = 'Feed cache time unknown';
      } else if (ageHours > FEED_ERROR_HOURS) {
        status = 'error';
        message = `Feed is ${Math.round(ageHours)}h old — stale`;
      } else if (ageHours > FEED_WARN_HOURS) {
        status = 'warning';
        message = `Feed is ${Math.round(ageHours)}h old`;
      }

      return { status, lastCached, productCount, ageHours, message };
    } catch (err) {
      logger.error('MarketingStatusService: getMerchantFeedStatus failed', err);
      return this.unknownMerchantStatus('Read error');
    }
  }

  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================

  private async getImageOptimizationStatus(): Promise<ImageOptimizationStatus> {
    try {
      const imgRef = doc(db, 'system_status', 'image_optimization');
      const snap = await getDoc(imgRef);

      if (!snap.exists()) {
        return {
          status: 'unknown',
          totalProcessed: 0,
          pendingCount: 0,
          failedCount: 0,
          message: 'No image optimization record',
        };
      }

      const data = snap.data();
      const totalProcessed: number = data.totalProcessed ?? 0;
      const pendingCount: number = data.pendingCount ?? 0;
      const failedCount: number = data.failedCount ?? 0;

      let status: StatusLevel = 'ok';
      let message = `${totalProcessed} images optimized`;
      if (failedCount > 50) {
        status = 'error';
        message = `${failedCount} images failed optimization`;
      } else if (failedCount > 10 || pendingCount > 100) {
        status = 'warning';
        message = `${pendingCount} pending, ${failedCount} failed`;
      }

      return { status, totalProcessed, pendingCount, failedCount, message };
    } catch (err) {
      logger.error(
        'MarketingStatusService: getImageOptimizationStatus failed',
        err
      );
      return this.unknownImageStatus('Read error');
    }
  }

  // ============================================================================
  // INDEXNOW
  // ============================================================================

  private async getIndexNowStatus(): Promise<IndexNowStatus> {
    try {
      const indexRef = doc(db, 'system_status', 'indexnow');
      const snap = await getDoc(indexRef);

      if (!snap.exists()) {
        return {
          status: 'unknown',
          lastSubmission: null,
          urlsSubmitted: 0,
          message: 'No IndexNow record found',
        };
      }

      const data = snap.data();
      const lastSubmission: Date | null =
        data.lastSubmission instanceof Timestamp
          ? data.lastSubmission.toDate()
          : null;
      const urlsSubmitted: number = data.urlsSubmitted ?? 0;
      const lastError: string | undefined = data.lastError;

      let status: StatusLevel = lastError ? 'warning' : 'ok';
      let message = lastError
        ? `Last error: ${lastError}`
        : `${urlsSubmitted} URLs submitted`;

      return { status, lastSubmission, urlsSubmitted, message };
    } catch (err) {
      logger.error('MarketingStatusService: getIndexNowStatus failed', err);
      return this.unknownIndexNowStatus('Read error');
    }
  }

  // ============================================================================
  // PRERENDER
  // ============================================================================

  private async getPrerenderStatus(): Promise<PrerenderStatus> {
    try {
      const prerenderRef = doc(db, 'system_status', 'prerender');
      const snap = await getDoc(prerenderRef);

      if (!snap.exists()) {
        return {
          status: 'unknown',
          cacheHitRate: null,
          lastActivity: null,
          message: 'No prerender record found',
        };
      }

      const data = snap.data();
      const cacheHitRate: number | null = data.cacheHitRate ?? null;
      const lastActivity: Date | null =
        data.lastActivity instanceof Timestamp
          ? data.lastActivity.toDate()
          : null;
      const errorCount: number = data.errorCount ?? 0;

      let status: StatusLevel = 'ok';
      let message =
        cacheHitRate !== null
          ? `Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`
          : 'Prerender active';
      if (errorCount > 20) {
        status = 'error';
        message = `${errorCount} prerender errors`;
      } else if (errorCount > 5) {
        status = 'warning';
        message = `${errorCount} prerender errors`;
      }

      return { status, cacheHitRate, lastActivity, message };
    } catch (err) {
      logger.error('MarketingStatusService: getPrerenderStatus failed', err);
      return this.unknownPrerenderStatus('Read error');
    }
  }

  // ============================================================================
  // ACTIONS — trigger CF to regenerate
  // ============================================================================

  /** Trigger manual sitemap regeneration via Cloud Function */
  async triggerSitemapRegeneration(): Promise<void> {
    const fn = httpsCallable(functions, 'manualSitemapRegeneration');
    await fn({});
  }

  /** Trigger manual merchant feed cache update via Cloud Function */
  async triggerMerchantFeedUpdate(): Promise<void> {
    const fn = httpsCallable(functions, 'updateMerchantFeedCache');
    await fn({});
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private unwrap<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }

  private unknownSitemapStatus(message = 'Status unknown'): SitemapStatus {
    return {
      status: 'unknown',
      lastGenerated: null,
      carCount: 0,
      ageHours: null,
      message,
    };
  }

  private unknownMerchantStatus(
    message = 'Status unknown'
  ): MerchantFeedStatus {
    return {
      status: 'unknown',
      lastCached: null,
      productCount: 0,
      ageHours: null,
      message,
    };
  }

  private unknownImageStatus(
    message = 'Status unknown'
  ): ImageOptimizationStatus {
    return {
      status: 'unknown',
      totalProcessed: 0,
      pendingCount: 0,
      failedCount: 0,
      message,
    };
  }

  private unknownIndexNowStatus(message = 'Status unknown'): IndexNowStatus {
    return {
      status: 'unknown',
      lastSubmission: null,
      urlsSubmitted: 0,
      message,
    };
  }

  private unknownPrerenderStatus(message = 'Status unknown'): PrerenderStatus {
    return {
      status: 'unknown',
      cacheHitRate: null,
      lastActivity: null,
      message,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const marketingStatusService = MarketingStatusService.getInstance();
export default marketingStatusService;
