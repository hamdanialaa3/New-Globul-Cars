// Compact Car Card Component - mobile.de Style
// بطاقة سيارة مضغوطة - نمط mobile.de
// Applied across all car listing pages
// ⚡ UPDATED: Now with Premium 3D Tilt & Chameleon UI Effects

import React, { memo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { MapPin, Gauge, Fuel, Calendar, MessageCircle, User, Heart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useFavorites } from '../../hooks/useFavorites';
import { CarListing } from '../../types/CarListing';
import { logger } from '../../services/logger-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import PriceBadge from '../car/PriceBadge';
import RealisticPaperclipBadge from '../SoldBadge/RealisticPaperclipBadge';
import { soundService } from '@/services/sound-service';

interface CarCardCompactProps {
  car: CarListing | any; // Support both CarListing and BulgarianCar types
}

// --- HELPER: Get Region for Chameleon UI ---
const getBrandRegion = (make: string): 'de' | 'jp' | 'usa' | 'eu' | 'global' => {
  const m = (make || '').toLowerCase();
  if (['bmw', 'mercedes', 'mercedes-benz', 'audi', 'volkswagen', 'vw', 'porsche', 'opel'].includes(m)) return 'de';
  if (['toyota', 'honda', 'nissan', 'mazda', 'mitsubishi', 'subaru', 'lexus', 'infiniti', 'suzuki'].includes(m)) return 'jp';
  if (['ford', 'chevrolet', 'dodge', 'tesla', 'jeep', 'cadillac', 'chrysler', 'gmc'].includes(m)) return 'usa';
  if (['peugeot', 'renault', 'citroen', 'fiat', 'ferrari', 'lamborghini', 'alfa romeo', 'volvo', 'jaguar', 'land rover'].includes(m)) return 'eu';
  return 'global';
};

// --- STYLED COMPONENTS (Premium Auction Style) ---
const CarCardContainer = styled(Link)<{ $region?: string }>`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
  overflow: hidden; /* Keep overflow hidden for clean edges */
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-width: 280px; /* Slightly wider for premium feel */
  min-height: 380px; /* Taller */
  margin: 0 auto;
  
  /* 3D Tilt Props */
  transform: perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg));
  transition: transform 0.1s ease-out, box-shadow 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.4s ease;
  
  /* Smooth reset when mouse leaves */
  &:not(:hover) {
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* Glassmorphism */
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  /* CHAMELEON UI: Dynamic Ambient Glow based on Region */
  ${props => {
    switch(props.$region) {
        case 'usa': return css`
            &:hover { border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 15px 40px rgba(59, 130, 246, 0.2); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #ef4444, #ffffff, #3b82f6); opacity: 0; transition: opacity 0.3s; z-index: 20; }
            &:hover::after { opacity: 1; }
        `;
        case 'de': return css`
            &:hover { border-color: rgba(245, 158, 11, 0.5); box-shadow: 0 15px 40px rgba(245, 158, 11, 0.2); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #000000, #ef4444, #fbbf24); opacity: 0; transition: opacity 0.3s; z-index: 20; }
            &:hover::after { opacity: 1; }
        `;
        case 'jp': return css`
            &:hover { border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 15px 40px rgba(239, 68, 68, 0.2); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #ffffff, #ef4444, #ffffff); opacity: 0; transition: opacity 0.3s; z-index: 20; }
            &:hover::after { opacity: 1; }
        `;
        case 'eu': return css`
            &:hover { border-color: rgba(37, 99, 235, 0.5); box-shadow: 0 15px 40px rgba(37, 99, 235, 0.2); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #2563eb, #fbbf24); opacity: 0; transition: opacity 0.3s; z-index: 20; }
            &:hover::after { opacity: 1; }
        `;
        default: return css`
            &:hover { border-color: rgba(11, 95, 255, 0.5); box-shadow: 0 15px 40px rgba(11, 95, 255, 0.2); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #0b5fff, #00c48c); opacity: 0; transition: opacity 0.3s; z-index: 20; }
            &:hover::after { opacity: 1; }
        `;
    }
  }}
`;

// Heart Button - Premium Style with Professional Animation
const HeartButton = styled.button<{ $active?: boolean }>`
    position: absolute;
    top: 15px;
    right: 15px;
    /* Red glow when active, transparent glass when inactive */
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
        : 'rgba(0, 0, 0, 0.5)'};
    border: ${props => props.$active 
        ? '2px solid #fff' 
        : '1px solid rgba(255, 255, 255, 0.3)'};
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 30; /* Above image and overlays */
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(12px);
    box-shadow: ${props => props.$active 
        ? '0 4px 20px rgba(239, 68, 68, 0.5), 0 0 0 0 rgba(239, 68, 68, 0.7)' 
        : '0 2px 8px rgba(0, 0, 0, 0.3)'};
    
    /* Pulse animation when active */
    ${props => props.$active && `
        animation: heartPulse 1.5s ease-in-out infinite;
    `}

    @keyframes heartPulse {
        0%, 100% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5), 0 0 0 0 rgba(239, 68, 68, 0.7);
        }
        50% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5), 0 0 0 8px rgba(239, 68, 68, 0);
        }
    }
    
    &:hover {
        transform: scale(1.2) rotate(${props => props.$active ? '-5deg' : '5deg'});
        background: ${props => props.$active 
            ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
            : 'rgba(0, 0, 0, 0.7)'};
        box-shadow: ${props => props.$active 
            ? '0 6px 25px rgba(239, 68, 68, 0.6)' 
            : '0 4px 12px rgba(0, 0, 0, 0.4)'};
    }

    &:active {
        transform: scale(0.95);
    }

    svg {
        fill: ${props => props.$active ? '#fff' : 'none'};
        color: ${props => props.$active ? '#fff' : '#fff'};
        width: 22px;
        height: 22px;
        stroke-width: ${props => props.$active ? '0' : '2.5px'};
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        filter: ${props => props.$active 
            ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' 
            : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'};
        
        /* Heart beat animation when favorited */
        ${props => props.$active && `
            animation: heartBeat 0.6s ease-in-out;
        `}
    }

    @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        15% { transform: scale(1.3); }
        30% { transform: scale(1.1); }
        45% { transform: scale(1.25); }
        60% { transform: scale(1); }
    }
`;

const CarImageWrapper = styled.div`
  height: 180px; /* Increased height for better visual */
  position: relative;
  overflow: hidden;
  background: var(--bg-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  /* Flash effect on hover */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -100%;
    width: 50%; 
    height: 200%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
    transform: rotate(25deg);
    transition: left 0.6s ease;
    z-index: 10;
    pointer-events: none;
  }

  ${CarCardContainer}:hover &::before {
    left: 150%;
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  ${CarCardContainer}:hover & {
    transform: scale(1.08);
  }
`;

const ContentWrapper = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const CarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  margin: 0;
  line-height: 1.3;
  
  /* Truncate to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceTag = styled.div`
  text-align: right;
`;

const PriceAmount = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#0f172a'};
  white-space: nowrap;
`;

const PriceLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
  margin-top: 4px;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  
  svg {
    width: 14px;
    height: 14px;
    opacity: 0.7;
  }
`;

const LocationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  padding: 4px 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
  border-radius: 6px;
  color: var(--text-secondary);
  width: fit-content;
  margin-top: auto;
`;

const CarCardCompact: React.FC<CarCardCompactProps> = ({ car }) => {
  const { language } = useLanguage();
  const t = {
    bg: { sold: 'ПРОДАДЕНО', view: 'Преглед' },
    en: { sold: 'SOLD', view: 'View' }
  }[language as 'bg' | 'en'];

  const isSold = car.isSold || car.status === 'sold';
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isHearted, setIsHearted] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Check if car is favorited on mount
  useEffect(() => {
    setIsHearted(isFavorite(car.id));
  }, [car.id, isFavorite]);

  // Handle 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (divided by 20 for subtle premium feel)
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      cardRef.current.style.setProperty("--rotate-x", `${rotateX}deg`);
      cardRef.current.style.setProperty("--rotate-y", `${rotateY}deg`);
    }
    
    // Play subtle hover sound (debounced in service)
    soundService.playHover();
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
        // Reset rotation
        cardRef.current.style.setProperty("--rotate-x", `0deg`);
        cardRef.current.style.setProperty("--rotate-y", `0deg`);
    }
  };

  const getMainImage = (): string | null => {
    if (car.images && car.images.length > 0) {
      const featuredIdx = car.featuredImageIndex || 0;
      const featuredImage = car.images[featuredIdx] || car.images[0];
      return typeof featuredImage === 'string' ? featuredImage : URL.createObjectURL(featuredImage);
    }
    return null;
  };

  const getCarUrl = (): string => {
    if (car.sellerNumericId && car.carNumericId) {
      return `/car/${car.sellerNumericId}/${car.carNumericId}`;
    }
    return `/cars/${car.id}`;
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Please login to add favorites');
      return;
    }

    // Play appropriate sound
    if (!isHearted) {
        soundService.playSuccess(); // Premium success sound
    } else {
        soundService.playClick(); // Standard click for remove
    }

    try {
      const carMake = car.make || car.makeOther || 'N/A';
      const carModel = car.model || car.modelOther || 'N/A';
      
      // ✅ FIX: Get numeric IDs from Firestore if not available in car object
      let carNumericId = car.carNumericId || car.numericId || 0;
      let sellerNumericId = car.sellerNumericId || 0;

      // If numeric IDs are missing, fetch from seller profile
      if (!sellerNumericId && car.sellerId) {
        try {
          const sellerDoc = await getDoc(doc(db, 'users', car.sellerId));
          if (sellerDoc.exists()) {
            sellerNumericId = sellerDoc.data().numericId || 0;
          }
        } catch (error) {
          logger.error('[CarCard] Failed to fetch seller numeric ID', error as Error);
        }
      }
      
      // ✅ FIXED: Include numeric IDs required by favoritesService
      const carData = {
        title: `${carMake} ${carModel}`,
        make: carMake,
        model: carModel,
        year: car.year,
        price: car.price,
        currency: car.currency || 'EUR',
        image: getMainImage() || '/placeholder-car.jpg',
        mileage: car.mileage || 0,
        location: car.location || '',
        fuelType: car.fuelType || '',
        transmission: car.transmission,
        // ✅ CRITICAL: Add numeric IDs (now dynamically fetched if missing)
        carNumericId: carNumericId,
        sellerNumericId: sellerNumericId,
        primaryImage: getMainImage() || undefined
      };

      const result = await toggleFavorite(car.id, carData);
      setIsHearted(result);
      logger.info('Favorite toggled', { carId: car.id, isFavorited: result });
      
    } catch (error) {
      logger.error('Error toggling favorite', error as Error);
    }
  };

  const region = getBrandRegion(car.make || car.makeOther);

  return (
    <CarCardContainer 
        ref={cardRef} 
        to={getCarUrl()} 
        $region={region}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
    >
      <HeartButton
        $active={isHearted}
        onClick={handleFavoriteClick}
        title={isHearted ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart />
      </HeartButton>

      <CarImageWrapper>
        {isSold && <RealisticPaperclipBadge text={t.sold} language={language as 'bg' | 'en'} />}
        {getMainImage() ? (
          <CarImage
            src={getMainImage()!}
            alt={`${car.make} ${car.model}`}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-car.jpg'; }}
          />
        ) : (
            <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarIconPlaceholder />
            </div>
        )}
      </CarImageWrapper>

      <ContentWrapper>
        <HeaderRow>
            <CarTitle>{car.make || car.makeOther} {car.model || car.modelOther}</CarTitle>
            <PriceTag>
                <PriceAmount>€{car.price?.toLocaleString()}</PriceAmount>
                <PriceLabel>{language === 'bg' ? 'с ДДС' : 'VAT inc.'}</PriceLabel>
            </PriceTag>
        </HeaderRow>

        <SpecsGrid>
            <SpecItem><Calendar size={14} /> {car.year}</SpecItem>
            <SpecItem><Gauge size={14} /> {car.mileage?.toLocaleString()} km</SpecItem>
            <SpecItem><Fuel size={14} /> {car.fuelType}</SpecItem>
            <SpecItem><User size={14} /> {car.transmission}</SpecItem>
        </SpecsGrid>
                
        <LocationBadge>
            <MapPin size={12} /> {car.city || car.region || (language === 'bg' ? 'България' : 'Bulgaria')}
        </LocationBadge>
      </ContentWrapper>
    </CarCardContainer>
  );
};

const CarIconPlaceholder = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="3" />
        <circle cx="17" cy="17" r="3" />
        <line x1="7" y1="17" x2="7" y2="17.01" />
        <line x1="17" y1="17" x2="17" y2="17.01" />
    </svg>
);

export default memo(CarCardCompact);

