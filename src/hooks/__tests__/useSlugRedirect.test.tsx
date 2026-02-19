/**
 * @vitest-environment jsdom
 */
/**
 * useSlugRedirect Hook Tests
 * Tests for listing slug redirect logic
 *
 * @file useSlugRedirect.test.tsx
 * @since 2026-02-19
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
}));

// Mock listings service
vi.mock('../../services/listings.service', () => ({
  getListingById: vi.fn(),
  getListingByNumericId: vi.fn(),
}));

// Mock logger
vi.mock('../../services/logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { useSlugRedirect } from '../../hooks/useSlugRedirect';
import { useParams } from 'react-router-dom';
import { getListingById, getListingByNumericId } from '../../services/listings.service';

describe('useSlugRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect legacy /car/:sellerId/:listingId to canonical URL', async () => {
    (useParams as Mock).mockReturnValue({
      sellerId: '100',
      listingId: 'uuid-123',
      listingNumericId: undefined,
      slug: undefined,
    });
    (getListingById as Mock).mockResolvedValue({
      id: 'uuid-123',
      listingNumericId: 540,
      slug: 'bmw-x5-2020',
    });

    renderHook(() => useSlugRedirect());

    // Wait for async effect
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/car/540/bmw-x5-2020', { replace: true });
    });
  });

  it('should navigate to /not-found when legacy listing not found', async () => {
    (useParams as Mock).mockReturnValue({
      sellerId: '100',
      listingId: 'missing-uuid',
      listingNumericId: undefined,
    });
    (getListingById as Mock).mockResolvedValue(null);

    renderHook(() => useSlugRedirect());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-found');
    });
  });

  it('should redirect when slug mismatch on /car/:numericId/:slug', async () => {
    (useParams as Mock).mockReturnValue({
      sellerId: undefined,
      listingId: undefined,
      listingNumericId: '540',
      slug: 'old-slug',
    });
    (getListingByNumericId as Mock).mockResolvedValue({
      id: 'uuid-123',
      listingNumericId: 540,
      slug: 'bmw-x5-2020', // Current slug differs from URL
    });

    renderHook(() => useSlugRedirect());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/car/540/bmw-x5-2020', { replace: true });
    });
  });

  it('should NOT redirect when slug matches correctly', async () => {
    (useParams as Mock).mockReturnValue({
      sellerId: undefined,
      listingId: undefined,
      listingNumericId: '540',
      slug: 'bmw-x5-2020',
    });
    (getListingByNumericId as Mock).mockResolvedValue({
      id: 'uuid-123',
      listingNumericId: 540,
      slug: 'bmw-x5-2020', // Same as URL
    });

    renderHook(() => useSlugRedirect());

    // Give time for async
    await new Promise(r => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to /not-found when numericId listing not found', async () => {
    (useParams as Mock).mockReturnValue({
      sellerId: undefined,
      listingId: undefined,
      listingNumericId: '999',
      slug: 'some-slug',
    });
    (getListingByNumericId as Mock).mockResolvedValue(null);

    renderHook(() => useSlugRedirect());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-found');
    });
  });

  it('should not break page on error (continues rendering)', async () => {
    (useParams as Mock).mockReturnValue({
      sellerId: '100',
      listingId: 'uuid-err',
    });
    (getListingById as Mock).mockRejectedValue(new Error('DB error'));

    // Should not throw
    expect(() => renderHook(() => useSlugRedirect())).not.toThrow();
  });

  it('should do nothing when no params provided', async () => {
    (useParams as Mock).mockReturnValue({});

    renderHook(() => useSlugRedirect());

    await new Promise(r => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getListingById).not.toHaveBeenCalled();
    expect(getListingByNumericId).not.toHaveBeenCalled();
  });
});
