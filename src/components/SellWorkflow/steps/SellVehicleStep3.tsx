// Sell Vehicle Step 3: Equipment
// الخطوة 3: المعدات

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';
import {
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun,
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car
} from 'lucide-react';

interface SellVehicleStep3Props {
  workflowData: Partial<UnifiedWorkflowData>;
  onUpdate: (updates: Partial<UnifiedWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
`;

const DescriptionText = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.5rem 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.75rem;
  grid-auto-rows: 1fr;
  align-items: stretch;
  margin-bottom: 1rem;
`;

const EquipmentButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  min-height: 92px;
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? '#10b981' : '#9CA3AF'};
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
    : 'var(--bg-card)'
  };
  color: ${props => props.$active ? '#10b981' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$active 
    ? '0 0 0 2px rgba(16, 185, 129, 0.32), 0 0 10px rgba(16, 185, 129, 0.18), inset 0 1px 3px rgba(16, 185, 129, 0.15)'
    : 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
  };
  position: relative;
  isolation: isolate;
  
  &:hover {
    border-color: #10b981;
    transform: translateY(-1px);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.38), 0 0 12px rgba(16, 185, 129, 0.22), inset 0 1px 3px rgba(16, 185, 129, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    transition: all 0.2s ease;
    color: ${props => props.$active ? '#10b981' : 'inherit'};
  }
  
  span {
    line-height: 1.2;
    text-align: center;
    color: ${props => props.$active ? '#10b981' : 'var(--text-primary)'};
  }
`;

// Neumorphism Switch Container (Smaller Size)
const SwitchContainer = styled.div<{ $isOn: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
  
  &:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%);
    border-color: rgba(16, 185, 129, 0.3);
  }
`;

const SwitchLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  
  svg {
    width: 16px;
    height: 16px;
    color: #10b981;
  }
`;

const SwitchOuter = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 60px;
  height: 30px;
  background: ${props => props.$isOn 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'var(--bg-secondary)'
  };
  border-radius: 15px;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SwitchInner = styled.div<{ $isOn: boolean }>`
  position: absolute;
  inset: 3px;
  background-color: ${props => props.$isOn ? '#d1fae5' : 'var(--bg-card)'};
  border-radius: 17px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SwitchKnobContainer = styled.div<{ $isOn: boolean }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 17px;
