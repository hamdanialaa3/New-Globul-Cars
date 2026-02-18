/**
 * SlugService — SEO-friendly slug generation for listings
 *
 * Purpose:
 * - Generate unique, URL-safe slugs from listing titles / brand+model+year
 * - Transliterate Cyrillic (Bulgarian) and Arabic to Latin
 * - Handle collisions with numeric suffixes
 * - Track slug history for 301 redirects when slugs change
 * - Build canonical URLs that combine numeric IDs + SEO slugs
 *
 * IMPORTANT — Routing note:
 *   The primary routing pattern stays `/car/{sellerNumericId}/{carNumericId}`
 *   as mandated by CONSTITUTION.md §4.1. Slugs are stored as metadata for:
 *   • <link rel="canonical"> / og:url  (SEO)
 *   • Sitemap generation
 *   • Social sharing previews
 *   • Future SEO-friendly routes (when ready)
 *
 * @file slug.service.ts
 * @since 2026-02-18
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// ─── Transliteration maps ──────────────────────────────────────────

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'sht', ъ: 'a', ь: '', ю: 'yu', я: 'ya',
  // Uppercase duplicated for simplicity
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ж: 'Zh', З: 'Z',
  И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', П: 'P',
  Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'H', Ц: 'Ts', Ч: 'Ch',
  Ш: 'Sh', Щ: 'Sht', Ъ: 'A', Ь: '', Ю: 'Yu', Я: 'Ya',
};

const ARABIC_TO_LATIN: Record<string, string> = {
  ا: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h', خ: 'kh',
  د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's',
  ض: 'd', ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'q',
  ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'w', ي: 'y',
  ة: 'a', ى: 'a', ء: '', أ: 'a', إ: 'i', آ: 'a', ؤ: 'w', ئ: 'y',
};

/**
 * Transliterate BG Cyrillic and Arabic characters to Latin.
 * Leaves Latin/digits untouched.
 */
function transliterate(text: string): string {
  return text
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ARABIC_TO_LATIN[ch] ?? ch)
    .join('');
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Convert any text to a URL-safe slug.
 *
 *  - Unicode NFKD normalisation
 *  - BG / AR → Latin transliteration
 *  - Lowercase, non-alnum → dash, collapse, trim
 *  - Max 80 characters
 */
export function slugify(text: string, maxLen = 80): string {
  if (!text) return '';
  const normalised = text.normalize('NFKD');
  const latin = transliterate(normalised);
  const slug = latin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
  return slug || `listing-${Date.now()}`;
}

/**
 * Build a descriptive slug from listing fields.
 * e.g. "bmw-3-series-2017" or "alaa-320d-sport"
 */
export function buildListingSlug(fields: {
  title?: string;
  make?: string;
  model?: string;
  year?: number;
}): string {
  if (fields.title) return slugify(fields.title);
  const parts = [fields.make, fields.model, fields.year].filter(Boolean).join(' ');
  return slugify(parts || 'listing');
}

/**
 * Build a canonical URL that includes both the numeric-ID route
 * and the SEO slug as a suffix.
 *
 * Result: `/car/{sellerNumericId}/{carNumericId}/{slug}`
 *
 * The primary route `/car/{sellerNumericId}/{carNumericId}` stays the same.
 * The slug is appended for SEO; routing should strip/ignore it if present.
 */
export function buildCanonicalPath(
  sellerNumericId: number,
  carNumericId: number,
  slug: string,
): string {
  return `/car/${sellerNumericId}/${carNumericId}/${slug}`;
}

// ─── Firestore-backed uniqueness ───────────────────────────────────

const SLUG_INDEX_COLLECTION = 'listing_slugs'; // slug → listingId mapping

/**
 * Check if a slug is already claimed by another listing.
 */
async function slugExists(slug: string, excludeListingId?: string): Promise<boolean> {
  try {
    const ref = doc(db, SLUG_INDEX_COLLECTION, slug);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    if (excludeListingId && snap.data()?.listingId === excludeListingId) return false;
    return true;
  } catch {
    return false; // If collection doesn't exist yet, treat as free
  }
}

