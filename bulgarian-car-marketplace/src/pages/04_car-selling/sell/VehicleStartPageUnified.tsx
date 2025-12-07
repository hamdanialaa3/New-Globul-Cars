// Vehicle Start Page Unified - Responsive Design
// صفحة اختيار نوع السيارة الموحدة - تصميم متجاوب
// Combines VehicleStartPageNew + MobileVehicleStartPage functionality

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { useProfileType } from '../../../contexts/ProfileTypeContext';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import { logger } from '../../../services/logger-service';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, CarFront } from 'lucide-react';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import N8nIntegrationService from '../../../services/n8n-integration';
import { SellWorkflowLayout } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';

// Mobile Components
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { SellProgressBar } from '../../../components/SellWorkflow';

// Responsive Styles
const PageWrapper = styled.div<{ $isMobile: boolean }>`
  min-height: 100vh;
  background: ${props => props.$isMobile ? '#f8f9fa' : 'var(--bg-card)'};
  ${props => props.$isMobile ? `
    display: flex;
    flex-direction: column;
  ` : ''}
`;

const ContentWrapper = styled.div<{ $isMobile: boolean }>`
  ${props => props.$isMobile ? `
    flex: 1;
    padding: 1rem 0;
  ` : `
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `}
`;

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

const HeaderCard = styled.div<{ $isMobile: boolean }>`
  ${props => props.$isMobile ? `
    background: white;
    border-radius: 0;
    padding: 2rem 1rem;
    margin-bottom: 1rem;
  ` : `
    background: var(--bg-card);
    border-radius: 20px;
    box-shadow: var(--shadow-md);
    padding: 2.5rem;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  `}
`;

const Title = styled.h1<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '1.75rem' : '1.75rem'};
  font-weight: 700;
  color: ${props => props.$isMobile ? '#2c3e50' : 'var(--text-primary)'};
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.5px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '1rem' : '1rem'};
  color: ${props => props.$isMobile ? '#7f8c8d' : 'var(--text-secondary)'};
  margin: 0;
  line-height: 1.6;
`;

const BrandOrbitInline = styled.div`
  align-self: flex-start;
  max-width: 240px;
  margin: 1rem 0 1.5rem;
`;

const VehicleGrid = styled.div<{ $isMobile: boolean }>`
  ${props => props.$isMobile ? `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 0 1rem;
    margin-bottom: 2rem;
  ` : `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    background: var(--bg-card);
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 1024px) {
      padding: 1.25rem 1.5rem;
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      padding: 1rem 1rem;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `}
`;

const VehicleOption = styled.div<{ $isHovered: boolean; $isMobile: boolean; $disabled?: boolean }>`
  ${props => props.$isMobile ? `
    min-height: 140px;
    padding: 1.5rem 1rem;
    background: ${props.$disabled 
      ? '#e9ecef' 
      : props.$isHovered ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
    border: 2px solid ${props.$disabled 
      ? '#ced4da' 
      : props.$isHovered ? '#667eea' : '#e9ecef'};
    border-radius: 12px;
    text-align: center;
    cursor: ${props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.3s ease;
    color: ${props.$disabled 
      ? '#6c757d' 
      : props.$isHovered ? 'white' : '#2c3e50'};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    opacity: ${props.$disabled ? 0.6 : 1};
    position: relative;

    &:active {
      transform: ${props.$disabled ? 'none' : 'scale(0.98)'};
    }
  ` : `
    background: ${props.$disabled 
      ? '#e9ecef' 
      : props.$isHovered ? 'var(--accent-primary)' : 'var(--bg-secondary)'};
    border: 2px solid ${props.$disabled 
      ? '#ced4da' 
      : props.$isHovered ? 'var(--accent-primary)' : 'var(--border)'};
    border-radius: 12px;
    padding: 2rem 1.5rem;
    text-align: center;
    cursor: ${props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.3s ease;
    color: ${props.$disabled 
      ? '#6c757d' 
      : props.$isHovered ? 'var(--text-inverse)' : 'var(--text-primary)'};
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    opacity: ${props.$disabled ? 0.6 : 1};
    position: relative;

    &:hover {
      transform: ${props.$disabled ? 'none' : 'translateY(-3px)'};
      box-shadow: ${props.$disabled ? 'none' : 'var(--shadow-md)'};
    }

    &:active {
      transform: ${props.$disabled ? 'none' : 'scale(0.98)'};
    }
  `}
