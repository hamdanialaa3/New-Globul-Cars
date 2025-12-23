// src/pages/01_main-pages/home/HomePage/ModernCarCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Gauge, Calendar, Fuel } from 'lucide-react';
import { CarListing } from '../../../../types/CarListing';
import { useFavorites } from '../../../../hooks/useFavorites';

// Helper to determine the correct URL
const getCarDetailsUrl = (car: any) => {
  const sellerNumericId = car.sellerNumericId || car.ownerNumericId;
  const carNumericId = car.carNumericId || car.userCarSequenceId || car.numericId;

  if (sellerNumericId && carNumericId) {
    return `/car/${sellerNumericId}/${carNumericId}`;
  }
  return `/car-details/${car.id}`;
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

export default function ModernCarCard({ car }: ModernCarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(car.id);
  const detailsUrl = getCarDetailsUrl(car);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 h-full flex flex-col">
      {/* Image Container - Updated Link */}
      <Link to={detailsUrl} className="block relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <img
          src={car.images?.[0] || '/images/placeholder-car.jpg'}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(car.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isFav
              ? 'bg-red-500/10 text-red-500'
              : 'bg-white/30 text-white hover:bg-white hover:text-red-500'
            }`}
        >
          <Heart size={18} className={isFav ? 'fill-current' : ''} />
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
}
