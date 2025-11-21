// Mobile Vehicle Data Page (Clean)
// Optimized for mobile and portrait tablets; no emojis; ≤300 lines

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { MobileContainer, MobileStack } from '@globul-cars/ui/componentsui/mobile-index';
import { MobileHeader } from '@globul-cars/ui/componentslayout/MobileHeader';

import { CAR_YEARS } from '@globul-cars/core/constants/dropdown-options';

import { SellProgressBar } from '@globul-cars/ui/components/SellWorkflow';
import { useProfileType } from '@globul-cars/core/contexts/ProfileTypeContext';
import SellWorkflowStepStateService from '@globul-cars/services/sellWorkflowStepState';
import { useVehicleDataForm } from './VehicleData/useVehicleDataForm';

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

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

export const MobileVehicleDataPageClean: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const { profileType } = useProfileType();

  const {
    formData,
    availableBrands,
    availableModels,
    handleInputChange,
    canContinue,
    buildURLSearchParams
  } = useVehicleDataForm();

  useEffect(() => {
    SellWorkflowStepStateService.markPending('vehicle-data');
  }, []);

  const brands = useMemo(() => availableBrands, [availableBrands]);
  const models = useMemo(() => availableModels, [availableModels]);

  const fuelTypes = useMemo(() => [
    'Бензин', 'Дизел', 'Хибрид', 'Електрически', 'Газ (LPG)', 'Газ (CNG)'
  ], []);
  const transmissions = useMemo(() => [
    'Ръчна', 'Автоматична', 'Полуавтоматична', 'CVT', 'DSG'
  ], []);

  useEffect(() => {
    if (formData.make && formData.year) {
      SellWorkflowStepStateService.markCompleted('vehicle-data');
    } else {
      SellWorkflowStepStateService.markPending('vehicle-data');
    }
  }, [formData.make, formData.year]);



  const goNext = () => {
    if (!canContinue) return;
    const params = buildURLSearchParams();
    params.set('vt', vehicleType);
    const st = searchParams.get('st') || profileType;
    if (st) params.set('st', st);
    navigate(`/sell/inserat/${vehicleType}/equipment?${params.toString()}`);
  };

  return (
    <S.PageWrapper>
      <MobileHeader />
      <ProgressWrapper>
        <SellProgressBar currentStep="vehicle-data" />
      </ProgressWrapper>

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
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    title={t('sell.vehicleData.make')}
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
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      disabled={!formData.make}
                      title={t('sell.vehicleData.model')}
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
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      disabled={!formData.make}
                    />
                  )}
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="vehicle-year" $required>
                    {t('sell.vehicleData.year')}
                  </Label>
                  <Select
                    id="vehicle-year"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    title={t('sell.vehicleData.year')}
                  >
                    <option value="">{t('sell.select')}</option>
                    {CAR_YEARS.map(option => (
                      <option key={option.value} value={option.value}>
                        {language === 'bg' ? option.label : option.labelEn || option.label}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="mileage">
                    {t('sell.vehicleData.mileage')}
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="45000"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
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
                    value={formData.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    title={t('sell.vehicleData.fuel')}
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
                    value={formData.transmission}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                    title={t('sell.vehicleData.transmission')}
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
