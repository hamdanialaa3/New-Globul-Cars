import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { useAuth } from '@/contexts/AuthProvider';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { auth } from '@/firebase/firebase-config';
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
  Heart,
  Search
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabNavLink, SyncButton, FollowButton } from './TabNavigation.styles';
import { CoverImageUploader, BusinessBackground, SimpleProfileAvatar, ProfileImageUploader, BusinessGreenHeader } from '@/components/Profile';
import ProfileLoadingSkeleton from '@/components/Profile/ProfileLoadingSkeleton';
import { ProfileTypeSwitcher } from '../components/ProfileTypeSwitcher'; // Added Import
import { googleProfileSyncService } from '@/services/google/google-profile-sync.service';
import { usePromotionalOffer } from '@/hooks/usePromotionalOffer';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { activateFreePlan } from '@/services/billing/free-plan-activation.service';
import { followService } from '@/services/social/follow-service';
import { logger } from '@/services/logger-service';
import { profileStatsService } from '@/services/profile/profile-stats.service';
import { ThemeProvider } from 'styled-components';
import { PROFILE_THEMES } from '../../../../config/profile-themes';
// 🔴 CRITICAL: Block User Button integration
import BlockUserButton from '@/components/messaging/BlockUserButton';
import { useTargetUserId, useConstitutionEnforcement, useNumericIdRedirect, useProfileBasePath } from './hooks/useProfileRouting';

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
  const { settings, isLoaded: siteSettingsLoaded } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { profileType: contextProfileType, theme: contextTheme } = useProfileType();
  const { currentUser } = useAuth();

  // 🔒 Get target user ID from URL route parameter (extracted to useProfileRouting)
  const targetUserId = useTargetUserId();

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

  // 🔒 Constitution enforcement + validation (extracted to useProfileRouting)
  const isValidationReady = useConstitutionEnforcement(targetUserId, viewer, activeProfile, loading);

  // 🔢 Ensure numeric ID + auto-redirects (extracted to useProfileRouting)
  useNumericIdRedirect(isAccessingOwnProfile, currentUserNumericId, isOwnProfile, loading, refresh);

  // 🔗 Compute basePath for tab navigation (extracted to useProfileRouting)
  const basePath = useProfileBasePath(isOwnProfile, currentUserNumericId, activeProfile, loading);

  const [syncing, setSyncing] = React.useState(false);
  const [showTypeSwitcher, setShowTypeSwitcher] = React.useState(false); // Added State

  // ⚡ AUTO-UPDATE PROFILE STATS: Update stats when profile loads
  // ✅ CRITICAL FIX: Only update stats for own profile, throttle to once per 15 min
  const lastStatsUpdateRef = React.useRef<Record<string, number>>({});
  const STATS_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes

  React.useEffect(() => {
    if (!activeProfile?.uid || !viewer?.uid) return;
    
    const isOwnProfile = viewer.uid === activeProfile.uid;
    if (!isOwnProfile) {
      logger.debug('Skipping stats update for other user profile', { 
        viewerId: viewer.uid, 
        profileId: activeProfile.uid 
      });
      return;
    }

    // Throttle: skip if updated less than 15 min ago
    const now = Date.now();
    const lastUpdate = lastStatsUpdateRef.current[activeProfile.uid] ?? 0;
    if (now - lastUpdate < STATS_THROTTLE_MS) {
      logger.debug('Skipping stats update — throttled', { userId: activeProfile.uid });
      return;
    }

    let cancelled = false;

    profileStatsService.updateUserStats(activeProfile.uid)
      .then(() => {
        if (!cancelled) {
          lastStatsUpdateRef.current[activeProfile.uid] = Date.now();
          logger.info('Profile stats updated', { userId: activeProfile.uid });
        }
      })
      .catch(error => {
        if (!cancelled) {
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
  }, [activeProfile?.uid, viewer?.uid]);

  // ⚡ FIX: Follow state MUST be before early return!
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);

  // Business mode check
  const activeProfileType = ((activeProfile?.planTier === 'free'
    ? 'private'
    : activeProfile?.profileType) as 'private' | 'dealer' | 'company') || 'private';
  const isBusinessMode = activeProfileType === 'dealer' || activeProfileType === 'company';

  // 🎨 DYNAMIC THEME: Based on activeProfile.profileType (not logged-in user's type)
  // This ensures theme matches the profile being viewed
  const DYNAMIC_THEMES = {
    private: {
      primary: '#FF7A2D',
      secondary: '#FFDF00',
      accent: '#E5631A',
      gradient: 'linear-gradient(135deg, #FF7A2D 0%, #E5631A 100%)'
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
      if (auth.currentUser) {
        await googleProfileSyncService.syncGoogleProfile(auth.currentUser);
        await refresh();
        toast.success(language === 'bg' ? 'Профилът е синхронизиран!' : 'Profile synced successfully!');
      }
    } catch (error) {
      logger.error('Sync error:', error as Error);
      toast.error(language === 'bg' ? 'Грешка при синхронизация' : 'Sync error');
    } finally {
      setSyncing(false);
    }
  };

  // ─── Promotional Offer Hook ───
  const { isFreeOffer } = usePromotionalOffer();
  const subscriptionMode = settings.pricing?.subscriptionMode === 'free' ? 'free' : 'paid';
  const canActivateWithoutPayment = subscriptionMode === 'free';

  // ⚡ PAYMENT & SWITCH LOGIC
  const handleProfileSwitch = async (newType: 'private' | 'dealer' | 'company') => {
    if (!user) return;
    const currentType = user.profileType || 'private';

    if (!siteSettingsLoaded) {
      toast.info(language === 'bg' ? 'Изчакайте зареждането на настройките...' : 'Please wait for settings to load...');
      return;
    }

    if (newType === currentType) return;

    // ─── Downgrade to Private: always free ───
    if (newType === 'private') {
      try {
        setSyncing(true);
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../../../../firebase/firebase-config');
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          profileType: 'private',
          planTier: 'free',
          plan: {
            tier: 'free',
          },
          updatedAt: serverTimestamp()
        });
        setUser(prev => prev ? { ...prev, profileType: 'private', planTier: 'free' as any } : null);
        toast.success(language === 'bg' ? 'Профилът е променен на Частен' : 'Profile switched to Private');
      } catch (err) {
        logger.error('Failed to switch to private', err as Error);
        toast.error('Failed to update profile');
      } finally {
        setSyncing(false);
      }
      return;
    }

    // ─── Upgrade to Dealer/Company ───
    if (canActivateWithoutPayment) {
      // Activate directly when the whole site is in free mode or a promo is active.
      setSyncing(true);
      try {
        toast.info(language === 'bg'
          ? 'Активиране на плана без плащане...'
          : 'Activating the plan without payment...');
        const result = await activateFreePlan({
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || 'Unknown',
          planTier: newType as 'dealer' | 'company',
        });

        if (result.success) {
          // Update local state
          setUser(prev => prev ? { ...prev, profileType: newType, planTier: newType as any } : null);
          toast.success(language === 'bg'
            ? `🎉 План ${newType === 'dealer' ? 'Търговец' : 'Компания'} е активиран успешно!`
            : `🎉 ${newType === 'dealer' ? 'Dealer' : 'Company'} plan activated successfully!`
          );
        } else if (result.error === 'FREE_OFFER_EXPIRED') {
          if (subscriptionMode === 'paid') {
            toast.warning(language === 'bg'
              ? 'Безплатната оферта изтече. Пренасочване към плащане...'
              : 'Free offer expired. Redirecting to payment...'
            );
            navigate(`/billing/manual-checkout?plan=${newType}&interval=monthly&type=subscription`);
          } else {
            toast.error(language === 'bg'
              ? 'Неуспешно активиране на плана. Опитайте отново.'
              : 'Plan activation failed. Please try again.'
            );
          }
        } else {
          toast.error(language === 'bg' ? 'Грешка при активиране' : 'Activation failed');
        }
      } catch (err) {
        logger.error('Free plan activation failed', err as Error);
        toast.error('Failed to activate plan');
      } finally {
        setSyncing(false);
      }
    } else {
      // 💳 PAID: redirect to manual checkout
      const { SUBSCRIPTION_PLANS } = await import('@/config/subscription-plans');
      const cost = newType === 'dealer'
        ? `€${SUBSCRIPTION_PLANS.dealer.price.monthly}`
        : `€${SUBSCRIPTION_PLANS.company.price.monthly}`;
      const confirmed = window.confirm(
        language === 'bg'
          ? `Активиране на план ${newType === 'dealer' ? 'Търговец' : 'Компания'}?\nЦена: ${cost}/месец.\nЩе бъдете пренасочени към плащане.`
          : `Activate ${newType === 'dealer' ? 'Dealer' : 'Company'} Plan?\nCost: ${cost}/month.\nProceed to payment?`
      );

      if (!confirmed) return;

      navigate(`/billing/manual-checkout?plan=${newType}&interval=monthly&type=subscription`);
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
    return <ProfileLoadingSkeleton />;
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

  // Handle follow status change - called by FollowButton
  const handleFollow = async () => {
    if (!viewer || !activeProfile || viewer.uid === activeProfile.uid) return;
    
    try {
      // Re-fetch follow status to sync UI
      const status = await followService.isFollowing(viewer.uid, activeProfile.uid);
      setIsFollowing(status);
      
      // Also refresh profile stats to show updated counters
      refresh();
    } catch (error) {
      logger.error('Error handling follow change:', error as Error);
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
    <ThemeProvider theme={(PROFILE_THEMES[activeProfileType] || PROFILE_THEMES['private']) as any}>
      <S.ProfilePageContainer
        $isBusinessMode={isBusinessMode}
        $profileType={activeProfileType}
      >
        <BusinessBackground isBusinessAccount={true} profileType={activeProfileType} />

        <S.PageContainer>
          {/* Tab Navigation */}
          <TabNavigation $themeColor={theme?.primary || '#FF7A2D'}>
            <TabNavLink to={basePath} end $themeColor={theme?.primary || '#FF7A2D'}>
              <UserCircle size={16} />
              {language === 'bg' ? 'Профил' : 'Profile'}
            </TabNavLink>
            {!isOwnProfile && (
              <>
                <TabNavLink to={`${basePath}/my-ads`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Car size={16} />
                  {language === 'bg' ? 'Обяви' : 'Listings'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/favorites`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Heart size={16} />
                  {language === 'bg' ? 'Любими' : 'Favorites'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/following`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Users size={16} />
                  {language === 'bg' ? 'Следвани' : 'Following'}
                </TabNavLink>
                <TabNavLink to="/search/users" $themeColor={theme?.primary || '#FF7A2D'}>
                  <Search size={16} />
                  {language === 'bg' ? 'Търси хора' : 'Find Users'}
                </TabNavLink>
              </>
            )}
            {isOwnProfile && (
              <>
                <TabNavLink to={`${basePath}/my-ads`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Car size={16} />
                  {language === 'bg' ? 'Моите обяви' : 'My Ads'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/campaigns`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Megaphone size={16} />
                  {language === 'bg' ? 'Реклами' : 'Campaigns'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/analytics`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <BarChart3 size={16} />
                  {language === 'bg' ? 'Статистика' : 'Analytics'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/settings`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Shield size={16} />
                  {language === 'bg' ? 'Настройки' : 'Settings'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/consultations`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <MessageCircle size={18} />
                  {language === 'bg' ? 'Консултации' : 'Consultations'}
                </TabNavLink>
                <TabNavLink to={`${basePath}/following`} $themeColor={theme?.primary || '#FF7A2D'}>
                  <Users size={16} />
                  {language === 'bg' ? 'Следвани' : 'Following'}
                </TabNavLink>
                <TabNavLink to="/search/users" $themeColor={theme?.primary || '#FF7A2D'}>
                  <Search size={16} />
                  {language === 'bg' ? 'Търси хора' : 'Find Users'}
                </TabNavLink>
              </>
            )}
          </TabNavigation>

          {/* Cover Image + Profile Picture - ONLY for own profile */}
          {/* For other users' profiles, PublicProfileView handles the cover/profile display */}
          {isOwnProfile && !location.pathname.includes('/my-ads') && !location.pathname.includes('/campaigns') && !location.pathname.includes('/analytics') && !location.pathname.includes('/settings') && !location.pathname.includes('/consultations') && !location.pathname.includes('/following') && !location.pathname.includes('/favorites') ? (
            <S.CoverAndProfileWrapper>
              {/* Cover Image */}
              <CoverImageUploader
                currentImageUrl={activeProfile.coverImage}
                themeColor={theme?.primary || '#FF7A2D'}
                onUploadSuccess={(url) => {
                  setUser(prev => prev ? {
                    ...prev,
                    coverImage: url
                  } : null);
                }}
                onUploadError={(error) => {
                  logger.error('Cover error', error as any);
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
                    logger.error('Profile image upload error', err as any);
                    toast.error(language === 'bg' ? `Грешка при качване: ${String(err)}` : `Upload error: ${String(err)}`);
                  }}
                />
              </S.CenteredProfileImageWrapper>
            </S.CoverAndProfileWrapper>
          ) : null}

          {/* ✅ Green Header Bar - Under Profile Image - Only for own profile */}
          {/* For other users' profiles, PublicProfileView handles the green header */}
          {isOwnProfile && !location.pathname.includes('/my-ads') && !location.pathname.includes('/campaigns') && !location.pathname.includes('/analytics') && !location.pathname.includes('/settings') && !location.pathname.includes('/consultations') && !location.pathname.includes('/following') && !location.pathname.includes('/favorites') && (
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


