import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  Fuel, 
  Gauge, 
  DoorClosed,
  Settings
} from 'lucide-react';
import { CarSEO } from '../../components/SEO/CarSEO';
import { CarService, Car } from '../../services/carService';
import CarDetailsImageGallery from '../../components/car/CarDetailsImageGallery';
import PriceBreakdown from '../../components/car/PriceBreakdown';
import CarFeatures from '../../components/car/CarFeatures';
import { BookingForm } from '../../components/booking/BookingForm';
import { SEOManager } from '../../utils/seoManager';

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      if (!id) {
        setError('Car ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const carData = await CarService.getCarById(id);
        
        if (!carData) {
          setError('Car not found');
          return;
        }

        setCar(carData);
        
        // Update SEO for this car
        SEOManager.updateCarPage({
          name: carData.name,
          year: carData.year,
          pricePerDay: carData.pricePerDay,
          description: carData.description,
          images: carData.images,
          category: carData.category
        });
      } catch (err) {
        console.error('Error loading car:', err);
        setError('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Car not found'}</p>
          <button
            onClick={() => navigate('/cars')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CarSEO car={car} />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cars')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Cars
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Car Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <CarDetailsImageGallery 
                images={car.images} 
                carName={car.name}
              />

              {/* Car Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {car.name}
                    </h1>
                    <p className="text-gray-600">{car.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      ${car.pricePerDay}
                    </p>
                    <p className="text-gray-600">per day</p>
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Year</p>
                      <p className="font-semibold">{car.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Seats</p>
                      <p className="font-semibold">{car.seats}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-semibold">{car.transmission}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Fuel className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Fuel</p>
                      <p className="font-semibold">{car.fuelType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Gauge className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-semibold">{car.mileage}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <DoorClosed className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Doors</p>
                      <p className="font-semibold">{car.doors}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {car.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <CarFeatures features={car.features} />

              {/* Price Breakdown */}
              <PriceBreakdown pricePerDay={car.pricePerDay} />
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BookingForm car={car} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarDetailsPage;