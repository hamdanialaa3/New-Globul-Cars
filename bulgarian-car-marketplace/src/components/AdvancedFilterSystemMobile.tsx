// src/components/AdvancedFilterSystemMobile.tsx
// Advanced Filter System inspired by mobile.de

import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Search, Save, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Styled Components - Mobile.de inspired design
const FilterContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
  margin: ${({ theme }) => theme.spacing.lg} 0;
  overflow: hidden;
`;

const FilterHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrastText};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
`;

const FilterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FilterButton = styled.button<{ variant: 'primary' | 'secondary' | 'success' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'success' ? theme.colors.success.main : 
    theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'success' ? theme.colors.success.main : 
    'transparent'
  };
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.contrastText : 
    variant === 'success' ? theme.colors.success.contrastText : 
    theme.colors.text.primary
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.primary.dark : 
      variant === 'success' ? theme.colors.success.dark : 
      theme.colors.grey[100]
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FilterSection = styled.article<{ isExpanded: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  background: ${({ theme }) => theme.colors.background.paper};
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SectionContent = styled.div<{ isExpanded: boolean }>`
  padding: ${({ theme }) => theme.spacing.lg};
  display: ${({ isExpanded }) => isExpanded ? 'block' : 'none'};
  background: ${({ theme }) => theme.colors.background.paper};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FilterInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light + '20'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light + '20'};
  }
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RangeInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light + '20'};
  }
`;

const RangeSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[50]};
  }
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary.main};
  cursor: pointer;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ColorItem = styled.label<{ color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.light};
    background: ${({ theme }) => theme.colors.primary.light + '10'};
  }

  input:checked + & {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.light + '20'};
  }
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ColorLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

// Interface definitions
interface FilterValue {
  [key: string]: any;
}

interface AdvancedFilterSystemMobileProps {
  onSearch: (filters: FilterValue) => void;
  onReset: () => void;
  onSaveSearch?: (filters: FilterValue) => void;
  loading?: boolean;
}

