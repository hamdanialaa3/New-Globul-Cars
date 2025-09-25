import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Calendar, Euro } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import SearchableSelect from './SearchableSelect';
import CheckboxGrid from './CheckboxGrid';
import SearchTabs from './SearchTabs';
import SearchResults from './SearchResults';
import SmartSearchSuggestions from './SmartSearchSuggestions';

interface CarSearchOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface CarSearchFilter {
  id: string;
  label: string;
  type: 'select' | 'checkbox' | 'range' | 'text' | 'date' | 'location';
  options?: CarSearchOption[];
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  description?: string;
}

interface CarSearchResult {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  location: string;
  date: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize: number;
  color: string;
  condition: string;
  features: string[];
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  isFavorite: boolean;
  isPromoted: boolean;
  isNew: boolean;
}

interface CarSearchSystemAdvancedProps {
  filters: CarSearchFilter[];
  results: CarSearchResult[];
  loading?: boolean;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  onSearch: (filters: Record<string, any>) => void;
  onReset: () => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  onResultClick?: (result: CarSearchResult) => void;
  onFavoriteToggle?: (resultId: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
  style?: React.CSSProperties;
  showAdvanced?: boolean;
  onToggleAdvanced?: (show: boolean) => void;
  showFilters?: boolean;
  onToggleFilters?: (show: boolean) => void;
  showSuggestions?: boolean;
  onSuggestionClick?: (suggestion: any) => void;
  onClearRecent?: () => void;
}

const CarSearchSystemAdvancedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemAdvancedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemAdvancedTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CarSearchSystemAdvancedToggles = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CarSearchSystemAdvancedToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.light + '10'};
  }
`;

const CarSearchSystemAdvancedContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemAdvancedSearch = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const CarSearchSystemAdvancedTabs = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemAdvancedForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemAdvancedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CarSearchSystemAdvancedSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const CarSearchSystemAdvancedRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemAdvancedField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CarSearchSystemAdvancedLabel = styled.label<{ required: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &::after {
    content: ${({ required }) => (required ? ' *' : '')};
    color: ${({ theme }) => theme.colors.error.main};
  }
`;

const CarSearchSystemAdvancedDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const CarSearchSystemAdvancedInput = styled.input`
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
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const CarSearchSystemAdvancedRange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CarSearchSystemAdvancedRangeInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const CarSearchSystemAdvancedRangeSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CarSearchSystemAdvancedActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const CarSearchSystemAdvancedButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.main : 'transparent'
  };
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.contrastText : theme.colors.text.primary
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.primary.dark : theme.colors.grey[100]
    };
    border-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.primary.dark : theme.colors.grey[400]
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CarSearchSystemAdvanced: React.FC<CarSearchSystemAdvancedProps> = ({
  filters,
  results,
  loading = false,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  onSearch,
  onReset,
  onPageChange,
  onSortChange,
  onViewChange,
  onResultClick,
  onFavoriteToggle,
  onFilterChange,
  className,
  style,
  showAdvanced = false,
  onToggleAdvanced,
  showFilters = false,
  onToggleFilters,
  showSuggestions = true,
  onSuggestionClick,
  onClearRecent,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [isFiltersOpen, setIsFiltersOpen] = useState(showFilters);
  const [activeTab, setActiveTab] = useState('search');
  const [showSuggestionsState, setShowSuggestionsState] = useState(false);

  const tabs = [
    { id: 'search', label: t('carSearch.tabs.search', 'Search'), icon: <Search size={16} /> },
    { id: 'filters', label: t('carSearch.tabs.filters', 'Filters'), icon: <Filter size={16} /> },
    { id: 'popular', label: t('carSearch.tabs.popular', 'Popular'), icon: <Star size={16} /> },
    { id: 'trending', label: t('carSearch.tabs.trending', 'Trending'), icon: <TrendingUp size={16} /> },
  ];

  const suggestions = [
    { id: '1', text: 'BMW 3 Series', type: 'brand' as const, category: 'Luxury' },
    { id: '2', text: 'Audi A4', type: 'brand' as const, category: 'Luxury' },
    { id: '3', text: 'Mercedes C-Class', type: 'brand' as const, category: 'Luxury' },
    { id: '4', text: 'Volkswagen Golf', type: 'brand' as const, category: 'Compact' },
    { id: '5', text: 'Toyota Corolla', type: 'brand' as const, category: 'Compact' },
  ];

  useEffect(() => {
    const initialData: Record<string, any> = {};
    filters.forEach(filter => {
      if (filter.type === 'checkbox') {
        initialData[filter.id] = filter.value || [];
      } else {
        initialData[filter.id] = filter.value || '';
      }
    });
    setFormData(initialData);
  }, [filters]);

  const handleInputChange = (filterId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  const handleReset = () => {
    const resetData: Record<string, any> = {};
    filters.forEach(filter => {
      if (filter.type === 'checkbox') {
        resetData[filter.id] = [];
      } else {
        resetData[filter.id] = '';
      }
    });
    setFormData(resetData);
    onReset();
  };

  const handleToggleAdvanced = () => {
    const newState = !isAdvancedOpen;
    setIsAdvancedOpen(newState);
    onToggleAdvanced?.(newState);
  };

  const handleToggleFilters = () => {
    const newState = !isFiltersOpen;
    setIsFiltersOpen(newState);
    onToggleFilters?.(newState);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'search') {
      setShowSuggestionsState(true);
    } else {
      setShowSuggestionsState(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    onSuggestionClick?.(suggestion);
    setShowSuggestionsState(false);
  };

  const renderFilter = (filter: CarSearchFilter) => {
    switch (filter.type) {
      case 'select':
        return (
          <SearchableSelect
            options={filter.options || []}
            value={formData[filter.id] || ''}
            onChange={(value) => handleInputChange(filter.id, value)}
            placeholder={filter.placeholder || `Select ${filter.label}`}
            showSearch={true}
            groupBy={true}
          />
        );

      case 'checkbox':
        return (
          <CheckboxGrid
            options={filter.options || []}
            value={formData[filter.id] || []}
            onChange={(value) => handleInputChange(filter.id, value)}
            columns={2}
            showDescriptions={true}
          />
        );

      case 'range':
        return (
          <CarSearchSystemAdvancedRange>
            <CarSearchSystemAdvancedRangeInput
              type="number"
              placeholder="Min"
              value={formData[filter.id]?.min || ''}
              onChange={(e) => handleInputChange(filter.id, {
                ...formData[filter.id],
                min: e.target.value ? Number(e.target.value) : undefined
              })}
              min={filter.min}
              max={filter.max}
              step={filter.step}
            />
            <CarSearchSystemAdvancedRangeSeparator>to</CarSearchSystemAdvancedRangeSeparator>
            <CarSearchSystemAdvancedRangeInput
              type="number"
              placeholder="Max"
              value={formData[filter.id]?.max || ''}
              onChange={(e) => handleInputChange(filter.id, {
                ...formData[filter.id],
                max: e.target.value ? Number(e.target.value) : undefined
              })}
              min={filter.min}
              max={filter.max}
              step={filter.step}
            />
            {filter.unit && (
              <CarSearchSystemAdvancedRangeSeparator>{filter.unit}</CarSearchSystemAdvancedRangeSeparator>
            )}
          </CarSearchSystemAdvancedRange>
        );

      case 'date':
        return (
          <CarSearchSystemAdvancedInput
            type="date"
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'location':
        return (
          <CarSearchSystemAdvancedInput
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <CarSearchSystemAdvancedInput
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );
    }
  };

  const groupedFilters = filters.reduce((groups, filter) => {
    const group = filter.group || 'General';
    if (!groups[group]) groups[group] = [];
    groups[group].push(filter);
    return groups;
  }, {} as Record<string, CarSearchFilter[]>);

  return (
    <CarSearchSystemAdvancedContainer className={className} style={style}>
      <CarSearchSystemAdvancedHeader>
        <CarSearchSystemAdvancedTitle>
          {t('carSearch.title', 'Advanced Car Search')}
        </CarSearchSystemAdvancedTitle>
        <CarSearchSystemAdvancedToggles>
          <CarSearchSystemAdvancedToggle onClick={handleToggleAdvanced}>
            <Filter size={16} />
            {isAdvancedOpen ? 'Hide Advanced' : 'Show Advanced'}
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CarSearchSystemAdvancedToggle>
          <CarSearchSystemAdvancedToggle onClick={handleToggleFilters}>
            <Filter size={16} />
            {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CarSearchSystemAdvancedToggle>
        </CarSearchSystemAdvancedToggles>
      </CarSearchSystemAdvancedHeader>

      <CarSearchSystemAdvancedContent>
        <CarSearchSystemAdvancedSearch>
          <CarSearchSystemAdvancedTabs>
            <SearchTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              variant="pills"
              size="md"
            />
          </CarSearchSystemAdvancedTabs>

          <CarSearchSystemAdvancedForm onSubmit={handleSubmit}>
            {isAdvancedOpen && (
              <CarSearchSystemAdvancedSection>
                <CarSearchSystemAdvancedSectionTitle>
                  {t('carSearch.advanced.title', 'Advanced Options')}
                </CarSearchSystemAdvancedSectionTitle>
                <CarSearchSystemAdvancedRow>
                  {filters.filter(f => f.type === 'range' || f.type === 'date' || f.type === 'location').map((filter) => (
                    <CarSearchSystemAdvancedField key={filter.id}>
                      <CarSearchSystemAdvancedLabel required={filter.required || false}>
                        {filter.label}
                      </CarSearchSystemAdvancedLabel>
                      {filter.description && (
                        <CarSearchSystemAdvancedDescription>{filter.description}</CarSearchSystemAdvancedDescription>
                      )}
                      {renderFilter(filter)}
                    </CarSearchSystemAdvancedField>
                  ))}
                </CarSearchSystemAdvancedRow>
              </CarSearchSystemAdvancedSection>
            )}

            {isFiltersOpen && (
              <CarSearchSystemAdvancedSection>
                <CarSearchSystemAdvancedSectionTitle>
                  {t('carSearch.filters.title', 'Filters')}
                </CarSearchSystemAdvancedSectionTitle>
                <CarSearchSystemAdvancedRow>
                  {filters.filter(f => f.type === 'select' || f.type === 'checkbox').map((filter) => (
                    <CarSearchSystemAdvancedField key={filter.id}>
                      <CarSearchSystemAdvancedLabel required={filter.required || false}>
                        {filter.label}
                      </CarSearchSystemAdvancedLabel>
                      {filter.description && (
                        <CarSearchSystemAdvancedDescription>{filter.description}</CarSearchSystemAdvancedDescription>
                      )}
                      {renderFilter(filter)}
                    </CarSearchSystemAdvancedField>
                  ))}
                </CarSearchSystemAdvancedRow>
              </CarSearchSystemAdvancedSection>
            )}

            <CarSearchSystemAdvancedActions>
              <CarSearchSystemAdvancedButton
                type="button"
                variant="secondary"
                onClick={handleReset}
              >
                <X size={16} />
                {t('carSearch.reset', 'Reset')}
              </CarSearchSystemAdvancedButton>
              <CarSearchSystemAdvancedButton
                type="submit"
                variant="primary"
                disabled={loading}
              >
                <Search size={16} />
                {loading ? t('carSearch.searching', 'Searching...') : t('carSearch.search', 'Search')}
              </CarSearchSystemAdvancedButton>
            </CarSearchSystemAdvancedActions>
          </CarSearchSystemAdvancedForm>
        </CarSearchSystemAdvancedSearch>

        {showSuggestions && showSuggestionsState && (
          <SmartSearchSuggestions
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            onClearRecent={onClearRecent}
            maxSuggestions={10}
            showCategories={true}
            showCounts={true}
          />
        )}

        <SearchResults
          results={results}
          loading={loading}
          totalResults={totalResults}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onSortChange={onSortChange}
          onViewChange={onViewChange}
          onResultClick={onResultClick}
          onFavoriteToggle={onFavoriteToggle}
          onFilterChange={onFilterChange}
          showFilters={true}
          showSort={true}
          showViewToggle={true}
          showPagination={true}
        />
      </CarSearchSystemAdvancedContent>
    </CarSearchSystemAdvancedContainer>
  );
};

export default CarSearchSystemAdvanced;