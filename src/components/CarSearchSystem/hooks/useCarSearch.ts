import { logger } from '../../../services/logger-service';
// CarSearchSystem/hooks/useCarSearch.ts
// (Comment removed - was in Arabic)

import { useState, useEffect, useCallback } from 'react';
import { FiltersType, OptionType } from '../types';
import {
  getAllMakes,
  getModelsForMake,
  getGenerationsForModel,
  getBodyStylesForGeneration
} from '../../../constants/carData';

export const useCarSearch = (initialFilters: Partial<FiltersType> = {}) => {
  const [filters, setFilters] = useState<FiltersType>({
    make: '',
    model: '',
    generation: '',
    bodyStyle: '',
    fuelType: '',
    registeredInBulgaria: '',
    environmentalTaxPaid: '',
    technicalInspectionDate: '',
    ...initialFilters
  });

  // (Comment removed - was in Arabic)
  const [makes] = useState<OptionType[]>(getAllMakes());
  const [models, setModels] = useState<OptionType[]>([]);
  const [generations, setGenerations] = useState<OptionType[]>([]);
  const [bodyStyles, setBodyStyles] = useState<OptionType[]>([]);

  // (Comment removed - was in Arabic)
  useEffect(() => {
    if (filters.make) {
      const newModels = getModelsForMake(filters.make);
      setModels(newModels);
    } else {
      setModels([]);
    }
    // (Comment removed - was in Arabic)
    setFilters(prev => ({ ...prev, model: '', generation: '', bodyStyle: '' }));
  }, [filters.make]);

  // (Comment removed - was in Arabic)
  useEffect(() => {
    if (filters.model) {
      const newGenerations = getGenerationsForModel(filters.make, filters.model);
      setGenerations(newGenerations);
    } else {
      setGenerations([]);
    }
    setFilters(prev => ({ ...prev, generation: '', bodyStyle: '' }));
  }, [filters.model, filters.make]);

  // (Comment removed - was in Arabic)
  useEffect(() => {
    if (filters.generation) {
      const newBodyStyles = getBodyStylesForGeneration(filters.make, filters.model, filters.generation);
      setBodyStyles(newBodyStyles);
    } else {
      setBodyStyles([]);
    }
    setFilters(prev => ({ ...prev, bodyStyle: '' }));
  }, [filters.generation, filters.make, filters.model]);

  const updateFilter = useCallback((key: keyof FiltersType, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      make: '',
      model: '',
      generation: '',
      bodyStyle: '',
      fuelType: '',
      registeredInBulgaria: '',
      environmentalTaxPaid: '',
      technicalInspectionDate: ''
    });
  }, []);

  const searchCars = useCallback(() => {
    // (Comment removed - was in Arabic)
    logger.info('Searching with filters', { filters: filters as unknown as Record<string, unknown> });
    // (Comment removed - was in Arabic)
  }, [filters]);

  return {
    filters,
    makes,
    models,
    generations,
    bodyStyles,
    updateFilter,
    resetFilters,
    searchCars
  };
};
