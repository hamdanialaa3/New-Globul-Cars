// src/pages/01_main-pages/home/HomePage/ModernCarCard.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Gauge, Calendar, Fuel } from 'lucide-react';
import { CarListing } from '../../../../types/CarListing';
import { useFavorites } from '../../../../hooks/useFavorites';
import RealisticPaperclipBadge from '../../../../components/SoldBadge/RealisticPaperclipBadge';

// ✅ CONSTITUTION: /car/{userId}/{carLocalId}
const getCarDetailsUrl = (car: any) => {
  const sellerNumericId = car.sellerNumericId || car.ownerNumericId;
  const carNumericId = car.carNumericId || car.userCarSequenceId || car.numericId;

  if (sellerNumericId && carNumericId) {
    return `/car/${sellerNumericId}/${carNumericId}`;
  }
  // Car missing numeric IDs - return to search
  return '/cars';
};

const formatCurrency = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
};

// Interface extension to prevent breaking callers that pass extra props
interface ModernCarCardProps {
  car: CarListing | any;
  showStatus?: boolean;
  onFavorite?: (id: string) => void;
}

/**
 * ✅ PERFORMANCE: React.memo applied to prevent unnecessary re-renders
 * Only re-renders when car data or favorite status changes
 */
const ModernCarCard: React.FC<ModernCarCardProps> = ({ car }) => {
  const [imageError, setImageError] = React.useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(car.id);
  const detailsUrl = getCarDetailsUrl(car);
  const mainImageSrc = imageError ? '/images/placeholder-car.jpg' : (car.images?.[0] || '/images/placeholder-car.jpg');

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 h-full flex flex-col">
      {/* Image Container - Updated Link */}
      <Link to={detailsUrl} className="block relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <img
          src={mainImageSrc}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={() => { if (!imageError) setImageError(true); }}
        />
        {(car.isSold || car.status === 'sold') && (
          <RealisticPaperclipBadge 
            text={window.location.pathname.includes('/bg') || document.documentElement.lang === 'bg' ? 'ПРОДАДЕНО' : 'SOLD'}
            language={(window.location.pathname.includes('/bg') || document.documentElement.lang === 'bg') ? 'bg' : 'en'}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(car.id, {
              make: car.make,
              model: car.model,
              year: car.year,
              price: car.price,
              currency: car.currency || 'EUR',
              sellerNumericId: car.sellerNumericId || 0,
              carNumericId: car.carNumericId || 0,
              primaryImage: car.images?.[0]
            });
          }}
          className="absolute top-3 right-3 p-0 bg-transparent border-none transition-all duration-300 hover:scale-110 active:scale-90 z-10"
          style={{ cursor: 'pointer' }}
        >
          <Heart
            size={28}
            className={isFav ? 'fill-red-500 text-red-500' : 'fill-none text-gray-300'}
            strokeWidth={isFav ? 0 : 2}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
              transition: 'all 0.2s ease'
            }}
          />
        </button>

        <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <p className="text-xs font-medium bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg">
            {car.images?.length || 0} Photos
          </p>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-4">
          {/* Title - Updated Link */}
          <Link to={detailsUrl}>
            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">
              {car.make} {car.model}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm truncate">{car.variant || `${car.year} • ${car.transmission || ''}`}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Gauge size={16} className="text-gray-400" />
            <span>{car.mileage?.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Fuel size={16} className="text-gray-400" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="truncate">{car.location?.city || (car.locationData?.cityName as any) || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </div>
          <Link
            to={detailsUrl}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// ✅ PERFORMANCE: Custom comparison function for React.memo
// Only re-render if car.id or car.updatedAt changes
export default memo(ModernCarCard, (prevProps, nextProps) => {
  return (
    prevProps.car.id === nextProps.car.id &&
    prevProps.car.updatedAt === nextProps.car.updatedAt
  );
});
