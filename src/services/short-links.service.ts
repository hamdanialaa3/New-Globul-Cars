/**
 * Short Links Service
 * Generates and resolves short links for listings and profiles
 * Tracks click analytics asynchronously
 *
 * @file short-links.service.ts
 */

import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

interface ShortLinkRecord {
  shortCode: string;
  targetType: 'listing' | 'user' | 'story' | 'page';
  targetId: string; // listingNumericId, userNumericId, or other ID
  targetUrl: string; // full canonical URL
  createdBy: string; // userId
  createdAt: string; // ISO timestamp
  expiresAt?: string; // optional expiry
  clickCount: number;
  lastClickAt?: string; // ISO timestamp
}

/**
 * Generate base62 short code from numeric ID
 * Example: 12345 → "3d7" (base62 encoding)
 */
function generateShortCode(targetId: string | number, salt: string = ''): string {
  const input = `${targetId}-${salt}-${Date.now()}`;
  const hash = simpleHash(input);
  return base62Encode(hash).slice(0, 7); // 7-char code is collision-resistant for our scale
}

/**
 * Simple hash function for generating short codes
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Encode number to base62 (0-9, a-z, A-Z)
 */
function base62Encode(num: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  while (num > 0) {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result || '0';
}

export class ShortLinksService {
  /**
   * Create a short link for a listing or user
   * Returns: { shortCode, url }
   */
  static async createShortLink(
    targetType: 'listing' | 'user' | 'story',
    targetId: string | number,
    targetUrl: string,
    createdBy: string,
    expiresInDays?: number
  ): Promise<{ shortCode: string; url: string }> {
    try {
      const shortCode = generateShortCode(targetId, createdBy);

      // Check for collision (extremely rare, but possible)
      const existingLink = await getDoc(doc(db, 'short_links', shortCode));
      if (existingLink.exists()) {
        serviceLogger.warn('Short code collision detected, generating new', {
          shortCode,
          targetId,
        });
        // Retry with different salt
        return this.createShortLink(
          targetType,
          targetId,
          targetUrl,
          createdBy,
          expiresInDays
        );
      }

      const now = new Date().toISOString();
      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : undefined;

      const shortLinkRecord: ShortLinkRecord = {
        shortCode,
        targetType,
        targetId: String(targetId),
        targetUrl,
        createdBy,
        createdAt: now,
        expiresAt,
        clickCount: 0,
      };

      // Store in Firestore
      await setDoc(doc(db, 'short_links', shortCode), shortLinkRecord);

      serviceLogger.info('Short link created', {
        shortCode,
        targetType,
        targetId,
        expiresAt,
      });

      return {
        shortCode,
        url: `/s/${shortCode}`,
      };
    } catch (err) {
      serviceLogger.error('Failed to create short link', {
        targetType,
        targetId,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Resolve a short code to its target URL
   * Returns null if not found or expired
   */
  static async resolveShortCode(shortCode: string): Promise<string | null> {
    try {
      const shortLinkRef = doc(db, 'short_links', shortCode);
      const shortLinkSnap = await getDoc(shortLinkRef);

      if (!shortLinkSnap.exists()) {
        serviceLogger.warn('Short code not found', { shortCode });
        return null;
      }

      const data = shortLinkSnap.data() as ShortLinkRecord;

      // Check expiry
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        serviceLogger.warn('Short link expired', { shortCode, expiresAt: data.expiresAt });
        // Optionally delete expired link asynchronously
        this.deleteShortLink(shortCode).catch(() => {
          // Silent fail
        });
        return null;
      }

      return data.targetUrl;
    } catch (err) {
      serviceLogger.error('Failed to resolve short code', {
        shortCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  /**
   * Increment click count for a short link
   * Non-blocking operation; errors are logged but not thrown
   */
  static async incrementClickCount(shortCode: string): Promise<void> {
    try {
      const shortLinkRef = doc(db, 'short_links', shortCode);
      const docSnap = await getDoc(shortLinkRef);
      const currentCount = docSnap.data()?.clickCount ?? 0;
      
      await updateDoc(shortLinkRef, {
        clickCount: currentCount + 1,
        lastClickAt: new Date().toISOString(),
      });
    } catch (err) {
      serviceLogger.warn('Failed to increment click count', {
        shortCode,
        error: err instanceof Error ? err.message : String(err),
      });
      // Continue - do not throw
    }
  }

  /**
   * Delete a short link (cleanup)
   */
  static async deleteShortLink(shortCode: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'short_links', shortCode), {
        deletedAt: new Date().toISOString(),
      });
      serviceLogger.info('Short link deleted', { shortCode });
    } catch (err) {
      serviceLogger.error('Failed to delete short link', {
        shortCode,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Get analytics for a short link
   */
  static async getShortLinkAnalytics(shortCode: string) {
    try {
      const shortLinkRef = doc(db, 'short_links', shortCode);
      const shortLinkSnap = await getDoc(shortLinkRef);

      if (!shortLinkSnap.exists()) {
        return null;
      }

      const data = shortLinkSnap.data() as ShortLinkRecord;
      return {
        shortCode,
        targetUrl: data.targetUrl,
        clickCount: data.clickCount,
        createdAt: data.createdAt,
        lastClickAt: data.lastClickAt,
      };
    } catch (err) {
      serviceLogger.error('Failed to get short link analytics', {
        shortCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  /**
   * Get all short links owned by a user
   */
  static async getUserShortLinks(userId: string) {
    try {
      const q = query(
        collection(db, 'short_links'),
        where('createdBy', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data() as ShortLinkRecord }));
    } catch (err) {
      serviceLogger.error('Failed to get user short links', {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }
}