`;

const VehicleIconWrapper = styled.div<{ $isHovered: boolean; $isMobile: boolean }>`
  ${props => props.$isMobile ? `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${props.$isHovered ? 'rgba(255, 255, 255, 0.2)' : '#f8f9fa'};
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 32px;
      height: 32px;
      color: ${props.$isHovered ? 'white' : '#667eea'};
    }
  ` : `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 55px;
    margin: 0 auto 0.75rem;
    border-radius: 50%;
    background: ${props.$isHovered ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-secondary)'};

    svg {
      width: 28px;
      height: 28px;
      color: ${props.$isHovered ? 'var(--text-inverse)' : 'var(--accent-primary)'};
    }
  `}
`;

const VehicleLabel = styled.div<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '1rem' : '1rem'};
  font-weight: 600;
  line-height: 1.3;
`;

const VehicleDesc = styled.div<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '0.875rem' : '0.75rem'};
  opacity: 0.85;
  margin-top: 0.25rem;
`;

const InfoCard = styled.div<{ $isMobile: boolean }>`
  ${props => props.$isMobile ? `
    padding: 1.5rem 1rem;
    background: #f8f9fa;
    border-left: 4px solid #667eea;
    border-radius: 8px;
    margin: 0 1rem 2rem;
  ` : `
    background: var(--bg-secondary);
    border-radius: 15px;
    padding: 1.5rem;
    border-left: 4px solid var(--accent-primary);
    border: 1px solid var(--border);
  `}
`;

const InfoText = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
`;

