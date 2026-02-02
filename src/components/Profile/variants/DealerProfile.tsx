// DealerProfile - Variant component for professional dealers
// Professional, trust-focused experience with carousel hero, dealer card, car grid with filters

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileTheme } from '../ProfileShell';
import ProfileBadges from '../ProfileBadges';
import TrustPanel from '../TrustPanel';
import type { SellerProfile } from '@/types/profile.types';

interface DealerProfileProps {
  profile: SellerProfile;
  isViewOnly?: boolean;
  onActionClick?: (action: string, payload?: any) => void;
  viewerNumericId?: number;
}

/**
 * Hero carousel container
 */
const HeroCarousel = styled.div<{ accentColor: string }>`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Multiple backgrounds: Color overlay (55% opacity) on TOP, Image on BOTTOM */
  background: 
    linear-gradient(${props => props.accentColor}8C, ${props => props.accentColor}8C),
    url('/assets/images/profile-backgrounds/dealer-bg.png');
  background-size: cover;
  background-position: center;

  @media (max-width: 768px) {
    height: 250px;
    margin-bottom: 1rem;
  }

  /* Content */
  > * {
    position: relative;
    z-index: 1;
  }
`;

/**
 * Carousel slide content
 */
const CarouselSlide = styled.div<{ isActive: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
  opacity: ${(props) => (props.isActive ? 1 : 0)};
  transition: opacity 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

/**
 * Carousel controls
 */
const CarouselControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
`;

/**
 * Carousel dot indicator
 */
const CarouselDot = styled.button<{ isActive: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${(props) => (props.isActive ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    transform: scale(1.2);
  }
`;

/**
 * Dealer card with logo and credentials
 */
const DealerCard = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  margin-bottom: 2rem;
  align-items: start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    grid-template-columns: 120px 1fr;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

/**
 * Dealer logo
 */
const DealerLogo = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid ${(props) => props.theme.colors.borderLight};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

/**
 * Logo placeholder
 */
const LogoPlaceholder = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 3px solid ${(props) => props.theme.colors.borderLight};

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    font-size: 2rem;
  }
`;

/**
 * Dealer info section
 */
const DealerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/**
 * Dealer business name
 */
const DealerName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

/**
 * Dealer credentials/credentials
 */
const DealerCredentials = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

/**
 * Credential item
 */
const CredentialItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '✓';
    color: #2EB872;
    font-weight: 700;
  }
`;

/**
 * Dealer description
 */
const DealerDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

/**
 * Filter section
 */
const FilterSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
`;

/**
 * Filter title
 */
const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Filter buttons group
 */
const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

/**
 * Filter button
 */
const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.isActive ? props.theme.colors.accent : 'white')};
  color: ${(props) => (props.isActive ? 'white' : props.theme.colors.textPrimary)};
  border: 1px solid ${(props) => (props.isActive ? props.theme.colors.accent : props.theme.colors.borderLight)};
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    ${(props) => !props.isActive && `background: ${props.theme.colors.accent}08;`}
  }
`;

/**
 * Cars grid section
 */
const CarsGridSection = styled.section`
  margin-bottom: 2rem;
`;

/**
 * Cars grid
 */
const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

/**
 * Car card
 */
const CarCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
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
  font-size: 2.5rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.05) 100%);
  }
`;

/**
 * Car info
 */
const CarInfo = styled.div`
  padding: 1rem;
  background: white;
`;

/**
 * Car make/model
 */
const CarModel = styled.p`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 0.5rem 0;
`;

/**
 * Car specs
 */
const CarSpecs = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0 0 0.5rem 0;
`;

/**
 * Car price
 */
const CarPrice = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.accent};
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
`;

/**
 * Section heading
 */
const SectionHeading = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 1rem 0;
`;

/**
 * DealerProfile Component
 * Professional dealer profile variant with:
 * - Carousel hero visual
 * - Dealer card with credentials
 * - Advanced car grid with filters
 * - Professional trust signals
 */
