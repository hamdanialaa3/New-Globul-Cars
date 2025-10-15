import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';
import { CarIconSimple } from '../icons/CarIcon';

interface VehicleTypeStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const VehicleCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#2c3e50'};
  border: 2px solid ${props => props.isSelected ? 'transparent' : '#e9ecef'};
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.isSelected ? 'transparent' : '#667eea'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    transition: all 0.3s ease;
  }

  &:hover::before {
    background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.05)'};
  }
`;

const VehicleIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const VehicleTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  position: relative;
  z-index: 1;
`;

const VehicleDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  z-index: 2;
`;

const InfoSection = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;

const VehicleTypeStep: React.FC<VehicleTypeStepProps> = ({ data, onDataChange }) => {
  const [selectedType, setSelectedType] = useState<string>(data.vehicleType || '');

  const vehicleTypes = [
    {
      id: 'car',
      title: 'Лека кола',
      titleEn: 'Passenger Car',
      icon: <CarIconSimple size={32} color="#FF7900" />,
      description: 'Леки автомобили за лично ползване',
      descriptionEn: 'Passenger cars for personal use'
    },
    {
      id: 'suv',
      title: 'Джип/SUV',
      titleEn: 'SUV/Off-road',
      icon: '🚙',
      description: 'Високопроходими автомобили',
      descriptionEn: 'High-clearance vehicles'
    },
    {
      id: 'van',
      title: 'Ван',
      titleEn: 'Van',
      icon: '🚐',
      description: 'Товарни автомобили и комби',
      descriptionEn: 'Cargo vehicles and vans'
    },
    {
      id: 'motorcycle',
      title: 'Мотоциклет',
      titleEn: 'Motorcycle',
      icon: '🏍️',
      description: 'Двуколесни превозни средства',
      descriptionEn: 'Two-wheeled vehicles'
    },
    {
      id: 'truck',
      title: 'Камион',
      titleEn: 'Truck',
      icon: '🚛',
      description: 'Големи товарни автомобили',
      descriptionEn: 'Large cargo vehicles'
    },
    {
      id: 'bus',
      title: 'Автобус',
      titleEn: 'Bus',
      icon: '🚌',
      description: 'Автобуси за пътнически транспорт',
      descriptionEn: 'Buses for passenger transport'
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    onDataChange({ vehicleType: typeId });
  };

  return (
    <StepContainer>
      <VehicleGrid>
        {vehicleTypes.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            isSelected={selectedType === vehicle.id}
            onClick={() => handleTypeSelect(vehicle.id)}
          >
            {selectedType === vehicle.id && (
              <SelectedIndicator>✓</SelectedIndicator>
            )}
            <VehicleIcon>{vehicle.icon}</VehicleIcon>
            <VehicleTitle>{vehicle.title}</VehicleTitle>
            <VehicleDescription>{vehicle.description}</VehicleDescription>
          </VehicleCard>
        ))}
      </VehicleGrid>

      <InfoSection>
        <InfoTitle>ℹ️ Информация за типа на превозното средство</InfoTitle>
        <InfoText>
          Изберете типа на превозното средство, което искате да продадете. 
          Това ще ни помогне да ви покажем най-подходящите опции и да персонализираме 
          процеса на създаване на обявата според вашия избор.
        </InfoText>
      </InfoSection>
    </StepContainer>
  );
};

export default VehicleTypeStep;
