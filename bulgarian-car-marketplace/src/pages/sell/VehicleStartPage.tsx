import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const StartContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const VehicleTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const VehicleTypeCard = styled.div<{ $isSelected: boolean }>`
  background: ${props => props.$isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.$isSelected ? 'white' : '#2c3e50'};
  border: 2px solid ${props => props.$isSelected ? 'transparent' : '#e9ecef'};
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
    border-color: ${props => props.$isSelected ? 'transparent' : '#667eea'};
  }
`;

const VehicleIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const VehicleTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
`;

const VehicleDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
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
`;

const ContinueButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#e9ecef' : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
  }
`;

const InfoCard = styled.div`
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

const VehicleStartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<string>('');

  // Extract parameters from URL
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');

  const vehicleTypes = [
    {
      id: 'car',
      title: 'Лека кола',
      titleEn: 'Passenger Car',
      icon: '🚗',
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
  };

  const handleContinue = () => {
    if (!selectedType) return;

    // Build URL with parameters
    const params = new URLSearchParams();
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);
    params.set('vt', selectedType); // vehicle type

    navigate(`/sell/inserat/${selectedType}/verkaeufertyp?${params.toString()}`);
  };

  return (
    <StartContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Продайте превозното си средство</Title>
          <Subtitle>
            Изберете типа на превозното средство, което искате да продадете
          </Subtitle>
        </HeaderCard>

        <VehicleTypeGrid>
          {vehicleTypes.map((vehicle) => (
            <VehicleTypeCard
              key={vehicle.id}
              $isSelected={selectedType === vehicle.id}
              onClick={() => handleTypeSelect(vehicle.id)}
            >
              {selectedType === vehicle.id && (
                <SelectedIndicator>✓</SelectedIndicator>
              )}
              <VehicleIcon>{vehicle.icon}</VehicleIcon>
              <VehicleTitle>{vehicle.title}</VehicleTitle>
              <VehicleDescription>{vehicle.description}</VehicleDescription>
            </VehicleTypeCard>
          ))}
        </VehicleTypeGrid>

        <div style={{ textAlign: 'center' }}>
          <ContinueButton
            disabled={!selectedType}
            onClick={handleContinue}
          >
            Продължи
          </ContinueButton>
        </div>

        <InfoCard>
          <InfoTitle>ℹ️ Информация за процеса на продажба</InfoTitle>
          <InfoText>
            Процесът на продажба е разделен на няколко стъпки, които ще ви помогнат 
            да създадете професионална обява за вашето превозно средство. 
            Всяка стъпка е важна за привличане на сериозни купувачи.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </StartContainer>
  );
};

export default VehicleStartPage;
