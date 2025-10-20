import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import LazyImage from '../../components/LazyImage';
import { useProfile } from './hooks/useProfile';
import { useProfileTracking } from '../../hooks/useProfileTracking';
import { bulgarianAuthService } from '../../firebase';
import { useProfileType } from '../../contexts/ProfileTypeContext'; // NEW: Profile Type Context
import type { ProfileType } from '../../contexts/ProfileTypeContext';  // ⚡ Type import
// NEW: Profile Type-Specific Components
import PrivateProfile from './components/PrivateProfile';
import DealerProfile from './components/DealerProfile';
import CompanyProfile from './components/CompanyProfile';
import {
  LEDProgressAvatar, 
  CoverImageUploader, 
  TrustBadge,
  ProfileGallery,
  VerificationPanel,
  ProfileCompletion,
  IDReferenceHelper,
  BusinessBackground,
  GarageSection,
  ProfileTypeConfirmModal  // ⚡ NEW: Confirmation Modal
} from '../../components/Profile';
import type { GarageCar } from '../../components/Profile';
import { TrustLevel } from '../../services/profile/trust-score-service';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase-config';
import { 
  RefreshCw, 
  User, 
  Building2, 
  AlertCircle, 
  Car, 
  Phone, 
  Home, 
  Settings as SettingsIcon,
  UserCircle,
  BarChart3,
  Shield,
  Download,
  UserPlus,
  UserCheck,
  Users,
  MessageCircle
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabButton, SyncButton, FollowButton } from './TabNavigation.styles';
import styled, { keyframes, css } from 'styled-components';
// Import new services - moved to top
import { googleProfileSyncService } from '../../services/google/google-profile-sync.service';
import { carAnalyticsService } from '../../services/analytics/car-analytics.service';
import { carDeleteService } from '../../services/garage/car-delete.service';
import { followService } from '../../services/social/follow.service';
import PrivacySettings from '../../components/Profile/Security/PrivacySettings';
import ProfileAnalyticsDashboard from '../../components/Profile/Analytics/ProfileAnalyticsDashboard';
import ProfileDashboard from '../../components/Profile/ProfileDashboard';
import VerificationBadge from '../../components/Profile/VerificationBadge';
import { useToast } from '../../components/Toast';

// ==================== ANIMATIONS ====================
// ⚡ OPTIMIZED: Simplified animations - run once on mount, not infinite

// Simple fade in (once on mount)
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Simple slide from left (once on mount)
const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translate3d(-20px, 0, 0);  /* ⚡ GPU accelerated */
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

