// Vehicle Start Page with Workflow - Auto Continue
// صفحة اختيار نوع السيارة مع الأتمتة - انتقال تلقائي

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, CarFront } from 'lucide-react';
import SplitScreenLayout from '@/components/SplitScreenLayout';
import { WorkflowFlow } from '@/components/WorkflowVisualization';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { toast } from 'react-toastify';
import N8nIntegrationService from '@/services/n8n-integration';
import { SellWorkflowLayout } from '@/components/SellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderCard = styled.div`
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  padding: 2.5rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 1.75rem; /* 28px - Global Standard */
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem; /* 16px */
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const VehicleOption = styled.div<{ $isHovered: boolean }>`
  background: ${props => props.$isHovered 
    ? 'var(--accent-primary)' 
    : 'var(--bg-secondary)'
  };
  border: 2px solid ${props => props.$isHovered ? 'var(--accent-primary)' : 'var(--border)'};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$isHovered ? 'var(--text-inverse)' : 'var(--text-primary)'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
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
    : 'var(--bg-secondary)'
  };

  svg {
    width: 28px;
    height: 28px;
    color: ${props => props.$isHovered ? 'var(--text-inverse)' : 'var(--accent-primary)'};
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
  background: var(--bg-secondary);
  border-radius: 15px;
  padding: 1.5rem;
  border-left: 4px solid var(--accent-primary);
  border: 1px solid var(--border);
`;

const InfoText = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
`;

const VehicleStartPageNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { permissions, profileType } = useProfileType();
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('vt')) {
      SellWorkflowStepStateService.reset();
    }
    SellWorkflowStepStateService.markPending('vehicle-selection');
  }, [location.search]);

  const vehicleTypes = [
    { id: 'car', IconComponent: Car },
    { id: 'suv', IconComponent: CarFront },
    { id: 'van', IconComponent: Caravan },
    { id: 'motorcycle', IconComponent: Bike },
    { id: 'truck', IconComponent: Truck },
    { id: 'bus', IconComponent: Bus }
  ];

  const handleSelect = async (typeId: string) => {
    // Check monthly listing limits before proceeding
    const activeListings = (user as any)?.stats?.activeListings || 0;
    const maxListings = permissions.maxListings;

    // Enforce limit only if not unlimited (-1)
    if (maxListings !== -1 && activeListings >= maxListings) {
      const profileTypeNames = {
        private: language === 'bg' ? 'личен' : 'personal',
        dealer: language === 'bg' ? 'търговец' : 'dealer',
        company: language === 'bg' ? 'компания' : 'company'
      };

      toast.error(
        language === 'bg'
          ? `Достигнахте лимита от ${maxListings} активни обяви за ${profileTypeNames[profileType]} акаунт. Моля надстройте плана си за да добавите повече обяви.`
          : `You've reached the limit of ${maxListings} active listings for ${profileTypeNames[profileType]} account. Please upgrade your plan to add more listings.`,
        {
          autoClose: 6000,
          position: 'top-center'
        }
      );
      return; // Prevent navigation
    }

    const params = new URLSearchParams();
    params.set('vt', typeId);
    if (profileType) {
      params.set('st', profileType);
    }
    
    // N8N Integration: Trigger vehicle type selection
    if (user?.uid) {
      try {
        await N8nIntegrationService.onVehicleTypeSelected(user.uid, typeId);
      } catch (error) {
        logger.warn('N8N trigger failed (non-critical)', { userId: user.uid, typeId, error });
      }
    }
    
    SellWorkflowStepStateService.markCompleted('vehicle-selection');

    // Auto-navigate immediately
    navigate(`/sell/inserat/${typeId}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
  };

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

  return (
    <SellWorkflowLayout currentStep="vehicle-selection">
      <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />
    </SellWorkflowLayout>
  );
};

export default VehicleStartPageNew;

