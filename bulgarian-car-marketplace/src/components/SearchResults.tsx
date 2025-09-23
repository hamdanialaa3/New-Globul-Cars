import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { CarDataFromFile } from '../services/carDataBrowserService';

interface SearchResultsProps {
  results: CarDataFromFile[];
  searchParams: any;
  isLoading: boolean;
}

const ResultsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const ResultsCount = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NoResultsTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NoResultsText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const CarCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.base};
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows['2xl']};
  }
`;

const CarInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const CarTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const CarPrice = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const CarDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CarDetail = styled.span`
  display: flex;
  align-items: center;

  &:before {
    content: '•';
    margin-right: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchParams,
  isLoading
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <ResultsContainer>Loading results...</ResultsContainer>;
  }

  if (results.length === 0) {
    return (
      <ResultsContainer>
        <NoResults>
          <NoResultsTitle>{t('cars.noResults.title')}</NoResultsTitle>
          <NoResultsText>{t('cars.noResults.message')}</NoResultsText>
        </NoResults>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <ResultsHeader>
        <ResultsCount>
          Found {results.length} cars
        </ResultsCount>
      </ResultsHeader>

      <CarGrid>
        {results.map((car, index) => (
          <CarCard key={`${car.brand}-${car.model}-${car.year}-${index}`}>
            <CarInfo>
              <CarTitle>{`${car.brand} ${car.model}`}</CarTitle>
              <CarPrice>{car.price || 'Price not available'}</CarPrice>
              <CarDetails>
                <CarDetail>{car.year}</CarDetail>
                {car.fuelType && <CarDetail>{car.fuelType}</CarDetail>}
                {car.transmission && <CarDetail>{car.transmission}</CarDetail>}
                {car.engineSize && <CarDetail>{car.engineSize}</CarDetail>}
              </CarDetails>
            </CarInfo>
          </CarCard>
        ))}
      </CarGrid>
    </ResultsContainer>
  );
};

export { SearchResults };