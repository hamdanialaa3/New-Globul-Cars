/**
 * User Favorites Page - Professional Favorites Management
 * 
 * Features:
 * - User-specific favorites display
 * - Advanced filters (Make, Model, Price, Year)
 * - Sort options (Date Added, Price, Year)
 * - Beautiful animations
 * - Empty state design
 * - Grid/List view toggle
 * - Real-time sync with Firestore
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as StyledComponents from 'styled-components';
import { Heart, Filter, Grid3x3, List, X } from 'lucide-react';

import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { favoritesService, FavoriteItem } from '../../services/favorites.service';
import { unifiedCarService, UnifiedCar } from '../../services/car';
import { logger } from '../../services/logger-service';
import { CarCardWithFavorites } from '../../components/CarCardWithFavorites';
import { brandsModelsDataService } from '../../services/brands-models-data.service';

const styled = StyledComponents.default;
const keyframes = StyledComponents.keyframes;

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const heartFloat = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-5px) rotate(5deg);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 80px;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 80px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  text-align: center;
`;

const HeroIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${heartFloat} 3s ease-in-out infinite;

  svg {
    width: 40px;
    height: 40px;
    color: #fff;
    fill: #fff;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: -60px auto 0;
  padding: 0 20px 60px;
  position: relative;
  z-index: 2;
`;

const ControlsBar = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  animation: ${fadeIn} 0.5s ease;
`;

const LeftControls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
`;

const RightControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: ${props => props.$active ? 'var(--accent-primary)' : 'var(--bg-secondary)'};
  color: ${props => props.$active ? '#fff' : 'var(--text-primary)'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--accent-primary)' : 'var(--bg-hover)'};
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? 'var(--accent-primary)' : 'transparent'};
  color: ${props => props.$active ? '#fff' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${props => props.$active ? 'var(--accent-primary)' : 'var(--bg-hover)'};
  }
`;

const FiltersPanel = styled.div<{ $isOpen: boolean }>`
  background: var(--bg-card);
  border-radius: 16px;
  padding: ${props => props.$isOpen ? '24px' : '0'};
  margin-bottom: ${props => props.$isOpen ? '30px' : '0'};
  box-shadow: ${props => props.$isOpen ? 'var(--shadow-lg)' : 'none'};
  border: 1px solid var(--border);
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.$isOpen ? '1' : '0'};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const ClearFiltersButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--danger);
    color: #fff;
    border-color: var(--danger);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
`;

const ResultsCount = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);

  span {
    color: var(--accent-primary);
  }
`;

const CarsGrid = styled.div<{ $viewMode: ViewMode }>`
  display: grid;
  grid-template-columns: ${props => props.$viewMode === 'grid' 
    ? 'repeat(auto-fill, minmax(280px, 1fr))' 
    : '1fr'};
  gap: 24px;
  animation: ${fadeIn} 0.5s ease;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: ${fadeIn} 0.5s ease;
`;

const EmptyIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 60px;
    height: 60px;
    color: var(--text-secondary);
  }
`;

const EmptyTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const EmptyButton = styled.button`
  padding: 14px 32px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-hover) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: 12px;
  height: 400px;
`;

export const UserFavoritesPage: React.FC = () => {
  const { numericId } = useParams<{ numericId: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  // Filters
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterMinYear, setFilterMinYear] = useState('');
  const [filterMaxYear, setFilterMaxYear] = useState('');

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  // Load makes
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const allMakes = await brandsModelsDataService.getAllBrands();
        setMakes(allMakes);
      } catch (error) {
        logger.error('[Favorites] Failed to load makes', error as Error);
      }
    };
    loadMakes();
  }, []);

  // Load models when make changes
  useEffect(() => {
    const loadModels = async () => {
      if (!filterMake) {
        setModels([]);
        return;
      }
      try {
        const brandModels = await brandsModelsDataService.getModelsForBrand(filterMake);
        setModels(brandModels);
      } catch (error) {
        logger.error('[Favorites] Failed to load models', error as Error);
      }
    };
    loadModels();
  }, [filterMake]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if numeric ID matches current user
      if (numericId && user.uid) {
        // TODO: Validate numericId matches user's numeric ID
        // For now, just load favorites for current user
      }

      try {
        setLoading(true);
        const favs = await favoritesService.getUserFavorites(user.uid);
        setFavorites(favs);

        // Load car details and merge with favorite data (to get numeric IDs)
        const carPromises = favs.map(async (fav) => {
          const car = await unifiedCarService.getCarById(fav.carId).catch(() => null);
          if (car) {
            // ✅ Merge numeric IDs from FavoriteItem into car object
            return {
              ...car,
              carNumericId: fav.carNumericId,
              sellerNumericId: fav.sellerNumericId
            };
          }
          return null;
        });
        const carsData = await Promise.all(carPromises);
        setCars(carsData.filter(Boolean) as UnifiedCar[]);
      } catch (error) {
        logger.error('[Favorites] Failed to load favorites', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, numericId, navigate]);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    let result = [...cars];

    // Apply filters
    if (filterMake) {
      result = result.filter((car: any) => car.make === filterMake);
    }
    if (filterModel) {
      result = result.filter((car: any) => car.model === filterModel);
    }
    if (filterMinPrice) {
      const minPrice = parseFloat(filterMinPrice);
      result = result.filter((car: any) => car.price >= minPrice);
    }
    if (filterMaxPrice) {
      const maxPrice = parseFloat(filterMaxPrice);
      result = result.filter((car: any) => car.price <= maxPrice);
    }
    if (filterMinYear) {
      const minYear = parseInt(filterMinYear);
      result = result.filter((car: any) => car.year >= minYear);
    }
    if (filterMaxYear) {
      const maxYear = parseInt(filterMaxYear);
      result = result.filter((car: any) => car.year <= maxYear);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'date':
      default:
        // Already sorted by date from Firestore query
        break;
    }

    return result;
  }, [cars, filterMake, filterModel, filterMinPrice, filterMaxPrice, filterMinYear, filterMaxYear, sortBy]);

  const handleClearFilters = () => {
    setFilterMake('');
    setFilterModel('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterMinYear('');
    setFilterMaxYear('');
  };

  const hasActiveFilters = Boolean(
    filterMake || filterModel || filterMinPrice || filterMaxPrice || filterMinYear || filterMaxYear
  );

  const handleFavoriteRemoved = (carId: string) => {
    setCars(cars.filter((car: any) => car.id !== carId));
    setFavorites(favorites.filter(fav => fav.carId !== carId));
  };

  if (loading) {
    return (
      <PageContainer>
        <Hero>
          <HeroContent>
            <HeroIcon>
              <Heart />
            </HeroIcon>
            <HeroTitle>Loading Favorites...</HeroTitle>
          </HeroContent>
        </Hero>
        <ContentWrapper>
          <CarsGrid $viewMode="grid">
            {[1, 2, 3, 4].map(i => (
              <LoadingSkeleton key={i} />
            ))}
          </CarsGrid>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (cars.length === 0) {
    return (
      <PageContainer>
        <Hero>
          <HeroContent>
            <HeroIcon>
              <Heart />
            </HeroIcon>
            <HeroTitle>
              {language === 'bg' ? 'Моите любими' : 'My Favorites'}
            </HeroTitle>
            <HeroSubtitle>
              {language === 'bg' 
                ? `${favorites.length} запазени автомобила` 
                : `${favorites.length} saved cars`}
            </HeroSubtitle>
          </HeroContent>
        </Hero>
        <ContentWrapper>
          <EmptyState>
            <EmptyIcon>
              <Heart />
            </EmptyIcon>
            <EmptyTitle>
              {language === 'bg' 
                ? 'Все още нямате любими автомобили' 
                : 'No Favorites Yet'}
            </EmptyTitle>
            <EmptyText>
              {language === 'bg'
                ? 'Започнете да добавяте автомобили към любими, като натиснете иконката с сърце на всяка обява.'
                : 'Start adding cars to your favorites by clicking the heart icon on any listing.'}
            </EmptyText>
            <EmptyButton onClick={() => navigate('/cars')}>
              {language === 'bg' ? 'Разгледай автомобили' : 'Browse Cars'}
            </EmptyButton>
          </EmptyState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Hero>
        <HeroContent>
          <HeroIcon>
            <Heart />
          </HeroIcon>
          <HeroTitle>
            {language === 'bg' ? 'Моите любими' : 'My Favorites'}
          </HeroTitle>
          <HeroSubtitle>
            {language === 'bg' 
              ? `${filteredAndSortedCars.length} ${filteredAndSortedCars.length === 1 ? 'автомобил' : 'автомобила'}`
              : `${filteredAndSortedCars.length} ${filteredAndSortedCars.length === 1 ? 'car' : 'cars'}`}
          </HeroSubtitle>
        </HeroContent>
      </Hero>

      <ContentWrapper>
        <ControlsBar>
          <LeftControls>
            <FilterButton 
              $active={showFilters}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter />
              {language === 'bg' ? 'Филтри' : 'Filters'}
              {hasActiveFilters && ` (${Object.values({filterMake, filterModel, filterMinPrice, filterMaxPrice, filterMinYear, filterMaxYear}).filter(Boolean).length})`}
            </FilterButton>

            <FilterSelect 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="date">{language === 'bg' ? 'Последно добавени' : 'Recently Added'}</option>
              <option value="price-asc">{language === 'bg' ? 'Цена: Ниска към висока' : 'Price: Low to High'}</option>
              <option value="price-desc">{language === 'bg' ? 'Цена: Висока към ниска' : 'Price: High to Low'}</option>
              <option value="year-desc">{language === 'bg' ? 'Година: Нови първи' : 'Year: Newest First'}</option>
              <option value="year-asc">{language === 'bg' ? 'Година: Стари първи' : 'Year: Oldest First'}</option>
            </FilterSelect>
          </LeftControls>

          <RightControls>
            <ViewToggle>
              <ViewButton 
                $active={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 />
              </ViewButton>
              <ViewButton 
                $active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <List />
              </ViewButton>
            </ViewToggle>
          </RightControls>
        </ControlsBar>

        <FiltersPanel $isOpen={showFilters}>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>{language === 'bg' ? 'Марка' : 'Make'}</FilterLabel>
              <FilterSelect value={filterMake} onChange={(e) => setFilterMake(e.target.value)}>
                <option value="">{language === 'bg' ? 'Всички' : 'All'}</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>{language === 'bg' ? 'Модел' : 'Model'}</FilterLabel>
              <FilterSelect 
                value={filterModel} 
                onChange={(e) => setFilterModel(e.target.value)}
                disabled={!filterMake}
              >
                <option value="">{language === 'bg' ? 'Всички' : 'All'}</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>{language === 'bg' ? 'Мин. цена' : 'Min Price'}</FilterLabel>
              <FilterInput 
                type="number" 
                placeholder="0"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>{language === 'bg' ? 'Макс. цена' : 'Max Price'}</FilterLabel>
              <FilterInput 
                type="number" 
                placeholder="100000"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>{language === 'bg' ? 'Мин. година' : 'Min Year'}</FilterLabel>
              <FilterInput 
                type="number" 
                placeholder="2000"
                value={filterMinYear}
                onChange={(e) => setFilterMinYear(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>{language === 'bg' ? 'Макс. година' : 'Max Year'}</FilterLabel>
              <FilterInput 
                type="number" 
                placeholder="2024"
                value={filterMaxYear}
                onChange={(e) => setFilterMaxYear(e.target.value)}
              />
            </FilterGroup>
          </FiltersGrid>

          {hasActiveFilters && (
            <ClearFiltersButton onClick={handleClearFilters}>
              <X />
              {language === 'bg' ? 'Изчисти филтри' : 'Clear Filters'}
            </ClearFiltersButton>
          )}
        </FiltersPanel>

        <ResultsInfo>
          <ResultsCount>
            {language === 'bg' ? 'Намерени' : 'Found'}{' '}
            <span>{filteredAndSortedCars.length}</span>{' '}
            {language === 'bg' 
              ? (filteredAndSortedCars.length === 1 ? 'автомобил' : 'автомобила')
              : (filteredAndSortedCars.length === 1 ? 'car' : 'cars')}
          </ResultsCount>
        </ResultsInfo>

        <CarsGrid $viewMode={viewMode}>
          {filteredAndSortedCars.map((car: any) => (
            <CarCardWithFavorites 
              key={car.id} 
              car={car}
              onFavoriteChange={(carId, isFavorite) => {
                if (!isFavorite) {
                  handleFavoriteRemoved(carId);
                }
              }}
            />
          ))}
        </CarsGrid>
      </ContentWrapper>
    </PageContainer>
  );
};

export default UserFavoritesPage;
