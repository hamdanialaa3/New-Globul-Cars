// Popular Car Brands Section
// قسم الماركات الشائعة مع الربط بالبيانات الحقيقية

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import styled from 'styled-components';

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
  padding: 3rem 1rem;
  background-image: url('/assets/backgrounds/metal-bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  transform: translateZ(0);
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    opacity: 0.8;
    z-index: 0;
  }
  
  @media (max-width: 600px) {
    padding: 2rem 1rem;
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

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const BrandCard = styled.button`
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  opacity: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--accent-orange);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 0.1;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-orange);
  }
  
  &:active {
    transform: translateY(-4px);
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
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

// ✅ Removed CarCount component - no need to display car counts

const ViewMoreButton = styled.button`
  background: var(--accent-orange);
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    opacity: 0.9;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 600px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
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

  const handleViewMore = () => {
    navigate('/cars');
  };

  const getBrandName = (brand: typeof POPULAR_BRANDS[0]) => {
    return language === 'bg' ? brand.nameBg : brand.nameEn;
  };

  return (
    <SectionContainer>
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

      <BrandsGrid>
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
      </BrandsGrid>

      <ViewMoreButton onClick={handleViewMore}>
        {language === 'bg' ? 'Виж Повече Марки' : 'More Brands'}
      </ViewMoreButton>
    </SectionContainer>
  );
};

export default memo(PopularBrandsSection);