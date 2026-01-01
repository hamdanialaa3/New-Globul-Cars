// Popular Car Brands Section

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import styled from 'styled-components';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import { glassNeutralButton, glassPrimaryButton } from '../../../../styles/glassmorphism-buttons';

// Popular brands configuration with logos
const POPULAR_BRANDS = [
  { id: 'Audi', nameEn: 'Audi', nameBg: 'Ауди', logo: 'Audi.png' },
  { id: 'BMW', nameEn: 'BMW', nameBg: 'БМВ', logo: 'BMW.png' },
  { id: 'Ford', nameEn: 'Ford', nameBg: 'Форд', logo: 'Ford.png' },
  { id: 'GMC', nameEn: 'GMC', nameBg: 'Джи Ем Си', logo: 'GMC.png' },
  { id: 'Hyundai', nameEn: 'Hyundai', nameBg: 'Хюндай', logo: 'Hyundai.png' },
  { id: 'Kia', nameEn: 'Kia', nameBg: 'Киа', logo: 'Kia.png' },
  { id: 'Mercedes-Benz', nameEn: 'Mercedes-Benz', nameBg: 'Мерцедес-Бенц', logo: 'Mercedes-Benz.png' },
  { id: 'Mitsubishi', nameEn: 'Mitsubishi', nameBg: 'Мицубиши', logo: 'Mitsubishi.png' },
  { id: 'Opel', nameEn: 'Opel', nameBg: 'Опел', logo: 'Opel.png' },
  { id: 'Renault', nameEn: 'Renault', nameBg: 'Рено', logo: 'Renault.png' },
  { id: 'Skoda', nameEn: 'Skoda', nameBg: 'Шкода', logo: 'Skoda.png' },
  { id: 'Tesla', nameEn: 'Tesla', nameBg: 'Тесла', logo: 'Tesla.png' },
  { id: 'Toyota', nameEn: 'Toyota', nameBg: 'Тойота', logo: 'Toyota.png' },
  { id: 'Volvo', nameEn: 'Volvo', nameBg: 'Волво', logo: 'Volvo.png' },
  { id: 'Volkswagen', nameEn: 'Volkswagen', nameBg: 'Фолксваген', logo: 'Volkswagen.png' },
];

// Styled Components
const SectionContainer = styled.section`
  padding: 3rem 0;
  background-image: url('/assets/backgrounds/metal-bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  position: relative;
  transform: translateZ(0);
  will-change: transform;
  transition: background-color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    opacity: 0.4;
    z-index: 0;
    transition: background-color 0.3s ease, opacity 0.3s ease;
  }
  
  html[data-theme="dark"] &::before {
    opacity: 0.4;
  }
  
  @media (max-width: 600px) {
    padding: 2rem 0;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    padding: 0 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.375rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 600px) {
    font-size: 0.875rem;
  }
`;

// Horizontal scroll container - no grid, always horizontal
const BrandsContainer = styled.div`
  margin-bottom: 2rem;
`;

const BrandCard = styled.button`
  ${glassNeutralButton}
  /* 🌟 Glass Metallic Effect - تأثير زجاجي معدني عصري */
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.25) 100%
  );
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(200, 200, 200, 0.4);
  border-top: 2px solid rgba(255, 255, 255, 0.6); /* highlight على الحافة العلوية */
  border-radius: 16px;
  padding: 1.25rem 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  opacity: 1;
  color: var(--text-primary);
  margin: 0;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5), /* highlight داخلي */
    inset 0 -1px 0 rgba(0, 0, 0, 0.1); /* shadow داخلي */

  html[data-theme="dark"] & {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.06) 50%,
      rgba(255, 255, 255, 0.12) 100%
    );
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* تأثير بريق معدني */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.5s ease, transform 0.5s ease;
    transform: rotate(45deg) translateX(-100%);
  }
  
  &:hover::before {
    opacity: 1;
    transform: rotate(45deg) translateX(100%);
  }

  /* تأثير انعكاس معدني */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 100%
    );
    border-radius: 16px 16px 0 0;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 
      0 12px 30px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    border-color: rgba(220, 220, 220, 0.5);
    border-top: 2px solid rgba(255, 255, 255, 0.7);
    background: linear-gradient(135deg, 
      #F0F0F0 0%,      /* فضي فاتح جداً */
      #E0E0E0 25%,    /* فضي فاتح */
      #D0D0D0 50%,    /* فضي */
      #E0E0E0 75%,    /* فضي فاتح */
      #F0F0F0 100%    /* فضي فاتح جداً */
    );
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }
  
  html[data-theme="dark"] &:hover {
    box-shadow: 
      0 12px 30px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.4);
    border-color: rgba(180, 180, 180, 0.4);
    border-top: 2px solid rgba(220, 220, 220, 0.5);
    background: linear-gradient(135deg, 
      #5A5A5A 0%,      /* رمادي داكن فاتح */
      #4A4A4A 25%,     /* رمادي داكن */
      #3A3A3A 50%,     /* رمادي داكن */
      #4A4A4A 75%,     /* رمادي داكن */
      #5A5A5A 100%     /* رمادي داكن فاتح */
    );
  }
  
  &:active { 
    transform: translateY(-4px);
    box-shadow: 
      0 6px 20px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(0, 0, 0, 0.12);
  }
`;

