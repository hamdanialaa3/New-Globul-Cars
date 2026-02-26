import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled, { css, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Gauge, Fuel, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthProvider';
import { soundService } from '../../services/sound-service';
import RealisticPaperclipBadge from '../SoldBadge/RealisticPaperclipBadge';
import { UnifiedCar } from '../../services/car/unified-car-types';
import { getCarDisplayImage } from '../../utils/getCarDisplayImage';
import { logger } from '../../services/logger-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-150%); }
  100% { transform: translateX(150%); }
`;

// --- Helper for Chameleon UI ---
const getBrandRegion = (make?: string): 'de' | 'jp' | 'usa' | 'eu' | 'global' => {
  const m = make?.toLowerCase().trim() || '';
  if (['bmw', 'mercedes', 'audi', 'porsche', 'volkswagen', 'opel'].some(b => m.includes(b))) return 'de';
  if (['toyota', 'honda', 'nissan', 'lexus', 'mazda', 'subaru', 'mitsubishi'].some(b => m.includes(b))) return 'jp';
  if (['ford', 'chevrolet', 'tesla', 'jeep', 'dodge', 'cadillac'].some(b => m.includes(b))) return 'usa';
  if (['peugeot', 'renault', 'citroen', 'fiat', 'ferrari', 'lamborghini', 'volvo'].some(b => m.includes(b))) return 'eu';
  return 'global';
};

// --- Styled Components ---

const CardContainer = styled(Link) <{ $region: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  min-height: 400px; /* Match existing */
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05); /* Glass feel */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: visible; /* Needed for 3D effect spillover if any, but hidden usually safer */
  transition: transform 0.1s ease-out, box-shadow 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  /* Chameleon Glows */
  ${props => {
    switch (props.$region) {
      case 'de': return css`--glow-color: rgba(255, 215, 0, 0.15); --border-active: rgba(221, 51, 51, 0.4);`; // Black/Red/Gold
      case 'jp': return css`--glow-color: rgba(255, 0, 0, 0.1); --border-active: rgba(255, 255, 255, 0.5);`; // Red/White
      case 'usa': return css`--glow-color: rgba(0, 51, 153, 0.15); --border-active: rgba(191, 10, 48, 0.4);`; // Blue/Red
      case 'eu': return css`--glow-color: rgba(0, 51, 153, 0.15); --border-active: rgba(255, 215, 0, 0.4);`; // Blue/Gold
      default: return css`--glow-color: rgba(255, 255, 255, 0.1); --border-active: rgba(255, 255, 255, 0.3);`;
    }
  }}

  /* Apply 3D Rotation from CSS Variables */
  transform: 
    perspective(1000px)
    rotateX(var(--rotate-x, 0deg))
    rotateY(var(--rotate-y, 0deg))
    scale3d(1, 1, 1);

  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, transparent, var(--border-active), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    z-index: 10;
    box-shadow: 
      0 15px 35px -5px rgba(0, 0, 0, 0.3),
      0 0 20px var(--glow-color); 
    
    &::after {
      opacity: 1;
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background: #f0f0f0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));
    z-index: 2;
    pointer-events: none;
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${CardContainer}:hover & {
    transform: scale(1.05);
  }
`;

const HeartButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: ${props => props.$active ? '#ff4d4d' : 'rgba(255, 255, 255, 0.9)'};
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);

  svg {
    width: 18px;
    height: 18px;
    fill: ${props => props.$active ? '#ff4d4d' : 'none'};
    transition: all 0.3s ease;
  }

  &:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }

  ${props => props.$active && css`
    animation: ${pulse} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `}
`;

const ContentWrapper = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-card); /* Fallback */
  html[data-theme='dark'] & {
    background: rgba(30, 41, 59, 0.6);
  }
  html[data-theme='light'] & {
    background: rgba(255, 255, 255, 0.8);
  }
  border-radius: 0 0 16px 16px;
  backdrop-filter: blur(10px);
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: var(--text-primary);
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
  color: var(--accent-primary);
  letter-spacing: -0.5px;
`;

const PriceLabel = styled.div`
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 600;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 16px;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  
  svg {
    opacity: 0.7;
    color: var(--accent-secondary, #3b82f6);
  }
`;

const LocationBadge = styled.div`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  padding: 4px 8px;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  width: fit-content;

  html[data-theme='dark'] & {
    background: rgba(255,255,255,0.05);
  }
`;

// --- Types ---

interface PremiumHomeCarCardProps {
  car: UnifiedCar | any; // Using any for flexibility with display objects
}

