import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { AdvancedSearchParams } from '../types/CarData';

interface SearchFilterSectionProps {
  searchParams: AdvancedSearchParams;
  onParamChange: (key: keyof AdvancedSearchParams, value: any) => void;
  onSearch: () => void;
  onClear: () => void;
  isLoading: boolean;
}

const FilterContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FilterInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: ${({ theme }) => theme.colors.background.paper};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: ${({ theme }) => theme.colors.background.paper};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  input {
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const PrimaryButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrastText};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.grey[200]};
  }
`;

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchParams,
  onParamChange,
  onSearch,
  onClear,
  isLoading
}) => {
  const { t } = useTranslation();

  const handleInputChange = (key: keyof AdvancedSearchParams, value: string) => {
    onParamChange(key, value);
  };


  const handleArrayChange = (key: keyof AdvancedSearchParams, value: string, checked: boolean) => {
    const currentArray = searchParams[key] as string[];
    if (checked) {
      onParamChange(key, [...currentArray, value]);
    } else {
      onParamChange(key, currentArray.filter((item: any) => item !== value));
    }
  };

  return (
    <FilterContainer>
  {/* Basic Data Section */}
  <SectionTitle>{t('carSearch.basicData', 'Basic Data')}</SectionTitle>
      <FilterGrid>
        <FilterGroup>
          <FilterLabel>{t('carSearch.make', 'Make')}</FilterLabel>
          <FilterInput
            type="text"
            value={searchParams.make}
            onChange={(e) => handleInputChange('make', e.target.value)}
            placeholder="e.g. BMW, Mercedes"
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('carSearch.model', 'Model')}</FilterLabel>
          <FilterInput
            type="text"
            value={searchParams.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            placeholder="e.g. X5, C-Class"
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('carSearch.minPrice', 'Min Price (€)')}</FilterLabel>
          <FilterInput
            type="number"
            value={searchParams.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="0"
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('carSearch.maxPrice', 'Max Price (€)')}</FilterLabel>
          <FilterInput
            type="number"
            value={searchParams.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="100000"
          />
        </FilterGroup>
      </FilterGrid>

  {/* Type and Condition Section */}
  <SectionTitle>{t('carSearch.typeAndCondition', 'Type and Condition')}</SectionTitle>
      <FilterGrid>
        <FilterGroup>
          <FilterLabel>{t('carSearch.condition', 'Condition')}</FilterLabel>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.condition.includes('new')}
                onChange={(e) => handleArrayChange('condition', 'new', e.target.checked)}
              />
              {t('carSearch.new', 'New')}
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.condition.includes('used')}
                onChange={(e) => handleArrayChange('condition', 'used', e.target.checked)}
              />
              {t('carSearch.used', 'Used')}
            </CheckboxLabel>
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('carSearch.fuelType', 'Fuel Type')}</FilterLabel>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.fuelType.includes('petrol')}
                onChange={(e) => handleArrayChange('fuelType', 'petrol', e.target.checked)}
              />
              {t('carSearch.petrol', 'Petrol')}
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.fuelType.includes('diesel')}
                onChange={(e) => handleArrayChange('fuelType', 'diesel', e.target.checked)}
              />
              {t('carSearch.diesel', 'Diesel')}
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.fuelType.includes('electric')}
                onChange={(e) => handleArrayChange('fuelType', 'electric', e.target.checked)}
              />
              {t('carSearch.electric', 'Electric')}
            </CheckboxLabel>
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('carSearch.transmission', 'Transmission')}</FilterLabel>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.transmission.includes('manual')}
                onChange={(e) => handleArrayChange('transmission', 'manual', e.target.checked)}
              />
              {t('carSearch.manual', 'Manual')}
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={searchParams.transmission.includes('automatic')}
                onChange={(e) => handleArrayChange('transmission', 'automatic', e.target.checked)}
              />
              {t('carSearch.automatic', 'Automatic')}
            </CheckboxLabel>
          </CheckboxGroup>
        </FilterGroup>
      </FilterGrid>

  {/* Location Section */}
  <SectionTitle>{t('carSearch.location', 'Location')}</SectionTitle>
      <FilterGrid>
        <FilterGroup>
          <FilterLabel>{t('carSearch.locationData?.cityName', 'City')}</FilterLabel>
          <FilterInput
            type="text"
            value={searchParams.locationData?.cityName}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="e.g. Sofia, Plovdiv"
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('carSearch.radius', 'Radius (km)')}</FilterLabel>
          <FilterSelect
            value={searchParams.radius}
            onChange={(e) => handleInputChange('radius', e.target.value)}
          >
            <option value="">{t('carSearch.any', 'Any')}</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </FilterSelect>
        </FilterGroup>
      </FilterGrid>

      {/* Action Buttons */}
      <ActionButtons>
        <SecondaryButton onClick={onClear}>
          {t('carSearch.clearFilters', 'Clear Filters')}
        </SecondaryButton>
        <PrimaryButton onClick={onSearch} disabled={isLoading}>
          {isLoading ? t('carSearch.searching', 'Searching...') : t('carSearch.search', 'Search')}
        </PrimaryButton>
      </ActionButtons>
    </FilterContainer>
  );
};

export { SearchFilterSection };