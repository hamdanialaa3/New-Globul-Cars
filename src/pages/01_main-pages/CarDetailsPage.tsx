/**
 * Car Details Page - Wrapper Component
 * Delegates to CarDetailsMobileDEStyle for actual rendering
 * Supports both URL-based ID and forced ID (from NumericCarDetailsPage)
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import CarDetailsMobileDEStyle from './components/CarDetailsMobileDEStyle';

interface CarDetailsPageProps {
  forcedCarId?: string;
  initialEditMode?: boolean;
}

const CarDetailsPage: React.FC<CarDetailsPageProps> = ({ forcedCarId, initialEditMode }) => {
  const { id } = useParams<{ id: string }>();
  
  // Use forcedCarId if provided (from NumericCarDetailsPage), otherwise use URL param
  const carId = forcedCarId || id;

  return (
    <CarDetailsMobileDEStyle 
      forcedCarId={carId}
      initialEditMode={initialEditMode}
    />
  );
};

export default CarDetailsPage;