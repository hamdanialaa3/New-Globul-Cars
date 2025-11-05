// Category Section Component
// Displays a category of brands (Popular, Electric, etc.)

import React from 'react';
import { BrandWithStats } from './types';
import BrandCard from './BrandCard';
import {
  CategorySection as StyledSection,
  CategoryHeader,
  CategoryTitle,
  CategoryDescription,
  BrandsGrid
} from './styles';

interface CategorySectionProps {
  title: string;
  description: string;
  icon: string;
  brands: BrandWithStats[];
  language: 'bg' | 'en';
  onBrandClick: (brandId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  icon,
  brands,
  language,
  onBrandClick
}) => {
  if (brands.length === 0) return null;

  return (
    <StyledSection>
      <CategoryHeader>
        <CategoryTitle>
          <span className="icon">{icon}</span>
          {title}
        </CategoryTitle>
        <CategoryDescription>
          {description}
        </CategoryDescription>
      </CategoryHeader>
      
      <BrandsGrid>
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            language={language}
            onClick={onBrandClick}
          />
        ))}
      </BrandsGrid>
    </StyledSection>
  );
};

export default CategorySection;

