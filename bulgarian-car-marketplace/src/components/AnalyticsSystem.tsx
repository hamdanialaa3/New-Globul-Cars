import React from 'react';
import styled from 'styled-components';
import { CarDataFromFile, AdvancedSearchParams } from '@/types/CarData';

interface AnalyticsSystemProps {
  searchResults: CarDataFromFile[];
  searchParams: AdvancedSearchParams;
  searchDuration: number;
}

export const AnalyticsSystem: React.FC<AnalyticsSystemProps> = ({
  searchResults,
  searchParams,
  searchDuration
}) => {
  const getPriceDistribution = () => {
    const priceRanges = [
      { range: '0-5,000€', min: 0, max: 5000, count: 0 },
      { range: '5,001-10,000€', min: 5001, max: 10000, count: 0 },
      { range: '10,001-20,000€', min: 10001, max: 20000, count: 0 },
      { range: '20,001-30,000€', min: 20001, max: 30000, count: 0 },
      { range: '30,001-50,000€', min: 30001, max: 50000, count: 0 },
      { range: '50,001+€', min: 50001, max: Infinity, count: 0 }
    ];

    searchResults.forEach(car => {
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

    searchResults.forEach(car => {
      brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
    });

    return Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count }));
  };

  const getTopLocations = () => {
    const locationCounts: Record<string, number> = {};

    searchResults.forEach(car => {
      locationCounts[car.location] = (locationCounts[car.location] || 0) + 1;
    });

    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  };

  const getFuelTypeDistribution = () => {
    const fuelCounts: Record<string, number> = {};

    searchResults.forEach(car => {
      fuelCounts[car.fuelType] = (fuelCounts[car.fuelType] || 0) + 1;
    });

    return Object.entries(fuelCounts)
      .map(([fuelType, count]) => ({
        fuelType: fuelType === 'petrol' ? 'Бензин' :
                 fuelType === 'diesel' ? 'Дизел' :
                 fuelType === 'electric' ? 'Електрически' : 'Хибриден',
        count
      }));
  };

  const priceDistribution = getPriceDistribution();
  const topBrands = getTopBrands();
  const topLocations = getTopLocations();
  const fuelDistribution = getFuelTypeDistribution();

  const averagePrice = searchResults.length > 0
    ? Math.round(searchResults.reduce((sum, car) => sum + car.price, 0) / searchResults.length)
    : 0;

  const averageMileage = searchResults.length > 0
    ? Math.round(searchResults.reduce((sum, car) => sum + car.mileage, 0) / searchResults.length)
    : 0;

  const averageYear = searchResults.length > 0
    ? Math.round(searchResults.reduce((sum, car) => sum + car.year, 0) / searchResults.length)
    : 0;

  return (
    <AnalyticsContainer>
      <AnalyticsTitle>Статистика на търсенето</AnalyticsTitle>

      <StatsGrid>
        <StatCard>
          <StatNumber>{searchResults.length}</StatNumber>
          <StatLabel>Намерени автомобили</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{searchDuration}ms</StatNumber>
          <StatLabel>Време за търсене</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{averagePrice}€</StatNumber>
          <StatLabel>Средна цена</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{averageMileage.toLocaleString()} km</StatNumber>
          <StatLabel>Среден пробег</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{averageYear}</StatNumber>
          <StatLabel>Средна година</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{new Set(searchResults.map(car => car.brand)).size}</StatNumber>
          <StatLabel>Различни марки</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>Разпределение на цените</ChartTitle>
          <PriceBars>
            {priceDistribution.map(range => (
              <PriceBar key={range.range}>
                <BarLabel>{range.range}</BarLabel>
                <BarContainer>
                  <BarFill
                    width={`${(range.count / Math.max(...priceDistribution.map(r => r.count))) * 100}%`}
                  />
                </BarContainer>
                <BarCount>{range.count}</BarCount>
              </PriceBar>
            ))}
          </PriceBars>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Топ марки</ChartTitle>
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

        <ChartContainer>
          <ChartTitle>Топ локации</ChartTitle>
          <LocationList>
            {topLocations.map(({ location, count }) => (
              <LocationItem key={location}>
                <LocationName>{location}</LocationName>
                <LocationCount>{count}</LocationCount>
                <LocationBar width={`${(count / searchResults.length) * 100}%`} />
              </LocationItem>
            ))}
          </LocationList>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Тип гориво</ChartTitle>
          <FuelList>
            {fuelDistribution.map(({ fuelType, count }) => (
              <FuelItem key={fuelType}>
                <FuelName>{fuelType}</FuelName>
                <FuelCount>{count}</FuelCount>
                <FuelBar width={`${(count / searchResults.length) * 100}%`} />
              </FuelItem>
            ))}
          </FuelList>
        </ChartContainer>
      </ChartsGrid>

      {searchParams.make && (
        <SearchSummary>
          <SummaryTitle>Обобщение на търсенето</SummaryTitle>
          <SummaryText>
            Търсихте {searchParams.make}
            {searchParams.model && ` ${searchParams.model}`}
            {searchParams.minPrice && ` от ${searchParams.minPrice}€`}
            {searchParams.maxPrice && ` до ${searchParams.maxPrice}€`}
            {searchParams.city && ` в ${searchParams.city}`}
            {searchParams.fuelType.length > 0 && ` с ${searchParams.fuelType.join(', ')}`}
            . Намерени бяха {searchResults.length} автомобила.
          </SummaryText>
        </SearchSummary>
      )}
    </AnalyticsContainer>
  );
};

// Styled Components
const AnalyticsContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const AnalyticsTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
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
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
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
`;

const ChartTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
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
`;

const BrandCount = styled.span`
  min-width: 30px;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const BrandBar = styled.div<{ width: string }>`
  background: ${({ theme }) => theme.colors.primary.light};
  height: 8px;
  width: ${props => props.width};
  border-radius: 4px;
`;

const LocationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LocationItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const LocationName = styled.span`
  min-width: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const LocationCount = styled.span`
  min-width: 30px;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const LocationBar = styled.div<{ width: string }>`
  background: ${({ theme }) => theme.colors.secondary.main};
  height: 8px;
  width: ${props => props.width};
  border-radius: 4px;
`;

const FuelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FuelItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const FuelName = styled.span`
  min-width: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const FuelCount = styled.span`
  min-width: 30px;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const FuelBar = styled.div<{ width: string }>`
  background: ${({ theme }) => theme.colors.success.main};
  height: 8px;
  width: ${props => props.width};
  border-radius: 4px;
`;

const SearchSummary = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary.light}20;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
`;

const SummaryTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const SummaryText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
`;

export default AnalyticsSystem;