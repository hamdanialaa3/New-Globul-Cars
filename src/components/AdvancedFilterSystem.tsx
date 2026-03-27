import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Filter, X, ChevronDown, ChevronUp, Search, Star, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import SearchableSelect from './SearchableSelect';
import CheckboxGrid from './CheckboxGrid';
import SearchTabs from './SearchTabs';

interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'checkbox' | 'range' | 'text' | 'date' | 'location';
  options?: FilterOption[];
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  description?: string;
  showCounts?: boolean;
  showSearch?: boolean;
  groupBy?: boolean;
  maxSelections?: number;
}

interface AdvancedFilterSystemProps {
  filterGroups: FilterGroup[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showAdvanced?: boolean;
  onToggleAdvanced?: (show: boolean) => void;
  showFilters?: boolean;
  onToggleFilters?: (show: boolean) => void;
  showTabs?: boolean;
  onTabChange?: (tabId: string) => void;
  activeTab?: string;
  showCounts?: boolean;
  showSearch?: boolean;
  showGroupBy?: boolean;
  maxSelections?: number;
}

const AdvancedFilterSystemContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AdvancedFilterSystemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedFilterSystemTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const AdvancedFilterSystemToggles = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AdvancedFilterSystemToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
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

const AdvancedFilterSystemTabs = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedFilterSystemForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedFilterSystemSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AdvancedFilterSystemSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AdvancedFilterSystemRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const AdvancedFilterSystemField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AdvancedFilterSystemLabel = styled.label<{ required: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &::after {
    content: ${({ required }) => (required ? ' *' : '')};
    color: ${({ theme }) => theme.colors.error.main};
  }
`;

const AdvancedFilterSystemDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const AdvancedFilterSystemInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
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

const AdvancedFilterSystemRange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AdvancedFilterSystemRangeInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const AdvancedFilterSystemRangeSeparator = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const AdvancedFilterSystemActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AdvancedFilterSystemButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
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

const AdvancedFilterSystem: React.FC<AdvancedFilterSystemProps> = ({
  filterGroups,
  onFilterChange,
  onReset,
  loading = false,
  className,
  style,
  showAdvanced = false,
  onToggleAdvanced,
  showFilters = false,
  onToggleFilters,
  showTabs = true,
  onTabChange,
  activeTab = 'all',
  showCounts = true,
  showSearch = true,
  showGroupBy = true,
  maxSelections = 10,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [isFiltersOpen, setIsFiltersOpen] = useState(showFilters);

  const tabs = [
    { id: 'all', label: t('filterSystem.tabs.all', 'All Filters'), icon: <Filter size={16} /> },
    { id: 'basic', label: t('filterSystem.tabs.basic', 'Basic'), icon: <Search size={16} /> },
    { id: 'advanced', label: t('filterSystem.tabs.advanced', 'Advanced'), icon: <ChevronDown size={16} /> },
    { id: 'popular', label: t('filterSystem.tabs.popular', 'Popular'), icon: <Star size={16} /> },
    { id: 'trending', label: t('filterSystem.tabs.trending', 'Trending'), icon: <TrendingUp size={16} /> },
  ];

  useEffect(() => {
    const initialData: Record<string, any> = {};
    filterGroups.forEach(group => {
      if (group.type === 'checkbox') {
        initialData[group.id] = group.value || [];
      } else {
        initialData[group.id] = group.value || '';
      }
    });
    setFormData(initialData);
  }, [filterGroups]);

  const handleInputChange = (groupId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [groupId]: value
    }));
    onFilterChange({ ...formData, [groupId]: value });
  };

  const handleReset = () => {
    const resetData: Record<string, any> = {};
    filterGroups.forEach(group => {
      if (group.type === 'checkbox') {
        resetData[group.id] = [];
      } else {
        resetData[group.id] = '';
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
    onTabChange?.(tabId);
  };

  const renderFilter = (group: FilterGroup) => {
    switch (group.type) {
      case 'select':
        return (
          <SearchableSelect
            options={group.options || []}
            value={formData[group.id] || ''}
            onChange={(value) => handleInputChange(group.id, value)}
            placeholder={group.placeholder || `Select ${group.label}`}
            showSearch={group.showSearch !== false}
            groupBy={group.groupBy !== false}
          />
        );

      case 'checkbox':
        return (
          <CheckboxGrid
            options={group.options || []}
            value={formData[group.id] || []}
            onChange={(value) => handleInputChange(group.id, value)}
            columns={2}
            showDescriptions={true}
            showCounts={group.showCounts !== false}
            maxSelections={group.maxSelections || maxSelections}
          />
        );

      case 'range':
        return (
          <AdvancedFilterSystemRange>
            <AdvancedFilterSystemRangeInput
              type="number"
              placeholder="Min"
              value={formData[group.id]?.min || ''}
              onChange={(e) => handleInputChange(group.id, {
                ...formData[group.id],
                min: e.target.value ? Number(e.target.value) : undefined
              })}
              min={group.min}
              max={group.max}
              step={group.step}
            />
            <AdvancedFilterSystemRangeSeparator>to</AdvancedFilterSystemRangeSeparator>
            <AdvancedFilterSystemRangeInput
              type="number"
              placeholder="Max"
              value={formData[group.id]?.max || ''}
              onChange={(e) => handleInputChange(group.id, {
                ...formData[group.id],
                max: e.target.value ? Number(e.target.value) : undefined
              })}
              min={group.min}
              max={group.max}
              step={group.step}
            />
            {group.unit && (
              <AdvancedFilterSystemRangeSeparator>{group.unit}</AdvancedFilterSystemRangeSeparator>
            )}
          </AdvancedFilterSystemRange>
        );

      case 'date':
        return (
          <AdvancedFilterSystemInput
            type="date"
            value={formData[group.id] || ''}
            onChange={(e) => handleInputChange(group.id, e.target.value)}
          />
        );

      case 'location':
        return (
          <AdvancedFilterSystemInput
            type="text"
            placeholder={group.placeholder || `Enter ${group.label}`}
            value={formData[group.id] || ''}
            onChange={(e) => handleInputChange(group.id, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <AdvancedFilterSystemInput
            type="text"
            placeholder={group.placeholder || `Enter ${group.label}`}
            value={formData[group.id] || ''}
            onChange={(e) => handleInputChange(group.id, e.target.value)}
          />
        );
    }
  };

  const getFilterGroupsByTab = (tabId: string) => {
    switch (tabId) {
      case 'basic':
        return filterGroups.filter(g => g.type === 'select' || g.type === 'text');
      case 'advanced':
        return filterGroups.filter(g => g.type === 'range' || g.type === 'date' || g.type === 'location');
      case 'popular':
        return filterGroups.filter(g => g.showCounts !== false);
      case 'trending':
        return filterGroups.filter(g => g.showCounts !== false);
      case 'all':
      default:
        return filterGroups;
    }
  };

  const currentFilterGroups = getFilterGroupsByTab(activeTab);

  return (
    <AdvancedFilterSystemContainer className={className} style={style}>
      <AdvancedFilterSystemHeader>
        <AdvancedFilterSystemTitle>
          {t('filterSystem.title', 'Advanced Filter System')}
        </AdvancedFilterSystemTitle>
        <AdvancedFilterSystemToggles>
          <AdvancedFilterSystemToggle onClick={handleToggleAdvanced}>
            <Filter size={16} />
            {isAdvancedOpen ? 'Hide Advanced' : 'Show Advanced'}
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </AdvancedFilterSystemToggle>
          <AdvancedFilterSystemToggle onClick={handleToggleFilters}>
            <Filter size={16} />
            {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </AdvancedFilterSystemToggle>
        </AdvancedFilterSystemToggles>
      </AdvancedFilterSystemHeader>

      {showTabs && (
        <AdvancedFilterSystemTabs>
          <SearchTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="pills"
            size="md"
          />
        </AdvancedFilterSystemTabs>
      )}

      <AdvancedFilterSystemForm>
        {isAdvancedOpen && (
          <AdvancedFilterSystemSection>
            <AdvancedFilterSystemSectionTitle>
              {t('filterSystem.advanced.title', 'Advanced Options')}
            </AdvancedFilterSystemSectionTitle>
            <AdvancedFilterSystemRow>
              {currentFilterGroups.filter(g => g.type === 'range' || g.type === 'date' || g.type === 'location').map((group) => (
                <AdvancedFilterSystemField key={group.id}>
                  <AdvancedFilterSystemLabel required={group.required || false}>
                    {group.label}
                  </AdvancedFilterSystemLabel>
                  {group.description && (
                    <AdvancedFilterSystemDescription>{group.description}</AdvancedFilterSystemDescription>
                  )}
                  {renderFilter(group)}
                </AdvancedFilterSystemField>
              ))}
            </AdvancedFilterSystemRow>
          </AdvancedFilterSystemSection>
        )}

        {isFiltersOpen && (
          <AdvancedFilterSystemSection>
            <AdvancedFilterSystemSectionTitle>
              {t('filterSystem.filters.title', 'Filters')}
            </AdvancedFilterSystemSectionTitle>
            <AdvancedFilterSystemRow>
              {currentFilterGroups.filter(g => g.type === 'select' || g.type === 'checkbox' || g.type === 'text').map((group) => (
                <AdvancedFilterSystemField key={group.id}>
                  <AdvancedFilterSystemLabel required={group.required || false}>
                    {group.label}
                  </AdvancedFilterSystemLabel>
                  {group.description && (
                    <AdvancedFilterSystemDescription>{group.description}</AdvancedFilterSystemDescription>
                  )}
                  {renderFilter(group)}
                </AdvancedFilterSystemField>
              ))}
            </AdvancedFilterSystemRow>
          </AdvancedFilterSystemSection>
        )}

        <AdvancedFilterSystemActions>
          <AdvancedFilterSystemButton
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            <X size={16} />
            {t('filterSystem.reset', 'Reset')}
          </AdvancedFilterSystemButton>
          <AdvancedFilterSystemButton
            type="button"
            variant="primary"
            disabled={loading}
          >
            <Filter size={16} />
            {loading ? t('filterSystem.applying', 'Applying...') : t('filterSystem.apply', 'Apply Filters')}
          </AdvancedFilterSystemButton>
        </AdvancedFilterSystemActions>
      </AdvancedFilterSystemForm>
    </AdvancedFilterSystemContainer>
  );
};

export default AdvancedFilterSystem;
