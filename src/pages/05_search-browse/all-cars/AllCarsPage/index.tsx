import { logger } from '@/services/logger-service';
// AllCarsPage.tsx - All Cars with Simple Filters
// ⚡ Compact & Professional Design
// ✅ CRITICAL FIX: Search across ALL vehicle collections

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import CarCardCompact from '@/components/CarCard/CarCardCompact';
import { CarListing } from '@/types/CarListing';
import { Car, Search, Filter, X } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

// ✅ ALL VEHICLE COLLECTIONS
const VEHICLE_COLLECTIONS = [
  'cars',             // Legacy collection
  'passenger_cars',   // Personal cars
  'suvs',             // SUVs/Jeeps
  'vans',             // Vans/Cargo
  'motorcycles',      // Motorcycles
  'trucks',           // Trucks
  'buses'             // Buses
] as const;

const AllCarsPage: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
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
      const makes = Array.from(new Set(cars.map((car: any) => car.make).filter(Boolean))).sort();
      setAvailableMakes(makes);
    }
  }, [cars]);

  const loadCars = async () => {
    try {
      setLoading(true);
      logger.info('Loading cars from all collections...');
      
      // ✅ CRITICAL FIX: Query ALL vehicle type collections in parallel
      const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
        try {
          const q = query(
            collection(db, collectionName),
            where('status', '==', 'active'),
            orderBy('createdAt', sortBy === 'newest' ? 'desc' : 'asc')
          );
          
          const snapshot = await getDocs(q);
          const carsData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as CarListing[];
          
          logger.debug(`Found ${carsData.length} cars in ${collectionName}`);
          return carsData;
        } catch (error) {
          logger.warn(`Error querying ${collectionName}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(queryPromises);
      const allCars = results.flat();
      
      logger.info(`Total cars loaded: ${allCars.length} from ${VEHICLE_COLLECTIONS.length} collections`);
      setCars(allCars);
    } catch (error) {
      logger.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars.filter((car: any) => {
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
    new Set(cars.map((car: any) => car.year).filter(Boolean))
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
            {filteredCars.map((car: any) => (
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
  background: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[900] : '#ffffff'};
  min-height: 100vh;
  transition: background-color 0.3s ease;

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
    color: #3B82F6;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[100] : '#333'};
    transition: color 0.3s ease;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 0.95rem;
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#666'};
    transition: color 0.3s ease;
  }
`;

const FilterBar = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[800] : 'white'};
  border: 1px solid ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[700] : '#e0e0e0'};
  border-radius: 10px;
  transition: all 0.3s ease;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[700] : '#f9f9f9'};
  border: 1px solid ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[600] : '#e0e0e0'};
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  svg {
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#999'};
    flex-shrink: 0;
    transition: color 0.3s ease;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[100] : '#333'};
  transition: color 0.3s ease;

  &::placeholder {
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#999'};
    transition: color 0.3s ease;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#999'};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[200] : '#333'};
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
  color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[300] : '#666'};
  transition: color 0.3s ease;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[600] : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[700] : 'white'};
  font-size: 0.9rem;
  color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[100] : '#333'};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3B82F6;
  }

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  option {
    background: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[800] : 'white'};
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[100] : '#333'};
  }
`;

const ResultsSummary = styled.div`
  font-size: 0.9rem;
  color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#666'};
  margin-bottom: 16px;
  transition: color 0.3s ease;

  strong {
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[200] : '#333'};
    font-weight: 600;
    transition: color 0.3s ease;
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
  color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#999'};
  transition: color 0.3s ease;
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
    color: ${props => (props.theme as any).mode === 'dark' ? (props.theme as any).colors.grey[400] : '#999'};
    transition: color 0.3s ease;
  }
`;



