// نظام البحث الجديد المستوحى من netcarshow.com
// src/components/CarSearchSystem.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const SearchContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const SearchGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
`;

const SearchLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SearchSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: ${({ theme }) => theme.colors.background.paper};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
  }

  option {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

interface CarSearchSystemProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
}

const CarSearchSystem: React.FC<CarSearchSystemProps> = ({
  onSearch,
  initialFilters = {}
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    generation: '',
    bodyStyle: '',
    ...initialFilters
  });

  // بيانات تجريبية - سيتم استبدالها بالبيانات المستخرجة من netcarshow
  const [makes] = useState([
    { value: 'bmw', text: 'BMW' },
    { value: 'mercedes', text: 'Mercedes-Benz' },
    { value: 'audi', text: 'Audi' },
    { value: 'vw', text: 'Volkswagen' }
  ]);

  const [models, setModels] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [bodyStyles, setBodyStyles] = useState([]);

  // عند تغيير الشركة، تحديث الموديلات
  useEffect(() => {
    if (filters.make) {
      // هنا سيتم تحميل الموديلات من API أو البيانات المستخرجة
      const mockModels = [
        { value: 'x5', text: 'X5' },
        { value: 'x3', text: 'X3' },
        { value: 'm3', text: 'M3' }
      ];
      setModels(mockModels);
    } else {
      setModels([]);
    }
    // إعادة تعيين الموديل والجيل عند تغيير الشركة
    setFilters(prev => ({ ...prev, model: '', generation: '', bodyStyle: '' }));
  }, [filters.make]);

  // عند تغيير الموديل، تحديث الأجيال
  useEffect(() => {
    if (filters.model) {
      const mockGenerations = [
        { value: '2020-2023', text: '2020 - 2023' },
        { value: '2017-2019', text: '2017 - 2019' },
        { value: '2013-2016', text: '2013 - 2016' }
      ];
      setGenerations(mockGenerations);
    } else {
      setGenerations([]);
    }
    setFilters(prev => ({ ...prev, generation: '', bodyStyle: '' }));
  }, [filters.model]);

  // عند تغيير الجيل، تحديث أنواع الهيكل
  useEffect(() => {
    if (filters.generation) {
      const mockBodyStyles = [
        { value: 'suv', text: 'SUV' },
        { value: 'sedan', text: 'Sedan' },
        { value: 'coupe', text: 'Coupe' }
      ];
      setBodyStyles(mockBodyStyles);
    } else {
      setBodyStyles([]);
    }
    setFilters(prev => ({ ...prev, bodyStyle: '' }));
  }, [filters.generation]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <SearchContainer>
      <SearchGroup>
        <SearchLabel>{t('cars.search.make')}</SearchLabel>
        <SearchSelect
          value={filters.make}
          onChange={(e) => handleFilterChange('make', e.target.value)}
        >
          <option value="">{t('cars.search.selectMake')}</option>
          {makes.map(make => (
            <option key={make.value} value={make.value}>
              {make.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.model')}</SearchLabel>
        <SearchSelect
          value={filters.model}
          onChange={(e) => handleFilterChange('model', e.target.value)}
          disabled={!filters.make}
        >
          <option value="">{t('cars.search.selectModel')}</option>
          {models.map(model => (
            <option key={model.value} value={model.value}>
              {model.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.generation')}</SearchLabel>
        <SearchSelect
          value={filters.generation}
          onChange={(e) => handleFilterChange('generation', e.target.value)}
          disabled={!filters.model}
        >
          <option value="">{t('cars.search.selectGeneration')}</option>
          {generations.map(gen => (
            <option key={gen.value} value={gen.value}>
              {gen.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup>
        <SearchLabel>{t('cars.search.bodyStyle')}</SearchLabel>
        <SearchSelect
          value={filters.bodyStyle}
          onChange={(e) => handleFilterChange('bodyStyle', e.target.value)}
          disabled={!filters.generation}
        >
          <option value="">{t('cars.search.selectBodyStyle')}</option>
          {bodyStyles.map(style => (
            <option key={style.value} value={style.value}>
              {style.text}
            </option>
          ))}
        </SearchSelect>
      </SearchGroup>

      <SearchGroup style={{ alignSelf: 'flex-end' }}>
        <button onClick={handleSearch} style={{ padding: '12px 24px' }}>
          {t('cars.search.search')}
        </button>
      </SearchGroup>
    </SearchContainer>
  );
};

export default CarSearchSystem;