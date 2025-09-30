// CarSearchSystem/hooks/useCarSearch.ts
// خطاف مخصص لإدارة منطق البحث في السيارات

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

  // بيانات تجريبية - سيتم استبدالها بالبيانات المستخرجة من netcarshow
  const [makes] = useState<OptionType[]>(getAllMakes());
  const [models, setModels] = useState<OptionType[]>([]);
  const [generations, setGenerations] = useState<OptionType[]>([]);
  const [bodyStyles, setBodyStyles] = useState<OptionType[]>([]);

  // عند تغيير الشركة، تحديث الموديلات
  useEffect(() => {
    if (filters.make) {
      const newModels = getModelsForMake(filters.make);
      setModels(newModels);
    } else {
      setModels([]);
    }
    // إعادة تعيين الموديل والجيل عند تغيير الشركة
    setFilters(prev => ({ ...prev, model: '', generation: '', bodyStyle: '' }));
  }, [filters.make]);

  // عند تغيير الموديل، تحديث الأجيال
  useEffect(() => {
    if (filters.model) {
      const newGenerations = getGenerationsForModel(filters.make, filters.model);
      setGenerations(newGenerations);
    } else {
      setGenerations([]);
    }
    setFilters(prev => ({ ...prev, generation: '', bodyStyle: '' }));
  }, [filters.model, filters.make]);

  // عند تغيير الجيل، تحديث أنواع الهيكل
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
    // منطق البحث في السيارات
    console.log('البحث بالفلاتر:', filters);
    // هنا سيتم تنفيذ منطق البحث الفعلي
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