const AdvancedFilterSystemMobile: React.FC<AdvancedFilterSystemMobileProps> = ({
  onSearch,
  onReset,
  onSaveSearch,
  loading = false
}) => {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basicData']));
  const [filters, setFilters] = useState<FilterValue>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const handleSaveSearch = () => {
    if (onSaveSearch) {
      onSaveSearch(filters);
    }
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.has(sectionId);

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>{t('advancedSearch.title')}</FilterTitle>
        <FilterActions>
          <FilterButton variant="secondary" onClick={handleReset} disabled={loading}>
            <RotateCcw size={16} />
            {t('advancedSearch.reset')}
          </FilterButton>
          {onSaveSearch && (
            <FilterButton variant="success" onClick={handleSaveSearch} disabled={loading}>
              <Save size={16} />
              {t('advancedSearch.saveSearch')}
            </FilterButton>
          )}
          <FilterButton variant="primary" onClick={handleSearch} disabled={loading}>
            <Search size={16} />
            {loading ? t('advancedSearch.searching') : t('advancedSearch.search')}
          </FilterButton>
        </FilterActions>
      </FilterHeader>

      <FilterSections>
        {/* Basic Data Section */}
        <FilterSection isExpanded={isSectionExpanded('basicData')}>
          <SectionHeader onClick={() => toggleSection('basicData')}>
            <SectionTitle>{t('advancedSearch.basicData')}</SectionTitle>
            {isSectionExpanded('basicData') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </SectionHeader>
          <SectionContent isExpanded={isSectionExpanded('basicData')}>
            <FilterGrid>
              <FilterGroup>
                <FilterLabel>{t('advancedSearch.make')}</FilterLabel>
                <FilterSelect
                  value={filters.make || 'any'}
                  onChange={(e) => handleFilterChange('make', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <optgroup label={t('advancedSearch.german')}>
                    <option value="bmw">BMW</option>
                    <option value="mercedes">Mercedes-Benz</option>
                    <option value="audi">Audi</option>
                    <option value="volkswagen">Volkswagen</option>
                    <option value="porsche">Porsche</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.japanese')}>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="nissan">Nissan</option>
                    <option value="mazda">Mazda</option>
                    <option value="subaru">Subaru</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.american')}>
                    <option value="ford">Ford</option>
                    <option value="chevrolet">Chevrolet</option>
                    <option value="dodge">Dodge</option>
                    <option value="jeep">Jeep</option>
                    <option value="tesla">Tesla</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.korean')}>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">Kia</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.french')}>
                    <option value="peugeot">Peugeot</option>
                    <option value="renault">Renault</option>
                    <option value="citroen">Citroën</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.italian')}>
                    <option value="fiat">Fiat</option>
                    <option value="alfa-romeo">Alfa Romeo</option>
                    <option value="ferrari">Ferrari</option>
                    <option value="lamborghini">Lamborghini</option>
                    <option value="maserati">Maserati</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.swedish')}>
                    <option value="volvo">Volvo</option>
                    <option value="saab">Saab</option>
                    <option value="polestar">Polestar</option>
                  </optgroup>
                  <optgroup label={t('advancedSearch.other')}>
                    <option value="skoda">Škoda</option>
                    <option value="seat">SEAT</option>
                  </optgroup>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.model')}</FilterLabel>
                <FilterInput
                  type="text"
                  placeholder={t('advancedSearch.modelPlaceholder')}
                  value={filters.model || ''}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.vehicleType')}</FilterLabel>
                <FilterSelect
                  value={filters.vehicleType || 'any'}
                  onChange={(e) => handleFilterChange('vehicleType', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="cabriolet">{t('advancedSearch.cabriolet')}</option>
                  <option value="estate">{t('advancedSearch.estate')}</option>
                  <option value="suv">{t('advancedSearch.suv')}</option>
                  <option value="saloon">{t('advancedSearch.saloon')}</option>
                  <option value="small">{t('advancedSearch.small')}</option>
                  <option value="sports">{t('advancedSearch.sports')}</option>
                  <option value="van">{t('advancedSearch.van')}</option>
                  <option value="other">{t('advancedSearch.other')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.numberOfSeats')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.seatsFrom || ''}
                    onChange={(e) => handleFilterChange('seatsFrom', e.target.value)}
                  />
                  <RangeSeparator>to</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.seatsTo || ''}
                    onChange={(e) => handleFilterChange('seatsTo', e.target.value)}
                  />
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.numberOfDoors')}</FilterLabel>
                <FilterSelect
                  value={filters.doors || 'any'}
                  onChange={(e) => handleFilterChange('doors', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6+">6+</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.slidingDoor')}</FilterLabel>
                <FilterSelect
                  value={filters.slidingDoor || 'any'}
                  onChange={(e) => handleFilterChange('slidingDoor', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="yes">{t('advancedSearch.yes')}</option>
                  <option value="no">{t('advancedSearch.no')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.typeAndCondition')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'new', label: t('advancedSearch.new') },
                    { value: 'used', label: t('advancedSearch.used') },
                    { value: 'pre-registration', label: t('advancedSearch.preRegistration') },
                    { value: 'employee', label: t('advancedSearch.employeeCar', 'Employee\'s car') },
                    { value: 'classic', label: t('advancedSearch.classicVehicle') },
                    { value: 'demonstration', label: t('advancedSearch.demonstrationVehicle') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.typeCondition?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.typeCondition || [];
                          if (e.target.checked) {
                            handleFilterChange('typeCondition', [...current, option.value]);
                          } else {
                            handleFilterChange('typeCondition', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.paymentType')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'buy', label: t('advancedSearch.buy') },
                    { value: 'leasing', label: t('advancedSearch.leasing') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.paymentType?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.paymentType || [];
                          if (e.target.checked) {
                            handleFilterChange('paymentType', [...current, option.value]);
                          } else {
                            handleFilterChange('paymentType', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.price')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.priceFrom || ''}
                    onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                  />
                  <RangeSeparator>€</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.priceTo || ''}
                    onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                  />
                  <RangeSeparator>€</RangeSeparator>
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.firstRegistrationDate')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.registrationFrom || ''}
                    onChange={(e) => handleFilterChange('registrationFrom', e.target.value)}
                  />
                  <RangeSeparator>to</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.registrationTo || ''}
                    onChange={(e) => handleFilterChange('registrationTo', e.target.value)}
                  />
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.mileage')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.mileageFrom || ''}
                    onChange={(e) => handleFilterChange('mileageFrom', e.target.value)}
                  />
                  <RangeSeparator>km</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.mileageTo || ''}
                    onChange={(e) => handleFilterChange('mileageTo', e.target.value)}
                  />
                  <RangeSeparator>km</RangeSeparator>
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.huValid')}</FilterLabel>
                <FilterSelect
                  value={filters.huValid || 'any'}
                  onChange={(e) => handleFilterChange('huValid', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="yes">{t('advancedSearch.yes')}</option>
                  <option value="no">{t('advancedSearch.no')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.numberOfOwners')}</FilterLabel>
                <FilterSelect
                  value={filters.owners || 'any'}
                  onChange={(e) => handleFilterChange('owners', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.fullServiceHistory')}</FilterLabel>
                <FilterSelect
                  value={filters.serviceHistory || 'any'}
                  onChange={(e) => handleFilterChange('serviceHistory', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="yes">{t('advancedSearch.yes')}</option>
                  <option value="no">{t('advancedSearch.no')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.roadworthy')}</FilterLabel>
                <FilterSelect
                  value={filters.roadworthy || 'any'}
                  onChange={(e) => handleFilterChange('roadworthy', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="yes">{t('advancedSearch.yes')}</option>
                  <option value="no">{t('advancedSearch.no')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.country')}</FilterLabel>
                <FilterSelect
                  value={filters.country || 'any'}
                  onChange={(e) => handleFilterChange('country', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="bulgaria">{t('advancedSearch.bulgaria')}</option>
                  <option value="germany">{t('advancedSearch.germany')}</option>
                  <option value="france">{t('advancedSearch.france')}</option>
                  <option value="italy">{t('advancedSearch.italy')}</option>
                  <option value="spain">{t('advancedSearch.spain')}</option>
                  <option value="other">{t('advancedSearch.other')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.cityZipCode')}</FilterLabel>
                <FilterInput
                  type="text"
                  placeholder={t('advancedSearch.any')}
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.radius')}</FilterLabel>
                <FilterSelect
                  value={filters.radius || '10'}
                  onChange={(e) => handleFilterChange('radius', e.target.value)}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                  <option value="200">200 km</option>
                  <option value="500">500 km</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <CheckboxItem>
                  <CheckboxInput
                    type="checkbox"
                    checked={filters.delivery || false}
                    onChange={(e) => handleFilterChange('delivery', e.target.checked)}
                  />
                  {t('advancedSearch.additionalOffersWithDelivery')}
                </CheckboxItem>
              </FilterGroup>
            </FilterGrid>
          </SectionContent>
        </FilterSection>

        {/* Technical Data Section */}
        <FilterSection isExpanded={isSectionExpanded('technicalData')}>
          <SectionHeader onClick={() => toggleSection('technicalData')}>
            <SectionTitle>{t('advancedSearch.technicalData')}</SectionTitle>
            {isSectionExpanded('technicalData') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </SectionHeader>
          <SectionContent isExpanded={isSectionExpanded('technicalData')}>
            <FilterGrid>
              <FilterGroup>
                <FilterLabel>{t('advancedSearch.fuelType')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'petrol', label: t('advancedSearch.petrol') },
                    { value: 'diesel', label: t('advancedSearch.diesel') },
                    { value: 'electric', label: t('advancedSearch.electric') },
                    { value: 'ethanol', label: t('advancedSearch.ethanol') },
                    { value: 'hybrid-diesel', label: t('advancedSearch.hybridDiesel') },
                    { value: 'hybrid-petrol', label: t('advancedSearch.hybridPetrol') },
                    { value: 'hydrogen', label: t('advancedSearch.hydrogen') },
                    { value: 'lpg', label: t('advancedSearch.lpg') },
                    { value: 'natural-gas', label: t('advancedSearch.naturalGas') },
                    { value: 'other', label: t('advancedSearch.other') },
                    { value: 'plug-in-hybrid', label: t('advancedSearch.plugInHybrid') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.fuelType?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.fuelType || [];
                          if (e.target.checked) {
                            handleFilterChange('fuelType', [...current, option.value]);
                          } else {
                            handleFilterChange('fuelType', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.power')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.powerFrom || ''}
                    onChange={(e) => handleFilterChange('powerFrom', e.target.value)}
                  />
                  <RangeSeparator>hp</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.powerTo || ''}
                    onChange={(e) => handleFilterChange('powerTo', e.target.value)}
                  />
                  <RangeSeparator>hp</RangeSeparator>
                </RangeContainer>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <CheckboxItem>
                    <CheckboxInput
                      type="checkbox"
                      checked={filters.powerUnit === 'kW' || false}
                      onChange={(e) => handleFilterChange('powerUnit', e.target.checked ? 'kW' : 'hp')}
                    />
                    {t('advancedSearch.kW')}
                  </CheckboxItem>
                </div>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.cubicCapacity')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.cubicCapacityFrom || ''}
                    onChange={(e) => handleFilterChange('cubicCapacityFrom', e.target.value)}
                  />
                  <RangeSeparator>ccm</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.cubicCapacityTo || ''}
                    onChange={(e) => handleFilterChange('cubicCapacityTo', e.target.value)}
                  />
                  <RangeSeparator>ccm</RangeSeparator>
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.fuelTankVolume')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.tankVolumeFrom || ''}
                    onChange={(e) => handleFilterChange('tankVolumeFrom', e.target.value)}
                  />
                  <RangeSeparator>l</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.tankVolumeTo || ''}
                    onChange={(e) => handleFilterChange('tankVolumeTo', e.target.value)}
                  />
                  <RangeSeparator>l</RangeSeparator>
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.weight')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.weightFrom || ''}
                    onChange={(e) => handleFilterChange('weightFrom', e.target.value)}
                  />
                  <RangeSeparator>kg</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.weightTo || ''}
                    onChange={(e) => handleFilterChange('weightTo', e.target.value)}
                  />
                  <RangeSeparator>kg</RangeSeparator>
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.cylinder')}</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.from')}
                    value={filters.cylinderFrom || ''}
                    onChange={(e) => handleFilterChange('cylinderFrom', e.target.value)}
                  />
                  <RangeSeparator>to</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder={t('advancedSearch.to')}
                    value={filters.cylinderTo || ''}
                    onChange={(e) => handleFilterChange('cylinderTo', e.target.value)}
                  />
                </RangeContainer>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.driveType')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'all-wheel', label: t('advancedSearch.allWheelDrive') },
                    { value: 'front-wheel', label: t('advancedSearch.frontWheelDrive') },
                    { value: 'rear-wheel', label: t('advancedSearch.rearWheelDrive') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.driveType?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.driveType || [];
                          if (e.target.checked) {
                            handleFilterChange('driveType', [...current, option.value]);
                          } else {
                            handleFilterChange('driveType', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.transmission')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'automatic', label: t('advancedSearch.automatic') },
                    { value: 'semi-automatic', label: t('advancedSearch.semiAutomatic') },
                    { value: 'manual', label: t('advancedSearch.manualGearbox') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.transmission?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.transmission || [];
                          if (e.target.checked) {
                            handleFilterChange('transmission', [...current, option.value]);
                          } else {
                            handleFilterChange('transmission', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.fuelConsumptionCombined')}</FilterLabel>
                <FilterSelect
                  value={filters.fuelConsumption || 'any'}
                  onChange={(e) => handleFilterChange('fuelConsumption', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="3">3 L/100km</option>
                  <option value="4">4 L/100km</option>
                  <option value="5">5 L/100km</option>
                  <option value="6">6 L/100km</option>
                  <option value="7">7 L/100km</option>
                  <option value="8">8 L/100km</option>
                  <option value="9">9 L/100km</option>
                  <option value="10">10 L/100km</option>
                  <option value="12">12 L/100km</option>
                  <option value="15">15 L/100km</option>
                  <option value="20">20 L/100km</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.emissionSticker')}</FilterLabel>
                <FilterSelect
                  value={filters.emissionSticker || 'any'}
                  onChange={(e) => handleFilterChange('emissionSticker', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="green">{t('advancedSearch.green')}</option>
                  <option value="yellow">{t('advancedSearch.yellow')}</option>
                  <option value="red">{t('advancedSearch.red')}</option>
                  <option value="none">{t('advancedSearch.none')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.emissionClass')}</FilterLabel>
                <FilterSelect
                  value={filters.emissionClass || 'any'}
                  onChange={(e) => handleFilterChange('emissionClass', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="euro1">Euro 1</option>
                  <option value="euro2">Euro 2</option>
                  <option value="euro3">Euro 3</option>
                  <option value="euro4">Euro 4</option>
                  <option value="euro5">Euro 5</option>
                  <option value="euro6">Euro 6</option>
                  <option value="euro6d">Euro 6d</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <CheckboxItem>
                  <CheckboxInput
                    type="checkbox"
                    checked={filters.particulateFilter || false}
                    onChange={(e) => handleFilterChange('particulateFilter', e.target.checked)}
                  />
                  {t('advancedSearch.particulateFilter')}
                </CheckboxItem>
              </FilterGroup>
            </FilterGrid>
          </SectionContent>
        </FilterSection>

        {/* Exterior Section */}
        <FilterSection isExpanded={isSectionExpanded('exterior')}>
          <SectionHeader onClick={() => toggleSection('exterior')}>
            <SectionTitle>{t('advancedSearch.exterior')}</SectionTitle>
            {isSectionExpanded('exterior') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </SectionHeader>
          <SectionContent isExpanded={isSectionExpanded('exterior')}>
            <FilterGrid>
              <FilterGroup>
                <FilterLabel>{t('advancedSearch.exteriorColour')}</FilterLabel>
                <ColorGrid>
                  {[
                    { value: 'black', label: t('advancedSearch.black'), color: '#000000' },
                    { value: 'beige', label: t('advancedSearch.beige'), color: '#F5F5DC' },
                    { value: 'grey', label: t('advancedSearch.grey'), color: '#808080' },
                    { value: 'brown', label: t('advancedSearch.brown'), color: '#8B4513' },
                    { value: 'white', label: t('advancedSearch.white'), color: '#FFFFFF' },
                    { value: 'orange', label: t('advancedSearch.orange'), color: '#FFA500' },
                    { value: 'blue', label: t('advancedSearch.blue'), color: '#0000FF' },
                    { value: 'yellow', label: t('advancedSearch.yellow'), color: '#FFFF00' },
                    { value: 'red', label: t('advancedSearch.red'), color: '#FF0000' },
                    { value: 'green', label: t('advancedSearch.green'), color: '#008000' },
                    { value: 'silver', label: t('advancedSearch.silver'), color: '#C0C0C0' },
                    { value: 'gold', label: t('advancedSearch.gold'), color: '#FFD700' },
                    { value: 'purple', label: t('advancedSearch.purple'), color: '#800080' }
                  ].map(option => (
                    <ColorItem key={option.value} color={option.color}>
                      <HiddenCheckbox
                        type="checkbox"
                        checked={filters.exteriorColor?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.exteriorColor || [];
                          if (e.target.checked) {
                            handleFilterChange('exteriorColor', [...current, option.value]);
                          } else {
                            handleFilterChange('exteriorColor', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      <ColorSwatch color={option.color} />
                      <ColorLabel>{option.label}</ColorLabel>
                    </ColorItem>
                  ))}
                </ColorGrid>
                <div style={{ marginTop: '1rem' }}>
                  <CheckboxItem>
                    <CheckboxInput
                      type="checkbox"
                      checked={filters.matte || false}
                      onChange={(e) => handleFilterChange('matte', e.target.checked)}
                    />
                    {t('advancedSearch.matte')}
                  </CheckboxItem>
                  <CheckboxItem>
                    <CheckboxInput
                      type="checkbox"
                      checked={filters.metallic || false}
                      onChange={(e) => handleFilterChange('metallic', e.target.checked)}
                    />
                    {t('advancedSearch.metallic')}
                  </CheckboxItem>
                </div>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.trailerCoupling')}</FilterLabel>
                <FilterSelect
                  value={filters.trailerCoupling || 'any'}
                  onChange={(e) => handleFilterChange('trailerCoupling', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="fix-detachable-swiveling">{t('advancedSearch.fixDetachableSwiveling')}</option>
                  <option value="detachable-swiveling">{t('advancedSearch.detachableSwiveling')}</option>
                  <option value="swiveling">{t('advancedSearch.swiveling')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <CheckboxItem>
                  <CheckboxInput
                    type="checkbox"
                    checked={filters.trailerAssist || false}
                    onChange={(e) => handleFilterChange('trailerAssist', e.target.checked)}
                  />
                  {t('advancedSearch.trailerAssist')}
                </CheckboxItem>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.trailerLoadBraked')}</FilterLabel>
                <FilterSelect
                  value={filters.trailerLoadBraked || 'any'}
                  onChange={(e) => handleFilterChange('trailerLoadBraked', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="500">500 kg</option>
                  <option value="750">750 kg</option>
                  <option value="1000">1000 kg</option>
                  <option value="1500">1500 kg</option>
                  <option value="2000">2000 kg</option>
                  <option value="2500">2500 kg</option>
                  <option value="3000">3000 kg</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.trailerLoadUnbraked')}</FilterLabel>
                <FilterSelect
                  value={filters.trailerLoadUnbraked || 'any'}
                  onChange={(e) => handleFilterChange('trailerLoadUnbraked', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="200">200 kg</option>
                  <option value="300">300 kg</option>
                  <option value="400">400 kg</option>
                  <option value="500">500 kg</option>
                  <option value="750">750 kg</option>
                  <option value="1000">1000 kg</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.noseWeight')}</FilterLabel>
                <FilterSelect
                  value={filters.noseWeight || 'any'}
                  onChange={(e) => handleFilterChange('noseWeight', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="50">50 kg</option>
                  <option value="75">75 kg</option>
                  <option value="100">100 kg</option>
                  <option value="150">150 kg</option>
                  <option value="200">200 kg</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.parkingSensors')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: '360-camera', label: t('advancedSearch.camera360') },
                    { value: 'camera', label: t('advancedSearch.camera') },
                    { value: 'front', label: t('advancedSearch.front') },
                    { value: 'rear', label: t('advancedSearch.rear') },
                    { value: 'rear-traffic-alert', label: t('advancedSearch.rearTrafficAlert') },
                    { value: 'self-steering', label: t('advancedSearch.selfSteering') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.parkingSensors?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.parkingSensors || [];
                          if (e.target.checked) {
                            handleFilterChange('parkingSensors', [...current, option.value]);
                          } else {
                            handleFilterChange('parkingSensors', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.cruiseControl')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'cruise-control', label: t('advancedSearch.cruiseControl') },
                    { value: 'adaptive-cruise', label: t('advancedSearch.adaptiveCruiseControl') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.cruiseControl?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.cruiseControl || [];
                          if (e.target.checked) {
                            handleFilterChange('cruiseControl', [...current, option.value]);
                          } else {
                            handleFilterChange('cruiseControl', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.others')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'abs', label: 'ABS' },
                    { value: 'adaptive-cornering-lights', label: t('advancedSearch.adaptiveCorneringLights') },
                    { value: 'adaptive-lighting', label: t('advancedSearch.adaptiveLighting') },
                    { value: 'air-suspension', label: t('advancedSearch.airSuspension') },
                    { value: 'all-season-tyres', label: t('advancedSearch.allSeasonTyres') },
                    { value: 'alloy-wheels', label: t('advancedSearch.alloyWheels') },
                    { value: 'bi-xenon-headlights', label: t('advancedSearch.biXenonHeadlights') },
                    { value: 'blind-spot-assist', label: t('advancedSearch.blindSpotAssist') },
                    { value: 'central-locking', label: t('advancedSearch.centralLocking') },
                    { value: 'daytime-running-lights', label: t('advancedSearch.daytimeRunningLights') },
                    { value: 'distance-warning', label: t('advancedSearch.distanceWarning') },
                    { value: 'dynamic-chassis', label: t('advancedSearch.dynamicChassis') },
                    { value: 'electric-tailgate', label: t('advancedSearch.electricTailgate') },
                    { value: 'emergency-brake', label: t('advancedSearch.emergencyBrake') },
                    { value: 'emergency-tyre', label: t('advancedSearch.emergencyTyre') },
                    { value: 'emergency-tyre-repair', label: t('advancedSearch.emergencyTyreRepair') },
                    { value: 'esp', label: 'ESP' },
                    { value: 'fog-lamps', label: t('advancedSearch.fogLamps') },
                    { value: 'folding-roof', label: t('advancedSearch.foldingRoof') },
                    { value: 'four-wheel-drive', label: t('advancedSearch.fourWheelDrive') },
                    { value: 'glare-free-high-beam', label: t('advancedSearch.glareFreeHighBeam') },
                    { value: 'headlight-washer', label: t('advancedSearch.headlightWasher') },
                    { value: 'heated-windshield', label: t('advancedSearch.heatedWindshield') },
                    { value: 'high-beam-assist', label: t('advancedSearch.highBeamAssist') },
                    { value: 'hill-start-assist', label: t('advancedSearch.hillStartAssist') },
                    { value: 'immobilizer', label: t('advancedSearch.immobilizer') },
                    { value: 'keyless-central-locking', label: t('advancedSearch.keylessCentralLocking') },
                    { value: 'lane-change-assist', label: t('advancedSearch.laneChangeAssist') },
                    { value: 'laser-headlights', label: t('advancedSearch.laserHeadlights') },
                    { value: 'led-headlights', label: t('advancedSearch.ledHeadlights') },
                    { value: 'led-running-lights', label: t('advancedSearch.ledRunningLights') },
                    { value: 'light-sensor', label: t('advancedSearch.lightSensor') },
                    { value: 'night-vision', label: t('advancedSearch.nightVision') },
                    { value: 'panoramic-roof', label: t('advancedSearch.panoramicRoof') },
                    { value: 'power-assisted-steering', label: t('advancedSearch.powerAssistedSteering') },
                    { value: 'rain-sensor', label: t('advancedSearch.rainSensor') },
                    { value: 'roof-rack', label: t('advancedSearch.roofRack') },
                    { value: 'spare-tyre', label: t('advancedSearch.spareTyre') },
                    { value: 'speed-limit-control', label: t('advancedSearch.speedLimitControl') },
                    { value: 'sports-package', label: t('advancedSearch.sportsPackage') },
                    { value: 'sports-suspension', label: t('advancedSearch.sportsSuspension') },
                    { value: 'start-stop', label: t('advancedSearch.startStop') },
                    { value: 'steel-wheels', label: t('advancedSearch.steelWheels') },
                    { value: 'summer-tyres', label: t('advancedSearch.summerTyres') },
                    { value: 'sunroof', label: t('advancedSearch.sunroof') },
                    { value: 'tinted-windows', label: t('advancedSearch.tintedWindows') },
                    { value: 'traction-control', label: t('advancedSearch.tractionControl') },
                    { value: 'traffic-sign-recognition', label: t('advancedSearch.trafficSignRecognition') },
                    { value: 'tyre-pressure-monitoring', label: t('advancedSearch.tyrePressureMonitoring') },
                    { value: 'winter-tyres', label: t('advancedSearch.winterTyres') },
                    { value: 'xenon-headlights', label: t('advancedSearch.xenonHeadlights') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.exteriorOthers?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.exteriorOthers || [];
                          if (e.target.checked) {
                            handleFilterChange('exteriorOthers', [...current, option.value]);
                          } else {
                            handleFilterChange('exteriorOthers', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>
            </FilterGrid>
          </SectionContent>
        </FilterSection>

        {/* Interior Section */}
        <FilterSection isExpanded={isSectionExpanded('interior')}>
          <SectionHeader onClick={() => toggleSection('interior')}>
            <SectionTitle>{t('advancedSearch.interior')}</SectionTitle>
            {isSectionExpanded('interior') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </SectionHeader>
          <SectionContent isExpanded={isSectionExpanded('interior')}>
            <FilterGrid>
              <FilterGroup>
                <FilterLabel>{t('advancedSearch.interiorColour')}</FilterLabel>
                <ColorGrid>
                  {[
                    { value: 'black', label: t('advancedSearch.black'), color: '#000000' },
                    { value: 'beige', label: t('advancedSearch.beige'), color: '#F5F5DC' },
                    { value: 'grey', label: t('advancedSearch.grey'), color: '#808080' },
                    { value: 'brown', label: t('advancedSearch.brown'), color: '#8B4513' },
                    { value: 'white', label: t('advancedSearch.white'), color: '#FFFFFF' },
                    { value: 'blue', label: t('advancedSearch.blue'), color: '#0000FF' },
                    { value: 'red', label: t('advancedSearch.red'), color: '#FF0000' },
                    { value: 'green', label: t('advancedSearch.green'), color: '#008000' },
                    { value: 'silver', label: t('advancedSearch.silver'), color: '#C0C0C0' },
                    { value: 'other', label: t('advancedSearch.other'), color: '#666666' }
                  ].map(option => (
                    <ColorItem key={option.value} color={option.color}>
                      <HiddenCheckbox
                        type="checkbox"
                        checked={filters.interiorColor?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.interiorColor || [];
                          if (e.target.checked) {
                            handleFilterChange('interiorColor', [...current, option.value]);
                          } else {
                            handleFilterChange('interiorColor', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      <ColorSwatch color={option.color} />
                      <ColorLabel>{option.label}</ColorLabel>
                    </ColorItem>
                  ))}
                </ColorGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.interiorMaterial')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'cloth', label: t('advancedSearch.cloth') },
                    { value: 'leather', label: t('advancedSearch.leather') },
                    { value: 'part-leather', label: t('advancedSearch.partLeather') },
                    { value: 'alcantara', label: t('advancedSearch.alcantara') },
                    { value: 'velour', label: t('advancedSearch.velour') },
                    { value: 'other', label: t('advancedSearch.other') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.interiorMaterial?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.interiorMaterial || [];
                          if (e.target.checked) {
                            handleFilterChange('interiorMaterial', [...current, option.value]);
                          } else {
                            handleFilterChange('interiorMaterial', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>
            </FilterGrid>
          </SectionContent>
        </FilterSection>

        {/* Offer Details Section - Will be implemented next */}
        <FilterSection isExpanded={isSectionExpanded('offerDetails')}>
          <SectionHeader onClick={() => toggleSection('offerDetails')}>
            <SectionTitle>{t('advancedSearch.offerDetails')}</SectionTitle>
            {isSectionExpanded('offerDetails') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </SectionHeader>
          <SectionContent isExpanded={isSectionExpanded('offerDetails')}>
            <FilterGrid>
              <FilterGroup>
                <FilterLabel>{t('advancedSearch.sellerType')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'dealer', label: t('advancedSearch.dealer') },
                    { value: 'private', label: t('advancedSearch.private') },
                    { value: 'garage', label: t('advancedSearch.garage') },
                    { value: 'other', label: t('advancedSearch.other') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.sellerType?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.sellerType || [];
                          if (e.target.checked) {
                            handleFilterChange('sellerType', [...current, option.value]);
                          } else {
                            handleFilterChange('sellerType', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.warranty')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'warranty', label: t('advancedSearch.warranty') },
                    { value: 'extended-warranty', label: t('advancedSearch.extendedWarranty') },
                    { value: 'no-warranty', label: t('advancedSearch.noWarranty') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.warranty?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.warranty || [];
                          if (e.target.checked) {
                            handleFilterChange('warranty', [...current, option.value]);
                          } else {
                            handleFilterChange('warranty', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.serviceHistory')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'full-service-history', label: t('advancedSearch.fullServiceHistory') },
                    { value: 'partial-service-history', label: t('advancedSearch.partialServiceHistory') },
                    { value: 'no-service-history', label: t('advancedSearch.noServiceHistory') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.serviceHistory?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.serviceHistory || [];
                          if (e.target.checked) {
                            handleFilterChange('serviceHistory', [...current, option.value]);
                          } else {
                            handleFilterChange('serviceHistory', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.accidentFree')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'accident-free', label: t('advancedSearch.accidentFree') },
                    { value: 'damaged', label: t('advancedSearch.damaged') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.accidentFree?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.accidentFree || [];
                          if (e.target.checked) {
                            handleFilterChange('accidentFree', [...current, option.value]);
                          } else {
                            handleFilterChange('accidentFree', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.roadworthy')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'roadworthy', label: t('advancedSearch.roadworthy') },
                    { value: 'not-roadworthy', label: t('advancedSearch.notRoadworthy') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.roadworthy?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.roadworthy || [];
                          if (e.target.checked) {
                            handleFilterChange('roadworthy', [...current, option.value]);
                          } else {
                            handleFilterChange('roadworthy', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.huValid')}</FilterLabel>
                <FilterSelect
                  value={filters.huValid || 'any'}
                  onChange={(e) => handleFilterChange('huValid', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="valid">{t('advancedSearch.valid')}</option>
                  <option value="expired">{t('advancedSearch.expired')}</option>
                  <option value="expiring-soon">{t('advancedSearch.expiringSoon')}</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.numberOfOwners')}</FilterLabel>
                <FilterSelect
                  value={filters.numberOfOwners || 'any'}
                  onChange={(e) => handleFilterChange('numberOfOwners', e.target.value === 'any' ? '' : e.target.value)}
                >
                  <option value="any">{t('advancedSearch.any')}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.availability')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'available', label: t('advancedSearch.available') },
                    { value: 'reserved', label: t('advancedSearch.reserved') },
                    { value: 'sold', label: t('advancedSearch.sold') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.availability?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.availability || [];
                          if (e.target.checked) {
                            handleFilterChange('availability', [...current, option.value]);
                          } else {
                            handleFilterChange('availability', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>{t('advancedSearch.delivery')}</FilterLabel>
                <CheckboxGrid>
                  {[
                    { value: 'any', label: t('advancedSearch.any') },
                    { value: 'delivery-available', label: t('advancedSearch.deliveryAvailable') },
                    { value: 'pickup-only', label: t('advancedSearch.pickupOnly') }
                  ].map(option => (
                    <CheckboxItem key={option.value}>
                      <CheckboxInput
                        type="checkbox"
                        checked={filters.delivery?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = filters.delivery || [];
                          if (e.target.checked) {
                            handleFilterChange('delivery', [...current, option.value]);
                          } else {
                            handleFilterChange('delivery', current.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      {option.label}
                    </CheckboxItem>
                  ))}
                </CheckboxGrid>
              </FilterGroup>
            </FilterGrid>
          </SectionContent>
        </FilterSection>
      </FilterSections>
    </FilterContainer>
  );
};

export default AdvancedFilterSystemMobile;
