// Advanced Filters Component for Cars Search
// مكون الفلاتر المتقدمة للبحث عن السيارات

import React, { useState } from 'react';
import styled from 'styled-components';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import { BULGARIAN_CITIES } from '@globul-cars/core/constantsbulgarianCities';
import SelectWithOther from './shared/SelectWithOther';
import { 
  CAR_BRANDS, 
  CAR_YEARS, 
  FUEL_TYPES, 
  TRANSMISSION_TYPES, 
  SELLER_TYPES,
  PRICE_RANGES,
  MILEAGE_RANGES
} from '@globul-cars/core/constants/dropdown-options';

interface FilterOptions {
  city?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  fuelType?: string;
  transmission?: string;
  sellerType?: string;
}

interface AdvancedFiltersProps {
  initialFilters?: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const FiltersContainer = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#0f172a' : 'white')};
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const FiltersHeader = styled.div<{ $isDark?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: ${({ $isDark }) => ($isDark ? '#e6eefa' : 'white')};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: linear-gradient(135deg, #5568d3, #6a4491);
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const FiltersContent = styled.div<{ isExpanded: boolean; $isDark?: boolean }>`
  max-height: ${props => props.isExpanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<{ $isDark?: boolean }>`
  font-weight: 600;
  color: ${({ $isDark }) => ($isDark ? '#e6eefa' : '#2c3e50')};
  font-size: 0.9rem;
`;

const Select = styled.select<{ $isDark?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  background: ${({ $isDark }) => ($isDark ? '#0b1220' : 'white')};
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Input = styled.input<{ $isDark?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: center;
`;

const RangeSeparator = styled.span`
  color: #7f8c8d;
  font-weight: 600;
`;

const ButtonGroup = styled.div<{ $isDark?: boolean }>`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e9ecef')};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #f8f9fa;
    color: #6c757d;
    border: 2px solid #e9ecef;
    
    &:hover {
      background: #e9ecef;
    }
  `}
`;

const ActiveFiltersCount = styled.span<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#0b1220' : 'white')};
  color: ${({ $isDark }) => ($isDark ? '#67a1ff' : '#667eea')};
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: 0.5rem;
`;

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  initialFilters = {},
  onApplyFilters,
  onClearFilters
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleFilterChange = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  const getActiveFiltersCount = (): number => {
    return Object.values(filters).filter(v => v !== undefined && v !== '').length;
  };

  const makes = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Renault', 'Peugeot', 'Opel', 'Škoda', 'Hyundai', 'Kia', 'Nissan', 'Mazda'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const transmissions = ['Manual', 'Automatic', 'Semi-automatic'];
  const sellerTypes = ['private', 'dealer', 'company'];

  return (
    <FiltersContainer $isDark={isDark}>
      <FiltersHeader $isDark={isDark} onClick={() => setIsExpanded(!isExpanded)}>
        <HeaderTitle>
          <Filter size={20} />
          <span>{language === 'bg' ? 'Разширени филтри' : 'Advanced Filters'}</span>
          {getActiveFiltersCount() > 0 && (
            <ActiveFiltersCount>{getActiveFiltersCount()}</ActiveFiltersCount>
          )}
        </HeaderTitle>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </FiltersHeader>

      <FiltersContent $isDark={isDark} isExpanded={isExpanded}>
        <FiltersGrid>
          {/* City */}
          <FilterGroup>
            <Label $isDark={isDark}>{language === 'bg' ? 'Град' : 'City'}</Label>
            <SelectWithOther
              options={BULGARIAN_CITIES.map(city => ({
                value: city.id,
                label: city.nameBg,
                labelEn: city.nameEn
              }))}
              value={filters.city || ''}
              onChange={(value) => handleFilterChange('city', value)}
              placeholder={language === 'bg' ? 'Всички градове' : 'All cities'}
              showOther={true}
            />
          </FilterGroup>

          {/* Make */}
          <FilterGroup>
            <Label $isDark={isDark}>{language === 'bg' ? 'Марка' : 'Make'}</Label>
            <SelectWithOther
              options={CAR_BRANDS}
              value={filters.make || ''}
              onChange={(value) => handleFilterChange('make', value)}
              placeholder={language === 'bg' ? 'Всички марки' : 'All makes'}
              showOther={true}
            />
          </FilterGroup>

          {/* Fuel Type */}
          <FilterGroup>
            <Label>{language === 'bg' ? 'Гориво' : 'Fuel Type'}</Label>
            <SelectWithOther
              options={FUEL_TYPES}
              value={filters.fuelType || ''}
              onChange={(value) => handleFilterChange('fuelType', value)}
              placeholder={language === 'bg' ? 'Всички' : 'All'}
              showOther={true}
            />
          </FilterGroup>

          {/* Transmission */}
          <FilterGroup>
            <Label>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</Label>
            <SelectWithOther
              options={TRANSMISSION_TYPES}
              value={filters.transmission || ''}
              onChange={(value) => handleFilterChange('transmission', value)}
              placeholder={language === 'bg' ? 'Всички' : 'All'}
              showOther={true}
            />
          </FilterGroup>

          {/* Year Range */}
          <FilterGroup>
            <Label>{language === 'bg' ? 'Година' : 'Year'}</Label>
            <RangeGroup>
              <Input
                type="number"
                placeholder={language === 'bg' ? 'От' : 'From'}
                value={filters.yearFrom || ''}
                onChange={(e) => handleFilterChange('yearFrom', parseInt(e.target.value) || undefined)}
                min="1900"
                max={new Date().getFullYear()}
              />
              <RangeSeparator>–</RangeSeparator>
              <Input
                type="number"
                placeholder={language === 'bg' ? 'До' : 'To'}
                value={filters.yearTo || ''}
                onChange={(e) => handleFilterChange('yearTo', parseInt(e.target.value) || undefined)}
                min="1900"
                max={new Date().getFullYear()}
              />
            </RangeGroup>
          </FilterGroup>

          {/* Price Range */}
          <FilterGroup>
            <Label>{language === 'bg' ? 'Цена (EUR)' : 'Price (EUR)'}</Label>
            <RangeGroup>
              <Input
                type="number"
                placeholder={language === 'bg' ? 'От' : 'From'}
                value={filters.priceFrom || ''}
                onChange={(e) => handleFilterChange('priceFrom', parseInt(e.target.value) || undefined)}
                min="0"
              />
              <RangeSeparator>–</RangeSeparator>
              <Input
                type="number"
                placeholder={language === 'bg' ? 'До' : 'To'}
                value={filters.priceTo || ''}
                onChange={(e) => handleFilterChange('priceTo', parseInt(e.target.value) || undefined)}
                min="0"
              />
            </RangeGroup>
          </FilterGroup>

          {/* Mileage Range */}
          <FilterGroup>
            <Label>{language === 'bg' ? 'Пробег (км)' : 'Mileage (km)'}</Label>
            <RangeGroup>
              <Input
                type="number"
                placeholder={language === 'bg' ? 'От' : 'From'}
                value={filters.mileageFrom || ''}
                onChange={(e) => handleFilterChange('mileageFrom', parseInt(e.target.value) || undefined)}
                min="0"
              />
              <RangeSeparator>–</RangeSeparator>
              <Input
                type="number"
                placeholder={language === 'bg' ? 'До' : 'To'}
                value={filters.mileageTo || ''}
                onChange={(e) => handleFilterChange('mileageTo', parseInt(e.target.value) || undefined)}
                min="0"
              />
            </RangeGroup>
          </FilterGroup>

          {/* Seller Type */}
          <FilterGroup>
            <Label>{language === 'bg' ? 'Тип продавач' : 'Seller Type'}</Label>
            <SelectWithOther
              options={SELLER_TYPES}
              value={filters.sellerType || ''}
              onChange={(value) => handleFilterChange('sellerType', value)}
              placeholder={language === 'bg' ? 'Всички' : 'All'}
              showOther={true}
            />
          </FilterGroup>
        </FiltersGrid>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleClear}>
            <X size={18} />
            {language === 'bg' ? 'Изчисти' : 'Clear'}
          </Button>
          <Button variant="primary" onClick={handleApply}>
            <Filter size={18} />
            {language === 'bg' ? 'Приложи филтри' : 'Apply Filters'}
          </Button>
        </ButtonGroup>
      </FiltersContent>
    </FiltersContainer>
  );
};

export default AdvancedFilters;


