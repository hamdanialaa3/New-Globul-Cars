// Sell Vehicle Step 3: Equipment

import React, { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';
import {
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun,
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car, Power
} from 'lucide-react';

// LED Glow Animations
const ledPulseGreen = keyframes`
  0%, 100% { 
    box-shadow: 0 0 8px #10b981, 0 0 20px #10b981, 0 0 40px rgba(16, 185, 129, 0.5);
    border-color: #10b981;
  }
  50% { 
    box-shadow: 0 0 12px #10b981, 0 0 30px #10b981, 0 0 60px rgba(16, 185, 129, 0.7);
    border-color: #34d399;
  }
`;

const ledPulseYellow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 6px #f59e0b, 0 0 15px rgba(245, 158, 11, 0.4);
    border-color: #f59e0b;
  }
  50% { 
    box-shadow: 0 0 10px #f59e0b, 0 0 25px rgba(245, 158, 11, 0.6);
    border-color: #fbbf24;
  }
`;

const ledPulseRed = keyframes`
  0%, 100% { 
    box-shadow: 0 0 4px #ef4444, 0 0 10px rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
  }
  50% { 
    box-shadow: 0 0 6px #ef4444, 0 0 15px rgba(239, 68, 68, 0.4);
    border-color: #f87171;
  }
`;

// LED State Type
type LEDState = 'off' | 'partial' | 'full';

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

// LED Frame Wrapper for Equipment Sections
const LEDFrameWrapper = styled.div<{ $ledState: LEDState }>`
  position: relative;
  padding: 1rem;
  border-radius: 16px;
  background: var(--bg-card);
  border: 2px solid transparent;
  transition: all 0.4s ease;
  
  ${props => props.$ledState === 'off' && css`
    border-color: #ef4444;
    animation: ${ledPulseRed} 3s ease-in-out infinite;
  `}
  
  ${props => props.$ledState === 'partial' && css`
    border-color: #f59e0b;
    animation: ${ledPulseYellow} 2s ease-in-out infinite;
  `}
  
  ${props => props.$ledState === 'full' && css`
    border-color: #10b981;
    animation: ${ledPulseGreen} 1.5s ease-in-out infinite;
  `}
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    padding: 2px;
    background: ${props => 
      props.$ledState === 'full' 
        ? 'linear-gradient(135deg, #10b981, #34d399, #10b981)' 
        : props.$ledState === 'partial'
          ? 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)'
          : 'linear-gradient(135deg, #ef4444, #f87171, #ef4444)'
    };
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.7;
  }
