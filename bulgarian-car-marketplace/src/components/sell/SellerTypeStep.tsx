import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';

interface SellerTypeStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SellerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const SellerCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#2c3e50'};
  border: 2px solid ${props => props.isSelected ? 'transparent' : '#e9ecef'};
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.isSelected ? 'transparent' : '#667eea'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    transition: all 0.3s ease;
  }

  &:hover::before {
    background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.05)'};
  }
`;

const SellerIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const SellerTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  position: relative;
  z-index: 1;
`;

const SellerDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const SellerFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  position: relative;
  z-index: 1;
`;

const FeatureItem = styled.li`
  padding: 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.8;

  &::before {
    content: '✓';
    margin-right: 0.5rem;
    font-weight: bold;
  }
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  z-index: 2;
`;

const InfoSection = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;

const SellerTypeStep: React.FC<SellerTypeStepProps> = ({ data, onDataChange }) => {
  const [selectedType, setSelectedType] = useState<string>(data.sellerType || '');

  const sellerTypes = [
    {
      id: 'private',
      title: 'Частно лице',
      titleEn: 'Private Person',
      icon: '👤',
      description: 'Продавам собствената си кола',
      descriptionEn: 'Selling my own car',
      features: [
        'Без данъчни задължения',
        'По-ниски такси',
        'Директна комуникация',
        'Гъвкави условия'
      ]
    },
    {
      id: 'dealer',
      title: 'Търговец',
      titleEn: 'Dealer',
      icon: '🏢',
      description: 'Търговец на превозни средства',
      descriptionEn: 'Vehicle dealer',
      features: [
        'Професионално обслужване',
        'Гаранция за качество',
        'Финансиране',
        'Търговска регистрация'
      ]
    },
    {
      id: 'company',
      title: 'Фирма',
      titleEn: 'Company',
      icon: '🏭',
      description: 'Фирма продава служебни коли',
      descriptionEn: 'Company selling fleet vehicles',
      features: [
        'Голям брой превозни средства',
        'Професионално обслужване',
        'Търговска регистрация',
        'Специални условия'
      ]
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    onDataChange({ sellerType: typeId });
  };

  return (
    <StepContainer>
      <SellerGrid>
        {sellerTypes.map((seller) => (
          <SellerCard
            key={seller.id}
            isSelected={selectedType === seller.id}
            onClick={() => handleTypeSelect(seller.id)}
          >
            {selectedType === seller.id && (
              <SelectedIndicator>✓</SelectedIndicator>
            )}
            <SellerIcon>{seller.icon}</SellerIcon>
            <SellerTitle>{seller.title}</SellerTitle>
            <SellerDescription>{seller.description}</SellerDescription>
            <SellerFeatures>
              {seller.features.map((feature, index) => (
                <FeatureItem key={index}>{feature}</FeatureItem>
              ))}
            </SellerFeatures>
          </SellerCard>
        ))}
      </SellerGrid>

      <InfoSection>
        <InfoTitle>ℹ️ Защо е важно да изберете правилния тип продавач?</InfoTitle>
        <InfoText>
          Типът продавач определя какви документи ще бъдат необходими, какви такси 
          ще се прилагат и какви права и задължения ще имате като продавач. 
          Това също така помага на купувачите да разберат с кого работят.
        </InfoText>
      </InfoSection>
    </StepContainer>
  );
};

export default SellerTypeStep;
