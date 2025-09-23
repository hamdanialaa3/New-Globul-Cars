// src/components/analytics/AnalyticsSystem.tsx
// نظام الإحصائيات والتحليلات لسوق السيارات البلغاري

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';

interface AnalyticsSystemProps {
  searchResults: any[];
  searchParams: any;
  searchDuration: number;
}

export const AnalyticsSystem: React.FC<AnalyticsSystemProps> = ({
  searchResults,
  searchParams,
  searchDuration
}) => {
  const { t } = useTranslation();

  const getPriceDistribution = () => {
    const priceRanges = [
      { range: '0-5,000€', min: 0, max: 5000, count: 0 },
      { range: '5,001-10,000€', min: 5001, max: 10000, count: 0 },
      { range: '10,001-20,000€', min: 10001, max: 20000, count: 0 },
      { range: '20,001-30,000€', min: 20001, max: 30000, count: 0 },
      { range: '30,001+€', min: 30001, max: Infinity, count: 0 }
    ];

    searchResults.forEach((car: any) => {
      priceRanges.forEach(range => {
        if (car.price >= range.min && car.price <= range.max) {
          range.count++;
        }
      });
    });

    return priceRanges;
  };

  const getTopBrands = () => {
    const brandCounts: Record<string, number> = {};

    searchResults.forEach((car: any) => {
      brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
    });

    return Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count }));
  };

  const getAveragePrice = () => {
    if (searchResults.length === 0) return 0;
    return Math.round(searchResults.reduce((sum: number, car: any) => sum + car.price, 0) / searchResults.length);
  };

  const priceDistribution = getPriceDistribution();
  const topBrands = getTopBrands();
  const averagePrice = getAveragePrice();

  return (
    <AnalyticsContainer>
      <AnalyticsTitle>{t('analytics.searchStats', 'Статистика на търсенето')}</AnalyticsTitle>

      <StatsGrid>
        <StatCard>
          <StatNumber>{searchResults.length}</StatNumber>
          <StatLabel>{t('analytics.foundCars', 'Намерени автомобили')}</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{searchDuration}ms</StatNumber>
          <StatLabel>{t('analytics.searchTime', 'Време за търсене')}</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{averagePrice}€</StatNumber>
          <StatLabel>{t('analytics.averagePrice', 'Средна цена')}</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>{t('analytics.priceDistribution', 'Разпределение на цените')}</ChartTitle>
          <PriceBars>
            {priceDistribution.map(range => (
              <PriceBar key={range.range}>
                <BarLabel>{range.range}</BarLabel>
                <BarContainer>
                  <BarFill
                    width={`${searchResults.length > 0 ? (range.count / searchResults.length) * 100 : 0}%`}
                  />
                </BarContainer>
                <BarCount>{range.count}</BarCount>
              </PriceBar>
            ))}
          </PriceBars>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>{t('analytics.topBrands', 'Топ марки')}</ChartTitle>
          <BrandsList>
            {topBrands.map(({ brand, count }) => (
              <BrandItem key={brand}>
                <BrandName>{brand}</BrandName>
                <BrandCount>{count}</BrandCount>
                <BrandBar width={`${(count / searchResults.length) * 100}%`} />
              </BrandItem>
            ))}
          </BrandsList>
        </ChartContainer>
      </ChartsGrid>
    </AnalyticsContainer>
  );
};

const AnalyticsContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AnalyticsTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ChartContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.paper};
`;

const ChartTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PriceBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PriceBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const BarLabel = styled.span`
  min-width: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BarContainer = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.grey[200]};
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
`;

const BarFill = styled.div<{ width: string }>`
  background: ${({ theme }) => theme.colors.primary.main};
  height: 100%;
  width: ${props => props.width};
  transition: width 0.3s ease-in-out;
`;

const BarCount = styled.span`
  min-width: 30px;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const BrandsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const BrandItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const BrandName = styled.span`
  min-width: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BrandCount = styled.span`
  min-width: 30px;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const BrandBar = styled.div<{ width: string }>`
  background: ${({ theme }) => theme.colors.primary.light};
  height: 8px;
  width: ${props => props.width};
  border-radius: 4px;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
`;

export default AnalyticsSystem;