const LogoContainer = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const BrandName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  position: relative;
  z-index: 1;
  line-height: 1.4;
  @media (max-width: 600px) { font-size: 0.8rem; }
`;

// ✅ Removed CarCount component - no need to display car counts

const ViewAllBrandsButton = styled.button`
  border: none;
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 2rem auto 0;
  display: block;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;

  /* Light mode: Orange/Yellow gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF8F10 0%, #FFA500 50%, #FFD700 100%);
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 143, 16, 0.4);
  }

  /* Dark mode: Black with yellow text */
  html[data-theme="dark"] & {
    background: #000000;
    color: #FFD700;
    border: 2px solid #FFD700;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FF8F10 100%);
      box-shadow: 0 8px 30px rgba(255, 143, 16, 0.5);
    }
    html[data-theme="dark"] & {
      background: #1a1a1a;
      box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1);
  }
  
  @media (max-width: 600px) {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
`;

// ✅ Removed LoadingState and BrandCount interface - no longer needed

const PopularBrandsSection: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  // ✅ Removed brandCounts state - no longer needed since we don't display counts

  const handleBrandClick = (brandId: string) => {
    // ✅ Always navigate, even if count is 0
    navigate(`/cars?make=${encodeURIComponent(brandId)}`);
  };

  const getBrandName = (brand: typeof POPULAR_BRANDS[0]) => {
    return language === 'bg' ? brand.nameBg : brand.nameEn;
  };

  return (
    <SectionContainer>
      <ContentContainer>
        <SectionHeader>
          <SectionTitle>
            {language === 'bg' ? 'Популярни Марки Автомобили' : 'Popular Car Brands'}
          </SectionTitle>
          <SectionSubtitle>
            {language === 'bg' 
              ? 'Разгледайте най-търсените марки автомобили в България' 
              : 'Explore the most popular car brands in Bulgaria'}
          </SectionSubtitle>
        </SectionHeader>
        
        <ViewAllBrandsButton onClick={() => navigate('/cars')}>
          {language === 'bg' ? 'Виж всички марки →' : 'View All Brands →'}
        </ViewAllBrandsButton>

        <BrandsContainer>
          <HorizontalScrollContainer
            gap="0.75rem"
            padding="0"
            itemMinWidth="140px"
            showArrows={true}
          >
            {POPULAR_BRANDS.map(brand => {
              return (
                <BrandCard
                  key={brand.id}
                  onClick={() => handleBrandClick(brand.id)}
                  title={`${language === 'bg' ? 'Преглед' : 'View'} ${getBrandName(brand)} ${language === 'bg' ? 'автомобили' : 'cars'}`}
                >
                  <LogoContainer>
                    <img
                      src={`/assets/images/professional_car_logos/${brand.logo}`}
                      alt={brand.nameEn}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/logos/default-car.png';
                      }}
                    />
                  </LogoContainer>
                  <BrandName>{getBrandName(brand)}</BrandName>
                </BrandCard>
              );
            })}
          </HorizontalScrollContainer>
        </BrandsContainer>
      </ContentContainer>
    </SectionContainer>
  );
};

export default memo(PopularBrandsSection);