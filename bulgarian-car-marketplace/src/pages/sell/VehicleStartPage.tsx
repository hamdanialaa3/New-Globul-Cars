import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, CarFront } from 'lucide-react';

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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 3rem;
  margin-bottom: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 143, 16, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.9rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const VehicleTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const VehicleTypeCard = styled.div<{ $isSelected: boolean }>`
  background: ${props => props.$isSelected ? 'linear-gradient(135deg, #ff8f10, #005ca9)' : 'white'};
  color: ${props => props.$isSelected ? 'white' : '#2c3e50'};
  border: 2px solid ${props => props.$isSelected ? 'transparent' : '#e9ecef'};
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(255, 143, 16, 0.2);
    border-color: ${props => props.$isSelected ? 'transparent' : '#ff8f10'};
  }
`;

const VehicleIcon = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: ${props => props.$isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 143, 16, 0.1)'};
  transition: all 0.3s ease;

  svg {
    width: 36px;
    height: 36px;
    color: ${props => props.$isSelected ? 'white' : '#ff8f10'};
  }
`;

const VehicleTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
`;

const VehicleDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  background: #27ae60;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

const ContinueButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#e9ecef' : 'linear-gradient(135deg, #ff8f10, #005ca9)'};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 2rem;
  box-shadow: ${props => props.disabled ? 'none' : '0 8px 20px rgba(255, 143, 16, 0.3)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
  }
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #ff8f10;
`;

const InfoTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.15rem;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
`;

const VehicleStartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
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
      IconComponent: Car,
      description: 'Леки автомобили за лично ползване',
      descriptionEn: 'Passenger cars for personal use'
    },
    {
      id: 'suv',
      title: 'Джип/SUV',
      titleEn: 'SUV/Off-road',
      IconComponent: CarFront,
      description: 'Високопроходими автомобили',
      descriptionEn: 'High-clearance vehicles'
    },
    {
      id: 'van',
      title: 'Ван',
      titleEn: 'Van',
      IconComponent: Caravan,
      description: 'Товарни автомобили и комби',
      descriptionEn: 'Cargo vehicles and vans'
    },
    {
      id: 'motorcycle',
      title: 'Мотоциклет',
      titleEn: 'Motorcycle',
      IconComponent: Bike,
      description: 'Двуколесни превозни средства',
      descriptionEn: 'Two-wheeled vehicles'
    },
    {
      id: 'truck',
      title: 'Камион',
      titleEn: 'Truck',
      IconComponent: Truck,
      description: 'Големи товарни автомобили',
      descriptionEn: 'Large cargo vehicles'
    },
    {
      id: 'bus',
      title: 'Автобус',
      titleEn: 'Bus',
      IconComponent: Bus,
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
          <Title>{t('sell.start.chooseTypeTitle')}</Title>
          <Subtitle>{t('sell.start.chooseTypeSubtitle')}</Subtitle>
        </HeaderCard>

        <VehicleTypeGrid>
          {vehicleTypes.map((vehicle) => {
            const IconComponent = vehicle.IconComponent;
            return (
              <VehicleTypeCard
                key={vehicle.id}
                $isSelected={selectedType === vehicle.id}
                onClick={() => handleTypeSelect(vehicle.id)}
              >
                {selectedType === vehicle.id && (
                  <SelectedIndicator>✓</SelectedIndicator>
                )}
                <VehicleIcon $isSelected={selectedType === vehicle.id}>
                  <IconComponent />
                </VehicleIcon>
                <VehicleTitle>
                  {language === 'bg' ? vehicle.title : vehicle.titleEn}
                </VehicleTitle>
                <VehicleDescription>
                  {language === 'bg' ? vehicle.description : vehicle.descriptionEn}
                </VehicleDescription>
              </VehicleTypeCard>
            );
          })}
        </VehicleTypeGrid>

        <div style={{ textAlign: 'center' }}>
          <ContinueButton
            disabled={!selectedType}
            onClick={handleContinue}
          >
            {t('sell.start.continue')}
          </ContinueButton>
        </div>

        <InfoCard>
          <InfoTitle>{t('sell.start.processInfoTitle')}</InfoTitle>
          <InfoText>{t('sell.start.processInfoText')}</InfoText>
        </InfoCard>
      </ContentWrapper>
    </StartContainer>
  );
};

export default VehicleStartPage;
