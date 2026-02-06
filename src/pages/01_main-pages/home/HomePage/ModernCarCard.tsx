// src/pages/01_main-pages/home/HomePage/ModernCarCard.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Gauge, Calendar, Fuel } from 'lucide-react';
import { CarListing } from '../../../../types/CarListing';
import { useFavorites } from '../../../../hooks/useFavorites';
import { getCarDisplayImage, CAR_PLACEHOLDER } from '../../../../utils/getCarDisplayImage';
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

  return (
    <div
      className="group relative bg-white dark:bg-[#18181b] rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:-translate-y-1 animate-[fadeIn_0.6s_ease]"
      style={{ width: '100%', maxWidth: 320, minWidth: 260, margin: '0 auto', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image */}
      <div className="relative w-full bg-gray-100 overflow-hidden" style={{aspectRatio:'1/1',height:'auto'}}>
        <img
          src={imageError ? CAR_PLACEHOLDER : getCarDisplayImage(car)}
          alt={`${car.brand || car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          style={{aspectRatio:'1/1',width:'100%',height:'100%'}}
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {/* Badge */}
        {car.badge && (
          <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {car.badge}
          </span>
        )}
        {/* Favorite */}
        <button
          onClick={e => {
            e.preventDefault();
            toggleFavorite(car.id, car);
          }}
          className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 rounded-full p-1 border border-gray-200 dark:border-gray-700 shadow hover:scale-110 transition"
        >
          <Heart size={18} className={isFav ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600 dark:text-gray-300'} strokeWidth={2} />
        </button>
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1" style={{minHeight:140,justifyContent:'space-between'}}>
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate" style={{marginBottom:2}}>
          {(car.brand || car.make) + ' ' + car.model} <span className="text-gray-500">{car.year}</span>
        </h3>
        {/* Price */}
        <p className="text-2xl font-extrabold text-green-600">
          {car.price ? formatCurrency(car.price) : '--'}
        </p>
        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span>⏱ {car.mileage?.toLocaleString() || '--'} km</span>
          <span>⛽ {car.fuel || car.fuelType || '--'}</span>
          <span>⚙️ {car.transmission || '--'}</span>
          <span>🏎 {car.hp || car.power || '--'} hp</span>
        </div>
        {/* Location */}
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin size={13} className="inline-block mr-1 text-gray-400" />
          {car.location?.city || car.location || (car.locationData?.cityName as any) || 'N/A'}
        </div>
        {/* AI Highlight */}
        {car.aiHighlight && (
          <div className="text-xs text-blue-600 font-semibold bg-blue-50 p-2 rounded-lg">
            🔍 AI Insight: {car.aiHighlight}
          </div>
        )}
        {/* CTA */}
        <Link
          to={detailsUrl}
          className="mt-3 w-full block bg-gray-900 text-white py-2 rounded-xl font-semibold hover:bg-gray-800 transition text-center"
          style={{fontSize:15,marginTop:8}}
        >
          View Details
        </Link>
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
