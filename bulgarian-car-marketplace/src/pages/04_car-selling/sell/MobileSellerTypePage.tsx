// Mobile Seller Type Page - Professional Edition
// Choose between Private, Dealer, or Company seller

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import styled from 'styled-components';
import { MobileContainer, MobileStack } from '@/components/ui/mobile-index';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { 
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileShadows,
  mobileMixins
} from '@/styles/mobile-design-system';

type SellerType = 'private' | 'dealer' | 'company';

interface SellerOption {
  type: SellerType;
  icon: string;
  label: string;
  description: string;
  features: string[];
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
  padding-bottom: 140px;
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

const SellerCard = styled.button<{ $selected: boolean; $recommended?: boolean }>`
  ${mobileMixins.touchTarget}
  width: 100%;
  padding: ${mobileSpacing.lg};
  
  background: ${props => props.$selected 
    ? `linear-gradient(135deg, ${mobileColors.primary.main}, ${mobileColors.primary.dark})`
    : mobileColors.surface.background
  };
  
  border: 2px solid ${props => {
    if (props.$selected) return mobileColors.primary.main;
    if (props.$recommended) return mobileColors.success.main;
    return mobileColors.surface.border;
  }};
  
  border-radius: ${mobileBorderRadius.lg};
  box-shadow: ${props => props.$selected ? mobileShadows.md : mobileShadows.sm};
  
  cursor: pointer;
  transition: ${mobileAnimations.transitions.default};
  -webkit-tap-highlight-color: transparent;
  text-align: left;
  position: relative;
  overflow: hidden;
  
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

const RecommendedBadge = styled.div`
  position: absolute;
  top: ${mobileSpacing.sm};
  right: ${mobileSpacing.sm};
  padding: ${mobileSpacing.xxs} ${mobileSpacing.sm};
  background: ${mobileColors.success.main};
  color: #FFFFFF;
  font-size: ${mobileTypography.caption.fontSize};
  font-weight: 600;
  border-radius: ${mobileBorderRadius.full};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SellerCardHeader = styled.div`
  ${mobileMixins.flexCenter}
  justify-content: flex-start;
  gap: ${mobileSpacing.md};
  margin-bottom: ${mobileSpacing.md};
`;

const SellerIcon = styled.div<{ $selected: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: ${mobileBorderRadius.full};
  
  background: ${props => props.$selected 
    ? 'rgba(255, 255, 255, 0.2)' 
    : mobileColors.primary.pale
  };
  
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const SellerInfo = styled.div`
  flex: 1;
`;

const SellerLabel = styled.div<{ $selected: boolean }>`
  font-size: ${mobileTypography.h3.fontSize};
  font-weight: ${mobileTypography.h3.fontWeight};
  color: ${props => props.$selected ? '#FFFFFF' : mobileColors.neutral.gray900};
  margin-bottom: ${mobileSpacing.xxs};
`;

const SellerDescription = styled.div<{ $selected: boolean }>`
  font-size: ${mobileTypography.bodySmall.fontSize};
  color: ${props => props.$selected 
    ? 'rgba(255, 255, 255, 0.9)' 
    : mobileColors.neutral.gray600
  };
  line-height: 1.4;
`;

const FeaturesList = styled.ul<{ $selected: boolean }>`
  list-style: none;
  padding: 0;
  margin: ${mobileSpacing.sm} 0 0 0;
`;

const FeatureItem = styled.li<{ $selected: boolean }>`
  ${mobileMixins.flexCenter}
  justify-content: flex-start;
  gap: ${mobileSpacing.xs};
  padding: ${mobileSpacing.xxs} 0;
  
  font-size: ${mobileTypography.bodySmall.fontSize};
  color: ${props => props.$selected 
    ? 'rgba(255, 255, 255, 0.95)' 
    : mobileColors.neutral.gray700
  };
  
  &::before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: ${mobileBorderRadius.full};
    background: ${props => props.$selected 
      ? 'rgba(255, 255, 255, 0.3)' 
      : mobileColors.success.light
    };
    color: ${props => props.$selected ? '#FFFFFF' : mobileColors.success.main};
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
`;

const StickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${mobileSpacing.lg} ${mobileSpacing.md};
  background: ${mobileColors.surface.background};
  border-top: 1px solid ${mobileColors.surface.divider};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  ${mobileMixins.safeAreaPadding}
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

export const MobileSellerTypePage: React.FC = () => {
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const [selectedType, setSelectedType] = useState<SellerType | null>(null);
  const { t } = useLanguage();
  const { switchProfileType } = useProfileType();
  const navigate = useNavigate();
  
  const sellerOptions: SellerOption[] = [
    {
      type: 'private',
      icon: 'P',
      label: t('sell.sellerType.private.title'),
      description: t('sell.sellerType.private.description'),
      features: [
        t('sell.sellerType.private.features.0'),
        t('sell.sellerType.private.features.1'),
        t('sell.sellerType.private.features.2')
      ]
    },
    {
      type: 'dealer',
      icon: 'D',
      label: t('sell.sellerType.dealer.title'),
      description: t('sell.sellerType.dealer.description'),
      features: [
        t('sell.sellerType.dealer.features.0'),
        t('sell.sellerType.dealer.features.1'),
        t('sell.sellerType.dealer.features.2')
      ]
    },
    {
      type: 'company',
      icon: 'C',
      label: t('sell.sellerType.company.title'),
      description: t('sell.sellerType.company.description'),
      features: [
        t('sell.features.bulkUpload', 'Bulk upload'),
        t('sell.features.teamAccess', 'Team management'),
        t('sell.features.invoicing', 'Invoicing system')
      ]
    }
  ];
  
  const handleSellerSelect = (type: SellerType) => {
    setSelectedType(type);
  };
  
  const handleContinue = () => {
    if (!selectedType) return;
    
    setProfileType(selectedType);
    
    navigate(`/sell/inserat/${vehicleType}/fahrzeugdaten/antrieb-und-umwelt`);
  };
  
  return (
    <PageWrapper>
      <MobileHeader />
      
      <ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <HeaderSection>
              <PageTitle>
                {t('sell.sellerType.question', 'Who is selling?')}
              </PageTitle>
              <PageSubtitle>
                {t('sell.sellerType.subtitle', 'Select the type that best describes you')}
              </PageSubtitle>
            </HeaderSection>
            
            <MobileStack spacing="md">
              {sellerOptions.map((option, index) => (
                <SellerCard
                  key={option.type}
                  $selected={selectedType === option.type}
                  $recommended={index === 0}
                  onClick={() => handleSellerSelect(option.type)}
                >
                  {index === 0 && <RecommendedBadge>{t('sell.recommended', 'Recommended')}</RecommendedBadge>}
                  
                  <SellerCardHeader>
                    <SellerIcon $selected={selectedType === option.type}>
                      {option.icon}
                    </SellerIcon>
                    <SellerInfo>
                      <SellerLabel $selected={selectedType === option.type}>
                        {option.label}
                      </SellerLabel>
                      <SellerDescription $selected={selectedType === option.type}>
                        {option.description}
                      </SellerDescription>
                    </SellerInfo>
                  </SellerCardHeader>
                  
                  <FeaturesList $selected={selectedType === option.type}>
                    {option.features.map((feature, idx) => (
                      <FeatureItem 
                        key={idx} 
                        $selected={selectedType === option.type}
                      >
                        {feature}
                      </FeatureItem>
                    ))}
                  </FeaturesList>
                </SellerCard>
              ))}
            </MobileStack>
          </MobileStack>
        </MobileContainer>
      </ContentWrapper>
      
      <StickyFooter>
        <ContinueButton
          $enabled={!!selectedType}
          onClick={handleContinue}
          disabled={!selectedType}
        >
          {selectedType 
            ? t('sell.sellerType.continue')
            : t('sell.selectSellerType')
          }
        </ContinueButton>
      </StickyFooter>
    </PageWrapper>
  );
};

export default MobileSellerTypePage;
