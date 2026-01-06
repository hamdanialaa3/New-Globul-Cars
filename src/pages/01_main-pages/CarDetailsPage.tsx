import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { CarDetails } from '../../components/car/CarDetails';
import { RelatedCars } from '../../components/car/RelatedCars';
import { RecentlyViewed } from '../../components/car/RecentlyViewed';
import { CarGallery } from '../../components/car/CarGallery';
import { CarContactForm } from '../../components/forms/CarContactForm';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';
import { useCars } from '../../hooks/useCars';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { CarSEO } from '../../components/SEO/CarSEO';
import type { Car } from '../../types';

export function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cars, loading } = useCars();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!loading && cars.length > 0) {
      const foundCar = cars.find(c => c.id === id);
      if (foundCar) {
        setCar(foundCar);
        addToRecentlyViewed(foundCar);
      } else {
        navigate('/404');
      }
    }
  }, [id, cars, loading, navigate, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <>
      <CarSEO car={car} />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CarGallery images={car.images} title={car.title} />
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CarDetails car={car} />
              </div>
              
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CarContactForm car={car} />
                </div>
              </div>
            </div>

            <div className="mt-12">
              <RelatedCars currentCarId={car.id} category={car.category} />
            </div>

            <div className="mt-12">
              <RecentlyViewed currentCarId={car.id} />
            </div>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}