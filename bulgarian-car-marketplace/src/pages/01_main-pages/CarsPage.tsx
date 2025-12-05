// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace - Modern & Professional Design
// صفحة عرض السيارات مع فلترة متقدمة وبحث بالذكاء الاصطناعي
// ⚡ Performance Optimized with Firebase Caching + AI Search

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { BULGARIAN_CITIES } from '../../constants/bulgarianCities';
import { unifiedCarService } from '../../services/car';
import { CarIcon } from '../../components/icons/CarIcon';
import { CarListing } from '../../types/CarListing';
import { logger } from '../../services/logger-service';
import { firebaseCache, cacheKeys } from '../../services/firebase-cache.service';
import CarCardCompact from '../../components/CarCard/CarCardCompact';
import { ResponsiveGrid } from '../../components/layout/ResponsiveGrid';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { MobileFilterDrawer, MobileFilterButton, FilterValues } from '../../components/filters';
import { smartSearchService } from '../../services/search/smart-search.service';
import { searchHistoryService } from '../../services/search/search-history.service';
import { Search, X, Clock, TrendingUp, Sparkles, SlidersHorizontal } from 'lucide-react';

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = keyframes`
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

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 143, 16, 0.3), 0 0 40px rgba(0, 92, 169, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 143, 16, 0.5), 0 0 60px rgba(0, 92, 169, 0.3);
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const CarsContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #1a1d2e 0%, #0f1117 100%)'
    : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'};
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  transition: background 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px 0 80px;
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1d2e' : '#f0f2f5'};
  }
  
  @media (max-width: 480px) {
    padding: 12px 0 70px;
  }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    padding: 0;
    max-width: 100%;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  ${css`animation: ${fadeInUp} 0.6s ease-out;`}

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 16px 20px;
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e2330' : 'white'};
    box-shadow: 0 2px 8px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'};
  }

  h1 {
    font-size: clamp(1.75rem, 4vw, 3rem);
    font-weight: 800;
    background: linear-gradient(135deg, #005ca9 0%, #ff8f10 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }
  }

  p {
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 0.875rem;
      margin-bottom: 0;
    }
  }
`;

const CityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1rem auto;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);
  ${css`animation: ${glow} 3s ease-in-out infinite;`}
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// ============================================================================
// MODERN SEARCH BAR WITH AI & ADVANCED FILTERS
// ============================================================================

const SearchSection = styled.div`
  max-width: 900px;
  margin: 0 auto 3rem;
  ${css`animation: ${fadeInUp} 0.7s ease-out 0.1s both;`}
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }
`;

const SearchBarWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e2330' : 'white'};
  border: 2px solid transparent;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
  
  &:focus-within {
    border-color: #005ca9;
    box-shadow: 0 8px 30px rgba(0, 92, 169, 0.2);
    transform: translateY(-2px);
  }
  
  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }
`;

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#6c757d'};
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.05rem;
  padding: 1.25rem 0.5rem;
  font-weight: 500;
  background: transparent;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e8eaed' : '#212529'};
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#6c7a8d' : '#adb5bd'};
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem 0.5rem;
  }
`;

const SearchActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.75rem;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#6c757d'};
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2d3548' : '#f8f9fa'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#e8eaed' : '#495057'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #005ca9, #0066cc);
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 92, 169, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 92, 169, 0.4);
    background: linear-gradient(135deg, #0066cc, #005ca9);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.875rem;
  }
