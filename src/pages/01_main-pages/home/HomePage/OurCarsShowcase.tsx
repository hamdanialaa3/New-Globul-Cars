/**
 * OurCarsShowcase.tsx
 * Нашите коли / Our Cars — All Real User-Added Listings
 *
 * Premium grid section showing every real car listing on the platform.
 * Desktop: 4 columns × 3 rows (12 cars visible, "View All" for rest)
 * Tablet: 3 columns × 3 rows
 * Mobile: 2 columns × 3 rows
 * Sorted by createdAt (newest first).
 * Admin-toggleable via useSectionVisibility key: 'our_cars'.
 *
 * @performance Lazy-loaded, queries all VEHICLE_COLLECTIONS in parallel
 */

import React, { useState, useEffect, memo, useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Car, ArrowRight, Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';
import { UnifiedCar, VEHICLE_COLLECTIONS, mapDocToCar } from '../../../../services/car';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { logger } from '../../../../services/logger-service';
import PremiumHomeCarCard from '../../../../components/CarCard/PremiumHomeCarCard';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Section = styled.section`
  width: 100%;
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary, #6366f1));
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    border-radius: 10px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  font-weight: 400;
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: var(--accent-primary);
    color: #fff;
    border-color: var(--accent-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
`;

const CardWrapper = styled.div`
  perspective: 1000px;
  
  /* Ensure cards are the same height in each row */
  display: flex;
  
  & > * {
    width: 100%;
  }
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 14px;
  background: var(--accent-primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary);
  gap: 1rem;

  svg {
    animation: led-orbit 1.2s linear infinite;
    color: #4F46E5;
  }

  @keyframes led-orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 16px;
  border: 2px dashed var(--border-primary);

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.4;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
  }

  p {
    font-size: 0.875rem;
    margin: 0;
  }
`;

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  bg: {
    title: 'Нашите коли',
    subtitle: 'Всички обяви от нашите потребители',
    viewAll: 'Виж всички',
    loading: 'Зареждане на обяви...',
    empty: 'Все още няма обяви',
    emptyDesc: 'Бъдете първият, който добави обява!',
  },
  en: {
    title: 'Our Cars',
    subtitle: 'All listings from our users',
    viewAll: 'View All',
    loading: 'Loading listings...',
    empty: 'No listings yet',
    emptyDesc: 'Be the first to add a listing!',
  },
};

// ============================================================================
// MAX DISPLAY COUNT (4 columns × 3 rows)
// ============================================================================

const MAX_DISPLAY = 12;

// ============================================================================
// COMPONENT
// ============================================================================

const OurCarsShowcase: React.FC = () => {
  const { language } = useLanguage();
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const text = translations[language];

  useEffect(() => {
    let isActive = true; // isActive guard per project convention

    const fetchAllCars = async () => {
      try {
        setLoading(true);

        // Query ALL vehicle collections in parallel
        const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
          try {
            const q = query(
              collection(db, collectionName),
              orderBy('createdAt', 'desc'),
              limit(MAX_DISPLAY * 2) // Over-fetch to compensate for filtering
            );

            const snapshot = await getDocs(q);
            return snapshot.docs
              .map((doc) => {
                try {
                  return mapDocToCar(doc);
                } catch {
                  return null;
                }
              })
              .filter((car): car is UnifiedCar => {
                if (!car) return false;
                const status = (car as any).status;
                const isPublished = status === 'published' || status === 'active';
                const isActive = car.isActive !== false;
                return isActive || isPublished;
              });
          } catch (error) {
            logger.error(`OurCarsShowcase: Error querying ${collectionName}`, error as Error);
            return [];
          }
        });

        const results = await Promise.all(queryPromises);
        const allCars = results.flat();

        // Sort by createdAt descending (newest first)
        allCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (!isActive) return;

        setTotalCount(allCars.length);
        setCars(allCars.slice(0, MAX_DISPLAY));
      } catch (error) {
        logger.error('OurCarsShowcase: Failed to fetch cars', error as Error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchAllCars();

    return () => {
      isActive = false;
    };
  }, []);

  // Memoize displayed cars to prevent unnecessary re-renders
  const displayedCars = useMemo(() => cars, [cars]);

  if (loading) {
    return (
      <Section aria-label={text.title}>
        <LoadingState>
          <Loader2 size={32} />
          <span>{text.loading}</span>
        </LoadingState>
      </Section>
    );
  }

  if (displayedCars.length === 0) {
    return (
      <Section aria-label={text.title}>
        <EmptyState>
          <Car />
          <h3>{text.empty}</h3>
          <p>{text.emptyDesc}</p>
        </EmptyState>
      </Section>
    );
  }

  return (
    <Section aria-label={text.title}>
      <Header>
        <div>
          <TitleGroup>
            <IconWrap>
              <Car size={22} />
            </IconWrap>
            <div>
              <Title>
                {text.title}
                {totalCount > MAX_DISPLAY && (
                  <CountBadge>{totalCount}+</CountBadge>
                )}
              </Title>
              <Subtitle>{text.subtitle}</Subtitle>
            </div>
          </TitleGroup>
        </div>

        <ViewAllLink to="/cars?sort=latest">
          {text.viewAll}
          <ArrowRight size={16} />
        </ViewAllLink>
      </Header>

      <CarsGrid>
        {displayedCars.map((car) => (
          <CardWrapper key={car.id}>
            <PremiumHomeCarCard car={car} />
          </CardWrapper>
        ))}
      </CarsGrid>
    </Section>
  );
};

OurCarsShowcase.displayName = 'OurCarsShowcase';

export default memo(OurCarsShowcase);
