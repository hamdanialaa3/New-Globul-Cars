// Step 3: Equipment Selection
// الخطوة 3: اختيار المعدات
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCarListingStore } from '../../stores/car-listing-store';
import { step3Schema, Step3Data } from '../../schemas/car-listing.schema';
import {
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun,
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car
} from 'lucide-react';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0;
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

// Neumorphism Switch Container - الحفاظ على التصميم
const SwitchContainer = styled.div<{ $isOn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  cursor: pointer;
  user-select: none;
`;

const SwitchLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--accent-primary);
  }
`;

const SwitchOuter = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 200px;
  height: 50px;
  background: ${props => props.$isOn ? 'var(--bg-card)' : 'var(--bg-secondary)'};
  border-radius: 25px;
  box-shadow: 
    10px 10px 20px rgba(0, 0, 0, 0.15), 
    -10px -10px 20px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SwitchInner = styled.div<{ $isOn: boolean }>`
  position: absolute;
  top: 5px;
  left: 5px;
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  background-color: ${props => props.$isOn ? 'var(--bg-hover)' : 'var(--bg-card)'};
  border-radius: 20px;
  box-shadow: 
    inset 5px 5px 10px rgba(0, 0, 0, 0.2), 
    inset -5px -5px 10px rgba(255, 255, 255, 0.05);
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SwitchKnobContainer = styled.div<{ $isOn: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transform: ${props => props.$isOn ? 'translateX(100%)' : 'translateX(0)'};
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SwitchKnob = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 40px;
  height: 40px;
  top: 5px;
  left: 5px;
  background: linear-gradient(145deg, var(--bg-card), var(--bg-secondary));
  border-radius: 50%;
  box-shadow: 
    5px 5px 10px rgba(0, 0, 0, 0.3), 
    -5px -5px 10px rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwitchKnobNeon = styled.div<{ $isOn: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.$isOn
    ? 'radial-gradient(circle, #10b981 0%, transparent 70%)'
    : 'radial-gradient(circle, #ff8c00 0%, transparent 70%)'
  };
  box-shadow: ${props => props.$isOn
    ? '0 0 10px #10b981, 0 0 20px #10b981, 0 0 30px #10b981'
    : '0 0 10px #ff8c00, 0 0 20px #ff8c00'
  };
  opacity: ${props => props.$isOn ? 1 : 0.8};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${props => props.$isOn ? 'pulse-neon 2s infinite' : 'pulse-neon-orange 2s infinite'};
  
  @keyframes pulse-neon {
    0%, 100% {
      box-shadow: 0 0 10px #10b981, 0 0 20px #10b981, 0 0 30px #10b981;
    }
    50% {
      box-shadow: 0 0 15px #10b981, 0 0 30px #10b981, 0 0 45px #10b981;
    }
  }
  
  @keyframes pulse-neon-orange {
    0%, 100% {
      box-shadow: 0 0 10px #ff8c00, 0 0 20px #ff8c00;
    }
    50% {
      box-shadow: 0 0 15px #ff8c00, 0 0 30px #ff8c00;
    }
  }
`;

const StatusText = styled.div<{ $isOn: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.$isOn ? 'var(--success)' : 'var(--accent-primary)'};
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.4s ease;
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

export const Step3Equipment: React.FC = () => {
  const { language } = useLanguage();
  const { formData, updateStepData, markStepComplete } = useCarListingStore();
  
  const {
    watch,
    setValue,
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData.step3 || {
      safetyEquipment: [],
      comfortEquipment: [],
      infotainmentEquipment: [],
      extrasEquipment: [],
    },
    mode: 'onChange',
  });

  const safetyEquipment = watch('safetyEquipment') || [];
  const comfortEquipment = watch('comfortEquipment') || [];
  const infotainmentEquipment = watch('infotainmentEquipment') || [];
  const extrasEquipment = watch('extrasEquipment') || [];

  const toggleEquipment = (category: keyof typeof EQUIPMENT_CATEGORIES, itemId: string) => {
    const fieldName = `${category}Equipment` as keyof Step3Data;
    const currentArray = (formData.step3?.[fieldName] || []) as string[];
    const isSelected = currentArray.includes(itemId);

    const newArray = isSelected
      ? currentArray.filter(id => id !== itemId)
      : [...currentArray, itemId];

    const newData = {
      ...formData.step3,
      [fieldName]: newArray,
    } as Step3Data;

    setValue(fieldName, newArray, { shouldValidate: true });
    updateStepData('step3', newData);
    markStepComplete(2);
  };

  const isEquipmentSelected = (category: keyof typeof EQUIPMENT_CATEGORIES, itemId: string) => {
    const fieldName = `${category}Equipment` as keyof Step3Data;
    const array = (formData.step3?.[fieldName] || []) as string[];
    return array.includes(itemId);
  };

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
      ...(formData.step3?.safetyEquipment || []),
      ...(formData.step3?.comfortEquipment || []),
      ...(formData.step3?.infotainmentEquipment || []),
      ...(formData.step3?.extrasEquipment || [])
    ];
    return allIds.every(id => selectedIds.includes(id));
  }, [formData.step3]);

  const toggleAllEquipment = () => {
    if (isAllEquipmentSelected) {
      // Deselect all
      const newData: Step3Data = {
        safetyEquipment: [],
        comfortEquipment: [],
        infotainmentEquipment: [],
        extrasEquipment: [],
      };
      updateStepData('step3', newData);
    } else {
      // Select all
      const newData: Step3Data = {
        safetyEquipment: EQUIPMENT_CATEGORIES.safety.map(item => item.id),
        comfortEquipment: EQUIPMENT_CATEGORIES.comfort.map(item => item.id),
        infotainmentEquipment: EQUIPMENT_CATEGORIES.infotainment.map(item => item.id),
        extrasEquipment: EQUIPMENT_CATEGORIES.extras.map(item => item.id),
      };
      updateStepData('step3', newData);
    }
  };

  return (
    <StepContainer>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {language === 'bg'
          ? 'Оборудването е опционално. Можете да го добавите по-късно.'
          : 'Equipment is optional. You can add it later.'}
      </p>

      {/* ✅ Neumorphism Switch - الحفاظ على التصميم */}
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
            {EQUIPMENT_CATEGORIES[category].map(item => {
              const IconComponent = item.icon;
              const isSelected = isEquipmentSelected(category, item.id);
              return (
                <EquipmentButton
                  key={item.id}
                  type="button"
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
    </StepContainer>
  );
};

