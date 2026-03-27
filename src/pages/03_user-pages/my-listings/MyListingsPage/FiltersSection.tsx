// src/pages/MyListingsPage/FiltersSection.tsx
// Filters section component for MyListingsPage

import React from 'react';
import { MyListingsFilters } from './types';
import { SectionContainer, FiltersBar } from './styles';
import { useLanguage } from '@/contexts/LanguageContext';

interface FiltersSectionProps {
  filters: MyListingsFilters;
  onFiltersChange: (filters: MyListingsFilters) => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ filters, onFiltersChange }) => {
  const { t } = useLanguage();
  
  const handleFilterChange = (key: keyof MyListingsFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <SectionContainer>
      <FiltersBar>
        <div className="filter-group">
          <label htmlFor="status-filter">Статус:</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">Всички</option>
            <option value="active">Активни</option>
            <option value="sold">Продадени</option>
            <option value="pending">В изчакване</option>
            <option value="inactive">Неактивни</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Сортирай по:</label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
          >
            <option value="date">Дата</option>
            <option value="price">Цена</option>
            <option value="views">Прегледи</option>
            <option value="inquiries">Запитвания</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="order-filter">Подредба:</label>
          <select
            id="order-filter"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as any)}
          >
            <option value="desc">Низходящо</option>
            <option value="asc">Възходящо</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-filter">Търсене:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Търси обяви..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </FiltersBar>
    </SectionContainer>
  );
};

export default FiltersSection;
