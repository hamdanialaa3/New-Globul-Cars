import { logger } from '../../../../services/logger-service';
// AllCarsPage.tsx - All Cars with Simple Filters
// ⚡ Compact & Professional Design

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';
import CarCardCompact from '../../../../components/CarCard/CarCardCompact';
import { CarListing } from '../../../../types/CarListing';
import { Car, Search, Filter, X } from 'lucide-react';
import { ResponsiveGrid } from '../../../../components/layout/ResponsiveGrid';

const AllCarsPage: React.FC = () => {
  const { language } = useLanguage();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMake, setFilterMake] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);

  useEffect(() => {
    loadCars();
  }, [sortBy]);

  useEffect(() => {
    if (cars.length > 0) {
      const makes = Array.from(new Set(cars.map(car => car.make).filter(Boolean))).sort();
      setAvailableMakes(makes);
    }
  }, [cars]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'cars'),
        where('status', '==', 'active'),
        orderBy('createdAt', sortBy === 'newest' ? 'desc' : 'asc')
      );
      
      const snapshot = await getDocs(q);
      const carsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListing[];
      
      setCars(carsData);
    } catch (error) {
      logger.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars.filter(car => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!car.make?.toLowerCase().includes(query) &&
          !car.model?.toLowerCase().includes(query) &&
          !car.description?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Make filter
    if (filterMake !== 'all' && car.make !== filterMake) {
      return false;
    }

    // Year filter
    if (filterYear !== 'all') {
      const year = parseInt(filterYear);
      if (car.year !== year) {
        return false;
      }
    }

    return true;
  });

  // Get available years
  const availableYears = Array.from(
    new Set(cars.map(car => car.year).filter(Boolean))
  ).sort((a, b) => b! - a!);

  const t = {
    bg: {
      title: 'Всички автомобили',
      subtitle: 'Преглед на всички добавени автомобили',
      search: 'Търсене по марка, модел...',
      make: 'Марка',
      year: 'Година',
      sortBy: 'Сортиране',
      newest: 'Най-нови',
      oldest: 'Най-стари',
      all: 'Всички',
      noResults: 'Няма намерени автомобили',
      total: 'Общо',
      cars: 'автомобила'
    },
    en: {
      title: 'All Cars',
      subtitle: 'Browse all added cars',
      search: 'Search by make, model...',
      make: 'Make',
      year: 'Year',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      all: 'All',
      noResults: 'No cars found',
      total: 'Total',
      cars: 'cars'
    }
  };

  const text = t[language as 'bg' | 'en'];

  return (
    <Container>
      <Header>
        <Car size={24} />
        <div>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
      </Header>

      {/* Simple Filter Bar */}
      <FilterBar>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput
            type="text"
            placeholder={text.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <ClearButton onClick={() => setSearchQuery('')}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchWrapper>

        <FilterRow>
          <FilterGroup>
            <FilterLabel>{text.make}</FilterLabel>
            <FilterSelect
              value={filterMake}
              onChange={(e) => setFilterMake(e.target.value)}
            >
              <option value="all">{text.all}</option>
              {availableMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{text.year}</FilterLabel>
            <FilterSelect
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">{text.all}</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{text.sortBy}</FilterLabel>
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">{text.newest}</option>
              <option value="oldest">{text.oldest}</option>
            </FilterSelect>
          </FilterGroup>
        </FilterRow>
      </FilterBar>

      {/* Results Summary */}
      <ResultsSummary>
        {text.total}: <strong>{filteredCars.length}</strong> {text.cars}
      </ResultsSummary>

      {/* Cars Grid */}
      {loading ? (
        <LoadingState>
          <div>Loading...</div>
        </LoadingState>
      ) : filteredCars.length === 0 ? (
        <EmptyState>
          <Car size={48} color="#ccc" />
          <h3>{text.noResults}</h3>
        </EmptyState>
      ) : (
        <CarsGridWrapper>
          <ResponsiveGrid
            columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            gap={20}
          >
            {filteredCars.map(car => (
              <CarCardCompact key={car.id} car={car} />
            ))}
          </ResponsiveGrid>
        </CarsGridWrapper>
      )}
    </Container>
  );
};

export default AllCarsPage;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  svg {
    color: #FF8F10;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 0.95rem;
    color: #666;
  }
`;

const FilterBar = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;

  svg {
    color: #999;
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #333;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 150px;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #FF8F10;
  }

  &:focus {
    outline: none;
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
`;

const ResultsSummary = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 16px;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

const CarsGridWrapper = styled.div`
  margin-top: 24px;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #999;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  h3 {
    margin: 16px 0 0 0;
    font-size: 1.2rem;
    color: #999;
  }
`;

