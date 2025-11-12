// Mobile Pricing Page
// Purpose: Price setting for vehicle listing on mobile/tablet
// Mobile-first; no emojis; <300 lines

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { MobileContainer, MobileStack } from '@/components/ui/mobile-index';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { S } from './MobilePricingPage.styles';
import { SellProgressBar } from '@/components/SellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

const MobilePricingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [vatDeductible, setVatDeductible] = useState(false);

  useEffect(() => {
    SellWorkflowStepStateService.markPending('pricing');
  }, []);

  const handleContinue = () => {
    if (!price || parseFloat(price) <= 0) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('price', price);
    params.set('negotiable', negotiable.toString());
    params.set('vatDeductible', vatDeductible.toString());
    
     navigate(`/sell/inserat/${vehicleType}/contact?${params.toString()}`);
  };

  const canContinue = !!(price && parseFloat(price) > 0);
  const formattedPrice = price ? parseFloat(price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US') : '';

  useEffect(() => {
    if (price && parseFloat(price) > 0) {
      SellWorkflowStepStateService.markCompleted('pricing');
    } else {
      SellWorkflowStepStateService.markPending('pricing');
    }
  }, [price]);

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
                    value={price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
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

              <S.CheckboxGroup>
                <S.Checkbox
                  type="checkbox"
                  id="negotiable"
                  checked={negotiable}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNegotiable(e.target.checked)}
                />
                <S.CheckboxLabel htmlFor="negotiable">
                  {t('sell.pricing.negotiable')}
                </S.CheckboxLabel>
              </S.CheckboxGroup>

              <S.CheckboxGroup>
                <S.Checkbox
                  type="checkbox"
                  id="vat"
                  checked={vatDeductible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVatDeductible(e.target.checked)}
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
