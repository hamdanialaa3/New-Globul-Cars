// Advanced Search Widget - Professional Search Interface
// واجهة بحث متقدمة احترافية

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import { unifiedCarService } from '../../../../services/car';

const SearchWidgetContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 15, 15, 0.85)' 
    : '#f5f5f5'};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 14px;
  padding: 28px;
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.05)' 
    : '0 24px 48px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 143, 16, 0.05)'};
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.6s ease-out 0.3s both;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
`;

const SearchTabs = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#262626' : '#e5e7eb'};
  padding-bottom: 15px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 15px;
    padding-bottom: 12px;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  color: ${({ $active, theme }) => 
    $active 
      ? (theme.mode === 'dark' ? '#FFD700' : '#FF8F10')
      : (theme.mode === 'dark' ? '#9ca3af' : '#6b7280')};
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 0;
    width: ${props => props.$active ? '100%' : '0'};
    height: 2.5px;
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'linear-gradient(90deg, #FFD700, #FFA500)' 
      : 'linear-gradient(90deg, #FF8F10, #FFD700)'};
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px 2px 0 0;
  }
  
  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  }
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 6px 0;
  }
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 6px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: uppercase;
`;

const FormControl = styled.select`
  width: 100%;
  height: 44px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
  border: 1.5px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#d1d5db'};
  border-radius: 10px;
  padding: 0 16px;
  padding-right: 42px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : '#111827'};
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  line-height: 1.5;
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    background-color: ${({ theme }) => theme.mode === 'dark' ? '#1f1f1f' : '#fafafa'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 215, 0, 0.12)' 
      : 'rgba(255, 143, 16, 0.12)'};
    background-color: ${({ theme }) => theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.mode === 'dark' ? '#0f0f0f' : '#f3f4f6'};
  }
  
  option {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : '#111827'};
    padding: 8px;
  }
  
  @media (max-width: 768px) {
    height: 42px;
    font-size: 0.9rem;
    padding: 0 14px;
    padding-right: 38px;
  }
`;

const SearchButton = styled.button`
  height: 44px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
    : 'linear-gradient(135deg, #FF8F10 0%, #FFD700 100%)'};
  border: none;
  border-radius: 10px;
  color: #000000;
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.05);
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 6px 16px rgba(255, 215, 0, 0.35)' 
      : '0 6px 16px rgba(255, 143, 16, 0.35)'};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 2px 8px rgba(255, 215, 0, 0.3)' 
      : '0 2px 8px rgba(255, 143, 16, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.5;
  }
  
  @media (max-width: 768px) {
    height: 42px;
    font-size: 0.9rem;
    gap: 6px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

interface AdvancedSearchWidgetProps {
  onSearchComplete?: (count: number) => void;
}

const AdvancedSearchWidget: React.FC<AdvancedSearchWidgetProps> = ({ onSearchComplete }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'search' | 'sell' | 'evaluate'>('search');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [carCount, setCarCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const allBrands = await brandsModelsDataService.getAllBrands();
        setBrands(allBrands);
      } catch (error) {
        console.error('Error loading brands:', error);
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
        console.error('Error loading models:', error);
        setModels([]);
      }
    };
    
    loadModels();
  }, [make]);

  // Get car count for search button
  useEffect(() => {
    const getCarCount = async () => {
      try {
        const filters: any = { isActive: true, isSold: false };
        if (make) filters.make = make;
        if (model) filters.model = model;
        if (maxPrice) filters.maxPrice = parseInt(maxPrice);
        if (yearFrom) filters.minYear = parseInt(yearFrom);
        
        const cars = await unifiedCarService.searchCars(filters, 1);
        setCarCount(cars.length > 0 ? Math.floor(Math.random() * 5000) + 10000 : 0); // Mock count for now
      } catch (error) {
        console.error('Error getting car count:', error);
      }
    };
    
    if (make || maxPrice || yearFrom) {
      getCarCount();
    }
  }, [make, model, maxPrice, yearFrom]);

  // Generate year options (2000 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 + 1 }, (_, i) => currentYear - i);

  // Price options
  const priceOptions = [
    { value: '', label: language === 'bg' ? 'Без ограничение' : 'No limit' },
    { value: '5000', label: '5,000 €' },
    { value: '10000', label: '10,000 €' },
    { value: '20000', label: '20,000 €' },
    { value: '30000', label: '30,000 €' },
    { value: '50000', label: '50,000 €' },
    { value: '75000', label: '75,000 €' },
    { value: '100000', label: '100,000 €' },
  ];

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (yearFrom) params.set('yearMin', yearFrom);
    if (maxPrice) params.set('priceMax', maxPrice);
    
    navigate(`/cars?${params.toString()}`);
    
    if (onSearchComplete && carCount) {
      onSearchComplete(carCount);
    }
  }, [make, model, yearFrom, maxPrice, navigate, carCount, onSearchComplete]);

  const handleTabClick = (tab: 'search' | 'sell' | 'evaluate') => {
    setActiveTab(tab);
    if (tab === 'sell') {
      navigate('/sell');
    } else if (tab === 'evaluate') {
      navigate('/car-valuation');
    }
  };

  return (
    <SearchWidgetContainer>
      <SearchTabs>
        <TabButton 
          $active={activeTab === 'search'} 
          onClick={() => handleTabClick('search')}
        >
          {language === 'bg' ? 'Търсене' : 'Search'}
        </TabButton>
        <TabButton 
          $active={activeTab === 'sell'} 
          onClick={() => handleTabClick('sell')}
        >
          {language === 'bg' ? 'Продажба' : 'Sell'}
        </TabButton>
        <TabButton 
          $active={activeTab === 'evaluate'} 
          onClick={() => handleTabClick('evaluate')}
        >
          {language === 'bg' ? 'Оценка' : 'Evaluate'}
        </TabButton>
      </SearchTabs>
      
      {activeTab === 'search' && (
        <form 
          className="search-grid" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <FormGroup>
            <Label>{language === 'bg' ? 'Марка (Make)' : 'Make'}</Label>
            <FormControl
              value={make}
              onChange={(e) => setMake(e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Всички марки' : 'All brands'}
              </option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Модел (Model)' : 'Model'}</Label>
            <FormControl
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
            >
              <option value="">
                {language === 'bg' ? 'Изберете модел' : 'Select model'}
              </option>
              {models.map((modelName) => (
                <option key={modelName} value={modelName}>
                  {modelName}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Цена до (Price up to)' : 'Price up to'}</Label>
            <FormControl
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Година от (Year from)' : 'Year from'}</Label>
            <FormControl
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Всички' : 'All'}
              </option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <SearchButton type="submit" disabled={loading}>
            <Search />
            {language === 'bg' ? 'Търсене' : 'Search'}
            {carCount !== null && ` (${carCount.toLocaleString()})`}
          </SearchButton>
        </form>
      )}
    </SearchWidgetContainer>
  );
};

export default AdvancedSearchWidget;
