// Safety Equipment Page - Modern Workflow Design
// صفحة معدات السلامة - تصميم سير عمل حديث
// File Size: ~240 lines ✅

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import SplitScreenLayout from '@globul-cars/ui/componentsSplitScreenLayout';
import BrandLogoSphere from '@globul-cars/ui/componentsBrandLogoSphere';
import { Shield, Zap, AlertTriangle, Eye } from 'lucide-react';
import * as S from './styles';

const SAFETY_FEATURES = [
  { id: 'abs', icon: Zap, keyBg: 'safety.abs', keyEn: 'abs' },
  { id: 'esp', icon: Shield, keyBg: 'safety.esp', keyEn: 'esp' },
  { id: 'airbags', icon: Shield, keyBg: 'safety.airbags', keyEn: 'airbags' },
  { id: 'parkingSensors', icon: Eye, keyBg: 'safety.parkingSensors', keyEn: 'parkingSensors' },
  { id: 'rearviewCamera', icon: Eye, keyBg: 'safety.rearviewCamera', keyEn: 'rearviewCamera' },
  { id: 'blindSpotMonitor', icon: AlertTriangle, keyBg: 'safety.blindSpotMonitor', keyEn: 'blindSpotMonitor' },
  { id: 'laneDeparture', icon: AlertTriangle, keyBg: 'safety.laneDeparture', keyEn: 'laneDeparture' },
  { id: 'collisionWarning', icon: AlertTriangle, keyBg: 'safety.collisionWarning', keyEn: 'collisionWarning' }
];

const SafetyEquipmentPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleContinue = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedFeatures.length > 0) {
      params.set('safety', selectedFeatures.join(','));
    }
    navigate(`/sell/inserat/${vehicleType || 'car'}/ausstattung/komfort?${params.toString()}`);
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
        <S.Title>
          {language === 'bg' ? 'Оборудване за безопасност' : 'Safety Equipment'}
        </S.Title>
        <S.Subtitle>
          {language === 'bg' 
            ? 'Изберете системите за безопасност на вашето превозно средство' 
            : 'Select the safety systems of your vehicle'}
        </S.Subtitle>
      </S.HeaderCard>

      <S.FeatureGrid>
        {SAFETY_FEATURES.map((feature) => {
          const IconComponent = feature.icon;
          const isSelected = selectedFeatures.includes(feature.id);
          
          return (
            <S.FeatureCard
              key={feature.id}
              $isSelected={isSelected}
              onClick={() => toggleFeature(feature.id)}
            >
              <S.FeatureIcon $isSelected={isSelected}>
                <IconComponent size={24} />
              </S.FeatureIcon>
              <S.FeatureLabel>
                {language === 'bg' 
                  ? (feature.keyBg.split('.')[1] || feature.id) 
                  : feature.keyEn}
              </S.FeatureLabel>
              {isSelected && <S.CheckMark>✓</S.CheckMark>}
            </S.FeatureCard>
          );
        })}
      </S.FeatureGrid>

      <S.InfoBox>
        {language === 'bg' 
          ? '💡 Изборът на оборудване е незадължителен. Можете да пропуснете тази стъпка.' 
          : '💡 Equipment selection is optional. You can skip this step.'}
      </S.InfoBox>

      <S.NavigationButtons>
        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => navigate(-1)}
        >
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handleContinue}
        >
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  const make = searchParams.get('mk');
  
  const rightContent = make ? (
    <BrandLogoSphere 
      make={make} 
      ariaLabel={language === 'bg' ? 'Лого на марката' : 'Brand logo'}
    />
  ) : null;

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default SafetyEquipmentPageNew;

