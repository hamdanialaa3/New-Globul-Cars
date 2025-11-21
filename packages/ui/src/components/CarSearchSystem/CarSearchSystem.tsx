// CarSearchSystem/CarSearchSystem.tsx
// (Comment removed - was in Arabic)

import React from 'react';
import { useTranslation } from '@globul-cars/coreuseTranslation';
import { useCarSearch } from '@globul-cars/coreuseCarSearch';
import { CarSearchSystemProps } from './types';
import {
  SearchContainer,
  SearchGroup,
  SearchLabel,
  SearchSelect,
  SearchButton
} from './styles';

const CarSearchSystem: React.FC<CarSearchSystemProps> = ({
  onSearch,
  initialFilters = {}
}) => {
  const { t } = useTranslation();

  const {
    filters,
    makes,
    models,
    generations,
    bodyStyles,
    updateFilter,
    searchCars
  } = useCarSearch(initialFilters);

  const handleSearch = () => {
    onSearch(filters);
    searchCars();
  };

  return (
    <SearchContainer>
      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.make')}</SearchLabel>
        <SearchSelect
          value={filters.make}
          onChange={(e) => updateFilter('make', e.target.value)}
        >
          <option value="">{t('detailedSearch.basicData.anyMake')}</option>
          {makes.map(make => (
            <option key={make.value} value={make.value}>
              {make.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.model')}</SearchLabel>
        <SearchSelect
          value={filters.model}
          onChange={(e) => updateFilter('model', e.target.value)}
          disabled={!filters.make}
        >
          <option value="">{t('detailedSearch.basicData.anyModel')}</option>
          {models.map(model => (
            <option key={model.value} value={model.value}>
              {model.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.generation')}</SearchLabel>
        <SearchSelect
          value={filters.generation}
          onChange={(e) => updateFilter('generation', e.target.value)}
          disabled={!filters.model}
        >
          <option value="">{t('detailedSearch.basicData.anyGeneration')}</option>
          {generations.map(gen => (
            <option key={gen.value} value={gen.value}>
              {gen.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.bodyStyle')}</SearchLabel>
        <SearchSelect
          value={filters.bodyStyle}
          onChange={(e) => updateFilter('bodyStyle', e.target.value)}
          disabled={!filters.generation}
        >
          <option value="">{t('detailedSearch.basicData.anyBodyStyle')}</option>
          {bodyStyles.map(style => (
            <option key={style.value} value={style.value}>
              {style.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.fuelType')}</SearchLabel>
        <SearchSelect
          value={filters.fuelType}
          onChange={(e) => updateFilter('fuelType', e.target.value)}
        >
          <option value="">{t('cars.search.allFuelTypes')}</option>
          <option value="petrol">{t('cars.fuelTypes.petrol')}</option>
          <option value="diesel">{t('cars.fuelTypes.diesel')}</option>
          <option value="gas">{t('cars.fuelTypes.gas')}</option>
          <option value="lpg">{t('cars.fuelTypes.lpg')}</option>
          <option value="cng">{t('cars.fuelTypes.cng')}</option>
          <option value="electric">{t('cars.fuelTypes.electric')}</option>
          <option value="hybrid">{t('cars.fuelTypes.hybrid')}</option>
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.registeredInBulgaria')}</SearchLabel>
        <SearchSelect
          value={filters.registeredInBulgaria}
          onChange={(e) => updateFilter('registeredInBulgaria', e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          <option value="yes">{t('common.yes')}</option>
          <option value="no">{t('common.no')}</option>
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.environmentalTaxPaid')}</SearchLabel>
        <SearchSelect
          value={filters.environmentalTaxPaid}
          onChange={(e) => updateFilter('environmentalTaxPaid', e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          <option value="yes">{t('common.yes')}</option>
          <option value="no">{t('common.no')}</option>
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.technicalInspectionDate')}</SearchLabel>
        <SearchSelect
          value={filters.technicalInspectionDate}
          onChange={(e) => updateFilter('technicalInspectionDate', e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          <option value="valid">{t('common.valid')}</option>
          <option value="expired">{t('common.expired')}</option>
          <option value="expiring_soon">{t('common.expiringSoon')}</option>
        </SearchSelect>
      </SearchGroup>

      <SearchGroup style={{ alignSelf: 'flex-end' }}>
        <SearchButton onClick={handleSearch}>
          {t('detailedSearch.search')}
        </SearchButton>
      </SearchGroup>
    </SearchContainer>
  );
};

export default CarSearchSystem;