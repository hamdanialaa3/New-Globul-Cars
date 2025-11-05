// Vehicle Start Page with Workflow - Auto Continue
// صفحة اختيار نوع السيارة مع الأتمتة - انتقال تلقائي

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, CarFront } from 'lucide-react';
import SplitScreenLayout from '@/components/SplitScreenLayout';
import { WorkflowFlow } from '@/components/WorkflowVisualization';
import { useAuth } from '@/contexts/AuthProvider';
import N8nIntegrationService from '@/services/n8n-integration';

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
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
`;

const Title = styled.h1`
  font-size: 1.75rem; /* 28px - Global Standard */
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem; /* 16px */
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const VehicleOption = styled.div<{ $isHovered: boolean }>`
  background: ${props => props.$isHovered 
    ? 'linear-gradient(135deg, #ff8f10, #005ca9)' 
    : 'rgba(255, 143, 16, 0.05)'
  };
  border: 2px solid ${props => props.$isHovered ? '#ff8f10' : 'rgba(255, 143, 16, 0.2)'};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$isHovered ? 'white' : '#2c3e50'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const VehicleIconWrapper = styled.div<{ $isHovered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: ${props => props.$isHovered 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 143, 16, 0.15)'
  };

  svg {
    width: 28px;
    height: 28px;
    color: ${props => props.$isHovered ? 'white' : '#ff8f10'};
  }
`;

const VehicleLabel = styled.div`
  font-size: 1rem; /* 16px */
  font-weight: 600;
  line-height: 1.3;
`;

const VehicleDesc = styled.div`
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 0.25rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  border-left: 4px solid #ff8f10;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
`;

const VehicleStartPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const vehicleTypes = [
    { id: 'car', IconComponent: Car },
    { id: 'suv', IconComponent: CarFront },
    { id: 'van', IconComponent: Caravan },
    { id: 'motorcycle', IconComponent: Bike },
    { id: 'truck', IconComponent: Truck },
    { id: 'bus', IconComponent: Bus }
  ];

  const handleSelect = async (typeId: string) => {
    const params = new URLSearchParams();
    params.set('vt', typeId);
    
    // N8N Integration: Trigger vehicle type selection
    if (user?.uid) {
      try {
        await N8nIntegrationService.onVehicleTypeSelected(user.uid, typeId);
      } catch (error) {
        console.warn('N8N trigger failed (non-critical):', error);
      }
    }
    
    // Auto-navigate immediately
    navigate(`/sell/inserat/${typeId}/verkaeufertyp?${params.toString()}`);
  };

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: false },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: false },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: false },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: false },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: false },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  const leftContent = (
    <ContentSection>
      <HeaderCard>
        <Title>{t('sell.start.chooseTypeTitle')}</Title>
        <Subtitle>{t('sell.start.chooseTypeSubtitle')}</Subtitle>
      </HeaderCard>

      <VehicleGrid>
        {vehicleTypes.map((vehicle) => {
          const IconComponent = vehicle.IconComponent;
          const isHovered = hoveredType === vehicle.id;
          
          return (
            <VehicleOption
              key={vehicle.id}
              $isHovered={isHovered}
              onClick={() => handleSelect(vehicle.id)}
              onMouseEnter={() => setHoveredType(vehicle.id)}
              onMouseLeave={() => setHoveredType(null)}
            >
              <VehicleIconWrapper $isHovered={isHovered}>
                <IconComponent />
              </VehicleIconWrapper>
              <VehicleLabel>
                {t(`sell.start.vehicleTypes.${vehicle.id}.title`)}
              </VehicleLabel>
              <VehicleDesc>
                {t(`sell.start.vehicleTypes.${vehicle.id}.desc`)}
              </VehicleDesc>
            </VehicleOption>
          );
        })}
      </VehicleGrid>

      <InfoCard>
        <InfoText>{t('sell.start.processInfoText')}</InfoText>
      </InfoCard>
    </ContentSection>
  );

  const rightContent = (
    <WorkflowFlow
      currentStepIndex={0}
      totalSteps={8}
      language={language}
    />
  );

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default VehicleStartPageNew;