`;

const SwitchKnob = styled.div<{ $isOn: boolean }>`
  position: absolute;
  top: 2px;
  ${props => props.$isOn ? 'right: 2px' : 'left: 2px'};
  width: 26px;
  height: 26px;
  background: linear-gradient(145deg, #ffffff 0%, #f3f4f6 100%);
  border-radius: 50%;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwitchKnobNeon = styled.div<{ $isOn: boolean }>`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$isOn
    ? 'radial-gradient(circle, #10b981 0%, #059669 100%)'
    : 'radial-gradient(circle, #d1d5db 0%, #9ca3af 100%)'
  };
  box-shadow: ${props => props.$isOn
    ? '0 0 6px #10b981, 0 0 12px rgba(16, 185, 129, 0.3)'
    : '0 0 4px rgba(0, 0, 0, 0.2)'
  };
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StatusText = styled.div<{ $isOn: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$isOn ? '#10b981' : 'var(--text-tertiary)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
  white-space: nowrap;
`;

const EQUIPMENT_CATEGORIES = {
  safety: [
    { id: 'abs', icon: Zap, bgLabel: 'ABS', enLabel: 'ABS' },
    { id: 'esp', icon: Shield, bgLabel: 'ESP', enLabel: 'ESP' },
    { id: 'airbags', icon: Shield, bgLabel: 'Еърбегове', enLabel: 'Airbags' },
    { id: 'parkingSensors', icon: Eye, bgLabel: 'Парк сензори', enLabel: 'Parking Sensors' },
    { id: 'rearviewCamera', icon: Eye, bgLabel: 'Камера за заден ход', enLabel: 'Rearview Camera' },
    { id: 'blindSpotMonitor', icon: AlertTriangle, bgLabel: 'Монитор мъртва зона', enLabel: 'Blind Spot Monitor' },
    { id: 'laneDeparture', icon: AlertTriangle, bgLabel: 'Асистент лента', enLabel: 'Lane Departure' },
    { id: 'collisionWarning', icon: AlertTriangle, bgLabel: 'Предупреждение за сблъсък', enLabel: 'Collision Warning' }
  ],
  comfort: [
    { id: 'ac', icon: Snowflake, bgLabel: 'Климатик', enLabel: 'Air Conditioning' },
    { id: 'climate', icon: Wind, bgLabel: 'Климат контрол', enLabel: 'Climate Control' },
    { id: 'heatedSeats', icon: Armchair, bgLabel: 'Отопляеми седалки', enLabel: 'Heated Seats' },
    { id: 'ventilatedSeats', icon: Fan, bgLabel: 'Вентилирани седалки', enLabel: 'Ventilated Seats' },
    { id: 'sunroof', icon: Sun, bgLabel: 'Панорамен покрив', enLabel: 'Sunroof' },
    { id: 'rainSensor', icon: Droplets, bgLabel: 'Сензор за дъжд', enLabel: 'Rain Sensor' },
    { id: 'cruiseControl', icon: Wind, bgLabel: 'Круиз контрол', enLabel: 'Cruise Control' },
    { id: 'parkAssist', icon: Armchair, bgLabel: 'Авто паркиране', enLabel: 'Park Assist' }
  ],
  infotainment: [
    { id: 'bluetooth', icon: Bluetooth, bgLabel: 'Bluetooth', enLabel: 'Bluetooth' },
    { id: 'navigation', icon: Navigation, bgLabel: 'Навигация', enLabel: 'Navigation' },
    { id: 'carPlay', icon: Smartphone, bgLabel: 'Apple CarPlay', enLabel: 'Apple CarPlay' },
    { id: 'androidAuto', icon: Smartphone, bgLabel: 'Android Auto', enLabel: 'Android Auto' },
    { id: 'soundSystem', icon: Music, bgLabel: 'Аудио система', enLabel: 'Sound System' },
    { id: 'radio', icon: Radio, bgLabel: 'Радио', enLabel: 'Radio' },
    { id: 'wifi', icon: Wifi, bgLabel: 'Wi-Fi хотспот', enLabel: 'Wi-Fi Hotspot' },
    { id: 'usb', icon: Smartphone, bgLabel: 'USB портове', enLabel: 'USB Ports' }
  ],
  extras: [
    { id: 'ledLights', icon: Sparkles, bgLabel: 'LED фарове', enLabel: 'LED Lights' },
    { id: 'xenon', icon: Zap, bgLabel: 'Ксенон фарове', enLabel: 'Xenon Lights' },
    { id: 'daylight', icon: Moon, bgLabel: 'Дневни светлини', enLabel: 'Daytime Running Lights' },
    { id: 'alloyWheels', icon: Circle, bgLabel: 'Алуминиеви джанти', enLabel: 'Alloy Wheels' },
    { id: 'keyless', icon: KeyRound, bgLabel: 'Безключов достъп', enLabel: 'Keyless Entry' },
    { id: 'startStop', icon: Zap, bgLabel: 'Start/Stop система', enLabel: 'Start/Stop System' },
    { id: 'sportPackage', icon: Car, bgLabel: 'Спортен пакет', enLabel: 'Sport Package' },
    { id: 'towHitch', icon: Car, bgLabel: 'Теглич', enLabel: 'Tow Hitch' }
  ]
};

export const SellVehicleStep3: React.FC<SellVehicleStep3Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  const toggleEquipment = (category: 'safety' | 'comfort' | 'infotainment' | 'extras', itemId: string) => {
    const currentArray = workflowData[`${category}Equipment` as keyof UnifiedWorkflowData] as string[] || [];
    const isSelected = currentArray.includes(itemId);

    const newArray = isSelected
      ? currentArray.filter(id => id !== itemId)
      : [...currentArray, itemId];

    onUpdate({
      [`${category}Equipment`]: newArray
    } as Partial<SellWorkflowData>);
  };

  const isEquipmentSelected = (category: 'safety' | 'comfort' | 'infotainment' | 'extras', itemId: string) => {
    const array = workflowData[`${category}Equipment` as keyof UnifiedWorkflowData] as string[] || [];
    return array.includes(itemId);
  };

  // Check if all equipment is selected
  const getAllEquipmentIds = () => {
    const allIds: string[] = [];
    (Object.keys(EQUIPMENT_CATEGORIES) as Array<keyof typeof EQUIPMENT_CATEGORIES>).forEach(category => {
      EQUIPMENT_CATEGORIES[category].forEach(item => {
        allIds.push(item.id);
      });
    });
    return allIds;
  };

  const isAllEquipmentSelected = useMemo(() => {
    const allIds = getAllEquipmentIds();
    const selectedIds = [
      ...(workflowData.safetyEquipment || []),
      ...(workflowData.comfortEquipment || []),
      ...(workflowData.infotainmentEquipment || []),
      ...(workflowData.extrasEquipment || [])
    ];
    return allIds.every(id => selectedIds.includes(id));
  }, [workflowData.safetyEquipment, workflowData.comfortEquipment, workflowData.infotainmentEquipment, workflowData.extrasEquipment]);

  const toggleAllEquipment = () => {
    if (isAllEquipmentSelected) {
      // Deselect all
      onUpdate({
        safetyEquipment: [],
        comfortEquipment: [],
        infotainmentEquipment: [],
        extrasEquipment: []
      });
    } else {
      // Select all
      onUpdate({
        safetyEquipment: EQUIPMENT_CATEGORIES.safety.map((item: any) => item.id),
        comfortEquipment: EQUIPMENT_CATEGORIES.comfort.map((item: any) => item.id),
        infotainmentEquipment: EQUIPMENT_CATEGORIES.infotainment.map((item: any) => item.id),
        extrasEquipment: EQUIPMENT_CATEGORIES.extras.map((item: any) => item.id)
      });
    }
  };

  return (
    <FormContainer>
      <DescriptionText>
        {language === 'bg'
          ? 'Оборудването е опционално. Можете да го добавите по-късно.'
          : 'Equipment is optional. You can add it later.'}
      </DescriptionText>

      <SwitchContainer $isOn={isAllEquipmentSelected} onClick={toggleAllEquipment}>
        <SwitchLabel>
          <Sparkles />
          {language === 'bg' ? 'Пълна Опция' : 'Full Options'}
        </SwitchLabel>

        <SwitchOuter $isOn={isAllEquipmentSelected}>
          <SwitchInner $isOn={isAllEquipmentSelected}>
            <SwitchKnobContainer $isOn={isAllEquipmentSelected}>
              <SwitchKnob $isOn={isAllEquipmentSelected}>
                <SwitchKnobNeon $isOn={isAllEquipmentSelected} />
              </SwitchKnob>
            </SwitchKnobContainer>
          </SwitchInner>
        </SwitchOuter>

        <StatusText $isOn={isAllEquipmentSelected}>
          {isAllEquipmentSelected
            ? (language === 'bg' ? 'Активирано ✓' : 'Active ✓')
            : (language === 'bg' ? 'Неактивно' : 'Inactive')
          }
        </StatusText>
      </SwitchContainer>

      {(Object.keys(EQUIPMENT_CATEGORIES) as Array<keyof typeof EQUIPMENT_CATEGORIES>).map(category => (
        <div key={category}>
          <SectionTitle>
            {category === 'safety' && (language === 'bg' ? 'Безопасност' : 'Safety')}
            {category === 'comfort' && (language === 'bg' ? 'Комфорт' : 'Comfort')}
            {category === 'infotainment' && (language === 'bg' ? 'Инфоразвлечение' : 'Infotainment')}
            {category === 'extras' && (language === 'bg' ? 'Екстри' : 'Extras')}
          </SectionTitle>
          <EquipmentGrid>
            {EQUIPMENT_CATEGORIES[category].map((item: any) => {
              const IconComponent = item.icon;
              const isSelected = isEquipmentSelected(category, item.id);
              return (
                <EquipmentButton
                  key={item.id}
                  $active={isSelected}
                  onClick={() => toggleEquipment(category, item.id)}
                >
                  <IconComponent />
                  <span>{language === 'bg' ? item.bgLabel : item.enLabel}</span>
                </EquipmentButton>
              );
            })}
          </EquipmentGrid>
        </div>
      ))}
    </FormContainer>
  );
};

export default SellVehicleStep3;
