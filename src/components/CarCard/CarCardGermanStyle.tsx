// src/components/CarCardGermanStyle.tsx
import React, { memo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
import TrustBadge from '../trust/TrustBadge';
import StoryRing from '../media/StoryRing';
import type { TrustSystem } from '../../types/trust.types';
import type { CarStory } from '../../types/story.types';
import { trustScoreService } from '../../services/profile/trust-score-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
// ✅ SEO: AspectRatioBox for CLS = 0.00
import { AspectRatioBox } from '../../utils/seo/AspectRatioBox';
import { logger } from '@/services/logger-service';

// Helper to determine the correct URL
// ✅ CONSTITUTION: /car/{userId}/{carLocalId}
const getCarDetailsUrl = (car: CarListing) => {
  const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
  const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
  
  if (sellerNumericId && carNumericId) {
    return `/car/${sellerNumericId}/${carNumericId}`;
  }
  // Car missing numeric IDs - return to search
  return '/cars';
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
  const [imageError, setImageError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  // NEW: Trust System Integration
  const [sellerTrustData, setSellerTrustData] = useState<TrustSystem | null>(null);
  const [sellerStories, setSellerStories] = useState<CarStory[]>([]);
  const [sellerPhotoURL, setSellerPhotoURL] = useState<string>('');
  const [loadingSellerData, setLoadingSellerData] = useState(false);

  const isFav = isFavorite(car.id || '');
  const detailsUrl = getCarDetailsUrl(car);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.warning('Please login to add favorites');
      return;
    }

    try {
      // ✅ FIX: Get numeric IDs from Firestore if not available in car object
      let carNumericId = car.carNumericId || 0;
      let sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId || 0;

      // If sellerNumericId is missing, fetch from seller profile
      if (!sellerNumericId && car.sellerId) {
        try {
          const sellerDoc = await getDoc(doc(db, 'users', car.sellerId));
          if (sellerDoc.exists()) {
            sellerNumericId = sellerDoc.data().numericId || 0;
          }
        } catch (error) {
          logger.error('[CarCardGermanStyle] Failed to fetch seller numeric ID', error as Error);
        }
      }

      // ✅ FIXED: Pass car data with numeric IDs (now dynamically fetched if missing)
      const carData = {
        make: car.make || '',
        model: car.model || '',
        year: car.year || 0,
        price: car.price || 0,
        currency: car.currency || 'EUR',
        carNumericId: carNumericId,
        sellerNumericId: sellerNumericId,
        primaryImage: typeof car.images?.[0] === 'string' ? car.images[0] : undefined
      };

      await toggleFavorite(car.id || '', carData);
    } catch (error) {
      logger.error('Error toggling favorite', error as Error);
    }
  };

  // Load seller trust data and stories
  useEffect(() => {
    const loadSellerData = async () => {
      if (!car.sellerId) return;

      setLoadingSellerData(true);
      try {
        // Load trust score
        const trustScore = await trustScoreService.getUserTrustScore(car.sellerId);
        setSellerTrustData(trustScore);

        // Load seller profile for stories and photo
        const sellerDoc = await getDoc(doc(db, 'users', car.sellerId));
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          setSellerPhotoURL(sellerData.photoURL || sellerData.profileImageURL || '');

          // Load stories from car if available
          if (car.stories && Array.isArray(car.stories)) {
            setSellerStories(car.stories as CarStory[]);
          }
        }
      } catch (error) {
        logger.error('Failed to load seller data', error as Error, { sellerId: car.sellerId });
      } finally {
        setLoadingSellerData(false);
      }
    };

    loadSellerData();
  }, [car.sellerId, car.stories]);

  // Fixed: Use string images only, with error state to prevent infinite loops
  // Use featuredImageIndex if available, fallback to first image
  const featuredIdx = car.featuredImageIndex || 0;
  const featuredImage = car.images?.[featuredIdx] || car.images?.[0];
  const mainImageSrc = imageError || !featuredImage || typeof featuredImage !== 'string'
    ? '/images/placeholder.png'
    : featuredImage;

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
      {/* Image Section - Updated Link with AspectRatioBox for CLS prevention */}
      <Link to={detailsUrl} className="relative w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 group block">
        <AspectRatioBox ratio="4:3" borderRadius="0">
          <img
            src={mainImageSrc}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Prevent infinite loop by only handling error once
              if (!imageError) {
                setImageError(true);
              }
            }}
          />
        </AspectRatioBox>

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

        {/* Favorite Button - Professional Red Heart */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2.5 rounded-full transition-all duration-300 backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 ${
            isFav
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-2 border-white shadow-red-500/50'
              : 'bg-black/50 text-white border border-white/30 hover:bg-black/70'
          }`}
          style={{
            animation: isFav ? 'heartPulse 1.5s ease-in-out infinite' : 'none'
          }}
        >
          <Heart size={18} className={isFav ? 'fill-current' : ''} strokeWidth={isFav ? 0 : 2.5} />
        </button>
      </Link>

      <style>{`
        @keyframes heartPulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5), 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5), 0 0 0 8px rgba(239, 68, 68, 0);
          }
        }
      `}</style>

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
            {/* Story Ring + Trust Badge */}
            {sellerPhotoURL && (
              <div className="flex items-center gap-2">
                <StoryRing
                  hasStories={sellerStories.length > 0}
                  stories={sellerStories}
                  imageUrl={sellerPhotoURL}
                  size="small"
                />
                {sellerTrustData && (
                  <TrustBadge
                    trustData={sellerTrustData}
                    variant="compact"
                    size="small"
                    showLabel={false}
                  />
                )}
              </div>
            )}

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

export default memo(CarCardGermanStyle);
