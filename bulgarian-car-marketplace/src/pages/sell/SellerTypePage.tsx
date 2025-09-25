import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const SellerTypeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const SellerTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const SellerTypeCard = styled.div<{ isSelected: boolean }>`
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
`;

const SellerIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const SellerTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
`;

const SellerDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  opacity: 0.9;
`;

const SellerFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
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
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
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

const SellerTypePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
          <Title>Тип продавач</Title>
          <Subtitle>
            Определете типа на продавача за да персонализираме процеса
          </Subtitle>
        </HeaderCard>

        <SellerTypeGrid>
          {sellerTypes.map((seller) => (
            <SellerTypeCard
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
            </SellerTypeCard>
          ))}
        </SellerTypeGrid>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedType}
          >
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>ℹ️ Защо е важно да изберете правилния тип продавач؟</InfoTitle>
          <InfoText>
            Типът продавач определя какви документи ще бъдат необходими, какви такси 
            ще се прилагат и какви права и задължения ще имате като продавач. 
            Това също така помага на купувачите да разберат с кого работят.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </SellerTypeContainer>
  );
};

export default SellerTypePage;
