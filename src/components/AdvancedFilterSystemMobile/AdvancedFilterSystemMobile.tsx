// AdvancedFilterSystemMobile/AdvancedFilterSystemMobile.tsx
// (Comment removed - was in Arabic)

import React from 'react';
import { ChevronDown, ChevronUp, Search, Save, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAdvancedFilter } from './hooks/useAdvancedFilter';
import { AdvancedFilterSystemMobileProps } from './types';
import {
  FilterContainer,
  FilterHeader,
  FilterTitle,
  FilterActions,
  FilterButton,
  FilterSections,
  FilterSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  FilterGrid,
  FilterGroup,
  FilterLabel,
  FilterSelect
} from './styles';

const AdvancedFilterSystemMobile: React.FC<AdvancedFilterSystemMobileProps> = ({
  onSearch,
  onReset,
  onSaveSearch,
  loading = false
}) => {
  const { t } = useLanguage();
  const {
    filters,
    toggleSection,
    updateFilter,
    resetFilters,
    isSectionExpanded
  } = useAdvancedFilter();

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    resetFilters();
    onReset();
  };

  const handleSaveSearch = () => {
    if (onSaveSearch) {
      onSaveSearch(filters);
    }
  };

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
                  onChange={(e) => updateFilter('make', e.target.value === 'any' ? '' : e.target.value)}
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
                </FilterSelect>
              </FilterGroup>
            </FilterGrid>
          </SectionContent>
        </FilterSection>
      </FilterSections>
    </FilterContainer>
  );
};

export default AdvancedFilterSystemMobile;