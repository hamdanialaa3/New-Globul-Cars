import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Calendar, Euro } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import SearchableSelect from './SearchableSelect';
import CheckboxGrid from './CheckboxGrid';

interface DetailedSearchOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface DetailedSearchFilter {
  id: string;
  label: string;
  type: 'select' | 'checkbox' | 'range' | 'text' | 'date' | 'location';
  options?: DetailedSearchOption[];
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

interface DetailedSearchProps {
  filters: DetailedSearchFilter[];
  onSearch: (filters: Record<string, any>) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showAdvanced?: boolean;
  onToggleAdvanced?: (show: boolean) => void;
  showFilters?: boolean;
  onToggleFilters?: (show: boolean) => void;
}

const DetailedSearchContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const DetailedSearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DetailedSearchTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const DetailedSearchToggles = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailedSearchToggle = styled.button`
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

const DetailedSearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const DetailedSearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailedSearchSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const DetailedSearchRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const DetailedSearchField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DetailedSearchLabel = styled.label<{ required: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &::after {
    content: ${({ required }) => (required ? ' *' : '')};
    color: ${({ theme }) => theme.colors.error.main};
  }
`;

const DetailedSearchDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const DetailedSearchInput = styled.input`
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

const DetailedSearchRange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DetailedSearchRangeInput = styled.input`
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

const DetailedSearchRangeSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const DetailedSearchActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const DetailedSearchButton = styled.button<{ variant: 'primary' | 'secondary' }>`
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

const DetailedSearch: React.FC<DetailedSearchProps> = ({
  filters,
  onSearch,
  onReset,
  loading = false,
  className,
  style,
  showAdvanced = false,
  onToggleAdvanced,
  showFilters = false,
  onToggleFilters,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [isFiltersOpen, setIsFiltersOpen] = useState(showFilters);

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

  const renderFilter = (filter: DetailedSearchFilter) => {
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
          <DetailedSearchRange>
            <DetailedSearchRangeInput
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
            <DetailedSearchRangeSeparator>to</DetailedSearchRangeSeparator>
            <DetailedSearchRangeInput
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
              <DetailedSearchRangeSeparator>{filter.unit}</DetailedSearchRangeSeparator>
            )}
          </DetailedSearchRange>
        );

      case 'date':
        return (
          <DetailedSearchInput
            type="date"
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'location':
        return (
          <DetailedSearchInput
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <DetailedSearchInput
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
  }, {} as Record<string, DetailedSearchFilter[]>);

  return (
    <DetailedSearchContainer className={className} style={style}>
      <DetailedSearchHeader>
        <DetailedSearchTitle>{t('detailedSearch.title', 'Detailed Search')}</DetailedSearchTitle>
        <DetailedSearchToggles>
          <DetailedSearchToggle onClick={handleToggleAdvanced}>
            <Filter size={16} />
            {isAdvancedOpen ? 'Hide Advanced' : 'Show Advanced'}
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </DetailedSearchToggle>
          <DetailedSearchToggle onClick={handleToggleFilters}>
            <Filter size={16} />
            {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </DetailedSearchToggle>
        </DetailedSearchToggles>
      </DetailedSearchHeader>

      <DetailedSearchForm onSubmit={handleSubmit}>
        {isAdvancedOpen && (
          <DetailedSearchSection>
            <DetailedSearchSectionTitle>{t('detailedSearch.advanced.title', 'Advanced Options')}</DetailedSearchSectionTitle>
            <DetailedSearchRow>
              {filters.filter(f => f.type === 'range' || f.type === 'date' || f.type === 'location').map((filter) => (
                <DetailedSearchField key={filter.id}>
                  <DetailedSearchLabel required={filter.required || false}>
                    {filter.label}
                  </DetailedSearchLabel>
                  {filter.description && (
                    <DetailedSearchDescription>{filter.description}</DetailedSearchDescription>
                  )}
                  {renderFilter(filter)}
                </DetailedSearchField>
              ))}
            </DetailedSearchRow>
          </DetailedSearchSection>
        )}

        {isFiltersOpen && (
          <DetailedSearchSection>
            <DetailedSearchSectionTitle>{t('detailedSearch.filters.title', 'Filters')}</DetailedSearchSectionTitle>
            <DetailedSearchRow>
              {filters.filter(f => f.type === 'select' || f.type === 'checkbox').map((filter) => (
                <DetailedSearchField key={filter.id}>
                  <DetailedSearchLabel required={filter.required || false}>
                    {filter.label}
                  </DetailedSearchLabel>
                  {filter.description && (
                    <DetailedSearchDescription>{filter.description}</DetailedSearchDescription>
                  )}
                  {renderFilter(filter)}
                </DetailedSearchField>
              ))}
            </DetailedSearchRow>
          </DetailedSearchSection>
        )}

        <DetailedSearchActions>
          <DetailedSearchButton
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            <X size={16} />
            {t('detailedSearch.reset', 'Reset')}
          </DetailedSearchButton>
          <DetailedSearchButton
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <Search size={16} />
            {loading ? t('detailedSearch.searching', 'Searching...') : t('detailedSearch.search', 'Search')}
          </DetailedSearchButton>
        </DetailedSearchActions>
      </DetailedSearchForm>
    </DetailedSearchContainer>
  );
};

export default DetailedSearch;