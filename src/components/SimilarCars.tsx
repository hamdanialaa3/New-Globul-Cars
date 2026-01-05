// SimilarCars Component - Wrapper for SimilarCarsWidget
// مكون السيارات المشابهة

import React, { useEffect, useState } from 'react';
import { SimilarCarsWidget } from '../pages/01_main-pages/components/SimilarCarsWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { getCarById } from '../services/carsService';
import { logger } from '../services/logger-service';
import { CarListing } from '../types/CarListing';

interface SimilarCarsProps {
  currentCarId: string;
}

/**
 * SimilarCars Component
 * 
 * Wrapper component that loads car data and passes it to SimilarCarsWidget
 * 
 * @param currentCarId - ID of the current car to find similar cars for
 */
const SimilarCars: React.FC<SimilarCarsProps> = ({ currentCarId }) => {
  const { language } = useLanguage();
  const [currentCar, setCurrentCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        const car = await getCarById(currentCarId);
        setCurrentCar(car as CarListing);
      } catch (error) {
        logger.error('Failed to load car for similar cars widget', error as Error, { carId: currentCarId });
      } finally {
        setLoading(false);
      }
    };

    if (currentCarId) {
      loadCar();
    }
  }, [currentCarId]);

  if (loading || !currentCar) {
    return null; // Don't show anything while loading
  }

  return (
    <SimilarCarsWidget
      currentCar={currentCar}
      language={language as 'bg' | 'en'}
    />
  );
};

export default SimilarCars;
