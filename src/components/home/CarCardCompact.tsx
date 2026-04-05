/**
 * CarCardCompact.tsx
 * Compact car card for homepage strips – mobile.de style
 * بطاقة سيارة مضغوطة لأشرطة الصفحة الرئيسية
 *
 * Uses styled-components + CSS variables for dark/light theme support.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Heart } from 'lucide-react';
import { CarSummary } from '../../types/car';
import { getCarDetailsUrl } from '../../utils/routing-utils';
import { useFavorites } from '../../hooks/useFavorites';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Card = styled(Link)`
  display: block;
  border-radius: 10px;
  border: 1px solid var(--border-primary, #E2E8F0);
  background: var(--bg-card, #ffffff);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);

  &:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }
`;

const ImageWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--bg-hover, #f0f0f0);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const FavBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  z-index: 2;
  color: #6b7280;

  &:hover {
    background: rgba(255,255,255,1);
    transform: scale(1.1);
    color: #ef4444;
  }
`;

const DealBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 2;
  line-height: 1.4;
`;

const DealBadgeRed = styled(DealBadge)`
  background: #dc2626;
  color: #fff;
`;

const PriceBadgeGreen = styled(DealBadge)`
  background: #dcfce7;
  color: #166534;
`;

const PriceBadgeEmerald = styled(DealBadge)`
  background: #d1fae5;
  color: #065f46;
`;

const PriceBadgeYellow = styled(DealBadge)`
  background: #fef9c3;
  color: #854d0e;
`;

const Content = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-primary, #1a202c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const Price = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary, #1a202c);
  line-height: 1.2;
  margin-top: 2px;
`;

const PriceSuffix = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary, #64748b);
  margin-left: 4px;
`;

const LeasingMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #64748b);
  line-height: 1.3;
`;

const RegistrationDate = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #64748b);
`;

const SpecsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary, #4a5568);
  line-height: 1.4;
`;

const SpecItem = styled.span`
  white-space: nowrap;
  text-transform: capitalize;
`;

const SpecDot = styled.span`
  margin: 0 5px;
  color: var(--text-tertiary, #a0aec0);
  font-size: 10px;
`;

const ConsumptionRow = styled.div`
  font-size: 11px;
  color: var(--text-tertiary, #718096);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-tertiary, #718096);

  svg {
    width: 13px;
    height: 13px;
    opacity: 0.7;
    flex-shrink: 0;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  car: CarSummary;
}

export const CarCardCompact: React.FC<Props> = ({ car }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  // Constitution-compliant URL: /car/{sellerNumericId}/{carNumericId}
  const href = (car.sellerNumericId && car.carNumericId)
    ? getCarDetailsUrl({ sellerNumericId: car.sellerNumericId, carNumericId: car.carNumericId })
    : `/cars/${car.slug || car.id}`;

  // Price formatting
  const priceLabel = car.isLeasing
    ? `${car.priceMonthly?.toLocaleString('de-DE')} ${car.priceCurrency === 'EUR' ? '€' : 'лв.'}`
    : `${car.priceTotal?.toLocaleString('de-DE')} ${car.priceCurrency === 'EUR' ? '€' : 'лв.'}`;

  const leasingMeta =
    car.isLeasing && car.leasingTermMonths && car.leasingKmPerYear
      ? `${car.leasingTermMonths} months · ${car.leasingKmPerYear.toLocaleString('de-DE')} km/year`
      : null;

  // Badge logic
  const priceBadgeText =
    car.priceBadge === 'very_good'
      ? 'Very good price'
      : car.priceBadge === 'good'
      ? 'Good price'
      : car.priceBadge === 'fair'
      ? 'Fair price'
      : null;

  const renderImageBadge = () => {
    if (car.isLeasing) {
      return <DealBadgeRed>DEAL</DealBadgeRed>;
    }
    if (!priceBadgeText) return null;
    if (car.priceBadge === 'very_good') return <PriceBadgeGreen>{priceBadgeText}</PriceBadgeGreen>;
    if (car.priceBadge === 'good') return <PriceBadgeEmerald>{priceBadgeText}</PriceBadgeEmerald>;
    return <PriceBadgeYellow>{priceBadgeText}</PriceBadgeYellow>;
  };

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const [make = '', model = ''] = car.title.split(' ');
    const year = Number((car.firstRegistration || '').slice(0, 4)) || new Date().getFullYear();
    const price = car.priceTotal || car.priceMonthly || 0;

    if (!car.sellerNumericId || !car.carNumericId) {
      return;
    }

    void toggleFavorite(car.id, {
      make,
      model,
      year,
      price,
      currency: car.priceCurrency,
      sellerNumericId: car.sellerNumericId,
      carNumericId: car.carNumericId,
      primaryImage: car.imageUrl,
    });
  };

  const isSaved = isFavorite(car.id);

  return (
    <Card to={href}>
      {/* Image */}
      <ImageWrap>
        <Image src={car.imageUrl} alt={car.title} loading="lazy" />
        {renderImageBadge()}
        <FavBtn onClick={handleFav} aria-label="Save to favorites">
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </FavBtn>
      </ImageWrap>

      {/* Content */}
      <Content>
        <TitleRow>
          <Title>{car.title}</Title>
        </TitleRow>

        {/* Price */}
        <Price>
          {priceLabel}
          {car.isLeasing && <PriceSuffix>/month incl. VAT</PriceSuffix>}
        </Price>

        {/* Leasing details */}
        {leasingMeta && <LeasingMeta>{leasingMeta}</LeasingMeta>}

        {/* Registration date (non-leasing) */}
        {!car.isLeasing && car.firstRegistration && (
          <RegistrationDate>{car.firstRegistration}</RegistrationDate>
        )}

        {/* Specs */}
        <SpecsRow>
          <SpecItem>{car.fuelType}</SpecItem>
          <SpecDot>•</SpecDot>
          <SpecItem>{car.horsepower} hp</SpecItem>
          <SpecDot>•</SpecDot>
          <SpecItem>{car.transmission === 'automatic' ? 'Automatic' : 'Manual'}</SpecItem>
          {car.mileageKm != null && (
            <>
              <SpecDot>•</SpecDot>
              <SpecItem>{car.mileageKm.toLocaleString('de-DE')} km</SpecItem>
            </>
          )}
        </SpecsRow>

        {/* Consumption / CO₂ */}
        {(car.consumptionCombined || car.co2Combined) && (
          <ConsumptionRow>
            {car.consumptionCombined && `${car.consumptionCombined} (comb.)`}
            {car.consumptionCombined && car.co2Combined && ' · '}
            {car.co2Combined && car.co2Combined}
          </ConsumptionRow>
        )}

        {/* Location */}
        <LocationRow>
          <MapPin />
          <span>
            {car.locationPostalCode && `${car.locationPostalCode}, `}
            {typeof car.locationCity === 'object' && car.locationCity !== null
              ? ((car.locationCity as any).city || (car.locationCity as any).address || '')
              : car.locationCity}
          </span>
        </LocationRow>
      </Content>
    </Card>
  );
};
