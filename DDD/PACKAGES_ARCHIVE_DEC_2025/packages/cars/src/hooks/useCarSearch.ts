// useCarSearch Hook - Moved to @globul-cars/cars package
// Updated imports to use package aliases

import { useState, useEffect, useCallback } from 'react';
import { FiltersType, OptionType } from '../types';
import {
  getAllMakes,
  getModelsForMake,
  getGenerationsForModel,
  getBodyStylesForGeneration
} from '@globul-cars/core/constants/carData';

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

  const [makes] = useState<OptionType[]>(getAllMakes());
  const [models, setModels] = useState<OptionType[]>([]);
  const [generations, setGenerations] = useState<OptionType[]>([]);
  const [bodyStyles, setBodyStyles] = useState<OptionType[]>([]);

  useEffect(() => {
    if (filters.make) {
      const newModels = getModelsForMake(filters.make);
      setModels(newModels);
    } else {
      setModels([]);
    }
    setFilters(prev => ({ ...prev, model: '', generation: '', bodyStyle: '' }));
  }, [filters.make]);

  useEffect(() => {
    if (filters.model) {
      const newGenerations = getGenerationsForModel(filters.make, filters.model);
      setGenerations(newGenerations);
    } else {
      setGenerations([]);
    }
    setFilters(prev => ({ ...prev, generation: '', bodyStyle: '' }));
  }, [filters.model, filters.make]);

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
    console.log('Searching with filters:', filters);
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

export default useCarSearch;

