import React from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '@/contexts/ProfileTypeContext';
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
import { CoverImageUploader, BusinessBackground, SimpleProfileAvatar } from '@/components/Profile';
import { googleProfileSyncService } from '@/services/google/google-profile-sync.service';
import { followService } from '@/services/social/follow.service';

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
    loading,
    isOwnProfile,
    setUser
  } = useProfile(targetUserId);
  
  const [syncing, setSyncing] = React.useState(false);
  
  // ⚡ FIX: Follow state MUST be before early return!
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  
  // Business mode check
  const isBusinessMode = user?.accountType === 'business' || user?.accountType === 'dealer' || user?.accountType === 'company';
  
  // ⚡ FIX: Check if following - with cleanup for promise
  // Only check if targetUserId is a valid user ID (not a route like 'settings', 'my-ads', etc.)
  React.useEffect(() => {
    // Skip if no user, viewing own profile, no targetUserId, or targetUserId is a route name
    const isRouteName = targetUserId && ['settings', 'my-ads', 'campaigns', 'analytics', 'consultations'].includes(targetUserId);
    if (!user || isOwnProfile || !targetUserId || isRouteName) return;
    
    let cancelled = false;
    
    followService.isFollowing(user.uid, targetUserId)
      .then(result => {
        if (!cancelled) setIsFollowing(result);
      })
      .catch(error => {
        if (!cancelled) {
          logger.error('Error checking follow status', error as Error, { userId: user.uid, targetUserId });
        }
      });
    
    return () => { cancelled = true; };
  }, [user, isOwnProfile, targetUserId]);
  
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
        
        {/* ⚡ HIDDEN: Old Profile Header - Will be merged into ProfileDashboard */}
        {false && window.location.pathname === '/profile' && (
          <div style={{ display: 'none' }}></div>
        )}
        
        {/* Content Area - React Router will render child routes here */}
        <Outlet />
      </S.PageContainer>
    </S.ProfilePageContainer>
  );
};

export default ProfilePageWrapper;

