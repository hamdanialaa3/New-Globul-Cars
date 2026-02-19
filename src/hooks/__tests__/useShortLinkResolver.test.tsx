/**
 * @vitest-environment jsdom
 */
/**
 * useShortLinkResolver Hook Tests
 * Tests for short link resolution and redirect
 *
 * @file useShortLinkResolver.test.tsx
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

// Mock short links service
vi.mock('@/services/short-links.service', () => ({
  ShortLinksService: {
    resolveShortCode: vi.fn(),
    incrementClickCount: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/services/logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { useShortLinkResolver } from '../../hooks/useShortLinkResolver';
import { useParams } from 'react-router-dom';
import { ShortLinksService } from '@/services/short-links.service';

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, href: '' },
    writable: true,
    configurable: true,
  });
});

describe('useShortLinkResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ShortLinksService.incrementClickCount as Mock).mockResolvedValue(undefined);
  });

  it('should resolve short code and redirect via window.location', async () => {
    (useParams as Mock).mockReturnValue({ shortCode: 'abc123' });
    (ShortLinksService.resolveShortCode as Mock).mockResolvedValue('/car/540/bmw-x5-2020');

    renderHook(() => useShortLinkResolver());

    await vi.waitFor(() => {
      expect(ShortLinksService.resolveShortCode).toHaveBeenCalledWith('abc123');
      expect(window.location.href).toBe('/car/540/bmw-x5-2020');
    });
  });

  it('should increment click count after resolving', async () => {
    (useParams as Mock).mockReturnValue({ shortCode: 'click1' });
    (ShortLinksService.resolveShortCode as Mock).mockResolvedValue('/u/456/john-doe');

    renderHook(() => useShortLinkResolver());

    await vi.waitFor(() => {
      expect(ShortLinksService.incrementClickCount).toHaveBeenCalledWith('click1');
    });
  });

  it('should navigate to /not-found when short code not found', async () => {
    (useParams as Mock).mockReturnValue({ shortCode: 'invalid' });
    (ShortLinksService.resolveShortCode as Mock).mockResolvedValue(null);

    renderHook(() => useShortLinkResolver());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-found');
    });
  });

  it('should navigate to /not-found when no shortCode param', async () => {
    (useParams as Mock).mockReturnValue({ shortCode: undefined });

    renderHook(() => useShortLinkResolver());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-found');
    });
  });

  it('should navigate to /error on resolver exception', async () => {
    (useParams as Mock).mockReturnValue({ shortCode: 'err-code' });
    (ShortLinksService.resolveShortCode as Mock).mockRejectedValue(new Error('Network fail'));

    renderHook(() => useShortLinkResolver());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
    });
  });

  it('should not fail if click count increment fails (non-blocking)', async () => {
    (useParams as Mock).mockReturnValue({ shortCode: 'count-fail' });
    (ShortLinksService.resolveShortCode as Mock).mockResolvedValue('/car/100');
    (ShortLinksService.incrementClickCount as Mock).mockRejectedValue(new Error('Count fail'));

    renderHook(() => useShortLinkResolver());

    await vi.waitFor(() => {
      expect(window.location.href).toBe('/car/100');
    });
    // No error thrown, redirect still works
  });
});
