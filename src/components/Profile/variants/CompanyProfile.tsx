// CompanyProfile - Variant component for corporate sellers
// Cinematic, enterprise-focused experience with video hero, corporate services, office locations, advanced catalog

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileTheme } from '../ProfileShell';
import ProfileBadges from '../ProfileBadges';
import TrustPanel from '../TrustPanel';
import type { SellerProfile } from '@/types/profile.types';

interface CompanyProfileProps {
  profile: SellerProfile;
  isViewOnly?: boolean;
  onActionClick?: (action: string, payload?: any) => void;
  viewerNumericId?: number;
}

/**
 * Cinematic hero video container
 */
const CinematicHero = styled.div<{ accentColor: string }>`
  width: 100%;
  height: 450px;
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
    url('/assets/images/profile-backgrounds/company-bg.png');
  background-size: cover;
  background-position: center;

  @media (max-width: 768px) {
    height: 280px;
    margin-bottom: 1rem;
  }

  /* Overlay Gradient (Optional but keeps cinematic feel) */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    z-index: 1;
    pointer-events: none;
  }

  /* Content */
  > * {
    position: relative;
    z-index: 2;
  }
`;

/**
 * Video placeholder
 */
const VideoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 3rem;
  position: relative;
  z-index: 2;

  > p {
    font-size: 1rem;
    color: white;
    font-weight: 600;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

/**
 * Company card with corporate info
 */
const CompanyCard = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  margin-bottom: 2rem;
  align-items: start;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    grid-template-columns: 140px 1fr;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

/**
 * Company logo
 */
const CompanyLogo = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: contain;
  background: white;
  border: 2px solid ${(props) => props.theme.colors.borderLight};
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
  }
`;

/**
 * Logo placeholder
 */
const LogoPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  border: 2px solid ${(props) => props.theme.colors.borderLight};

  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
    font-size: 2.5rem;
  }
`;

/**
 * Company info section
 */
const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

/**
 * Company legal name
 */
const CompanyName = styled.h1`
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
 * Company legal credentials
 */
const CompanyCredentials = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
    color: #2B7BFF;
    font-weight: 700;
  }
`;

/**
 * Company mission/vision
 */
const CompanyMission = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  font-style: italic;
`;

/**
 * Services grid section
 */
const ServicesSection = styled.section`
  margin-bottom: 2rem;
`;

/**
 * Services grid
 */
const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

/**
 * Service card
 */
const ServiceCard = styled.div`
  padding: 1.5rem;
  background: white;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

/**
 * Service icon
 */
const ServiceIcon = styled.span`
  font-size: 2.5rem;
  display: inline-block;
`;

/**
 * Service name
 */
const ServiceName = styled.p`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

/**
 * Service description
 */
const ServiceDesc = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.4;
`;

/**
 * Office locations section
 */
const OfficesSection = styled.section`
  margin-bottom: 2rem;
`;

/**
 * Offices grid
 */
const OfficesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

/**
 * Office card
 */
const OfficeCard = styled.div`
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

/**
 * Office title
 */
const OfficeTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

/**
 * Office details
 */
const OfficeDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

/**
 * Certifications section
 */
const CertificationsSection = styled.section`
  margin-bottom: 2rem;
`;

/**
 * Certifications grid
 */
const CertificationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

/**
 * Certification badge
 */
const CertificationBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid ${(props) => props.theme.colors.borderLight};
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

/**
 * Certification icon
 */
const CertIcon = styled.span`
  font-size: 2rem;
  display: inline-block;
`;

/**
 * Certification name
 */
const CertName = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

/**
 * Car catalog section
 */
const CatalogSection = styled.section`
  margin-bottom: 2rem;
`;

/**
 * Catalog grid
 */
const CatalogGrid = styled.div`
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
 * Catalog item
 */
