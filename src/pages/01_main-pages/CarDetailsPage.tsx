import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Calendar, Gauge, Fuel, Users, MapPin, Phone, Mail } from 'lucide-react';
import { Car } from '../../types/car';
import { getCarById } from '../../services/carService';
import { ImageGallery } from '../../components/ImageGallery';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatPrice';
import { PageTransition } from '../../components/PageTransition';
import { ShareModal } from '../../components/ShareModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import { ContactSection } from '../../components/ContactSection';
import { SimilarCars } from '../../components/SimilarCars';
import { CarSEO } from '../../components/SEO/CarSEO';

export function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setError('Car ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const carData = await getCarById(id);
        setCar(carData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleToggleFavorite = () => {
    if (!car) return;
    
    if (isFavorite(car.id)) {
      removeFavorite(car.id);
    } else {
      addFavorite(car);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !car) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Car not found'}
            </h2>
            <button
              onClick={() => navigate('/inventory')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Return to Inventory
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <>
      <CarSEO car={car} />
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite(car.id)
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-label={isFavorite(car.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite(car.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Share car"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Images and Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image Gallery */}
                <ImageGallery images={car.images} alt={`${car.make} ${car.model}`} />

                {/* Car Title and Price */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {car.year} {car.make} {car.model}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{car.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatPrice(car.price)}
                      </div>
                      {car.monthlyPayment && (
                        <div className="text-sm text-gray-600 mt-1">
                          or {formatPrice(car.monthlyPayment)}/mo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Year</div>
                        <div className="font-semibold">{car.year}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Mileage</div>
                        <div className="font-semibold">{car.mileage.toLocaleString()} km</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Fuel</div>
                        <div className="font-semibold capitalize">{car.fuelType}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Seats</div>
                        <div className="font-semibold">{car.seats}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{car.description}</p>
                </div>

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {car.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Transmission</span>
                      <span className="font-semibold capitalize">{car.transmission}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Body Type</span>
                      <span className="font-semibold capitalize">{car.bodyType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Color</span>
                      <span className="font-semibold capitalize">{car.color}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Condition</span>
                      <span className="font-semibold capitalize">{car.condition}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <ContactSection car={car} />
                </div>
              </div>
            </div>

            {/* Similar Cars */}
            <div className="mt-12">
              <SimilarCars currentCar={car} />
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <ShareModal
            url={window.location.href}
            title={`${car.year} ${car.make} ${car.model}`}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </PageTransition>
    </>
  );
}