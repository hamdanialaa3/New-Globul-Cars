import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';

interface EquipmentStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const EquipmentSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
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

const InfoCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
`;

const InfoText = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const EquipmentStep: React.FC<EquipmentStepProps> = ({ data, onDataChange }) => {
  const [equipment, setEquipment] = useState({
    safety: data.safetyEquipment || [],
    comfort: data.comfortEquipment || [],
    infotainment: data.infotainmentEquipment || [],
    exterior: data.exteriorEquipment || [],
    interior: data.interiorEquipment || [],
    extras: data.extras || []
  });

  const safetyEquipment = [
    'ABS (Антиблокираща система)',
    'ESP (Електронна система за стабилност)',
    'Airbag (Въздушни възглавници)',
    'Предишни възглавници',
    'Задни възглавници',
    'Странични възглавници',
    'Завеси за глава',
    'Детски ключалки',
    'ISOFIX',
    'Система за предупреждение за излизане от лентата',
    'Система за предупреждение за заспиване',
    'Адаптивен круиз контрол',
    'Система за спиране в случай на авария',
    'Система за предупреждение за сляпа зона',
    'Система за помощ при паркиране',
    'Камера за заден ход',
    'Парктроник',
    'Система за нощно виждане',
    'Система за разпознаване на знаци',
    'Система за предупреждение за пешеходци'
  ];

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
    'Система за предупреждение за излизане от лентата'
  ];

  const infotainmentEquipment = [
    'Радио',
    'CD Player',
    'USB порт',
    'AUX порт',
    'Bluetooth',
    'WiFi',
    'Навигационна система',
    'GPS',
    'Гласова навигация',
    'Гласово управление',
    'Сензорен екран',
    'Apple CarPlay',
    'Android Auto',
    'MirrorLink',
    'HDMI порт',
    'SD карта',
    'Интернет в колата',
    'Система за разпознаване на глас',
    'Система за разпознаване на жестове',
    'Виртуален асистент'
  ];

  const exteriorEquipment = [
    'Ксенонови фарове',
    'LED фарове',
    'LED дневни светлини',
    'LED задни светлини',
    'LED индикатори',
    'Адаптивни фарове',
    'Автоматични фарове',
    'Система за измиване на фаровете',
    'Система за измиване на задните стъкла',
    'Дъждовни сенници',
    'Слънчев покрив',
    'Панорамен покрив',
    'Отварящ се покрив',
    'Спортни колела',
    'Легирани джанти',
    'Хромени елементи',
    'Спортни спойлери',
    'Спортни странични спойлери',
    'Спортни задни спойлери',
    'Спортни дифузори',
    'Спортни изпускателни тръби',
    'Спортни спирачки',
    'Спортна окачване',
    'Спортни амортисьори',
    'Спортни пружини',
    'Спортни стабилизатори',
    'Спортни дискове',
    'Спортни накладки',
    'Спортни калипери',
    'Спортни гуми'
  ];

  const interiorEquipment = [
    'Кожен салон',
    'Алкантара',
    'Текстилен салон',
    'Кожен волан',
    'Алкантара волан',
    'Спортни седалки',
    'Спортни седалки с бокови подпори',
    'Спортни седалки с регулируема лента',
    'Спортни седалки с подгрев',
    'Спортни седалки с вентилация',
    'Спортни седалки с масаж',
    'Спортни седалки с памет',
    'Спортни седалки с електрическо регулиране',
    'Спортни седалки с ръчно регулиране',
    'Спортни седалки с лъвче регулиране',
    'Спортни седалки с електрическо лъвче регулиране',
    'Спортни седалки с ръчно лъвче регулиране',
    'Спортни седалки с електрическо регулиране на височината',
    'Спортни седалки с ръчно регулиране на височината',
    'Спортни седалки с електрическо регулиране на наклона',
    'Спортни седалки с ръчно регулиране на наклона',
    'Спортни седалки с електрическо регулиране на дълбочината',
    'Спортни седалки с ръчно регулиране на дълбочината',
    'Спортни седалки с електрическо регулиране на боковите подпори',
    'Спортни седалки с ръчно регулиране на боковите подпори',
    'Спортни седалки с електрическо регулиране на лентата',
    'Спортни седалки с ръчно регулиране на лентата',
    'Спортни седалки с електрическо регулиране на височината на лентата',
    'Спортни седалки с ръчно регулиране на височината на лентата',
    'Спортни седалки с електрическо регулиране на наклона на лентата'
  ];

  const extras = [
    'Аларма',
    'Имобилайзер',
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

  const handleEquipmentToggle = (category: keyof typeof equipment, item: string) => {
    const currentItems = equipment[category];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    const newEquipment = { ...equipment, [category]: newItems };
    setEquipment(newEquipment);
    onDataChange(newEquipment);
  };

  return (
    <StepContainer>
      <EquipmentGrid>
        <EquipmentSection>
          <SectionTitle>🛡️ Безопасност</SectionTitle>
          <CheckboxGroup>
            {safetyEquipment.map((item) => (
              <CheckboxItem key={item}>
                <Checkbox
                  type="checkbox"
                  checked={equipment.safety.includes(item)}
                  onChange={() => handleEquipmentToggle('safety', item)}
                />
                <CheckboxText>{item}</CheckboxText>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </EquipmentSection>

        <EquipmentSection>
          <SectionTitle>😌 Комфорт</SectionTitle>
          <CheckboxGroup>
            {comfortEquipment.map((item) => (
              <CheckboxItem key={item}>
                <Checkbox
                  type="checkbox"
                  checked={equipment.comfort.includes(item)}
                  onChange={() => handleEquipmentToggle('comfort', item)}
                />
                <CheckboxText>{item}</CheckboxText>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </EquipmentSection>

        <EquipmentSection>
          <SectionTitle>🎵 Инфотейнмънт</SectionTitle>
          <CheckboxGroup>
            {infotainmentEquipment.map((item) => (
              <CheckboxItem key={item}>
                <Checkbox
                  type="checkbox"
                  checked={equipment.infotainment.includes(item)}
                  onChange={() => handleEquipmentToggle('infotainment', item)}
                />
                <CheckboxText>{item}</CheckboxText>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </EquipmentSection>

        <EquipmentSection>
          <SectionTitle>🚗 Външен вид</SectionTitle>
          <CheckboxGroup>
            {exteriorEquipment.map((item) => (
              <CheckboxItem key={item}>
                <Checkbox
                  type="checkbox"
                  checked={equipment.exterior.includes(item)}
                  onChange={() => handleEquipmentToggle('exterior', item)}
                />
                <CheckboxText>{item}</CheckboxText>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </EquipmentSection>

        <EquipmentSection>
          <SectionTitle>🪑 Интериор</SectionTitle>
          <CheckboxGroup>
            {interiorEquipment.map((item) => (
              <CheckboxItem key={item}>
                <Checkbox
                  type="checkbox"
                  checked={equipment.interior.includes(item)}
                  onChange={() => handleEquipmentToggle('interior', item)}
                />
                <CheckboxText>{item}</CheckboxText>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </EquipmentSection>

        <EquipmentSection>
          <SectionTitle>⭐ Екстри</SectionTitle>
          <CheckboxGroup>
            {extras.map((item) => (
              <CheckboxItem key={item}>
                <Checkbox
                  type="checkbox"
                  checked={equipment.extras.includes(item)}
                  onChange={() => handleEquipmentToggle('extras', item)}
                />
                <CheckboxText>{item}</CheckboxText>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </EquipmentSection>
      </EquipmentGrid>

      <InfoCard>
        <InfoTitle>💡 Съвет за оборудването</InfoTitle>
        <InfoText>
          Изберете всички функции и оборудване, които има вашето превозно средство. 
          Това ще помогне на купувачите да намерят точно това, което търсят, 
          и ще увеличи шансовете за успешна продажба.
        </InfoText>
      </InfoCard>
    </StepContainer>
  );
};

export default EquipmentStep;