const VehicleStartPageUnified: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { permissions, profileType } = useProfileType();
  const isMobile = useIsMobile();
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('vt')) {
      SellWorkflowStepStateService.reset();
    }
    SellWorkflowStepStateService.markPending('vehicle-selection');
  }, [location.search]);

  const vehicleTypes = [
    { id: 'car', IconComponent: Car, title: t('sell.start.vehicleTypes.car.title', 'Лек автомобил'), desc: t('sell.start.vehicleTypes.car.desc', 'Леки коли до 3.5т'), disabled: false },
    { id: 'suv', IconComponent: CarFront, title: t('sell.start.vehicleTypes.suv.title', 'Джип/Кросоувър'), desc: t('sell.start.vehicleTypes.suv.desc', 'Високопроходими автомобили'), disabled: false },
    { id: 'van', IconComponent: Caravan, title: t('sell.start.vehicleTypes.van.title', 'Ван/Комби'), desc: t('sell.start.vehicleTypes.van.desc', 'Товаро-пътнически автомобили'), disabled: true },
    { id: 'motorcycle', IconComponent: Bike, title: t('sell.start.vehicleTypes.motorcycle.title', 'Мотоциклет'), desc: t('sell.start.vehicleTypes.motorcycle.desc', 'Мотоциклети и скутери'), disabled: true },
    { id: 'truck', IconComponent: Truck, title: t('sell.start.vehicleTypes.truck.title', 'Камион'), desc: t('sell.start.vehicleTypes.truck.desc', 'Товарни автомобили'), disabled: true },
    { id: 'bus', IconComponent: Bus, title: t('sell.start.vehicleTypes.bus.title', 'Автобус'), desc: t('sell.start.vehicleTypes.bus.desc', 'Пътнически автобуси'), disabled: true }
  ];

  const handleSelect = async (typeId: string, disabled: boolean) => {
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
    // ✅ NEW ROUTE: Navigate to data page
    navigate(`/sell/inserat/${typeId}/data?${params.toString()}`);
  };

  // Mobile version
  if (isMobile) {
    return (
      <PageWrapper $isMobile={true}>
        <MobileHeader />
        <ProgressWrapper>
          <SellProgressBar currentStep="vehicle-selection" />
        </ProgressWrapper>

        <ContentWrapper $isMobile={true}>
          <MobileContainer maxWidth="md">
            <MobileStack spacing="lg">
              <HeaderCard $isMobile={true}>
                <Title $isMobile={true}>
                  {t('sell.start.chooseTypeTitle', 'Изберете тип превозно средство')}
                </Title>
                <Subtitle $isMobile={true}>
                  {t('sell.start.chooseTypeSubtitle', 'Какъв тип превозно средство искате да продадете?')}
                </Subtitle>
              </HeaderCard>

              <VehicleGrid $isMobile={true}>
                {vehicleTypes.map((vehicle) => {
                  const IconComponent = vehicle.IconComponent;
                  const isHovered = hoveredType === vehicle.id;
                  const isDisabled = vehicle.disabled || false;

                  return (
                    <VehicleOption
                      key={vehicle.id}
                      $isHovered={isHovered}
                      $isMobile={true}
                      $disabled={isDisabled}
                      onClick={() => handleSelect(vehicle.id, isDisabled)}
                      onMouseEnter={() => !isDisabled && setHoveredType(vehicle.id)}
                      onMouseLeave={() => setHoveredType(null)}
                    >
                      <VehicleIconWrapper $isHovered={isHovered} $isMobile={true}>
                        <IconComponent />
                      </VehicleIconWrapper>
                      <VehicleLabel $isMobile={true}>
                        {vehicle.title}
                      </VehicleLabel>
                      <VehicleDesc $isMobile={true}>
                        {vehicle.desc}
                      </VehicleDesc>
                      {isDisabled && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          color: '#6c757d'
                        }}>
                          {language === 'bg' ? 'Скоро' : 'Coming Soon'}
                        </div>
                      )}
                    </VehicleOption>
                  );
                })}
              </VehicleGrid>

              <InfoCard $isMobile={true}>
                <InfoText>
                  {t('sell.start.processInfoText', 'Ще ви преведем през няколко лесни стъпки за създаване на вашата обява. Можете да запазите прогреса си по всяко време.')}
                </InfoText>
              </InfoCard>
            </MobileStack>
          </MobileContainer>
        </ContentWrapper>
      </PageWrapper>
    );
  }

  // Desktop version
  const leftContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <HeaderCard $isMobile={false}>
        <Title $isMobile={false}>{t('sell.start.chooseTypeTitle')}</Title>
        <Subtitle $isMobile={false}>{t('sell.start.chooseTypeSubtitle')}</Subtitle>

        <BrandOrbitInline>
          <WorkflowFlow
            variant="inline"
            currentStepIndex={0}
            totalSteps={8}
            language={language}
          />
        </BrandOrbitInline>
      </HeaderCard>

      <VehicleGrid $isMobile={false}>
        {vehicleTypes.map((vehicle) => {
          const IconComponent = vehicle.IconComponent;
          const isHovered = hoveredType === vehicle.id;
          const isDisabled = vehicle.disabled || false;

          return (
            <VehicleOption
              key={vehicle.id}
              $isHovered={isHovered}
              $isMobile={false}
              $disabled={isDisabled}
              onClick={() => handleSelect(vehicle.id, isDisabled)}
              onMouseEnter={() => !isDisabled && setHoveredType(vehicle.id)}
              onMouseLeave={() => setHoveredType(null)}
            >
              <VehicleIconWrapper $isHovered={isHovered} $isMobile={false}>
                <IconComponent />
              </VehicleIconWrapper>
              <VehicleLabel $isMobile={false}>
                {vehicle.title}
              </VehicleLabel>
              <VehicleDesc $isMobile={false}>
                {vehicle.desc}
              </VehicleDesc>
              {isDisabled && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  color: '#6c757d'
                }}>
                  {language === 'bg' ? 'Скоро' : 'Coming Soon'}
                </div>
              )}
            </VehicleOption>
          );
        })}
      </VehicleGrid>

      <InfoCard $isMobile={false}>
        <InfoText>{t('sell.start.processInfoText')}</InfoText>
      </InfoCard>
    </div>
  );

  return (
    <SellWorkflowLayout currentStep="vehicle-selection">
      <SplitScreenLayout leftContent={leftContent} />
    </SellWorkflowLayout>
  );
};

export default VehicleStartPageUnified;