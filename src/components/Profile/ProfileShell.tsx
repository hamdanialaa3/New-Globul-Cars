// ProfileShell - Master component container for all 3 profile variants
// Handles theme wiring, accent colors, and layout structure

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { logger } from '@/services/logger-service';
import type { SellerProfile, ProfileShellProps } from '@/types/profile.types';
import PrivateProfile from './variants/PrivateProfile';
import DealerProfile from './variants/DealerProfile';
import CompanyProfile from './variants/CompanyProfile';

/**
 * ThemeContext for profile-specific styling
 * Provides accent color and profile type to child components
 */
export const ProfileThemeContext = React.createContext<{
  accentColor: string;
  profileType: SellerProfile['profileType'];
  profile: SellerProfile;
}>({
  accentColor: '#FF7A2D',
  profileType: 'private',
  profile: {} as SellerProfile,
});

/**
 * useProfileTheme hook for child components
 */
export const useProfileTheme = () => {
  const context = React.useContext(ProfileThemeContext);
  if (!context) {
    logger.warn('[ProfileShell] useProfileTheme called outside ProfileThemeContext');
  }
  return context;
};

/**
 * Maps profile type to brand accent color
 * Private: Warm Orange (#FF7A2D)
 * Dealer: Fresh Green (#2EB872)
 * Corporate: Professional Blue (#2B7BFF)
 */
const getAccentColorByType = (profileType: SellerProfile['profileType']): string => {
  const colorMap = {
    private: '#FF7A2D',
    dealer: '#2EB872',
    corporate: '#2B7BFF',
  };
  return colorMap[profileType] || colorMap.private;
};

/**
 * Root container for profile page
 * Manages responsive layout, theme, and variant selection
 */
const ProfileContainer = styled.div<{ accentColor: string }>`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, ${(props) => props.accentColor}08 0%, transparent 100%);
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    background: ${(props) => props.accentColor}04;
  }
`;

/**
 * Header zone - Profile navigation, actions, settings
 */
const HeaderZone = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

/**
 * Hero section - Profile image, name, verification badges
 */
const HeroZone = styled.section`
  width: 100%;
  position: relative;
  margin-bottom: 2rem;
  overflow: hidden;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

/**
 * Main content area - Profile info, listings, stats
 */
const ContentZone = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

/**
 * Gallery section - Cars, images, videos
 */
const GalleryZone = styled.section`
  width: 100%;
  margin: 3rem 0;

  @media (max-width: 768px) {
    margin: 2rem 0;
  }
`;

/**
 * Info panel - Contact, location, stats
 */
const InfoPanelZone = styled.aside`
  width: 100%;
  margin: 2rem 0;
`;

/**
 * Actions zone - Contact buttons, CTA
 */
const ActionsZone = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    gap: 0.75rem;
    padding: 1rem;
    margin: 1.5rem 0;
  }
`;

/**
 * Trust panel - Badges, verification, reviews
 */
const TrustZone = styled.section`
  width: 100%;
  margin: 2rem 0;
  padding-bottom: 3rem;
`;

/**
 * Error fallback component
 */
const ErrorFallback = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${(props) => props.theme.colors.error}12;
  border: 1px solid ${(props) => props.theme.colors.error}30;
  border-radius: 12px;
  text-align: center;

  h2 {
    color: ${(props) => props.theme.colors.error};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${(props) => props.theme.colors.textSecondary};
    margin: 0.5rem 0;
  }
`;

/**
 * ProfileShell Component
 * Master container that:
 * 1. Wires theme with profile-specific accent color
 * 2. Creates ProfileThemeContext for child components
 * 3. Routes to correct variant (Private/Dealer/Corporate)
 * 4. Manages loading and error states
 * 5. Handles responsive layout zones
 */
const ProfileShell: React.FC<ProfileShellProps> = ({
  profile,
  isLoading = false,
  error,
  isViewOnly = true,
  onActionClick,
  viewerNumericId,
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const accentColor = useMemo(
    () => getAccentColorByType(profile?.profileType || 'private'),
    [profile?.profileType]
  );

  // Log render for debugging
  React.useEffect(() => {
    if (profile?.id) {
      logger.info(`[ProfileShell] Rendering ${profile.profileType} profile for ${profile.name}`);
    }
  }, [profile?.id, profile?.profileType, profile?.name]);

  // Error state
  if (error) {
    return (
      <ProfileContainer accentColor={accentColor}>
        <ContentZone>
          <ErrorFallback>
            <h2>{language === 'bg' ? 'Грешка при зареждане' : 'Loading Error'}</h2>
            <p>{error}</p>
            <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
              {language === 'bg'
                ? 'Моля, опитайте по-късно'
                : 'Please try again later'}
            </p>
          </ErrorFallback>
        </ContentZone>
      </ProfileContainer>
    );
  }

  // Loading state - rendered by variant loaders
  if (isLoading && !profile) {
    return (
      <ProfileContainer accentColor={accentColor}>
        <ContentZone>
          <div style={{ padding: '2rem' }}>
            {language === 'bg' ? 'Зареждане...' : 'Loading...'}
          </div>
        </ContentZone>
      </ProfileContainer>
    );
  }

  // No profile data
  if (!profile) {
    return (
      <ProfileContainer accentColor={accentColor}>
        <ContentZone>
          <ErrorFallback>
            <h2>{language === 'bg' ? 'Профил не намерен' : 'Profile Not Found'}</h2>
          </ErrorFallback>
        </ContentZone>
      </ProfileContainer>
    );
  }

  // Render variant based on profile type
  const variantProps = {
    isViewOnly,
    onActionClick,
    viewerNumericId,
  };

  const renderVariant = () => {
    switch (profile.profileType) {
      case 'dealer':
        return <DealerProfile profile={profile} {...variantProps} />;
      case 'corporate':
        return <CompanyProfile profile={profile} {...variantProps} />;
      case 'private':
      default:
        return <PrivateProfile profile={profile} {...variantProps} />;
    }
  };

  return (
    <ProfileThemeContext.Provider value={{ accentColor, profileType: profile.profileType, profile }}>
      <ProfileContainer accentColor={accentColor}>
        <HeaderZone>
          {/* Header navigation and actions - handled by variant */}
        </HeaderZone>

        <HeroZone>
          {/* Hero section with profile image/background - handled by variant */}
        </HeroZone>

        <ContentZone>
          {renderVariant()}

          <GalleryZone>
            {/* Gallery section - handled by variant */}
          </GalleryZone>

          <InfoPanelZone>
            {/* Info panel with contact/location - handled by variant */}
          </InfoPanelZone>

          <ActionsZone>
            {/* Primary actions - handled by variant */}
          </ActionsZone>

          <TrustZone>
            {/* Trust panel with badges and reviews - handled by variant */}
          </TrustZone>
        </ContentZone>
      </ProfileContainer>
    </ProfileThemeContext.Provider>
  );
};

ProfileShell.displayName = 'ProfileShell';

export default ProfileShell;
