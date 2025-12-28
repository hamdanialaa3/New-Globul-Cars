import React, { useEffect } from 'react';
import { useParams, useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useLanguage } from '../../../../contexts/LanguageContext';
import LazyImage from '../../../../components/LazyImage';
import { useProfile } from './hooks/useProfile';
import DatePickerBulgarian from '../../../../components/shared/DatePickerBulgarian';
import NumberInputBulgarian from '../../../../components/shared/NumberInputBulgarian';
import SelectWithOther from '../../../../components/shared/SelectWithOther';
import { BULGARIA_REGIONS } from '../../../../data/bulgaria-locations';
import { useProfileTracking } from '../../../../hooks/useProfileTracking';
import { bulgarianAuthService } from '../../firebase';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
import type { ProfileType } from '../../../../contexts/ProfileTypeContext';
import { logger } from '../../../../services/logger-service';
import { getCarDetailsUrl } from '../../../../utils/routing-utils';
import { TrustScoreWidget } from '../../../../components/trust';
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
  ProfileTypeConfirmModal,  // ⚡ NEW: Confirmation Modal
  AddPersonalVehicleModal  // ⚡ NEW: Personal Vehicle Modal
} from '../../../../components/Profile';
import type { GarageCar } from '../../../../components/Profile';
import { TrustLevel } from '../../../../services/profile/trust-score-service';
// Import Campaigns Components
import { CampaignsList } from '../../../../components/Profile/Campaigns';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../../firebase/firebase-config';
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
  ArrowDown,
  Plus
} from 'lucide-react';
import * as S from './styles';
import { TabNavigation, TabButton, TabNavLink, SyncButton, FollowButton } from './TabNavigation.styles';
import styled, { keyframes, css } from 'styled-components';
// Import new services - moved to top
import { googleProfileSyncService } from '../../../../services/google/google-profile-sync.service';
import { carAnalyticsService } from '../../../../services/analytics/car-analytics.service';
import { carDeleteService } from '../../../../services/garage/car-delete.service';
import { followService } from '../../../../services/social/follow.service';
import PrivacySettings from '../../../../components/Profile/Security/PrivacySettings';
import DealershipInfoForm from '../../../../components/Profile/Dealership/DealershipInfoForm';
import PrivacySettingsManager from '../../../../components/Profile/Privacy/PrivacySettingsManager';
import ProfileAnalyticsDashboard from '../../../../components/Profile/Analytics/ProfileAnalyticsDashboard';
import ProfileDashboard from '../../../../components/Profile/ProfileDashboard';
import VerificationBadge from '../../../../components/Profile/VerificationBadge';
import ConsultationsTab from './ConsultationsTab';
import { useToast } from '../../../../components/Toast';
import ProfileImageUploader from '../../../../components/Profile/ProfileImageUploader';
import CommunityFeedWidget from '../../../../components/Profile/CommunityFeedWidget';
import SocialMediaSettings from '../../../../components/Profile/SocialMedia/SocialMediaSettings';
import { PersonalVehicleService } from '../../../../services/personal-vehicle.service';
import { PersonalVehicle } from '../../../../types/personal-vehicle.types';
import PersonalVehiclesSection from './PersonalVehiclesSection';

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
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
  ${css`animation: ${slideInFromLeft} 0.4s cubic-bezier(0.4, 0, 0.2, 1);`}
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--border-secondary);
  }
`;

const ProfileImageSmall = styled.img<{ $themeColor?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-primary);
  box-shadow: var(--shadow-md);
  background: var(--bg-secondary);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* ⚡ FIXED: Prevent flickering */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  
  &:hover {
    transform: translateZ(0) scale(1.05);
    box-shadow: var(--shadow-lg);
  }
`;

const UserInfo = styled.div`
  flex: 1;
  ${css`animation: ${fadeIn} 0.5s ease-out 0.2s both;`}
`;

const UserName = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
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
    if (props.$variant === 'success') return 'var(--success)';
    if (props.$variant === 'primary') return 'var(--accent-primary)';
    return 'var(--border-primary)';
  }};
  background: ${props => {
    if (props.$variant === 'success') return 'var(--success)';
    if (props.$variant === 'primary') return 'var(--accent-primary)';
    return 'var(--bg-card)';
  }};
  color: ${props => props.$variant ? 'var(--text-inverse)' : 'var(--text-primary)'};
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
  color: ${props => props.$color || 'var(--accent-primary)'};
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

