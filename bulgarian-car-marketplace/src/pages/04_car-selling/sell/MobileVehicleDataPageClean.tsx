// Mobile Vehicle Data Page (Clean)
// Optimized for mobile and portrait tablets; no emojis; ≤300 lines

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

import { useLanguage } from '@/contexts/LanguageContext';
import { MobileContainer, MobileStack } from '@/components/ui/mobile-index';
import { MobileHeader } from '@/components/layout/MobileHeader';

import { getAllBrands, getModelsForBrand } from '@/services/carBrandsService';

// Layout wrappers moved to styles
import { S } from './MobileVehicleDataPage.styles';
// Local aliases for styled components
const FieldGroup = S.FieldGroup;
const Label = S.Label;
const Select = S.Select;
const Input = S.Input;
const Hint = S.Hint;
const StickyFooter = S.StickyFooter;
const PrimaryButton = S.PrimaryButton;

// Types
interface VehicleForm {
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
}

export const MobileVehicleDataPageClean: React.FC = () => {
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
      setForm(prev => ({ ...prev, model: '' }));
    }
  };

  const canContinue = !!form.make && !!form.year;



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
    <S.PageWrapper>
      <MobileHeader />

      <S.ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <S.HeaderSection>
              <S.PageTitle>
                {t('sell.vehicleData.title')}
              </S.PageTitle>
              <S.PageSubtitle>
                {t('sell.vehicleData.subtitle')}
              </S.PageSubtitle>
            </S.HeaderSection>

            <S.Card>
              <S.Grid>
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
              </S.Grid>
            </S.Card>
          </MobileStack>
        </MobileContainer>
      </S.ContentWrapper>

      <StickyFooter>
        <PrimaryButton $enabled={canContinue} onClick={goNext} disabled={!canContinue}>
          {t('sell.start.continue')}
        </PrimaryButton>
      </StickyFooter>
    </S.PageWrapper>
  );
};

export default MobileVehicleDataPageClean;
