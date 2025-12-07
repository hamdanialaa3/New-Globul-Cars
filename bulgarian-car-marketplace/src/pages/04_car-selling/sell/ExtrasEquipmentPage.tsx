import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const ExtrasEquipmentContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-color, ${props => props.theme?.colors?.background?.default || '#f5f7fa'});
  padding: 2rem 0;
  
  /* CSS Custom Properties ?????? ?????? ?? ??????? */
  --primary-color: ${props => props.theme?.colors?.primary?.main || '#007BFF'};
  --secondary-color: ${props => props.theme?.colors?.secondary?.main || '#6C757D'};
  --bg-color: ${props => props.theme?.colors?.background?.default || '#f5f7fa'};
  --card-bg-color: ${props => props.theme?.colors?.background?.paper || '#FFFFFF'};
  --text-primary: ${props => props.theme?.colors?.text?.primary || '#212529'};
  --text-secondary: ${props => props.theme?.colors?.text?.secondary || '#6C757D'};
  --border-color: ${props => props.theme?.colors?.grey?.[200] || '#DEE2E6'};
  --hover-color: ${props => props.theme?.colors?.grey?.[100] || '#E9ECEF'};
  --shadow: ${props => props.theme?.shadows?.lg || '0 20px 40px rgba(0, 0, 0, 0.1)'};
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: var(--card-bg-color);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const EquipmentCard = styled.div`
  background: var(--card-bg-color);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 3rem;
  margin-bottom: 2rem;
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  justify-items: stretch;
  width: 100%;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: var(--card-bg-color);
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  color: var(--text-primary);

  &:hover {
    background-color: var(--hover-color);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  }

  &:has(input:checked) {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const Checkbox = styled.input`
  margin-right: 0.8rem;
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
`;

const CheckboxText = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
  text-align: left;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
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
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          box-shadow: 0 10px 20px rgba(0, 123, 255, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(0, 123, 255, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: var(--card-bg-color);
          color: var(--text-secondary);
          border: 2px solid var(--border-color);
          
          &:hover {
            background: var(--hover-color);
            color: var(--text-primary);
          }
        `;
      default:
        return `
          background: var(--secondary-color);
          color: white;
          
          &:hover {
            opacity: 0.8;
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
  background: var(--hover-color);
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid var(--primary-color);
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

const ExtrasEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Customizable color scheme - ????? ????? ??? ??????? ??? ??????
  const colorScheme = {
    primary: '#28a745',        // اللون الأساسي - تم تغييره إلى أخضر
    secondary: '#dc3545',      // اللون الثانوي - تم تغييره إلى أحمر
    success: '#28A745',        // لون النجاح
    danger: '#DC3545',         // لون الخطر
    warning: '#FFC107',        // لون التحذير
    info: '#17A2B8',          // لون المعلومات
    background: '#f8f9fa',     // لون الخلفية
    cardBackground: '#FFFFFF', // لون خلفية البطاقات
    textPrimary: '#212529',    // لون النص الأساسي
    textSecondary: '#6C757D',  // لون النص الثانوي
    border: '#DEE2E6',         // لون الحدود
    hover: '#E9ECEF'          // لون التمرير
  };

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
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');

  const extrasEquipment = [
    'Аларма',
    'Амбиентно осветление',
    'Android Auto',
    'Apple CarPlay',
    'Подлакътник',
    'Автоматично затъмняващи огледала',
    'Допълнително отопление',
    'Bluetooth',
    'Преграда за товари',
    'CD плейър',
    'DAB радио',
    'Дигитален кокпит',
    'Достъп за инвалиди',
    'Електрически задни седалки',
    'Електрически седалки',
    'Електрически седалки с памет',
    'Електрически прозорци',
    'Система за извънредни повиквания',
    'Предупреждение за умора',
    'Сгъваеми задни седалки',
    'Сгъваеми огледала',
    'Hands-free система',
    'Head-up дисплей',
    'Подгрявани задни седалки',
    'Подгрявани седалки',
    'Подгряван волан',
    'Безжично зареждане',
    'Вградено стрийминг на музика',
    'ISOFIX',
    'Кожен волан',
    'Лумбална поддръжка',
    'Масажни седалки',
    'Многофункционален волан',
    'Навигация',
    'Бордови компютър',
    'Лостчета за скорости',
    'ISOFIX за пътник',
    'Вентилация на седалките',
    'Десен волан',
    'Ски чанта',
    'Пакет за пушачи',
    'Аудио система',
    'Спортни седалки',
    'Тъчскрийн',
    'Радио тунер',
    'ТВ',
    'USB порт',
    'Виртуални огледала',
    'Гласово управление',
    'Зимен пакет',
    'WLAN/WiFi хотспот'
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
    if (comfort) params.set('comfort', comfort);
    if (infotainment) params.set('infotainment', infotainment);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/ausstattung/infotainment?${params.toString()}`);
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
    if (comfort) params.set('comfort', comfort);
    if (infotainment) params.set('infotainment', infotainment);
    if (selectedEquipment.length > 0) {
      params.set('extras', selectedEquipment.join(','));
    }

    // ✅ NEW ROUTE: Navigate to images page
    navigate(`/sell/inserat/${vehicleType || 'car'}/images?${params.toString()}`);
  };

  return (
    <ExtrasEquipmentContainer 
      style={{
        '--primary-color': colorScheme.primary, 
        '--secondary-color': colorScheme.secondary, 
        '--bg-color': colorScheme.background,
        '--card-bg-color': colorScheme.cardBackground,
        '--text-primary': colorScheme.textPrimary,
        '--text-secondary': colorScheme.textSecondary,
        '--border-color': colorScheme.border,
        '--hover-color': colorScheme.hover
      } as React.CSSProperties}
    >
      <ContentWrapper>
        <HeaderCard>
          <Title>Екстри</Title>
          <Subtitle>
            Изберете всички допълнителни функции, които има вашето превозно средство
          </Subtitle>
        </HeaderCard>

        <EquipmentCard>
          <EquipmentGrid>
            {extrasEquipment.map((equipment) => (
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
          <InfoTitle>⭐ За екстрите</InfoTitle>
          <InfoText>
            Екстрите са допълнителни функции, които правят превозното средство 
            по-специално и привлекателно. Изберете всички функции, които са 
            инсталирани във вашето превозно средство.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ExtrasEquipmentContainer>
  );
};

export default ExtrasEquipmentPage;