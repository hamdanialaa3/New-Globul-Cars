// Vehicle Start Page with Workflow - Auto Continue
// صفحة اختيار نوع السيارة مع الأتمتة - انتقال تلقائي

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, CarFront } from 'lucide-react';
import SplitScreenLayout from '@/components/SplitScreenLayout';
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
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const VehicleGridCard = styled.div`
  background: var(--bg-card);
  padding: 2.5rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const VehicleOption = styled.div<{ $isHovered: boolean }>`
  background: ${props => props.$isHovered
    ? 'var(--accent-primary)'
    : 'var(--bg-secondary)'};
  border: 2px solid ${props => props.$isHovered ? 'var(--accent-primary)' : 'var(--border)'};
  border-radius: 16px;
  padding: 1.75rem 1.25rem;
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
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
`;

const VehicleDesc = styled.div`
  font-size: 0.9rem;
  opacity: 0.85;
  margin-top: 0.35rem;
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

    // Auto-navigate immediately to vehicle data step
    navigate(`/sell/inserat/${typeId}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
  };

  const leftContent = (
    <ContentSection>
      <VehicleGridCard>
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
      </VehicleGridCard>
    </ContentSection>
  );

  return (
    <SellWorkflowLayout currentStep="vehicle-selection">
      <SplitScreenLayout leftContent={leftContent} />
    </SellWorkflowLayout>
  );
};

export default VehicleStartPageNew;

