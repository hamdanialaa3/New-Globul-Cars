import React from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
import { useAuth } from '../../../../contexts/AuthProvider';
import { AuthGuard } from '../../../../components/guards/AuthGuard';
import {
  UserCircle,
  Car,
  Megaphone,
  BarChart3,
  Shield,
  MessageCircle,
  Users,
  RefreshCw,
  MapPin,
  Mail,
  Phone as PhoneIcon,
  Crown,
  Heart
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabNavLink, SyncButton, FollowButton } from './TabNavigation.styles';
import { CoverImageUploader, BusinessBackground, SimpleProfileAvatar, ProfileImageUploader, BusinessGreenHeader } from '../../../../components/Profile';
import { ProfileTypeSwitcher } from '../components/ProfileTypeSwitcher'; // Added Import
import { googleProfileSyncService } from '../../../../services/google/google-profile-sync.service';
import { followService } from '../../../../services/social/follow.service';
import { logger } from '../../../../services/logger-service';
import { profileStatsService } from '../../../../services/profile/profile-stats.service';
import { ThemeProvider } from 'styled-components';
import { PROFILE_THEMES } from '../../../../config/profile-themes';
// 🔴 CRITICAL: Block User Button integration
import BlockUserButton from '../../../../components/messaging/BlockUserButton';
// 🔢 CRITICAL: Numeric ID system
import { ensureUserNumericId } from '../../../../services/numeric-id-assignment.service';

/**
 * Profile Page Wrapper
 * 
 * Provides the layout structure for all profile sub-pages:
 * - Tab Navigation
 * - Cover Image (on main page only)
 * - Sidebar with user info and actions
 * - Content area (<Outlet />) for nested routes
 */
