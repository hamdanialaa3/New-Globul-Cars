// Extras Equipment Page
// صفحة معدات إضافية

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import { Sparkles, Zap, Moon, Circle, KeyRound, Car } from 'lucide-react';
import * as S from './styles';

const EXTRAS_FEATURES = [
  { id: 'ledLights', icon: Sparkles, bgLabel: 'LED фарове', enLabel: 'LED Lights' },
  { id: 'xenon', icon: Zap, bgLabel: 'Ксенон фарове', enLabel: 'Xenon Lights' },
  { id: 'daylight', icon: Moon, bgLabel: 'Дневни светлини', enLabel: 'Daytime Running Lights' },
  { id: 'alloyWheels', icon: Circle, bgLabel: 'Алуминиеви джанти', enLabel: 'Alloy Wheels' },
  { id: 'keyless', icon: KeyRound, bgLabel: 'Безключов достъп', enLabel: 'Keyless Entry' },
  { id: 'startStop', icon: Zap, bgLabel: 'Start/Stop система', enLabel: 'Start/Stop System' },
  { id: 'sportPackage', icon: Car, bgLabel: 'Спортен пакет', enLabel: 'Sport Package' },
  { id: 'towHitch', icon: Car, bgLabel: 'Теглич', enLabel: 'Tow Hitch' }
];

const ExtrasEquipmentPageNew: React.FC = () => {
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
      params.set('extras', selectedFeatures.join(','));
    }
    navigate(`/sell/inserat/${vehicleType || 'car'}/bilder?${params.toString()}`);
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
        <S.Title>{language === 'bg' ? 'Допълнително оборудване' : 'Extra Equipment'}</S.Title>
        <S.Subtitle>
          {language === 'bg' ? 'Изберете допълнителните функции' : 'Select additional features'}
        </S.Subtitle>
      </S.HeaderCard>

      <S.FeatureGrid>
        {EXTRAS_FEATURES.map((feature) => {
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

export default ExtrasEquipmentPageNew;

