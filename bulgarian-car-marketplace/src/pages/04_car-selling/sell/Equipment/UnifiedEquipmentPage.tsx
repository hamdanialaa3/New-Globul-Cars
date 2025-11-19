// Unified Equipment Page - All Features in One Place
// صفحة موحدة للمعدات - كل الميزات في مكان واحد

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import SplitScreenLayout from '@/components/SplitScreenLayout';
import BrandLogoSphere from '@/components/BrandLogoSphere';
import { 
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun, 
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car 
} from 'lucide-react';
import * as S from './UnifiedEquipmentStyles';
import { SellWorkflowLayout } from '@/components/SellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';
import { useEquipmentSelection } from './useEquipmentSelection';
import { logger } from '@/services/logger-service';

// Equipment Categories
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

type EquipmentCategory = keyof typeof EQUIPMENT_CATEGORIES;

const UnifiedEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();

  const {
    selected: selectedFeatures,
    toggleFeature,
    totalSelected,
    serialize
  } = useEquipmentSelection();
  const vehicleType = searchParams.get('vt');
  const make = searchParams.get('mk');

  const handleContinue = () => {
    try {
      // Save equipment selection to workflow
      const equipmentData = {
        equipment: selectedFeatures,
        equipmentCount: totalSelected
      };
      
      // Update workflow data
      // Note: This assumes useEquipmentSelection handles persistence
      
      const params = serialize();
      navigate(`/sell/inserat/${vehicleType || 'car'}/details/bilder?${params.toString()}`);
    } catch (error) {
      logger.error('Error saving equipment data', error as Error);
      // Could show toast error here
    }
  };

  useEffect(() => {
    SellWorkflowStepStateService.markPending('equipment');
  }, []);

  const categoryLabels: Record<EquipmentCategory, { bg: string; en: string }> = {
    safety: { bg: 'Безопасност', en: 'Safety' },
    comfort: { bg: 'Комфорт', en: 'Comfort' },
    infotainment: { bg: 'Инфотейнмънт', en: 'Infotainment' },
    extras: { bg: 'Екстри', en: 'Extras' }
  };

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'safety': return <S.SafetyIcon />;
      case 'comfort': return <S.ComfortIcon />;
      case 'infotainment': return <S.InfotainmentIcon />;
      case 'extras': return <S.ExtrasIcon />;
      default: return null;
    }
  };

  useEffect(() => {
    if (totalSelected > 0) {
      SellWorkflowStepStateService.markCompleted('equipment');
    } else {
      SellWorkflowStepStateService.markPending('equipment');
    }
  }, [totalSelected]);

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>
          {language === 'bg' ? 'Оборудване' : 'Equipment'}
        </S.Title>
        <S.Subtitle>
          {language === 'bg' 
            ? `Изберете всички налични функции • Избрани: ${totalSelected}` 
            : `Select all available features • Selected: ${totalSelected}`}
        </S.Subtitle>
      </S.HeaderCard>

      {/* Top Navigation Buttons */}
      <S.NavigationButtons>
        <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>
        <S.Button type="button" $variant="primary" onClick={handleContinue}>
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>

      {/* All Equipment Sections - Horizontal Grid */}
      <S.EquipmentSectionsGrid>
        {(Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).map(category => {
          const count = selectedFeatures[category].length;
          return (
            <S.EquipmentSection key={category}>
              <S.SectionHeader>
                <S.SectionHeaderLeft>
                  {getCategoryIcon(category)}
                  <S.SectionTitle>
                    {language === 'bg' ? categoryLabels[category].bg : categoryLabels[category].en}
                  </S.SectionTitle>
                </S.SectionHeaderLeft>
                {count > 0 && <S.SectionBadge>{count}</S.SectionBadge>}
              </S.SectionHeader>

              <S.FeaturesContainer>
                {EQUIPMENT_CATEGORIES[category].map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = selectedFeatures[category].includes(feature.id);
                  
                  return (
                    <S.FeatureRow key={feature.id}>
                      <S.FeatureInfo>
                        <S.FeatureIconWrapper>
                          <IconComponent size={20} />
                        </S.FeatureIconWrapper>
                        <S.FeatureName>
                          {language === 'bg' ? feature.bgLabel : feature.enLabel}
                        </S.FeatureName>
                      </S.FeatureInfo>

                      <S.CyberToggleWrapper>
                        <S.CyberToggleCheckbox
                          type="checkbox"
                          id={`feature-${category}-${feature.id}`}
                          checked={isSelected}
                          onChange={() => toggleFeature(category, feature.id)}
                        />
                        <S.CyberToggleLabel htmlFor={`feature-${category}-${feature.id}`}>
                          <S.ToggleTrack />
                        </S.CyberToggleLabel>
                      </S.CyberToggleWrapper>
                    </S.FeatureRow>
                  );
                })}
              </S.FeaturesContainer>
            </S.EquipmentSection>
          );
        })}
      </S.EquipmentSectionsGrid>

      <S.InfoBox>
        {language === 'bg' 
          ? '💡 Всички полета са незадължителни. Изберете само наличните функции.' 
          : '💡 All fields are optional. Select only available features.'}
      </S.InfoBox>

      <S.NavigationButtons>
        <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>
        <S.Button type="button" $variant="primary" onClick={handleContinue}>
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  const rightContent = make ? (
    <BrandLogoSphere 
      make={make} 
      ariaLabel={language === 'bg' ? 'Лого на марката' : 'Brand logo'}
    />
  ) : null;

  return (
    <SellWorkflowLayout currentStep="equipment">
      <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />
    </SellWorkflowLayout>
  );
};

export default UnifiedEquipmentPage;

