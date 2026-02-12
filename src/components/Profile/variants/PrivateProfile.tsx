// PrivateProfile - Variant component for individual/private sellers
// Warm, personal experience with garage hero, narrative story, maintenance log

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileTheme } from '../ProfileShell';
import ProfileBadges from '../ProfileBadges';
import TrustPanel from '../TrustPanel';
import type { SellerProfile } from '@/types/profile.types';

interface PrivateProfileProps {
  profile: SellerProfile;
  isViewOnly?: boolean;
  onActionClick?: (action: string, payload?: any) => void;
  viewerNumericId?: number;
}

/**
 * Garage hero background with gradient
 */
const GarageHero = styled.div<{ accentColor: string }>`
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 2rem;
  
  /* Multiple backgrounds: Color overlay (55% opacity) on TOP, Image on BOTTOM */
  background: 
    linear-gradient(${props => props.accentColor}8C, ${props => props.accentColor}8C),
    url('/assets/images/profile-backgrounds/private-bg.png');
  background-size: cover;
  background-position: center;

  @media (max-width: 768px) {
    height: 200px;
    margin-bottom: 1rem;
    padding: 1rem;
  }

  /* Floating Icon Animation */
  &::before {
    content: '🏠';
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 3rem;
    opacity: 0.2;
    z-index: 2;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* Content (Top) */
  > * {
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

/**
 * Hero content badge
 */
const HeroBadge = styled.div<{ accentColor: string }>`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid ${(props) => props.accentColor};
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.accentColor};
  text-align: center;
`;

/**
 * Seller card with image and basic info
 */
const SellerCard = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  margin-bottom: 2rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

/**
 * Seller avatar image
 */
const SellerAvatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid ${(props) => props.theme.colors.borderLight};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

/**
 * Avatar placeholder
 */
const AvatarPlaceholder = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 3px solid ${(props) => props.theme.colors.borderLight};

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }
`;

/**
 * Seller info section
 */
const SellerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/**
 * Seller name heading
 */
const SellerName = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

/**
 * Location and member since
 */
const SellerMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};

  > span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

/**
 * Narrative story section
 */
const NarrativeSection = styled.section`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
`;

/**
 * Section title
 */
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

/**
 * Narrative text
 */
const NarrativeText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  white-space: pre-wrap;
`;

/**
 * Car gallery section
 */
const CarGallerySection = styled.section`
  margin-bottom: 2rem;
`;

/**
 * Cars grid
 */
const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }
`;

/**
 * Car card
 */
const CarCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => props.theme.colors.accent};
  }
`;

/**
 * Car image placeholder
 */
const CarImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

/**
 * Car info
 */
const CarInfo = styled.div`
  padding: 0.75rem;
  background: white;
`;

/**
 * Car name
 */
const CarName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Car price
 */
const CarPrice = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Action button
 */
const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${(props) => props.theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }
`;

/**
 * PrivateProfile Component
 * Personal seller profile variant with:
 * - Garage hero visual
 * - Personal narrative story
 * - Car gallery
 * - Simple CTAs
 */
const PrivateProfile: React.FC<PrivateProfileProps> = ({
  profile,
  isViewOnly = true,
  onActionClick,
  viewerNumericId,
}) => {
  const { language } = useLanguage();
  const { accentColor, profileType } = useProfileTheme();

  const isOwnProfile = useMemo(() => !isViewOnly && viewerNumericId === profile.numericId, [
    isViewOnly,
    viewerNumericId,
    profile.numericId,
  ]);

  const localizedStrings = useMemo(() => ({
    garage: { bg: '🏠 Моя гараж', en: '🏠 My Garage' },
    story: { bg: '📖 Моя история', en: '📖 My Story' },
    cars: { bg: '🚗 Мои автомобили', en: '🚗 My Cars' },
    contact: { bg: '📞 Контакт', en: '📞 Contact' },
    message: { bg: '✉️ Съобщение', en: '✉️ Message' },
    memberSince: { bg: 'Член от', en: 'Member since' },
    location: { bg: 'Местоположение', en: 'Location' },
    noDescription: { bg: 'Тази личност не е добавила описание още.', en: 'This person has not added a description yet.' },
    noCars: { bg: 'Не са добавени автомобили.', en: 'No cars added.' },
  }), []);

  const getLocalizedString = (key: keyof typeof localizedStrings): string => {
    return language === 'bg' ? localizedStrings[key].bg : localizedStrings[key].en;
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '—';
    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(date));
  };

  return (
    <>
      {/* Garage Hero Section */}
      <GarageHero accentColor={accentColor}>
        <HeroBadge accentColor={accentColor}>
          {getLocalizedString('garage')}
        </HeroBadge>
      </GarageHero>

      {/* Seller Card */}
      <SellerCard>
        {profile.logo ? (
          <SellerAvatar src={profile.logo} alt={profile.name} />
        ) : (
          <AvatarPlaceholder>👤</AvatarPlaceholder>
        )}
        <SellerInfo>
          <SellerName>{profile.name}</SellerName>
          <SellerMeta>
            <span>📍 {profile.location.city}, {profile.location.region}</span>
            <span>📅 {getLocalizedString('memberSince')} {formatDate(profile.createdAt)}</span>
          </SellerMeta>
          {profile.badges && profile.badges.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <ProfileBadges badges={profile.badges} compact={true} maxDisplay={3} />
            </div>
          )}
        </SellerInfo>
      </SellerCard>

      {/* Narrative Story Section */}
      {profile.description && (
        <NarrativeSection>
          <SectionTitle>{getLocalizedString('story')}</SectionTitle>
          <NarrativeText>
            {profile.description || getLocalizedString('noDescription')}
          </NarrativeText>
        </NarrativeSection>
      )}

      {/* Car Gallery Section */}
      <CarGallerySection>
        <SectionTitle>{getLocalizedString('cars')}</SectionTitle>
        <CarsGrid>
          {/* Placeholder for car cards - would be populated from UnifiedCarService */}
          {profile.gallery && profile.gallery.length === 0 && (
            <p style={{ gridColumn: '1 / -1', color: '#999' }}>
              {getLocalizedString('noCars')}
            </p>
          )}
        </CarsGrid>
      </CarGallerySection>

      {/* Trust Panel */}
      <TrustPanel profile={profile} />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <ActionButton onClick={() => onActionClick?.('contact', { numericId: profile.numericId })}>
          {getLocalizedString('contact')}
        </ActionButton>
        <ActionButton onClick={() => onActionClick?.('message', { numericId: profile.numericId })}>
          {getLocalizedString('message')}
        </ActionButton>
      </div>
    </>
  );
};

PrivateProfile.displayName = 'PrivateProfile';

export default PrivateProfile;
