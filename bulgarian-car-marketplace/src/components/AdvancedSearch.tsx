import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import SearchableSelect from './SearchableSelect';
import CheckboxGrid from './CheckboxGrid';

interface AdvancedSearchOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface AdvancedSearchFilter {
  id: string;
  label: string;
  type: 'select' | 'checkbox' | 'range' | 'text';
  options?: AdvancedSearchOption[];
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface AdvancedSearchProps {
  filters: AdvancedSearchFilter[];
  onSearch: (filters: Record<string, any>) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showAdvanced?: boolean;
  onToggleAdvanced?: (show: boolean) => void;
}

const AdvancedSearchContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AdvancedSearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedSearchTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const AdvancedSearchToggle = styled.button`
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

const AdvancedSearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedSearchRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedSearchField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AdvancedSearchLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AdvancedSearchInput = styled.input`
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

const AdvancedSearchRange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AdvancedSearchRangeInput = styled.input`
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

const AdvancedSearchRangeSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const AdvancedSearchActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AdvancedSearchButton = styled.button<{ variant: 'primary' | 'secondary' }>`
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

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onSearch,
  onReset,
  loading = false,
  className,
  style,
  showAdvanced = false,
  onToggleAdvanced,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);

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

  const renderFilter = (filter: AdvancedSearchFilter) => {
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
          <AdvancedSearchRange>
            <AdvancedSearchRangeInput
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
            <AdvancedSearchRangeSeparator>to</AdvancedSearchRangeSeparator>
            <AdvancedSearchRangeInput
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
              <AdvancedSearchRangeSeparator>{filter.unit}</AdvancedSearchRangeSeparator>
            )}
          </AdvancedSearchRange>
        );

      case 'text':
      default:
        return (
          <AdvancedSearchInput
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={formData[filter.id] || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );
    }
  };

  return (
    <AdvancedSearchContainer className={className} style={style}>
      <AdvancedSearchHeader>
        <AdvancedSearchTitle>{t('advancedSearch.title', 'Advanced Search')}</AdvancedSearchTitle>
        <AdvancedSearchToggle onClick={handleToggleAdvanced}>
          <Filter size={16} />
          {isAdvancedOpen ? 'Hide Filters' : 'Show Filters'}
          {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </AdvancedSearchToggle>
      </AdvancedSearchHeader>

      <AdvancedSearchForm onSubmit={handleSubmit}>
        {isAdvancedOpen && (
          <AdvancedSearchRow>
            {filters.map((filter) => (
              <AdvancedSearchField key={filter.id}>
                <AdvancedSearchLabel>{filter.label}</AdvancedSearchLabel>
                {renderFilter(filter)}
              </AdvancedSearchField>
            ))}
          </AdvancedSearchRow>
        )}

        <AdvancedSearchActions>
          <AdvancedSearchButton
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            <X size={16} />
            {t('advancedSearch.reset', 'Reset')}
          </AdvancedSearchButton>
          <AdvancedSearchButton
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <Search size={16} />
            {loading ? t('advancedSearch.searching', 'Searching...') : t('advancedSearch.search', 'Search')}
          </AdvancedSearchButton>
        </AdvancedSearchActions>
      </AdvancedSearchForm>
    </AdvancedSearchContainer>
  );
};

export default AdvancedSearch;