import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const ComfortEquipmentContainer = styled.div`
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

const EquipmentCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #f8f9fa;

  &:hover {
    background-color: #e9ecef;
    border-color: #dee2e6;
  }

  &:has(input:checked) {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: transparent;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.8rem;
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

const CheckboxText = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
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

const ComfortEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Extract parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');
  const safety = searchParams.get('safety');

  const comfortEquipment = [
    'Климатик',
    'Автоматичен климатик',
    'Двузонен климатик',
    'Тризонен климатик',
    'Четиризонен климатик',
    'Климатик с филтър за прах',
    'Климатик с йонизатор',
    'Ел. стъкла',
    'Ел. огледала',
    'Ел. седалки',
    'Подгрев на седалките',
    'Вентилация на седалките',
    'Масаж на седалките',
    'Памят за настройки на седалките',
    'Подгрев на волана',
    'Подгрев на задните стъкла',
    'Подгрев на предните стъкла',
    'Централно заключване',
    'Дистанционно заключване',
    'Безключов достъп',
    'Старт-стоп система',
    'Круиз контрол',
    'Адаптивен круиз контрол',
    'Система за поддържане на лентата',
    'Система за помощ при изкачване',
    'Система за спускане по хълмове',
    'Система за предупреждение за заспиване',
    'Система за предупреждение за излизане от лентата',
    'Система за предупреждение за сляпа зона',
    'Система за помощ при паркиране',
    'Камера за заден ход',
    'Парктроник',
    'Система за нощно виждане',
    'Система за разпознаване на знаци',
    'Система за предупреждение за пешеходци',
    'Система за разпознаване на глас',
    'Система за разпознаване на жестове',
    'Виртуален асистент',
    'Интернет в колата',
    'WiFi хотспот',
    'Безжично зареждане',
    'USB портове',
    '12V контакти',
    '220V контакт',
    'Инвертор'
  ];

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(item => item !== equipment)
        : [...prev, equipment]
    );
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
    if (safety) params.set('safety', safety);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/ausstattung/sicherheit?${params.toString()}`);
  };

  const handleContinue = () => {
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
    if (safety) params.set('safety', safety);
    if (selectedEquipment.length > 0) {
      params.set('comfort', selectedEquipment.join(','));
    }

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/ausstattung/infotainment?${params.toString()}`);
  };

  return (
    <ComfortEquipmentContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Оборудване за комфорт</Title>
          <Subtitle>
            Изберете всички системи за комфорт, които има вашето превозно средство
          </Subtitle>
        </HeaderCard>

        <EquipmentCard>
          <EquipmentGrid>
            {comfortEquipment.map((equipment) => (
              <CheckboxItem key={equipment}>
                <Checkbox
                  type="checkbox"
                  checked={selectedEquipment.includes(equipment)}
                  onChange={() => handleEquipmentToggle(equipment)}
                />
                <CheckboxText>{equipment}</CheckboxText>
              </CheckboxItem>
            ))}
          </EquipmentGrid>
        </EquipmentCard>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button variant="primary" onClick={handleContinue}>
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>😌 За оборудването за комфорт</InfoTitle>
          <InfoText>
            Оборудването за комфорт прави пътуването по-приятно и удобно. 
            Изберете всички системи, които са инсталирани във вашето превозно средство.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ComfortEquipmentContainer>
  );
};

export default ComfortEquipmentPage;
