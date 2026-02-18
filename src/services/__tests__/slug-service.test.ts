/**
 * Slug Service Tests
 * Tests for SEO-friendly slug generation, transliteration, and canonical URLs
 *
 * @file slug-service.test.ts
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

// Mock firebase/firestore before imports
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

vi.mock('../../firebase/firebase-config', () => ({
  db: {},
}));

vi.mock('../logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { slugify, buildListingSlug, buildCanonicalPath, resolveOldSlug, SlugService } from '../slug.service';
import { getDoc, getDocs, setDoc } from 'firebase/firestore';

describe('SlugService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- slugify --

  describe('slugify', () => {
    it('should convert English text to a URL-safe slug', () => {
      expect(slugify('BMW 3 Series 2017')).toBe('bmw-3-series-2017');
    });

    it('should transliterate Bulgarian Cyrillic text', () => {
      expect(slugify('Мерцедес Бенц')).toBe('mertsedes-bents');
    });

    it('should transliterate Arabic text', () => {
      expect(slugify('سيارة جديدة')).toBe('syara-jdyda');
    });

    it('should collapse multiple dashes and trim edges', () => {
      expect(slugify('--hello---world--')).toBe('hello-world');
    });

    it('should truncate to maxLen', () => {
      const long = 'a'.repeat(200);
      expect(slugify(long, 80).length).toBeLessThanOrEqual(80);
    });

    it('should return fallback for empty input', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle mixed BG+EN text', () => {
      const result = slugify('BMW X5 - Продава се');
      expect(result).toBe('bmw-x5-prodava-se');
    });

    it('should handle special characters and numbers', () => {
      expect(slugify('Price: 15,000 EUR!')).toBe('price-15-000-eur');
    });
  });

  // -- buildListingSlug --

  describe('buildListingSlug', () => {
    it('should build slug from title when available', () => {
      const result = buildListingSlug({ title: 'Great BMW X5 Sport', make: 'BMW', model: 'X5', year: 2020 });
      expect(result).toBe('great-bmw-x5-sport');
    });

    it('should build slug from make+model+year when no title', () => {
      const result = buildListingSlug({ make: 'Toyota', model: 'Corolla', year: 2019 });
      expect(result).toBe('toyota-corolla-2019');
    });

    it('should handle missing fields gracefully', () => {
      const result = buildListingSlug({});
      expect(result).toBe('listing');
    });

    it('should handle Cyrillic make/model', () => {
      const result = buildListingSlug({ make: 'Мерцедес', model: 'Е класа', year: 2021 });
      expect(result).toContain('mertsedes');
    });
  });

  // -- buildCanonicalPath --

  describe('buildCanonicalPath', () => {
    it('should build correct canonical path', () => {
      const path = buildCanonicalPath(1, 5, 'bmw-x5-2020');
      expect(path).toBe('/car/1/5/bmw-x5-2020');
    });

    it('should handle large numeric IDs', () => {
      const path = buildCanonicalPath(999, 12345, 'toyota-corolla');
      expect(path).toBe('/car/999/12345/toyota-corolla');
    });
  });

  // -- SlugService.generateUniqueSlug --

  describe('SlugService.generateUniqueSlug', () => {
    it('should return base slug when no collision', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });

      const slug = await SlugService.generateUniqueSlug(
        { make: 'BMW', model: 'X5', year: 2020 },
        1
      );
      expect(slug).toBe('bmw-x5-2020');
    });

    it('should add suffix on collision', async () => {
      (getDoc as Mock)
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ listingId: 'other' }) }) // base taken
        .mockResolvedValueOnce({ exists: () => false }); // base-2 free

      const slug = await SlugService.generateUniqueSlug(
        { make: 'BMW', model: 'X5', year: 2020 },
        1
      );
      expect(slug).toBe('bmw-x5-2020-2');
    });

    it('should fallback to carNumericId after 10 collisions', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ listingId: 'other' }),
      });

      const slug = await SlugService.generateUniqueSlug(
        { title: 'Popular Car' },
        42
      );
      expect(slug).toBe('popular-car-42');
    });
  });

  // -- SlugService.assignSlug --

  describe('SlugService.assignSlug', () => {
    it('should assign new slug and return canonicalUrl', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await SlugService.assignSlug(
        'listing-abc',
        1,
        5,
        { make: 'Toyota', model: 'Camry', year: 2022 },
        'user-1'
      );

      expect(result.slug).toBe('toyota-camry-2022');
      expect(result.canonicalUrl).toBe('/car/1/5/toyota-camry-2022');
      expect(result.changed).toBe(true);
    });

    it('should return changed=false if slug is the same', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });

      const result = await SlugService.assignSlug(
        'listing-abc',
        1,
        5,
        { make: 'Toyota', model: 'Camry', year: 2022 },
        'user-1',
        'toyota-camry-2022' // current slug is the same
      );

      expect(result.changed).toBe(false);
      expect(result.slug).toBe('toyota-camry-2022');
    });
  });

  // -- resolveOldSlug --

  describe('resolveOldSlug', () => {
    it('should return listingId for known old slug', async () => {
      (getDocs as Mock).mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ listingId: 'listing-xyz' }) }],
      });

      const listingId = await resolveOldSlug('old-slug-name');
      expect(listingId).toBe('listing-xyz');
    });

    it('should return null for unknown slug', async () => {
      (getDocs as Mock).mockResolvedValue({ empty: true, docs: [] });

      const result = await resolveOldSlug('nonexistent-slug');
      expect(result).toBeNull();
    });
  });
});
