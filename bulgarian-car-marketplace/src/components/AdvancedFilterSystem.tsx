import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { AdvancedSearchParams, AvailableFilterOptions } from '../types/CarData';
import { SearchableSelect } from './SearchableSelect';
import { CheckboxGrid } from './CheckboxGrid';

interface AdvancedFilterSystemProps {
  searchParams: AdvancedSearchParams;
  onFiltersChange: (filters: AdvancedSearchParams) => void;
  availableData: AvailableFilterOptions;
  onSearch: () => void;
  isLoading?: boolean;
}

interface FilterSectionProps {
  title: string;
  titleBg: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
}

const AdvancedFilterSystem: React.FC<AdvancedFilterSystemProps> = ({
  searchParams,
  onFiltersChange,
  availableData,
  onSearch,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    price: true,
    location: false,
    technical: false,
    exterior: false,
    interior: false,
    offer: false,
    exclude: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key: keyof AdvancedSearchParams, value: any) => {
    onFiltersChange({
      ...searchParams,
      [key]: value
    });
  };

  const handleArrayFilter = (key: keyof AdvancedSearchParams, value: string, checked: boolean) => {
    const currentArray = searchParams[key] as string[] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);

    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    // Reset to initial state
    onFiltersChange({
      make: '',
      model: '',
      vehicleType: [],
      minSeats: '',
      maxSeats: '',
      doors: '',
      slidingDoor: '',
      condition: [],
      paymentType: [],
      minPrice: '',
      maxPrice: '',
      minFirstRegistration: '',
      maxFirstRegistration: '',
      minMileage: '',
      maxMileage: '',
      huValidUntil: '',
      owners: '',
      fullServiceHistory: false,
      roadworthy: false,
      newService: false,
      country: 'BG',
      city: '',
      zipCode: '',
      radius: '',
      deliveryAvailable: false,
      fuelType: [],
      minPower: '',
      maxPower: '',
      powerUnit: 'hp',
      minEngineSize: '',
      maxEngineSize: '',
      minFuelTank: '',
      maxFuelTank: '',
      minWeight: '',
      maxWeight: '',
      minCylinders: '',
      maxCylinders: '',
      driveType: '',
      transmission: [],
      maxFuelConsumption: '',
      emissionSticker: '',
      emissionClass: '',
      particulateFilter: false,
      exteriorColor: [],
      exteriorFinish: [],
      trailerCoupling: '',
      trailerAssist: false,
      minTrailerLoadBraked: '',
      minTrailerLoadUnbraked: '',
      noseWeight: '',
      parkingSensors: [],
      camera360: false,
      rearTrafficAlert: false,
      selfSteering: false,
      cruiseControl: [],
      exteriorFeatures: [],
      interiorColor: [],
      interiorMaterial: [],
      airbags: [],
      airConditioning: [],
      interiorFeatures: [],
      sellerType: [],
      minDealerRating: '',
      adOnlineSince: '',
      withPictures: false,
      vatReclaimable: false,
      warranty: false,
      nonSmoker: false,
      excludeVehicles: []
    });
  };

  return (
    <FilterSystemContainer>
      {/* Basic Data Section */}
      <FilterSection
        title="Basic Data"
        titleBg="Основни данни"
        expanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <FilterGrid columns={2}>
          <FilterGroup>
            <FilterLabel>{t('cars.search.make', 'Марка')}</FilterLabel>
            <SearchableSelect
              value={searchParams.make}
              onChange={(value) => updateFilter('make', value)}
              options={availableData.makes}
              placeholder={t('cars.search.allMakes', 'Всички марки')}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.model', 'Модел')}</FilterLabel>
            <SearchableSelect
              value={searchParams.model}
              onChange={(value) => updateFilter('model', value)}
              options={searchParams.make ? availableData.modelsByMake[searchParams.make] || [] : availableData.models}
              placeholder={t('cars.search.allModels', 'Всички модели')}
              disabled={!searchParams.make}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.vehicleType', 'Тип превозно средство')}</FilterLabel>
            <CheckboxGrid columns={2}>
              {availableData.vehicleTypes.map(type => (
                <CheckboxLabel key={type.value}>
                  <input
                    type="checkbox"
                    checked={searchParams.vehicleType.includes(type.value)}
                    onChange={(e) => handleArrayFilter('vehicleType', type.value, e.target.checked)}
                  />
                  {t(`cars.vehicleTypes.${type.value}`, type.labelBg)}
                </CheckboxLabel>
              ))}
            </CheckboxGrid>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.seats', 'Брой места')}</FilterLabel>
            <PriceRangeContainer>
              <PriceInput
                type="number"
                placeholder={t('cars.search.min', 'мин.')}
                value={searchParams.minSeats}
                onChange={(e) => updateFilter('minSeats', e.target.value)}
              />
              <PriceSeparator>-</PriceSeparator>
              <PriceInput
                type="number"
                placeholder={t('cars.search.max', 'макс.')}
                value={searchParams.maxSeats}
                onChange={(e) => updateFilter('maxSeats', e.target.value)}
              />
            </PriceRangeContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.doors', 'Брой врати')}</FilterLabel>
            <FilterSelect
              value={searchParams.doors}
              onChange={(e) => updateFilter('doors', e.target.value)}
            >
              <option value="">{t('cars.search.any', 'Без значение')}</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </FilterSelect>
          </FilterGroup>
        </FilterGrid>
      </FilterSection>

      {/* Price & Condition Section */}
      <FilterSection
        title="Price & Condition"
        titleBg="Цена и състояние"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <FilterGrid columns={2}>
          <FilterGroup>
            <FilterLabel>{t('cars.search.condition', 'Състояние')}</FilterLabel>
            <CheckboxGrid columns={1}>
              {availableData.conditions.map(condition => (
                <CheckboxLabel key={condition.value}>
                  <input
                    type="checkbox"
                    checked={searchParams.condition.includes(condition.value)}
                    onChange={(e) => handleArrayFilter('condition', condition.value, e.target.checked)}
                  />
                  {t(`cars.conditions.${condition.value}`, condition.labelBg)}
                </CheckboxLabel>
              ))}
            </CheckboxGrid>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.priceRange', 'Ценови диапазон (€)')}</FilterLabel>
            <PriceRangeContainer>
              <PriceInput
                type="number"
                placeholder={t('cars.search.min', 'мин.')}
                value={searchParams.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <PriceSeparator>-</PriceSeparator>
              <PriceInput
                type="number"
                placeholder={t('cars.search.max', 'макс.')}
                value={searchParams.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </PriceRangeContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.firstRegistration', 'Първа регистрация')}</FilterLabel>
            <PriceRangeContainer>
              <PriceInput
                type="number"
                placeholder={t('cars.search.from', 'от')}
                value={searchParams.minFirstRegistration}
                onChange={(e) => updateFilter('minFirstRegistration', e.target.value)}
              />
              <PriceSeparator>-</PriceSeparator>
              <PriceInput
                type="number"
                placeholder={t('cars.search.to', 'до')}
                value={searchParams.maxFirstRegistration}
                onChange={(e) => updateFilter('maxFirstRegistration', e.target.value)}
              />
            </PriceRangeContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.mileage', 'Пробег (km)')}</FilterLabel>
            <PriceRangeContainer>
              <PriceInput
                type="number"
                placeholder={t('cars.search.min', 'мин.')}
                value={searchParams.minMileage}
                onChange={(e) => updateFilter('minMileage', e.target.value)}
              />
              <PriceSeparator>-</PriceSeparator>
              <PriceInput
                type="number"
                placeholder={t('cars.search.max', 'макс.')}
                value={searchParams.maxMileage}
                onChange={(e) => updateFilter('maxMileage', e.target.value)}
              />
            </PriceRangeContainer>
          </FilterGroup>
        </FilterGrid>

        <FilterGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={searchParams.withPictures}
              onChange={(e) => updateFilter('withPictures', e.target.checked)}
            />
            {t('cars.search.withPictures', 'Само обяви със снимки')}
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={searchParams.vatReclaimable}
              onChange={(e) => updateFilter('vatReclaimable', e.target.checked)}
            />
            {t('cars.search.vatReclaimable', 'Възстановим ДДС')}
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={searchParams.warranty}
              onChange={(e) => updateFilter('warranty', e.target.checked)}
            />
            {t('cars.search.withWarranty', 'С гаранция')}
          </CheckboxLabel>
        </FilterGroup>
      </FilterSection>

      {/* Location Section */}
      <FilterSection
        title="Location"
        titleBg="Местоположение"
        expanded={expandedSections.location}
        onToggle={() => toggleSection('location')}
      >
        <FilterGrid columns={2}>
          <FilterGroup>
            <FilterLabel>{t('cars.search.city', 'Град')}</FilterLabel>
            <SearchableSelect
              value={searchParams.city}
              onChange={(value) => updateFilter('city', value)}
              options={availableData.cities}
              placeholder={t('cars.search.allCities', 'Всички градове')}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('cars.search.radius', 'Радиус (km)')}</FilterLabel>
            <FilterSelect
              value={searchParams.radius}
              onChange={(e) => updateFilter('radius', e.target.value)}
            >
              <option value="">{t('cars.search.any', 'Без значение')}</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="200">200 km</option>
            </FilterSelect>
          </FilterGroup>
        </FilterGrid>
      </FilterSection>

      {/* Technical Data Section */}
      <TechnicalDataSection
        searchParams={searchParams}
        onFiltersChange={onFiltersChange}
        expanded={expandedSections.technical}
        onToggle={() => toggleSection('technical')}
        availableData={availableData}
      />

      {/* Action Buttons */}
      <ActionButtonsContainer>
        <SearchButton onClick={onSearch} disabled={isLoading}>
          {isLoading ? t('cars.search.searching', 'Търсене...') : t('cars.search.showResults', 'Покажи резултатите')}
        </SearchButton>
        <ClearButton onClick={clearAllFilters}>
          {t('cars.search.clearFilters', 'Изчисти филтрите')}
        </ClearButton>
      </ActionButtonsContainer>
    </FilterSystemContainer>
  );
};