const DealerProfile: React.FC<DealerProfileProps> = ({
  profile,
  isViewOnly = true,
  onActionClick,
  viewerNumericId,
}) => {
  const { language } = useLanguage();
  const { accentColor, profileType } = useProfileTheme();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const localizedStrings = useMemo(() => ({
    inventory: { bg: '🚗 Инвентар', en: '🚗 Inventory' },
    filters: { bg: 'Филтри', en: 'Filters' },
    carType: { bg: 'Тип', en: 'Type' },
    priceRange: { bg: 'Цена', en: 'Price' },
    mileage: { bg: 'Километраж', en: 'Mileage' },
    verified: { bg: 'Проверен дилър', en: 'Verified Dealer' },
    experience: { bg: 'Година опит', en: 'Years Experience' },
    inventory_count: { bg: 'Активни обяви', en: 'Active Listings' },
    contact: { bg: '📞 Контакт', en: '📞 Contact' },
    message: { bg: '✉️ Съобщение', en: '✉️ Message' },
  }), []);

  const getLocalizedString = (key: keyof typeof localizedStrings): string => {
    return language === 'bg' ? localizedStrings[key].bg : localizedStrings[key].en;
  };

  const carTypes = ['All', 'Sedan', 'SUV', 'Van', 'Truck', 'Bus'];

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel accentColor={accentColor}>
        <CarouselSlide isActive={currentSlide === 0}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🏢</span>
            <p style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>
              {getLocalizedString('verified')}
            </p>
          </div>
        </CarouselSlide>
        <CarouselSlide isActive={currentSlide === 1}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>📊</span>
            <p style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>
              {getLocalizedString('inventory_count')}: {profile.stats?.totalListings || 0}
            </p>
          </div>
        </CarouselSlide>

        <CarouselControls>
          <CarouselDot isActive={currentSlide === 0} onClick={() => setCurrentSlide(0)} />
          <CarouselDot isActive={currentSlide === 1} onClick={() => setCurrentSlide(1)} />
        </CarouselControls>
      </HeroCarousel>

      {/* Dealer Card */}
      <DealerCard>
        {profile.logo ? (
          <DealerLogo src={profile.logo} alt={profile.businessName || profile.name} />
        ) : (
          <LogoPlaceholder>🏢</LogoPlaceholder>
        )}
        <DealerInfo>
          <DealerName>{profile.businessName || profile.name}</DealerName>
          <DealerCredentials>
            <CredentialItem>{getLocalizedString('verified')}</CredentialItem>
            <CredentialItem>
              {profile.stats?.totalListings || 0} {getLocalizedString('inventory_count')}
            </CredentialItem>
          </DealerCredentials>
          {profile.description && <DealerDescription>{profile.description}</DealerDescription>}
          {profile.badges && profile.badges.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <ProfileBadges badges={profile.badges} compact={true} maxDisplay={3} isHorizontal={true} />
            </div>
          )}
        </DealerInfo>
      </DealerCard>

      {/* Filter Section */}
      <FilterSection>
        <FilterTitle>{getLocalizedString('carType')}</FilterTitle>
        <FilterGroup>
          {carTypes.map((type) => (
            <FilterButton
              key={type}
              isActive={activeFilters.includes(type)}
              onClick={() => {
                if (activeFilters.includes(type)) {
                  setActiveFilters(activeFilters.filter((f) => f !== type));
                } else {
                  setActiveFilters([...activeFilters, type]);
                }
              }}
            >
              {type}
            </FilterButton>
          ))}
        </FilterGroup>
      </FilterSection>

      {/* Car Inventory Grid */}
      <CarsGridSection>
        <SectionHeading>{getLocalizedString('inventory')}</SectionHeading>
        <CarsGrid>
          {/* Placeholder for car cards - would be populated from UnifiedCarService */}
          {profile.gallery && profile.gallery.length === 0 && (
            <p style={{ gridColumn: '1 / -1', color: '#999' }}>
              {language === 'bg' ? 'Не са добавени автомобили.' : 'No cars added.'}
            </p>
          )}
        </CarsGrid>
      </CarsGridSection>

      {/* Trust Panel */}
      <TrustPanel profile={profile} expandedBadges={true} />

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

DealerProfile.displayName = 'DealerProfile';

export default DealerProfile;
