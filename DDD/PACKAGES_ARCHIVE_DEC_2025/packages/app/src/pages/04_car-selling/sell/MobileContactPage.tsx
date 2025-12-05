// Mobile Contact Page
// Purpose: Contact information collection for vehicle listing
// Mobile-first; no emojis; <300 lines

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { MobileContainer, MobileStack } from '@globul-cars/ui/componentsui/mobile-index';
import { MobileHeader } from '@globul-cars/ui/componentslayout/MobileHeader';
import { S } from './MobileContactPage.styles';
import { SellProgressBar } from '@globul-cars/ui/componentsSellWorkflow';
import SellWorkflowStepStateService from '@globul-cars/services/sellWorkflowStepState';

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

const MobileContactPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    zipCode: ''
  });

  useEffect(() => {
    SellWorkflowStepStateService.markPending('contact');
  }, []);

  const onChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!canContinue) return;

    const params = new URLSearchParams(searchParams.toString());
    Object.entries(form).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Navigate to preview/confirmation page
    navigate(`/sell/inserat/${vehicleType}/preview?${params.toString()}`);
  };

  const canContinue = !!(form.name && form.phone && form.email);

  useEffect(() => {
    if (form.name && form.phone && form.email) {
      SellWorkflowStepStateService.markCompleted('contact');
    } else {
      SellWorkflowStepStateService.markPending('contact');
    }
  }, [form.name, form.phone, form.email]);

  return (
    <S.PageWrapper>
      <MobileHeader />
      <ProgressWrapper>
        <SellProgressBar currentStep="contact" />
      </ProgressWrapper>

      <S.ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <S.HeaderSection>
              <S.PageTitle>{t('sell.contact.title')}</S.PageTitle>
              <S.PageSubtitle>{t('sell.contact.subtitle')}</S.PageSubtitle>
            </S.HeaderSection>

            <S.Card>
              <S.Grid>
                <S.FieldGroup>
                  <S.Label htmlFor="name" $required>
                    {t('sell.contact.name')}
                  </S.Label>
                  <S.Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value)}
                    placeholder={t('sell.contact.namePlaceholder')}
                  />
                </S.FieldGroup>

                <S.FieldGroup>
                  <S.Label htmlFor="phone" $required>
                    {t('sell.contact.phone')}
                  </S.Label>
                  <S.Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('phone', e.target.value)}
                    placeholder="+359 888 123 456"
                  />
                </S.FieldGroup>

                <S.FieldGroup>
                  <S.Label htmlFor="email" $required>
                    {t('sell.contact.email')}
                  </S.Label>
                  <S.Input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </S.FieldGroup>

                <S.FieldGroup>
                  <S.Label htmlFor="city">
                    {t('sell.contact.city')}
                  </S.Label>
                  <S.Input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('city', e.target.value)}
                    placeholder={t('sell.contact.cityPlaceholder')}
                  />
                </S.FieldGroup>

                <S.FieldGroup>
                  <S.Label htmlFor="zipCode">
                    {t('sell.contact.zipCode')}
                  </S.Label>
                  <S.Input
                    id="zipCode"
                    type="text"
                    inputMode="numeric"
                    value={form.zipCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('zipCode', e.target.value)}
                    placeholder="1000"
                  />
                </S.FieldGroup>
              </S.Grid>
            </S.Card>

            <S.InfoCard>
              <S.InfoTitle>{t('sell.contact.infoTitle')}</S.InfoTitle>
              <S.InfoText>{t('sell.contact.infoText')}</S.InfoText>
            </S.InfoCard>
          </MobileStack>
        </MobileContainer>
      </S.ContentWrapper>

      <S.StickyFooter>
        <S.PrimaryButton
          $enabled={canContinue}
          onClick={handleSubmit}
          disabled={!canContinue}
        >
          {t('sell.contact.preview')}
        </S.PrimaryButton>
      </S.StickyFooter>
    </S.PageWrapper>
  );
};

export default MobileContactPage;
