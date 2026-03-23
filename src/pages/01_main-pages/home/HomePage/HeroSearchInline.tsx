// HeroSearchInline.tsx
// Inline search component for HomePage hero section
// Mobile.bg competitive feature - Quick search directly on homepage

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandsModelsDataService } from '@/services/brands-models-data.service';
import { logger } from '@/services/logger-service';
import { sanitizeCarMakeModel } from '@/utils/inputSanitizer';

// Styled Components
const SearchContainer = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 900px;
  margin: 2rem auto 0;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1.5rem 1rem 0;
    border-radius: 12px;
  }
`;

const SearchTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
  
  span {
    color: var(--accent-primary);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TabSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--bg-secondary);
  padding: 0.25rem;
  border-radius: 8px;

  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? 'var(--btn-primary-bg)' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.$active ? 'var(--btn-primary-bg)' : 'var(--bg-hover)'};
  }

  @media (max-width: 768px) {
    padding: 0.625rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const SelectInput = styled.select`
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-primary);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }
`;

const PriceRangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const PriceInput = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-primary);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--text-muted);
  }

  &:hover {
    border-color: var(--accent-primary);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }
`;

const PriceSeparator = styled.span`
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchButton = styled.button`
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 10px;
  background: var(--btn-primary-bg);
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    width: 100%;
  }
`;

const QuickFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 0.375rem;
  }
`;

const FilterChip = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    background: var(--btn-primary-bg);
    color: #ffffff;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

// Component
const HeroSearchInline: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [carCount, setCarCount] = useState(0);

  useEffect(() => {
    const fetchCarCount = async () => {
      try {
        const cached = sessionStorage.getItem('koli_car_count');
        const cacheTime = sessionStorage.getItem('koli_car_count_ts');
        if (cached && cacheTime && Date.now() - Number(cacheTime) < 3600000) {
          setCarCount(Number(cached));
          return;
        }
        const { getCountFromServer, collection } = await import('firebase/firestore');
        const { db } = await import('@/firebase/firebase-config');
        const collections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
        let total = 0;
        for (const col of collections) {
          const snapshot = await getCountFromServer(collection(db, col));
          total += snapshot.data().count;
        }
        setCarCount(total || 1);
        sessionStorage.setItem('koli_car_count', String(total));
        sessionStorage.setItem('koli_car_count_ts', String(Date.now()));
      } catch {
        setCarCount(0);
      }
    };
    fetchCarCount();
  }, []);

  // Load brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const allBrands = await brandsModelsDataService.getAllBrands();
        setBrands(allBrands);
      } catch (error) {
        logger.error('Failed to load brands', error as Error, {
          context: 'HeroSearchInline',
          action: 'loadBrands'
        });
      }
    };

    loadBrands();
  }, []);

  // Load models when brand changes
  useEffect(() => {
    const loadModels = async () => {
      if (!selectedBrand) {
        setModels([]);
        setSelectedModel('');
        return;
      }

      try {
        const brandModels = await brandsModelsDataService.getModelsForBrand(selectedBrand);
        setModels(brandModels);
      } catch (error) {
        logger.error('Failed to load models:', error as Error, {
          context: 'HeroSearchInline',
          action: 'loadModels',
          selectedBrand
        });
        setModels([]);
      }
    };

    loadModels();
  }, [selectedBrand]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'sell') {
      navigate('/sell');
      return;
    }

    // Build search query
    const params = new URLSearchParams();
    if (selectedBrand) params.append('make', selectedBrand);
    if (selectedModel) params.append('model', selectedModel);
    if (priceFrom) params.append('priceMin', priceFrom);
    if (priceTo) params.append('priceMax', priceTo);

    navigate(`/search?${params.toString()}`);
  };

  const handleQuickFilter = (filter: string) => {
    // TODO: Navigate to search with preset filters
    navigate(`/search?filter=${filter}`);
  };

  const translations = {
    bg: {
      title: 'Открийте вашата мечтана кола от',
      cars: 'автомобили',
      buyTab: 'Купи',
      sellTab: 'Продай',
      brandPlaceholder: 'Всички марки',
      modelPlaceholder: 'Всички модели',
      priceFromPlaceholder: 'Цена от',
      priceToPlaceholder: 'до',
      searchButton: 'Търси',
      results: 'резултата',
      latestFilter: '🔥 Най-нови',
      featuredFilter: '💎 Препоръчани',
      cheapestFilter: '🏷️ Най-евтини'
    },
    en: {
      title: 'Find your dream car from',
      cars: 'cars',
      buyTab: 'Buy',
      sellTab: 'Sell',
      brandPlaceholder: 'All brands',
      modelPlaceholder: 'All models',
      priceFromPlaceholder: 'Price from',
      priceToPlaceholder: 'to',
      searchButton: 'Search',
      results: 'results',
      latestFilter: '🔥 Latest',
      featuredFilter: '💎 Featured',
      cheapestFilter: '🏷️ Cheapest'
    }
  };

  const text = translations[language];

  return (
    <SearchContainer>
      <SearchTitle>
        {text.title} <span>{carCount.toLocaleString()}+</span> {text.cars}
      </SearchTitle>

      <TabSelector>
        <Tab $active={activeTab === 'buy'} onClick={() => setActiveTab('buy')}>
          <Search size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
          {text.buyTab}
        </Tab>
        <Tab $active={activeTab === 'sell'} onClick={() => setActiveTab('sell')}>
          <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
          {text.sellTab}
        </Tab>
      </TabSelector>

      {activeTab === 'buy' ? (
        <>
          <SearchForm onSubmit={handleSearch}>
            <SelectInput
              value={selectedBrand}
              onChange={(e) => {
                const sanitized = sanitizeCarMakeModel(e.target.value);
                setSelectedBrand(sanitized);
              }}
            >
              <option value="">{text.brandPlaceholder}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </SelectInput>

            <SelectInput
              value={selectedModel}
              onChange={(e) => {
                const sanitized = sanitizeCarMakeModel(e.target.value);
                setSelectedModel(sanitized);
              }}
              disabled={!selectedBrand}
            >
              <option value="">{text.modelPlaceholder}</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </SelectInput>

            <PriceRangeContainer>
              <PriceInput
                type="number"
                placeholder={text.priceFromPlaceholder}
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                min="0"
              />
              <PriceSeparator>—</PriceSeparator>
              <PriceInput
                type="number"
                placeholder={text.priceToPlaceholder}
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                min="0"
              />
            </PriceRangeContainer>

            <SearchButton type="submit">
              <Search size={20} />
              {text.searchButton}
            </SearchButton>
          </SearchForm>

          <QuickFilters>
            <FilterChip onClick={() => handleQuickFilter('latest')}>
              {text.latestFilter}
            </FilterChip>
            <FilterChip onClick={() => handleQuickFilter('featured')}>
              {text.featuredFilter}
            </FilterChip>
            <FilterChip onClick={() => handleQuickFilter('cheapest')}>
              {text.cheapestFilter}
            </FilterChip>
          </QuickFilters>
        </>
      ) : (
        <SearchButton onClick={() => navigate('/sell')}>
          <Zap size={20} />
          {text.sellTab}
        </SearchButton>
      )}
    </SearchContainer>
  );
};

export default HeroSearchInline;
