import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, X, ChevronDown, ChevronUp, Star, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
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
  group?: string;
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

interface CarSearchSystemNewProps {
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
  onSearchResults?: (results: any) => void;
}

const CarSearchSystemNewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemNewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemNewTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CarSearchSystemNewToggles = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CarSearchSystemNewToggle = styled.button`
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

const CarSearchSystemNewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemNewSearch = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const CarSearchSystemNewTabs = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemNewForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemNewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CarSearchSystemNewSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const CarSearchSystemNewRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarSearchSystemNewField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CarSearchSystemNewLabel = styled.label<{ required: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &::after {
    content: ${({ required }) => (required ? ' *' : '')};
    color: ${({ theme }) => theme.colors.error.main};
  }
`;

const CarSearchSystemNewDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const CarSearchSystemNewInput = styled.input`
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

const CarSearchSystemNewRange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CarSearchSystemNewRangeInput = styled.input`
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

const CarSearchSystemNewRangeSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CarSearchSystemNewActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const CarSearchSystemNewButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.primary.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.primary.main : 'transparent'
  };
  color: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.primary.contrastText : theme.colors.text.primary
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) => 
      $variant === 'primary' ? theme.colors.primary.dark : theme.colors.grey[100]
    };
    border-color: ${({ theme, $variant }) => 
      $variant === 'primary' ? theme.colors.primary.dark : theme.colors.grey[400]
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CarSearchSystemNew: React.FC<CarSearchSystemNewProps> = ({
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
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [isFiltersOpen, setIsFiltersOpen] = useState(showFilters);
  const [activeTab, setActiveTab] = useState('search');
  const [showSuggestionsState, setShowSuggestionsState] = useState(false);

  const tabs = [
    { id: 'search', label: t('carSearch.tabs.search'), icon: <Search size={16} /> },
    { id: 'filters', label: t('carSearch.tabs.filters'), icon: <Filter size={16} /> },
    { id: 'popular', label: t('carSearch.tabs.popular'), icon: <Star size={16} /> },
    { id: 'trending', label: t('carSearch.tabs.trending'), icon: <TrendingUp size={16} /> },
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
          <CarSearchSystemNewRange>
            <CarSearchSystemNewRangeInput
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
            <CarSearchSystemNewRangeSeparator>to</CarSearchSystemNewRangeSeparator>
            <CarSearchSystemNewRangeInput
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
              <CarSearchSystemNewRangeSeparator>{filter.unit}</CarSearchSystemNewRangeSeparator>
            )}
          </CarSearchSystemNewRange>
        );

      case 'date':
        return (
          <CarSearchSystemNewInput
            type="date"
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'location':
        return (
          <CarSearchSystemNewInput
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <CarSearchSystemNewInput
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );
    }
  };



  return (
    <CarSearchSystemNewContainer className={className} style={style}>
      <CarSearchSystemNewHeader>
        <CarSearchSystemNewTitle>
          {t('carSearch.title')}
        </CarSearchSystemNewTitle>
        <CarSearchSystemNewToggles>
          <CarSearchSystemNewToggle onClick={handleToggleAdvanced}>
            <Filter size={16} />
            {isAdvancedOpen ? t('carSearch.hideAdvanced') : t('carSearch.showAdvanced')}
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CarSearchSystemNewToggle>
          <CarSearchSystemNewToggle onClick={handleToggleFilters}>
            <Filter size={16} />
            {isFiltersOpen ? t('carSearch.hideFilters') : t('carSearch.showFilters')}
            {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CarSearchSystemNewToggle>
        </CarSearchSystemNewToggles>
      </CarSearchSystemNewHeader>

      <CarSearchSystemNewContent>
        <CarSearchSystemNewSearch>
          <CarSearchSystemNewTabs>
            <SearchTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              variant="pills"
              size="md"
            />
          </CarSearchSystemNewTabs>

          <CarSearchSystemNewForm onSubmit={handleSubmit}>
            {isAdvancedOpen && (
              <CarSearchSystemNewSection>
                <CarSearchSystemNewSectionTitle>
                  {t('carSearch.advanced.title')}
                </CarSearchSystemNewSectionTitle>
                <CarSearchSystemNewRow>
                  {filters.filter(f => f.type === 'range' || f.type === 'date' || f.type === 'location').map((filter) => (
                    <CarSearchSystemNewField key={filter.id}>
                      <CarSearchSystemNewLabel required={filter.required || false}>
                        {filter.label}
                      </CarSearchSystemNewLabel>
                      {filter.description && (
                        <CarSearchSystemNewDescription>{filter.description}</CarSearchSystemNewDescription>
                      )}
                      {renderFilter(filter)}
                    </CarSearchSystemNewField>
                  ))}
                </CarSearchSystemNewRow>
              </CarSearchSystemNewSection>
            )}

            {isFiltersOpen && (
              <CarSearchSystemNewSection>
                <CarSearchSystemNewSectionTitle>
                  {t('carSearch.filters.title')}
                </CarSearchSystemNewSectionTitle>
                <CarSearchSystemNewRow>
                  {filters.filter(f => f.type === 'select' || f.type === 'checkbox').map((filter) => (
                    <CarSearchSystemNewField key={filter.id}>
                      <CarSearchSystemNewLabel required={filter.required || false}>
                        {filter.label}
                      </CarSearchSystemNewLabel>
                      {filter.description && (
                        <CarSearchSystemNewDescription>{filter.description}</CarSearchSystemNewDescription>
                      )}
                      {renderFilter(filter)}
                    </CarSearchSystemNewField>
                  ))}
                </CarSearchSystemNewRow>
              </CarSearchSystemNewSection>
            )}

            <CarSearchSystemNewActions>
              <CarSearchSystemNewButton
                type="button"
                $variant="secondary"
                onClick={handleReset}
              >
                <X size={16} />
                {t('carSearch.reset')}
              </CarSearchSystemNewButton>
              <CarSearchSystemNewButton
                type="submit"
                $variant="primary"
                disabled={loading}
              >
                <Search size={16} />
                {loading ? t('carSearch.searching') : t('carSearch.search')}
              </CarSearchSystemNewButton>
            </CarSearchSystemNewActions>
          </CarSearchSystemNewForm>
        </CarSearchSystemNewSearch>

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
      </CarSearchSystemNewContent>
    </CarSearchSystemNewContainer>
  );
};

export default CarSearchSystemNew;