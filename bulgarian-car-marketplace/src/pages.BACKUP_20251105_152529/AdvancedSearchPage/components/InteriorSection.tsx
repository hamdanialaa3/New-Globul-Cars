import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
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
  CheckboxGroup,
  CheckboxLabel,
  CustomCheckbox
} from '../styles';
import { SearchData } from '../types';

interface InteriorSectionProps {
  searchData: SearchData;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckboxToggle: (field: string, value: string) => void;
  interiorColors: string[];
  interiorMaterials: string[];
}

export const InteriorSection: React.FC<InteriorSectionProps> = ({
  searchData,
  isOpen,
  onToggle,
  onChange,
  onCheckboxToggle,
  interiorColors,
  interiorMaterials
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard>
      <SectionHeader $isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.interior')}</SectionTitle>
        <ExpandIcon $isOpen={isOpen} />
      </SectionHeader>
      <SectionContent $isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.interiorColor')}</label>
              <SearchSelect name="interiorColor" value={searchData.interiorColor} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {interiorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.interiorMaterial')}</label>
              <SearchSelect name="interiorMaterial" value={searchData.interiorMaterial} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {interiorMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.airbags')}</label>
              <SearchSelect name="airbags" value={searchData.airbags} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="2">{t('advancedSearch.airbags2')}</option>
                <option value="4">{t('advancedSearch.airbags4')}</option>
                <option value="6">{t('advancedSearch.airbags6')}</option>
                <option value="8+">{t('advancedSearch.airbags8Plus')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.airConditioning')}</label>
              <SearchSelect name="airConditioning" value={searchData.airConditioning} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="manual">{t('advancedSearch.manualAirConditioning')}</option>
                <option value="automatic">{t('advancedSearch.automaticAirConditioning')}</option>
                <option value="no">{t('advancedSearch.noAirConditioning')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.extras')}</label>
              <CheckboxGroup>
                {[
                  t('advancedSearch.absExtras'),
                  t('advancedSearch.edcExtras'),
                  t('advancedSearch.navigationExtras'),
                  t('advancedSearch.electricWindowsExtras'),
                  t('advancedSearch.electricSeatsExtras'),
                  t('advancedSearch.airConditioningExtras'),
                  t('advancedSearch.cruiseControlExtras'),
                  t('advancedSearch.alloyWheelsExtras'),
                  t('advancedSearch.xenonHeadlightsExtras'),
                  t('advancedSearch.panoramaRoofExtras'),
                  t('advancedSearch.bluetoothExtras'),
                  t('advancedSearch.heatedSeatsExtras')
                ].map(extra => (
                  <CheckboxLabel key={extra}>
                    <input
                      type="checkbox"
                      checked={searchData.extras.includes(extra)}
                      onChange={() => onCheckboxToggle('extras', extra)}
                    />
                    <CustomCheckbox checked={searchData.extras.includes(extra)} />
                    {extra}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </FormGroup>
          </FormGrid>
        </SectionBody>
      </SectionContent>
    </SectionCard>
  );
};

