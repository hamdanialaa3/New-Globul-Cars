// src/pages/HomePage/QuickBrandsSection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import BrandIcon from './BrandIcon';
import { logger } from '../../../../services/logger-service';

// --- STYLED COMPONENTS (Metallic Pills) ---

const QuickBrandsContainer = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
`;

const BrandPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  color: #8899aa;
  font-size: 0.9rem;
  font-family: 'Exo 2', sans-serif;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
      background: rgba(0, 204, 255, 0.1);
      border-color: #00ccff;
      color: #fff;
      box-shadow: 0 0 10px rgba(0, 204, 255, 0.4);
      transform: translateY(-2px);
  }

  /* Make the icon turn colored or white on hover if possible */
  /* For now assuming BrandIcon handles coloring or we can force it via CSS filter */
`;

const QuickBrandsSection: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [popularBrands, setPopularBrands] = useState<string[]>([]);

  useEffect(() => {
    const loadPopularBrands = async () => {
      try {
        const allBrands = await brandsModelsDataService.getAllBrands();
        // Top 6 brands: Usually German + Toyota/Ford
        // In a real app we might hardcode specific popular ones here or fetch from an API
        const priorities = ['Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Toyota', 'Porsche'];

        // Filter out brands that exist in our priorities list
        const existingPriorities = priorities.filter(p => allBrands.includes(p));

        setPopularBrands(existingPriorities.length > 0 ? existingPriorities : allBrands.slice(0, 6));

      } catch (error) {
        logger.error('Error loading popular brands', error as Error);
      }
    };
    loadPopularBrands();
  }, []);

  const handleBrandClick = (brand: string) => {
    navigate(`/cars?make=${encodeURIComponent(brand)}`);
  };

  if (popularBrands.length === 0) return null;

  return (
    <QuickBrandsContainer>
      {popularBrands.map((brand) => (
        <BrandPill key={brand} onClick={() => handleBrandClick(brand)}>
          <BrandIcon brand={brand} size={20} />
          {brand}
        </BrandPill>
      ))}
    </QuickBrandsContainer>
  );
};

export default QuickBrandsSection;
