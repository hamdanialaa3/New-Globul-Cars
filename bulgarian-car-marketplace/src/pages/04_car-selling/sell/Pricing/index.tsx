// Pricing Page with Workflow
// صفحة التسعير مع الأتمتة

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../../components/WorkflowVisualization';
import { Euro, TrendingUp, Info } from 'lucide-react';
import * as S from './styles';
import { SellWorkflowLayout } from '../../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';
import { usePricingForm } from './usePricingForm';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';

const PricingPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { pricingData, handleFieldChange, canContinue, serialize } = usePricingForm();
  useEffect(() => {
    SellWorkflowStepStateService.markPending('pricing');
  }, []);

  useEffect(() => {
    if (pricingData.price) {
      SellWorkflowStepStateService.markCompleted('pricing');
    } else {
      SellWorkflowStepStateService.markPending('pricing');
    }
  }, [pricingData.price]);


  const vehicleType = searchParams.get('vt');
  // ✅ FIX: Get make from multiple sources
  const { workflowData } = useSellWorkflow();
  const make = searchParams.get('mk') || 
               searchParams.get('make') || 
               workflowData?.make || 
               workflowData?.brand || 
               '';

  const handleContinue = () => {
    if (!pricingData.price) {
      alert(language === 'bg' ? 'Моля, въведете цена!' : 'Please enter a price!');
      return;
    }

    const params = serialize();
    navigate(`/sell/inserat/${vehicleType || 'car'}/contact?${params.toString()}`);
  };

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: true },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>{language === 'bg' ? 'Цена на превозното средство' : 'Vehicle Price'}</S.Title>
        <S.Subtitle>
          {language === 'bg' ? 'Определете цената на вашето превозно средство' : 'Set your vehicle price'}
        </S.Subtitle>

        <S.BrandOrbitInline>
          <WorkflowFlow
            variant="inline"
            currentStepIndex={4}
            totalSteps={8}
            carBrand={make || undefined}
            language={language}
          />
        </S.BrandOrbitInline>
      </S.HeaderCard>

      {/* Top Navigation Buttons */}
      <S.NavigationButtons>
        <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>
        <S.Button type="button" $variant="primary" onClick={handleContinue} disabled={!canContinue}>
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>

      <S.FormCard>
        <S.Label>
          {language === 'bg' ? 'Цена (EUR)' : 'Price (EUR)'}
          <span style={{ color: '#ff8f10', marginLeft: '0.25rem' }}>*</span>
        </S.Label>
        
        <S.PriceInputWrapper>
          <S.PriceIcon>
            <Euro size={24} />
          </S.PriceIcon>
          <S.PriceInput
            type="number"
            value={pricingData.price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            placeholder="15000"
            min="0"
          />
        </S.PriceInputWrapper>

        <S.ToggleWrapper>
          <S.ToggleSwitch $checked={pricingData.negotiable}>
            <input
              type="checkbox"
              id="negotiable"
              checked={pricingData.negotiable}
              onChange={(e) => handleFieldChange('negotiable', e.target.checked)}
            />
            <span className="toggle-slider" />
          </S.ToggleSwitch>
          <S.ToggleLabel htmlFor="negotiable">
            {language === 'bg' ? 'Цената подлежи на договаряне' : 'Price is negotiable'}
          </S.ToggleLabel>
        </S.ToggleWrapper>
      </S.FormCard>

      <S.InfoCard>
        <S.InfoIcon>
          <Info size={20} />
        </S.InfoIcon>
        <S.InfoText>
          <strong>{language === 'bg' ? 'Съвет:' : 'Tip:'}</strong>
          <br />
          {language === 'bg' 
            ? 'Проучете пазарната цена на подобни превозни средства преди да определите цена.' 
            : 'Research market prices for similar vehicles before setting your price.'}
        </S.InfoText>
      </S.InfoCard>

      <S.NavigationButtons>
        <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>
        <S.Button type="button" $variant="primary" onClick={handleContinue} disabled={!canContinue}>
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  return (
    <SellWorkflowLayout currentStep="pricing">
      <SplitScreenLayout leftContent={leftContent} />
    </SellWorkflowLayout>
  );
};

export default PricingPageNew;

