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
  isDark?: boolean;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, language, onClick, isDark }) => {
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
      $isDark={isDark}
      onClick={() => onClick(brand.id)}
    >
      <BrandLogoWrapper featured={brand.featured} $isDark={isDark}>
        <img
          src={brand.logo}
          alt={brand.name}
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.errorHandled) {
              img.dataset.errorHandled = 'true';
              img.src = '/assets/brands/placeholder.svg';
            }
          }}
        />
      </BrandLogoWrapper>

      <BrandName featured={brand.featured} $isDark={isDark}>
        {brand.name}
      </BrandName>

      <BrandStats featured={brand.featured} $isDark={isDark}>
        <StatItem featured={brand.featured} $isDark={isDark}>
          <div className="label">
            {language === 'bg' ? 'Серии' : 'Series'}
          </div>
          <div className="value">{brand.totalSeries}</div>
        </StatItem>

        <StatItem featured={brand.featured} $isDark={isDark}>
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

