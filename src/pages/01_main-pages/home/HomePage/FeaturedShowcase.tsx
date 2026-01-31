/**
 * FeaturedShowcase.tsx
 * Premium Featured Cars Showcase Section
 * Премиум витрина за избрани автомобили
 * 
 * ✅ UPDATED: January 28, 2026 - Real Firestore data instead of mock
 * 
 * Features:
 * - Dark cinematic background with image overlay
 * - Smart category filters (All, VIP, Offroad, City)
 * - Premium car cards with animations
 * - Search buttons integration
 * - Bilingual support (BG/EN)
 * - Dark/Light theme support
 * - ✅ Real Firestore data fetching
 */

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Gauge, Fuel, Calendar, ArrowRight, Heart, ShieldCheck, Search, SlidersHorizontal, Globe, Crown, Mountain, Building2 } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import { getFeaturedCars } from '../../../../services/car/unified-car-queries';
import { UnifiedCar } from '../../../../services/car/unified-car-types';
import { logger } from '../../../../services/logger-service';
import { useFavorites } from '../../../../hooks/useFavorites';

// ============================================================================
// TYPES
// ============================================================================

interface DisplayCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  location: string;
  mileage: string;
  fuel: string;
  category: string;
  image: string;
  badge: string;
  sellerNumericId?: number;
  carNumericId?: number;
  driveType?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map UnifiedCar to DisplayCar format
 */
const mapToDisplayCar = (car: UnifiedCar, language: string): DisplayCar => {
  // Determine category based on car properties
  let category = 'city';
  const driveType = car.driveType?.toLowerCase() || '';
  const bodyType = car.bodyType?.toLowerCase() || '';
  
  if (driveType.includes('4wd') || driveType.includes('awd') || bodyType.includes('suv') || bodyType.includes('offroad')) {
    category = 'offroad';
  } else if (car.price >= 100000) {
    category = 'vip';
  }

  // Get badge text
  let badge = language === 'bg' ? 'Избрано' : 'Featured';
  if (car.isVerified) badge = language === 'bg' ? 'Проверен дилър' : 'Verified Dealer';
  else if (car.warranty) badge = language === 'bg' ? 'С гаранция' : 'Warranty';
  else if (car.fullServiceHistory) badge = language === 'bg' ? 'Пълна история' : 'Full History';

  // Format mileage
  const mileageFormatted = car.mileage 
    ? `${car.mileage.toLocaleString()} km` 
    : 'N/A';

  // Get location
  const location = car.locationData?.city || car.location || (language === 'bg' ? 'България' : 'Bulgaria');

  // Get main image - use featuredImageIndex if available, otherwise first image
  const featuredIdx = car.featuredImageIndex || 0;
  const image = car.mainImage || car.images?.[featuredIdx] || car.images?.[0] || '/images/placeholder.png';

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    currency: 'BGN',
    location,
    mileage: mileageFormatted,
    fuel: car.fuelType || 'Petrol',
    category,
    image,
    badge,
    sellerNumericId: car.sellerNumericId,
    carNumericId: car.carNumericId,
    driveType: car.driveType,
  };
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Section = styled.section<{ $isDark: boolean }>`
  position: relative;
  width: 100%;
  padding: 5rem 0;
  overflow: hidden;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const BackgroundLayer = styled.div<{ $isDark: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 0;
  
  /* Pure CSS gradient instead of external image for instant render */
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$isDark
    ? 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(37, 99, 235, 0.1), transparent 60%)'
    : 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(37, 99, 235, 0.05), transparent 60%)'};
  }
`;

const Container = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1400px; /* mobile.de standard: 1400px max-width */
  margin: 0 auto;
  padding: 0 24px; /* mobile.de standard: 24px horizontal padding */

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 16px; /* mobile.de standard: 16px horizontal padding mobile */
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled(motion.h2) <{ $isDark: boolean }>`
  font-size: 24px; /* mobile.de standard: 24px / 1.5rem for H2 */
  font-weight: 600; /* mobile.de standard: semi-bold */
  line-height: 1.3; /* mobile.de standard */
  margin: 0 0 1rem;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #60a5fa 0%, #ffffff 50%, #60a5fa 100%)'
    : 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #2563eb 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 22px; /* mobile.de mobile: 22px */
  }
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 16px; /* mobile.de standard: 16px / 1rem */
  font-weight: 400; /* mobile.de standard: regular */
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  max-width: 42rem;
  margin: 0 auto;
  line-height: 1.6; /* mobile.de standard */

  @media (max-width: 768px) {
    font-size: 16px; /* mobile.de mobile: minimum 16px to prevent iOS zoom */
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
`;

