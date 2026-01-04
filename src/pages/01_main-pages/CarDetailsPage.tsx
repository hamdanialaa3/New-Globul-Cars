import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById, Car } from '../../services/carsService';
import CarImage from '../../components/CarImage';
import { Heart, Share2, MapPin, Gauge, Fuel, Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { shareContent } from '../../utils/shareUtils';
import SimilarCars from '../../components/SimilarCars';
import ImageModal from '../../components/ImageModal';
import CarHistory from '../../components/CarHistory';
import { CarSEO } from '../../components/SEO/CarSEO';

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { t } = useLanguage();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      
      try {
        const carData = await getCarById(parseInt(id));
        setCar(carData);
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleFavoriteClick = () => {
    if (!car) return;
    
    if (isFavorite(car.id)) {
      removeFavorite(car.id);
    } else {
      addFavorite(car);
    }
  };

  const handleWishlistClick = () => {
    if (!car) return;
    
    if (isInWishlist(car.id)) {
      removeFromWishlist(car.id);
    } else {
      addToWishlist(car);
    }
  };

  const handleShare = async () => {
    if (!car) return;
    await shareContent({
      title: car.name,
      text: `${car.name} - ${car.price}`,
      url: window.location.href
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">{t('carNotFound')}</p>
      </div>
    );
  }

  const images = car.images || [];

  return (
    <>
      <CarSEO car={car} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← {t('back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div 
              className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              <CarImage
                src={images[selectedImageIndex]}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-blue-600'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <CarImage
                      src={image}
                      alt={`${car.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
              <p className="text-2xl font-semibold text-blue-600">{car.price}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFavoriteClick}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                  isFavorite(car.id)
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(car.id) ? 'fill-current' : ''}`} />
                {isFavorite(car.id) ? t('removeFromFavorites') : t('addToFavorites')}
              </button>
              
              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('mileage')}</p>
                    <p className="font-medium">{car.mileage}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Fuel className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('fuelType')}</p>
                    <p className="font-medium">{car.fuelType}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('transmission')}</p>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('location')}</p>
                    <p className="font-medium">{car.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {car.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t('description')}</h2>
                <p className="text-gray-600 leading-relaxed">{car.description}</p>
              </div>
            )}

            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t('features')}</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {car.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleWishlistClick}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isInWishlist(car.id)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isInWishlist(car.id) ? t('removeFromWishlist') : t('addToWishlist')}
            </button>
          </div>
        </div>

        {/* Car History Section */}
        <CarHistory car={car} />

        {/* Similar Cars Section */}
        <SimilarCars currentCarId={car.id} />

        {/* Image Modal */}
        <ImageModal
          isOpen={isImageModalOpen}
          images={images}
          currentIndex={selectedImageIndex}
          onClose={() => setIsImageModalOpen(false)}
          onNavigate={setSelectedImageIndex}
          carName={car.name}
        />
      </div>
    </>
  );
};

export default CarDetailsPage;