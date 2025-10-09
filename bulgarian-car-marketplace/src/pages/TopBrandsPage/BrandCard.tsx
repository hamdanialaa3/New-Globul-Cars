// Brand Card Component
// Displays individual brand with statistics

import React from 'react';
import { BrandWithStats } from './types';
import {
  BrandCard as StyledCard,
  BrandLogoWrapper,
  BrandName,
  BrandStats,
  StatItem,
  BadgeContainer,
  Badge
} from './styles';

interface BrandCardProps {
  brand: BrandWithStats;
  language: 'bg' | 'en';
  onClick: (brandId: string) => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, language, onClick }) => {
  const getBadgeLabel = (reason?: string): string => {
    if (!reason) return '';
    
    if (reason === 'popular') {
      return language === 'bg' ? 'Популярен' : 'Popular';
    }
    
    if (reason === 'electric') {
      return language === 'bg' ? 'Електрически' : 'Electric';
    }
    
    return '';
  };

  return (
    <StyledCard
      featured={brand.featured}
      onClick={() => onClick(brand.id)}
    >
      <BrandLogoWrapper featured={brand.featured}>
        <img
          src={brand.logo}
          alt={brand.name}
          onError={(e) => {
            e.currentTarget.src = '/assets/brands/placeholder.svg';
          }}
        />
      </BrandLogoWrapper>
      
      <BrandName featured={brand.featured}>
        {brand.name}
      </BrandName>
      
      <BrandStats featured={brand.featured}>
        <StatItem featured={brand.featured}>
          <div className="label">
            {language === 'bg' ? 'Серии' : 'Series'}
          </div>
          <div className="value">{brand.totalSeries}</div>
        </StatItem>
        
        <StatItem featured={brand.featured}>
          <div className="label">
            {language === 'bg' ? 'Коли' : 'Cars'}
          </div>
          <div className="value">{brand.totalCars}</div>
        </StatItem>
      </BrandStats>
      
      {brand.reason && (
        <BadgeContainer>
          <Badge variant={brand.reason}>
            {getBadgeLabel(brand.reason)}
          </Badge>
        </BadgeContainer>
      )}
    </StyledCard>
  );
};

export default BrandCard;

