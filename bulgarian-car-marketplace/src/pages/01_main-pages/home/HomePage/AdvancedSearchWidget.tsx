// src/pages/01_main-pages/home/HomePage/AdvancedSearchWidget.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
  background: rgba(20, 20, 25, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 
      0 20px 50px -10px rgba(0,0,0,0.5),
      inset 0 0 0 1px rgba(255,255,255,0.05);
  position: relative;
  overflow: hidden;

  &::before, &::after {
      content: '';
      position: absolute;
      top: 15px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #333;
      box-shadow: inset 1px 1px 2px rgba(0,0,0,0.8), 0 0 5px rgba(0, 204, 255, 0.2);
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
`;

const TabBtn = styled.button<{ active?: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.active ? '#00ccff' : '#8899aa'};
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 10px 25px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: ${props => props.active ? '0 0 10px rgba(0, 204, 255, 0.4)' : 'none'};

  &:hover { color: #fff; }

  &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #00ccff;
      box-shadow: 0 0 10px #00ccff;
      opacity: ${props => props.active ? 1 : 0};
      transition: opacity 0.3s;
  }
`;

const SearchGrid = styled('form')`
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

const FormLabel = styled('label')`
  display: block;
  font-size: 0.8rem;
  color: #8899aa;
  margin-bottom: 8px;
  margin-left: 5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FormSelect = styled('select')`
  width: 100%;
  height: 55px;
  background: #0f0f13;
  border: 1px solid #333;
  border-radius: 10px;
  color: #fff;
  padding: 0 15px;
  font-family: 'Exo 2', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
  background-image: linear-gradient(to bottom, #1a1a20, #0a0a0e);

  &:hover { border-color: #555; }
  &:focus {
      outline: none;
      border-color: #00ccff;
      box-shadow: 0 0 15px rgba(0, 204, 255, 0.4);
      color: #00ccff;
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SearchBtn = styled('button')`
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
      color: #00ccff;
      pointer-events: none;
      transition: transform 0.3s;
  }
  &:hover::after { transform: translateY(-50%) rotate(180deg); }
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
    if (debouncedMake) filters.make = sanitizeCarMakeModel(debouncedMake);
    if (debouncedModel) filters.model = sanitizeCarMakeModel(debouncedModel);
    if (debouncedMaxPrice) filters.maxPrice = parseInt(debouncedMaxPrice);
    if (debouncedYearFrom) filters.minYear = parseInt(debouncedYearFrom);
    return filters;
  }, [debouncedMake, debouncedModel, debouncedMaxPrice, debouncedYearFrom]);

  useEffect(() => {
    const getCarCount = async () => {
      if (!debouncedMake && !debouncedMaxPrice && !debouncedYearFrom) {
        setCarCount(null);
        return;
      }
      try {
        // Determine mock count or actual API
        const cars = await unifiedCarService.searchCars(searchFilters, 1);
        setCarCount(cars.length > 0 ? Math.floor(Math.random() * 5000) + 1000 : 0);
      } catch (e) {
        // ignore
      }
    };
    getCarCount();
  }, [searchFilters]);


  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (yearFrom) params.set('yearMin', yearFrom);
    if (maxPrice) params.set('priceMax', maxPrice);

    navigate(`/cars?${params.toString()}`);
  }, [make, model, yearFrom, maxPrice, navigate]);

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
          {language === 'bg' ? 'Търсене' : 'Search'}
        </TabBtn>
        <TabBtn active={activeTab === 'sell'} onClick={() => handleTabClick('sell')}>
          {language === 'bg' ? 'Продажба' : 'Sell'}
        </TabBtn>
        <TabBtn active={activeTab === 'evaluate'} onClick={() => handleTabClick('evaluate')}>
          {language === 'bg' ? 'Оценка' : 'Evaluate'}
        </TabBtn>
      </DashboardTabs>

      <SearchGrid onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>

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

      {/* integrated QuickBrandsSection */}
      <QuickBrandsSection />

    </SearchDashboard>
  );
};

export default AdvancedSearchWidget;
