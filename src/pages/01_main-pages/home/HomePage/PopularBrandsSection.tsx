// Popular Car Brands Section

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import styled from 'styled-components';
// ✅ Removed HorizontalScrollContainer - using grid layout instead
// import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
// NOTE: glassmorphism mixins removed — BrandCard defines all its own styles explicitly

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
  { id: 'Peugeot', nameEn: 'Peugeot', nameBg: 'Пежо', logo: 'Peugeot.png' },
  { id: 'Nissan', nameEn: 'Nissan', nameBg: 'Нисан', logo: 'Nissan.png' },
  { id: 'Mazda', nameEn: 'Mazda', nameBg: 'Мазда', logo: 'Mazda.png' },
  { id: 'Honda', nameEn: 'Honda', nameBg: 'Хонда', logo: 'Honda.png' },
  { id: 'Fiat', nameEn: 'Fiat', nameBg: 'Фиат', logo: 'Fiat.png' },
  { id: 'SEAT', nameEn: 'SEAT', nameBg: 'Сеат', logo: 'SEAT.png' },
];

// Styled Components
const SectionContainer = styled.section`
  padding-top: 0px;
  padding-bottom: 0px;
  width: 100%;
  height: 100%;
  margin-top: 9px;
  margin-bottom: 9px;
  font-size: 0px;
  position: relative;
  transform: translateZ(0);
  will-change: transform;
  transition: background-color 0.3s ease;
  background: transparent;
  /* 🟣 Light purple border */
  border: 1px solid rgba(168, 85, 247, 0.12);
  border-radius: 8px;
  box-shadow: inset 0 0 8px rgba(168, 85, 247, 0.06);
  
  /* ✅ Removed background image and overlay */
  
  @media (max-width: 600px) {
    margin-top: 6px;
    margin-bottom: 6px;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px; /* mobile.de standard: 1400px max-width */
  margin: 0 auto;
  padding: 0 24px; /* mobile.de standard: 24px horizontal padding */
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    padding: 0 20px;
  }
  
  @media (max-width: 600px) {
    padding: 0 16px; /* mobile.de standard: 16px horizontal padding mobile */
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: -20px; /* ✅ Raised slightly towards top */
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    margin-bottom: 1.25rem;
    margin-top: -15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px; /* mobile.de standard: 24px / 1.5rem for H2 */
  font-weight: 600; /* mobile.de standard: semi-bold */
  color: var(--text-primary);
  margin-top: 29px;
  margin-bottom: 47px;
  line-height: 1.3; /* mobile.de standard */
  box-shadow: 0px 4px 12px 0px rgba(218, 11, 11, 0.15), inset 0px 4px 12px 0px rgba(240, 15, 15, 0.15), 0px 4px 12px 0px rgba(237, 29, 29, 0.15);
  filter: blur(0px);
  
  @media (max-width: 768px) {
    font-size: 22px; /* mobile.de tablet: 22px */
  }
  
  @media (max-width: 600px) {
    font-size: 22px; /* mobile.de mobile: 22px */
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

// ✅ Grid layout for uniform distribution
const BrandsContainer = styled.div`
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(142px, 1fr));
  gap: 12px;
  justify-items: center;
  align-items: start;
  padding: 0;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(142px, 1fr));
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
  }
`;

const BrandCard = styled.button`
  /* ✅ Fixed size: 142px × 153px (same as Mercedes-Benz) */
  width: 142px;
  height: 153px;
  min-width: 142px;
  min-height: 153px;
  max-width: 142px;
  max-height: 153px;
  
  /* 🌟 Glass Metallic Effect - modern glass metallic style */
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.25) 100%
  );
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(200, 200, 200, 0.4);
  border-top: 2px solid rgba(255, 255, 255, 0.6); /* highlight on top edge */
  border-radius: 16px;
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  opacity: 1;
  color: var(--text-primary);
  margin: 0;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5), /* inner highlight */
    inset 0 -1px 0 rgba(0, 0, 0, 0.1); /* inner shadow */
  
  @media (max-width: 768px) {
    width: 120px;
    height: 130px;
    min-width: 120px;
    min-height: 130px;
    max-width: 120px;
    max-height: 130px;
    padding: 0.875rem 0.625rem;
    gap: 10px;
  }
  
  @media (max-width: 600px) {
    width: 100px;
    height: 110px;
    min-width: 100px;
    min-height: 110px;
    max-width: 100px;
    max-height: 110px;
    padding: 0.75rem 0.5rem;
    gap: 8px;
  }

  html[data-theme="dark"] & {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.06) 50%,
      rgba(255, 255, 255, 0.12) 100%
    );
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* Metallic shimmer effect */
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

  /* Metallic reflection effect */
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
      #F0F0F0 0%,      /* Very light silver */
      #E0E0E0 25%,    /* Light silver */
      #D0D0D0 50%,    /* Silver */
      #E0E0E0 75%,    /* Light silver */
      #F0F0F0 100%    /* Very light silver */
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
      #5A5A5A 0%,      /* Light dark gray */
      #4A4A4A 25%,     /* Dark gray */
      #3A3A3A 50%,     /* Dark gray */
      #4A4A4A 75%,     /* Dark gray */
      #5A5A5A 100%     /* Light dark gray */
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
  width: 261px;
  padding: 6px 0px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 29px auto 10px;
  display: block;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  background-color: rgba(205, 24, 24, 0.08);

  /* Light mode: Indigo gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%);
    color: #ffffff;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
  }

  /* Dark mode: Deep indigo */
  html[data-theme="dark"] & {
    background: #1E1B4B;
    color: #A5B4FC;
    border: 2px solid #6366F1;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #4F46E5 100%);
      box-shadow: 0 8px 30px rgba(79, 70, 229, 0.5);
    }
    html[data-theme="dark"] & {
      background: #2d2a5e;
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
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
    // Navigate to cars listing with the brand filter actively applied
    // This allows the search widget to pick up the 'make' parameter and display results instantly
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
          {/* ✅ Grid layout instead of horizontal scroll */}
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
                    width="60"
                    height="60"
                    onError={(e) => {
                      // Prevent infinite loop
                      if (!e.currentTarget.dataset.errorHandled) {
                        e.currentTarget.dataset.errorHandled = 'true';
                        e.currentTarget.src = '/assets/images/car-placeholder.svg';
                      }
                    }}
                  />
                </LogoContainer>
                <BrandName>{getBrandName(brand)}</BrandName>
              </BrandCard>
            );
          })}
        </BrandsContainer>
      </ContentContainer>
    </SectionContainer>
  );
};

export default memo(PopularBrandsSection);