const FilterButton = styled(motion.button) <{ $isDark: boolean; $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$active
    ? (props.$isDark ? 'rgba(37, 99, 235, 0.5)' : 'rgba(37, 99, 235, 0.3)')
    : (props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  background: ${props => props.$active
    ? (props.$isDark
      ? 'rgba(37, 99, 235, 0.6)'
      : 'rgba(37, 99, 235, 0.1)')
    : (props.$isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)')};
  color: ${props => props.$active
    ? '#ffffff'
    : (props.$isDark ? '#cbd5e1' : '#475569')};
  box-shadow: ${props => props.$active && props.$isDark
    ? '0 0 20px rgba(37, 99, 235, 0.5)'
    : 'none'};
  transform: ${props => props.$active ? 'scale(1.05)' : 'scale(1)'};
  cursor: pointer;

  svg {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
  }

  &:hover {
    transform: scale(1.05);
    background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(37, 99, 235, 0.15)'};
    border-color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(37, 99, 235, 0.3)'};
  }

  @media (max-width: 640px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }
`;

const CardsContainer = styled.div`
  margin-bottom: 4rem;
  width: 100%;
  position: relative;
  
  /* Force horizontal layout */
  * {
    box-sizing: border-box;
  }
`;

const Card = styled(motion.div) <{ $isDark: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  flex-shrink: 0;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.4)'
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-0.25rem);
    border-color: ${props => props.$isDark
    ? 'rgba(37, 99, 235, 0.5)'
    : 'rgba(37, 99, 235, 0.3)'};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  @media (max-width: 640px) {
    width: 180px;
    min-width: 180px;
    max-width: 180px;
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  height: 6.5rem;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;

  ${Card}:hover & {
    transform: scale(1.1);
  }
`;

const CardImageOverlay = styled.div<{ $isDark: boolean }>`
  position: absolute;
  inset: 0;
  background: ${props => props.$isDark
    ? 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 100%)'
    : 'linear-gradient(to top, rgba(0, 0, 0, 0.3) 0%, transparent 100%)'};
`;

const Badge = styled.span<{ $isDark: boolean }>`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.15rem 0.5rem;
  background: ${props => props.$isDark
    ? 'rgba(37, 99, 235, 0.9)'
    : 'rgba(37, 99, 235, 0.95)'};
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 9999px;
  z-index: 10;
`;

const FavoriteButton = styled.button<{ $isDark: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.35rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  border: none;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ef4444;
    background: rgba(255, 255, 255, 1);
  }
`;

const CardContent = styled.div`
  padding: 0.875rem;
`;

// Skeleton Loading Card
const SkeletonCard = styled.div<{ $isDark: boolean }>`
  flex: 0 0 auto;
  width: 220px;
  min-width: 220px;
  height: 235px;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.4)'
    : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 0.75rem;
  overflow: hidden;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

const CardTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#ffffff' : '#0f172a'};
  margin: 0 0 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardLocation = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: ${props => props.$isDark ? '#60a5fa' : '#2563eb'};
  font-size: 0.75rem;
  margin-bottom: 0.65rem;
`;

const SpecsGrid = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  font-size: 0.65rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
`;

const SpecItem = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 0.375rem;
  padding: 0.35rem 0.25rem;
  text-align: center;

  svg {
    display: block;
    margin: 0 auto 0.15rem;
    opacity: 0.5;
    width: 11px;
    height: 11px;
  }
`;

const CardFooter = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.65rem;
  border-top: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const PriceContainer = styled.div``;

const PriceLabel = styled.p<{ $isDark: boolean }>`
  font-size: 0.625rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin: 0 0 0.15rem;
`;

const Price = styled.p<{ $isDark: boolean }>`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#ffffff' : '#0f172a'};
  margin: 0;

  span {
    font-size: 0.75rem;
    color: ${props => props.$isDark ? '#60a5fa' : '#2563eb'};
  }
`;

const ViewButton = styled.button<{ $isDark: boolean }>`
  padding: 0.5rem;
  background: ${props => props.$isDark ? '#2563eb' : '#2563eb'};
  color: #ffffff;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.$isDark
    ? '0 2px 8px rgba(37, 99, 235, 0.2)'
    : '0 2px 8px rgba(37, 99, 235, 0.3)'};

  &:hover {
    background: ${props => props.$isDark ? '#1d4ed8' : '#1d4ed8'};
    box-shadow: ${props => props.$isDark
    ? '0 4px 12px rgba(37, 99, 235, 0.3)'
    : '0 4px 12px rgba(37, 99, 235, 0.4)'};
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ViewAllButton = styled(motion.button) <{ $isDark: boolean }>`
  display: block;
  margin: 4rem auto 0;
  padding: 1rem 2.5rem;
  background: transparent;
  border: 2px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.2)'};
  color: ${props => props.$isDark ? '#ffffff' : '#0f172a'};
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$isDark ? '#ffffff' : '#000000'};
    color: ${props => props.$isDark ? '#000000' : '#ffffff'};
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    padding: 0.875rem 2rem;
    font-size: 0.8125rem;
  }
`;

const SearchButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  
  @media (max-width: 600px) {
    gap: 0.75rem;
    flex-direction: column;
    max-width: 300px;
    margin: 1.5rem auto 0;
  }
`;

const SearchButton = styled(Link) <{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;

  /* Light mode: Orange gradient background, White text */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFA500 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FF5722 0%, #FF6B35 50%, #FF8C42 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFC107 100%) !important;
      color: #000000 !important;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
  }

  &:active {
    transform: translateY(-1px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #E64A19 0%, #FF5722 50%, #FF6B35 100%) !important;
      color: #ffffff !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFA000 0%, #FFC107 50%, #FFD700 100%) !important;
      color: #000000 !important;
    }
  }
  
  @media (max-width: 600px) {
    width: 100%;
    padding: 0.875rem 1.25rem;
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FeaturedShowcase: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [cars, setCars] = useState<DisplayCar[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch real cars from Firestore
  useEffect(() => {
    let isActive = true;

    const fetchCars = async () => {
      try {
        setLoading(true);
        // Fetch 12 featured/premium cars
        const featuredCars = await getFeaturedCars(12);
        
        if (!isActive) return;
        
        if (featuredCars.length > 0) {
          const displayCars = featuredCars.map(car => mapToDisplayCar(car, language));
          setCars(displayCars);
        } else {
          // Fallback: If no featured cars, show empty state
          logger.info('No featured cars found in Firestore', { component: 'FeaturedShowcase' });
          setCars([]);
        }
      } catch (error) {
        logger.error('Error fetching featured cars', { component: 'FeaturedShowcase', error });
        setCars([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCars();

    return () => {
      isActive = false;
    };
  }, [language]);

  // Categories
  const categories = [
    { id: 'all', labelBg: 'Всички обяви', labelEn: 'All Listings', icon: <Globe size={16} /> },
    { id: 'vip', labelBg: 'София VIP', labelEn: 'Sofia VIP', icon: <Crown size={16} /> },
    { id: 'offroad', labelBg: 'Балкан 4x4', labelEn: 'Balkan 4x4', icon: <Mountain size={16} /> },
    { id: 'city', labelBg: 'Градски ежедневни', labelEn: 'Urban Daily', icon: <Building2 size={16} /> },
  ];

  // Filter cars by category
  const filteredCars = activeTab === 'all'
    ? cars
    : cars.filter((car) => car.category === activeTab);

  // Handle car click navigation
  const handleCarClick = (car: DisplayCar) => {
    if (car.sellerNumericId && car.carNumericId) {
      navigate(`/car/${car.sellerNumericId}/${car.carNumericId}`);
    } else {
      navigate(`/car/${car.id}`);
    }
  };

  // Translations
  const title = isBg ? 'Българска премиум селекция' : 'Bulgarian Premium Selection';
  const description = isBg
    ? 'Открийте най-добрите внимателно подбрани автомобили, подходящи за нашите пътища, от планините Родопи до бреговете на Черно море.'
    : 'Discover the best carefully selected cars suitable for our roads, from the Rhodope Mountains to the Black Sea coast.';
  const viewAllText = isBg ? 'Покажи всички обяви в България' : 'View All Listings in Bulgaria';
  const priceLabel = isBg ? 'Цена' : 'Price';
  const loadingText = isBg ? 'Зареждане...' : 'Loading...';
  const noCarsText = isBg ? 'Няма намерени автомобили' : 'No cars found';

  // Loading skeleton
  if (loading) {
    return (
      <Section $isDark={isDark}>
        <BackgroundLayer $isDark={isDark} />
        <Container>
          <Header>
            <Title $isDark={isDark}>{title}</Title>
            <Description $isDark={isDark}>{loadingText}</Description>
          </Header>
          <CardsContainer>
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0 24px' }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} $isDark={isDark} />
              ))}
            </div>
          </CardsContainer>
        </Container>
      </Section>
    );
  }

  // No cars found
  if (cars.length === 0) {
    return (
      <Section $isDark={isDark}>
        <BackgroundLayer $isDark={isDark} />
        <Container>
          <Header>
            <Title $isDark={isDark}>{title}</Title>
            <Description $isDark={isDark}>{noCarsText}</Description>
            <SearchButtonsContainer>
              <SearchButton to="/cars" $variant="primary">
                <Search />
                <span>{isBg ? 'Преглед на всички' : 'View All Cars'}</span>
              </SearchButton>
            </SearchButtonsContainer>
          </Header>
        </Container>
      </Section>
    );
  }

  // Main render with filtered cars
  return (
    <Section $isDark={isDark}>
      {/* Background Layer - Pure CSS, no external images */}
      <BackgroundLayer $isDark={isDark} />

      <Container>
        {/* Header */}
        <Header>
          <Title
            $isDark={isDark}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
          </Title>
          <Description $isDark={isDark}>
            {description}
          </Description>

          {/* Search Buttons */}
          <SearchButtonsContainer>
            <SearchButton to="/cars" $variant="primary">
              <Search />
              <span>{isBg ? 'Търсене' : 'Search'}</span>
            </SearchButton>
            <SearchButton to="/advanced-search" $variant="secondary">
              <SlidersHorizontal />
              <span>{isBg ? 'Разширено търсене' : 'Advanced Search'}</span>
            </SearchButton>
          </SearchButtonsContainer>
        </Header>

        {/* Smart Filters */}
        <FiltersContainer>
          {categories.map((cat) => (
            <FilterButton
              key={cat.id}
              $isDark={isDark}
              $active={activeTab === cat.id}
              onClick={() => setActiveTab(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat.icon}
              <span style={{ marginLeft: '0.5rem' }}>{isBg ? cat.labelBg : cat.labelEn}</span>
            </FilterButton>
          ))}
        </FiltersContainer>

        {/* Cards Horizontal Scroll */}
        <CardsContainer>
          <HorizontalScrollContainer
            gap="0.75rem"
            padding="0"
            itemMinWidth="220px"
            showArrows={true}
          >
            {filteredCars.map((car) => (
              <Card
                key={car.id}
                $isDark={isDark}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                onClick={() => handleCarClick(car)}
                style={{ cursor: 'pointer' }}
              >
                {/* Image Area */}
                <CardImageContainer>
                  <CardImage 
                    src={car.image} 
                    alt={`${car.make} ${car.model}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.png';
                    }}
                  />
                  <CardImageOverlay $isDark={isDark} />
                  <Badge $isDark={isDark}>
                    <ShieldCheck size={10} />
                    {car.badge}
                  </Badge>
                  <FavoriteButton 
                    $isDark={isDark}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(car.id);
                    }}
                    style={{ color: isFavorite(car.id) ? '#ef4444' : undefined }}
                  >
                    <Heart size={14} fill={isFavorite(car.id) ? '#ef4444' : 'none'} />
                  </FavoriteButton>
                </CardImageContainer>

                {/* Content Area */}
                <CardContent>
                  <CardTitle $isDark={isDark}>
                    {car.make} {car.model}
                  </CardTitle>
                  <CardLocation $isDark={isDark}>
                    <MapPin size={11} />
                    {car.location}
                  </CardLocation>

                  {/* Specs Grid */}
                  <SpecsGrid $isDark={isDark}>
                    <SpecItem $isDark={isDark}>
                      <Calendar size={10} />
                      {car.year}
                    </SpecItem>
                    <SpecItem $isDark={isDark}>
                      <Gauge size={10} />
                      {car.mileage}
                    </SpecItem>
                    <SpecItem $isDark={isDark}>
                      <Fuel size={10} />
                      {car.fuel}
                    </SpecItem>
                  </SpecsGrid>

                  {/* Price & Action */}
                  <CardFooter $isDark={isDark}>
                    <PriceContainer>
                      <PriceLabel $isDark={isDark}>{priceLabel}</PriceLabel>
                      <Price $isDark={isDark}>
                        {car.price.toLocaleString()}{' '}
                        <span>{car.currency}</span>
                      </Price>
                    </PriceContainer>
                    <ViewButton $isDark={isDark}>
                      <ArrowRight size={16} />
                    </ViewButton>
                  </CardFooter>
                </CardContent>
              </Card>
            ))}
          </HorizontalScrollContainer>
        </CardsContainer>

        {/* View All Button */}
        <ViewAllButton
          $isDark={isDark}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/cars')}
        >
          {viewAllText}
        </ViewAllButton>
      </Container>
    </Section>
  );
});

FeaturedShowcase.displayName = 'FeaturedShowcase';

export default FeaturedShowcase;