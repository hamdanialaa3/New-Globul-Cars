// Mobile Vehicle Data Page - Professional Edition
// Optimized for mobile and portrait tablets; no emojis; ≤300 lines

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileContainer, MobileStack } from '../../components/ui/mobile-index';
import { MobileHeader } from '../../components/layout/MobileHeader';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '../../styles/mobile-design-system';
import { getAllBrands, getModelsForBrand } from '../../services/carBrandsService';

// Layout wrappers
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${mobileColors.neutral.gray50};
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${mobileSpacing.lg} 0;
  padding-bottom: 140px;
`;

const HeaderSection = styled.div`
  margin-bottom: ${mobileSpacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${mobileTypography.display.xs.fontSize};
  line-height: ${mobileTypography.display.xs.lineHeight};
  font-weight: ${mobileTypography.display.xs.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${mobileTypography.bodyLarge.fontSize};
  line-height: ${mobileTypography.bodyLarge.lineHeight};
  color: ${mobileColors.neutral.gray600};
  margin: 0;
`;

// Simple mobile select using design tokens
const FieldGroup = styled.div`
  ${mobileMixins.flexColumn};
  gap: ${mobileSpacing.xs};
`;

const Label = styled.label<{ $required?: boolean }>`
  font-size: ${mobileTypography.label.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  line-height: ${mobileTypography.label.lineHeight};
  color: ${mobileColors.neutral.gray700};
  &::after {
    content: ${props => (props.$required ? "' *'" : "''")};
    color: ${mobileColors.error.main};
  }
`;

const Select = styled.select`
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.sm} ${mobileSpacing.md};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  color: ${mobileColors.neutral.gray900};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  transition: ${mobileAnimations.transitions.default};
  &:focus {
    outline: none;
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
`;

const Input = styled.input`
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.sm} ${mobileSpacing.md};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  color: ${mobileColors.neutral.gray900};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  transition: ${mobileAnimations.transitions.default};
  &::placeholder { color: ${mobileColors.neutral.gray400}; }
  &:focus {
    outline: none;
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
  &[type='number'] { -moz-appearance: textfield; }
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

const Hint = styled.span`
  font-size: ${mobileTypography.caption.fontSize};
  color: ${mobileColors.neutral.gray600};
`;

const Card = styled.div`
  background: ${mobileColors.surface.card};
  border: 1px solid ${mobileColors.surface.border};
  padding: ${mobileSpacing.lg};
  box-shadow: ${'0 1px 2px rgba(16,24,40,0.04)'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${mobileSpacing.md};
`;

const StickyFooter = styled.div`
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: ${mobileColors.surface.background};
  border-top: 1px solid ${mobileColors.surface.divider};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  ${mobileMixins.safeAreaPadding}
`;

// Types
interface VehicleForm {
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
}

export const MobileVehicleDataPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();

  const [form, setForm] = useState<VehicleForm>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: ''
  });

  // Prefill from URL
  useEffect(() => {
    const prefilled: Partial<VehicleForm> = {
      make: searchParams.get('mk') || '',
      model: searchParams.get('md') || '',
      year: searchParams.get('fy') || '',
      mileage: searchParams.get('mi') || '',
      fuelType: searchParams.get('fm') || '',
      transmission: searchParams.get('tr') || ''
    };
    setForm(prev => ({ ...prev, ...prefilled }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brands = useMemo(() => getAllBrands(), []);
  const models = useMemo(() => (form.make ? getModelsForBrand(form.make) : []), [form.make]);

  const fuelTypes = useMemo(() => [
    'Бензин', 'Дизел', 'Хибрид', 'Електрически', 'Газ (LPG)', 'Газ (CNG)'
  ], []);
  const transmissions = useMemo(() => [
    'Ръчна', 'Автоматична', 'Полуавтоматична', 'CVT', 'DSG'
  ], []);

  const onChange = (field: keyof VehicleForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'make') {
      // Reset dependent fields when brand changes
      setForm(prev => ({ ...prev, model: '' }));
    }
  };

  const canContinue = !!form.make && !!form.year;

  const goBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('vt', vehicleType);
    if (form.make) params.set('mk', form.make);
    if (form.model) params.set('md', form.model);
    if (form.fuelType) params.set('fm', form.fuelType);
    if (form.year) params.set('fy', form.year);
    if (form.mileage) params.set('mi', form.mileage);
    if (form.transmission) params.set('tr', form.transmission);
    navigate(`/sell/inserat/${vehicleType}/verkaeufertyp?${params.toString()}`);
  };

  const goNext = () => {
    if (!canContinue) return;
    const params = new URLSearchParams();
    params.set('vt', vehicleType);
    const st = searchParams.get('st');
    if (st) params.set('st', st);
    params.set('mk', form.make);
    if (form.model) params.set('md', form.model);
    if (form.fuelType) params.set('fm', form.fuelType);
    params.set('fy', form.year);
    if (form.mileage) params.set('mi', form.mileage);
    if (form.transmission) params.set('tr', form.transmission);
    navigate(`/sell/inserat/${vehicleType}/equipment?${params.toString()}`);
  };

  return (
    <PageWrapper>
      <MobileHeader />

      <ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <HeaderSection>
              <PageTitle>
                {t('sell.vehicleData.title')}
              </PageTitle>
              <PageSubtitle>
                {t('sell.vehicleData.subtitle')}
              </PageSubtitle>
            </HeaderSection>

            <Card>
              <Grid>
                <FieldGroup>
                  <Label htmlFor="make" $required>
                    {t('sell.vehicleData.make')}
                  </Label>
                  <Select
                    id="make"
                    value={form.make}
                    onChange={(e) => onChange('make', e.target.value)}
                  >
                    <option value="">{t('sell.vehicleData.selectMake')}</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                  <Hint>
                    {t('sell.vehicleData.makeHint')}
                  </Hint>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="model">
                    {t('sell.vehicleData.model')}
                  </Label>
                  {models.length > 0 ? (
                    <Select
                      id="model"
                      value={form.model}
                      onChange={(e) => onChange('model', e.target.value)}
                      disabled={!form.make}
                    >
                      <option value="">{t('sell.vehicleData.selectModel')}</option>
                      {models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id="model"
                      type="text"
                      placeholder={language === 'bg' ? 'Например: X5' : 'e.g. X5'}
                      value={form.model}
                      onChange={(e) => onChange('model', e.target.value)}
                      disabled={!form.make}
                    />
                  )}
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="year" $required>
                    {t('sell.vehicleData.year')}
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    value={form.year}
                    onChange={(e) => onChange('year', e.target.value)}
                    min={"1900"}
                    max={(new Date().getFullYear() + 1).toString()}
                    inputMode="numeric"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="mileage">
                    {t('sell.vehicleData.mileage')}
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="45000"
                    value={form.mileage}
                    onChange={(e) => onChange('mileage', e.target.value)}
                    min="0"
                    inputMode="numeric"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="fuelType">
                    {t('sell.vehicleData.fuel')}
                  </Label>
                  <Select
                    id="fuelType"
                    value={form.fuelType}
                    onChange={(e) => onChange('fuelType', e.target.value)}
                  >
                    <option value="">{t('sell.select')}</option>
                    {fuelTypes.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="transmission">
                    {t('sell.vehicleData.transmission')}
                  </Label>
                  <Select
                    id="transmission"
                    value={form.transmission}
                    onChange={(e) => onChange('transmission', e.target.value)}
                  >
                    <option value="">{t('sell.select')}</option>
                    {transmissions.map(tr => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </Select>
                </FieldGroup>
              </Grid>
            </Card>
          </MobileStack>
        </MobileContainer>
      </ContentWrapper>

      <StickyFooter>
        <PrimaryButton $enabled={canContinue} onClick={goNext} disabled={!canContinue}>
          {t('sell.start.continue')}
        </PrimaryButton>
      </StickyFooter>
    </PageWrapper>
  );
};

export default MobileVehicleDataPage;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileContainer, MobileStack } from '../../components/ui/mobile-index';
import { MobileHeader } from '../../components/layout/MobileHeader';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '../../styles/mobile-design-system';
import { getAllBrands, getModelsForBrand } from '../../services/carBrandsService';

// Layout wrappers
const PageWrapper = styled.div`
      <MobileHeader />

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${mobileSpacing.lg} 0;
  padding-bottom: 140px;
`;
                {t('sell.vehicleData.title')}
const HeaderSection = styled.div`
  margin-bottom: ${mobileSpacing.xl};
                {t('sell.vehicleData.subtitle')}
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${mobileTypography.bodyLarge.fontSize};
  line-height: ${mobileTypography.bodyLarge.lineHeight};
                    {t('sell.vehicleData.make')}
  margin: 0;
`;

// Simple mobile select using design tokens
const FieldGroup = styled.div`
  ${mobileMixins.flexColumn};
                    <option value="">{t('sell.vehicleData.selectMake')}</option>
const Label = styled.label<{ $required?: boolean }>`
  font-size: ${mobileTypography.label.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  line-height: ${mobileTypography.label.lineHeight};
  color: ${mobileColors.neutral.gray700};
                    {t('sell.vehicleData.makeHint')}
`;

const Select = styled.select`
  ${mobileMixins.preventZoom};
  width: 100%;
                    {t('sell.vehicleData.model')}
  padding: ${mobileSpacing.sm} ${mobileSpacing.md};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  color: ${mobileColors.neutral.gray900};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  transition: ${mobileAnimations.transitions.default};
                      <option value="">{t('sell.vehicleData.selectModel')}</option>
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
`;

const Input = styled.input`
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
                      placeholder={language === 'bg' ? 'Например: X5' : 'e.g. X5'}
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  color: ${mobileColors.neutral.gray900};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  transition: ${mobileAnimations.transitions.default};
  &::placeholder { color: ${mobileColors.neutral.gray400}; }
  &:focus {
                    {t('sell.vehicleData.year')}
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
  &[type='number'] { -moz-appearance: textfield; }
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

const Hint = styled.span`
  font-size: ${mobileTypography.caption.fontSize};
  color: ${mobileColors.neutral.gray600};
`;

const Card = styled.div`
  background: ${mobileColors.surface.card};
                    {t('sell.vehicleData.mileage')}
  border: 1px solid ${mobileColors.surface.border};
  padding: ${mobileSpacing.lg};
  box-shadow: ${'0 1px 2px rgba(16,24,40,0.04)'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${mobileSpacing.md};
`;

const StickyFooter = styled.div`
  position: fixed;
  bottom: 0; left: 0; right: 0;
                    {t('sell.vehicleData.fuel')}
  background: ${mobileColors.surface.background};
  border-top: 1px solid ${mobileColors.surface.divider};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  ${mobileMixins.safeAreaPadding}
`;

                    <option value="">{t('sell.select')}</option>
  ${mobileMixins.touchTarget};
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchLarge};
  padding: ${mobileSpacing.md} ${mobileSpacing.xl};
  background: ${props => (props.$enabled ? mobileColors.primary.main : mobileColors.neutral.gray300)};
  color: #fff;
  border: none;
                    {t('sell.vehicleData.transmission')}
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  letter-spacing: ${mobileTypography.button.letterSpacing};
  cursor: ${props => (props.$enabled ? 'pointer' : 'not-allowed')};
  transition: ${mobileAnimations.transitions.default};
  opacity: ${props => (props.$enabled ? 1 : 0.6)};
                    <option value="">{t('sell.select')}</option>
`;

// Types
interface VehicleForm {
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
}

export const MobileVehicleDataPage: React.FC = () => {
          {t('sell.start.continue')}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();

  const [form, setForm] = useState<VehicleForm>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: ''
  });

  // Prefill from URL
  useEffect(() => {
    const prefilled: Partial<VehicleForm> = {
      make: searchParams.get('mk') || '',
      model: searchParams.get('md') || '',
      year: searchParams.get('fy') || '',
      mileage: searchParams.get('mi') || '',
      fuelType: searchParams.get('fm') || '',
      transmission: searchParams.get('tr') || ''
    };
    setForm(prev => ({ ...prev, ...prefilled }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brands = useMemo(() => getAllBrands(), []);
  const models = useMemo(() => (form.make ? getModelsForBrand(form.make) : []), [form.make]);

  const fuelTypes = useMemo(() => [
    'Бензин', 'Дизел', 'Хибрид', 'Електрически', 'Газ (LPG)', 'Газ (CNG)'
  ], []);
  const transmissions = useMemo(() => [
    'Ръчна', 'Автоматична', 'Полуавтоматична', 'CVT', 'DSG'
  ], []);

  const onChange = (field: keyof VehicleForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'make') {
      // Reset dependent fields when brand changes
      setForm(prev => ({ ...prev, model: '' }));
    }
  };

  const canContinue = !!form.make && !!form.year;

  const goBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('vt', vehicleType);
    if (form.make) params.set('mk', form.make);
    if (form.model) params.set('md', form.model);
    if (form.fuelType) params.set('fm', form.fuelType);
    if (form.year) params.set('fy', form.year);
    if (form.mileage) params.set('mi', form.mileage);
    if (form.transmission) params.set('tr', form.transmission);
    navigate(`/sell/inserat/${vehicleType}/verkaeufertyp?${params.toString()}`);
  };

  const goNext = () => {
    if (!canContinue) return;
    const params = new URLSearchParams();
    params.set('vt', vehicleType);
    const st = searchParams.get('st');
    if (st) params.set('st', st);
    params.set('mk', form.make);
    if (form.model) params.set('md', form.model);
    if (form.fuelType) params.set('fm', form.fuelType);
    params.set('fy', form.year);
    if (form.mileage) params.set('mi', form.mileage);
    if (form.transmission) params.set('tr', form.transmission);
    navigate(`/sell/inserat/${vehicleType}/equipment?${params.toString()}`);
  };

  return (
    <PageWrapper>
      <MobileHeader
        title={t('sell.vehicleData.title', language === 'bg' ? 'Данни за превозното средство' : 'Vehicle Data')}
        showBackButton
        onBackClick={goBack}
      />

      <ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <HeaderSection>
              <PageTitle>
                {t('sell.vehicleData.header', language === 'bg' ? 'Данни за превозното средство' : 'Vehicle Data')}
              </PageTitle>
              <PageSubtitle>
                {t(
                  'sell.vehicleData.subtitle',
                  language === 'bg'
                    ? 'Въведете основната информация за вашето превозно средство'
                    : 'Enter basic information about your vehicle'
                )}
              </PageSubtitle>
            </HeaderSection>

            <Card>
              <Grid>
                <FieldGroup>
                  <Label htmlFor="make" $required>
                    {t('sell.vehicleData.make', language === 'bg' ? 'Марка' : 'Make')}
                  </Label>
                  <Select
                    id="make"
                    value={form.make}
                    onChange={(e) => onChange('make', e.target.value)}
                  >
                    <option value="">
                      {t('sell.vehicleData.selectMake', language === 'bg' ? 'Изберете марка' : 'Select make')}
                    </option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                  <Hint>
                    {t(
                      'sell.vehicleData.makeHint',
                      language === 'bg' ? 'Най-популярните марки са в началото' : 'Popular brands appear first'
                    )}
                  </Hint>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="model">
                    {t('sell.vehicleData.model', language === 'bg' ? 'Модел' : 'Model')}
                  </Label>
                  {models.length > 0 ? (
                    <Select
                      id="model"
                      value={form.model}
                      onChange={(e) => onChange('model', e.target.value)}
                      disabled={!form.make}
                    >
                      <option value="">
                        {t('sell.vehicleData.selectModel', language === 'bg' ? 'Изберете модел' : 'Select model')}
                      </option>
                      {models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id="model"
                      type="text"
                      placeholder={language === 'bg' ? 'Например: X5' : 'e.g. X5'}
                      value={form.model}
                      onChange={(e) => onChange('model', e.target.value)}
                      disabled={!form.make}
                    />
                  )}
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="year" $required>
                    {t('sell.vehicleData.year', language === 'bg' ? 'Година' : 'Year')}
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    value={form.year}
                    onChange={(e) => onChange('year', e.target.value)}
                    min={"1900"}
                    max={(new Date().getFullYear() + 1).toString()}
                    inputMode="numeric"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="mileage">
                    {t('sell.vehicleData.mileage', language === 'bg' ? 'Пробег (км)' : 'Mileage (km)')}
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="45000"
                    value={form.mileage}
                    onChange={(e) => onChange('mileage', e.target.value)}
                    min="0"
                    inputMode="numeric"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="fuelType">
                    {t('sell.vehicleData.fuel', language === 'bg' ? 'Гориво' : 'Fuel type')}
                  </Label>
                  <Select
                    id="fuelType"
                    value={form.fuelType}
                    onChange={(e) => onChange('fuelType', e.target.value)}
                  >
                    <option value="">{t('sell.select', language === 'bg' ? 'Изберете' : 'Select')}</option>
                    {fuelTypes.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="transmission">
                    {t('sell.vehicleData.transmission', language === 'bg' ? 'Скоростна кутия' : 'Transmission')}
                  </Label>
                  <Select
                    id="transmission"
                    value={form.transmission}
                    onChange={(e) => onChange('transmission', e.target.value)}
                  >
                    <option value="">{t('sell.select', language === 'bg' ? 'Изберете' : 'Select')}</option>
                    {transmissions.map(tr => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </Select>
                </FieldGroup>
              </Grid>
            </Card>
          </MobileStack>
        </MobileContainer>
      </ContentWrapper>

      <StickyFooter>
        <PrimaryButton $enabled={canContinue} onClick={goNext} disabled={!canContinue}>
          {t('sell.continue', language === 'bg' ? 'Продължи' : 'Continue')}
        </PrimaryButton>
      </StickyFooter>
    </PageWrapper>
  );
};

export default MobileVehicleDataPage;
