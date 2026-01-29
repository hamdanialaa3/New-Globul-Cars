/**
 * Profile Routing Constitution Tests
 * 🏛️ Unit tests to enforce STRICT routing rules from CONSTITUTION.md
 * 
 * CRITICAL RULES TO TEST:
 * 1. User 90 accessing /profile/90 → ALLOWED (own profile)
 * 2. User 90 accessing /profile/80 → REDIRECT to /profile/view/80 (other user)
 * 3. User 90 accessing /profile/view/90 → REDIRECT to /profile/90 (owner format)
 * 4. User 80 accessing /profile/view/80 → REDIRECT to /profile/80 (owner format)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../../../contexts/AuthProvider');
jest.mock('../../../../contexts/LanguageContext');
jest.mock('../../../../contexts/ProfileTypeContext');
jest.mock('../../../../hooks/useTranslation');
jest.mock('../../../../services/logger-service');
jest.mock('./hooks/useProfile');

import { useAuth } from '../../../../contexts/AuthProvider';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useProfile } from './hooks/useProfile';
import ProfilePageWrapper from './ProfilePageWrapper';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/profile/90',
    search: '',
    hash: '',
    state: null
  }),
  useParams: () => ({ userId: '90' })
}));

describe('🏛️ Constitution Profile Routing Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'firebase-uid-90', email: 'user90@test.com' }
    });
    
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en'
    });
    
    (useProfileType as jest.Mock).mockReturnValue({
      profileType: 'private',
      theme: { primary: '#007bff', secondary: '#6c757d' }
    });
    
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key
    });
  });

  /**
   * TEST 1: User 90 accessing /profile/90 (Own Profile)
   * Expected: ALLOWED - No redirect
   */
  it('✅ RULE 1: User 90 can access own profile /profile/90', async () => {
    // Mock: User 90 viewing own profile
    (useProfile as jest.Mock).mockReturnValue({
      user: {
        uid: 'firebase-uid-90',
        numericId: 90,
        displayName: 'User 90',
        email: 'user90@test.com'
      },
      target: null,
      viewer: {
        uid: 'firebase-uid-90',
        numericId: 90
      },
      userCars: [],
      loading: false,
      error: null,
      isOwnProfile: true,
      setUser: jest.fn(),
      refresh: jest.fn()
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/profile/90']}>
        <ProfilePageWrapper />
      </MemoryRouter>
    );

    // Wait for component to stabilize
    await waitFor(() => {
      // Should NOT redirect (mockNavigate should NOT be called)
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  /**
   * TEST 2: User 90 accessing /profile/80 (Other User's Private Profile)
   * Expected: REDIRECT to /profile/view/80
   */
  it('❌ RULE 2: User 90 accessing /profile/80 → REDIRECT to /profile/view/80', async () => {
    // Mock: User 90 trying to view User 80's private profile
    (useProfile as jest.Mock).mockReturnValue({
      user: null,
      target: {
        uid: 'firebase-uid-80',
        numericId: 80,
        displayName: 'User 80',
        email: 'user80@test.com'
      },
      viewer: {
        uid: 'firebase-uid-90',
        numericId: 90
      },
      userCars: [],
      loading: false,
      error: null,
      isOwnProfile: false,
      setUser: jest.fn(),
      refresh: jest.fn()
    });

    // Override location for this test
    const useLocationMock = jest.requireMock('react-router-dom').useLocation;
    useLocationMock.mockReturnValue({
      pathname: '/profile/80',
      search: '',
      hash: '',
      state: null
    });

    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ userId: '80' });

    render(
      <MemoryRouter initialEntries={['/profile/80']}>
        <ProfilePageWrapper />
      </MemoryRouter>
    );

    // Wait for redirect
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/profile/view/80',
        { replace: true }
      );
    }, { timeout: 3000 });
  });

  /**
   * TEST 3: User 90 accessing /profile/view/90 (Own Profile Public View)
   * Expected: REDIRECT to /profile/90 (Private Format)
   */
  it('🔄 RULE 3: User 90 accessing /profile/view/90 → REDIRECT to /profile/90', async () => {
    // Mock: User 90 viewing own profile in public view format
    (useProfile as jest.Mock).mockReturnValue({
      user: {
        uid: 'firebase-uid-90',
        numericId: 90,
        displayName: 'User 90',
        email: 'user90@test.com'
      },
      target: null,
      viewer: {
        uid: 'firebase-uid-90',
        numericId: 90
      },
      userCars: [],
      loading: false,
      error: null,
      isOwnProfile: true,
      setUser: jest.fn(),
      refresh: jest.fn()
    });

    // Override location for this test
    const useLocationMock = jest.requireMock('react-router-dom').useLocation;
    useLocationMock.mockReturnValue({
      pathname: '/profile/view/90',
      search: '',
      hash: '',
      state: null
    });

    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ userId: '90' });

    render(
      <MemoryRouter initialEntries={['/profile/view/90']}>
        <ProfilePageWrapper />
      </MemoryRouter>
    );

    // Wait for redirect
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/profile/90',
        { replace: true }
      );
    }, { timeout: 3000 });
  });

  /**
   * TEST 4: User 80 accessing /profile/view/80 (Own Profile Public View)
   * Expected: REDIRECT to /profile/80 (Private Format)
   */
  it('🔄 RULE 4: User 80 accessing /profile/view/80 → REDIRECT to /profile/80', async () => {
    // Mock: User 80 viewing own profile in public view format
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'firebase-uid-80', email: 'user80@test.com' }
    });

    (useProfile as jest.Mock).mockReturnValue({
      user: {
        uid: 'firebase-uid-80',
        numericId: 80,
        displayName: 'User 80',
        email: 'user80@test.com'
      },
      target: null,
      viewer: {
        uid: 'firebase-uid-80',
        numericId: 80
      },
      userCars: [],
      loading: false,
      error: null,
      isOwnProfile: true,
      setUser: jest.fn(),
      refresh: jest.fn()
    });

    // Override location for this test
    const useLocationMock = jest.requireMock('react-router-dom').useLocation;
    useLocationMock.mockReturnValue({
      pathname: '/profile/view/80',
      search: '',
      hash: '',
      state: null
    });

    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ userId: '80' });

    render(
      <MemoryRouter initialEntries={['/profile/view/80']}>
        <ProfilePageWrapper />
      </MemoryRouter>
    );

    // Wait for redirect
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/profile/80',
        { replace: true }
      );
    }, { timeout: 3000 });
  });

  /**
   * TEST 5: Loading State - Should show validation message
   */
  it('⏳ Loading Guard: Shows validation message when data not ready', async () => {
    // Mock: Data not ready
    (useProfile as jest.Mock).mockReturnValue({
      user: null,
      target: null,
      viewer: null, // No viewer data yet
      userCars: [],
      loading: true,
      error: null,
      isOwnProfile: false,
      setUser: jest.fn(),
      refresh: jest.fn()
    });

    render(
      <MemoryRouter initialEntries={['/profile/90']}>
        <ProfilePageWrapper />
      </MemoryRouter>
    );

    // Should show validation message
    await waitFor(() => {
      const validationText = screen.queryByText(/Validating access permissions|Проверка на разрешенията за достъп/i);
      expect(validationText).toBeInTheDocument();
    });
  });

  /**
   * TEST 6: Firebase UID in URL - Should be rejected
   */
  it('❌ Firebase UID in URL → Should reject and redirect', async () => {
    // Mock: Firebase UID detected in URL
    const useParamsMock = jest.requireMock('react-router-dom').useParams;
    useParamsMock.mockReturnValue({ userId: 'ABC123def456' }); // Firebase UID format

    const useLocationMock = jest.requireMock('react-router-dom').useLocation;
    useLocationMock.mockReturnValue({
      pathname: '/profile/ABC123def456',
      search: '',
      hash: '',
      state: null
    });

    (useProfile as jest.Mock).mockReturnValue({
      user: null,
      target: null,
      viewer: {
        uid: 'firebase-uid-90',
        numericId: 90
      },
      userCars: [],
      loading: false,
      error: null,
      isOwnProfile: false,
      setUser: jest.fn(),
      refresh: jest.fn()
    });

    render(
      <MemoryRouter initialEntries={['/profile/ABC123def456']}>
        <ProfilePageWrapper />
      </MemoryRouter>
    );

    // Should redirect to /profile (invalid ID detected)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/profile',
        { replace: true }
      );
    }, { timeout: 3000 });
  });
});

