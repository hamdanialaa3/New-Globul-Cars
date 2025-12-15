import React, { useEffect } from 'react';
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

  // Check if Bulgaria is selected (check both English and Bulgarian translations)
  const isBulgariaSelected = searchData.country === t('advancedSearch.bulgaria') || 
                             searchData.country === 'Bulgaria' || 
                             searchData.country === 'България' ||
                             searchData.country === '';

  // Clear city selection when country changes to non-Bulgaria
  useEffect(() => {
    if (!isBulgariaSelected && searchData.locationData?.cityName) {
      // Trigger onChange to clear city
      const event = {
        target: {
          name: 'city',
          value: '',
          type: 'select-one'
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  }, [searchData.country, isBulgariaSelected, searchData.locationData?.cityName, onChange]);

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
              <SearchSelect name="country" value={searchData.country || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            {/* Only show City dropdown when Bulgaria is selected or no country selected */}
            {isBulgariaSelected && (
              <FormGroup>
                <label>{t('advancedSearch.city') || 'City'}</label>
                <SearchSelect 
                  name="city" 
                  value={searchData.city || ''} 
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'city',
                        value: e.target.value,
                        type: 'select-one'
                      }
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onChange(event);
                  }}
                >
                  <option value="">{t('advancedSearch.all')}</option>
                  {bulgarianCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </SearchSelect>
              </FormGroup>
            )}

            <FormGroup>
              <label>{t('advancedSearch.radius')}</label>
              <SearchSelect name="radius" value={searchData.radius || ''} onChange={onChange}>
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
                  checked={searchData.deliveryOffers || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'deliveryOffers',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.deliveryOffers || false} />
                {t('advancedSearch.onlyDeliveryOffers')}
              </CheckboxLabel>
            </FormGroup>
          </FormGrid>
        </SectionBody>
      </SectionContent>
    </SectionCard>
  );
};

