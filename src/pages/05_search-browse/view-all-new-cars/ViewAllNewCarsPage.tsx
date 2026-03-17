/**
 * ViewAllNewCarsPage.tsx
 * Dedicated page to display all new/latest cars
 * 
 * Features:
 * - Professional grid/list view toggle
 * - Sorting and filtering options
 * - Pagination
 * - Modern UI with glassmorphism
 * - Bilingual support
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { searchCars } from '@/services/car/unified-car-queries';
import { UnifiedCar } from '@/services/car/unified-car-types';
import { FiGrid, FiList } from 'react-icons/fi';
import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'year-desc';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 80px 20px 40px;
  
  @media (max-width: 768px) {
    padding: 70px 16px 24px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
  
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PageDescription = styled.p`
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(var(--card-rgb), 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 24px;
  }
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(var(--primary-rgb), 0.1);
  padding: 4px;
  border-radius: 12px;
`;

const ViewModeButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: ${props => props.$isActive ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$isActive ? 'white' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    font-size: 20px;
  }
  
  &:hover {
    background: ${props => props.$isActive ? 'var(--primary-color)' : 'rgba(var(--primary-rgb), 0.2)'};
  }
`;

const SortSelect = styled.select`
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text-primary);
  background: rgba(var(--card-rgb), 0.8);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }
  
  @media (max-width: 768px) {
    min-width: 150px;
    font-size: 14px;
  }
`;

const CarsGrid = styled.div<{ $viewMode: ViewMode }>`
  display: grid;
  grid-template-columns: ${props => props.$viewMode === 'grid' 
    ? 'repeat(auto-fill, minmax(300px, 1fr))' 
    : '1fr'};
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CarCard = styled.div<{ $viewMode: ViewMode }>`
  background: rgba(var(--card-rgb), 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  display: ${props => props.$viewMode === 'list' ? 'flex' : 'block'};
  flex-direction: ${props => props.$viewMode === 'list' ? 'row' : 'column'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(var(--primary-rgb), 0.2);
    border-color: var(--primary-color);
  }
`;

const CarImage = styled.div<{ $image: string; $viewMode: ViewMode }>`
  width: ${props => props.$viewMode === 'list' ? '300px' : '100%'};
  height: ${props => props.$viewMode === 'list' ? '200px' : '220px'};
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const CarInfo = styled.div`
  padding: 20px;
  flex: 1;
`;

const CarTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

const CarDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const CarDetail = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  padding: 6px 12px;
  background: rgba(var(--primary-rgb), 0.1);
  border-radius: 8px;
`;

const CarPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-top: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 18px;
  color: var(--text-secondary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  
  h3 {
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 16px;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const ViewAllNewCarsPage: React.FC = () => {
  const { currentLanguage, t } = useLanguage();
  const isRTL = currentLanguage === 'ar';
  
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  useEffect(() => {
    loadCars();
  }, [sortOption]);
  
  const loadCars = async () => {
    try {
      setLoading(true);
      
      // Get newest cars using unified search
      const allCars = await searchCars({}, 100);
      
      // Sort cars based on selected option
      let sortedCars = [...allCars];
      
      if (sortOption === 'newest') {
        sortedCars.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sortOption === 'price-asc') {
        sortedCars.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortOption === 'price-desc') {
        sortedCars.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (sortOption === 'year-desc') {
        sortedCars.sort((a, b) => (b.year || 0) - (a.year || 0));
      }
      
      setCars(sortedCars.slice(0, 50));
    } catch (error) {
      logger.error('Error loading cars', error as Error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer dir={isRTL ? 'rtl' : 'ltr'}>
      <ContentWrapper>
        <PageHeader>
          <PageTitle>
            {isRTL ? '???? ???????? ???????' : 'All New Cars'}
          </PageTitle>
          <PageDescription>
            {isRTL 
              ? '???? ???? ???????? ???????? ??? ??????'
              : 'Browse the latest cars available on our platform'
            }
          </PageDescription>
        </PageHeader>
        
        <ControlsBar>
          <ViewModeToggle>
            <ViewModeButton
              $isActive={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <FiGrid />
            </ViewModeButton>
            <ViewModeButton
              $isActive={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <FiList />
            </ViewModeButton>
          </ViewModeToggle>
          
          <SortSelect
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="newest">{isRTL ? '??????' : 'Newest'}</option>
            <option value="price-asc">{isRTL ? '?????: ?? ????? ??????' : 'Price: Low to High'}</option>
            <option value="price-desc">{isRTL ? '?????: ?? ?????? ?????' : 'Price: High to Low'}</option>
            <option value="year-desc">{isRTL ? '?????: ?????? ?????' : 'Year: Newest First'}</option>
          </SortSelect>
        </ControlsBar>
        
        {loading ? (
          <LoadingContainer>
            {isRTL ? '???? ???????...' : 'Loading...'}
          </LoadingContainer>
        ) : cars.length === 0 ? (
          <EmptyState>
            <h3>{isRTL ? '?? ???? ??????' : 'No Cars Found'}</h3>
            <p>{isRTL ? '?? ????? ?? ?????? ??? ?? ?????? ?? ????? ??????' : 'We couldn\'t find any cars at the moment'}</p>
          </EmptyState>
        ) : (
          <CarsGrid $viewMode={viewMode}>
            {cars.map((car) => (
              <CarCard
                key={car.id}
                $viewMode={viewMode}
                onClick={() => window.location.href = `/car/${car.sellerNumericId}/${car.carNumericId}`}
              >
                <CarImage
                  $image={car.images?.[car.featuredImageIndex || 0] || car.images?.[0] || '/images/placeholder.png'}
                  $viewMode={viewMode}
                />
                <CarInfo>
                  <CarTitle>
                    {car.make || car.brand} {car.model} {car.year}
                  </CarTitle>
                  <CarDetails>
                    <CarDetail>{car.year}</CarDetail>
                    <CarDetail>{car.mileage?.toLocaleString()} km</CarDetail>
                    <CarDetail>{car.fuelType}</CarDetail>
                  </CarDetails>
                  <CarPrice>
                    �{car.price?.toLocaleString()}
                  </CarPrice>
                </CarInfo>
              </CarCard>
            ))}
          </CarsGrid>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default ViewAllNewCarsPage;
