/**
 * @vitest-environment jsdom
 */
/**
 * useUserSlugRedirect & useUserSettingsGuard Hook Tests
 * Tests for user profile slug redirect and settings access control
 *
 * @file useUserSlugRedirect.test.tsx
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

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock users service
vi.mock('../../services/users.service', () => ({
  getUserById: vi.fn(),
  getUserByNumericId: vi.fn(),
  canAccessUserSettings: vi.fn(),
}));

// Mock logger
vi.mock('../../services/logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { useUserSlugRedirect, useUserSettingsGuard } from '../../hooks/useUserSlugRedirect';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserByNumericId, canAccessUserSettings } from '../../services/users.service';

describe('useUserSlugRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ currentUser: null });
  });

  it('should redirect /profile/:numericId to /u/:numericId/:slug', async () => {
    (useParams as Mock).mockReturnValue({
      userNumericId: '456',
      userSlug: undefined,
    });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'uid-1',
      userNumericId: 456,
      slug: 'john-doe',
    });

    renderHook(() => useUserSlugRedirect());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/u/456/john-doe', { replace: true });
    });
  });

  it('should redirect when slug mismatch', async () => {
    (useParams as Mock).mockReturnValue({
      userNumericId: '456',
      userSlug: 'old-slug',
    });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'uid-1',
      userNumericId: 456,
      slug: 'john-doe', // Current slug differs
    });

    renderHook(() => useUserSlugRedirect());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/u/456/john-doe', { replace: true });
    });
  });

  it('should NOT redirect when slug matches', async () => {
    (useParams as Mock).mockReturnValue({
      userNumericId: '456',
      userSlug: 'john-doe',
    });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'uid-1',
      userNumericId: 456,
      slug: 'john-doe',
    });

    renderHook(() => useUserSlugRedirect());

    await new Promise(r => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to /not-found when user not found', async () => {
    (useParams as Mock).mockReturnValue({
      userNumericId: '9999',
      userSlug: undefined,
    });
    (getUserByNumericId as Mock).mockResolvedValue(null);

    renderHook(() => useUserSlugRedirect());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-found');
    });
  });

  it('should not redirect when user has no slug', async () => {
    (useParams as Mock).mockReturnValue({
      userNumericId: '456',
      userSlug: undefined,
    });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'uid-1',
      userNumericId: 456,
      slug: undefined, // No slug for this user
    });

    renderHook(() => useUserSlugRedirect());

    await new Promise(r => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not break on error', async () => {
    (useParams as Mock).mockReturnValue({
      userNumericId: '1',
      userSlug: undefined,
    });
    (getUserByNumericId as Mock).mockRejectedValue(new Error('DB error'));

    expect(() => renderHook(() => useUserSlugRedirect())).not.toThrow();
  });
});

describe('useUserSettingsGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /login when not authenticated', async () => {
    (useAuth as Mock).mockReturnValue({ currentUser: null });
    (useParams as Mock).mockReturnValue({ userNumericId: '456' });

    renderHook(() => useUserSettingsGuard());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.objectContaining({
        state: expect.objectContaining({ returnTo: expect.any(String) }),
      }));
    });
  });

  it('should allow access for profile owner', async () => {
    (useAuth as Mock).mockReturnValue({ currentUser: { uid: 'owner-uid' } });
    (useParams as Mock).mockReturnValue({ userNumericId: '456' });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'owner-uid',
      userNumericId: 456,
    });
    (canAccessUserSettings as Mock).mockResolvedValue(true);

    renderHook(() => useUserSettingsGuard());

    await new Promise(r => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled(); // No redirect = access granted
  });

  it('should allow access for admin', async () => {
    (useAuth as Mock).mockReturnValue({ currentUser: { uid: 'admin-uid' } });
    (useParams as Mock).mockReturnValue({ userNumericId: '456' });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'target-user',
      userNumericId: 456,
    });
    (canAccessUserSettings as Mock).mockResolvedValue(true); // Admin has access

    renderHook(() => useUserSettingsGuard());

    await new Promise(r => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should redirect to /unauthorized for non-owner non-admin', async () => {
    (useAuth as Mock).mockReturnValue({ currentUser: { uid: 'random-user' } });
    (useParams as Mock).mockReturnValue({ userNumericId: '456' });
    (getUserByNumericId as Mock).mockResolvedValue({
      userId: 'profile-owner',
      userNumericId: 456,
    });
    (canAccessUserSettings as Mock).mockResolvedValue(false);

    renderHook(() => useUserSettingsGuard());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });
  });

  it('should redirect to /not-found when target user not found', async () => {
    (useAuth as Mock).mockReturnValue({ currentUser: { uid: 'some-uid' } });
    (useParams as Mock).mockReturnValue({ userNumericId: '99999' });
    (getUserByNumericId as Mock).mockResolvedValue(null);

    renderHook(() => useUserSettingsGuard());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-found');
    });
  });

  it('should redirect to /error on exception', async () => {
    (useAuth as Mock).mockReturnValue({ currentUser: { uid: 'some-uid' } });
    (useParams as Mock).mockReturnValue({ userNumericId: '1' });
    (getUserByNumericId as Mock).mockRejectedValue(new Error('DB crash'));

    renderHook(() => useUserSettingsGuard());

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
    });
  });
});
