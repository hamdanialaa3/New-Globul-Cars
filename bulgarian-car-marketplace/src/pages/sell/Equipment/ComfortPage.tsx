// Comfort Equipment Page
// صفحة معدات الراحة

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import { Wind, Droplets, Armchair, Sun, Fan, Snowflake } from 'lucide-react';
import * as S from './styles';

const COMFORT_FEATURES = [
  { id: 'ac', icon: Snowflake, bgLabel: 'Климатик', enLabel: 'Air Conditioning' },
  { id: 'climate', icon: Wind, bgLabel: 'Климат контрол', enLabel: 'Climate Control' },
  { id: 'heatedSeats', icon: Armchair, bgLabel: 'Отопляеми седалки', enLabel: 'Heated Seats' },
  { id: 'ventilatedSeats', icon: Fan, bgLabel: 'Вентилирани седалки', enLabel: 'Ventilated Seats' },
  { id: 'sunroof', icon: Sun, bgLabel: 'Панорамен покрив', enLabel: 'Sunroof' },
  { id: 'rainSensor', icon: Droplets, bgLabel: 'Сензор за дъжд', enLabel: 'Rain Sensor' },
  { id: 'cruiseControl', icon: Wind, bgLabel: 'Круиз контрол', enLabel: 'Cruise Control' },
  { id: 'parkAssist', icon: Armchair, bgLabel: 'Авто паркиране', enLabel: 'Park Assist' }
];

const ComfortEquipmentPageNew: React.FC = () => {
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
      params.set('comfort', selectedFeatures.join(','));
    }
    navigate(`/sell/inserat/${vehicleType || 'car'}/ausstattung/infotainment?${params.toString()}`);
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
        <S.Title>{language === 'bg' ? 'Оборудване за комфорт' : 'Comfort Equipment'}</S.Title>
        <S.Subtitle>
          {language === 'bg' ? 'Изберете функциите за комфорт' : 'Select comfort features'}
        </S.Subtitle>
      </S.HeaderCard>

      <S.FeatureGrid>
        {COMFORT_FEATURES.map((feature) => {
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

export default ComfortEquipmentPageNew;