// Filter Section Component
const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  titleBg,
  children,
  expanded,
  onToggle,
  count
}) => {
  const { t } = useTranslation();

  return (
    <FilterSectionContainer>
      <SectionHeader onClick={onToggle}>
        <SectionTitle>
          {t(`cars.search.${title.toLowerCase().replace(' ', '')}`, titleBg)}
          {count !== undefined && count > 0 && (
            <SectionCount>{count}</SectionCount>
          )}
        </SectionTitle>
        <ExpandIcon expanded={expanded}>▼</ExpandIcon>
      </SectionHeader>

      {expanded && (
        <SectionContent>
          {children}
        </SectionContent>
      )}
    </FilterSectionContainer>
  );
};

// Technical Data Section Component
const TechnicalDataSection: React.FC<{
  searchParams: AdvancedSearchParams;
  onFiltersChange: (filters: AdvancedSearchParams) => void;
  expanded: boolean;
  onToggle: () => void;
  availableData: AvailableFilterOptions;
}> = ({ searchParams, onFiltersChange, expanded, onToggle, availableData }) => {
  const { t } = useTranslation();

  const updateFilter = (key: keyof AdvancedSearchParams, value: any) => {
    onFiltersChange({
      ...searchParams,
      [key]: value
    });
  };

  const handleArrayFilter = (key: keyof AdvancedSearchParams, value: string, checked: boolean) => {
    const currentArray = searchParams[key] as string[] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);

    updateFilter(key, newArray);
  };

  return (
    <FilterSection
      title="Technical Data"
      titleBg="Технически данни"
      expanded={expanded}
      onToggle={onToggle}
    >
      <FilterGrid columns={2}>
        <FilterGroup>
          <FilterLabel>{t('cars.search.fuelType', 'Тип гориво')}</FilterLabel>
          <CheckboxGrid columns={1}>
            {availableData.fuelTypes.map(fuel => (
              <CheckboxLabel key={fuel.value}>
                <input
                  type="checkbox"
                  checked={searchParams.fuelType.includes(fuel.value)}
                  onChange={(e) => handleArrayFilter('fuelType', fuel.value, e.target.checked)}
                />
                {t(`cars.fuelTypes.${fuel.value}`, fuel.labelBg)}
              </CheckboxLabel>
            ))}
          </CheckboxGrid>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('cars.search.transmission', 'Скоростна кутия')}</FilterLabel>
          <CheckboxGrid columns={1}>
            {availableData.transmissions.map(transmission => (
              <CheckboxLabel key={transmission.value}>
                <input
                  type="checkbox"
                  checked={searchParams.transmission.includes(transmission.value)}
                  onChange={(e) => handleArrayFilter('transmission', transmission.value, e.target.checked)}
                />
                {t(`cars.transmissions.${transmission.value}`, transmission.labelBg)}
              </CheckboxLabel>
            ))}
          </CheckboxGrid>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('cars.search.power', 'Мощност')}</FilterLabel>
          <PriceRangeContainer>
            <PriceInput
              type="number"
              placeholder={t('cars.search.min', 'мин.')}
              value={searchParams.minPower}
              onChange={(e) => updateFilter('minPower', e.target.value)}
            />
            <PriceSeparator>-</PriceSeparator>
            <PriceInput
              type="number"
              placeholder={t('cars.search.max', 'макс.')}
              value={searchParams.maxPower}
              onChange={(e) => updateFilter('maxPower', e.target.value)}
            />
            <FilterSelect
              value={searchParams.powerUnit}
              onChange={(e) => updateFilter('powerUnit', e.target.value)}
              style={{ width: 'auto', marginLeft: '8px' }}
            >
              <option value="hp">к.с.</option>
              <option value="kw">kW</option>
            </FilterSelect>
          </PriceRangeContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>{t('cars.search.engineSize', 'Работен обем (л)')}</FilterLabel>
          <PriceRangeContainer>
            <PriceInput
              type="number"
              step="0.1"
              placeholder={t('cars.search.min', 'мин.')}
              value={searchParams.minEngineSize}
              onChange={(e) => updateFilter('minEngineSize', e.target.value)}
            />
            <PriceSeparator>-</PriceSeparator>
            <PriceInput
              type="number"
              step="0.1"
              placeholder={t('cars.search.max', 'макс.')}
              value={searchParams.maxEngineSize}
              onChange={(e) => updateFilter('maxEngineSize', e.target.value)}
            />
          </PriceRangeContainer>
        </FilterGroup>
      </FilterGrid>
    </FilterSection>
  );
};

// Styled Components
const FilterSystemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FilterSectionContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[50]};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const SectionCount = styled.span`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
`;

const ExpandIcon = styled.span<{ expanded: boolean }>`
  transition: transform 0.2s ease-in-out;
  transform: ${({ expanded }) => expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  font-size: 12px;
`;

const SectionContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const FilterGrid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  label {
    display: block;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: white;
  font-size: ${({ theme }) => theme.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  input {
    width: auto;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PriceInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const PriceSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const SearchButton = styled.button<{ disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, disabled }) => disabled ? theme.colors.grey[300] : theme.colors.primary.main};
  color: ${({ theme, disabled }) => disabled ? theme.colors.text.secondary : theme.colors.primary.contrastText};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const ClearButton = styled(SearchButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};

  &:hover {
    background: ${({ theme }) => theme.colors.grey[50]};
  }
`;

export default AdvancedFilterSystem;