import React from 'react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import {
  SectionCard,
  SectionHeader,
  SectionContent,
  SectionBody,
  SectionTitle,
  ExpandIcon,
  FormGrid,
  FormGroup,
  SearchSelect,
  CheckboxLabel,
  CustomCheckbox
} from '../styles';
import { SearchData } from '../types';

interface LocationSectionProps {
  searchData: SearchData;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  countries: string[];
  bulgarianCities: string[];
  radiusOptions: string[];
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  searchData,
  isOpen,
  onToggle,
  onChange,
  countries,
  bulgarianCities,
  radiusOptions
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard>
      <SectionHeader $isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.location')}</SectionTitle>
        <ExpandIcon $isOpen={isOpen} />
      </SectionHeader>
      <SectionContent $isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.country')}</label>
              <SearchSelect name="country" value={searchData.country} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.city')}</label>
              <SearchSelect name="city" value={searchData.city} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {bulgarianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.radius')}</label>
              <SearchSelect name="radius" value={searchData.radius} onChange={onChange}>
                {radiusOptions.map(radius => (
                  <option key={radius} value={radius}>{radius}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.deliveryOffers')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="deliveryOffers"
                  checked={searchData.deliveryOffers}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.deliveryOffers} />
                {t('advancedSearch.onlyDeliveryOffers')}
              </CheckboxLabel>
            </FormGroup>
          </FormGrid>
        </SectionBody>
      </SectionContent>
    </SectionCard>
  );
};