`;

// Modern LED Toggle Button
const MasterToggleButton = styled.button<{ $ledState: LEDState }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  border: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  ${props => props.$ledState === 'off' && css`
    background: linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%);
    color: #ef4444;
    border-color: #ef4444;
    box-shadow: 
      0 0 15px rgba(239, 68, 68, 0.3),
      inset 0 0 20px rgba(239, 68, 68, 0.1);
    
    &:hover {
      box-shadow: 
        0 0 25px rgba(239, 68, 68, 0.5),
        inset 0 0 30px rgba(239, 68, 68, 0.2);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.$ledState === 'partial' && css`
    background: linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%);
    color: #f59e0b;
    border-color: #f59e0b;
    animation: ${ledPulseYellow} 2s ease-in-out infinite;
    
    &:hover {
      box-shadow: 
        0 0 25px rgba(245, 158, 11, 0.5),
        inset 0 0 30px rgba(245, 158, 11, 0.2);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.$ledState === 'full' && css`
    background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
    color: #10b981;
    border-color: #10b981;
    animation: ${ledPulseGreen} 1.5s ease-in-out infinite;
    
    &:hover {
      box-shadow: 
        0 0 35px rgba(16, 185, 129, 0.6),
        inset 0 0 40px rgba(16, 185, 129, 0.3);
      transform: translateY(-2px);
    }
  `}
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const LEDIndicator = styled.div<{ $ledState: LEDState }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  ${props => props.$ledState === 'off' && css`
    background: radial-gradient(circle at 30% 30%, #f87171, #ef4444, #991b1b);
    box-shadow: 0 0 8px #ef4444, 0 0 16px rgba(239, 68, 68, 0.5);
  `}
  
  ${props => props.$ledState === 'partial' && css`
    background: radial-gradient(circle at 30% 30%, #fcd34d, #f59e0b, #b45309);
    box-shadow: 0 0 8px #f59e0b, 0 0 16px rgba(245, 158, 11, 0.5);
  `}
  
  ${props => props.$ledState === 'full' && css`
    background: radial-gradient(circle at 30% 30%, #6ee7b7, #10b981, #047857);
    box-shadow: 0 0 12px #10b981, 0 0 24px rgba(16, 185, 129, 0.6);
  `}
`;

const PowerIcon = styled(Power)<{ $ledState: LEDState }>`
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 6px currentColor);
`;

const ToggleText = styled.span`
  flex: 1;
  text-align: center;
`;

const StatusBadge = styled.div<{ $ledState: LEDState }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => props.$ledState === 'off' && css`
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  `}
  
  ${props => props.$ledState === 'partial' && css`
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  `}
  
  ${props => props.$ledState === 'full' && css`
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  `}
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

  // Calculate total selected and LED state
  const { totalSelected, totalEquipment, ledState, isAllEquipmentSelected } = useMemo(() => {
    const allIds = getAllEquipmentIds();
    const selectedIds = [
      ...(workflowData.safetyEquipment || []),
      ...(workflowData.comfortEquipment || []),
      ...(workflowData.infotainmentEquipment || []),
      ...(workflowData.extrasEquipment || [])
    ];
    const total = allIds.length;
    const selected = selectedIds.length;
    const isAll = allIds.every(id => selectedIds.includes(id));
    
    let state: LEDState = 'off';
    if (selected === 0) {
      state = 'off';
    } else if (isAll) {
      state = 'full';
    } else {
      state = 'partial';
    }
    
    return { 
      totalSelected: selected, 
      totalEquipment: total, 
      ledState: state,
      isAllEquipmentSelected: isAll 
    };
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
        safetyEquipment: EQUIPMENT_CATEGORIES.safety.map(item => item.id),
        comfortEquipment: EQUIPMENT_CATEGORIES.comfort.map(item => item.id),
        infotainmentEquipment: EQUIPMENT_CATEGORIES.infotainment.map(item => item.id),
        extrasEquipment: EQUIPMENT_CATEGORIES.extras.map(item => item.id)
      });
    }
  };

  // Get LED state for each category
  const getCategoryLedState = (category: 'safety' | 'comfort' | 'infotainment' | 'extras'): LEDState => {
    const categoryItems = EQUIPMENT_CATEGORIES[category];
    const selectedItems = workflowData[`${category}Equipment` as keyof UnifiedWorkflowData] as string[] || [];
    
    if (selectedItems.length === 0) return 'off';
    if (selectedItems.length === categoryItems.length) return 'full';
    return 'partial';
  };

  return (
    <FormContainer>
      <DescriptionText>
        {language === 'bg'
          ? 'Оборудването е опционално. Можете да го добавите по-късно.'
          : 'Equipment is optional. You can add it later.'}
      </DescriptionText>

      {/* Modern LED Master Toggle Button */}
      <MasterToggleButton $ledState={ledState} onClick={toggleAllEquipment}>
        <LEDIndicator $ledState={ledState} />
        <PowerIcon $ledState={ledState} />
        <ToggleText>
          {language === 'bg' ? 'Пълна Опция' : 'Full Options'}
        </ToggleText>
        <StatusBadge $ledState={ledState}>
          {totalSelected}/{totalEquipment}
          {ledState === 'full' && ' ✓'}
        </StatusBadge>
      </MasterToggleButton>

      {(Object.keys(EQUIPMENT_CATEGORIES) as Array<keyof typeof EQUIPMENT_CATEGORIES>).map(category => (
        <LEDFrameWrapper key={category} $ledState={getCategoryLedState(category)}>
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
        </LEDFrameWrapper>
      ))}
    </FormContainer>
  );
};

export default SellVehicleStep3;
