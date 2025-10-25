// Mobile Vehicle Start Page - Professional Edition
// Touch-optimized vehicle type selection

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import styled from 'styled-components';
import { MobileContainer, MobileStack } from '../../components/ui/mobile-index';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { 
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileShadows,
  mobileMixins
} from '../../styles/mobile-design-system';

type VehicleType = 'car' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'other';

interface VehicleOption {
  type: VehicleType;
  icon: string;
  label: string;
  description: string;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${mobileColors.neutral.gray50};
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${mobileSpacing.lg} 0;
`;

const HeaderSection = styled.div`
  margin-bottom: ${mobileSpacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${mobileTypography.display.xs.fontSize};
  line-height: ${mobileTypography.display.xs.lineHeight};
  font-weight: ${mobileTypography.display.xs.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${mobileTypography.bodyLarge.fontSize};
  line-height: ${mobileTypography.bodyLarge.lineHeight};
  color: ${mobileColors.neutral.gray600};
  margin: 0;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${mobileSpacing.md};
  margin-bottom: ${mobileSpacing.xl};
`;

const VehicleCard = styled.button<{ $selected: boolean }>`
  ${mobileMixins.touchTarget}
  min-height: 140px;
  padding: ${mobileSpacing.lg};
  
  background: ${props => props.$selected 
    ? `linear-gradient(135deg, ${mobileColors.primary.main}, ${mobileColors.primary.dark})`
    : mobileColors.surface.background
  };
  
  border: 2px solid ${props => props.$selected 
    ? mobileColors.primary.main 
    : mobileColors.surface.border
  };
  
  border-radius: ${mobileBorderRadius.lg};
  box-shadow: ${props => props.$selected ? mobileShadows.md : mobileShadows.sm};
  
  cursor: pointer;
  transition: ${mobileAnimations.transitions.default};
  -webkit-tap-highlight-color: transparent;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${mobileSpacing.sm};
  
  &:active {
    transform: scale(0.98);
  }
  
  ${props => !props.$selected && `
    &:hover {
      border-color: ${mobileColors.primary.light};
      box-shadow: ${mobileShadows.md};
    }
  `}
`;

const VehicleIcon = styled.div<{ $selected: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: ${mobileBorderRadius.full};
  
  background: ${props => props.$selected 
    ? 'rgba(255, 255, 255, 0.2)' 
    : mobileColors.primary.pale
  };
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  font-size: 32px;
  
  transition: ${mobileAnimations.transitions.default};
`;

const VehicleLabel = styled.div<{ $selected: boolean }>`
  font-size: ${mobileTypography.bodyLarge.fontSize};
  font-weight: 600;
  color: ${props => props.$selected ? '#FFFFFF' : mobileColors.neutral.gray900};
  text-align: center;
  line-height: 1.3;
`;

const VehicleDescription = styled.div<{ $selected: boolean }>`
  font-size: ${mobileTypography.caption.fontSize};
  color: ${props => props.$selected 
    ? 'rgba(255, 255, 255, 0.9)' 
    : mobileColors.neutral.gray600
  };
  text-align: center;
  line-height: 1.4;
`;

const InfoBox = styled.div`
  padding: ${mobileSpacing.lg};
  background: ${mobileColors.info.light};
  border-left: 4px solid ${mobileColors.info.main};
  border-radius: ${mobileBorderRadius.md};
  margin-bottom: ${mobileSpacing.xl};
`;

const InfoText = styled.p`
  font-size: ${mobileTypography.bodySmall.fontSize};
  line-height: ${mobileTypography.bodySmall.lineHeight};
  color: ${mobileColors.info.dark};
  margin: 0;
`;

const ContinueButton = styled.button<{ $enabled: boolean }>`
  ${mobileMixins.touchTarget}
  ${mobileMixins.preventZoom}
  
  width: 100%;
  min-height: ${mobileSpacing.touchLarge};
  padding: ${mobileSpacing.md} ${mobileSpacing.xl};
  
  background: ${props => props.$enabled 
    ? mobileColors.primary.main 
    : mobileColors.neutral.gray300
  };
  
  color: #FFFFFF;
  border: none;
  border-radius: ${mobileBorderRadius.md};
  
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  letter-spacing: ${mobileTypography.button.letterSpacing};
  
  cursor: ${props => props.$enabled ? 'pointer' : 'not-allowed'};
  transition: ${mobileAnimations.transitions.default};
  -webkit-tap-highlight-color: transparent;
  
  opacity: ${props => props.$enabled ? 1 : 0.6};
  
  ${props => props.$enabled && `
    &:active {
      transform: scale(0.98);
      background: ${mobileColors.primary.dark};
    }
  `}
`;

const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${mobileSpacing.lg} ${mobileSpacing.md};
  background: ${mobileColors.surface.background};
  border-top: 1px solid ${mobileColors.surface.divider};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  ${mobileMixins.safeAreaPadding}
`;

export const MobileVehicleStartPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const vehicleOptions: VehicleOption[] = [
    {
      type: 'car',
      icon: 'CAR',
      label: t('sell.start.vehicleTypes.car.title'),
      description: t('sell.start.vehicleTypes.car.desc')
    },
    {
      type: 'suv',
      icon: 'SUV',
      label: t('sell.start.vehicleTypes.suv.title'),
      description: t('sell.start.vehicleTypes.suv.desc')
    },
    {
      type: 'truck',
      icon: 'TRUCK',
      label: t('sell.start.vehicleTypes.truck.title'),
      description: t('sell.start.vehicleTypes.truck.desc')
    },
    {
      type: 'motorcycle',
      icon: 'MOTO',
      label: t('sell.start.vehicleTypes.motorcycle.title'),
      description: t('sell.start.vehicleTypes.motorcycle.desc')
    },
    {
      type: 'van',
      icon: 'VAN',
      label: t('sell.start.vehicleTypes.van.title'),
      description: t('sell.start.vehicleTypes.van.desc')
    },
    {
      type: 'other',
      icon: 'OTHER',
      label: t('sell.start.vehicleTypes.bus.title'),
      description: t('sell.start.vehicleTypes.bus.desc')
    }
  ];
  
  const handleVehicleSelect = (type: VehicleType) => {
    setSelectedType(type);
  };
  
  const handleContinue = () => {
    if (!selectedType) return;
    
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/sell',
          vehicleType: selectedType 
        } 
      });
      return;
    }
    
    navigate(`/sell/inserat/${selectedType}/verkaeufertyp`);
  };
  
  return (
    <PageWrapper>
      <MobileHeader />
      
      <ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <HeaderSection>
              <PageTitle>
                {t('sell.start.chooseTypeTitle')}
              </PageTitle>
              <PageSubtitle>
                {t('sell.start.chooseTypeSubtitle')}
              </PageSubtitle>
            </HeaderSection>
            
            <VehicleGrid>
              {vehicleOptions.map((option) => (
                <VehicleCard
                  key={option.type}
                  $selected={selectedType === option.type}
                  onClick={() => handleVehicleSelect(option.type)}
                >
                  <VehicleIcon $selected={selectedType === option.type}>
                    {option.icon}
                  </VehicleIcon>
                  <VehicleLabel $selected={selectedType === option.type}>
                    {option.label}
                  </VehicleLabel>
                  <VehicleDescription $selected={selectedType === option.type}>
                    {option.description}
                  </VehicleDescription>
                </VehicleCard>
              ))}
            </VehicleGrid>
            
            <InfoBox>
              <InfoText>
                {t('sell.start.processInfoText')}
              </InfoText>
            </InfoBox>
          </MobileStack>
        </MobileContainer>
      </ContentWrapper>
      
      <StickyFooter>
        <ContinueButton
          $enabled={!!selectedType}
          onClick={handleContinue}
          disabled={!selectedType}
        >
          {t('sell.start.continue')}
        </ContinueButton>
      </StickyFooter>
    </PageWrapper>
  );
};

export default MobileVehicleStartPage;
