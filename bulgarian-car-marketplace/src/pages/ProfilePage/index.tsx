import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import LazyImage from '../../components/LazyImage';
import { useProfile } from './hooks/useProfile';
import { useProfileTracking } from '../../hooks/useProfileTracking';
import { bulgarianAuthService } from '../../firebase';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import type { ProfileType } from '../../contexts/ProfileTypeContext';
import { logger } from '../../services/logger-service';
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
// Import Campaigns Components
import { CampaignsList } from '../../components/Profile/Campaigns';
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
  MessageCircle,
  Megaphone,
  ArrowDown
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabButton, TabNavLink, SyncButton, FollowButton } from './TabNavigation.styles';
import styled, { keyframes, css } from 'styled-components';
// Import new services - moved to top
import { googleProfileSyncService } from '../../services/google/google-profile-sync.service';
import { carAnalyticsService } from '../../services/analytics/car-analytics.service';
import { carDeleteService } from '../../services/garage/car-delete.service';
import { followService } from '../../services/social/follow.service';
import PrivacySettings from '../../components/Profile/Security/PrivacySettings';
import DealershipInfoForm from '../../components/Profile/Dealership/DealershipInfoForm';
import PrivacySettingsManager from '../../components/Profile/Privacy/PrivacySettingsManager';
import ProfileAnalyticsDashboard from '../../components/Profile/Analytics/ProfileAnalyticsDashboard';
import ProfileDashboard from '../../components/Profile/ProfileDashboard';
import VerificationBadge from '../../components/Profile/VerificationBadge';
import ConsultationsTab from './ConsultationsTab';
import { useToast } from '../../components/Toast';
import ProfileImageUploader from '../../components/Profile/ProfileImageUploader';
import CommunityFeedWidget from '../../components/Profile/CommunityFeedWidget';
import SocialMediaSettings from '../../components/Profile/SocialMedia/SocialMediaSettings';

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

// Highlight pulse animation (for scrolling to section)
const highlightPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 165, 0, 0);
    background: transparent;
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 165, 0, 0.3);
    background: rgba(255, 165, 0, 0.1);
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

// Add global style for highlight-pulse animation
const GlobalStyle = styled.div`
  .highlight-pulse {
    animation: ${highlightPulse} 2s ease-in-out;
    border-radius: 12px;
    transition: all 0.3s ease;
  }
`;

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

// Quick Action Buttons
const QuickActionsContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-left: 8px;
  
  @media (max-width: 768px) {
    margin-left: 0;
    gap: 4px;
    flex-wrap: wrap;
  }
