// src/pages/01_main-pages/home/HomePage/AdvancedSearchWidget.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, DollarSign, Calculator } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import { unifiedCarService } from '../../../../services/car';
import { logger } from '../../../../services/logger-service';
import { sanitizeCarMakeModel } from '../../../../utils/inputSanitizer';
import { useDebounce } from '../../../../hooks/useDebounce';
import QuickBrandsSection from './QuickBrandsSection'; // Integrated here now

// --- STYLED COMPONENTS (Mechanical Dashboard) ---

const SearchDashboard = styled.div`
  width: 100%;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(20, 20, 25, 0.85)'
      : 'rgba(255, 255, 255, 0.92)'};
  backdrop-filter: blur(12px);
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.colors.grey[200]};
  border-radius: 20px;
  padding: 30px;
  box-shadow: 
      ${({ theme }) =>
        theme.mode === 'dark'
          ? '0 20px 50px -10px rgba(0,0,0,0.5)'
          : '0 18px 46px -14px rgba(15,23,42,0.16)'},
      ${({ theme }) =>
        theme.mode === 'dark'
          ? 'inset 0 0 0 1px rgba(255,255,255,0.05)'
          : 'inset 0 0 0 1px rgba(2,6,23,0.04)'};
  position: relative;
  overflow: hidden;

  &::before, &::after {
      content: '';
      position: absolute;
      top: 15px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${({ theme }) => (theme.mode === 'dark' ? '#333' : theme.colors.grey[300])};
      box-shadow: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'inset 1px 1px 2px rgba(0,0,0,0.8), 0 0 5px rgba(0, 204, 255, 0.2)'
          : 'inset 1px 1px 2px rgba(2,6,23,0.12), 0 0 6px rgba(37, 99, 235, 0.14)'};
  }
  &::before { left: 15px; }
  &::after { right: 15px; }

  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const DashboardTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;

  @media (max-width: 480px) and (orientation: portrait) {
    gap: 12px;
  }

  @media (max-width: 360px) and (orientation: portrait) {
    gap: 8px;
  }
`;

const TabBtn = styled.button<{ active?: boolean }>`
  background: transparent;
  border: none;
  color: ${({ theme, active }) =>
    active ? (theme.mode === 'dark' ? '#00ccff' : theme.colors.primary.main) : theme.colors.text.secondary};
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 10px 25px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-shadow: ${({ theme, active }) =>
    active ? (theme.mode === 'dark' ? '0 0 10px rgba(0, 204, 255, 0.4)' : '0 0 10px rgba(37, 99, 235, 0.18)') : 'none'};

  &:hover { color: ${({ theme }) => theme.colors.text.primary}; }

  &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: ${({ theme }) => (theme.mode === 'dark' ? '#00ccff' : theme.colors.primary.main)};
      box-shadow: ${({ theme }) =>
        theme.mode === 'dark' ? '0 0 10px #00ccff' : `0 0 10px ${theme.colors.primary.main}`};
      opacity: ${props => props.active ? 1 : 0};
      transition: opacity 0.3s;
  }

  /* Icon styling */
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: none; /* Hidden by default, shown on very narrow screens */
  }

  span {
    white-space: nowrap;
  }

  /* Mobile portrait mode - reduce font size to keep text horizontal */
  @media (max-width: 480px) and (orientation: portrait) {
    font-size: 0.7rem;
    padding: 8px 10px;
    letter-spacing: 0.3px;
    gap: 4px;
    
    svg {
      display: block;
      width: 14px;
      height: 14px;
    }
  }

  /* Very narrow screens - show icons with smaller text */
  @media (max-width: 360px) and (orientation: portrait) {
    font-size: 0.6rem;
    padding: 6px 8px;
    letter-spacing: 0.2px;
    gap: 3px;
    
    svg {
      display: block;
      width: 12px;
      height: 12px;
    }
  }

  /* Extra narrow screens - icons only with tooltip text */
  @media (max-width: 320px) and (orientation: portrait) {
    font-size: 0.55rem;
    padding: 6px 6px;
    letter-spacing: 0;
    
    svg {
      display: block;
      width: 14px;
      height: 14px;
    }
    
    span {
      font-size: 0.5rem;
    }
  }

  /* Ensure text stays on one line */
  @media (max-width: 600px) {
    white-space: nowrap;
    overflow: visible;
    text-overflow: clip;
    min-width: fit-content;
  }
`;

