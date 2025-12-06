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
              <SearchSelect name="interiorColor" value={searchData.interiorColor || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {interiorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.interiorMaterial')}</label>
              <SearchSelect name="interiorMaterial" value={searchData.interiorMaterial || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {interiorMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.airbags')}</label>
              <SearchSelect name="airbags" value={searchData.airbags || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="2">{t('advancedSearch.airbags2')}</option>
                <option value="4">{t('advancedSearch.airbags4')}</option>
                <option value="6">{t('advancedSearch.airbags6')}</option>
                <option value="8+">{t('advancedSearch.airbags8Plus')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.airConditioning')}</label>
              <SearchSelect name="airConditioning" value={searchData.airConditioning || ''} onChange={onChange}>
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
                  { key: 'abs', label: t('advancedSearch.absExtras') },
                  { key: 'edc', label: t('advancedSearch.edcExtras') },
                  { key: 'navigation', label: t('advancedSearch.navigationExtras') },
                  { key: 'electricWindows', label: t('advancedSearch.electricWindowsExtras') },
                  { key: 'electricSeats', label: t('advancedSearch.electricSeatsExtras') },
                  { key: 'airConditioning', label: t('advancedSearch.airConditioningExtras') },
                  { key: 'cruiseControl', label: t('advancedSearch.cruiseControlExtras') },
                  { key: 'alloyWheels', label: t('advancedSearch.alloyWheelsExtras') },
                  { key: 'xenonHeadlights', label: t('advancedSearch.xenonHeadlightsExtras') },
                  { key: 'panoramaRoof', label: t('advancedSearch.panoramaRoofExtras') },
                  { key: 'bluetooth', label: t('advancedSearch.bluetoothExtras') },
                  { key: 'heatedSeats', label: t('advancedSearch.heatedSeatsExtras') }
                ].map(extra => (
                  <CheckboxLabel key={extra.key}>
                    <input
                      type="checkbox"
                      checked={searchData.extras.includes(extra.key)}
                      onChange={() => onCheckboxToggle('extras', extra.key)}
                    />
                    <CustomCheckbox checked={searchData.extras.includes(extra.key)} />
                    {extra.label}
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