// ==================== INFO ROW COMPONENT ====================
// Reusable row component for contact information with icon + text/link
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  transition: background 0.2s ease;
  
  &:hover {
    background: var(--bg-secondary);
  }
  
  .info-icon {
    color: var(--accent-primary);
    flex-shrink: 0;
  }
  
  .info-link {
    color: var(--text-primary);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s ease;
    
    &:hover {
      color: var(--accent-primary);
      text-decoration: underline;
    }
  }
  
  .info-text {
    color: var(--text-primary);
    font-size: 0.95rem;
  }
`;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const toast = useToast();
  const params = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  
  // 🎨 NEW: Profile Type Context for Dynamic Theming
  const { profileType, theme, permissions, planTier } = useProfileType();

  // ✅ NEW: Read userId from URL route parameter to view another user's profile
  const targetUserId = params.userId;

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
  
  // Personal Vehicles state - ⚡ NEW: Mobile.de style
  const [personalVehicles, setPersonalVehicles] = React.useState<PersonalVehicle[]>([]);
  const [isPersonalVehiclesLoading, setIsPersonalVehiclesLoading] = React.useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = React.useState(false);
  
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

  // Load personal vehicles - ⚡ NEW: Mobile.de style
  React.useEffect(() => {
    if (isOwnProfile && user?.uid) {
      const loadPersonalVehicles = async () => {
        setIsPersonalVehiclesLoading(true);
        try {
          const vehicles = await PersonalVehicleService.getUserVehicles(user.uid);
          setPersonalVehicles(vehicles);
        } catch (error) {
          logger.error('Failed to load personal vehicles', error as Error, { userId: user.uid });
          toast.error(language === 'bg' ? 'Грешка при зареждане на превозни средства' : 'Error loading vehicles');
        } finally {
          setIsPersonalVehiclesLoading(false);
        }
      };
      loadPersonalVehicles();
    }
  }, [isOwnProfile, user?.uid, language, toast]);

  // Handle personal vehicle added - ⚡ NEW
  const handleVehicleAdded = React.useCallback(async (vehicle: PersonalVehicle) => {
    try {
      const vehicleId = await PersonalVehicleService.saveVehicle(user!.uid, vehicle);
      const savedVehicle = await PersonalVehicleService.getVehicle(vehicleId);
      if (savedVehicle) {
        setPersonalVehicles(prev => [...prev, savedVehicle]);
        toast.success(language === 'bg' ? 'Превозното средство е добавено успешно' : 'Vehicle added successfully');
      }
    } catch (error) {
      logger.error('Failed to save vehicle', error as Error);
      toast.error(language === 'bg' ? 'Грешка при запазване' : 'Error saving vehicle');
    }
  }, [user, language, toast]);

  // Handle vehicle delete - ⚡ NEW
  const handleVehicleDelete = React.useCallback(async (vehicleId: string) => {
    if (!window.confirm(language === 'bg' ? 'Сигурни ли сте, че искате да изтриете това превозно средство?' : 'Are you sure you want to delete this vehicle?')) {
      return;
    }
    
    try {
      await PersonalVehicleService.deleteVehicle(vehicleId);
      setPersonalVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success(language === 'bg' ? 'Превозното средство е изтрито' : 'Vehicle deleted');
    } catch (error) {
      logger.error('Failed to delete vehicle', error as Error);
      toast.error(language === 'bg' ? 'Грешка при изтриване' : 'Error deleting vehicle');
    }
  }, [language, toast]);
  
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
        {isOwnProfile && (
        <TabNavigation $themeColor={theme.primary}>
          {/* Profile tab removed - not needed in navigation */}
          <TabNavLink 
            to="/my-listings"
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
        </TabNavigation>
        )}
        
        {/* Cover Image + Profile Picture Container */}
        {location.pathname.includes('/profile') && (
          <S.CoverAndProfileWrapper>
            {/* Cover Image - Editable for own profile, view-only for others */}
            <CoverImageUploader
              currentImageUrl={user?.coverImage?.url}
              themeColor={theme.primary}
              onUploadSuccess={(url) => {
                if (process.env.NODE_ENV === 'development') {
                  logger.debug('Cover uploaded', { url });
                }
                setUser(prev => prev ? { 
                  ...prev, 
                  coverImage: { url, uploadedAt: new Date() } 
                } : null);
              }}
              onUploadError={(error) => {
                logger.error('Cover error', error as Error);
              }}
            />
            
            {/* Centered Profile Picture - Overlaps Cover and Info Bar */}
            <S.CenteredProfileImageWrapper>
              <ProfileImageUploader
                currentImageUrl={user?.profileImage?.url}
                onUploadSuccess={() => window.location.reload()}
                onUploadError={(err) => alert(err)}
              />
            </S.CenteredProfileImageWrapper>
          </S.CoverAndProfileWrapper>
        )}
        
        {/* User Info Bar */}
        {location.pathname.includes('/profile') && (
          <S.UserInfoBar>
            
            <S.UserInfoLeft>
              <S.UserName>
                {user.displayName || t('profile.anonymous')}
                <VerificationBadge 
                  type="email" 
                  status={user?.email ? 'verified' : 'unverified'} 
                  profileType={profileType}
                />
              </S.UserName>
              <S.UserEmail>{user.email}</S.UserEmail>
              <TrustBadge
                trustScore={user.verification?.trustScore || 10}
                level={user.verification?.level_old || TrustLevel.UNVERIFIED}
                badges={user.verification?.badges || []}
              />
            </S.UserInfoLeft>
            
            <S.UserInfoCenter>
               <S.StatBox>
                 <span className="number">{user.stats?.followers || 0}</span>
                 <span className="label">{language === 'bg' ? 'Последователи' : 'Followers'}</span>
               </S.StatBox>
               <S.StatBox>
                 <span className="number">{user.stats?.following || 0}</span>
                 <span className="label">{language === 'bg' ? 'Следва' : 'Following'}</span>
               </S.StatBox>
               <S.StatBox>
                 <span className="number">{user.verification?.trustScore || 0}%</span>
                 <span className="label">{language === 'bg' ? 'Доверие' : 'Trust'}</span>
               </S.StatBox>
            </S.UserInfoCenter>
            
            <S.UserInfoRight>
               {isOwnProfile ? (
                 <>
                   <S.ActionButton $variant="secondary" onClick={() => navigate('/profile/settings')} $themeColor={theme.primary}>
                     <SettingsIcon size={18} />
                     {language === 'bg' ? 'Настройки' : 'Settings'}
                   </S.ActionButton>
                   <S.ActionButton $variant="danger" onClick={handleLogout}>
                     {t('profile.logout')}
                   </S.ActionButton>
                 </>
               ) : (
                 <>
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
                  <S.ActionButton $variant="primary" onClick={async () => {
                    if (!user?.uid || !targetUserId) return;
                    try {
                      const { default: messagingService } = await import('../../services/messaging/messaging.service');
                      const conversationId = await messagingService.getOrCreateConversation(user.uid, targetUserId);
                      navigate(`/messages?conversation=${conversationId}`);
                    } catch (error) {
                      logger.error('Error creating conversation', error as Error);
                      toast.error(language === 'bg' ? 'Грешка' : 'Error');
                    }
                  }}>
                    <Phone size={18} />
                    {language === 'bg' ? 'Съобщение' : 'Message'}
                  </S.ActionButton>
                 </>
               )}
            </S.UserInfoRight>
          </S.UserInfoBar>
        )}

        {/* NEW: Plan Bar */}
        {location.pathname.includes('/profile') && isOwnProfile && (
          <S.PlanBar $themeColor={theme.primary}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <S.PlanInfoItem>
                <span className="value" style={{ textTransform: 'capitalize', fontSize: '1rem' }}>
                  {planTier === 'free' ? (language === 'bg' ? 'Безплатен план' : 'Free Plan') : planTier}
                </span>
              </S.PlanInfoItem>
              
              <S.PlanInfoItem>
                <span className="label">{language === 'bg' ? 'Лимит:' : 'Limit:'}</span>
                <span className="value">{userCars?.length || 0} / {planTier === 'free' ? 3 : '∞'}</span>
              </S.PlanInfoItem>
              
              <S.PlanInfoItem>
                <span className="label">{language === 'bg' ? 'Статус:' : 'Status:'}</span>
                <span className="value" style={{ color: '#4CAF50' }}>{language === 'bg' ? 'Активен' : 'Active'}</span>
              </S.PlanInfoItem>
            </div>
            
            <S.PlanUpgradeButton $themeColor={theme.primary} onClick={() => navigate('/plans')}>
              <ArrowDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              {language === 'bg' ? 'Подобри' : 'Upgrade'}
            </S.PlanUpgradeButton>
          </S.PlanBar>
        )}

        {/* Profile Grid (Modified for single column) */}
        {location.pathname.includes('/profile') && (
          <AnimatedProfileGrid key="profile-tab" style={{ gridTemplateColumns: '1fr', gap: 0 }}>
            {/* Sidebar Removed */}

            {/* Profile Content */}
            <S.ProfileContent>
            
            {/* Trust Score Widget - For all profiles */}
            {user?.uid && (
              <div style={{ marginTop: '24px' }}>
                <TrustScoreWidget userId={user.uid} compact={false} />
              </div>
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
                    <InfoRow>
                      <Phone size={16} className="info-icon" />
                      <a href={`tel:${user.businessPhone}`} className="info-link">
                        {user.businessPhone}
                      </a>
                    </InfoRow>
                  )}
                  {user.businessEmail && (
                    <InfoRow>
                      <MessageCircle size={16} className="info-icon" />
                      <a href={`mailto:${user.businessEmail}`} className="info-link">
                        {user.businessEmail}
                      </a>
                    </InfoRow>
                  )}
                  {user.website && (
                    <InfoRow>
                      <Building2 size={16} className="info-icon" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="info-link">
                        {user.website}
                      </a>
                    </InfoRow>
                  )}
                  {user.businessAddress && (
                    <InfoRow>
                      <Home size={16} className="info-icon" />
                      <span className="info-text">
                        {user.businessAddress}, {user.businessCity}
                      </span>
                    </InfoRow>
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

            {/* Personal Vehicles Section - extracted */}
            {isOwnProfile && (
              <PersonalVehiclesSection
                language={language as 'bg' | 'en'}
                themePrimary={theme.primary}
                personalVehicles={personalVehicles}
                isLoading={isPersonalVehiclesLoading}
                onAddVehicle={() => setIsAddVehicleModalOpen(true)}
                onDeleteVehicle={handleVehicleDelete}
              />
            )}

            {/* User's Cars - For other users (sellers) */}
            {!isOwnProfile && user?.uid && user.accountType === 'business' && userCars && userCars.length > 0 && (
              <S.ContentSection $themeColor={theme.primary}>
                <S.SectionHeader>
                  <h2>{language === 'bg' ? 'Активни обяви' : 'Active Listings'}</h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {userCars.length} {language === 'bg' ? 'автомобила' : 'cars'}
                  </span>
                </S.SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {userCars.slice(0, 6).map(car => (
                    <div 
                      key={car.id || `car-${Math.random()}`}
                      onClick={() => navigate(getCarDetailsUrl(car))}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
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
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                          {car.year} • {car.mileage?.toLocaleString()} km
                        </div>
                        <div style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '1.1rem' }}>
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
        {!location.pathname.includes('/profile') && (
          <FullWidthContent>
            {location.pathname.includes('/my-listings') && (
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
                    onEdit={(carId) => {
                      const car = userCars.find(c => c.id === carId);
                      if (car) navigate(getCarDetailsUrl(car) + '?edit=true');
                    }}
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
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '2px solid var(--error)'
                }}>
                  <Car size={64} color="var(--error)" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--error)', marginBottom: '12px' }}>
                      {language === 'bg' ? '🔒 Достъп отказан' : '🔒 Access Denied'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>
                      {language === 'bg' 
                        ? 'Не можете да видите обявите на друг потребител' 
                        : 'You cannot view another user\'s listings'}
                    </p>
                  </div>
                )}
              </AnimatedTabContent>
            )}

            {location.pathname.includes('/campaigns') && (
              <AnimatedTabContent>
                {/* 🔒 SECURITY: Campaigns only accessible for own profile */}
                {isOwnProfile ? (
                  <CampaignsList userId={user.uid} />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    border: '2px solid var(--error)'
                  }}>
                    <BarChart3 size={64} color="var(--error)" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--error)', marginBottom: '12px' }}>
                      {language === 'bg' ? '🔒 Достъп отказан' : '🔒 Access Denied'}
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>
                      {language === 'bg' 
                        ? 'Не можете да видите рекламите на друг потребител' 
                        : 'You cannot view another user\'s campaigns'}
                    </p>
                  </div>
                )}
              </AnimatedTabContent>
            )}

            {location.pathname.includes('/analytics') && (
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

            {location.pathname.includes('/settings') && (
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
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '2px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconWrapper $color="var(--text-secondary)" $size={16}><RefreshCw /></IconWrapper>
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
                                  border: `2px solid ${formData.accountType === 'business' ? theme.primary : 'var(--border)'}`,
                                  background: formData.accountType === 'business' ? `${theme.primary}10` : 'var(--bg-card)',
                                  color: formData.accountType === 'business' ? theme.primary : 'var(--text-secondary)',
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
                                  border: `2px solid ${formData.accountType === 'individual' ? theme.primary : 'var(--border)'}`,
                                  background: formData.accountType === 'individual' ? `${theme.primary}10` : 'var(--bg-card)',
                                  color: formData.accountType === 'individual' ? theme.primary : 'var(--text-secondary)',
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
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
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
                            {language === 'bg' ? 'Име' : 'First Name'} <span style={{ color: 'var(--error)' }}>*</span>
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
                            {language === 'bg' ? 'Фамилия' : 'Last Name'} <span style={{ color: 'var(--error)' }}>*</span>
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
                          {language === 'bg' ? 'Име на фирмата' : 'Business Name'} <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' ? 'Автомобили България ЕООД' : 'Cars Bulgaria Ltd'}
                          required
                          style={{ borderColor: 'var(--accent-primary)', borderWidth: '2px' }}
                        />
                      </S.FormGroup>
                    )}
                  </div>

                  {/* Business Information - Only for Business Accounts */}
                  {formData.accountType === 'business' && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconWrapper $color="var(--text-secondary)" $size={14}><Building2 /></IconWrapper>
                        {language === 'bg' ? 'Информация за фирмата' : 'Business Information'}
                      </h4>
                      <S.FormGrid>
                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Тип на бизнеса' : 'Business Type'} <span style={{ color: 'var(--error)' }}>*</span></label>
                          <select 
                            name="businessType" 
                            value={formData.businessType} 
                            onChange={handleInputChange}
                            required
                            style={{ borderColor: 'var(--accent-primary)' }}
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
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="var(--text-secondary)" $size={14}><UserCircle /></IconWrapper>
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
                        <DatePickerBulgarian
                          value={formData.dateOfBirth || ''}
                          onChange={(value) => handleInputChange({ target: { name: 'dateOfBirth', value } } as any)}
                          label={language === 'bg' ? 'Дата на раждане' : 'Date of Birth'}
                          placeholder="01.08.1995"
                          maxDate={new Date().toLocaleDateString('bg-BG').split('/').reverse().join('.')}
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
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="var(--text-secondary)" $size={14}><Phone /></IconWrapper>
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
                          style={{ background: 'var(--bg-hover)', cursor: 'not-allowed' }}
                        />
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>

                  {/* Address Information */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="var(--text-secondary)" $size={14}><Home /></IconWrapper>
                      {language === 'bg' ? 'Адресна информация' : 'Address Information'}
                    </h4>
                    <S.FormGrid>
                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Град' : 'City'}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.locationData?.cityName}
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
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="var(--text-secondary)" $size={14}><SettingsIcon /></IconWrapper>
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
                              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{user?.bio}</p>
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

            {location.pathname.includes('/consultations') && (
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

    {/* ⚡ NEW: Add Personal Vehicle Modal - Mobile.de style */}
    {isOwnProfile && user && (
      <AddPersonalVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSuccess={handleVehicleAdded}
        userId={user.uid}
      />
    )}
    </>
  );
};

export default ProfilePage;