`;

const QuickActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1.5px solid ${props => {
    if (props.$variant === 'success') return '#16a34a';
    if (props.$variant === 'primary') return '#3b82f6';
    return '#9ca3af';
  }};
  background: ${props => {
    if (props.$variant === 'success') return 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
    if (props.$variant === 'primary') return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    return 'white';
  }};
  color: ${props => props.$variant ? 'white' : '#4b5563'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  min-width: auto;
  
  svg {
    flex-shrink: 0;
    width: 13px;
    height: 13px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${props => {
      if (props.$variant === 'success') return 'rgba(22, 163, 74, 0.25)';
      if (props.$variant === 'primary') return 'rgba(59, 130, 246, 0.25)';
      return 'rgba(0, 0, 0, 0.08)';
    }};
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.75rem;
    gap: 4px;
  }
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

  // Get current location to check active route
  const location = useLocation();
  
  // Check if we're on the main profile page (for cover image display)
  const isMainProfilePage = location.pathname === '/profile' || location.pathname === '/profile/';
  
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
      logger.error('Follow error', error as Error, { targetUserId });
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
      logger.error('Cannot update profile type: missing data', new Error('Missing profile type or user'), { 
        pendingProfileType, 
        currentUserId: currentUser?.uid,
        userId: user?.uid 
      });
      toast.error(language === 'bg' ? 'Моля влезте в профила си' : 'Please login to your profile');
      return;
    }
    
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Updating profile type', { uid: currentUser.uid, newType: pendingProfileType });
      }
      
      // Update profileType in Firestore using currentUser.uid
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileType: pendingProfileType
      });
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Profile type updated successfully');
      }
      
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
      logger.error('Error updating profile type', error as Error, { 
        userId: currentUser.uid, 
        pendingProfileType 
      });
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
      logger.error('Sync error', error as Error);
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
          logger.warn('Delete warnings', { errors: result.errors, carId });
        }
      }
    } catch (error) {
      logger.error('Delete error', error as Error, { carId, userId: user.uid });
      toast.error(language === 'bg' ? 'Грешка при изтриване' : 'Delete error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <S.ProfilePageContainer>
        <S.PageContainer>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            {t('common.loading')}
          </div>
        </S.PageContainer>
      </S.ProfilePageContainer>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <S.ProfilePageContainer>
        <S.PageContainer>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            {t('profile.notLoggedIn')}
          </div>
        </S.PageContainer>
      </S.ProfilePageContainer>
    );
  }

  const isBusinessMode = user?.accountType === 'business' || formData.accountType === 'business';

  return (
    <>
    <S.ProfilePageContainer $isBusinessMode={isBusinessMode}>
      {/* Business Background - Only for Business Accounts */}
      <BusinessBackground isBusinessAccount={isBusinessMode} />
      
      <S.PageContainer>
        {/* Tab Navigation - 🎨 DYNAMIC Theme Colors with React Router NavLinks */}
        <TabNavigation $themeColor={theme.primary}>
          <TabNavLink 
            to="/profile"
            end
            $themeColor={theme.primary}
          >
            <UserCircle size={16} />
            {language === 'bg' ? 'Профил' : 'Profile'}
          </TabNavLink>
          {isOwnProfile && (
            <>
              <TabNavLink 
                to="/profile/my-ads"
                $themeColor={theme.primary}
              >
                <Car size={16} />
                {language === 'bg' ? 'Моите обяви' : 'My Ads'}
              </TabNavLink>
              <TabNavLink 
                to="/profile/campaigns"
                $themeColor={theme.primary}
              >
                <Megaphone size={16} />
                {language === 'bg' ? 'Реклами' : 'Campaigns'}
              </TabNavLink>
              <TabNavLink 
                to="/profile/analytics"
                $themeColor={theme.primary}
              >
                <BarChart3 size={16} />
                {language === 'bg' ? 'Статистика' : 'Analytics'}
              </TabNavLink>
              <TabNavLink 
                to="/profile/settings"
                $themeColor={theme.primary}
              >
                <Shield size={16} />
                {language === 'bg' ? 'Настройки' : 'Settings'}
              </TabNavLink>
              <TabNavLink 
                to="/profile/consultations"
                $themeColor={theme.primary}
              >
                <MessageCircle size={18} />
                {language === 'bg' ? 'Консултации' : 'Consultations'}
              </TabNavLink>
            </>
          )}
        </TabNavigation>
        
        {/* Cover Image - 🔒 SECURITY: Only editable for own profile */}
        {isMainProfilePage && isOwnProfile && (
          <CoverImageUploader
          currentImageUrl={user.coverImage?.url}
          themeColor={theme.primary}
          onUploadSuccess={(url) => {
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Cover uploaded', { url });
            }
            // Update user state
            setUser(prev => prev ? { 
              ...prev, 
              coverImage: { url, uploadedAt: new Date() } 
            } : null);
          }}
          onUploadError={(error) => {
            logger.error('Cover error', error as Error);
          }}
        />
        )}
        
        {/* Cover Image Display - 🔒 SECURITY: Read-only for viewing others */}
        {activeTab === 'profile' && !isOwnProfile && user.coverImage?.url && (
          <div style={{
            width: '100%',
            height: '300px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '60px',
            backgroundImage: `url(${user.coverImage.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: `2px solid ${theme.primary}4D`,
            boxShadow: `0 8px 28px ${theme.primary}33`
          }} />
        )}
        
        {/* ❌ REMOVED: Quick Actions buttons (Add Listing, Edit Profile, Settings) per user request */}

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
            {/* User Info ABOVE Profile Image */}
            <div style={{ textAlign: 'center', marginBottom: '12px', marginTop: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>
                {user.displayName || t('profile.anonymous')}
              </div>
              <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '10px' }}>
                {user.email}
              </div>
                  </div>
            {/* Profile Image Uploader (no ring) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <ProfileImageUploader
                currentImageUrl={user?.profileImage?.url}
                onUploadSuccess={() => window.location.reload()}
                onUploadError={(err) => alert(err)}
              />
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
                    ? (language === 'bg' ? 'Синхронизацияне...' : 'Syncing...') 
                    : (language === 'bg' ? 'Синхронизирай от Google' : 'Sync from Google')}
                </SyncButton>
            )}

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

            {/* Actions - 🎯 OPTIMIZED: Removed Edit Profile duplicate, kept essential actions */}
            <S.ProfileActions>
              {isOwnProfile ? (
                <>
                  {/* Own Profile Actions - Edit Profile removed as it's now in Quick Actions */}
                  <S.ActionButton $variant="secondary" onClick={() => navigate('/users')} $themeColor={theme.primary}>
                    <Users size={18} />
                    {language === 'bg' ? 'Директория' : 'Browse Users'}
                  </S.ActionButton>
                  
                  {/* Social Media Links */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}>
                      {language === 'bg' ? 'Последвайте ни' : 'Follow Us'}
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px'
                    }}>
                      {/* Instagram */}
                      <a
                        href="https://www.instagram.com/globulnet/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(131, 58, 180, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(131, 58, 180, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(131, 58, 180, 0.3)';
                        }}
                        title="Instagram @globulnet"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      
                      {/* TikTok */}
                      <a
                        href="https://www.tiktok.com/@globulnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: '#000000',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        title="TikTok @globulnet"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </a>
                      
                      {/* Facebook */}
                      <a
                        href="https://www.facebook.com/profile.php?id=109254638332601"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: '#1877F2',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 119, 242, 0.3)';
                        }}
                        title="Facebook"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                      
                      {/* Twitter/X */}
                      <a
                        href="https://twitter.com/globulnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: '#000000',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        title="X (Twitter)"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                      
                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/company/globulnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: '#0A66C2',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(10, 102, 194, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 102, 194, 0.3)';
                        }}
                        title="LinkedIn"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      
                      {/* YouTube */}
                      <a
                        href="https://www.youtube.com/@globulnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          background: '#FF0000',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(255, 0, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 0, 0, 0.3)';
                        }}
                        title="YouTube"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <S.ActionButton $variant="danger" onClick={handleLogout}>
                    {t('profile.logout')}
                  </S.ActionButton>
                </>
              ) : (
                <>
                  {/* Viewing Another User's Profile */}
                  <S.ActionButton $variant="primary" onClick={async () => {
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
                      logger.error('Error creating conversation', error as Error, { 
                        userId: user?.uid, 
                        targetUserId 
                      });
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
                  <S.ActionButton $variant="secondary" onClick={() => navigate('/users')}>
                    <Users size={18} />
                    {language === 'bg' ? 'Обратно към директорията' : 'Back to Directory'}
                  </S.ActionButton>
                  <S.ActionButton $variant="secondary" onClick={() => {
                    // Scroll to reviews section
                    const reviewsSection = document.querySelector('[data-section="reviews"]');
                    if (reviewsSection) {
                      reviewsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}>
                    <MessageCircle size={18} />
                    {language === 'bg' ? 'Напиши отзив' : 'Write Review'}
                  </S.ActionButton>
                  <S.ActionButton $variant="secondary" onClick={() => navigate('/')}>
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
            
            {/* Community Feed Widget - Latest Posts */}
            {isOwnProfile && (
              <div style={{ marginTop: '24px' }}>
                <CommunityFeedWidget userId={user.uid} />
              </div>
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
                        logger.debug('Gallery updated and saved');
                      }
                    } catch (error) {
                      logger.error('Failed to save gallery', error as Error, { userId: user.uid });
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
                {/* 🔒 SECURITY: My Ads only accessible for own profile */}
                {isOwnProfile ? (
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
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                  background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(200, 35, 51, 0.10) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(220, 53, 69, 0.3)'
                }}>
                  <Car size={64} color="#dc3545" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '12px' }}>
                      {language === 'bg' ? '🔒 Достъп отказан' : '🔒 Access Denied'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                      {language === 'bg' 
                        ? 'Не можете да видите обявите на друг потребител' 
                        : 'You cannot view another user\'s listings'}
                    </p>
                  </div>
                )}
              </AnimatedTabContent>
            )}

            {activeTab === 'campaigns' && (
              <AnimatedTabContent>
                {/* 🔒 SECURITY: Campaigns only accessible for own profile */}
                {isOwnProfile ? (
                  <CampaignsList userId={user.uid} />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(200, 35, 51, 0.10) 100%)',
                    borderRadius: '16px',
                    border: '2px solid rgba(220, 53, 69, 0.3)'
                  }}>
                    <BarChart3 size={64} color="#dc3545" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '12px' }}>
                      {language === 'bg' ? '🔒 Достъп отказан' : '🔒 Access Denied'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                      {language === 'bg' 
                        ? 'Не можете да видите рекламите на друг потребител' 
                        : 'You cannot view another user\'s campaigns'}
                    </p>
                  </div>
                )}
              </AnimatedTabContent>
            )}

            {activeTab === 'analytics' && (
              <AnimatedTabContent>
                {/* 🔒 SECURITY: Analytics only accessible for own profile */}
                {isOwnProfile ? (
                  <ProfileAnalyticsDashboard userId={user.uid} />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(200, 35, 51, 0.10) 100%)',
                    borderRadius: '16px',
                    border: '2px solid rgba(220, 53, 69, 0.3)'
                  }}>
                    <BarChart3 size={64} color="#dc3545" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '12px' }}>
                      {language === 'bg' ? '🔒 Достъп отказان' : '🔒 Access Denied'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                      {language === 'bg' 
                        ? 'Не можете да видите статистиката на друг потребител' 
                        : 'You cannot view another user\'s analytics'}
                    </p>
                  </div>
                )}
              </AnimatedTabContent>
            )}

            {activeTab === 'settings' && (
              <AnimatedTabContent>
                {/* 🔒 SECURITY: Settings tab only accessible for own profile */}
                {isOwnProfile ? (
                  <>
                    {/* ✅ Personal Information Section */}
                    <S.ContentSection $themeColor={theme.primary} $isBusinessMode={isBusinessMode}>
              <S.SectionHeader>
                <h2>{t('profile.personalInfo')}</h2>
                        {!editing && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    {t('profile.edit')}
                  </button>
                )}
              </S.SectionHeader>

                      {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  {/* Account Type Selector */}
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconWrapper $color="#666" $size={16}><RefreshCw /></IconWrapper>
                      {language === 'bg' ? 'Тип на акаунта' : 'Account Type'}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: showAccountTypeWarning ? '12px' : '0' }}>
                              {/* ✅ PRIORITY: Business comes FIRST */}
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
                                    ? 'За بизнес акаунت трябва да предоставите валидна информация за фирмата съгласно българското законодателство.'
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
                                    <option value="dealership">{language === 'bg' ? 'Автосалон / Дилър' : 'Car Dealership'}</option>
                                    <option value="trader">{language === 'bg' ? 'Търговец' : 'Trader'}</option>
                                    <option value="company">{language === 'bg' ? 'Компания' : 'Company'}</option>
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
                                  <label>{language === 'bg' ? 'Имейл на فирмата' : 'Business Email'}</label>
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
                                <label>{language === 'bg' ? 'Адрес на فирмата' : 'Business Address'}</label>
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
                                  <option value="bg">{t('languages.bulgarian')}</option>
                                  <option value="en">{t('languages.english')}</option>
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
                            <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: `2px solid ${theme.primary}4D`, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: theme.primary, fontWeight: '700' }}>
                              <IconWrapper $color={theme.primary} $size={18}><UserCircle /></IconWrapper>
                      {language === 'bg' ? 'Лична информация' : 'Personal Information'}
                    </h4>
                            
                            {/* Account Type - Show only for Dealer/Company */}
                            {(profileType === 'dealer' || profileType === 'company') && (
                              <S.NeumorphicFieldWrapper style={{ marginBottom: '20px', gridColumn: '1 / -1' }}>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>
                                  {language === 'bg' ? 'Тип акаунт' : 'Account Type'}
                                </S.NeumorphicFieldLabel>
                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '12px',
                                  marginTop: '8px',
                                  padding: '16px',
                                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                                  borderRadius: '12px',
                                  border: `2px solid ${theme.primary}33`
                                }}>
                                  {/* Business Option (Priority) - Clickable when active */}
                                  <div 
                                    style={{
                                      padding: '16px',
                                      background: user?.accountType === 'business' 
                                        ? `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 100%)`
                                        : 'transparent',
                                      borderRadius: '10px',
                                      border: `2px solid ${user?.accountType === 'business' ? theme.primary : '#dee2e6'}`,
                                      cursor: user?.accountType === 'business' ? 'pointer' : 'default',
                                      transition: 'all 0.3s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      opacity: user?.accountType === 'business' ? 1 : 0.6,
                                      position: 'relative'
                                    }}
                                    onClick={() => {
                                      if (user?.accountType === 'business') {
                                        // Scroll to Dealership Info section
                                        const dealershipSection = document.querySelector('[data-section="dealership-info"]');
                                        if (dealershipSection) {
                                          dealershipSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                          // Highlight the section briefly
                                          dealershipSection.classList.add('highlight-pulse');
                                          setTimeout(() => {
                                            dealershipSection.classList.remove('highlight-pulse');
                                          }, 2000);
                                        }
                                      }
                                    }}
                                    onMouseEnter={(e) => {
                                      if (user?.accountType === 'business') {
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primary}30`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (user?.accountType === 'business') {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }
                                    }}
                                  >
                                    <div style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      border: `2px solid ${user?.accountType === 'business' ? theme.primary : '#dee2e6'}`,
                                      background: user?.accountType === 'business' ? theme.primary : 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {user?.accountType === 'business' && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                                      )}
                      </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ 
                                        fontWeight: '700', 
                                        fontSize: '1rem',
                                        color: user?.accountType === 'business' ? theme.primary : '#495057',
                                        marginBottom: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}>
                                        <Building2 size={18} />
                                        {language === 'bg' ? 'Бизнес' : 'Business'}
                      </div>
                                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                        {language === 'bg' 
                                          ? 'Профил за фирмена дейност с разширени възможности'
                                          : 'Business profile with advanced features'}
                                      </div>
                                      {user?.accountType === 'business' && (
                                        <div style={{ 
                                          fontSize: '0.75rem', 
                                          color: theme.primary, 
                                          marginTop: '8px',
                                          fontWeight: '600',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px'
                                        }}>
                                          <ArrowDown size={14} />
                                          {language === 'bg' 
                                            ? 'Кликнете за преглед на бизнес информацията'
                                            : 'Click to view business information'}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Individual Option */}
                                  <div style={{
                                    padding: '16px',
                                    background: user?.accountType === 'individual' || !user?.accountType
                                      ? `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 100%)`
                                      : 'transparent',
                                    borderRadius: '10px',
                                    border: `2px solid ${user?.accountType === 'individual' || !user?.accountType ? theme.primary : '#dee2e6'}`,
                                    cursor: 'default',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                  }}>
                                    <div style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      border: `2px solid ${user?.accountType === 'individual' || !user?.accountType ? theme.primary : '#dee2e6'}`,
                                      background: user?.accountType === 'individual' || !user?.accountType ? theme.primary : 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {(user?.accountType === 'individual' || !user?.accountType) && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                                      )}
                  </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ 
                                        fontWeight: '700', 
                                        fontSize: '1rem',
                                        color: user?.accountType === 'individual' || !user?.accountType ? theme.primary : '#495057',
                                        marginBottom: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}>
                                        <User size={18} />
                                        {language === 'bg' ? 'Индивидуален' : 'Individual'}
                                      </div>
                                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                        {language === 'bg' 
                                          ? 'Профил за лично използване'
                                          : 'Profile for personal use'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </S.NeumorphicFieldWrapper>
                            )}
                            
                            <S.NeumorphicInfoGrid>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Име' : 'First Name'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.firstName || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Презиме' : 'Middle Name'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.middleName || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Фамилия' : 'Last Name'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.lastName || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Дата на раждане' : 'Date of Birth'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>
                                    {user?.dateOfBirth ? new Date(user?.dateOfBirth || '').toLocaleDateString('bg-BG') : t('profile.notSet')}
                                  </S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Място на راждане' : 'Place of Birth'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.placeOfBirth || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                            </S.NeumorphicInfoGrid>
                          </div>

                  {/* Contact */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: `2px solid ${theme.primary}4D`, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: theme.primary, fontWeight: '700' }}>
                              <IconWrapper $color={theme.primary} $size={18}><Phone /></IconWrapper>
                      {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                    </h4>
                            <S.NeumorphicInfoGrid>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Телефон' : 'Phone'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.phoneNumber || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Имейл' : 'Email'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.email || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                            </S.NeumorphicInfoGrid>
                  </div>

                  {/* Address */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: `2px solid ${theme.primary}4D`, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: theme.primary, fontWeight: '700' }}>
                              <IconWrapper $color={theme.primary} $size={18}><Home /></IconWrapper>
                      {language === 'bg' ? 'Адресна информация' : 'Address Information'}
                    </h4>
                            <S.NeumorphicInfoGrid>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Град' : 'City'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.location?.city || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.postalCode || t('profile.notSet')}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                            </S.NeumorphicInfoGrid>
                            {user?.address && (
                              <S.NeumorphicFieldWrapper style={{ marginTop: '16px' }}>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{language === 'bg' ? 'Адрес' : 'Address'}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>{user?.address}</S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                    )}
                  </div>

                  {/* Other */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: `2px solid ${theme.primary}4D`, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: theme.primary, fontWeight: '700' }}>
                              <IconWrapper $color={theme.primary} $size={18}><SettingsIcon /></IconWrapper>
                      {language === 'bg' ? 'Други' : 'Other'}
                    </h4>
                            <S.NeumorphicInfoGrid>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{t('profile.preferredLanguage')}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>
                                    {user?.preferredLanguage === 'bg' ? '🇧🇬 ' + t('languages.bulgarian') : '🇬🇧 ' + t('languages.english')}
                                  </S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                              <S.NeumorphicFieldWrapper>
                                <S.NeumorphicFieldLabel $themeColor={theme.primary}>{t('profile.memberSince')}</S.NeumorphicFieldLabel>
                                <S.NeumorphicInfoField>
                                  <S.NeumorphicFieldValue>
                                    {user?.createdAt ? new Date(user?.createdAt || '').toLocaleDateString('bg-BG') : t('profile.notSet')}
                                  </S.NeumorphicFieldValue>
                                </S.NeumorphicInfoField>
                              </S.NeumorphicFieldWrapper>
                            </S.NeumorphicInfoGrid>
                  </div>

                          {user?.bio && (
                    <div style={{ marginTop: '2rem' }}>
                      <strong>{t('profile.bio')}:</strong>
                              <p style={{ marginTop: '0.5rem', color: '#666' }}>{user?.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </S.ContentSection>

                    {/* ✅ Verification Panel */}
                    {user && (
                    <S.ContentSection $themeColor={theme.primary} style={{ marginTop: '24px' }}>
              <VerificationPanel
                        emailVerified={user?.emailVerified || user?.verification?.email?.verified || false}
                        phoneVerified={user?.verification?.phone?.verified || false}
                        idVerified={user?.verification?.identity?.verified || false}
                        businessVerified={user?.verification?.business?.verified || false}
                        themeColor={theme.primary}
              />
            </S.ContentSection>
                    )}

                    {/* Privacy Settings for all account types */}
                    <div style={{ marginTop: '24px' }}>
                    <PrivacySettingsManager 
                  userId={user.uid}
                      accountType={profileType === 'dealer' ? 'dealership' : 'individual'} 
                    />
                    </div>
                    
                    {/* Dealership Information Form - Show for all with message */}
                    <div style={{ marginTop: '24px' }} data-section="dealership-info">
                      {profileType !== 'dealer' && (
                        <div style={{ 
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          border: '2px solid #f59e0b',
                          borderRadius: '12px',
                          padding: '20px',
                          marginBottom: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <AlertCircle size={24} color="#f59e0b" />
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#92400e' }}>
                              {language === 'bg' ? 'Информация за автокъщи' : 'Dealership Information'}
                        </div>
                            <div style={{ fontSize: '14px', color: '#78350f' }}>
                              {language === 'bg' 
                                ? 'За да попълните информация за вашата автокъща, моля превключете типа на профила си على "Дилър" от бутоните по-горе.' 
                                : 'To fill in your dealership information, please switch your profile type to "Dealer" using the buttons above.'}
                        </div>
                        </div>
                      </div>
                      )}
                      
                      {profileType === 'dealer' && (
                        <DealershipInfoForm userId={user.uid} />
                      )}
                    </div>
                    
                    {/* Legacy Privacy Settings (can be removed later) */}
                    <div style={{ marginTop: '24px' }}>
                    <PrivacySettings userId={user.uid} />
                    </div>
                    
                    {/* Social Media Accounts Integration */}
                    <div style={{ marginTop: '32px' }}>
                      <SocialMediaSettings />
                    </div>
                  </>
                ) : (
                  /* 🔒 SECURITY: Block settings access for other users */
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                  background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(200, 35, 51, 0.10) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(220, 53, 69, 0.3)'
                }}>
                  <Shield size={64} color="#dc3545" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '12px' }}>
                      {language === 'bg' ? '🔒 Достъп отказан' : '🔒 Access Denied'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                      {language === 'bg' 
                        ? 'Не можете да видите настройките на друг потребител' 
                        : 'You cannot view another user\'s settings'}
                    </p>
                  </div>
                )}
              </AnimatedTabContent>
            )}

            {activeTab === 'consultations' && (
              <AnimatedTabContent>
                <ConsultationsTab 
                  userId={targetUserId || user?.uid || ''}
                  isOwnProfile={isOwnProfile}
                />
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
    </S.ProfilePageContainer>
    
    {/* ⚡ NEW: Profile Type Confirmation Modal */}
    {pendingProfileType && (
      <ProfileTypeConfirmModal
        isOpen={showProfileTypeModal}
        newType={pendingProfileType}
        onConfirm={handleConfirmProfileType}
        onCancel={handleCancelProfileType}
      />
    )}
    </>
  );
};

export default ProfilePage;
