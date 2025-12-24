// src/components/CarCardGermanStyle.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  CheckCircle2,
  Camera,
  Star,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { CarListing } from '../../types/CarListing';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

// Helper to determine the correct URL
const getCarDetailsUrl = (car: CarListing) => {
  if (car.sellerNumericId && car.carNumericId) {
    return `/car/${car.sellerNumericId}/${car.carNumericId}`;
  }
  return `/car-details/${car.id}`;
};

const formatCurrency = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
};

interface CarCardProps {
  car: CarListing;
  ownerProfileType?: 'private' | 'dealer' | 'company';
  ownerPlanTier?: 'free' | 'dealer' | 'company';
  ownerIsVerified?: boolean;
}

const CarCardGermanStyle: React.FC<CarCardProps> = ({ car }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const isFav = isFavorite(car.id || '');
  const detailsUrl = getCarDetailsUrl(car);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(car.id || '');
  };

  // Fixed: Use string images only, never create blob URLs in render
  const mainImageSrc = car.images?.[0] && typeof car.images[0] === 'string'
    ? car.images[0]
    : '/images/placeholder-car.jpg';

  const locationName = (typeof car.location === 'object' ? (car.location as any)?.city : car.location) ||
    (car.locationData?.cityName as any) || 'Location N/A';

  const carIdDisplay = car.carNumericId || (car.id ? car.id.slice(0, 8) : 'N/A');

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col sm:flex-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: '220px' }}
    >
      {/* Image Section - Updated Link */}
      <Link to={detailsUrl} className="relative w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 aspect-[4/3] sm:aspect-auto group block">
        <img
          src={mainImageSrc}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg'; }}
        />

        {/* Image Count Badge */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
          <Camera size={12} />
          <span>{car.images?.length || 0}</span>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {car.condition === 'new' && (
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              NEU
            </span>
          )}
          {car.isFeatured && (
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <Star size={10} className="fill-current" />
              TOP
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${isFav
              ? 'bg-red-50 text-red-500'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
        >
          <Heart size={18} className={isFav ? 'fill-current' : ''} />
        </button>
      </Link>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-3 mb-2">
            {/* Title - Updated Link */}
            <Link to={detailsUrl} className="group min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {car.make} {car.model} {(car as any).variant || ''}
              </h3>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                <span>{car.year}</span>
                <span>•</span>
                <span>{car.mileage?.toLocaleString()} km</span>
                <span>•</span>
                <span>{car.power} hp</span>
              </div>
            </Link>

            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(car.price)}
              </div>
              {(car as any).vatType && (
                <div className="text-xs text-gray-500">
                  {(car as any).vatType === 'VatDeductible' ? 'VAT deductible' : 'Net'}
                </div>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Fuel size={14} className="text-gray-400" />
              <span className="truncate">{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings size={14} className="text-gray-400" />
              <span className="truncate">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400" />
              <span className="truncate">
                {locationName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} className="text-gray-400" />
              <span className="truncate">
                {car.year}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            {(car as any).sellerType === 'dealer' && (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                <ShieldCheck size={12} />
                Dealer
              </span>
            )}
            <span className="text-xs text-gray-400">
              ID: {carIdDisplay}
            </span>
          </div>

          <Link
            to={detailsUrl}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn"
          >
            Details
            <svg
              className="w-4 h-4 transform transition-transform group-hover/btn:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCardGermanStyle;
