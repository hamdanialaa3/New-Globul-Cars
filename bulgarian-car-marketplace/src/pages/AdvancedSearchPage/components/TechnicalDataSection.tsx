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
  RangeGroup
} from '../styles';
import { SearchData } from '../types';

interface TechnicalDataSectionProps {
  searchData: SearchData;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  fuelTypes: string[];
}

export const TechnicalDataSection: React.FC<TechnicalDataSectionProps> = ({
  searchData,
  isOpen,
  onToggle,
  onChange,
  fuelTypes
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard>
      <SectionHeader isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.technicalData')}</SectionTitle>
        <ExpandIcon isOpen={isOpen} />
      </SectionHeader>
      <SectionContent isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.fuelType')}</label>
              <SearchSelect name="fuelType" value={searchData.fuelType} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.power')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="powerFrom"
                  value={searchData.powerFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span>kW</span>
                <SearchInput
                  type="number"
                  name="powerTo"
                  value={searchData.powerTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.cubicCapacity')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="cubicCapacityFrom"
                  value={searchData.cubicCapacityFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span>cm³</span>
                <SearchInput
                  type="number"
                  name="cubicCapacityTo"
                  value={searchData.cubicCapacityTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.fuelTankVolume')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="fuelTankVolumeFrom"
                  value={searchData.fuelTankVolumeFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span>l</span>
                <SearchInput
                  type="number"
                  name="fuelTankVolumeTo"
                  value={searchData.fuelTankVolumeTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.weight')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="weightFrom"
                  value={searchData.weightFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span>kg</span>
                <SearchInput
                  type="number"
                  name="weightTo"
                  value={searchData.weightTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.cylinders')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="cylindersFrom"
                  value={searchData.cylindersFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="cylindersTo"
                  value={searchData.cylindersTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.driveType')}</label>
              <SearchSelect name="driveType" value={searchData.driveType} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="front">{t('advancedSearch.frontWheelDrive')}</option>
                <option value="rear">{t('advancedSearch.rearWheelDrive')}</option>
                <option value="all">{t('advancedSearch.allWheelDrive')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.transmission')}</label>
              <SearchSelect name="transmission" value={searchData.transmission} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="manual">{t('advancedSearch.manualTransmission')}</option>
                <option value="automatic">{t('advancedSearch.automaticTransmission')}</option>
                <option value="semi-automatic">{t('advancedSearch.semiAutomaticTransmission')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.fuelConsumption')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="fuelConsumptionUpTo"
                  value={searchData.fuelConsumptionUpTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.upTo')}
                />
                <span>l/100km</span>
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.emissionSticker')}</label>
              <SearchSelect name="emissionSticker" value={searchData.emissionSticker} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="green">{t('advancedSearch.greenSticker')}</option>
                <option value="yellow">{t('advancedSearch.yellowSticker')}</option>
                <option value="red">{t('advancedSearch.redSticker')}</option>
                <option value="none">{t('advancedSearch.noSticker')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.emissionClass')}</label>
              <SearchSelect name="emissionClass" value={searchData.emissionClass} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="euro1">Euro 1</option>
                <option value="euro2">Euro 2</option>
                <option value="euro3">Euro 3</option>
                <option value="euro4">Euro 4</option>
                <option value="euro5">Euro 5</option>
                <option value="euro6">Euro 6</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.particulateFilter')}</label>
              <SearchSelect name="particulateFilter" value={searchData.particulateFilter} onChange={onChange}>
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

