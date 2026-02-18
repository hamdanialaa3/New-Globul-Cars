/**
 * Short Links Service Tests
 * Tests for short link generation, resolution, and analytics
 *
 * @file short-links.service.test.ts
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
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

import { ShortLinksService } from '../short-links.service';
import { getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore';

describe('ShortLinksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createShortLink', () => {
    it('should create a short link for a listing', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await ShortLinksService.createShortLink(
        'listing',
        540,
        '/car/540/bmw-x5-2020',
        'user-1'
      );

      expect(result).toHaveProperty('shortCode');
      expect(result.shortCode.length).toBeLessThanOrEqual(7);
      expect(result.url).toMatch(/^\/s\//);
      expect(setDoc).toHaveBeenCalled();
    });

    it('should set expiry date if expiresInDays is provided', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });
      (setDoc as Mock).mockResolvedValue(undefined);

      const beforeCall = new Date();
      await ShortLinksService.createShortLink(
        'listing',
        540,
        '/car/540/bmw-x5-2020',
        'user-1',
        30 // expires in 30 days
      );
      const afterCall = new Date();

      const callArgs = (setDoc as Mock).mock.calls[0];
      const record = callArgs[1];

      expect(record.expiresAt).toBeDefined();
      const expiryDate = new Date(record.expiresAt);
      const expectedDate = new Date(beforeCall.getTime() + 30 * 24 * 60 * 60 * 1000);
      const diff = Math.abs(expiryDate.getTime() - expectedDate.getTime());
      expect(diff).toBeLessThan(5000); // within 5 seconds
    });

    it('should retry on collision', async () => {
      (getDoc as Mock)
        .mockResolvedValueOnce({ exists: () => true }) // collision
        .mockResolvedValueOnce({ exists: () => false }); // next try is free
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await ShortLinksService.createShortLink(
        'listing',
        999,
        '/car/999/test',
        'user-1'
      );

      expect(result.shortCode).toBeDefined();
      expect(setDoc).toHaveBeenCalledTimes(1); // should succeed on first retry
    });
  });

  describe('resolveShortCode', () => {
    it('should resolve a valid short code', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          targetUrl: '/car/540/bmw-x5-2020',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day ahead
        }),
      });

      const url = await ShortLinksService.resolveShortCode('abc123');

      expect(url).toBe('/car/540/bmw-x5-2020');
    });

    it('should return null for non-existent code', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });

      const url = await ShortLinksService.resolveShortCode('invalid');

      expect(url).toBeNull();
    });

    it('should return null for expired code', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          targetUrl: '/car/540/bmw-x5-2020',
          expiresAt: new Date(Date.now() - 1000).toISOString(), // expired 1 second ago
        }),
      });

      const url = await ShortLinksService.resolveShortCode('expired123');

      expect(url).toBeNull();
    });
  });

  describe('incrementClickCount', () => {
    it('should increment click count', async () => {
      (getDoc as Mock).mockResolvedValue({
        data: () => ({ clickCount: 5 }),
        id: 'abc123',
      });
      (updateDoc as Mock).mockResolvedValue(undefined);

      await ShortLinksService.incrementClickCount('abc123');

      expect(updateDoc).toHaveBeenCalled();
      const callArgs = (updateDoc as Mock).mock.calls[0];
      expect(callArgs[1].clickCount).toBeGreaterThan(5); // Ensure incremented
      expect(callArgs[1].lastClickAt).toBeDefined();
    });

    it('should handle errors gracefully (non-blocking)', async () => {
      (getDoc as Mock).mockRejectedValue(new Error('DB error'));
      (updateDoc as Mock).mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(ShortLinksService.incrementClickCount('abc123')).resolves.toBeUndefined();
    });
  });

  describe('getShortLinkAnalytics', () => {
    it('should return analytics for a short link', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          targetUrl: '/car/540/test',
          clickCount: 42,
          createdAt: '2026-02-18T10:00:00Z',
          lastClickAt: '2026-02-18T10:05:00Z',
        }),
      });

      const analytics = await ShortLinksService.getShortLinkAnalytics('abc123');

      expect(analytics).toEqual({
        shortCode: 'abc123',
        targetUrl: '/car/540/test',
        clickCount: 42,
        createdAt: '2026-02-18T10:00:00Z',
        lastClickAt: '2026-02-18T10:05:00Z',
      });
    });

    it('should return null if code not found', async () => {
      (getDoc as Mock).mockResolvedValue({ exists: () => false });

      const analytics = await ShortLinksService.getShortLinkAnalytics('invalid');

      expect(analytics).toBeNull();
    });
  });

  describe('getUserShortLinks', () => {
    it('should return all short links for a user', async () => {
      (getDocs as Mock).mockResolvedValue({
        docs: [
          { data: () => ({ shortCode: 'abc123', targetUrl: '/car/540/test' }) },
          { data: () => ({ shortCode: 'def456', targetUrl: '/user/1/john' }) },
        ],
      });

      const links = await ShortLinksService.getUserShortLinks('user-1');

      expect(links.length).toBe(2);
      expect(links[0].shortCode).toBe('abc123');
      expect(links[1].shortCode).toBe('def456');
    });
  });
});
