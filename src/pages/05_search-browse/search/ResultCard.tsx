import React from 'react';
import { ViewMode } from './types';
import type { FirestoreCarResult } from './searchService';
import {
    ResultCardListWrapper,
    ResultCardImageBox,
    ResultCardGridWrapper,
    ResultCardGridImageBox,
    CardContent,
    CardTitle,
    CardSubtitle,
    CardPrice,
    CardMonthlyPrice,
    CardSpecsRow,
    CardSpec,
    CardLocation,
    CardDealerTag,
    BadgeContainer,
    Badge,
    FavoriteButton,
} from './SearchPage.styles';

/* ─── Mini SVG Icons ─── */
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
);

const SpeedIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0" />
        <path d="M12 12l3.5 -3.5" />
        <path d="M16.5 7.5l-1.5 1.5" />
    </svg>
);

const FuelIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
        <path d="M13 10h3a2 2 0 0 1 2 2v8" />
        <path d="M18 22V10" />
        <path d="M7 10h2" />
    </svg>
);

const GearIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const PowerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

const MapPinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        width="16"
        height="16"
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

// No-image placeholder
const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#e2e8f0" width="400" height="300"/>
  <text fill="#a0aec0" font-family="Arial" font-size="16" text-anchor="middle" x="200" y="145">No Image Available</text>
  <text fill="#a0aec0" font-family="Arial" font-size="40" text-anchor="middle" x="200" y="170">🚗</text>
</svg>`);

type ResultCarData = FirestoreCarResult & { isFavorited?: boolean };

interface ResultCardProps {
    car: ResultCarData;
    viewMode: ViewMode;
    onToggleFavorite: (id: string) => void;
    onCardClick: (car: FirestoreCarResult) => void;
}

const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const ImageOverlay: React.FC<{
    car: ResultCarData;
    onToggleFavorite: (id: string) => void;
}> = ({ car, onToggleFavorite }) => (
    <>
        {/* Color swatch indicator */}
        {car.colorHex && (
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: car.colorHex,
                    border: '2px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    zIndex: 2,
                }}
                title={car.color || 'Color'}
            />
        )}
        <FavoriteButton
            $active={car.isFavorited || false}
            onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(car.id);
            }}
            aria-label={car.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <HeartIcon filled={car.isFavorited || false} />
        </FavoriteButton>
        <img
            src={car.mainImage || NO_IMAGE_PLACEHOLDER}
            alt={car.title}
            loading="lazy"
            onError={(e) => {
                (e.target as HTMLImageElement).src = NO_IMAGE_PLACEHOLDER;
            }}
        />
    </>
);

const ResultCard: React.FC<ResultCardProps> = ({
    car,
    viewMode,
    onToggleFavorite,
    onCardClick,
}) => {
    const location = car.city || car.region || 'Unknown location';
    const hp = car.power;

    if (viewMode === 'grid') {
        return (
            <ResultCardGridWrapper onClick={() => onCardClick(car)}>
                <ResultCardGridImageBox>
                    <ImageOverlay car={car} onToggleFavorite={onToggleFavorite} />
                </ResultCardGridImageBox>
                <CardContent>
                    <CardTitle>{car.title}</CardTitle>
                    <CardSubtitle>{car.subtitle}</CardSubtitle>
                    <CardPrice>
                        {car.priceFormatted}
                    </CardPrice>
                    <CardSpecsRow>
                        <CardSpec>
                            <CalendarIcon /> {car.year}
                        </CardSpec>
                        <CardSpec>
                            <SpeedIcon /> {car.mileageFormatted}
                        </CardSpec>
                        {car.fuelType && (
                            <CardSpec>
                                <FuelIcon /> {capitalize(car.fuelType)}
                            </CardSpec>
                        )}
                    </CardSpecsRow>
                    <CardLocation>
                        <MapPinIcon />
                        {location}
                    </CardLocation>
                </CardContent>
            </ResultCardGridWrapper>
        );
    }

    return (
        <ResultCardListWrapper onClick={() => onCardClick(car)}>
            <ResultCardImageBox>
                <ImageOverlay car={car} onToggleFavorite={onToggleFavorite} />
            </ResultCardImageBox>
            <CardContent>
                <CardTitle>{car.title}</CardTitle>
                <CardSubtitle>{car.subtitle}</CardSubtitle>

                <CardPrice>
                    {car.priceFormatted}
                </CardPrice>

                <CardSpecsRow>
                    <CardSpec>
                        <CalendarIcon /> {car.year}
                    </CardSpec>
                    <CardSpec>
                        <SpeedIcon /> {car.mileageFormatted}
                    </CardSpec>
                    {car.fuelType && (
                        <CardSpec>
                            <FuelIcon /> {capitalize(car.fuelType)}
                        </CardSpec>
                    )}
                    {car.transmission && (
                        <CardSpec>
                            <GearIcon /> {capitalize(car.transmission)}
                        </CardSpec>
                    )}
                    {hp > 0 && (
                        <CardSpec>
                            <PowerIcon /> {hp} HP
                        </CardSpec>
                    )}
                </CardSpecsRow>

                <CardLocation>
                    <MapPinIcon />
                    {location}
                    {car.sellerType === 'dealer' && (
                        <CardDealerTag>· Dealer</CardDealerTag>
                    )}
                </CardLocation>
            </CardContent>
        </ResultCardListWrapper>
    );
};

export default ResultCard;