const ProfilePageWrapper: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ userId?: string }>();
  const { profileType: contextProfileType, theme: contextTheme } = useProfileType();
  const { currentUser } = useAuth();

  // 🔒 Get target user ID from URL route parameter
  // Handle both /profile/{userId} and /profile/view/{userId}
  const RESERVED_ROUTES = ['settings', 'my-ads', 'campaigns', 'analytics', 'consultations', 'favorites', 'view'];
  const targetUserId = React.useMemo(() => {
    // Check if path is /profile/view/{userId}
    const viewMatch = location.pathname.match(/^\/profile\/view\/(\d+)/);
    if (viewMatch) {
      const numericId = viewMatch[1];
      // ✅ Validate it's a numeric ID (only digits)
      if (/^\d+$/.test(numericId)) {
        return numericId;
      }
      // ❌ Invalid: Firebase UID or other non-numeric ID detected
      logger.error('🔒 REJECTED: Non-numeric ID in /profile/view/ path', { 
        path: location.pathname, 
        invalidId: numericId 
      });
      return undefined; // Will trigger redirect to /profile
    }
    
    // Check /profile/{userId} format
    const profileMatch = location.pathname.match(/^\/profile\/([^/]+)/);
    if (profileMatch) {
      const userId = profileMatch[1];
      // Skip reserved routes
      if (RESERVED_ROUTES.includes(userId)) {
        return undefined;
      }
      // ✅ Validate it's a numeric ID (only digits)
      if (/^\d+$/.test(userId)) {
        return userId;
      }
      // ❌ Invalid: Firebase UID detected in URL!
      logger.error('🔒 REJECTED: Non-numeric ID (Firebase UID?) in profile URL', { 
        path: location.pathname, 
        invalidId: userId,
        reason: 'Only numeric IDs are allowed in profile URLs'
      });
      // Redirect to /profile (will then redirect to correct numeric URL)
      navigate('/profile', { replace: true });
      return undefined;
    }
    
    return undefined;
  }, [location.pathname, navigate]);

  // Check if user is trying to access their own profile without being logged in
  const isAccessingOwnProfile = !targetUserId;

  // Extract numeric ID from targetUserId for useProfile (it handles both numeric ID and Firebase UID)
  const profileTargetId = React.useMemo(() => {
    if (!targetUserId) return undefined;
    // If it's already a numeric ID (from /profile/view/{numericId}), use it directly
    // If it's from /profile/{numericId}, useProfile will handle it
    return targetUserId;
  }, [targetUserId]);

  const {
    user,
    target,
    viewer,
    userCars,
    loading,
    error,
    isOwnProfile,
    setUser,
    refresh
  } = useProfile(profileTargetId);

  const activeProfile = target ?? user;
  
  // 🔢 Get current user's numeric ID from viewer (most reliable source)
  const currentUserNumericId = viewer?.numericId;

  // 🔒 CRITICAL: Check if accessing /profile/{numericId} for other user - redirect to /profile/view/{numericId}
  // 🔒 CRITICAL: Constitution Enforced Routing Rules
  // ⚡ LOADING GUARD: Track if validation data is ready
  const [isValidationReady, setIsValidationReady] = React.useState(false);
  
  React.useEffect(() => {
    // ⚡ STRICT VALIDATION: Must have all required data before routing logic
    if (!currentUser || !targetUserId) {
      logger.debug('Routing check skipped - missing required data', {
        hasCurrentUser: !!currentUser,
        hasTargetUserId: !!targetUserId,
      });
      setIsValidationReady(false);
      return;
    }

    // 🚨 GUEST USER BYPASS: Guest users (isAnonymous) don't have numericId, allow access
    if (currentUser.isAnonymous) {
      logger.info('✅ Guest user detected - allowing profile access without numericId validation', {
        uid: currentUser.uid,
        targetUserId
      });
      setIsValidationReady(true);
      return;
    }

    // ⚡ For regular users: Require numeric IDs
    if (!viewer?.numericId || !activeProfile?.numericId) {
      logger.debug('Routing check skipped - missing numeric IDs', {
        hasViewerNumericId: !!viewer?.numericId,
        hasActiveProfileNumericId: !!activeProfile?.numericId
      });
      setIsValidationReady(false);
      return;
    }

    // ✅ All validation data is ready
    setIsValidationReady(true);

    // ⚡ Convert to numbers for accurate comparison
    const viewerNumericId = Number(viewer.numericId);
    const targetNumericId = Number(activeProfile.numericId);

    // ⚡ Validate numeric IDs
    if (isNaN(viewerNumericId) || isNaN(targetNumericId)) {
      logger.error('🔒 INVALID NUMERIC IDs - Cannot proceed with routing', {
        viewerNumericId,
        targetNumericId,
        targetUserId
      });
      return;
    }

    // ⚡ Check if this is NOT own profile
    const isOtherUserProfile = viewerNumericId !== targetNumericId;

    logger.debug('🔒 Profile routing check', {
      path: location.pathname,
      viewerNumericId,
      targetNumericId,
      isOtherUserProfile,
      targetUserId
    });

    // 🏛️ CONSTITUTION ENFORCEMENT - STRICT RULES
    // ========================================
    // RULE 1: Same user (Owner) -> /profile/{id} ONLY
    // RULE 2: Different user (Visitor) -> /profile/view/{id} ONLY
    // ========================================

    if (viewerNumericId === targetNumericId) {
      // ✅ SAME USER - Must use private format: /profile/{id}
      if (location.pathname.startsWith(`/profile/view/${targetUserId}`)) {
        const redirectPath = location.pathname.replace(
          `/profile/view/${targetUserId}`,
          `/profile/${targetUserId}`
        );
        logger.warn('🏛️ CONSTITUTION ENFORCED: Owner must use private format', {
          from: location.pathname,
          to: redirectPath,
          numericId: viewerNumericId,
          rule: 'Owner can ONLY access /profile/{own_id}'
        });
        navigate(redirectPath, { replace: true });
        return;
      }
    } else {
      // ❌ DIFFERENT USER - Must use public view format: /profile/view/{id}
      if (location.pathname.startsWith(`/profile/${targetUserId}`) && 
          !location.pathname.startsWith(`/profile/view/${targetUserId}`)) {
        const redirectPath = location.pathname.replace(
          `/profile/${targetUserId}`,
          `/profile/view/${targetUserId}`
        );
        logger.error('🏛️ CONSTITUTION VIOLATION: Unauthorized private access blocked', {
          from: location.pathname,
          to: redirectPath,
          viewerNumericId,
          targetNumericId,
          rule: 'Non-owner CANNOT access /profile/{other_id}',
          violation: 'Attempted to access another user\'s private profile'
        });
        navigate(redirectPath, { replace: true });
        return;
      }
    }
  }, [currentUser, targetUserId, viewer, activeProfile, location.pathname, navigate, setIsValidationReady]);

  // ⚡ CRITICAL: Ensure current user has numeric ID
  React.useEffect(() => {
    const ensureNumericId = async () => {
      // 🚨 FIX: Skip numeric ID assignment for guest users (no Firestore write permissions)
      if (!currentUser?.uid || !isAccessingOwnProfile) return;
      if (currentUser.isAnonymous) {
        logger.warn('⚠️ Guest user detected - skipping numeric ID assignment (no write permissions)', { uid: currentUser.uid });
        return;
      }
      if (currentUserNumericId) return; // Already has numeric ID
      
      try {
        logger.info('🔢 Ensuring numeric ID for current user', { uid: currentUser.uid });
        const numericId = await ensureUserNumericId(currentUser.uid);
        if (numericId) {
          logger.info('✅ Numeric ID assigned/retrieved', { uid: currentUser.uid, numericId });
          // Refresh profile to get updated data
          refresh();
        }
      } catch (error) {
        logger.error('❌ Failed to ensure numeric ID', error as Error, { uid: currentUser.uid });
      }
    };
    ensureNumericId();
  }, [currentUser?.uid, currentUser?.isAnonymous, currentUserNumericId, isAccessingOwnProfile, refresh]);

  // ⚡ AUTO-REDIRECT: Redirect /profile to /profile/{numericId} for logged-in users
  React.useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if we're at /profile or /profile/ (base path)
    const isBasePath = currentPath === '/profile' || currentPath === '/profile/';
    
    if (isBasePath) {
      if (!currentUser) {
        // Not logged in, redirect to login
        logger.warn('🔒 Unauthorized: Redirecting to login', { from: currentPath });
        navigate('/login', { replace: true, state: { from: currentPath } });
        return;
      }
      
      // User is logged in, check for numeric ID
      if (currentUserNumericId) {
        // We have numeric ID from viewer, redirect immediately
        const expectedPath = `/profile/${currentUserNumericId}`;
        logger.info('⚡ Auto-redirecting to numeric ID profile', {
          from: currentPath,
          to: expectedPath,
          numericId: currentUserNumericId
        });
        navigate(expectedPath, { replace: true });
      } else if (!loading) {
        // Finished loading but no numeric ID - this shouldn't happen
        // but as a fallback, wait a bit and try again
        logger.warn('⚠️ User logged in but no numeric ID available after loading', {
          uid: currentUser.uid,
          loading
        });
      }
      // If still loading, just wait
    }
  }, [location.pathname, currentUser, currentUserNumericId, loading, navigate]);
  
  // 🔒 CRITICAL: Prevent rendering if user doesn't have numeric ID yet
  // This prevents showing /profile or invalid URLs
  React.useEffect(() => {
    const currentPath = location.pathname;
    const isBasePath = currentPath === '/profile' || currentPath === '/profile/';
    
    // If at base path, auto-redirect effect will handle it
    if (isBasePath) return;
    
    // If viewing own profile and no numeric ID available, redirect to base
    if (isOwnProfile && currentUser && !currentUserNumericId && !loading) {
      logger.warn('🔒 Own profile accessed without numeric ID - redirecting to base', {
        uid: currentUser.uid,
        currentPath
      });
      navigate('/profile', { replace: true });
    }
  }, [location.pathname, isOwnProfile, currentUser, currentUserNumericId, loading, navigate]);

  const basePath = React.useMemo(() => {
    // 🔒 CRITICAL: Always use numeric IDs for basePath
    if (isOwnProfile) {
      // Own profile: Use currentUserNumericId (from viewer) or activeProfile.numericId
      const numericId = currentUserNumericId || activeProfile?.numericId;
      if (numericId) {
        return `/profile/${numericId}`;
      }
      // Fallback: /profile (will trigger auto-redirect)
      return '/profile';
    }
    
    // Other user's profile: Must have numeric ID
    if (activeProfile?.numericId) {
      return `/profile/view/${activeProfile.numericId}`;
    }
    
    // ❌ CRITICAL: No numeric ID available - this shouldn't happen
    logger.error('🔴 basePath: No numeric ID available for profile', {
      uid: activeProfile?.uid,
      isOwnProfile
    });
    
    // Fallback to /profile (will trigger redirect or error)
    return '/profile';
  }, [activeProfile?.uid, activeProfile?.numericId, currentUserNumericId, isOwnProfile]);

  const [syncing, setSyncing] = React.useState(false);
  const [showTypeSwitcher, setShowTypeSwitcher] = React.useState(false); // Added State

  // ⚡ AUTO-UPDATE PROFILE STATS: Update stats when profile loads
  // ✅ CRITICAL FIX: Only update stats for own profile (to avoid permission errors)
  React.useEffect(() => {
    if (!activeProfile?.uid || !viewer?.uid) return;
    
    // ✅ FIX: Only update stats if viewing own profile
    // Other users' profiles will have permission denied errors
    const isOwnProfile = viewer.uid === activeProfile.uid;
    if (!isOwnProfile) {
      logger.debug('Skipping stats update for other user profile', { 
        viewerId: viewer.uid, 
        profileId: activeProfile.uid 
      });
      return;
    }

    let cancelled = false;

    // Update stats silently in the background
    profileStatsService.updateUserStats(activeProfile.uid)
      .then(() => {
        if (!cancelled) {
          logger.info('Profile stats updated', { userId: activeProfile.uid });
          // Optionally refresh user data to reflect updated stats
          refresh();
        }
      })
      .catch(error => {
        if (!cancelled) {
          // ✅ GRACEFUL: Don't log permission errors as errors (expected for other users)
          const errorMessage = (error as Error).message;
          if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
            logger.debug('Profile stats update permission denied (expected)', { 
              userId: activeProfile.uid 
            });
          } else {
            logger.error('Error updating profile stats', error as Error, { userId: activeProfile.uid });
          }
        }
      });

    return () => { cancelled = true; };
  }, [activeProfile?.uid, viewer?.uid, refresh]);

  // ⚡ FIX: Follow state MUST be before early return!
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);

  // Business mode check
  const isBusinessMode = activeProfile?.profileType === 'dealer' || activeProfile?.profileType === 'company';

  // 🎨 DYNAMIC THEME: Based on activeProfile.profileType (not logged-in user's type)
  // This ensures theme matches the profile being viewed
  const DYNAMIC_THEMES = {
    private: {
      primary: '#FF8F10',     // Orange
      secondary: '#FFDF00',
      accent: '#FF7900',
      gradient: 'linear-gradient(135deg, #FF8F10 0%, #FF7900 100%)'
    },
    dealer: {
      primary: '#16a34a',     // Green
      secondary: '#22c55e',
      accent: '#15803d',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
    },
    company: {
      primary: '#1d4ed8',     // Blue
      secondary: '#3b82f6',
      accent: '#1e40af',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)'
    }
  };
  
  const activeProfileType = (activeProfile?.profileType as 'private' | 'dealer' | 'company') || 'private';
  const theme = DYNAMIC_THEMES[activeProfileType] || DYNAMIC_THEMES.private;

  // ⚡ FIX: Check if following - with cleanup for promise
  // Only check if targetUserId is a valid user ID (not a route like 'settings', 'my-ads', etc.)
  React.useEffect(() => {
    if (!viewer || !activeProfile || viewer.uid === activeProfile.uid) return;

    let cancelled = false;

    followService.isFollowing(viewer.uid, activeProfile.uid)
      .then(result => {
        if (!cancelled) setIsFollowing(result);
      })
      .catch(error => {
        if (!cancelled) {
          logger.error('Error checking follow status', error as Error, { viewerId: viewer.uid, targetId: activeProfile.uid });
        }
      });

    return () => { cancelled = true; };
  }, [viewer, activeProfile]);

  const handleGoogleSync = async () => {
    if (!viewer || !isOwnProfile) return;
    setSyncing(true);
    try {
      const updated = await googleProfileSyncService.syncProfileData(viewer.uid);
      if (updated) {
        setUser(prev => prev ? { ...prev, ...updated } : null);
        await refresh();
      }
    } catch (error) {
      logger.error('Sync error:', error as Error);
      alert(language === 'bg' ? 'Грешка при синхронизация' : 'Sync error');
    } finally {
      setSyncing(false);
    }
  };

  // ⚡ PAYMENT & SWITCH LOGIC
  const handleProfileSwitch = async (newType: 'private' | 'dealer' | 'company') => {
    if (!user) return;
    const currentType = user.profileType || 'private';

    if (newType === currentType) return;

    // Payment Logic for Dealer/Company
    // ✅ CRITICAL: Use SUBSCRIPTION_PLANS as single source of truth
    if (newType === 'dealer' || newType === 'company') {
      const { SUBSCRIPTION_PLANS } = await import('@/config/subscription-plans');
      const cost = newType === 'dealer' 
        ? `€${SUBSCRIPTION_PLANS.dealer.price.monthly}` // ✅ €27.78
        : `€${SUBSCRIPTION_PLANS.company.price.monthly}`; // ✅ €137.88
      const confirmed = window.confirm(
        language === 'bg'
          ? `Активиране на план ${newType.toUpperCase()}?\nЦена: ${cost}/месец.\nЩе бъдете пренасочени към плащане.`
          : `Activate ${newType.toUpperCase()} Plan?\nCost: ${cost}/month.\nProceed to Stripe Checkout?`
      );

      if (!confirmed) return;

      // Simulate Payment Processing
      const toastId = toast.loading(language === 'bg' ? 'Обработване на плащане...' : 'Processing payment...');

      // 2 second delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.update(toastId, {
        render: language === 'bg' ? 'Плащането е успешно! Планът е активиран.' : 'Payment Successful! Plan activated.',
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
    }

    try {
      setSyncing(true); // Loading state
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../../../firebase/firebase-config');

      const userRef = doc(db, 'users', user.uid);
      let planTier = 'free';
      if (newType === 'dealer') planTier = 'dealer';
      if (newType === 'company') planTier = 'company';

      await updateDoc(userRef, {
        profileType: newType,
        planTier: planTier,
        updatedAt: serverTimestamp()
      });

      // Optimistic Update
      setUser(prev => prev ? { ...prev, profileType: newType, planTier: planTier as any } : null);

    } catch (err) {
      logger.error('Failed to switch profile', err as Error);
      toast.error('Failed to update profile');
    } finally {
      setSyncing(false);
    }
  };

  // ⚡ AUTHENTICATION CHECK: If accessing own profile without login, show AuthGuard
  if (isAccessingOwnProfile && !currentUser) {
    return (
      <AuthGuard requireAuth={true} showMessage={true}>
        <div />
      </AuthGuard>
    );
  }

  // 🛡️ CONSTITUTION GUARD: Don't render until routing validation is complete
  if (!isValidationReady) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '14px',
        color: '#666',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 500 }}>
          {language === 'bg' ? '🔒 Проверка на разрешенията за достъп...' : '🔒 Validating access permissions...'}
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {language === 'bg' ? 'Прилагане на правилата на Конституцията' : 'Enforcing Constitution rules'}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        {language === 'bg' ? 'Зареждане...' : 'Loading...'}
      </div>
    );
  }

  if (error && !activeProfile) {
    // If trying to view another user's profile and it doesn't exist, show error
    if (targetUserId && !target) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>{language === 'bg' ? 'Потребителят не е намерен' : 'User not found'}</h2>
          <p style={{ marginTop: '16px', color: '#6c757d' }}>
            {language === 'bg' ? 'Профилът, който търсите, не съществува.' : 'The profile you are looking for does not exist.'}
          </p>
        </div>
      );
    }
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  // If accessing own profile and no active profile found, wait for loading
  if (isAccessingOwnProfile && !activeProfile && !loading) {
    return (
      <AuthGuard requireAuth={true} showMessage={true}>
        <div />
      </AuthGuard>
    );
  }

  if (!activeProfile) {
    return null;
  }

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!viewer || !activeProfile || viewer.uid === activeProfile.uid) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(viewer.uid, activeProfile.uid);
        setIsFollowing(false);
      } else {
        await followService.followUser(viewer.uid, activeProfile.uid);
        setIsFollowing(true);
      }
    } catch (error) {
      logger.error('Follow error:', error as Error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle message - uses numeric IDs per constitution
  const handleMessage = () => {
    if (!activeProfile?.numericId || !viewer?.numericId) {
      logger.warn('Missing numeric IDs for messaging', {
        activeProfileNumericId: activeProfile?.numericId,
        viewerNumericId: viewer?.numericId
      });
      return;
    }
    // Constitution: /messages/:senderId/:recipientId with numeric IDs
    navigate(`/messages/${viewer.numericId}/${activeProfile.numericId}`);
  };

  return (
    <ThemeProvider theme={PROFILE_THEMES[activeProfileType] || PROFILE_THEMES['private']}>
      <S.ProfilePageContainer
        $isBusinessMode={isBusinessMode}
        $profileType={(activeProfile?.profileType as any) ?? 'private'}
      >
        <BusinessBackground isBusinessAccount={isBusinessMode} />

        <S.PageContainer>
          {/* Tab Navigation */}
          <TabNavigation $themeColor={theme?.primary || '#FF8F10'}>
            <TabNavLink to={basePath} end $themeColor={theme?.primary || '#FF8F10'}>
              <UserCircle size={16} />
              {language === 'bg' ? 'Профил' : 'Profile'}
            </TabNavLink>
            {!isOwnProfile && (
              <>
                <TabNavLink to={`${basePath}/my-ads`} $themeColor={theme?.primary || '#FF8F10'}>
                  <Car size={16} />
                  {language === 'bg' ? 'Обяви' : 'Listings'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/favorites`} $themeColor={theme?.primary || '#FF8F10'}>
                  <Heart size={16} />
                  {language === 'bg' ? 'Любими' : 'Favorites'}
                </TabNavLink>
              </>
            )}
            {isOwnProfile && (
              <>
                <TabNavLink to={`${basePath}/my-ads`} $themeColor={theme?.primary || '#FF8F10'}>
                  <Car size={16} />
                  {language === 'bg' ? 'Моите обяви' : 'My Ads'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/campaigns`} $themeColor={theme?.primary || '#FF8F10'}>
                  <Megaphone size={16} />
                  {language === 'bg' ? 'Реклами' : 'Campaigns'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/analytics`} $themeColor={theme?.primary || '#FF8F10'}>
                  <BarChart3 size={16} />
                  {language === 'bg' ? 'Статистика' : 'Analytics'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/settings`} $themeColor={theme?.primary || '#FF8F10'}>
                  <Shield size={16} />
                  {language === 'bg' ? 'Настройки' : 'Settings'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/consultations`} $themeColor={theme?.primary || '#FF8F10'}>
                  <MessageCircle size={18} />
                  {language === 'bg' ? 'Консултации' : 'Consultations'}
                </TabNavLink>
              </>
            )}
          </TabNavigation>

          {/* Cover Image + Profile Picture - ONLY for own profile */}
          {/* For other users' profiles, PublicProfileView handles the cover/profile display */}
          {isOwnProfile && !location.pathname.includes('/my-ads') && !location.pathname.includes('/campaigns') && !location.pathname.includes('/analytics') && !location.pathname.includes('/settings') && !location.pathname.includes('/consultations') ? (
            <S.CoverAndProfileWrapper>
              {/* Cover Image */}
              <CoverImageUploader
                currentImageUrl={typeof activeProfile.coverImage === 'string' ? activeProfile.coverImage : activeProfile.coverImage?.url}
                themeColor={theme?.primary || '#FF8F10'}
                onUploadSuccess={(url) => {
                  setUser(prev => prev ? {
                    ...prev,
                    coverImage: url
                  } : null);
                }}
                onUploadError={(error) => {
                  logger.error('Cover error', error as Error);
                }}
              />

              <S.CenteredProfileImageWrapper>
                <ProfileImageUploader
                  currentImageUrl={activeProfile?.photoURL || (activeProfile as any)?.profileImage?.url}
                  onUploadSuccess={(url) => {
                    // Update local state immediately
                    setUser(prev => prev ? {
                      ...prev,
                      photoURL: url
                    } : null);
                    // Refresh profile data
                    refresh();
                  }}
                  onUploadError={(err) => {
                    logger.error('Profile image upload error', err as Error);
                    alert(language === 'bg' ? `Грешка при качване: ${err}` : `Upload error: ${err}`);
                  }}
                />
              </S.CenteredProfileImageWrapper>
            </S.CoverAndProfileWrapper>
          ) : null}

          {/* ✅ Green Header Bar - Under Profile Image - Only for own profile */}
          {/* For other users' profiles, PublicProfileView handles the green header */}
          {isOwnProfile && !location.pathname.includes('/my-ads') && !location.pathname.includes('/campaigns') && !location.pathname.includes('/analytics') && !location.pathname.includes('/settings') && !location.pathname.includes('/consultations') && (
            <BusinessGreenHeader
              user={activeProfile}
              viewer={viewer}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              followLoading={followLoading}
              syncing={syncing}
              onFollow={handleFollow}
              onMessage={handleMessage}
              onProfileSwitch={handleProfileSwitch}
              onGoogleSync={handleGoogleSync}
              onBlockChanged={(isBlocked) => {
                logger.info('Block status changed in green header', {
                  targetUserId: activeProfile?.uid,
                  isBlocked,
                  viewerId: viewer?.uid
                });
              }}
            />
          )}

          {/* Premium Profile Type Switcher - Toggled via Tier button */}
          {showTypeSwitcher && isOwnProfile && (
            <div style={{ marginBottom: '24px' }}>
              <ProfileTypeSwitcher />
            </div>
          )}

          {/* ⚡ HIDDEN: Old Profile Header - Will be merged into ProfileDashboard */}
          {false && window.location.pathname === '/profile' && (
            <div style={{ display: 'none' }}></div>
          )}

          {/* Content Area - React Router will render child routes here */}
          <Outlet context={{ 
            user: activeProfile, 
            viewer, 
            isOwnProfile, 
            theme, 
            userCars, 
            refresh, 
            setUser,
            isFollowing,
            followLoading,
            handleFollow,
            handleMessage,
            syncing,
            handleProfileSwitch,
            handleGoogleSync
          }} />
        </S.PageContainer>
      </S.ProfilePageContainer>
    </ThemeProvider>
  );
};


export default ProfilePageWrapper;

