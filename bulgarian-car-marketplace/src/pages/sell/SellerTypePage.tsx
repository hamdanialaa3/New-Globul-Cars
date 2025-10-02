import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Building2, Factory, Check } from 'lucide-react';

const SellerTypeContainer = styled.div`
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

const SellerTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SellerTypeCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #ff8f10, #005ca9)' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#2c3e50'};
  border: 2px solid ${props => props.isSelected ? 'transparent' : '#e9ecef'};
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
    border-color: ${props => props.isSelected ? 'transparent' : '#ff8f10'};
  }
`;

const SellerIcon = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: ${props => props.$isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 143, 16, 0.1)'};
  transition: all 0.3s ease;

  svg {
    width: 32px;
    height: 32px;
    color: ${props => props.$isSelected ? 'white' : '#ff8f10'};
  }
`;

const SellerTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`;

const SellerDescription = styled.p`
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  opacity: 0.85;
`;

const SellerFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  padding: 0.4rem 0;
  font-size: 0.8rem;
  opacity: 0.8;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  svg {
    width: 14px;
    height: 14px;
    margin-top: 0.15rem;
    flex-shrink: 0;
  }
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

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #ff8f10, #005ca9);
          color: white;
          box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          
          &:hover {
            background: #5a6268;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
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

const SellerTypePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>('');

  // Extract parameters from URL
  const vehicleType = searchParams.get('vt');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');

  const sellerTypes = [
    {
      id: 'private',
      IconComponent: User
    },
    {
      id: 'dealer',
      IconComponent: Building2
    },
    {
      id: 'company',
      IconComponent: Factory
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleBack = () => {
    navigate('/sell/auto');
  };

  const handleContinue = () => {
    if (!selectedType) return;

    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);
    params.set('st', selectedType); // seller type

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
  };

  return (
    <SellerTypeContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>{t('sell.sellerType.title')}</Title>
          <Subtitle>{t('sell.sellerType.subtitle')}</Subtitle>
        </HeaderCard>

        <SellerTypeGrid>
          {sellerTypes.map((seller) => {
            const IconComponent = seller.IconComponent;
            const isSelected = selectedType === seller.id;
            
            return (
              <SellerTypeCard
                key={seller.id}
                isSelected={isSelected}
                onClick={() => handleTypeSelect(seller.id)}
              >
                {isSelected && (
                  <SelectedIndicator>✓</SelectedIndicator>
                )}
                
                <SellerIcon $isSelected={isSelected}>
                  <IconComponent />
                </SellerIcon>
                
                <SellerTitle>{t(`sell.sellerType.${seller.id}.title`)}</SellerTitle>
                <SellerDescription>{t(`sell.sellerType.${seller.id}.description`)}</SellerDescription>
                
                <SellerFeatures>
                  {[0, 1, 2, 3].map((index) => (
                    <FeatureItem key={index}>
                      <Check size={14} />
                      <span>{t(`sell.sellerType.${seller.id}.features.${index}`)}</span>
                    </FeatureItem>
                  ))}
                </SellerFeatures>
              </SellerTypeCard>
            );
          })}
        </SellerTypeGrid>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← {t('sell.sellerType.back')}
          </Button>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedType}
          >
            {t('sell.sellerType.continue')} →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>{t('sell.sellerType.infoTitle')}</InfoTitle>
          <InfoText>{t('sell.sellerType.infoText')}</InfoText>
        </InfoCard>
      </ContentWrapper>
    </SellerTypeContainer>
  );
};

export default SellerTypePage;
