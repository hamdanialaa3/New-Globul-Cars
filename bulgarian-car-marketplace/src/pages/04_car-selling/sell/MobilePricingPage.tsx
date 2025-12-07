// Mobile Pricing Page
// Purpose: Price setting for vehicle listing on mobile/tablet
// Mobile-first; no emojis; <300 lines

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { S } from './MobilePricingPage.styles';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { usePricingForm } from './Pricing/usePricingForm';
import { AIPriceSuggestion } from '../../../components/AI';

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

const MobilePricingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const [showAIPricing, setShowAIPricing] = useState(false);
  
  const { pricingData, handleFieldChange, canContinue, serialize } = usePricingForm();

  // Get car details from URL params for AI
  const carDetails = {
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    year: parseInt(searchParams.get('year') || '2020'),
    mileage: parseInt(searchParams.get('mileage') || '0'),
    condition: searchParams.get('condition') || 'good',
    location: searchParams.get('location') || 'Sofia'
  };

  useEffect(() => {
    SellWorkflowStepStateService.markPending('pricing');
  }, []);

  const handleContinue = () => {
    if (!pricingData.price || parseFloat(pricingData.price) <= 0) return;

    const params = serialize();
    navigate(`/sell/inserat/${vehicleType}/contact?${params.toString()}`);
  };

  const formattedPrice = pricingData.price
    ? parseFloat(pricingData.price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')
    : '';

  useEffect(() => {
    if (pricingData.price && parseFloat(pricingData.price) > 0) {
      SellWorkflowStepStateService.markCompleted('pricing');
    } else {
      SellWorkflowStepStateService.markPending('pricing');
    }
  }, [pricingData.price]);

  return (
    <S.PageWrapper>
      <MobileHeader />
      <ProgressWrapper>
        <SellProgressBar currentStep="pricing" />
      </ProgressWrapper>

      <S.ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <S.HeaderSection>
              <S.PageTitle>{t('sell.pricing.title')}</S.PageTitle>
              <S.PageSubtitle>{t('sell.pricing.subtitle')}</S.PageSubtitle>
            </S.HeaderSection>

            <S.Card>
              <S.FieldGroup>
                <S.Label htmlFor="price" $required>
                  {t('sell.pricing.price')}
                </S.Label>
                <S.PriceInputWrapper>
                  <S.Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    value={pricingData.price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('price', e.target.value)}
                    placeholder="25000"
                    min="0"
                    step="100"
                  />
                  <S.Currency>EUR</S.Currency>
                </S.PriceInputWrapper>
                {formattedPrice && (
                  <S.FormattedPrice>
                    {formattedPrice} EUR
                  </S.FormattedPrice>
                )}
              </S.FieldGroup>

              {carDetails.make && carDetails.model && (
                <S.Card style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <AIPriceSuggestion
                    carDetails={carDetails}
                    onPriceSelect={(price) => handleFieldChange('price', price.toString())}
                  />
                </S.Card>
              )}

              <S.ToggleWrapper>
                <S.ToggleSwitch $checked={pricingData.negotiable}>
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={pricingData.negotiable}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('negotiable', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </S.ToggleSwitch>
                <S.ToggleLabel htmlFor="negotiable">
                  {t('sell.pricing.negotiable')}
                </S.ToggleLabel>
              </S.ToggleWrapper>

              <S.CheckboxGroup>
                <S.Checkbox
                  type="checkbox"
                  id="vat"
                  checked={pricingData.vatDeductible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('vatDeductible', e.target.checked)}
                />
                <S.CheckboxLabel htmlFor="vat">
                  {t('sell.pricing.vatDeductible')}
                </S.CheckboxLabel>
              </S.CheckboxGroup>
            </S.Card>

            <S.InfoCard>
              <S.InfoTitle>{t('sell.pricing.infoTitle')}</S.InfoTitle>
              <S.InfoText>{t('sell.pricing.infoText')}</S.InfoText>
            </S.InfoCard>
          </MobileStack>
        </MobileContainer>
      </S.ContentWrapper>

      <S.StickyFooter>
        <S.PrimaryButton
          $enabled={canContinue}
          onClick={handleContinue}
          disabled={!canContinue}
        >
          {t('sell.start.continue')}
        </S.PrimaryButton>
      </S.StickyFooter>
    </S.PageWrapper>
  );
};

export default MobilePricingPage;
