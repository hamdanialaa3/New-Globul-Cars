import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const EquipmentContainer = styled.div`
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

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const EquipmentCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }
`;

const EquipmentIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
`;

const EquipmentTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const EquipmentDescription = styled.p`
  font-size: 1rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const EquipmentFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: #6c757d;

  &::before {
    content: '•';
    margin-right: 0.5rem;
    color: #667eea;
    font-weight: bold;
  }
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

const EquipmentMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');

  const equipmentCategories = [
    {
      id: 'sicherheit',
      title: 'Безопасност',
      titleEn: 'Safety',
      icon: '🛡️',
      description: 'Системи за безопасност и защита',
      descriptionEn: 'Safety and protection systems',
      features: [
        'ABS, ESP, Airbag',
        'Системи за предупреждение',
        'Камери и сензори',
        'Системи за спиране'
      ]
    },
    {
      id: 'komfort',
      title: 'Комфорт',
      titleEn: 'Comfort',
      icon: '😌',
      description: 'Максимален комфорт за пътуване',
      descriptionEn: 'Maximum travel comfort',
      features: [
        'Климатик и отопление',
        'Ел. стъкла и огледала',
        'Подгрев на седалките',
        'Круиз контрол'
      ]
    },
    {
      id: 'infotainment',
      title: 'Инфотейнмънт',
      titleEn: 'Infotainment',
      icon: '🎵',
      description: 'Технологии за забавление',
      descriptionEn: 'Entertainment technologies',
      features: [
        'Навигация и GPS',
        'Bluetooth и USB',
        'Apple CarPlay',
        'Аудио системи'
      ]
    },
    {
      id: 'extras',
      title: 'Екстри',
      titleEn: 'Extras',
      icon: '⭐',
      description: 'Допълнителни функции',
      descriptionEn: 'Additional features',
      features: [
        'Спортни пакети',
        'Специални колела',
        'Допълнително оборудване',
        'Аксесоари'
      ]
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/ausstattung/${categoryId}?${params.toString()}`);
  };

  const handleBack = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
  };

  const handleSkip = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/details/bilder?${params.toString()}`);
  };

  return (
    <EquipmentContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Оборудване</Title>
          <Subtitle>
            Изберете категорията оборудване, която искате да добавите
          </Subtitle>
        </HeaderCard>

        <EquipmentGrid>
          {equipmentCategories.map((category) => (
            <EquipmentCard
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              <EquipmentIcon>{category.icon}</EquipmentIcon>
              <EquipmentTitle>{category.title}</EquipmentTitle>
              <EquipmentDescription>{category.description}</EquipmentDescription>
              <EquipmentFeatures>
                {category.features.map((feature, index) => (
                  <FeatureItem key={index}>{feature}</FeatureItem>
                ))}
              </EquipmentFeatures>
            </EquipmentCard>
          ))}
        </EquipmentGrid>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button variant="secondary" onClick={handleSkip}>
            Пропусни
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>ℹ️ За оборудването</InfoTitle>
          <InfoText>
            Оборудването на превозното средство е важно за привличане на купувачи. 
            Можете да добавите оборудване от различни категории или да пропуснете 
            тази стъпка, ако не искате да добавяте допълнителна информация.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </EquipmentContainer>
  );
};

export default EquipmentMainPage;
