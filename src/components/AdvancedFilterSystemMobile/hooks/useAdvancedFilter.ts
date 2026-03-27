// AdvancedFilterSystemMobile/hooks/useAdvancedFilter.ts
// (Comment removed - was in Arabic)

import { useState, useCallback } from 'react';
import { FilterValue, SectionState } from '../types';

export const useAdvancedFilter = (initialFilters: FilterValue = {}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basicData'])
  );
  const [filters, setFilters] = useState<FilterValue>(initialFilters);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const isSectionExpanded = useCallback((sectionId: string) => {
    return expandedSections.has(sectionId);
  }, [expandedSections]);

  const getSectionState = useCallback((): SectionState => {
    const state: SectionState = {};
    expandedSections.forEach(sectionId => {
      state[sectionId] = true;
    });
    return state;
  }, [expandedSections]);

  return {
    filters,
    expandedSections,
    toggleSection,
    updateFilter,
    resetFilters,
    isSectionExpanded,
    getSectionState
  };
};
