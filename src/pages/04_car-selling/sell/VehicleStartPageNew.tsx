// Vehicle Start Page with Workflow - Auto Continue
// صفحة اختيار نوع السيارة مع الأتمتة - انتقال تلقائي

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, Wrench } from 'lucide-react';
import SplitScreenLayout from '@/components/SplitScreenLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { toast } from 'react-toastify';
// DEAD SERVICE: import N8nIntegrationService from '@/services/n8n-integration';
import { SellWorkflowLayout } from '@/components/SellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';
import { useUnifiedWorkflow } from '@/hooks/useUnifiedWorkflow';

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

const VehicleOption = styled.div<{ $isHovered: boolean; $disabled?: boolean }>`
  background: ${props => props.$isHovered && !props.$disabled
    ? 'var(--accent-primary)'
    : 'var(--bg-secondary)'};
  border: 2px solid ${props => props.$isHovered && !props.$disabled ? 'var(--accent-primary)' : 'var(--border)'};
  border-radius: 16px;
  padding: 1.75rem 1.25rem;
  text-align: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  color: ${props => props.$isHovered && !props.$disabled ? 'var(--text-inverse)' : 'var(--text-primary)'};
  opacity: ${props => props.$disabled ? 0.7 : 1};

  &:hover {
    ${props => !props.$disabled && `
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    `}
  }

  &:active {
    ${props => !props.$disabled && `
      transform: scale(0.98);
    `}
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
  
  // Use unified workflow (step 1)
  const { updateData } = useUnifiedWorkflow(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('vt')) {
      SellWorkflowStepStateService.reset();
    }
    SellWorkflowStepStateService.markPending('vehicle-selection');
  }, [location.search]);

  const vehicleTypes = [
    { id: 'car', IconComponent: Car, disabled: false },
    { id: 'van', IconComponent: Caravan, disabled: false },
    { id: 'motorcycle', IconComponent: Bike, disabled: false },
    { id: 'truck', IconComponent: Truck, disabled: false },
    { id: 'bus', IconComponent: Bus, disabled: false },
    { id: 'parts', IconComponent: Wrench, disabled: false }
  ];

  const handleSelect = async (typeId: string, disabled?: boolean) => {
    // If disabled, show "Coming Soon" message
    if (disabled) {
      toast.info(
        language === 'bg' ? 'Скоро ще бъде налично' : 'Coming Soon',
        {
          autoClose: 3000,
          position: 'top-center'
        }
      );
      return;
    }

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

    // Save vehicle type to unified workflow
    updateData({ 
      vehicleType: typeId,
      sellerType: profileType 
    });

    const params = new URLSearchParams();
    params.set('vt', typeId);
    if (profileType) {
      params.set('st', profileType);
    }
    
    // DEAD SERVICE - N8N Integration commented out
    // N8N Integration: Trigger vehicle type selection
    // if (user?.uid) {
    //   try {
    //     await N8nIntegrationService.onVehicleTypeSelected(user.uid, typeId);
    //   } catch (error) {
    //     logger.warn('N8N trigger failed (non-critical)', { userId: user.uid, typeId, error });
    //   }
    // }
    
    SellWorkflowStepStateService.markCompleted('vehicle-selection');

    // ✅ NEW ROUTE: Auto-navigate immediately to vehicle data step
    navigate(`/sell/inserat/${typeId}/data?${params.toString()}`);
  };

  const leftContent = (
    <ContentSection>
      <VehicleGridCard>
        <VehicleGrid>
          {vehicleTypes.map((vehicle) => {
            const IconComponent = vehicle.IconComponent;
            const isHovered = hoveredType === vehicle.id;
            const isDisabled = vehicle.disabled || false;

            return (
              <VehicleOption
                key={vehicle.id}
                $isHovered={isHovered}
                $disabled={isDisabled}
                onClick={() => handleSelect(vehicle.id, isDisabled)}
                onMouseEnter={() => !isDisabled && setHoveredType(vehicle.id)}
                onMouseLeave={() => setHoveredType(null)}
              >
                <VehicleIconWrapper $isHovered={isHovered}>
                  <IconComponent />
                </VehicleIconWrapper>
                <VehicleLabel>
                  {vehicle.id === 'parts' 
                    ? (language === 'bg' ? 'Резервни части' : 'Car Parts')
                    : t(`sell.start.vehicleTypes.${vehicle.id}.title`)}
                </VehicleLabel>
                <VehicleDesc>
                  {vehicle.id === 'parts'
                    ? (language === 'bg' ? 'Резервни части и аксесоари' : 'Spare parts and accessories')
                    : t(`sell.start.vehicleTypes.${vehicle.id}.desc`)}
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