export const PremiumHomeCarCard: React.FC<PremiumHomeCarCardProps> = ({ car }) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isHearted, setIsHearted] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const t = {
    bg: { sold: 'ПРОДАДЕНО' },
    en: { sold: 'SOLD' }
  }[language as 'bg' | 'en'];

  useEffect(() => {
    setIsHearted(isFavorite(car.id));
  }, [car.id, isFavorite]);

  // --- 3D Tilt Logic ---
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (divided by 15 for subtle premium feel)
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      cardRef.current.style.setProperty("--rotate-x", `${rotateX}deg`);
      cardRef.current.style.setProperty("--rotate-y", `${rotateY}deg`);
    }

    // Play subtle hover sound
    soundService.playHover();
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty("--rotate-x", `0deg`);
      cardRef.current.style.setProperty("--rotate-y", `0deg`);
    }
  };

  // --- Helpers ---
  const getMainImage = (): string => {
    if (car.images && car.images.length > 0) {
      const featuredIdx = car.featuredImageIndex || 0;
      const img = car.images[featuredIdx] || car.images[0];
      if (typeof img !== 'string') return URL.createObjectURL(img);
    }

    return getCarDisplayImage(car);
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
      toast.info(language === 'bg' ? 'Моля, влезте в профила си' : 'Please login to add favorites');
      return;
    }

    if (!isHearted) {
      soundService.playSuccess();
    } else {
      soundService.playClick();
    }

    try {
      const carMake = car.make || car.makeOther || 'N/A';
      const carModel = car.model || car.modelOther || 'N/A';

      // ✅ FIX: Get numeric IDs from Firestore if not available
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
          logger.error('[PremiumHomeCarCard] Failed to fetch seller numeric ID', error as Error);
        }
      }

      // Handle both UnifiedCar and DisplayCar shapes
      const carData = {
        title: `${carMake} ${carModel}`,
        make: carMake,
        model: carModel,
        year: car.year,
        price: car.price,
        currency: car.currency || 'EUR', // ✅ CRITICAL: Add currency
        image: getMainImage(),
        mileage: car.mileage || 0,
        location: car.location || (car.locationData?.cityName) || '',
        fuelType: car.fuelType || car.fuel || '',
        transmission: car.transmission,
        carNumericId: carNumericId, // ✅ CRITICAL: Add numeric IDs
        sellerNumericId: sellerNumericId,
        primaryImage: getMainImage() || undefined
      };

      const result = await toggleFavorite(car.id, carData);
      setIsHearted(result);
    } catch (error) {
      logger.error('Error toggling favorite', error as Error);
    }
  };

  const region = getBrandRegion(car.make || car.makeOther);
  const isSold = car.status === 'sold' || car.isSold;
  const imageSrc = getMainImage();

  return (
    <CardContainer
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

      <ImageWrapper>
        {isSold && <RealisticPaperclipBadge text={t.sold} language={language as 'bg' | 'en'} variant="red" />}
        {car.isNotReady && <RealisticPaperclipBadge text={language === 'bg' ? 'НЕ Е ГОТОВО' : 'NOT READY'} language={language as 'bg' | 'en'} variant="yellow" />}
        <CarImage
          src={imageSrc}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
        />
      </ImageWrapper>

      <ContentWrapper>
        <HeaderRow>
          <CarTitle>{car.make || car.makeOther} {car.model || car.modelOther}</CarTitle>
          <PriceTag>
            <PriceAmount>€{car.price?.toLocaleString()}</PriceAmount>
            {/* <PriceLabel>{language === 'bg' ? 'с ДДС' : 'VAT inc.'}</PriceLabel> */}
          </PriceTag>
        </HeaderRow>

        <SpecsGrid>
          <SpecItem><Calendar size={14} /> {car.year}</SpecItem>
          <SpecItem><Gauge size={14} /> {typeof car.mileage === 'number' ? car.mileage.toLocaleString() : car.mileage} {typeof car.mileage === 'number' ? 'km' : ''}</SpecItem>
          <SpecItem><Fuel size={14} /> {car.fuelType || car.fuel}</SpecItem>
          <SpecItem><User size={14} /> {car.transmission || 'Manual'}</SpecItem>
        </SpecsGrid>

        <LocationBadge>
          <MapPin size={12} /> {car.city || (typeof car.location === 'object' ? car.location?.city : car.location) || car.region || (language === 'bg' ? 'България' : 'Bulgaria')}
        </LocationBadge>
      </ContentWrapper>
    </CardContainer>
  );
};

export default PremiumHomeCarCard;