/**
 * Claim a slug in the index for a given listing.
 */
async function claimSlug(slug: string, listingId: string): Promise<void> {
  const ref = doc(db, SLUG_INDEX_COLLECTION, slug);
  await setDoc(ref, { listingId, claimedAt: serverTimestamp() });
}

/**
 * Release a previously claimed slug.
 */
async function releaseSlug(slug: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  const ref = doc(db, SLUG_INDEX_COLLECTION, slug);
  try {
    await deleteDoc(ref);
  } catch {
    // Ignore — may not exist
  }
}

// ─── Slug history for 301 redirects ────────────────────────────────

const SLUG_HISTORY_COLLECTION = 'listing_slug_history';

interface SlugHistoryRecord {
  listingId: string;
  oldSlug: string;
  newSlug: string;
  changedBy: string;
  changedAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Record a slug change so old URLs can 301-redirect to the new canonical.
 */
async function recordSlugChange(record: Omit<SlugHistoryRecord, 'changedAt'>): Promise<void> {
  try {
    await addDoc(collection(db, SLUG_HISTORY_COLLECTION), {
      ...record,
      changedAt: serverTimestamp(),
    });
  } catch (err) {
    serviceLogger.warn('Failed to record slug history', { err, ...record });
  }
}

/**
 * Look up what listing a historical slug belonged to.
 * Returns the listingId if found, null otherwise.
 */
export async function resolveOldSlug(slug: string): Promise<string | null> {
  try {
    const q = query(
      collection(db, SLUG_HISTORY_COLLECTION),
      where('oldSlug', '==', slug),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data().listingId ?? null;
  } catch {
    return null;
  }
}

// ─── Main orchestration ────────────────────────────────────────────

export class SlugService {
  /**
   * Generate a unique slug for a listing, handling collisions.
   *
   * Strategy:
   *  1. Try baseSlug
   *  2. Try baseSlug-2 … baseSlug-10
   *  3. Fallback: baseSlug-{carNumericId}
   */
  static async generateUniqueSlug(
    fields: { title?: string; make?: string; model?: string; year?: number },
    carNumericId: number,
    excludeListingId?: string,
  ): Promise<string> {
    const baseSlug = buildListingSlug(fields);

    for (let i = 0; i < 10; i++) {
      const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
      const taken = await slugExists(candidate, excludeListingId);
      if (!taken) return candidate;
    }

    // Guaranteed unique fallback
    return `${baseSlug}-${carNumericId}`;
  }

  /**
   * Assign (or update) a slug for a listing.
   *
   * - Generates a unique slug
   * - Claims it in the slug index
   * - Records history if slug changed
   * - Returns { slug, canonicalUrl, changed }
   */
  static async assignSlug(
    listingId: string,
    sellerNumericId: number,
    carNumericId: number,
    fields: { title?: string; make?: string; model?: string; year?: number },
    actorId = 'system',
    currentSlug?: string,
  ): Promise<{ slug: string; canonicalUrl: string; changed: boolean }> {
    const uniqueSlug = await this.generateUniqueSlug(fields, carNumericId, listingId);

    if (currentSlug === uniqueSlug) {
      return {
        slug: uniqueSlug,
        canonicalUrl: buildCanonicalPath(sellerNumericId, carNumericId, uniqueSlug),
        changed: false,
      };
    }

    // Claim new slug
    await claimSlug(uniqueSlug, listingId);

    // Release old slug & record history
    if (currentSlug) {
      await releaseSlug(currentSlug);
      await recordSlugChange({
        listingId,
        oldSlug: currentSlug,
        newSlug: uniqueSlug,
        changedBy: actorId,
      });
    }

    const canonicalUrl = buildCanonicalPath(sellerNumericId, carNumericId, uniqueSlug);

    serviceLogger.info('Slug assigned', {
      listingId,
      slug: uniqueSlug,
      canonicalUrl,
      changed: true,
    });

    return { slug: uniqueSlug, canonicalUrl, changed: true };
  }
}

export default SlugService;
