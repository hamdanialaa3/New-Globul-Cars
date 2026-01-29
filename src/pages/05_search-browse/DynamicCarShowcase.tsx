/**
 * Dynamic Car Showcase Component
 * Smart container page that adapts based on pageType prop
 * Supports: family, sport, vip, classic, city, brand, new, used, economy, all
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { AlertTriangle, Search } from 'lucide-react';
import { PageType } from '../../types/showcase.types';
import { CarListing } from '../../types/CarListing';
import {
  fetchCarsForPageType,
  getShowcaseConfig,
  countCarsForPageType
} from '../../services/queryBuilder.service';
import { logger } from '../../services/logger-service';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModernCarCard from '../01_main-pages/home/HomePage/ModernCarCard';

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
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Get dynamic param based on page type
  const dynamicParam = pageType === 'city' ? cityName : pageType === 'brand' ? brandName : undefined;

  // Get page configuration
  const config = useMemo(() => {
    return getShowcaseConfig(pageType, dynamicParam);
  }, [pageType, dynamicParam]);

  // Fetch cars on mount or when pageType/param changes
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.info('Fetching cars for showcase', { pageType, dynamicParam });

        // Fetch cars
        const fetchedCars = await fetchCarsForPageType(pageType, dynamicParam, 50);
        setCars(fetchedCars);

        // Count total (optional - can be heavy)
        const count = await countCarsForPageType(pageType, dynamicParam);
        setTotalCount(count);

        logger.info('Cars fetched successfully', { 
          pageType, 
          count: fetchedCars.length,
          totalCount: count 
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

        <CarsGrid>
          {cars.map((car) => (
            <ModernCarCard
              key={car.id}
              car={car}
              onClick={() => handleCarClick(car)}
            />
          ))}
        </CarsGrid>

        {totalCount > 50 && (
          <LoadMoreSection>
            <LoadMoreButton onClick={() => {
              // TODO: Implement pagination
              logger.info('Load more clicked - pagination not yet implemented');
            }}>
              {language === 'bg' ? 'Покажи повече' : 'Load More'}
            </LoadMoreButton>
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
  padding: 40px 20px;
  min-height: 80vh;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: ${({ theme }) => theme.cardBackground || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ResultsCount = styled.div`
  display: inline-block;
  margin-top: 16px;
  padding: 8px 20px;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 20px;
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const LoadMoreSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const LoadMoreButton = styled.button`
  padding: 16px 48px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
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
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.text || '#fff'};
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  margin-bottom: 32px;
`;

const BackButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
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
  font-size: 18px;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  margin-bottom: 32px;
`;

const RetryButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;
