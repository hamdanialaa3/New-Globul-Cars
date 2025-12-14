// HomeSearchBar Component - Main Search Bar for Homepage
// شريط البحث الرئيسي للصفحة الرئيسية

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';

const SearchSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

const SearchBarWrapper = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#000000' : '#ffffff'};
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 8px 32px rgba(255, 215, 0, 0.2), 0 0 0 1px rgba(255, 215, 0, 0.1)' 
    : '0 8px 32px rgba(255, 143, 16, 0.15), 0 0 0 1px rgba(255, 143, 16, 0.1)'};
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out 0.3s both;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)' 
      : 'linear-gradient(90deg, #FF8F10, #FFD700, #FF8F10)'};
    opacity: 0.8;
  }
  
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
    padding: 1.5rem;
    border-radius: 12px;
    border-width: 2px;
  }
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr auto;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0.75rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#333333' : '#e5e7eb'};
  border-radius: 10px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#1a1a1a'};
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  position: relative;
  min-height: auto;
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 4px 12px rgba(255, 215, 0, 0.2)' 
      : '0 4px 12px rgba(255, 143, 16, 0.15)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 0 0 4px rgba(255, 215, 0, 0.15), 0 4px 12px rgba(255, 215, 0, 0.2)' 
      : '0 0 0 4px rgba(255, 143, 16, 0.15), 0 4px 12px rgba(255, 143, 16, 0.15)'};
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.4375rem 0.875rem;
    padding-right: 2.25rem;
    font-size: 0.875rem;
  }
`;

const SelectIcon = styled.div`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  transition: transform 0.3s ease;
  
  ${SelectWrapper}:hover & {
    transform: translateY(-50%) rotate(180deg);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#333333' : '#e5e7eb'};
  border-radius: 10px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#1a1a1a'};
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: auto;
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    transform: translateY(-2px);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 0 0 4px rgba(255, 215, 0, 0.15), 0 4px 12px rgba(255, 215, 0, 0.2)' 
      : '0 0 0 4px rgba(255, 143, 16, 0.15), 0 4px 12px rgba(255, 143, 16, 0.15)'};
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#666666' : '#9ca3af'};
  }
  
  @media (max-width: 768px) {
    padding: 0.4375rem 0.875rem;
    font-size: 0.875rem;
  }
`;

const PriceSeparator = styled.span`
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  font-weight: 600;
  font-size: 1rem;
  padding: 0 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  min-height: auto;
  
  /* Light mode: Orange/Yellow gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF8F10 0%, #FFA500 50%, #FFD700 100%);
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 143, 16, 0.4);
  }
  
  /* Dark mode: Black with yellow text */
  html[data-theme="dark"] & {
    background: #000000;
    color: #FFD700;
    border: 2px solid #FFD700;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FF8F10 100%);
      box-shadow: 0 8px 30px rgba(255, 143, 16, 0.5);
    }
    
    html[data-theme="dark"] & {
      background: #1a1a1a;
      box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
    }
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 1024px) {
    grid-column: 1 / -1;
  }
  
  @media (max-width: 768px) {
    padding: 0.4375rem 1.75rem;
    font-size: 0.875rem;
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.75rem;
  background: transparent;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  border-radius: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-height: auto;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#000000' : '#000000'};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 4px 12px rgba(255, 215, 0, 0.3)' 
      : '0 4px 12px rgba(255, 143, 16, 0.3)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 0.4375rem 1.5rem;
    font-size: 0.875rem;
  }
`;

const AdvancedLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  margin-top: 1rem;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#FFA500' : '#FFA500'};
    
    &::after {
      width: 100%;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const HomeSearchBar: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
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
        setModel(''); // Reset model when make changes
      } catch (error) {
        console.error('Error loading models:', error);
        setModels([]);
      }
    };
    
    loadModels();
  }, [make]);

  // Generate year options (2000 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 + 1 }, (_, i) => currentYear - i);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (year) params.set('year', year);
    if (minPrice) params.set('priceMin', minPrice);
    if (maxPrice) params.set('priceMax', maxPrice);
    if (fuelType) params.set('fuelType', fuelType);
    if (transmission) params.set('transmission', transmission);
    
    navigate(`/cars?${params.toString()}`);
  }, [make, model, year, minPrice, maxPrice, fuelType, transmission, navigate]);

  const handleAdvancedSearch = () => {
    navigate('/advanced-search');
  };

  const handleReset = () => {
    setMake('');
    setModel('');
    setYear('');
    setMinPrice('');
    setMaxPrice('');
    setFuelType('');
    setTransmission('');
  };

  return (
    <SearchSection>
      <SearchBarWrapper>
        <SearchRow>
          <SelectWrapper>
            <Select
              value={make}
              onChange={(e) => setMake(e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Марка' : 'Make'}
              </option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
            <SelectIcon>
              <ChevronDown />
            </SelectIcon>
          </SelectWrapper>

          <SelectWrapper>
            <Select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
            >
              <option value="">
                {language === 'bg' ? 'Модел' : 'Model'}
              </option>
              {models.map((modelName) => (
                <option key={modelName} value={modelName}>
                  {modelName}
                </option>
              ))}
            </Select>
            <SelectIcon>
              <ChevronDown />
            </SelectIcon>
          </SelectWrapper>

          <SelectWrapper>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Година' : 'Year'}
              </option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </Select>
            <SelectIcon>
              <ChevronDown />
            </SelectIcon>
          </SelectWrapper>

          <SearchButton onClick={handleSearch}>
            <Search />
            {language === 'bg' ? 'Търси' : 'Search'}
          </SearchButton>
        </SearchRow>

        <FiltersRow>
          <PriceRangeContainer>
            <PriceInput
              type="number"
              placeholder={language === 'bg' ? 'Мин. цена (€)' : 'Min price (€)'}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />
            <PriceSeparator>-</PriceSeparator>
            <PriceInput
              type="number"
              placeholder={language === 'bg' ? 'Макс. цена (€)' : 'Max price (€)'}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </PriceRangeContainer>

          <SelectWrapper>
            <Select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Гориво' : 'Fuel Type'}
              </option>
              <option value="petrol">{language === 'bg' ? 'Бензин' : 'Petrol'}</option>
              <option value="diesel">{language === 'bg' ? 'Дизел' : 'Diesel'}</option>
              <option value="electric">{language === 'bg' ? 'Електрически' : 'Electric'}</option>
              <option value="hybrid">{language === 'bg' ? 'Хибриден' : 'Hybrid'}</option>
              <option value="lpg">{language === 'bg' ? 'LPG' : 'LPG'}</option>
            </Select>
            <SelectIcon>
              <ChevronDown />
            </SelectIcon>
          </SelectWrapper>

          <SelectWrapper>
            <Select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Скоростна кутия' : 'Transmission'}
              </option>
              <option value="automatic">{language === 'bg' ? 'Автоматична' : 'Automatic'}</option>
              <option value="manual">{language === 'bg' ? 'Ръчна' : 'Manual'}</option>
            </Select>
            <SelectIcon>
              <ChevronDown />
            </SelectIcon>
          </SelectWrapper>

          <ResetButton>
            <X />
            {language === 'bg' ? 'Изчисти' : 'Reset'}
          </ResetButton>
        </FiltersRow>

        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <AdvancedLink onClick={handleAdvancedSearch}>
            {language === 'bg' ? 'Разширено търсене →' : 'Advanced Search →'}
          </AdvancedLink>
        </div>
      </SearchBarWrapper>
    </SearchSection>
  );
};

export default HomeSearchBar;
