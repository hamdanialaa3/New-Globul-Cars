import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import { useSearchParams } from 'react-router-dom';
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
import { CoverImageUploader, BusinessBackground, LEDProgressAvatar } from '../../components/Profile';
import { googleProfileSyncService } from '../../services/google/google-profile-sync.service';
import { followService } from '../../services/social/follow.service';

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
  const [searchParams] = useSearchParams();
  const { profileType, theme } = useProfileType();
  
  // Get target user ID from URL
  const targetUserId = searchParams.get('userId') || undefined;
  
  const {
    user,
    loading,
    isOwnProfile,
    setUser
  } = useProfile(targetUserId);
  
  const [syncing, setSyncing] = React.useState(false);
  
  // Business mode check
  const isBusinessMode = user?.accountType === 'business' || user?.accountType === 'dealer' || user?.accountType === 'company';
  
  // Google Sync Handler
  const handleGoogleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const updated = await googleProfileSyncService.syncProfileData(user.uid);
      if (updated) {
        setUser(prev => prev ? { ...prev, ...updated } : null);
        alert(language === 'bg' ? 'Профилът е синхронизиран!' : 'Profile synced!');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert(language === 'bg' ? 'Грешка при синхронизация' : 'Sync error');
    } finally {
      setSyncing(false);
    }
  };
  
  if (loading || !user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        {language === 'bg' ? 'Зареждане...' : 'Loading...'}
      </div>
    );
  }
  
  // Follow state
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  
  // Check if following
  React.useEffect(() => {
    if (user && !isOwnProfile && targetUserId) {
      followService.isFollowing(user.uid, targetUserId).then(setIsFollowing);
    }
  }, [user, isOwnProfile, targetUserId]);
  
  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user || !targetUserId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(user.uid, targetUserId);
        setIsFollowing(false);
      } else {
        await followService.followUser(user.uid, targetUserId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };
  
  // Handle message
  const handleMessage = () => {
    if (!targetUserId) return;
    navigate(`/messages?userId=${targetUserId}`);
  };
  
  return (
    <S.ProfilePageContainer $isBusinessMode={isBusinessMode}>
      <BusinessBackground isBusinessAccount={isBusinessMode} />
      
      <S.PageContainer>
        {/* Tab Navigation */}
        <TabNavigation $themeColor={theme.primary}>
          <TabNavLink to="/profile" end $themeColor={theme.primary}>
            <UserCircle size={16} />
            {language === 'bg' ? 'Профил' : 'Profile'}
          </TabNavLink>
          {isOwnProfile && (
            <>
              <TabNavLink to="/profile/my-ads" $themeColor={theme.primary}>
                <Car size={16} />
                {language === 'bg' ? 'Моите обяви' : 'My Ads'}
              </TabNavLink>
              <TabNavLink to="/profile/campaigns" $themeColor={theme.primary}>
                <Megaphone size={16} />
                {language === 'bg' ? 'Реклами' : 'Campaigns'}
              </TabNavLink>
              <TabNavLink to="/profile/analytics" $themeColor={theme.primary}>
                <BarChart3 size={16} />
                {language === 'bg' ? 'Статистика' : 'Analytics'}
              </TabNavLink>
              <TabNavLink to="/profile/settings" $themeColor={theme.primary}>
                <Shield size={16} />
                {language === 'bg' ? 'Настройки' : 'Settings'}
              </TabNavLink>
              <TabNavLink to="/profile/consultations" $themeColor={theme.primary}>
                <MessageCircle size={18} />
                {language === 'bg' ? 'Консултации' : 'Consultations'}
              </TabNavLink>
            </>
          )}
        </TabNavigation>
        
        {/* Cover Image - Only on main /profile page */}
        {window.location.pathname === '/profile' && (
          <CoverImageUploader
            currentImageUrl={user.coverImage?.url}
            themeColor={theme.primary}
            onUploadSuccess={(url) => {
              setUser(prev => prev ? { 
                ...prev, 
                coverImage: { url, uploadedAt: new Date() } 
              } : null);
            }}
            onUploadError={(error) => {
              console.error('Cover error:', error);
            }}
          />
        )}
        
        {/* ⚡ NEW: Profile Header with Avatar - Only on main /profile page */}
        {window.location.pathname === '/profile' && (
          <S.ProfileHeader>
            {/* Profile Image (LED Avatar) */}
            <S.ProfileImageContainer>
              <LEDProgressAvatar
                user={user}
                profileType={profileType}
                size={120}
                onClick={isOwnProfile ? () => navigate('/profile/settings') : undefined}
              />
            </S.ProfileImageContainer>
            
            {/* User Info */}
            <S.ProfileInfo>
              <S.ProfileName>
                {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                {user.verification?.emailVerified && (
                  <S.VerifiedBadge>✓</S.VerifiedBadge>
                )}
              </S.ProfileName>
              
              {user.bio && (
                <S.ProfileBio>{user.bio}</S.ProfileBio>
              )}
              
              {/* Contact Info */}
              <S.ProfileDetails>
                {user.location?.city && (
                  <S.DetailItem>
                    <MapPin size={14} />
                    {user.location.city}
                  </S.DetailItem>
                )}
                {user.email && isOwnProfile && (
                  <S.DetailItem>
                    <Mail size={14} />
                    {user.email}
                  </S.DetailItem>
                )}
                {user.phoneNumber && isOwnProfile && (
                  <S.DetailItem>
                    <PhoneIcon size={14} />
                    {user.phoneNumber}
                  </S.DetailItem>
                )}
              </S.ProfileDetails>
              
              {/* Stats */}
              <S.StatsContainer>
                <S.Stat data-count={user.stats?.posts || 0}>
                  <span>{language === 'bg' ? 'Публикации' : 'Posts'}</span>
                </S.Stat>
                <S.Stat data-count={user.stats?.followers || 0}>
                  <span>{language === 'bg' ? 'Последователи' : 'Followers'}</span>
                </S.Stat>
                <S.Stat data-count={user.stats?.following || 0}>
                  <span>{language === 'bg' ? 'Следвани' : 'Following'}</span>
                </S.Stat>
              </S.StatsContainer>
              
              {/* Action Buttons */}
              <S.ActionsContainer>
                {isOwnProfile ? (
                  <>
                    <S.ActionButton 
                      variant="primary" 
                      onClick={() => navigate('/profile/settings')}
                    >
                      {language === 'bg' ? 'Редактирай профил' : 'Edit Profile'}
                    </S.ActionButton>
                    <S.ActionButton 
                      variant="secondary"
                      onClick={handleGoogleSync}
                      disabled={syncing}
                    >
                      <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
                      {syncing 
                        ? (language === 'bg' ? 'Синхронизиране...' : 'Syncing...') 
                        : (language === 'bg' ? 'Синхронизирай' : 'Sync')}
                    </S.ActionButton>
                  </>
                ) : (
                  <>
                    <S.ActionButton 
                      variant="primary"
                      onClick={handleFollow}
                      disabled={followLoading}
                    >
                      {isFollowing 
                        ? (language === 'bg' ? 'Не следвай' : 'Unfollow')
                        : (language === 'bg' ? 'Следвай' : 'Follow')}
                    </S.ActionButton>
                    <S.ActionButton 
                      variant="secondary"
                      onClick={handleMessage}
                    >
                      <MessageCircle size={16} />
                      {language === 'bg' ? 'Съобщение' : 'Message'}
                    </S.ActionButton>
                  </>
                )}
              </S.ActionsContainer>
            </S.ProfileInfo>
          </S.ProfileHeader>
        )}
        
        {/* Content Area - React Router will render child routes here */}
        <Outlet />
      </S.PageContainer>
    </S.ProfilePageContainer>
  );
};

export default ProfilePageWrapper;

