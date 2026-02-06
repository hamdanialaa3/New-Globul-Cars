import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { CarListing } from '../../../types/CarListing';
import { VEHICLE_COLLECTIONS } from '../../../services/car/unified-car-types';
import OptimizedImage from '../../../components/OptimizedImage';
import { MapPin, Gauge, Fuel, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { logger } from '../../../services/logger-service';

interface SimilarCarsWidgetProps {
  currentCar: CarListing;
  language: 'bg' | 'en';
}

const WidgetContainer = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  /* Hide scrollbar for cleaner look */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 3px;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  &:hover button {
    opacity: 1;
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$position}: -16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  opacity: 0;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: #1a1a1a;
  }

  @media (max-width: 768px) {
    display: none; /* Hide arrows on mobile, keep swipe */
  }
`;

const CarCard = styled.div`
  min-width: 280px;
  max-width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-primary);
  }
`;

const ImageWrapper = styled.div`
  height: 180px;
  position: relative;
  background: #f0f0f0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CarTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const SpecsRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  
  div {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
`;

export const SimilarCarsWidget: React.FC<SimilarCarsWidgetProps> = ({ currentCar, language }) => {
  const [similarCars, setSimilarCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchSimilar = async () => {
      // Logic: Same Make, Same Category if possible
      // Since we don't have composite indexes guaranteed, we stick to simple queries or in-memory filter
      try {
        const results: CarListing[] = [];

        // Try finding cars with same Make
        // We iterate through collections until we find enough
        for (const col of VEHICLE_COLLECTIONS) {
          if (results.length >= 4) break;

          const q = query(
            collection(db, col),
            where('make', '==', currentCar.make),
            limit(10) // Fetch more then filter
          );

          const snapshot = await getDocs(q);
          snapshot.docs.forEach(doc => {
            const data = doc.data() as CarListing;
            // Exclude current car
            if (doc.id !== currentCar.id && results.length < 4) {
              // Optional: Filter by price range +/- 50%
              // const priceDiffRatio = Math.abs(data.price - currentCar.price) / currentCar.price;
              // if (priceDiffRatio < 0.5) ...

              results.push({ ...data, id: doc.id });
            }
          });
        }

        setSimilarCars(results);
      } catch (err) {
        logger.error('Error fetching similar cars', err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (currentCar.make) {
      fetchSimilar();
    }
  }, [currentCar.make, currentCar.id]);

  if (loading || similarCars.length === 0) return null;

  const handleCarClick = (car: CarListing) => {
    // ✅ CONSTITUTION: Use numeric URL pattern
    const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
    const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
    
    if (sellerNumericId && carNumericId) {
      navigate(`/car/${sellerNumericId}/${carNumericId}`);
      window.scrollTo(0, 0);
    } else {
      // Car missing numeric IDs - redirect to search
      navigate('/cars');
      window.scrollTo(0, 0);
    }
  };

  return (
    <WidgetContainer>
      <Header>
        <Title>{language === 'bg' ? 'Подобни автомобили' : 'Similar Vehicles'}</Title>
        {/* View All link could go here */}
      </Header>

      <CarouselWrapper>
        <NavButton $position="left" onClick={() => scroll('left')}>
          <ChevronLeft size={20} />
        </NavButton>

        <ScrollContainer ref={scrollRef}>
          {similarCars.map((car: any) => (
            <CarCard key={car.id} onClick={() => handleCarClick(car)}>
              <ImageWrapper>
                <OptimizedImage
                  src={car.images && car.images.length > 0 ? car.images[car.featuredImageIndex || 0] || car.images[0] : '/images/placeholder.png'}
                  alt={`${car.make} ${car.model}`}
                />
              </ImageWrapper>
              <CardContent>
                <CarTitle>{car.make} {car.model} {car.year}</CarTitle>
                <Price>{car.price.toLocaleString()} {car.currency || 'EUR'}</Price>
                <SpecsRow>
                  <div><Gauge size={14} /> {car.mileage.toLocaleString()} km</div>
                  <div><Calendar size={14} /> {car.year}</div>
                </SpecsRow>
                <SpecsRow>
                  <div><Fuel size={14} /> {car.fuelType}</div>
                </SpecsRow>
                {car.city && (
                  <LocationRow>
                    <MapPin size={14} /> {car.city}
                  </LocationRow>
                )}
              </CardContent>
            </CarCard>
          ))}
        </ScrollContainer>

        <NavButton $position="right" onClick={() => scroll('right')}>
          <ChevronRight size={20} />
        </NavButton>
      </CarouselWrapper>
    </WidgetContainer>
  );
};
