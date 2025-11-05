// Unified Equipment Page - All Features in One Place
// صفحة موحدة للمعدات - كل الميزات في مكان واحد

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import { 
  Shield, Zap, AlertTriangle, Eye, Wind, Droplets, Armchair, Sun, 
  Fan, Snowflake, Radio, Bluetooth, Smartphone, Music, Wifi, Navigation,
  Sparkles, Moon, Circle, KeyRound, Car 
} from 'lucide-react';
import * as S from './UnifiedEquipmentStyles';

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

  const [selectedFeatures, setSelectedFeatures] = useState<Record<EquipmentCategory, string[]>>({
    safety: [],
    comfort: [],
    infotainment: [],
    extras: []
  });

  const [activeTab, setActiveTab] = useState<EquipmentCategory>('safety');
  const vehicleType = searchParams.get('vt');
  const make = searchParams.get('mk');

  // Load existing selections from URL
  useEffect(() => {
    const categories: EquipmentCategory[] = ['safety', 'comfort', 'infotainment', 'extras'];
    const newSelections: Record<EquipmentCategory, string[]> = {
      safety: [],
      comfort: [],
      infotainment: [],
      extras: []
    };

    categories.forEach(category => {
      const param = searchParams.get(category);
      if (param) {
        newSelections[category] = param.split(',');
      }
    });

    setSelectedFeatures(newSelections);
  }, [searchParams]);

  const toggleFeature = (category: EquipmentCategory, featureId: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [category]: prev[category].includes(featureId)
        ? prev[category].filter(id => id !== featureId)
        : [...prev[category], featureId]
    }));
  };

  const handleContinue = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Add all selected features to URL
    Object.entries(selectedFeatures).forEach(([category, features]) => {
      if (features.length > 0) {
        params.set(category, features.join(','));
      } else {
        params.delete(category);
      }
    });

    navigate(`/sell/inserat/${vehicleType || 'car'}/details/bilder?${params.toString()}`);
  };

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: false },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: false },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

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

  // Count selected features
  const totalSelected = Object.values(selectedFeatures).flat().length;

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>
          {language === 'bg' ? 'Оборудване на превозното средство' : 'Vehicle Equipment'}
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

      {/* Tabs */}
      <S.TabsContainer>
        {(Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).map(category => {
          const count = selectedFeatures[category].length;
          return (
            <S.Tab
              key={category}
              $isActive={activeTab === category}
              $hasSelection={count > 0}
              $isEmpty={count === 0}
              onClick={() => setActiveTab(category)}
            >
              {getCategoryIcon(category)}
              <S.TabLabel>
                {language === 'bg' ? categoryLabels[category].bg : categoryLabels[category].en}
              </S.TabLabel>
              {count > 0 && <S.TabBadge>{count}</S.TabBadge>}
            </S.Tab>
          );
        })}
      </S.TabsContainer>

      {/* Features Grid */}
      <S.FeaturesContainer>
        {EQUIPMENT_CATEGORIES[activeTab].map((feature) => {
          const IconComponent = feature.icon;
          const isSelected = selectedFeatures[activeTab].includes(feature.id);
          
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
                  id={`feature-${feature.id}`}
                  checked={isSelected}
                  onChange={() => toggleFeature(activeTab, feature.id)}
                />
                <S.CyberToggleLabel htmlFor={`feature-${feature.id}`}>
                  <S.ToggleTrack />
                  <S.ToggleThumbIcon />
                  <S.ToggleThumbDots />
                  <S.ToggleThumbHighlight />
                  <S.ToggleLabels>
                    <S.ToggleLabelOn>ON</S.ToggleLabelOn>
                    <S.ToggleLabelOff>OFF</S.ToggleLabelOff>
                  </S.ToggleLabels>
                </S.CyberToggleLabel>
              </S.CyberToggleWrapper>
            </S.FeatureRow>
          );
        })}
      </S.FeaturesContainer>

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

  const rightContent = <WorkflowFlow currentStepIndex={3} totalSteps={8} carBrand={make || undefined} language={language} />;

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default UnifiedEquipmentPage;

