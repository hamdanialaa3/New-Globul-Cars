import React from 'react';
import { CarListing } from '@/types/CarListing';
import {
  DetailsSection,
  SectionTitle,
  DetailRow,
  DetailLabel,
  DetailValue,
} from '../CarDetailsPage.styles';

interface CarBasicInfoProps {
  car: CarListing;
  language: 'bg' | 'en';
}

export const CarBasicInfo: React.FC<CarBasicInfoProps> = ({ car, language }) => {
  return (
    <DetailsSection>
      <SectionTitle>
        {language === 'bg' ? 'Основни данни' : 'Basic Information'}
      </SectionTitle>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Марка' : 'Make'}</DetailLabel>
        <DetailValue>{car.make || car.makeOther || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Модел' : 'Model'}</DetailLabel>
        <DetailValue>{car.model || car.modelOther || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Година' : 'Year'}</DetailLabel>
        <DetailValue>{car.year || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Пробег' : 'Mileage'}</DetailLabel>
        <DetailValue>{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Гориво' : 'Fuel Type'}</DetailLabel>
        <DetailValue>{car.fuelType || car.fuelTypeOther || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</DetailLabel>
        <DetailValue>{car.transmission || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Мощност' : 'Power'}</DetailLabel>
        <DetailValue>{car.power ? `${car.power} HP` : 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Цвят' : 'Color'}</DetailLabel>
        <DetailValue>{car.color || car.colorOther || car.exteriorColor || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Врати' : 'Doors'}</DetailLabel>
        <DetailValue>{car.numberOfDoors || car.doors || 'N/A'}</DetailValue>
      </DetailRow>
      
      <DetailRow>
        <DetailLabel>{language === 'bg' ? 'Места' : 'Seats'}</DetailLabel>
        <DetailValue>{car.numberOfSeats || car.seats || 'N/A'}</DetailValue>
      </DetailRow>
    </DetailsSection>
  );
};

