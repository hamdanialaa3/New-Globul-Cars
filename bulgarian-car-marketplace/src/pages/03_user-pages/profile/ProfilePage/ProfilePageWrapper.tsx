import React from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
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
  Phone as PhoneIcon
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabNavLink, SyncButton, FollowButton } from './TabNavigation.styles';
import { CoverImageUploader, BusinessBackground, SimpleProfileAvatar, ProfileImageUploader } from '../../../../components/Profile';
import { ShareButton } from '../../../../components/ShareButton';
import { googleProfileSyncService } from '../../../../services/google/google-profile-sync.service';
import { followService } from '../../../../services/social/follow.service';
import { logger } from '../../../../services/logger-service';

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
  const { profileType, theme } = useProfileType();
  const { currentUser } = useAuth();
  
  // Get target user ID from URL route parameter
  const targetUserId = params.userId;
  
  // Check if user is trying to access their own profile without being logged in
  const isAccessingOwnProfile = !targetUserId || location.pathname === '/profile' || location.pathname === '/profile/';
  
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
  } = useProfile(targetUserId);

  const activeProfile = target ?? user;

  const basePath = React.useMemo(() => {
    if (isOwnProfile || !activeProfile?.uid) {
      return '/profile';
    }
    return `/profile/${activeProfile.uid}`;
  }, [activeProfile?.uid, isOwnProfile]);
  
  const [syncing, setSyncing] = React.useState(false);
  
  // ⚡ FIX: Follow state MUST be before early return!
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  
  // Business mode check
  const isBusinessMode = activeProfile?.accountType === 'business' || activeProfile?.accountType === 'dealer' || activeProfile?.accountType === 'company';
  
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
  
  // Google Sync Handler
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
      logger.error('Sync error:', error);
      alert(language === 'bg' ? 'Грешка при синхронизация' : 'Sync error');
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
      logger.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };
  
  // Handle message
  const handleMessage = () => {
    if (!activeProfile?.uid) return;
    navigate(`/messages?userId=${activeProfile.uid}`);
  };
  
  return (
    <S.ProfilePageContainer $isBusinessMode={isBusinessMode}>
      <BusinessBackground isBusinessAccount={isBusinessMode} />
      
      <S.PageContainer>
        {/* Tab Navigation */}
        <TabNavigation $themeColor={theme.primary}>
          <TabNavLink to={basePath} end $themeColor={theme.primary}>
            <UserCircle size={16} />
            {language === 'bg' ? 'Профил' : 'Profile'}
          </TabNavLink>
          {isOwnProfile && (
            <>
              <TabNavLink to={`${basePath}/my-ads`} $themeColor={theme.primary}>
                <Car size={16} />
                {language === 'bg' ? 'Моите обяви' : 'My Ads'}
              </TabNavLink>
              <TabNavLink to={`${basePath}/campaigns`} $themeColor={theme.primary}>
                <Megaphone size={16} />
                {language === 'bg' ? 'Реклами' : 'Campaigns'}
              </TabNavLink>
              <TabNavLink to={`${basePath}/analytics`} $themeColor={theme.primary}>
                <BarChart3 size={16} />
                {language === 'bg' ? 'Статистика' : 'Analytics'}
              </TabNavLink>
              <TabNavLink to={`${basePath}/settings`} $themeColor={theme.primary}>
                <Shield size={16} />
                {language === 'bg' ? 'Настройки' : 'Settings'}
              </TabNavLink>
              <TabNavLink to={`${basePath}/consultations`} $themeColor={theme.primary}>
                <MessageCircle size={18} />
                {language === 'bg' ? 'Консултации' : 'Consultations'}
              </TabNavLink>
            </>
          )}
        </TabNavigation>
        
        {/* Cover Image + Profile Picture - Only on main /profile page */}
        {window.location.pathname.replace(/\/$/, '') === basePath.replace(/\/$/, '') && (
          <S.CoverAndProfileWrapper>
            {/* Cover Image */}
            {isOwnProfile && (
              <CoverImageUploader
                currentImageUrl={typeof activeProfile.coverImage === 'string' ? activeProfile.coverImage : activeProfile.coverImage?.url}
                themeColor={theme.primary}
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
            )}
            
            {/* Centered Profile Picture */}
            <S.CenteredProfileImageWrapper>
              <ProfileImageUploader
                currentImageUrl={typeof activeProfile?.photoURL === 'string' ? activeProfile.photoURL : (typeof activeProfile?.profileImage === 'object' ? activeProfile.profileImage?.url : undefined)}
                onUploadSuccess={(url) => {
                  // Update local state immediately
                  setUser(prev => prev ? { 
                    ...prev, 
                    photoURL: url,
                    profileImage: url ? { url, uploadedAt: new Date() } : undefined
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
        )}
        
        {/* ✅ Single Modern Stats Bar with Name + 5 Stats */}
        {window.location.pathname.replace(/\/$/, '') === basePath.replace(/\/$/, '') && (
          <S.SingleStatsBar>
            {/* Name Section */}
            <S.StatBarNameSection>
              <S.UserNameCompact>
                {activeProfile.displayName || (language === 'bg' ? 'Анонимен' : 'Anonymous')}
              </S.UserNameCompact>
              <S.UserEmailCompact>{activeProfile.email}</S.UserEmailCompact>
            </S.StatBarNameSection>

            {/* Stats Section - Only Views, Listings, Trust */}
            <S.StatBarStatsSection>
              <S.StatItem>
                <S.StatNumber>{activeProfile.stats?.totalViews || 0}</S.StatNumber>
                <S.StatLabel>{language === 'bg' ? 'Views' : 'Views'}</S.StatLabel>
              </S.StatItem>
              <S.StatItem>
                <S.StatNumber>{activeProfile.stats?.activeListings || 0}</S.StatNumber>
                <S.StatLabel>{language === 'bg' ? 'Listings' : 'Listings'}</S.StatLabel>
              </S.StatItem>
              <S.StatItem>
                <S.StatNumber>{activeProfile.stats?.trustScore || 0}%</S.StatNumber>
                <S.StatLabel>{language === 'bg' ? 'Trust' : 'Trust'}</S.StatLabel>
              </S.StatItem>
            </S.StatBarStatsSection>

            {/* Actions Section */}
            <S.StatBarActionsSection>
              {isOwnProfile ? (
                <S.ActionButtonCompact $variant="secondary" onClick={handleGoogleSync}>
                  <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
                  {syncing 
                    ? (language === 'bg' ? 'Синхронизиране...' : 'Syncing...') 
                    : (language === 'bg' ? 'Синхронизирай' : 'Sync')}
                </S.ActionButtonCompact>
              ) : (
                <>
                  <ShareButton
                    url={`${window.location.origin}/profile/${activeProfile.uid}`}
                    title={activeProfile.displayName || 'Профил'}
                    text={`Изгледайте профила на ${activeProfile.displayName}`}
                    variant="button"
                    size="sm"
                  />
                  <FollowButton 
                    onClick={handleFollow} 
                    disabled={followLoading}
                    $following={isFollowing}
                  >
                    {isFollowing 
                      ? (language === 'bg' ? 'Последван' : 'Following')
                      : (language === 'bg' ? 'Последвай' : 'Follow')}
                  </FollowButton>
                  <S.ActionButtonCompact $variant="primary" onClick={handleMessage}>
                    <PhoneIcon size={16} />
                    {language === 'bg' ? 'Съобщение' : 'Message'}
                  </S.ActionButtonCompact>
                </>
              )}
            </S.StatBarActionsSection>
          </S.SingleStatsBar>
        )}
        
        {/* ⚡ HIDDEN: Old Profile Header - Will be merged into ProfileDashboard */}
        {false && window.location.pathname === '/profile' && (
          <div style={{ display: 'none' }}></div>
        )}
        
        {/* Content Area - React Router will render child routes here */}
        <Outlet context={{ user: activeProfile, viewer, isOwnProfile, theme, userCars, refresh, setUser }} />
      </S.PageContainer>
    </S.ProfilePageContainer>
  );
};

export default ProfilePageWrapper;

