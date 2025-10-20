// Seller Type Page with Workflow - Auto Continue
// صفحة نوع البائع مع الأتمتة - انتقال تلقائي

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { Check } from 'lucide-react';
import PersonIcon from '../../components/icons/PersonIcon';
import DealerIcon from '../../components/icons/DealerIcon';
import CompanyIcon from '../../components/icons/CompanyIcon';
import SplitScreenLayout from '../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../components/WorkflowVisualization';
import { bulgarianAuthService } from '../../firebase';
import ProfileTypeConfirmModal from '../../components/Profile/ProfileTypeConfirmModal';  // ⚡ NEW
import type { ProfileType } from '../../contexts/ProfileTypeContext';  // ⚡ NEW

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

const SellerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SellerOption = styled.div<{ $isHovered: boolean }>`
  background: ${props => props.$isHovered 
    ? 'linear-gradient(135deg, #ff8f10, #005ca9)' 
    : 'rgba(255, 143, 16, 0.05)'
  };
  border: 2px solid ${props => props.$isHovered ? '#ff8f10' : 'rgba(255, 143, 16, 0.2)'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$isHovered ? 'white' : '#2c3e50'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.2);
  }
`;

const IconWrapper = styled.div<{ $isHovered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  margin: 0 auto 1rem;
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

const SellerTitle = styled.h3`
  font-size: 1.125rem; /* 18px */
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 0.5rem 0;
`;

const SellerDesc = styled.p`
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
  opacity: 0.85;
  margin: 0 0 1rem 0;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.3rem 0;
  font-size: 0.813rem; /* 13px */
  line-height: 1.5;
  opacity: 0.8;

  svg {
    width: 12px;
    height: 12px;
    margin-top: 0.15rem;
    flex-shrink: 0;
  }
`;

const SellerTypePageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [autoDetectedType, setAutoDetectedType] = useState<string | null>(null);
  
  // ⚡ NEW: Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);

  const vehicleType = searchParams.get('vt');

  const sellerTypes = [
    { id: 'private', IconComponent: PersonIcon },
    { id: 'dealer', IconComponent: DealerIcon },
    { id: 'company', IconComponent: CompanyIcon }
  ];

  // ⚡ NEW: Show confirmation modal first
  const handleSelect = useCallback((typeId: string) => {
    setSelectedType(typeId as ProfileType);
    setShowConfirmModal(true);
  }, []);

  // ⚡ NEW: Handle modal confirmation
  const handleConfirmSelection = useCallback(() => {
    if (!selectedType) return;
    
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    params.set('st', selectedType);
    
    setShowConfirmModal(false);
    
    // Navigate after confirmation
    navigate(`/sell/inserat/${vehicleType || 'car'}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
  }, [navigate, vehicleType, selectedType]);

  // ⚡ NEW: Handle modal cancellation
  const handleCancelSelection = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedType(null);
  }, []);

  // Auto-detect seller type from user profile
  useEffect(() => {
    const detectSellerType = async () => {
      try {
        const user = await bulgarianAuthService.getCurrentUserProfile();
        if (user) {
          const accountType = (user as any).accountType;
          if (accountType === 'business') {
            const businessType = (user as any).businessType;
            // Map business type to seller type
            const sellerTypeMap: Record<string, string> = {
              'dealership': 'dealer',
              'trader': 'dealer',
              'company': 'company'
            };
            const detectedType = sellerTypeMap[businessType] || 'dealer';
            setAutoDetectedType(detectedType);
            
            // Auto-select and navigate after 1.5 seconds
            setTimeout(() => {
              handleSelect(detectedType);
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error detecting seller type:', error);
      }
    };

    detectSellerType();
  }, [handleSelect]);

  const leftContent = (
    <ContentSection>
      <HeaderCard>
        <Title>{t('sell.sellerType.title')}</Title>
        <Subtitle>{t('sell.sellerType.subtitle')}</Subtitle>
        
        {/* Auto-Detection Notice */}
        {autoDetectedType && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
            border: '2px solid #3b82f6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#1e40af',
            fontSize: '0.85rem',
            fontWeight: '600',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <DealerIcon size={20} color="#1e40af" />
            <span>
              {language === 'bg'
                ? `✓ Бизнес акаунт открит! Автоматично избиране на "${autoDetectedType}"...`
                : `✓ Business account detected! Auto-selecting "${autoDetectedType}"...`}
            </span>
          </div>
        )}
      </HeaderCard>

      <SellerGrid>
        {sellerTypes.map((seller) => {
          const IconComponent = seller.IconComponent;
          const isHovered = hoveredType === seller.id;
          
          return (
            <SellerOption
              key={seller.id}
              $isHovered={isHovered}
              onClick={() => handleSelect(seller.id)}
              onMouseEnter={() => setHoveredType(seller.id)}
              onMouseLeave={() => setHoveredType(null)}
            >
              <IconWrapper $isHovered={isHovered}>
                <IconComponent />
              </IconWrapper>
              
              <SellerTitle>{t(`sell.sellerType.${seller.id}.title`)}</SellerTitle>
              <SellerDesc>{t(`sell.sellerType.${seller.id}.description`)}</SellerDesc>
              
              <FeaturesList>
                {[0, 1, 2, 3].map((index) => (
                  <FeatureItem key={index}>
                    <Check size={12} />
                    <span>{t(`sell.sellerType.${seller.id}.features.${index}`)}</span>
                  </FeatureItem>
                ))}
              </FeaturesList>
            </SellerOption>
          );
        })}
      </SellerGrid>
    </ContentSection>
  );

  const rightContent = (
    <WorkflowFlow
      currentStepIndex={1}
      totalSteps={8}
      carBrand={searchParams.get('mk') || undefined}
      language={language}
    />
  );

  return (
    <>
      <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />
      
      {/* ⚡ NEW: Profile Type Confirmation Modal */}
      {selectedType && (
        <ProfileTypeConfirmModal
          isOpen={showConfirmModal}
          profileType={selectedType}
          onConfirm={handleConfirmSelection}
          onCancel={handleCancelSelection}
        />
      )}
    </>
  );
};

export default SellerTypePageNew;

