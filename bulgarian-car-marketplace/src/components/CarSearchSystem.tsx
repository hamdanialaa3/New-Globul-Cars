// src/components/CarSearchSystem.tsx
// نظام البحث الجديد المستوحى من netcarshow.com

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import {
  getAllMakes,
  getModelsForMake,
  getGenerationsForModel,
  getBodyStylesForGeneration
} from '../constants/carData';

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
`;

const SearchLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const SearchSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
  }

  option {
    padding: 8px;
  }
`;

interface OptionType {
  value: string;
  text: string;
}

interface FiltersType {
  make: string;
  model: string;
  generation: string;
  bodyStyle: string;
}

interface CarSearchSystemProps {
  onSearch: (filters: FiltersType) => void;
  initialFilters?: Partial<FiltersType>;
}

const CarSearchSystem: React.FC<CarSearchSystemProps> = ({
  onSearch,
  initialFilters = {}
}) => {
  const { t } = useTranslation();
  
  const [filters, setFilters] = useState<FiltersType>({
    make: '',
    model: '',
    generation: '',
    bodyStyle: '',
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <SearchContainer>
      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.make')}</SearchLabel>
        <SearchSelect
          value={filters.make}
          onChange={(e) => handleFilterChange('make', e.target.value)}
        >
          <option value="">{t('detailedSearch.basicData.anyMake')}</option>
          {makes.map(make => (
            <option key={make.value} value={make.value}>
              {make.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.model')}</SearchLabel>
        <SearchSelect
          value={filters.model}
          onChange={(e) => handleFilterChange('model', e.target.value)}
          disabled={!filters.make}
        >
          <option value="">{t('detailedSearch.basicData.anyModel')}</option>
          {models.map(model => (
            <option key={model.value} value={model.value}>
              {model.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.generation')}</SearchLabel>
        <SearchSelect
          value={filters.generation}
          onChange={(e) => handleFilterChange('generation', e.target.value)}
          disabled={!filters.model}
        >
          <option value="">{t('detailedSearch.basicData.anyGeneration')}</option>
          {generations.map(gen => (
            <option key={gen.value} value={gen.value}>
              {gen.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('detailedSearch.basicData.bodyStyle')}</SearchLabel>
        <SearchSelect
          value={filters.bodyStyle}
          onChange={(e) => handleFilterChange('bodyStyle', e.target.value)}
          disabled={!filters.generation}
        >
          <option value="">{t('detailedSearch.basicData.anyBodyStyle')}</option>
          {bodyStyles.map(style => (
            <option key={style.value} value={style.value}>
              {style.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup style={{ alignSelf: 'flex-end' }}>
        <button onClick={handleSearch} style={{
          padding: '12px 24px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          {t('detailedSearch.search')}
        </button>
      </SearchGroup>
    </SearchContainer>
  );
};

export default CarSearchSystem;