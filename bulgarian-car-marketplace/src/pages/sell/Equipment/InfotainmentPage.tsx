// Infotainment Equipment Page
// صفحة معدات الترفيه

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import { Radio, Bluetooth, Smartphone, Music, Wifi, Navigation } from 'lucide-react';
import * as S from './styles';

const INFOTAINMENT_FEATURES = [
  { id: 'bluetooth', icon: Bluetooth, bgLabel: 'Bluetooth', enLabel: 'Bluetooth' },
  { id: 'navigation', icon: Navigation, bgLabel: 'Навигация', enLabel: 'Navigation' },
  { id: 'carPlay', icon: Smartphone, bgLabel: 'Apple CarPlay', enLabel: 'Apple CarPlay' },
  { id: 'androidAuto', icon: Smartphone, bgLabel: 'Android Auto', enLabel: 'Android Auto' },
  { id: 'soundSystem', icon: Music, bgLabel: 'Аудио система', enLabel: 'Sound System' },
  { id: 'radio', icon: Radio, bgLabel: 'Радио', enLabel: 'Radio' },
  { id: 'wifi', icon: Wifi, bgLabel: 'Wi-Fi хотспот', enLabel: 'Wi-Fi Hotspot' },
  { id: 'usb', icon: Smartphone, bgLabel: 'USB портове', enLabel: 'USB Ports' }
];

const InfotainmentEquipmentPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const vehicleType = searchParams.get('vt');

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]
    );
  };

  const handleContinue = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedFeatures.length > 0) {
      params.set('infotainment', selectedFeatures.join(','));
    }
    navigate(`/sell/inserat/${vehicleType || 'car'}/ausstattung/extras?${params.toString()}`);
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

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>{language === 'bg' ? 'Инфотейнмънт' : 'Infotainment'}</S.Title>
        <S.Subtitle>
          {language === 'bg' ? 'Изберете медийните функции' : 'Select media features'}
        </S.Subtitle>
      </S.HeaderCard>

      <S.FeatureGrid>
        {INFOTAINMENT_FEATURES.map((feature) => {
          const IconComponent = feature.icon;
          const isSelected = selectedFeatures.includes(feature.id);
          
          return (
            <S.FeatureCard key={feature.id} $isSelected={isSelected} onClick={() => toggleFeature(feature.id)}>
              <S.FeatureIcon $isSelected={isSelected}>
                <IconComponent size={24} />
              </S.FeatureIcon>
              <S.FeatureLabel>{language === 'bg' ? feature.bgLabel : feature.enLabel}</S.FeatureLabel>
              {isSelected && <S.CheckMark>✓</S.CheckMark>}
            </S.FeatureCard>
          );
        })}
      </S.FeatureGrid>

      <S.InfoBox>
        {language === 'bg' ? '💡 По избор - продължете когато сте готови' : '💡 Optional - continue when ready'}
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

  const rightContent = <WorkflowFlow steps={workflowSteps} currentStepIndex={3} totalSteps={8} />;

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default InfotainmentEquipmentPageNew;

