// Quick Brands Section - Brand Pills for Quick Filtering
// قسم الماركات السريعة - حبوب الماركات للفلترة السريعة

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import BrandIcon from './BrandIcon';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';

const BrandsTicker = styled.div`
  margin-top: 40px;
  
  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

const BrandPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
  border: 1.5px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#d1d5db'};
  border-radius: 24px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : '#374151'};
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    transform: translateY(-1px);
    background: ${({ theme }) => theme.mode === 'dark' ? '#1f1f1f' : '#fafafa'};
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 4px 12px rgba(255, 215, 0, 0.15)' 
      : '0 4px 12px rgba(255, 143, 16, 0.15)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 7px 16px;
    font-size: 0.8125rem;
    gap: 6px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const QuickBrandsSection: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [popularBrands, setPopularBrands] = useState<string[]>([]);

  useEffect(() => {
    const loadPopularBrands = async () => {
      try {
        // Get top 6 popular brands
        const allBrands = await brandsModelsDataService.getAllBrands();
        setPopularBrands(allBrands.slice(0, 6));
      } catch (error) {
        console.error('Error loading popular brands:', error);
      }
    };
    
    loadPopularBrands();
  }, []);

  const handleBrandClick = (brand: string) => {
    navigate(`/cars?make=${encodeURIComponent(brand)}`);
  };

  if (popularBrands.length === 0) return null;

  return (
    <BrandsTicker>
      <HorizontalScrollContainer
        gap="12px"
        padding="0"
        itemMinWidth="auto"
        showArrows={true}
      >
        {popularBrands.map((brand) => (
          <BrandPill
            key={brand}
            onClick={() => handleBrandClick(brand)}
            title={`${language === 'bg' ? 'Преглед' : 'View'} ${brand} ${language === 'bg' ? 'автомобили' : 'cars'}`}
          >
            <BrandIcon brand={brand} size={18} />
            {brand}
          </BrandPill>
        ))}
      </HorizontalScrollContainer>
    </BrandsTicker>
  );
};

export default QuickBrandsSection;
