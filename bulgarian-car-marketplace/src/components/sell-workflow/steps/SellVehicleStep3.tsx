// Sell Vehicle Step 3: Equipment
// الخطوة 3: المعدات

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';
import { 
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun, 
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car 
} from 'lucide-react';

interface SellVehicleStep3Props {
  workflowData: SellWorkflowData;
  onUpdate: (updates: Partial<SellWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.5rem 0;
`;

const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const EquipmentButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'var(--border)'};
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)'};
  color: ${props => props.$active ? 'var(--accent-primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
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
    const currentArray = workflowData[`${category}Equipment` as keyof SellWorkflowData] as string[] || [];
    const isSelected = currentArray.includes(itemId);
    
    const newArray = isSelected
      ? currentArray.filter(id => id !== itemId)
      : [...currentArray, itemId];
    
    onUpdate({
      [`${category}Equipment`]: newArray
    } as Partial<SellWorkflowData>);
  };

  const isEquipmentSelected = (category: 'safety' | 'comfort' | 'infotainment' | 'extras', itemId: string) => {
    const array = workflowData[`${category}Equipment` as keyof SellWorkflowData] as string[] || [];
    return array.includes(itemId);
  };

  return (
    <FormContainer>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {language === 'bg' 
          ? 'Оборудването е опционално. Можете да го добавите по-късно.'
          : 'Equipment is optional. You can add it later.'}
      </p>

      {(Object.keys(EQUIPMENT_CATEGORIES) as Array<keyof typeof EQUIPMENT_CATEGORIES>).map(category => (
        <div key={category}>
          <SectionTitle>
            {category === 'safety' && (language === 'bg' ? 'Безопасност' : 'Safety')}
            {category === 'comfort' && (language === 'bg' ? 'Комфорт' : 'Comfort')}
            {category === 'infotainment' && (language === 'bg' ? 'Инфоразвлечение' : 'Infotainment')}
            {category === 'extras' && (language === 'bg' ? 'Екстри' : 'Extras')}
          </SectionTitle>
          <EquipmentGrid>
            {EQUIPMENT_CATEGORIES[category].map(item => {
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
