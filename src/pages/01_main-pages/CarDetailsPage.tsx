import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unifiedCarService, UnifiedCar } from '@/services/car';
import { Heart, Share2, MapPin, Gauge, Fuel, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { CarSEO } from '@/components/seo/CarSEO';
import { logger } from '@/services/logger-service';

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<UnifiedCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      
      try {
        const carData = await unifiedCarService.getCarById(id);
        setCar(carData);
      } catch (error) {
        logger.error('Error fetching car', error as Error, { carId: id });
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleShare = async () => {
    if (!car) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${car.make} ${car.model}`,
          text: `${car.make} ${car.model} - ${car.year}`,
          url: window.location.href
        });
      }
    } catch (error) {
      logger.warn('Share failed', { error });
    }
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
              <img
                src={images[selectedImageIndex]}
                alt={`${car.make} ${car.model}`}
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
                    <img
                      src={image}
                      alt={`${car.make} ${car.model} ${index + 1}`}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.make} {car.model}</h1>
              <p className="text-2xl font-semibold text-blue-600">{car.price} {car.currency || 'EUR'}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                {t('share')}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default CarDetailsPage;