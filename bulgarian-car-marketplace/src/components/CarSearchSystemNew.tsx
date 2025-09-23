import { useState } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { carDataBrowserService, CarDataFromFile } from '../services/carDataBrowserService';
import { useTranslation } from '../hooks/useTranslation';

interface CarSearchProps {
  onSearchResults: (results: CarDataFromFile[]) => void;
}

const SearchContainer = styled.div`
  background: ${(props: any) => props.theme.colors?.background?.paper || '#ffffff'};
  border-radius: ${(props: any) => props.theme.borderRadius?.lg || '12px'};
  padding: ${(props: any) => props.theme.spacing?.xl || '24px'};
  margin-bottom: ${(props: any) => props.theme.spacing?.xl || '24px'};
  box-shadow: ${(props: any) => props.theme.shadows?.base || '0 1px 3px rgba(0,0,0,0.1)'};
  border: 1px solid ${(props: any) => props.theme.colors?.grey?.[200] || '#e2e8f0'};
`;

const SearchTabs = styled.div`
  display: flex;
  margin-bottom: ${(props: any) => props.theme.spacing?.xl || '24px'};
  border-bottom: 1px solid ${(props: any) => props.theme.colors?.grey?.[200] || '#e2e8f0'};
`;

const SearchTab = styled.button<{ active: boolean }>`
  padding: ${(props: any) => props.theme.spacing?.md || '16px'} ${(props: any) => props.theme.spacing?.xl || '24px'};
  border: none;
  background: ${({ active }) => active ? '#0066cc' : 'transparent'};
  color: ${({ active }) => active ? 'white' : '#666666'};
  font-weight: 500;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ active }) => active ? '#004499' : '#f1f5f9'};
  }
`;

const SearchSection = styled.div`
  margin-bottom: ${(props: any) => props.theme.spacing?.xl || '24px'};
`;

const SearchTitle = styled.h3`
  font-size: ${(props: any) => props.theme.typography?.fontSize?.xl || '20px'};
  font-weight: ${(props: any) => props.theme.typography?.fontWeight?.bold || '700'};
  color: ${(props: any) => props.theme.colors?.text?.primary || '#333333'};
  margin-bottom: ${(props: any) => props.theme.spacing?.lg || '18px'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${(props: any) => props.theme.spacing?.md || '16px'};
  border: 1px solid ${(props: any) => props.theme.colors?.grey?.[300] || '#cbd5e1'};
  border-radius: ${(props: any) => props.theme.borderRadius?.base || '6px'};
  font-size: ${(props: any) => props.theme.typography?.fontSize?.base || '16px'};
  background: ${(props: any) => props.theme.colors?.background?.paper || '#ffffff'};
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }

  &::placeholder {
    color: ${(props: any) => props.theme.colors?.text?.secondary || '#666666'};
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props: any) => props.theme.spacing?.md || '16px'};
  margin-top: ${(props: any) => props.theme.spacing?.md || '16px'};
  justify-content: space-around;
  width: 100%;
`;

const FilterGroup = styled.div`
  label {
    display: block;
    font-weight: ${(props: any) => props.theme.typography?.fontWeight?.medium || '500'};
    color: ${(props: any) => props.theme.colors?.text?.primary || '#333333'};
    margin-bottom: ${(props: any) => props.theme.spacing?.sm || '8px'};
    font-size: ${(props: any) => props.theme.typography?.fontSize?.sm || '14px'};
  }

  select {
    width: 100%;
    padding: ${(props: any) => props.theme.spacing?.sm || '8px'};
    border: 1px solid ${(props: any) => props.theme.colors?.grey?.[300] || '#cbd5e1'};
    border-radius: ${(props: any) => props.theme.borderRadius?.base || '6px'};
    font-size: ${(props: any) => props.theme.typography?.fontSize?.sm || '14px'};
    background: ${(props: any) => props.theme.colors?.background?.paper || '#ffffff'};
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
    }
  }
`;

const SearchButton = styled.button`
  width: 100%;
  padding: ${(props: any) => props.theme.spacing?.md || '16px'};
  background: ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
  color: ${(props: any) => props.theme.colors?.primary?.contrastText || '#ffffff'};
  border: 2px solid ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
  border-radius: ${(props: any) => props.theme.borderRadius?.base || '6px'};
  font-weight: ${(props: any) => props.theme.typography?.fontWeight?.bold || '700'};
  font-size: ${(props: any) => props.theme.typography?.fontSize?.base || '16px'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${(props: any) => props.theme.colors?.primary?.dark || '#004499'};
    border-color: ${(props: any) => props.theme.colors?.primary?.dark || '#004499'};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ResultsContainer = styled.div`
  margin-top: ${(props: any) => props.theme.spacing?.xl || '24px'};