// Tab fade in (for tab switching)
const tabFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(-10px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

// Profile image morph (gentle, runs once)
const profileImageMorph = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// ==================== STYLED COMPONENTS ====================

// Compact Header for non-Profile tabs
const CompactHeader = styled.div<{ $themeColor?: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, white 0%, #fafafa 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  ${css`animation: ${slideInFromLeft} 0.4s cubic-bezier(0.4, 0, 0.2, 1);`}
  border: 1px solid ${props => props.$themeColor ? `${props.$themeColor}1A` : 'rgba(255, 121, 0, 0.1)'};
  
  &:hover {
    box-shadow: 0 6px 16px ${props => props.$themeColor ? `${props.$themeColor}26` : 'rgba(255, 121, 0, 0.15)'};
    border-color: ${props => props.$themeColor ? `${props.$themeColor}4D` : 'rgba(255, 121, 0, 0.3)'};
  }
`;

const ProfileImageSmall = styled.img<{ $themeColor?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.$themeColor || '#FF7900'};
  box-shadow: 0 4px 12px ${props => props.$themeColor ? `${props.$themeColor}66` : 'rgba(255, 121, 0, 0.4)'};
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* ⚡ FIXED: Prevent flickering */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  
  &:hover {
    transform: translateZ(0) scale(1.05);  /* ⚡ Simplified hover */
    box-shadow: 0 6px 16px ${props => props.$themeColor ? `${props.$themeColor}99` : 'rgba(255, 121, 0, 0.5)'};
  }
`;

const UserInfo = styled.div`
  flex: 1;
  ${css`animation: ${fadeIn} 0.5s ease-out 0.2s both;`}
`;

const UserName = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #212529 0%, #495057 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UserEmail = styled.div`
  font-size: 0.7rem;
  color: #6c757d;
`;

const FullWidthContent = styled.div`
  width: 100%;
  /* ⚡ OPTIMIZED: Gentle fade in on mount */
  animation: ${tabFadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Smooth transitions */
  opacity: 1;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
`;

const AnimatedProfileGrid = styled(S.ProfileGrid)`
  /* ⚡ OPTIMIZED: Gentle fade in on mount */
  animation: ${tabFadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const AnimatedTabContent = styled.div`
  /* ⚡ OPTIMIZED: Quick fade for tab switching */
  animation: ${tabFadeIn} 0.4s ease-out;
`;

// Professional Icon Wrapper with shadow effects
const IconWrapper = styled.span<{ $color?: string; $size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || '#FF7900'};
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: all 0.2s ease;
  
  &:hover {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
    transform: translateY(-1px);
  }
  
  svg {
    width: ${props => props.$size || 18}px;
    height: ${props => props.$size || 18}px;
  }
`;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 🎨 NEW: Profile Type Context for Dynamic Theming
  const { profileType, theme, permissions, planTier } = useProfileType();

  // ✅ NEW: Read userId from URL to view another user's profile
  const targetUserId = searchParams.get('userId') || undefined;

  const {
    user,
    userCars,
    loading,
    editing,
    formData,
    isOwnProfile, // ✅ NEW: to determine if viewing own profile
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
    setEditing,
    setUser,
    loadUserCars
  } = useProfile(targetUserId); // ✅ Pass targetUserId

  // Read tab from URL or default to 'profile'
  const initialTab = (searchParams.get('tab') as 'profile' | 'myads' | 'analytics' | 'settings') || 'profile';
  const [activeTab, setActiveTab] = React.useState<'profile' | 'myads' | 'analytics' | 'settings'>(initialTab);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  // Smooth tab switching with fade effect
  const handleTabChange = (tab: 'profile' | 'myads' | 'analytics' | 'settings') => {
    if (tab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150); // Short fade out
  };
  
  // Update activeTab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'profile' | 'myads' | 'analytics' | 'settings';
    if (tabParam && ['profile', 'myads', 'analytics', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Track active field for ID helper
  const [activeField, setActiveField] = React.useState<string | undefined>(undefined);
  
  // Track account type switch warning
  const [showAccountTypeWarning, setShowAccountTypeWarning] = React.useState(false);
  
  // Google sync state
  const [syncing, setSyncing] = React.useState(false);
  
  // ⚡ NEW: Profile Type Confirmation Modal State
  const [showProfileTypeModal, setShowProfileTypeModal] = React.useState(false);
  const [pendingProfileType, setPendingProfileType] = React.useState<ProfileType | null>(null);
  
  // 🎯 Auto-track profile views (REAL ANALYTICS!)
  useProfileTracking(user?.uid);
  
  // Follow state
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followersCount, setFollowersCount] = React.useState(0);
  const [followLoading, setFollowLoading] = React.useState(false);
  
  // Load follow status when viewing another user's profile
  React.useEffect(() => {
    if (!isOwnProfile && user?.uid && targetUserId) {
      const loadFollowStatus = async () => {
        const currentUserAuth = await bulgarianAuthService.getCurrentUserProfile();
        if (currentUserAuth) {
          const following = await followService.isFollowing(currentUserAuth.uid, targetUserId);
          setIsFollowing(following);
        }
      };
      loadFollowStatus();
    }
  }, [isOwnProfile, user?.uid, targetUserId]);
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user?.uid || !targetUserId || followLoading) return;
    
    const currentUserAuth = await bulgarianAuthService.getCurrentUserProfile();
    if (!currentUserAuth) {
      toast.error(language === 'bg' ? 'Моля влезте' : 'Please sign in');
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(currentUserAuth.uid, targetUserId);
        setIsFollowing(false);
        toast.success(language === 'bg' ? 'Отписахте се' : 'Unfollowed');
      } else {
        await followService.followUser(currentUserAuth.uid, targetUserId);
        setIsFollowing(true);
        toast.success(language === 'bg' ? 'Последвахте' : 'Following');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error(language === 'bg' ? 'Грешка' : 'Error');
    } finally {
      setFollowLoading(false);
    }
  };
  
  // Handle account type change
  const handleAccountTypeChange = (newType: 'individual' | 'business') => {
    if (formData.accountType !== newType) {
      setShowAccountTypeWarning(true);
      setTimeout(() => setShowAccountTypeWarning(false), 5000);
    }
    handleInputChange({ 
      target: { name: 'accountType', value: newType } 
    } as React.ChangeEvent<HTMLInputElement>);
  };
  
  // ⚡ FIXED: Handle profile type confirmation
  const handleConfirmProfileType = async () => {
    // Get current Firebase Auth user
    const currentUser = auth.currentUser;
    
    if (!pendingProfileType || !currentUser?.uid) {
      console.error('❌ Cannot update profile type: missing data', { 
        pendingProfileType, 
        currentUser: currentUser?.uid,
        user: user?.uid 
      });
      toast.error(language === 'bg' ? 'Моля влезте в профила си' : 'Please login to your profile');
      return;
    }
    
    try {
      console.log('🔄 Updating profile type...', { uid: currentUser.uid, newType: pendingProfileType });
      
      // Update profileType in Firestore using currentUser.uid
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileType: pendingProfileType
      });
      
      console.log('✅ Profile type updated successfully');
      
      // Show success message based on type
      const messages = {
        private: { bg: 'Профилът е променен на личен', en: 'Profile changed to Private' },
        dealer: { bg: 'Профилът е променен на дилър', en: 'Profile changed to Dealer' },
        company: { bg: 'Профилът е променен на компания', en: 'Profile changed to Company' }
      };
      
      toast.success(messages[pendingProfileType][language as 'bg' | 'en']);
      
      // Close modal
      setShowProfileTypeModal(false);
      setPendingProfileType(null);
      
      // Reload page to apply theme changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile type:', error);
      toast.error(language === 'bg' ? 'Грешка при промяна на типа профил' : 'Error updating profile type');
    }
  };
  
  // ⚡ Handle profile type cancel
  const handleCancelProfileType = () => {
    setShowProfileTypeModal(false);
    setPendingProfileType(null);
  };
  
  // Handle Google profile sync
  const handleGoogleSync = async () => {
    if (!user) return;
    
    try {
      setSyncing(true);
      const currentUser = await import('../../firebase/firebase-config').then(m => m.auth.currentUser);
      if (currentUser) {
        await googleProfileSyncService.syncGoogleProfile(currentUser);
        toast.success(language === 'bg' ? 'Профилът е синхронизиран!' : 'Profile synced!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(language === 'bg' ? 'Грешка при синхронизация' : 'Sync error');
    } finally {
      setSyncing(false);
    }
  };
  
  // Handle car delete
  const handleDeleteCar = async (carId: string) => {
    if (!user) return;
    
    const confirm = window.confirm(
      language === 'bg' 
        ? 'Сигурни ли сте, че искате да изтриете тази кола? Това действие е необратимо!'
        : 'Are you sure you want to delete this car? This action is irreversible!'
    );
    
    if (!confirm) return;
    
    try {
      const result = await carDeleteService.deleteCar(carId, user.uid);
      
      if (result.success) {
        toast.success(result.message);
        loadUserCars?.(); // Reload cars
      } else {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          console.warn('Delete warnings:', result.errors);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(language === 'bg' ? 'Грешка при изтриване' : 'Delete error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <S.ProfileContainer>
        <S.PageContainer>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            {t('common.loading')}
          </div>
        </S.PageContainer>
      </S.ProfileContainer>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <S.ProfileContainer>
        <S.PageContainer>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            {t('profile.notLoggedIn')}
          </div>
        </S.PageContainer>
      </S.ProfileContainer>
    );
  }

  const isBusinessMode = user?.accountType === 'business' || formData.accountType === 'business';

  return (
    <>
    <S.ProfileContainer $isBusinessMode={isBusinessMode}>
      {/* Business Background - Only for Business Accounts */}
      <BusinessBackground isBusinessAccount={isBusinessMode} />
      
      <S.PageContainer>
        {/* Tab Navigation - 🎨 DYNAMIC Theme Colors */}
        <TabNavigation $themeColor={theme.primary}>
          <TabButton 
            $active={activeTab === 'profile'}
            $themeColor={theme.primary}
            onClick={() => handleTabChange('profile')}
          >
            <UserCircle size={18} />
            {language === 'bg' ? 'Профil' : 'Profile'}
          </TabButton>
          {isOwnProfile && (
            <>
              <TabButton 
                $active={activeTab === 'myads'}
                $themeColor={theme.primary}
                onClick={() => handleTabChange('myads')}
              >
                <Car size={18} />
                {language === 'bg' ? 'Моите обяви' : 'My Ads'}
              </TabButton>
              <TabButton 
                $active={activeTab === 'analytics'}
                $themeColor={theme.primary}
                onClick={() => handleTabChange('analytics')}
              >
                <BarChart3 size={18} />
                {language === 'bg' ? 'Статистика' : 'Analytics'}
              </TabButton>
              <TabButton 
                $active={activeTab === 'settings'}
                $themeColor={theme.primary}
                onClick={() => handleTabChange('settings')}
              >
                <Shield size={18} />
                {language === 'bg' ? 'Настройки' : 'Settings'}
              </TabButton>
            </>
          )}
        </TabNavigation>
        
        {/* Cover Image - Only show in Profile tab */}
        {activeTab === 'profile' && (
          <CoverImageUploader
          currentImageUrl={user.coverImage?.url}
          themeColor={theme.primary}
          onUploadSuccess={(url) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Cover uploaded:', url);
            }
          }}
          onUploadError={(error) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('Cover error:', error);
            }
          }}
        />
        )}

        {/* Compact Header for other tabs */}
        {activeTab !== 'profile' && (
          <CompactHeader $themeColor={theme.primary}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* ⚡ FIXED: Use proper size instead of scale() to prevent flickering */}
              <LEDProgressAvatar
                user={user}
                profileType={profileType}
                size={60}  // Direct size - no scaling!
                showProgress={false}  // Hide progress text in compact mode
              />
            </div>
            <UserInfo>
              <UserName>{user.displayName || t('profile.anonymous')}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
          </CompactHeader>
        )}

        {/* Profile Grid - Only for Profile tab */}
        {activeTab === 'profile' && !isTransitioning && (
          <AnimatedProfileGrid key="profile-tab">
            {/* Profile Sidebar - 🎨 DYNAMIC Theme Colors */}
            <S.ProfileSidebar $isBusinessMode={isBusinessMode} $themeColor={theme.primary}>
            {/* Profile Image with LED Progress Ring */}
            <div style={{ marginTop: '-80px', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <LEDProgressAvatar
                user={user}
                profileType={profileType}
                onClick={() => isOwnProfile && setEditing(true)}
              />
            </div>

            {/* User Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>
                {user.displayName || t('profile.anonymous')}
              </div>
              <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '10px' }}>
                {user.email}
              </div>
              
              {/* Profile Type Switcher - Only for own profile */}
              {isOwnProfile && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                    {language === 'bg' ? 'Тип профил' : 'Profile Type'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {/* ⚡ FIXED: Private Button - Now shows confirmation modal */}
                    <button
                      onClick={() => {
                        setPendingProfileType('private');
                        setShowProfileTypeModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        border: `2px solid ${profileType === 'private' ? '#FF8F10' : '#ddd'}`,
                        background: profileType === 'private' ? '#FF8F10' : 'white',
                        color: profileType === 'private' ? 'white' : '#666',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <User size={14} />
                      {language === 'bg' ? 'Личен' : 'Private'}
                    </button>
                    
                    {/* ⚡ FIXED: Dealer Button - Now shows confirmation modal */}
                    <button
                      onClick={() => {
                        setPendingProfileType('dealer');
                        setShowProfileTypeModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        border: `2px solid ${profileType === 'dealer' ? '#16a34a' : '#ddd'}`,
                        background: profileType === 'dealer' ? '#16a34a' : 'white',
                        color: profileType === 'dealer' ? 'white' : '#666',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Building2 size={14} />
                      {language === 'bg' ? 'Дилър' : 'Dealer'}
                    </button>
                    
                    {/* ⚡ FIXED: Company Button - Now shows confirmation modal */}
                    <button
                      onClick={() => {
                        setPendingProfileType('company');
                        setShowProfileTypeModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        border: `2px solid ${profileType === 'company' ? '#1d4ed8' : '#ddd'}`,
                        background: profileType === 'company' ? '#1d4ed8' : 'white',
                        color: profileType === 'company' ? 'white' : '#666',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Building2 size={14} />
                      {language === 'bg' ? 'Компания' : 'Company'}
                    </button>
                  </div>
                  
                  {/* ✨ NEW: Verification Badges */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '12px',
                    justifyContent: 'center'
                  }}>
                    <VerificationBadge 
                      type="email" 
                      status={user?.email ? 'verified' : 'unverified'} 
                      profileType={profileType}
                    />
                    <VerificationBadge 
                      type="phone" 
                      status={user?.phoneNumber ? 'verified' : 'unverified'} 
                      profileType={profileType}
                    />
                  </div>
                </div>
              )}
              
              {/* Seller Rating (for sellers only) */}
              {!isOwnProfile && user.accountType === 'business' && (
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <React.Suspense fallback={<div>...</div>}>
                    {(() => {
                      const RatingStars = React.lazy(() => import('../../components/Reviews/RatingStars'));
                      return <RatingStars rating={user.rating?.average || 0} totalReviews={user.rating?.total || 0} showText={true} />;
                    })()}
                  </React.Suspense>
                </div>
              )}
              
              {/* Followers/Following Count */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.75rem', color: '#666', marginBottom: '10px' }}>
                <div>
                  <strong>{user.stats?.followers || 0}</strong> {language === 'bg' ? 'Последователи' : 'Followers'}
                </div>
                <div>
                  <strong>{user.stats?.following || 0}</strong> {language === 'bg' ? 'Следва' : 'Following'}
                </div>
              </div>
              
              {/* Google Sync Button - Own profile only */}
              {isOwnProfile && user.email?.includes('gmail.com') && (
                <SyncButton onClick={handleGoogleSync} disabled={syncing}>
                  <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
                  {syncing 
                    ? (language === 'bg' ? 'Синхронизиране...' : 'Syncing...') 
                    : (language === 'bg' ? 'Синхронизирай от Google' : 'Sync from Google')}
                </SyncButton>
              )}
            </div>

            {/* Trust Badge */}
            <TrustBadge
              trustScore={user.verification?.trustScore || 10}
              level={user.verification?.level_old || TrustLevel.UNVERIFIED}
              badges={user.verification?.badges || []}
            />

            {/* Profile Completion */}
            <div style={{ marginTop: '20px' }}>
              <ProfileCompletion
                hasProfileImage={!!user.profileImage}
                hasCoverImage={!!user.coverImage}
                hasBio={!!user.bio}
                hasPhone={!!user.phoneNumber}
                hasLocation={!!user.location?.city}
                emailVerified={user.emailVerified || user.verification?.email?.verified || false}
                phoneVerified={user.verification?.phone?.verified || false}
                idVerified={user.verification?.identity?.verified || false}
              />
            </div>

            {/* Actions - 🎯 OPTIMIZED: Removed duplicates */}
            <S.ProfileActions>
              {isOwnProfile ? (
                <>
                  {/* Own Profile Actions */}
                  <S.ActionButton 
                    onClick={() => setEditing(!editing)}
                    data-action="edit-profile"
                    $themeColor={theme.primary}
                  >
                    {editing ? t('profile.cancelEdit') : t('profile.editProfile')}
                  </S.ActionButton>
                  <S.ActionButton variant="secondary" onClick={() => navigate('/users')} $themeColor={theme.primary}>
                    <Users size={18} />
                    {language === 'bg' ? 'Директория' : 'Browse Users'}
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={handleLogout}>
                    {t('profile.logout')}
                  </S.ActionButton>
                </>
              ) : (
                <>
                  {/* Viewing Another User's Profile */}
                  <S.ActionButton variant="primary" onClick={async () => {
                    if (!user?.uid || !targetUserId) return;
                    try {
                      // Import messaging service
                      const { default: messagingService } = await import('../../services/messaging/messaging.service');
                      // Create or get conversation
                      const conversationId = await messagingService.getOrCreateConversation(
                        user.uid,
                        targetUserId
                      );
                      // Navigate to messages page with this conversation
                      navigate(`/messages?conversation=${conversationId}`);
                    } catch (error) {
                      console.error('Error creating conversation:', error);
                      toast.error(language === 'bg' ? 'Грешка при създаване на разговор' : 'Error creating conversation');
                    }
                  }}>
                    <Phone size={18} />
                    {language === 'bg' ? 'Изпрати съобщение' : 'Send Message'}
                  </S.ActionButton>
                  <FollowButton 
                    $following={isFollowing}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {isFollowing 
                      ? (language === 'bg' ? 'Последван' : 'Following')
                      : (language === 'bg' ? 'Последвай' : 'Follow')
                    }
                  </FollowButton>
                  <S.ActionButton variant="secondary" onClick={() => navigate('/users')}>
                    <Users size={18} />
                    {language === 'bg' ? 'Обратно към директорията' : 'Back to Directory'}
                  </S.ActionButton>
                  <S.ActionButton variant="secondary" onClick={() => {
                    // Scroll to reviews section
                    const reviewsSection = document.querySelector('[data-section="reviews"]');
                    if (reviewsSection) {
                      reviewsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}>
                    <MessageCircle size={18} />
                    {language === 'bg' ? 'Напиши отзив' : 'Write Review'}
                  </S.ActionButton>
                  <S.ActionButton variant="secondary" onClick={() => navigate('/')}>
                    <Home size={18} />
                    {language === 'bg' ? 'Начало' : 'Home'}
                  </S.ActionButton>
                </>
              )}
            </S.ProfileActions>
          </S.ProfileSidebar>

          {/* Profile Content */}
          <S.ProfileContent>
            {/* 🎯 UNIFIED: ProfileDashboard shows completion + stats + actions */}
            {isOwnProfile && (
              <S.ContentSection $themeColor={theme.primary} $isBusinessMode={isBusinessMode}>
                <ProfileDashboard />
              </S.ContentSection>
            )}
            
            {/* Contact Information - For other users (sellers) */}
            {!isOwnProfile && user?.accountType === 'business' && (
              <S.ContentSection $themeColor={theme.primary}>
                <S.SectionHeader>
                  <h2>{language === 'bg' ? 'Информация за контакт' : 'Contact Information'}</h2>
                </S.SectionHeader>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {user.businessPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <Phone size={16} color={theme.primary} />
                      <a href={`tel:${user.businessPhone}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>
                        {user.businessPhone}
                      </a>
                    </div>
                  )}
                  {user.businessEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <MessageCircle size={16} color={theme.primary} />
                      <a href={`mailto:${user.businessEmail}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>
                        {user.businessEmail}
                      </a>
                    </div>
                  )}
                  {user.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <Building2 size={16} color={theme.primary} />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: '500' }}>
                        {user.website}
                      </a>
                    </div>
                  )}
                  {user.businessAddress && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <Home size={16} color={theme.primary} />
                      <span style={{ color: '#1a1a1a', fontWeight: '500' }}>
                        {user.businessAddress}, {user.businessCity}
                      </span>
                    </div>
                  )}
                </div>
              </S.ContentSection>
            )}

            {/* Personal Information */}
            <S.ContentSection $themeColor={theme.primary} $isBusinessMode={isBusinessMode}>
              <S.SectionHeader>
                <h2>{t('profile.personalInfo')}</h2>
                {!editing && isOwnProfile && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    {t('profile.edit')}
                  </button>
                )}
              </S.SectionHeader>

              {editing && isOwnProfile ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  {/* Account Type Selector */}
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconWrapper $color="#666" $size={16}><RefreshCw /></IconWrapper>
                      {language === 'bg' ? 'Тип на акаунта' : 'Account Type'}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: showAccountTypeWarning ? '12px' : '0' }}>
                      <button
                        type="button"
                        onClick={() => handleAccountTypeChange('individual')}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          border: `2px solid ${formData.accountType === 'individual' ? theme.primary : '#ddd'}`,
                          background: formData.accountType === 'individual' ? `${theme.primary}10` : 'white',
                          color: formData.accountType === 'individual' ? theme.primary : '#666',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <User size={18} />
                        {language === 'bg' ? 'Личен' : 'Individual'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAccountTypeChange('business')}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          border: `2px solid ${formData.accountType === 'business' ? theme.primary : '#ddd'}`,
                          background: formData.accountType === 'business' ? `${theme.primary}10` : 'white',
                          color: formData.accountType === 'business' ? theme.primary : '#666',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Building2 size={18} />
                        {language === 'bg' ? 'Бизнес' : 'Business'}
                      </button>
                    </div>
                    {showAccountTypeWarning && (
                      <div style={{ 
                        padding: '8px 12px', 
                        background: '#fff3cd', 
                        border: '1px solid #ffc107', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#856404',
                        animation: 'fadeIn 0.3s ease-in',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>
                          {language === 'bg' 
                            ? 'За бизнес акаунт трябва да предоставите валидна информация за фирмата съгласно българското законодателство.'
                            : 'For a business account, you must provide valid company information according to Bulgarian legislation.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Required Fields */}
                  <div style={{ marginBottom: '12px', padding: '10px', background: `${theme.primary}10`, borderRadius: '6px', border: `2px solid ${theme.primary}` }}>
                    <h4 style={{ margin: '0 0 8px 0', color: theme.primary, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                      <IconWrapper $color={theme.primary} $size={16}><AlertCircle /></IconWrapper>
                      {language === 'bg' ? 'Задължителни полета' : 'Required Fields'}
                    </h4>
                    
                    {formData.accountType === 'individual' ? (
                      <S.FormGrid>
                        <S.FormGroup>
                          <label style={{ color: theme.primary, fontWeight: 'bold' }}>
                            {language === 'bg' ? 'Име' : 'First Name'} <span style={{ color: '#f44336' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('firstName')}
                            onBlur={() => setActiveField(undefined)}
                            placeholder="СЛАВИНА"
                            required
                            style={{ borderColor: theme.primary, borderWidth: '2px' }}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label style={{ color: theme.primary, fontWeight: 'bold' }}>
                            {language === 'bg' ? 'Фамилия' : 'Last Name'} <span style={{ color: '#f44336' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('lastName')}
                            onBlur={() => setActiveField(undefined)}
                            placeholder="ИВАНОВА"
                            required
                            style={{ borderColor: theme.primary, borderWidth: '2px' }}
                          />
                        </S.FormGroup>
                      </S.FormGrid>
                    ) : (
                      <S.FormGroup>
                        <label style={{ color: theme.primary, fontWeight: 'bold' }}>
                          {language === 'bg' ? 'Име на фирмата' : 'Business Name'} <span style={{ color: '#f44336' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' ? 'Автомобили България ЕООД' : 'Cars Bulgaria Ltd'}
                          required
                          style={{ borderColor: '#FF7900', borderWidth: '2px' }}
                        />
                      </S.FormGroup>
                    )}
                  </div>

                  {/* Business Information - Only for Business Accounts */}
                  {formData.accountType === 'business' && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconWrapper $color="#666" $size={14}><Building2 /></IconWrapper>
                        {language === 'bg' ? 'Информация за фирмата' : 'Business Information'}
                      </h4>
                      <S.FormGrid>
                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Тип на бизнеса' : 'Business Type'} <span style={{ color: '#f44336' }}>*</span></label>
                          <select 
                            name="businessType" 
                            value={formData.businessType} 
                            onChange={handleInputChange}
                            required
                            style={{ borderColor: '#FF7900' }}
                          >
                            <option value="dealership">🏢 {language === 'bg' ? 'Автосалон / Дилър' : 'Car Dealership'}</option>
                            <option value="trader">🤝 {language === 'bg' ? 'Търговец' : 'Trader'}</option>
                            <option value="company">🏭 {language === 'bg' ? 'Компания' : 'Company'}</option>
                          </select>
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'БУЛСТАТ / ЕИК' : 'Bulstat / UIC'}</label>
                          <input
                            type="text"
                            name="bulstat"
                            value={formData.bulstat}
                            onChange={handleInputChange}
                            placeholder="123456789"
                            maxLength={13}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'ДДС номер' : 'VAT Number'}</label>
                          <input
                            type="text"
                            name="vatNumber"
                            value={formData.vatNumber}
                            onChange={handleInputChange}
                            placeholder="BG123456789"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Търговски регистър' : 'Registration Number'}</label>
                          <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            placeholder="20XXXXXXXX"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Уебсайт' : 'Website'}</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Телефон на фирмата' : 'Business Phone'}</label>
                          <input
                            type="tel"
                            name="businessPhone"
                            value={formData.businessPhone}
                            onChange={handleInputChange}
                            placeholder="+359 2 XXX XXXX"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Имейл на фирмата' : 'Business Email'}</label>
                          <input
                            type="email"
                            name="businessEmail"
                            value={formData.businessEmail}
                            onChange={handleInputChange}
                            placeholder="info@company.bg"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Работно време' : 'Working Hours'}</label>
                          <input
                            type="text"
                            name="workingHours"
                            value={formData.workingHours}
                            onChange={handleInputChange}
                            placeholder={language === 'bg' ? 'Пон-Пет: 9:00-18:00' : 'Mon-Fri: 9:00-18:00'}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Град' : 'City'}</label>
                          <input
                            type="text"
                            name="businessCity"
                            value={formData.businessCity}
                            onChange={handleInputChange}
                            placeholder={language === 'bg' ? 'София' : 'Sofia'}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</label>
                          <input
                            type="text"
                            name="businessPostalCode"
                            value={formData.businessPostalCode}
                            onChange={handleInputChange}
                            placeholder="1000"
                          />
                        </S.FormGroup>
                      </S.FormGrid>

                      <S.FormGroup style={{ marginTop: '8px' }}>
                        <label>{language === 'bg' ? 'Адрес на фирмата' : 'Business Address'}</label>
                        <input
                          type="text"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' ? 'бул. Цариградско шосе 100' : 'Tsarigradsko Shose Blvd 100'}
                        />
                      </S.FormGroup>

                      <S.FormGroup style={{ marginTop: '8px' }}>
                        <label>{language === 'bg' ? 'Описание на бизнеса' : 'Business Description'}</label>
                        <textarea
                          name="businessDescription"
                          value={formData.businessDescription}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' 
                            ? 'Опишете вашия бизнес, услуги и специализация...'
                            : 'Describe your business, services and specialization...'}
                          rows={3}
                        />
                      </S.FormGroup>
                    </div>
                  )}

                  {/* Personal Information from ID - Only for Individual */}
                  {formData.accountType === 'individual' && (
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><UserCircle /></IconWrapper>
                      {language === 'bg' ? 'Лична информация (от лична карта)' : 'Personal Information (from ID card)'}
                    </h4>
                  <S.FormGrid>
                    <S.FormGroup>
                        <label>{language === 'bg' ? 'Презиме (Бащино име)' : 'Middle Name (Father\'s Name)'}</label>
                      <input
                        type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('middleName')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="ГЕОРГИЕВА"
                        />
                      </S.FormGroup>

                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Дата на раждане' : 'Date of Birth'}</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                        onChange={handleInputChange}
                          onFocus={() => setActiveField('dateOfBirth')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="01.08.1995"
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                        <label>{language === 'bg' ? 'Място на раждане' : 'Place of Birth'}</label>
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('birthPlace')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="СОФИЯ/SOFIA"
                        />
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>
                  )}

                  {/* Contact Information */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Phone /></IconWrapper>
                      {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                    </h4>
                    <S.FormGrid>
                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Телефон' : 'Phone Number'}</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+359 88 123 4567"
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                        <label>{language === 'bg' ? 'Имейл' : 'Email'}</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@email.com"
                          disabled
                          style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
                        />
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>

                  {/* Address Information */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Home /></IconWrapper>
                      {language === 'bg' ? 'Адресна информация' : 'Address Information'}
                    </h4>
                    <S.FormGrid>
                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Град' : 'City'}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                          onFocus={() => setActiveField('city')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="СОФИЯ/SOFIA"
                      />
                    </S.FormGroup>

                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="1000"
                        />
                      </S.FormGroup>
                    </S.FormGrid>

                    <S.FormGroup>
                      <label>{language === 'bg' ? 'Постоянен адрес' : 'Permanent Address'}</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField('address')}
                        onBlur={() => setActiveField(undefined)}
                        placeholder="бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 ет.5 ап.26"
                      />
                    </S.FormGroup>
                  </div>

                  {/* Other */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><SettingsIcon /></IconWrapper>
                      {language === 'bg' ? 'Други настройки' : 'Other Settings'}
                    </h4>
                    <S.FormGroup>
                      <label>{language === 'bg' ? 'Предпочитан език' : 'Preferred Language'}</label>
                      <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange}>
                        <option value="bg">🇧🇬 {t('languages.bulgarian')}</option>
                        <option value="en">🇬🇧 {t('languages.english')}</option>
                      </select>
                    </S.FormGroup>
                  </div>

                  <S.FormGroup>
                    <label>{t('profile.bio')}</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder={t('profile.bioPlaceholder')}
                      rows={4}
                    />
                  </S.FormGroup>

                  <S.FormActions>
                    <S.CancelButton type="button" onClick={handleCancelEdit}>
                      {t('common.cancel')}
                    </S.CancelButton>
                    <S.SaveButton type="submit">
                      {t('profile.saveChanges')}
                    </S.SaveButton>
                  </S.FormActions>
                </form>
              ) : (
                <div>
                  {/* Personal Info */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid rgba(255, 143, 16, 0.3)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8F10', fontWeight: '700' }}>
                      <IconWrapper $color="#FF8F10" $size={18}><UserCircle /></IconWrapper>
                      {language === 'bg' ? 'Лична информация' : 'Personal Information'}
                    </h4>
                    <S.NeumorphicInfoGrid>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Име' : 'First Name'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.firstName || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Презиме' : 'Middle Name'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.middleName || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Фамилия' : 'Last Name'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.lastName || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Дата на раждане' : 'Date of Birth'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('bg-BG') : t('profile.notSet')}
                          </S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Място на раждане' : 'Place of Birth'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.placeOfBirth || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                    </S.NeumorphicInfoGrid>
                  </div>


                  {/* Contact */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid rgba(255, 143, 16, 0.3)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8F10', fontWeight: '700' }}>
                      <IconWrapper $color="#FF8F10" $size={18}><Phone /></IconWrapper>
                      {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                    </h4>
                    <S.NeumorphicInfoGrid>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Телефон' : 'Phone'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.phoneNumber || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Имейл' : 'Email'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.email || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                    </S.NeumorphicInfoGrid>
                  </div>

                  {/* Address */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid rgba(255, 143, 16, 0.3)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8F10', fontWeight: '700' }}>
                      <IconWrapper $color="#FF8F10" $size={18}><Home /></IconWrapper>
                      {language === 'bg' ? 'Адресна информация' : 'Address Information'}
                    </h4>
                    <S.NeumorphicInfoGrid>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Град' : 'City'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.location?.city || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.postalCode || t('profile.notSet')}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                    </S.NeumorphicInfoGrid>
                    {user.address && (
                      <S.NeumorphicFieldWrapper style={{ marginTop: '16px' }}>
                        <S.NeumorphicFieldLabel>{language === 'bg' ? 'Адрес' : 'Address'}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>{user.address}</S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                    )}
                  </div>

                  {/* Other */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid rgba(255, 143, 16, 0.3)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FF8F10', fontWeight: '700' }}>
                      <IconWrapper $color="#FF8F10" $size={18}><SettingsIcon /></IconWrapper>
                      {language === 'bg' ? 'Други' : 'Other'}
                    </h4>
                    <S.NeumorphicInfoGrid>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{t('profile.preferredLanguage')}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>
                            {user.preferredLanguage === 'bg' ? '🇧🇬 ' + t('languages.bulgarian') : '🇬🇧 ' + t('languages.english')}
                          </S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                      <S.NeumorphicFieldWrapper>
                        <S.NeumorphicFieldLabel>{t('profile.memberSince')}</S.NeumorphicFieldLabel>
                        <S.NeumorphicInfoField>
                          <S.NeumorphicFieldValue>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bg-BG') : t('profile.notSet')}
                          </S.NeumorphicFieldValue>
                        </S.NeumorphicInfoField>
                      </S.NeumorphicFieldWrapper>
                    </S.NeumorphicInfoGrid>
                  </div>

                  {user.bio && (
                    <div style={{ marginTop: '2rem' }}>
                      <strong>{t('profile.bio')}:</strong>
                      <p style={{ marginTop: '0.5rem', color: '#666' }}>{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </S.ContentSection>

            {/* Verification Panel */}
            <S.ContentSection $themeColor={theme.primary}>
              <VerificationPanel
                emailVerified={user.emailVerified || user.verification?.email?.verified || false}
                phoneVerified={user.verification?.phone?.verified || false}
                idVerified={user.verification?.identity?.verified || false}
                businessVerified={user.verification?.business?.verified || false}
                themeColor={theme.primary}
              />
            </S.ContentSection>

            {/* Photo Gallery */}
            {isOwnProfile && (
              <S.ContentSection $themeColor={theme.primary}>
                <ProfileGallery
                  userId={user.uid}
                  images={(user.gallery || []).map(img => typeof img === 'string' ? img : img.url)}
                  maxImages={9}
                  onUpdate={async (images) => {
                    try {
                      const galleryData = images.map(url => ({
                        url,
                        uploadedAt: new Date(),
                        caption: ''
                      }));
                      await updateDoc(doc(db, 'users', user.uid), {
                        gallery: galleryData
                      });
                      // Update local user state
                      setUser(prev => prev ? { ...prev, gallery: galleryData } : null);
                      if (process.env.NODE_ENV === 'development') {
                        console.log('✅ Gallery updated and saved');
                      }
                    } catch (error) {
                      if (process.env.NODE_ENV === 'development') {
                      console.error('❌ Failed to save gallery:', error);
                    }
                  }
                }}
              />
            </S.ContentSection>
            )}
            
            {/* User's Cars - For other users (sellers) */}
            {!isOwnProfile && user?.uid && user.accountType === 'business' && userCars && userCars.length > 0 && (
              <S.ContentSection $themeColor={theme.primary}>
                <S.SectionHeader>
                  <h2>{language === 'bg' ? 'Активни обяви' : 'Active Listings'}</h2>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {userCars.length} {language === 'bg' ? 'автомобила' : 'cars'}
                  </span>
                </S.SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {userCars.slice(0, 6).map(car => (
                    <div 
                      key={car.id}
                      onClick={() => navigate(`/car/${car.id}`)}
                      style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid #e0e0e0',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img 
                        src={car.imageUrl || car.mainImage || '/placeholder-car.jpg'} 
                        alt={car.title}
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.95rem' }}>
                          {car.make} {car.model}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '8px' }}>
                          {car.year} • {car.mileage?.toLocaleString()} km
                        </div>
                        <div style={{ color: '#FF7900', fontWeight: '700', fontSize: '1.1rem' }}>
                          {car.price?.toLocaleString()} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </S.ContentSection>
            )}
            
            {/* Reviews Section - For other users only */}
            {!isOwnProfile && user?.uid && (
              <S.ContentSection $themeColor={theme.primary} data-section="reviews">
                <S.SectionHeader>
                  <h2>{language === 'bg' ? 'Отзиви' : 'Reviews'}</h2>
                </S.SectionHeader>
                
                {/* Write Review Form - If viewing a seller */}
                {user.accountType === 'business' && (
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {(() => {
                      const ReviewComposer = React.lazy(() => import('../../components/Reviews/ReviewComposer'));
                      return <ReviewComposer 
                        carId="general" 
                        sellerId={user.uid} 
                        onReviewSubmitted={() => {
                          toast.success(language === 'bg' ? 'Благодаря за отзива!' : 'Thank you for your review!');
                        }}
                      />;
                    })()}
                  </React.Suspense>
                )}
                
                {/* Reviews List */}
                <React.Suspense fallback={<div>Loading reviews...</div>}>
                  {(() => {
                    const ReviewsList = React.lazy(() => import('../../components/Reviews/ReviewsList'));
                    return <ReviewsList sellerId={user.uid} />;
                  })()}
                </React.Suspense>
              </S.ContentSection>
            )}
          </S.ProfileContent>
        </AnimatedProfileGrid>
        )}

        {/* Content for other tabs - Full width without sidebar */}
        {activeTab !== 'profile' && !isTransitioning && (
          <FullWidthContent key={`tab-${activeTab}`}>
            {activeTab === 'myads' && (
              <AnimatedTabContent>
                <GarageSection
                  cars={((userCars || []) as any[]).map(car => ({
                    ...car,
                    currency: 'EUR' as const,
                    createdAt: car.createdAt || new Date(),
                    title: car.title || `${car.make} ${car.model}`
                  }))}
                  onEdit={(carId) => navigate(`/car/${carId}?edit=true`)}
                  onDelete={(carId) => {
                    if (window.confirm(language === 'bg' ? 'Сигурни ли сте?' : 'Are you sure?')) {
                      loadUserCars?.();
                    }
                  }}
                  onAddNew={() => navigate('/sell')}
                />
              </AnimatedTabContent>
            )}

            {activeTab === 'analytics' && (
              <AnimatedTabContent>
                <ProfileAnalyticsDashboard userId={user.uid} />
              </AnimatedTabContent>
            )}

            {activeTab === 'settings' && (
              <AnimatedTabContent>
                <PrivacySettings userId={user.uid} />
              </AnimatedTabContent>
            )}
          </FullWidthContent>
        )}

        {/* ID Reference Helper - shows when editing & individual account */}
        {editing && (user?.accountType !== 'business' && formData.accountType === 'individual') && (
          <IDReferenceHelper 
            activeField={activeField}
          />
        )}
      </S.PageContainer>
    </S.ProfileContainer>
    
    {/* ⚡ NEW: Profile Type Confirmation Modal */}
    {pendingProfileType && (
      <ProfileTypeConfirmModal
        isOpen={showProfileTypeModal}
        profileType={pendingProfileType}
        onConfirm={handleConfirmProfileType}
        onCancel={handleCancelProfileType}
      />
    )}
    </>
  );
};

export default ProfilePage;