const CatalogItem = styled.div`
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
 * CompanyProfile Component
 * Enterprise corporate profile variant with:
 * - Cinematic video hero
 * - Company branding and credentials
 * - Corporate services showcase
 * - Office locations map
 * - Certifications and credentials
 * - Advanced car catalog
 */
const CompanyProfile: React.FC<CompanyProfileProps> = ({
  profile,
  isViewOnly = true,
  onActionClick,
  viewerNumericId,
}) => {
  const { language } = useLanguage();
  const { accentColor, profileType } = useProfileTheme();

  const localizedStrings = useMemo(() => ({
    services: { bg: '🏢 Услуги', en: '🏢 Services' },
    offices: { bg: '📍 Офиси', en: '📍 Offices' },
    certifications: { bg: '✓ Сертификации', en: '✓ Certifications' },
    catalog: { bg: '🚗 Каталог', en: '🚗 Catalog' },
    contact: { bg: '📞 Контакт', en: '📞 Contact' },
    message: { bg: '✉️ Съобщение', en: '✉️ Message' },
    certified: { bg: 'Сертифицирана компания', en: 'Certified Company' },
    eik: { bg: 'ЕИК:', en: 'Tax ID:' },
    established: { bg: 'Основана:', en: 'Established:' },
    headquarters: { bg: 'Седалище', en: 'Headquarters' },
  }), []);

  const getLocalizedString = (key: keyof typeof localizedStrings): string => {
    return language === 'bg' ? localizedStrings[key].bg : localizedStrings[key].en;
  };

  // Mock services
  const services = [
    { icon: '🔧', name: language === 'bg' ? 'Сервиз' : 'Service', desc: language === 'bg' ? 'Техническо обслужване' : 'Technical maintenance' },
    { icon: '🛡️', name: language === 'bg' ? 'Гаранция' : 'Warranty', desc: language === 'bg' ? 'Гаранция на продуктите' : 'Product warranty' },
    { icon: '🚗', name: language === 'bg' ? 'Доставка' : 'Delivery', desc: language === 'bg' ? 'Доставка до дома' : 'Home delivery' },
    { icon: '💳', name: language === 'bg' ? 'Финансиране' : 'Financing', desc: language === 'bg' ? 'Кредитни опции' : 'Credit options' },
  ];

  // Mock certifications
  const certifications = ['ISO 9001', 'ISO 14001', 'CE Mark', 'BGStandard'];

  return (
    <>
      {/* Cinematic Hero */}
      <CinematicHero accentColor={accentColor}>
        <VideoPlaceholder>
          <span>🎬</span>
          <p>{language === 'bg' ? 'Видео профил' : 'Video Profile'}</p>
        </VideoPlaceholder>
      </CinematicHero>

      {/* Company Card */}
      <CompanyCard>
        {profile.logo ? (
          <CompanyLogo src={profile.logo} alt={profile.businessName || profile.name} />
        ) : (
          <LogoPlaceholder>🏢</LogoPlaceholder>
        )}
        <CompanyInfo>
          <CompanyName>{profile.businessName || profile.name}</CompanyName>
          <CompanyCredentials>
            <CredentialItem>{getLocalizedString('certified')}</CredentialItem>
            {/* EIK would come from profile.eik */}
            <CredentialItem>{getLocalizedString('eik')} 1234567890</CredentialItem>
            <CredentialItem>{getLocalizedString('established')} 2015</CredentialItem>
          </CompanyCredentials>
          {profile.description && <CompanyMission>{profile.description}</CompanyMission>}
          {profile.badges && profile.badges.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <ProfileBadges badges={profile.badges} compact={true} maxDisplay={3} isHorizontal={true} />
            </div>
          )}
        </CompanyInfo>
      </CompanyCard>

      {/* Services Section */}
      <ServicesSection>
        <SectionHeading>{getLocalizedString('services')}</SectionHeading>
        <ServicesGrid>
          {services.map((service, idx) => (
            <ServiceCard key={idx}>
              <ServiceIcon>{service.icon}</ServiceIcon>
              <ServiceName>{service.name}</ServiceName>
              <ServiceDesc>{service.desc}</ServiceDesc>
            </ServiceCard>
          ))}
        </ServicesGrid>
      </ServicesSection>

      {/* Office Locations Section */}
      <OfficesSection>
        <SectionHeading>{getLocalizedString('offices')}</SectionHeading>
        <OfficesGrid>
          <OfficeCard>
            <OfficeTitle>
              📍 {getLocalizedString('headquarters')}
            </OfficeTitle>
            <OfficeDetails>
              <span>{profile.location.city}, {profile.location.region}</span>
              <span>{profile.phone}</span>
              <span>{profile.email}</span>
            </OfficeDetails>
          </OfficeCard>
          {/* Additional offices would be added here from profile.officeLocations */}
        </OfficesGrid>
      </OfficesSection>

      {/* Certifications Section */}
      <CertificationsSection>
        <SectionHeading>{getLocalizedString('certifications')}</SectionHeading>
        <CertificationsGrid>
          {certifications.map((cert, idx) => (
            <CertificationBadge key={idx}>
              <CertIcon>✓</CertIcon>
              <CertName>{cert}</CertName>
            </CertificationBadge>
          ))}
        </CertificationsGrid>
      </CertificationsSection>

      {/* Car Catalog Section */}
      <CatalogSection>
        <SectionHeading>{getLocalizedString('catalog')}</SectionHeading>
        <CatalogGrid>
          {/* Placeholder for catalog items */}
          {profile.gallery && profile.gallery.length === 0 && (
            <p style={{ gridColumn: '1 / -1', color: '#999' }}>
              {language === 'bg' ? 'Не са добавени автомобили.' : 'No cars added.'}
            </p>
          )}
        </CatalogGrid>
      </CatalogSection>

      {/* Trust Panel */}
      <TrustPanel profile={profile} expandedBadges={true} showFullMetrics={true} />

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

CompanyProfile.displayName = 'CompanyProfile';

export default CompanyProfile;