`;

// Action Buttons Row
const ActionButtonsRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ai' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  
  /* Primary - Advanced Search */
  ${props => props.variant === 'primary' && css`
    background: linear-gradient(135deg, #ff8f10, #ffb347);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 143, 16, 0.4);
    }
  `}
  
  /* AI Search */
  ${props => props.variant === 'ai' && css`
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    animation: ${glow} 4s ease-in-out infinite;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: ${shimmer} 3s infinite;
    }
  `}
  
  /* Secondary - Filter Results */
  ${props => props.variant === 'secondary' && css`
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e2330' : 'white'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#e8eaed' : '#495057'};
    border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#dee2e6'};
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.05)'};
    
    &:hover {
      border-color: #005ca9;
      color: #005ca9;
      box-shadow: 0 4px 12px rgba(0, 92, 169, 0.15);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
    flex: 1;
    justify-content: center;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const CarsGridWrapper = styled.div`
  margin-top: 32px;

  /* MOBILE - Instagram-style grid wrapper */
  @media (max-width: 768px) {
    margin-top: 8px;
    margin-bottom: 90px;  /* Space for floating filter button */
    padding: 0;  /* Full-width grid */
  }
  
  @media (max-width: 480px) {
    margin-bottom: 80px;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e2330' : 'white'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#e9ecef'};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 8px 24px rgba(0, 0, 0, 0.5)' 
    : '0 8px 24px rgba(0, 0, 0, 0.12)'};
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  transition: background 0.3s ease, border-color 0.3s ease;
  
  /* Custom Scrollbar for dark mode */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1d2e' : '#f1f3f5'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#cbd5e0'};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#a0aec0'};
    }
  }
`;

const SuggestionSection = styled.div`
  padding: 0.75rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#f1f3f5'};
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#6c757d'};
  text-transform: uppercase;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SuggestionItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e8eaed' : '#212529'};
  transition: background 0.15s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2d3548' : '#f8f9fa'};
  }
  
  &:active {
    background: ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#e9ecef'};
  }
`;

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  
  // ⚡ NEW: Smart Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSmartSearchActive, setIsSmartSearchActive] = useState(false);
  
  // Get filters from URL
  const cityId = searchParams.get('city');
  const makeParam = searchParams.get('make');
  const cityData = cityId ? BULGARIAN_CITIES.find(c => c.id === cityId) : null;

  // ⚡ NEW: Load recent searches on mount
  useEffect(() => {
    if (user) {
      searchHistoryService.getRecentSearches(user.uid, 5).then(history => {
        setRecentSearches(history.map(h => h.query));
      });
    }
  }, [user]);

  // ⚡ NEW: Get suggestions with debouncing
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const sugg = await smartSearchService.getSuggestions(searchQuery, user?.uid, 8);
      setSuggestions(sugg);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // ⚡ NEW: Handle smart search
  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to normal mode if search is empty
      console.log('🔍 Smart Search: Empty query, resetting to normal mode');
      setIsSmartSearchActive(false);
      return;
    }
    
    console.log('🚀 Smart Search TRIGGERED:', { query: searchQuery });
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false);
    setIsSmartSearchActive(true); // Mark that we're in smart search mode
    
    try {
      console.log('🔍 Calling smartSearchService.search...');
      const result = await smartSearchService.search(searchQuery, user?.uid, 1, 100);
      console.log('✅ Smart Search Result:', {
        carsCount: result.cars.length,
        totalCount: result.totalCount,
        isPersonalized: result.isPersonalized,
        firstCar: result.cars[0] ? {
          make: result.cars[0].make,
          model: result.cars[0].model,
          year: result.cars[0].year
        } : null
      });
      setCars(result.cars as CarListing[]);
      setError(null); // Clear any previous errors
      logger.info('Smart search completed', { 
        query: searchQuery, 
        results: result.totalCount,
        personalized: result.isPersonalized 
      });
    } catch (err) {
      console.error('❌ Smart Search FAILED:', err);
      logger.error('Smart search failed', err as Error);
      setError('Search failed');
      setCars([]); // Clear cars on error
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // ⚡ NEW: Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Auto-trigger search
    setTimeout(() => {
      handleSmartSearch();
    }, 100);
  };

  // Load cars from Firebase with caching ⚡
  useEffect(() => {
    // Skip loading if smart search is active
    if (isSmartSearchActive) {
      return;
    }
    
    const loadCars = async () => {
      try {
        console.log('🚀 CarsPage: Starting loadCars...');
        setLoading(true);
        setError(null);
        
        // Read filters from URL params INSIDE useEffect
        const regionParam = searchParams.get('city'); // 'city' param is actually region!
        const makeParam = searchParams.get('make');
        
        console.log('🔍 CarsPage: URL params:', { regionParam, makeParam });
        logger.info('🔍 URL params:', { regionParam, makeParam });
        logger.info('Loading cars with filters', { region: regionParam, make: makeParam });

        // ✅ FIXED: Build filters object compatible with unifiedCarService.searchCars
        const filters: any = {
          isActive: true,  // Only show active cars
          isSold: false    // Hide sold cars
        };

        // Add region filter if provided (region is the primary location field)
        if (regionParam) {
          filters.region = regionParam;
          logger.info('🎯 Filtering by region', { region: regionParam });
        }

        // Add make (brand) filter if provided
        if (makeParam) {
          filters.make = makeParam;
          logger.info('🎯 Filtering by make', { make: makeParam });
        }

        // ✅ ADDED: Read all filter params from URL and apply them
        const modelParam = searchParams.get('model');
        const fuelTypeParam = searchParams.get('fuelType');
        const transmissionParam = searchParams.get('transmission');
        const priceMinParam = searchParams.get('priceMin');
        const priceMaxParam = searchParams.get('priceMax');
        const yearMinParam = searchParams.get('yearMin');
        const yearMaxParam = searchParams.get('yearMax');
        // const mileageMinParam = searchParams.get('mileageMin');
        // const mileageMaxParam = searchParams.get('mileageMax');
        // const bodyTypeParam = searchParams.get('bodyType');

        if (modelParam) filters.model = modelParam;
        if (fuelTypeParam) filters.fuelType = fuelTypeParam;
        if (transmissionParam) filters.transmission = transmissionParam;
        if (priceMinParam) filters.minPrice = parseFloat(priceMinParam);
        if (priceMaxParam) filters.maxPrice = parseFloat(priceMaxParam);
        if (yearMinParam) filters.minYear = parseInt(yearMinParam);
        if (yearMaxParam) filters.maxYear = parseInt(yearMaxParam);
        // Note: mileage filters would need to be added to CarFilters interface if needed

        if (!regionParam && !makeParam) {
          logger.info('📋 No filters - loading all active cars');
        }

        // ⚡ Fetch cars with caching (5 minute cache) using unifiedCarService
        const cacheKey = makeParam && regionParam 
          ? `cars-${regionParam}-${makeParam}`
          : regionParam 
            ? cacheKeys.carsByCity(regionParam)
            : makeParam 
              ? cacheKeys.carsByMake(makeParam)
              : cacheKeys.activeCars();

        logger.info('🔥 Using cache key', { cacheKey });
        
        const carsList = await firebaseCache.getOrFetch(
          cacheKey,
          async () => {
            logger.info('📡 Fetching from Firebase using unifiedCarService (cache miss)...');
            // ✅ FIXED: Use unifiedCarService.searchCars instead of non-existent carListingService
            return await unifiedCarService.searchCars(filters, 100);
          },
          { duration: 5 * 60 * 1000 } // 5 minutes
        );
        
        logger.info('📦 Result:', {
          total: carsList.length,
          filters: { region: regionParam, make: makeParam },
          cacheStats: firebaseCache.getStats()
        });
        
        // Convert UnifiedCar[] to CarListing[] format
        const carListings: CarListing[] = carsList.map((car: any) => ({
          ...car,
          vehicleType: car.vehicleType || 'car',
          sellerType: car.sellerType || 'private',
          sellerName: car.sellerName || '',
          sellerEmail: car.sellerEmail || '',
          sellerPhone: car.sellerPhone || '',
          city: car.city || '',
          region: car.region || '',
          status: car.status || 'active',
          currency: car.currency || 'EUR'
        } as CarListing));
        
        setCars(carListings);
        console.log('🎯 CarsPage: Set cars state', {
          count: carListings.length,
          firstCar: carListings[0] ? {
            id: carListings[0].id,
            make: carListings[0].make,
            model: carListings[0].model,
            isActive: carListings[0].isActive,
            isSold: carListings[0].isSold
          } : null
        });
        logger.info('✅ Loaded cars', { 
          count: carListings.length,
          region: regionParam || 'all',
          make: makeParam || 'all'
        });
      } catch (err: any) {
        logger.error('❌ Error loading cars:', err);
        setError(err.message || 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [searchParams, isSmartSearchActive]);

  // Get city display name with useMemo ⚡
  const cityDisplayName = useMemo(() => {
    if (!cityData) return '';
    return language === 'bg' ? cityData.nameBg : cityData.nameEn;
  }, [cityData, language]);

  // Memoized count text ⚡
  const carsCountText = useMemo(() => {
    const count = cars.length;
    return language === 'bg' 
      ? count === 1 ? 'автомобил' : 'автомобила'
      : count === 1 ? 'car' : 'cars';
  }, [cars.length, language]);

  // Extract current filters from URL
  const currentFilters = useMemo<FilterValues>(() => {
    const makeParam = searchParams.get('make');
    const regionParam = searchParams.get('city'); // Actually region
    
    return {
      make: makeParam || undefined,
      region: regionParam || undefined,
      // Add more URL params as needed
    };
  }, [searchParams]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(currentFilters).filter(Boolean).length;
  }, [currentFilters]);

  // Handle filter apply
  const handleApplyFilters = (filters: FilterValues) => {
    // Reset smart search mode when applying filters
    setIsSmartSearchActive(false);
    setSearchQuery(''); // Clear search query
    
    const newParams = new URLSearchParams();
    
    // Add filters to URL params
    if (filters.make) newParams.set('make', filters.make);
    if (filters.region) newParams.set('city', filters.region); // Keep 'city' param name for compatibility
    if (filters.model) newParams.set('model', filters.model);
    if (filters.priceMin) newParams.set('priceMin', filters.priceMin);
    if (filters.priceMax) newParams.set('priceMax', filters.priceMax);
    if (filters.yearMin) newParams.set('yearMin', filters.yearMin);
    if (filters.yearMax) newParams.set('yearMax', filters.yearMax);
    if (filters.mileageMin) newParams.set('mileageMin', filters.mileageMin);
    if (filters.mileageMax) newParams.set('mileageMax', filters.mileageMax);
    if (filters.fuelType) newParams.set('fuelType', filters.fuelType);
    if (filters.transmission) newParams.set('transmission', filters.transmission);
    if (filters.bodyType) newParams.set('bodyType', filters.bodyType);

    setSearchParams(newParams);
    setShowFilters(false); // Close filter drawer
  };

  return (
    <CarsContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>
            {cityData 
              ? `${t('cars.title')} - ${cityDisplayName}`
              : makeParam
                ? `${t('cars.title')} - ${makeParam}`
                : t('cars.title')}
          </h1>
          <p>{t('cars.subtitle')}</p>
          
          {/* City Badge */}
          {cityData && (
            <CityBadge>
              📍 {cityDisplayName} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Brand/Make Badge */}
          {makeParam && !cityData && (
            <CityBadge>
              {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Combined Badge (Region + Brand) */}
          {cityData && makeParam && (
            <CityBadge>
              📍 {cityDisplayName} · {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
        </PageHeader>

        {/* ⚡ MODERN SEARCH SECTION */}
        <SearchSection>
          {/* Action Buttons - Advanced Search & AI Search */}
          <ActionButtonsRow>
            <ActionButton 
              variant="primary"
              onClick={() => window.location.href = '/advanced-search'}
              aria-label={language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}
            >
              <SlidersHorizontal />
              {language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}
            </ActionButton>
            
            <ActionButton 
              variant="ai"
              onClick={() => {
                window.location.href = '/advanced-search?mode=smart';
              }}
              aria-label={language === 'bg' ? 'Търсене с ИИ' : 'AI Search'}
            >
              <Sparkles />
              {language === 'bg' ? 'Търсене с ИИ' : 'AI Search'}
            </ActionButton>
          </ActionButtonsRow>

          {/* Main Search Bar */}
          <SearchBarWrapper>
            <SearchInputContainer>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              
              <SearchInput
                type="text"
                placeholder={language === 'bg' 
                  ? 'Търси BMW 2020, Diesel, София...' 
                  : 'Search BMW 2020, Diesel, Sofia...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSmartSearch();
                  }
                }}
              />
              
              <SearchActionsGroup>
                {searchQuery && (
                  <ClearButton 
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setIsSmartSearchActive(false); // Reset to normal mode
                    }}
                    aria-label={language === 'bg' ? 'Изчисти' : 'Clear'}
                  >
                    <X />
                  </ClearButton>
                )}
                
                <SearchButton
                  onClick={handleSmartSearch}
                  disabled={!searchQuery.trim() || isSearching}
                >
                  <Search />
                  {language === 'bg' ? 'Търси' : 'Search'}
                </SearchButton>
              </SearchActionsGroup>
            </SearchInputContainer>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <SuggestionsDropdown>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <SuggestionSection>
                  <SuggestionHeader>
                    <Clock />
                    {language === 'bg' ? 'Последни търсения' : 'Recent Searches'}
                  </SuggestionHeader>
                  {recentSearches.map((search, index) => (
                    <SuggestionItem
                      key={`recent-${index}`}
                      onClick={() => handleSuggestionClick(search)}
                    >
                      {search}
                    </SuggestionItem>
                  ))}
                </SuggestionSection>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <SuggestionSection>
                  <SuggestionHeader>
                    <TrendingUp />
                    {language === 'bg' ? 'Предложения' : 'Suggestions'}
                  </SuggestionHeader>
                  {suggestions.map((suggestion, index) => (
                    <SuggestionItem
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionSection>
              )}
            </SuggestionsDropdown>
          )}
        </SearchBarWrapper>
        </SearchSection>

        {/* Loading State */}
        {loading && (
          <LoadingState>
            <div className="loading-spinner" />
            <p>{language === 'bg' ? 'Зареждане на автомобили...' : 'Loading cars...'}</p>
          </LoadingState>
        )}

        {/* Error State */}
        {error && !loading && (
          <EmptyState>
            <h3>⚠️ {language === 'bg' ? 'Грешка' : 'Error'}</h3>
            <p>{error}</p>
          </EmptyState>
        )}

        {/* Empty State */}
        {!loading && !error && cars.length === 0 && (
          <EmptyState>
            <CarIcon size={64} color="#FF7900" style={{ marginBottom: '16px', opacity: 0.6 }} />
            <h3>{language === 'bg' ? 'Няма намерени автомобили' : 'No cars found'}</h3>
            <p>
              {cityData && makeParam
                ? (language === 'bg' 
                    ? `В момента няма обяви за ${makeParam} в ${cityDisplayName}.` 
                    : `Currently no ${makeParam} listings in ${cityDisplayName}.`)
                : cityData 
                  ? (language === 'bg' 
                      ? `В момента няма обяви за автомобили в ${cityDisplayName}.` 
                      : `Currently no car listings in ${cityDisplayName}.`)
                  : makeParam
                    ? (language === 'bg' 
                        ? `В момента няма обяви за ${makeParam}.` 
                        : `Currently no ${makeParam} listings available.`)
                    : (language === 'bg' 
                        ? 'В момента няма налични обяви за автомобили.' 
                        : 'Currently no car listings available.')}
            </p>
          </EmptyState>
        )}

        {/* Cars Grid */}
        {!loading && cars.length > 0 && (
          <CarsGridWrapper>
            <ResponsiveGrid
              columns={{
                xs: 1,    // 1 column on mobile
                sm: 2,    // 2 columns on small tablets
                md: 2,    // 2 columns on tablets
                lg: 3,    // 3 columns on desktop
                xl: 4     // 4 columns on large desktop
              }}
              gap={20}
            >
              {cars.map(car => (
                <CarCardCompact key={car.id} car={car} />
              ))}
            </ResponsiveGrid>
          </CarsGridWrapper>
        )}

        {/* Mobile Filter Button */}
        {isMobile && (
          <MobileFilterButton
            onClick={() => setShowFilters(true)}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          initialFilters={currentFilters}
          language={language}
        />

      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;