const SearchGrid = styled.form`
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 15px;
  align-items: end;

  @media (max-width: 992px) {
      grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 576px) {
      grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  position: relative;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
  margin-left: 5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FormSelect = styled.select`
  width: 100%;
  height: 55px;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#0f0f13' : theme.colors.background.paper)};
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? '#333' : theme.colors.grey[200])};
  border-radius: 10px;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#e2e8f0' : theme.colors.text.primary)};
  padding: 0 15px;
  font-family: 'Exo 2', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
  background-image: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(to bottom, #1a1a20, #0a0a0e)'
      : `linear-gradient(to bottom, ${theme.colors.grey[50]}, ${theme.colors.background.paper})`};

  /* Light text color for dark mode - brighter for better visibility */
  [data-theme="dark"] & {
    color: #f1f5f9 !important;
  }

  .dark-theme & {
    color: #f1f5f9 !important;
  }

  /* Style options for dark mode - brighter text */
  option {
    background: ${({ theme }) => (theme.mode === 'dark' ? '#1a1a20' : theme.colors.background.paper)};
    color: ${({ theme }) => (theme.mode === 'dark' ? '#f1f5f9' : theme.colors.text.primary)};
    padding: 12px 15px;
  }

  [data-theme="dark"] & option {
    background: #1a1a20 !important;
    color: #f1f5f9 !important;
  }

  .dark-theme & option {
    background: #1a1a20 !important;
    color: #f1f5f9 !important;
  }

  &:hover { border-color: ${({ theme }) => (theme.mode === 'dark' ? '#555' : theme.colors.primary.light)}; }
  &:focus {
      outline: none;
      border-color: ${({ theme }) => (theme.mode === 'dark' ? '#00ccff' : theme.colors.primary.main)};
      box-shadow: ${({ theme }) =>
        theme.mode === 'dark'
          ? '0 0 15px rgba(0, 204, 255, 0.4)'
          : `0 0 0 4px ${theme.colors.primary.light}33`};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SearchBtn = styled.button`
  height: 55px;
  padding: 0 40px;
  background: linear-gradient(135deg, #00ccff, #0066ff);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(0, 204, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  grid-column: span 1;

  &::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      transition: left 0.5s;
  }

  &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(0, 204, 255, 0.6);
  }
  &:hover::before { left: 100%; }

  @media (max-width: 992px) { grid-column: span 2; }
  @media (max-width: 576px) { grid-column: span 1; }
`;

// Helper for select arrow
const SelectWrapper = styled.div`
  position: relative;
  &::after {
      content: '▼';
      font-size: 0.8rem;
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: ${({ theme }) => (theme.mode === 'dark' ? '#00ccff' : theme.colors.primary.main)};
      pointer-events: none;
      transition: transform 0.3s;
  }
  &:hover::after { transform: translateY(-50%) rotate(180deg); }
`;

const CarCountPanel = styled.div`
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(0, 204, 255, 0.1)'
      : `rgba(37, 99, 235, 0.08)`};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(0, 204, 255, 0.3)' : `${theme.colors.primary.light}55`};
  border-radius: 12px;
  font-size: 0.95rem;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#00ccff' : theme.colors.primary.main)};
  font-weight: 600;
  letter-spacing: 0.5px;
`;


interface AdvancedSearchWidgetProps {
  onSearchComplete?: (count: number) => void;
}

const AdvancedSearchWidget: React.FC<AdvancedSearchWidgetProps> = ({ onSearchComplete }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'search' | 'sell' | 'evaluate'>('search');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [yearFrom, setYearFrom] = useState('');

  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [carCount, setCarCount] = useState<number | null>(null);

  // Load brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const allBrands = await brandsModelsDataService.getAllBrands();
        setBrands(allBrands);
      } catch (error) {
        logger.error('Error loading brands', error as Error);
      }
    };
    loadBrands();
  }, []);

  // Load models when make changes
  useEffect(() => {
    const loadModels = async () => {
      if (!make) {
        setModels([]);
        setModel('');
        return;
      }
      try {
        const modelsForBrand = await brandsModelsDataService.getModelsForBrand(make);
        setModels(modelsForBrand);
        setModel('');
      } catch (error) {
        setModels([]);
      }
    };
    loadModels();
  }, [make]);

  // Use debounced values for fetching car counts
  const debouncedMake = useDebounce(make, 300);
  const debouncedModel = useDebounce(model, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);
  const debouncedYearFrom = useDebounce(yearFrom, 300);

  const searchFilters = useMemo(() => {
    const filters: any = { isActive: true, isSold: false };
    // Don't sanitize - keep original case for better matching
    if (debouncedMake) filters.make = debouncedMake;
    if (debouncedModel) filters.model = debouncedModel;
    if (debouncedMaxPrice) filters.maxPrice = parseInt(debouncedMaxPrice);
    if (debouncedYearFrom) filters.minYear = parseInt(debouncedYearFrom);
    
    // Log search filters for debugging
    logger.info('🔍 Search filters built', { 
      make: filters.make, 
      model: filters.model,
      maxPrice: filters.maxPrice,
      minYear: filters.minYear
    });
    
    return filters;
  }, [debouncedMake, debouncedModel, debouncedMaxPrice, debouncedYearFrom]);

  // ⚡ PERFORMANCE: Removed expensive searchCars(1000) query on every filter change
  // This was causing significant performance issues on homepage load
  // Car count can be shown after user initiates search, not during filter typing
  // useEffect(() => {
  //   const getCarCount = async () => {
  //     if (!debouncedMake && !debouncedMaxPrice && !debouncedYearFrom) {
  //       setCarCount(null);
  //       return;
  //     }
  //     try {
  //       const cars = await unifiedCarService.searchCars(searchFilters, 1000);
  //       setCarCount(cars.length);
  //       logger.info('Search preview count', { filters: searchFilters, count: cars.length });
  //     } catch (error) {
  //       logger.error('Error getting car count', error as Error);
  //       setCarCount(0);
  //     }
  //   };
  //   getCarCount();
  // }, [searchFilters]);


  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (yearFrom) params.set('yearMin', yearFrom);
    if (maxPrice) params.set('priceMax', maxPrice);

    // Log search action
    logger.info('User initiated search', {
      make,
      model,
      yearFrom,
      maxPrice,
      expectedCount: carCount
    });

    // Navigate to search results page
    const searchUrl = `/cars?${params.toString()}`;
    logger.info('Navigating to search results', { url: searchUrl });
    navigate(searchUrl);
  }, [make, model, yearFrom, maxPrice, navigate]); // ⚡ PERFORMANCE: Removed carCount dependency (no longer used)

  const handleTabClick = (tab: 'search' | 'sell' | 'evaluate') => {
    setActiveTab(tab);
    if (tab === 'sell') navigate('/sell');
    if (tab === 'evaluate') navigate('/car-valuation');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 + 1 }, (_, i) => currentYear - i);

  return (
    <SearchDashboard>

      <DashboardTabs>
        <TabBtn active={activeTab === 'search'} onClick={() => handleTabClick('search')}>
          <Search size={18} />
          <span>{language === 'bg' ? 'Търсене' : 'Search'}</span>
        </TabBtn>
        <TabBtn active={activeTab === 'sell'} onClick={() => handleTabClick('sell')}>
          <DollarSign size={18} />
          <span>{language === 'bg' ? 'Продажба' : 'Sell'}</span>
        </TabBtn>
        <TabBtn active={activeTab === 'evaluate'} onClick={() => handleTabClick('evaluate')}>
          <Calculator size={18} />
          <span>{language === 'bg' ? 'Оценка' : 'Evaluate'}</span>
        </TabBtn>
      </DashboardTabs>

      <SearchGrid onSubmit={handleSearch}>

        {/* MAKE */}
        <FormGroup>
          <FormLabel>{language === 'bg' ? 'Марка (Make)' : 'Make'}</FormLabel>
          <SelectWrapper>
            <FormSelect value={make} onChange={e => setMake(e.target.value)}>
              <option value="">{language === 'bg' ? 'Всички марки' : 'All brands'}</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </FormSelect>
          </SelectWrapper>
        </FormGroup>

        {/* MODEL */}
        <FormGroup>
          <FormLabel>{language === 'bg' ? 'Модел (Model)' : 'Model'}</FormLabel>
          <SelectWrapper>
            <FormSelect value={model} onChange={e => setModel(e.target.value)} disabled={!make}>
              <option value="">{language === 'bg' ? 'Изберете модел' : 'Select model'}</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </FormSelect>
          </SelectWrapper>
        </FormGroup>

        {/* PRICE */}
        <FormGroup>
          <FormLabel>{language === 'bg' ? 'Цена до (Price up to)' : 'Price up to'}</FormLabel>
          <SelectWrapper>
            <FormSelect value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>
              <option value="">{language === 'bg' ? 'Без ограничение' : 'No limit'}</option>
              <option value="5000">5,000 €</option>
              <option value="10000">10,000 €</option>
              <option value="20000">20,000 €</option>
              <option value="30000">30,000 €</option>
              <option value="50000">50,000 €</option>
              <option value="100000">100,000 €</option>
            </FormSelect>
          </SelectWrapper>
        </FormGroup>

        {/* YEAR */}
        <FormGroup>
          <FormLabel>{language === 'bg' ? 'Година от (Year from)' : 'Year from'}</FormLabel>
          <SelectWrapper>
            <FormSelect value={yearFrom} onChange={e => setYearFrom(e.target.value)}>
              <option value="">{language === 'bg' ? 'Всички' : 'All'}</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </FormSelect>
          </SelectWrapper>
        </FormGroup>

        {/* BUTTON */}
        <SearchBtn type="submit">
          <svg style={{ width: '18px', height: '18px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          {language === 'bg' ? 'Търсене' : 'Search'}
        </SearchBtn>

      </SearchGrid>

      {/* Car count display */}
      {carCount !== null && (
        <CarCountPanel>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}
          >
            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
            <polygon points="12 15 17 21 7 21 12 15"></polygon>
          </svg>
          {language === 'bg' 
            ? `Намерени ${carCount} ${carCount === 1 ? 'автомобил' : 'автомобила'} по критериите`
            : `Found ${carCount} ${carCount === 1 ? 'car' : 'cars'} matching criteria`
          }
        </CarCountPanel>
      )}

      {/* integrated QuickBrandsSection */}
      <QuickBrandsSection />

    </SearchDashboard>
  );
};

export default AdvancedSearchWidget;
