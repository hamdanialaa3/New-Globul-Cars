/**
 * Dynamic Car Showcase Component
 * Smart container page that adapts based on pageType prop
 * Supports: family, sport, vip, classic, city, brand, new, used, economy, all
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { AlertTriangle, Search, ArrowUpDown, Loader } from 'lucide-react';
import { DocumentSnapshot } from 'firebase/firestore';
import { PageType } from '../../types/showcase.types';
import { CarListing } from '../../types/CarListing';
import {
  fetchCarsForPageType,
  fetchCarsForPageTypePaginated,
  getShowcaseConfig,
  countCarsForPageType,
  PaginatedResult
} from '../../services/queryBuilder.service';
import { logger } from '../../services/logger-service';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModernCarCard from '../01_main-pages/home/HomePage/ModernCarCard';

// Sort options type
type SortOption = 
  | 'price-asc' 
  | 'price-desc' 
  | 'year-desc' 
  | 'year-asc' 
  | 'mileage-asc' 
  | 'mileage-desc'
  | 'power-desc'
  | 'power-asc'
  | 'name-asc'
  | 'name-desc'
  | 'date-desc'
  | 'date-asc';

interface DynamicCarShowcaseProps {
  pageType: PageType;
}

const DynamicCarShowcase: React.FC<DynamicCarShowcaseProps> = ({ pageType }) => {
  const { cityName, brandName } = useParams<{ cityName?: string; brandName?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // State
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const PAGE_SIZE = 20;

  // Get dynamic param based on page type
  const dynamicParam = pageType === 'city' ? cityName : pageType === 'brand' ? brandName : undefined;

  // Get page configuration
  const config = useMemo(() => {
    return getShowcaseConfig(pageType, dynamicParam);
  }, [pageType, dynamicParam]);

  // Sort options with translations
  const sortOptions = useMemo(() => {
    const options = [
      { value: 'date-desc', labelEn: 'Newest First', labelBg: 'Най-нови първо', labelAr: 'Newest First' },
      { value: 'date-asc', labelEn: 'Oldest First', labelBg: 'Най-стари първо', labelAr: 'Oldest First' },
      { value: 'price-asc', labelEn: 'Price: Low to High', labelBg: 'Цена: Ниска към Висока', labelAr: 'Price: Low to High' },
      { value: 'price-desc', labelEn: 'Price: High to Low', labelBg: 'Цена: Висока към Ниска', labelAr: 'Price: High to Low' },
      { value: 'year-desc', labelEn: 'Year: Newest', labelBg: 'Година: Най-нова', labelAr: 'Year: Newest' },
      { value: 'year-asc', labelEn: 'Year: Oldest', labelBg: 'Година: Най-стара', labelAr: 'Year: Oldest' },
      { value: 'mileage-asc', labelEn: 'Mileage: Low to High', labelBg: 'Километри: Ниски към Високи', labelAr: 'Mileage: Low to High' },
      { value: 'mileage-desc', labelEn: 'Mileage: High to Low', labelBg: 'Километри: Високи към Ниски', labelAr: 'Mileage: High to Low' },
      { value: 'power-desc', labelEn: 'Power: High to Low', labelBg: 'Мощност: Висока към Ниска', labelAr: 'Power: High to Low' },
      { value: 'power-asc', labelEn: 'Power: Low to High', labelBg: 'Мощност: Ниска към Висока', labelAr: 'Power: Low to High' },
      { value: 'name-asc', labelEn: 'Name: A to Z', labelBg: 'Име: А към Я', labelAr: 'Name: A to Z' },
      { value: 'name-desc', labelEn: 'Name: Z to A', labelBg: 'Име: Я към А', labelAr: 'Name: Z to A' }
    ];
    
    return options.map(opt => ({
      value: opt.value as SortOption,
      label: language === 'bg' ? opt.labelBg : opt.labelEn
    }));
  }, [language]);

  // Sorted cars based on selected option
  const sortedCars = useMemo(() => {
    if (!cars || cars.length === 0) return [];

    const carsCopy = [...cars];

    switch (sortBy) {
      case 'price-asc':
        return carsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return carsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'year-desc':
        return carsCopy.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'year-asc':
        return carsCopy.sort((a, b) => (a.year || 0) - (b.year || 0));
      case 'mileage-asc':
        return carsCopy.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
      case 'mileage-desc':
        return carsCopy.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
      case 'power-desc':
        return carsCopy.sort((a, b) => (b.power || 0) - (a.power || 0));
      case 'power-asc':
        return carsCopy.sort((a, b) => (a.power || 0) - (b.power || 0));
      case 'name-asc':
        return carsCopy.sort((a, b) => {
          const nameA = `${a.make} ${a.model}`.toLowerCase();
          const nameB = `${b.make} ${b.model}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'name-desc':
        return carsCopy.sort((a, b) => {
          const nameA = `${a.make} ${a.model}`.toLowerCase();
          const nameB = `${b.make} ${b.model}`.toLowerCase();
          return nameB.localeCompare(nameA);
        });
      case 'date-desc':
        return carsCopy.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'date-asc':
        return carsCopy.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      default:
        return carsCopy;
    }
  }, [cars, sortBy]);

  // Fetch cars on mount or when pageType/param changes
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        lastDocRef.current = null;

        logger.info('Fetching cars for showcase', { pageType, dynamicParam });

        // ✅ FIXED: Use paginated fetch
        const result = await fetchCarsForPageTypePaginated(pageType, dynamicParam, PAGE_SIZE, null);
        setCars(result.items);
        setHasMore(result.hasMore);
        lastDocRef.current = result.lastDoc;

        // Count total (optional - can be heavy)
        const count = await countCarsForPageType(pageType, dynamicParam);
        setTotalCount(count);

        logger.info('Cars fetched successfully', { 
          pageType, 
          count: result.items.length,
          totalCount: count,
          hasMore: result.hasMore
        });

      } catch (err) {
        logger.error('Error loading cars for showcase', err, { pageType, dynamicParam });
        const errorMsg = language === 'bg' 
          ? 'Възникна грешка при зареждане на автомобилите. Моля, опитайте отново.'
          : 'Error loading cars. Please try again.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [pageType, dynamicParam]);

  // ✅ NEW: Load more handler with cursor-based pagination
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      const result = await fetchCarsForPageTypePaginated(
        pageType, 
        dynamicParam, 
        PAGE_SIZE, 
        lastDocRef.current
      );
      
      setCars(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      lastDocRef.current = result.lastDoc;

      logger.info('More cars loaded', {
        pageType,
        newItems: result.items.length,
        totalLoaded: cars.length + result.items.length,
        hasMore: result.hasMore
      });

    } catch (err) {
      logger.error('Error loading more cars', err, { pageType, dynamicParam });
    } finally {
      setLoadingMore(false);
    }
  }, [pageType, dynamicParam, loadingMore, hasMore, cars.length]);

  // Handle car click
  const handleCarClick = (car: CarListing) => {
    if (car.sellerNumericId && car.carNumericId) {
      navigate(`/car/${car.sellerNumericId}/${car.carNumericId}`);
    } else {
      logger.warn('Car missing numeric IDs', { carId: car.id });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <ErrorIcon><AlertTriangle size={48} /></ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={() => window.location.reload()}>
            {language === 'bg' ? 'Опитайте отново' : 'Try Again'}
          </RetryButton>
        </ErrorMessage>
      </Container>
    );
  }

  // Render empty state
  if (cars.length === 0) {
    return (
      <>
        <Helmet>
          <title>{config.metaTitle}</title>
          <meta name="description" content={config.metaDescription} />
          <meta name="keywords" content={config.metaKeywords} />
        </Helmet>
        <Container>
          <Header>
            <Title>{config.title}</Title>
            <Subtitle>{config.subtitle}</Subtitle>
          </Header>
          <EmptyState>
            <EmptyIcon><Search size={64} /></EmptyIcon>
            <EmptyTitle>
              {language === 'bg' ? 'Няма налични автомобили в момента' : 'No cars available at the moment'}
            </EmptyTitle>
            <EmptyDescription>
              {language === 'bg' 
                ? 'Опитайте да прегледате други категории или се върнете по-късно'
                : 'Try browsing other categories or come back later'
              }
            </EmptyDescription>
            <BackButton onClick={() => navigate('/')}>
              {language === 'bg' ? 'Назад към началната страница' : 'Back to Home'}
            </BackButton>
          </EmptyState>
        </Container>
      </>
    );
  }

  // Render cars grid
  return (
    <>
      <Helmet>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <meta name="keywords" content={config.metaKeywords} />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container>
        <Header>
          <Title>{config.title}</Title>
          <Subtitle>{config.subtitle}</Subtitle>
          {totalCount > 0 && (
            <ResultsCount>
              {language === 'bg' 
                ? `${totalCount > 50 ? 'Повече от 50' : totalCount} налични автомобили`
                : `${totalCount > 50 ? 'More than 50' : totalCount} cars available`
              }
            </ResultsCount>
          )}
        </Header>

        <ControlsBar>
          <ResultsInfo>
            {language === 'bg' 
              ? `Показани ${sortedCars.length} автомобили`
              : `Showing ${sortedCars.length} cars`
            }
          </ResultsInfo>
          
          <SortContainer>
            <SortLabel>
              <ArrowUpDown size={16} />
              {language === 'bg' ? 'Сортирай по:' : 'Sort by:'}
            </SortLabel>
            <SortSelect 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SortSelect>
          </SortContainer>
        </ControlsBar>

        <CarsGrid>
          {sortedCars.map((car) => (
            <ModernCarCard
              key={car.id}
              car={car}
              onClick={() => handleCarClick(car)}
            />
          ))}
        </CarsGrid>

        {hasMore && (
          <LoadMoreSection>
            <LoadMoreButton 
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {language === 'bg' ? 'Зареждане...' : 'Loading...'}
                </>
              ) : (
                language === 'bg' ? 'Покажи повече' : 'Load More'
              )}
            </LoadMoreButton>
            {totalCount > 0 && (
              <LoadMoreInfo>
                {language === 'bg' 
                  ? `Показани ${sortedCars.length} от ${totalCount} автомобили`
                  : `Showing ${sortedCars.length} of ${totalCount} cars`
                }
              </LoadMoreInfo>
            )}
          </LoadMoreSection>
        )}
      </Container>
    </>
  );
};

export default DynamicCarShowcase;

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 80vh;

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding: 20px 16px;
  background: ${({ theme }) => theme.cardBackground || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const ResultsCount = styled.div`
  display: inline-block;
  margin-top: 12px;
  padding: 6px 16px;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  color: #667eea;
  font-weight: 600;
  font-size: 13px;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 14px 18px;
  background: ${({ theme }) => theme.cardBackground || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px;
  }
`;

const ResultsInfo = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text || '#1f2937'};

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SortLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary || '#6b7280'};
  white-space: nowrap;

  svg {
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const SortSelect = styled.select`
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text || '#1f2937'};
  background: ${({ theme }) => theme.background || 'white'};
  border: 1.5px solid ${({ theme }) => theme.border || '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 180px;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  }

  option {
    padding: 6px;
    background: ${({ theme }) => theme.background || 'white'};
    color: ${({ theme }) => theme.text || '#1f2937'};
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    font-size: 12px;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const LoadMoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 36px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.35);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadMoreInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.textSecondary || '#6b7280'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  margin-bottom: 24px;
  opacity: 0.5;
  color: ${({ theme }) => theme.textSecondary || '#94a3b8'};
  
  svg {
    display: block;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text || '#fff'};
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const ErrorIcon = styled.div`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.error.main || '#ef4444'};
  
  svg {
    display: block;
  }
`;

const ErrorText = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  margin-bottom: 24px;
`;

const RetryButton = styled.button`
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
  }
`;
