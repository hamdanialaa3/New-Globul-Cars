// Popular Car Brands Section
// قسم الماركات الشائعة مع الربط بالبيانات الحقيقية

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { bulgarianCarService } from '../../firebase/car-service';

// Popular brands configuration with logos
const POPULAR_BRANDS = [
  { id: 'Audi', nameEn: 'Audi', nameBg: 'Ауди', logo: 'Audi.png' },
  { id: 'BMW', nameEn: 'BMW', nameBg: 'БМВ', logo: 'BMW.png' },
  { id: 'Ford', nameEn: 'Ford', nameBg: 'Форд', logo: 'Ford.png' },
  { id: 'Mercedes-Benz', nameEn: 'Mercedes-Benz', nameBg: 'Мерцедес-Бенц', logo: 'Mercedes-Benz.png' },
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
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
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

const BrandCard = styled.button<{ $hasCount: boolean }>`
  background: white;
  border: 2px solid ${props => props.$hasCount ? '#FF8F10' : '#e0e0e0'};
  border-radius: 16px;
  padding: 1.5rem 1rem;
  cursor: ${props => props.$hasCount ? 'pointer' : 'not-allowed'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$hasCount ? 1 : 0.5};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 143, 16, 0.1) 0%, rgba(255, 223, 0, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: ${props => props.$hasCount ? 1 : 0};
  }
  
  &:hover {
    transform: ${props => props.$hasCount ? 'translateY(-8px)' : 'none'};
    box-shadow: ${props => props.$hasCount ? '0 12px 40px rgba(255, 143, 16, 0.3)' : 'none'};
    border-color: ${props => props.$hasCount ? '#FFDF00' : '#e0e0e0'};
  }
  
  &:active {
    transform: ${props => props.$hasCount ? 'translateY(-4px)' : 'none'};
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
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CarCount = styled.div<{ $hasCount: boolean }>`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${props => props.$hasCount ? '#FF8F10' : '#adb5bd'};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ViewMoreButton = styled.button`
  background: linear-gradient(135deg, #FF8F10 0%, #FFDF00 100%);
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 143, 16, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
`;

interface BrandCount {
  brandId: string;
  count: number;
}

const PopularBrandsSection: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch real car counts for each brand from Firebase
  useEffect(() => {
    const fetchBrandCounts = async () => {
      try {
        setLoading(true);
        const counts: Record<string, number> = {};
        
        // Fetch count for each popular brand
        for (const brand of POPULAR_BRANDS) {
          try {
            const result = await bulgarianCarService.searchCars(
              { make: brand.id },
              'createdAt',
              'desc',
              100
            );
            counts[brand.id] = result.cars.length || 0;
          } catch (error) {
            console.error(`Error fetching count for ${brand.id}:`, error);
            counts[brand.id] = 0;
          }
        }
        
        setBrandCounts(counts);
      } catch (error) {
        console.error('Error fetching brand counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandCounts();
  }, []);

  const handleBrandClick = (brandId: string, count: number) => {
    if (count > 0) {
      navigate(`/cars?make=${encodeURIComponent(brandId)}`);
    }
  };

  const handleViewMore = () => {
    navigate('/cars');
  };

  const getBrandName = (brand: typeof POPULAR_BRANDS[0]) => {
    return language === 'bg' ? brand.nameBg : brand.nameEn;
  };

  if (loading) {
    return (
      <SectionContainer>
        <LoadingState>
          {language === 'bg' ? 'Зареждане на марки...' : 'Loading brands...'}
        </LoadingState>
      </SectionContainer>
    );
  }

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
          const count = brandCounts[brand.id] || 0;
          const hasCount = count > 0;
          
          return (
            <BrandCard
              key={brand.id}
              onClick={() => handleBrandClick(brand.id, count)}
              $hasCount={hasCount}
              disabled={!hasCount}
              title={hasCount 
                ? `${language === 'bg' ? 'Преглед' : 'View'} ${count} ${language === 'bg' ? 'автомобила' : 'cars'}`
                : language === 'bg' ? 'Няма налични автомобили' : 'No cars available'}
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
              <CarCount $hasCount={hasCount}>
                {count > 0 
                  ? `${count} ${language === 'bg' ? 'автомобила' : 'cars'}`
                  : language === 'bg' ? 'Скоро' : 'Coming soon'}
              </CarCount>
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

export default PopularBrandsSection;

