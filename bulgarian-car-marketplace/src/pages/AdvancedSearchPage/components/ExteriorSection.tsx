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
  SearchInput,
  SearchSelect,
  CheckboxGroup,
  CheckboxLabel,
  CustomCheckbox
} from '../styles';
import { SearchData } from '../types';

interface ExteriorSectionProps {
  searchData: SearchData;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckboxToggle: (field: string, value: string) => void;
  exteriorColors: string[];
}

export const ExteriorSection: React.FC<ExteriorSectionProps> = ({
  searchData,
  isOpen,
  onToggle,
  onChange,
  onCheckboxToggle,
  exteriorColors
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard>
      <SectionHeader isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.exterior')}</SectionTitle>
        <ExpandIcon isOpen={isOpen} />
      </SectionHeader>
      <SectionContent isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.exteriorColor')}</label>
              <SearchSelect name="exteriorColor" value={searchData.exteriorColor} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {exteriorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.trailerCoupling')}</label>
              <SearchSelect name="trailerCoupling" value={searchData.trailerCoupling} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.trailerLoadBraked')}</label>
              <SearchInput
                type="number"
                name="trailerLoadBraked"
                value={searchData.trailerLoadBraked}
                onChange={onChange}
                placeholder={t('advancedSearch.kg')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.trailerLoadUnbraked')}</label>
              <SearchInput
                type="number"
                name="trailerLoadUnbraked"
                value={searchData.trailerLoadUnbraked}
                onChange={onChange}
                placeholder={t('advancedSearch.kg')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.noseWeight')}</label>
              <SearchInput
                type="number"
                name="noseWeight"
                value={searchData.noseWeight}
                onChange={onChange}
                placeholder={t('advancedSearch.kg')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.parkingSensors')}</label>
              <CheckboxGroup>
                {[
                  t('advancedSearch.frontParkingSensors'),
                  t('advancedSearch.rearParkingSensors'),
                  t('advancedSearch.frontAndRearParkingSensors'),
                  t('advancedSearch.cameraParkingSensors'),
                  t('advancedSearch.selfParkingSensors'),
                  t('advancedSearch.parkAssistParkingSensors')
                ].map(sensor => (
                  <CheckboxLabel key={sensor}>
                    <input
                      type="checkbox"
                      checked={searchData.parkingSensors.includes(sensor)}
                      onChange={() => onCheckboxToggle('parkingSensors', sensor)}
                    />
                    <CustomCheckbox checked={searchData.parkingSensors.includes(sensor)} />
                    {sensor}
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.cruiseControl')}</label>
              <SearchSelect name="cruiseControl" value={searchData.cruiseControl} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>
        </SectionBody>
      </SectionContent>
    </SectionCard>
  );
};

