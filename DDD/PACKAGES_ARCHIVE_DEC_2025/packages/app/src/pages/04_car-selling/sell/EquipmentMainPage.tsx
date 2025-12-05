import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const EquipmentContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
  border: 1px solid var(--border);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const EquipmentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
`;

const EquipmentCard = styled.div<{ $isSelected: boolean }>`
  background: var(--bg-card);
  border: 2px solid ${props => props.$isSelected ? 'var(--success)' : 'var(--border)'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;

  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-accent);
  }
`;

const EquipmentLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const EquipmentIcon = styled.div`
  font-size: 2rem;
`;

const EquipmentContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const EquipmentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const EquipmentDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
`;

const EquipmentIndicator = styled.div<{ $isSelected: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$isSelected ? 'var(--success)' : 'var(--error)'};
  border: 2px solid var(--bg-card);
  box-shadow: var(--shadow-sm);
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: var(--accent-primary);
          color: var(--text-on-accent);
          box-shadow: var(--shadow-md);
          
          &:hover {
            background: var(--accent-secondary);
          }
        `;
      case 'secondary':
        return `
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 2px solid var(--border);
          
          &:hover {
            background: var(--bg-accent);
          }
        `;
      default:
        return `
          background: var(--bg-secondary);
          color: var(--text-primary);
          
          &:hover {
            background: var(--bg-accent);
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
  background: var(--bg-accent);
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid var(--accent-primary);
`;

const InfoTitle = styled.h4`
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const InfoText = styled.p`
  color: var(--text-secondary);
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

  // Check if categories have selections
  const safety = searchParams.get('safety');
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');
  const extras = searchParams.get('extras');

  const isCategorySelected = (categoryId: string): boolean => {
    switch (categoryId) {
      case 'sicherheit':
        return !!(safety && safety.trim() !== '');
      case 'komfort':
        return !!(comfort && comfort.trim() !== '');
      case 'infotainment':
        return !!(infotainment && infotainment.trim() !== '');
      case 'extras':
        return !!(extras && extras.trim() !== '');
      default:
        return false;
    }
  };

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
              $isSelected={isCategorySelected(category.id)}
            >
              <EquipmentLeft>
                <EquipmentIcon>{category.icon}</EquipmentIcon>
                <EquipmentContent>
                  <EquipmentTitle>{category.title}</EquipmentTitle>
                  <EquipmentDescription>{category.description}</EquipmentDescription>
                </EquipmentContent>
              </EquipmentLeft>
              <EquipmentIndicator $isSelected={isCategorySelected(category.id)} />
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
