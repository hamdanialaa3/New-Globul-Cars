import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { CarCard } from '../../components/CarCard';
import { SimilarCars } from '../../components/SimilarCars';
import { CarDetails } from '../../components/CarDetails';
import { Breadcrumb } from '../../components/Breadcrumb';
import { supabase } from '../../lib/supabase';
import type { Car as CarType } from '../../types/car';
import { CarImageGallery } from '../../components/CarImageGallery';
import { CarFinancing } from '../../components/CarFinancing';
import { CarReviews } from '../../components/CarReviews';
import { ExitIntentPopup } from '../../components/ExitIntentPopup';
import { CarSEO } from '../../components/SEO/CarSEO';

export function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarType | null>(null);
  const [similarCars, setSimilarCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single();

        if (carError) throw carError;

        if (!carData) {
          setError('Car not found');
          return;
        }

        setCar(carData);

        // Fetch similar cars (same make, excluding current car)
        const { data: similarCarsData, error: similarError } = await supabase
          .from('cars')
          .select('*')
          .eq('make', carData.make)
          .neq('id', id)
          .limit(4);

        if (similarError) throw similarError;
        setSimilarCars(similarCarsData || []);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const handleContactClick = () => {
    if (car) {
      navigate('/contact', { state: { car } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Car Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The car you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/cars')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cars', href: '/cars' },
    { label: `${car.year} ${car.make} ${car.model}` },
  ];

  return (
    <>
      <CarSEO car={car} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <CarImageGallery images={car.images} />
              <CarDetails car={car} onContactClick={handleContactClick} />
              <CarFinancing car={car} />
              <CarReviews carId={car.id} />
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CarCard car={car} featured />
              </div>
            </div>
          </div>

          {similarCars.length > 0 && (
            <SimilarCars cars={similarCars} currentCarId={car.id} />
          )}
        </div>
      </div>
      
      <ExitIntentPopup
        isOpen={showExitIntent}
        onClose={() => setShowExitIntent(false)}
        car={car}
      />
    </>
  );
}