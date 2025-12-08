import React from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
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
  const params = useParams<{ userId?: string }>();
  const { profileType, theme } = useProfileType();
  
  // Get target user ID from URL route parameter
  const targetUserId = params.userId;
  
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
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        {language === 'bg' ? 'Зареждане...' : 'Loading...'}
      </div>
    );
  }

  if (error && !activeProfile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        {error}
      </div>
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
                currentImageUrl={typeof activeProfile?.photoURL === 'string' ? activeProfile.photoURL : undefined}
                onUploadSuccess={() => window.location.reload()}
                onUploadError={(err) => alert(err)}
              />
            </S.CenteredProfileImageWrapper>
          </S.CoverAndProfileWrapper>
        )}
        
        {/* User Info Bar with Name and Stats */}
        {window.location.pathname.replace(/\/$/, '') === basePath.replace(/\/$/, '') && (
          <S.UserInfoBar>
            <S.UserInfoLeft>
              <S.UserName>
                {activeProfile.displayName || (language === 'bg' ? 'Анонимен' : 'Anonymous')}
              </S.UserName>
              <S.UserEmail>{activeProfile.email}</S.UserEmail>
            </S.UserInfoLeft>
            
            <S.UserInfoCenter>
              <S.StatBox>
                <span className="number">{activeProfile.stats?.totalViews || 0}</span>
                <span className="label">{language === 'bg' ? 'Прегледи' : 'Views'}</span>
              </S.StatBox>
              <S.StatBox>
                <span className="number">{activeProfile.stats?.activeListings || 0}</span>
                <span className="label">{language === 'bg' ? 'Обяви' : 'Listings'}</span>
              </S.StatBox>
              <S.StatBox>
                <span className="number">{activeProfile.stats?.trustScore || 0}%</span>
                <span className="label">{language === 'bg' ? 'Доверие' : 'Trust'}</span>
              </S.StatBox>
            </S.UserInfoCenter>
            
            <S.UserInfoRight>
              {isOwnProfile ? (
                <S.ActionButton $variant="secondary" onClick={handleGoogleSync}>
                  <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
                  {syncing 
                    ? (language === 'bg' ? 'Синхронизиране...' : 'Syncing...') 
                    : (language === 'bg' ? 'Синхронизирай' : 'Sync')}
                </S.ActionButton>
              ) : (
                <>
                  <FollowButton 
                    onClick={handleFollow} 
                    disabled={followLoading}
                    $following={isFollowing}
                  >
                    {isFollowing 
                      ? (language === 'bg' ? 'Последван' : 'Following')
                      : (language === 'bg' ? 'Последвай' : 'Follow')}
                  </FollowButton>
                  <S.ActionButton $variant="primary" onClick={handleMessage}>
                    <PhoneIcon size={16} />
                    {language === 'bg' ? 'Съобщение' : 'Message'}
                  </S.ActionButton>
                </>
              )}
            </S.UserInfoRight>
          </S.UserInfoBar>
        )}
        
        {/* ⚡ HIDDEN: Old Profile Header - Will be merged into ProfileDashboard */}
        {false && window.location.pathname === '/profile' && (
          <div style={{ display: 'none' }}></div>
        )}
        
        {/* Content Area - React Router will render child routes here */}
        <Outlet context={{ user: activeProfile, viewer, isOwnProfile, theme, userCars }} />
      </S.PageContainer>
    </S.ProfilePageContainer>
  );
};

export default ProfilePageWrapper;