`;

const ResultsTitle = styled.h4`
  font-size: ${(props: any) => props.theme.typography?.fontSize?.lg || '18px'};
  font-weight: ${(props: any) => props.theme.typography?.fontWeight?.semibold || '600'};
  color: ${(props: any) => props.theme.colors?.text?.primary || '#333333'};
  margin-bottom: ${(props: any) => props.theme.spacing?.md || '16px'};
`;

const CarSearchSystemNew: React.FC<CarSearchProps> = ({ onSearchResults }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');
  const [simpleSearch, setSimpleSearch] = useState('');
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    fuelType: '',
    transmission: '',
    condition: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSimpleSearch = async () => {
    if (!simpleSearch.trim()) return;

    setIsLoading(true);
    try {
      const results = await carDataBrowserService.searchCars(simpleSearch);
      onSearchResults(results);
    } catch (error) {
      console.error('Simple search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setIsLoading(true);
    try {
      const searchFilters = {
        brand: filters.make || undefined,
        model: filters.model || undefined,
        fuelType: filters.fuelType ? [filters.fuelType] : undefined,
        transmission: filters.transmission ? [filters.transmission] : undefined,
        minYear: filters.yearFrom ? parseInt(filters.yearFrom) : undefined,
        maxYear: filters.yearTo ? parseInt(filters.yearTo) : undefined,
        sortBy: 'date_desc' as const
      };

      const results = await carDataBrowserService.searchCars('', searchFilters);
      onSearchResults(results);
    } catch (error) {
      console.error('Advanced search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'simple') {
        handleSimpleSearch();
      } else {
        handleAdvancedSearch();
      }
    }
  };

  return (
    <SearchContainer>
      <SearchTabs>
        <SearchTab
          active={activeTab === 'simple'}
          onClick={() => setActiveTab('simple')}
        >
          {t('simple_search', 'Simple Search')}
        </SearchTab>
        <SearchTab
          active={activeTab === 'advanced'}
          onClick={() => setActiveTab('advanced')}
        >
          {t('advanced_search', 'Advanced Search')}
        </SearchTab>
      </SearchTabs>

      {activeTab === 'simple' && (
        <SearchSection>
          <SearchTitle>{t('search_cars', 'Search Cars')}</SearchTitle>
          <SearchInput
            type="text"
            placeholder={t('search_placeholder', 'Enter make, model, or keywords...')}
            value={simpleSearch}
            onChange={(e) => setSimpleSearch(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SearchButton
            onClick={handleSimpleSearch}
            disabled={isLoading}
          >
            {isLoading ? t('searching', 'Searching...') : t('search', 'Search')}
          </SearchButton>
        </SearchSection>
      )}

      {activeTab === 'advanced' && (
        <SearchSection>
          <SearchTitle>{t('advanced_filters', 'Advanced Filters')}</SearchTitle>
          <FiltersGrid>
            <FilterGroup>
              <label>{t('make', 'Make')}</label>
              <select
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
              >
                <option value="">{t('all_makes', 'All Makes')}</option>
                {/* Add make options here */}
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('model', 'Model')}</label>
              <select
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
              >
                <option value="">{t('all_models', 'All Models')}</option>
                {/* Add model options here */}
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('year_from', 'Year From')}</label>
              <select
                value={filters.yearFrom}
                onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
              >
                <option value="">{t('any', 'Any')}</option>
                {/* Add year options here */}
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('year_to', 'Year To')}</label>
              <select
                value={filters.yearTo}
                onChange={(e) => handleFilterChange('yearTo', e.target.value)}
              >
                <option value="">{t('any', 'Any')}</option>
                {/* Add year options here */}
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('fuel_type', 'Fuel Type')}</label>
              <select
                value={filters.fuelType}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              >
                <option value="">{t('all_fuel_types', 'All Fuel Types')}</option>
                <option value="petrol">{t('petrol', 'Petrol')}</option>
                <option value="diesel">{t('diesel', 'Diesel')}</option>
                <option value="electric">{t('electric', 'Electric')}</option>
                <option value="hybrid">{t('hybrid', 'Hybrid')}</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('transmission', 'Transmission')}</label>
              <select
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
              >
                <option value="">{t('all_transmissions', 'All Transmissions')}</option>
                <option value="manual">{t('manual', 'Manual')}</option>
                <option value="automatic">{t('automatic', 'Automatic')}</option>
              </select>
            </FilterGroup>
          </FiltersGrid>

          <SearchButton
            onClick={handleAdvancedSearch}
            disabled={isLoading}
          >
            {isLoading ? t('searching', 'Searching...') : t('search', 'Search')}
          </SearchButton>
        </SearchSection>
      )}

      <ResultsContainer>
        <ResultsTitle>{t('search_results', 'Search Results')}</ResultsTitle>
        {/* Results will be displayed here */}
      </ResultsContainer>
    </SearchContainer>
  );
};

export default CarSearchSystemNew;