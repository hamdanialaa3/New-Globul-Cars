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
  RefreshCw
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabNavLink, SyncButton, FollowButton } from './TabNavigation.styles';
import { CoverImageUploader, BusinessBackground } from '../../components/Profile';
import { googleProfileSyncService } from '../../services/google/google-profile-sync.service';

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
        {window.location.pathname === '/profile' && isOwnProfile && (
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
        
        {/* Content Area - React Router will render child routes here */}
        <Outlet />
      </S.PageContainer>
    </S.ProfilePageContainer>
  );
};

export default ProfilePageWrapper;

