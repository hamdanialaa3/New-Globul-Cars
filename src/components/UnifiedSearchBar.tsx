/**
 * UnifiedSearchBar Component
 * 🔧 REFACTOR: Merged SearchWidget.tsx (607 lines) + HomeSearchBar.tsx (696 lines)
 * ✅ DRY Principle: Single component with mode variants
 * 
 * Features:
 * - Compact mode (for Hero sections)
 * - Expanded mode (for standalone search pages)
 * - Tab-based filtering (All/New/Used)
 * - Brand/Model cascading dropdowns
 * - Year and Price filters
 * - Dark mode support
 * - Responsive design
 * 
 * Props:
 * - mode: 'compact' | 'expanded' (default: 'compact')
 * - variant: 'hero' | 'header' (styling variant)
 * - showTabs: boolean (default: true)
 * - showAdvancedLink: boolean (default: true)
 * 
 * @architecture UI Components / Search
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Car, CheckCircle } from 'lucide-react';

import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import { logger } from '../../../../services/logger-service';
import { sanitizeCarMakeModel } from '../../../../utils/inputSanitizer';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedSearchBarProps {
  mode?: 'compact' | 'expanded';
  variant?: 'hero' | 'header';
  showTabs?: boolean;
  showAdvancedLink?: boolean;
  className?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const WidgetContainer = styled.div<{ 
  $isDark: boolean; 
  $mode: 'compact' | 'expanded';
  $variant: 'hero' | 'header';
}>`
  background: ${props => {
    if (props.$variant === 'hero') {
      return props.$isDark 
        ? 'linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(20, 25, 35, 0.95) 100%)' 
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.98) 100%)';
    }
    return props.$isDark ? '#000000' : '#ffffff';
  }};
  
  border-radius: ${props => props.$mode === 'compact' ? '20px' : '16px'};
  
  box-shadow: ${props => {
    if (props.$variant === 'hero') {
      return props.$isDark
        ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1)'
        : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 143, 16, 0.1)';
    }
    return props.$isDark 
      ? '0 8px 32px rgba(255, 215, 0, 0.2)' 
      : '0 8px 32px rgba(255, 143, 16, 0.15)';
  }};
  
  padding: ${props => props.$mode === 'compact' ? '0' : '2rem'};
  overflow: hidden;
  max-width: ${props => props.$mode === 'compact' ? '1100px' : '1000px'};
  width: 100%;
  position: relative;
  z-index: 10;
  font-family: 'Martica', 'Arial', sans-serif;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${props => props.$variant === 'header' && `
    border: 2px solid ${props.$isDark ? '#FFD700' : '#FF8F10'};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: ${props.$isDark 
        ? 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)' 
        : 'linear-gradient(90deg, #FF8F10, #FFD700, #FF8F10)'};
      opacity: 0.8;
    }
  `}

  @media (max-width: 768px) {
    border-radius: ${props => props.$mode === 'compact' ? '16px' : '12px'};
    padding: ${props => props.$mode === 'compact' ? '0' : '1.5rem'};
  }
`;

const TabsContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  background: ${props => props.$isDark 
    ? 'linear-gradient(180deg, rgba(30, 35, 45, 0.8) 0%, rgba(20, 25, 35, 0.8) 100%)' 
    : 'linear-gradient(180deg, rgba(241, 245, 249, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)'};
  border-bottom: ${props => props.$isDark 
    ? '1px solid rgba(255, 215, 0, 0.15)' 
    : '1px solid rgba(255, 143, 16, 0.15)'};
  backdrop-filter: blur(10px);
  padding: 0.25rem;
  gap: 0.25rem;
`;

const Tab = styled.button<{ $active: boolean; $isDark: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  background: ${props => {
    if (props.$active) {
      return props.$isDark
        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 165, 0, 0.08) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)';
    }
    return 'transparent';
  }};
  backdrop-filter: blur(20px);
  color: ${props => props.$active 
    ? (props.$isDark ? '#FFD700' : '#0F172A') 
    : (props.$isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b')};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$isDark 
      ? 'rgba(255, 215, 0, 0.08)' 
      : 'rgba(255, 143, 16, 0.05)'};
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
`;

const FormGrid = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  align-items: end;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<{ $isDark: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.9)' : '#1e293b'};
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  font-size: 0.95rem;
  border: 2px solid ${props => props.$isDark 
    ? 'rgba(255, 215, 0, 0.2)' 
    : 'rgba(226, 232, 240, 0.8)'};
  border-radius: 12px;
  background: ${props => props.$isDark 
    ? 'rgba(30, 35, 45, 0.6)' 
    : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.$isDark ? '#ffffff' : '#1e293b'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  appearance: none;

  &:focus {
    outline: none;
    border-color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
    box-shadow: ${props => props.$isDark 
      ? '0 0 0 3px rgba(255, 215, 0, 0.1)' 
      : '0 0 0 3px rgba(255, 143, 16, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 2rem 0.75rem 0.875rem;
    font-size: 0.875rem;
  }
`;

const IconWrapper = styled.div<{ $isDark: boolean }>`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${props => props.$isDark ? 'rgba(255, 215, 0, 0.6)' : '#64748b'};
`;

const SearchButton = styled.button<{ $isDark: boolean }>`
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  background: ${props => props.$isDark 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
    : 'linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%)'};
  color: ${props => props.$isDark ? '#000000' : '#ffffff'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: ${props => props.$isDark 
    ? '0 4px 16px rgba(255, 215, 0, 0.3)' 
    : '0 4px 16px rgba(255, 143, 16, 0.3)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark 
      ? '0 6px 20px rgba(255, 215, 0, 0.4)' 
      : '0 6px 20px rgba(255, 143, 16, 0.4)'};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }
`;

const AdvancedLink = styled.button<{ $isDark: boolean }>`
  grid-column: 1 / -1;
  background: none;
  border: none;
  color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  padding: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.$isDark ? '#FFA500' : '#FF6B35'};
    text-decoration: underline;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  mode = 'compact',
  variant = 'hero',
  showTabs = true,
  showAdvancedLink = true,
  className
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // State
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'used'>('all');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Data
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  // Load brands (deferred for performance)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        const allBrands = await brandsModelsDataService.getAllBrands();
        setBrands(allBrands);
      } catch (error) {
        logger.error('Error loading brands', error as Error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  // Load models when brand changes
  useEffect(() => {
    const loadModels = async () => {
      if (!make) {
        setModels([]);
        setModel('');
        return;
      }
      try {
        const brandModels = await brandsModelsDataService.getModelsForBrand(make);
        setModels(brandModels);
        setModel('');
      } catch (error) {
        logger.error('Error loading models', error as Error);
      }
    };
    loadModels();
  }, [make]);

  // Handle search
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (year) params.set('firstRegistrationFrom', year);
    if (priceMax) params.set('priceTo', priceMax);

    if (activeTab === 'new') {
      params.set('condition', 'new');
    } else if (activeTab === 'used') {
      params.set('condition', 'used');
    }

    navigate(`/cars?${params.toString()}`);
  }, [make, model, year, priceMax, activeTab, navigate]);

  // Translation helper
  const t = useCallback((en: string, bg: string) => 
    language === 'bg' ? bg : en, 
    [language]
  );

  return (
    <WidgetContainer 
      $isDark={isDark} 
      $mode={mode} 
      $variant={variant}
      className={className}
    >
      {showTabs && (
        <TabsContainer $isDark={isDark}>
          <Tab
            $active={activeTab === 'all'}
            $isDark={isDark}
            onClick={() => setActiveTab('all')}
          >
            <Car size={18} />
            {t('All Cars', 'Всички коли')}
          </Tab>
          <Tab
            $active={activeTab === 'used'}
            $isDark={isDark}
            onClick={() => setActiveTab('used')}
          >
            <CheckCircle size={18} />
            {t('Used', 'Употребявани')}
          </Tab>
          <Tab
            $active={activeTab === 'new'}
            $isDark={isDark}
            onClick={() => setActiveTab('new')}
          >
            {t('New', 'Нови')}
          </Tab>
        </TabsContainer>
      )}

      <FormGrid $isDark={isDark}>
        <FieldGroup>
          <Label $isDark={isDark}>{t('Make', 'Марка')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={make}
              onChange={(e) => setMake(sanitizeCarMakeModel(e.target.value))}
            >
              <option value="">{t('Any Make', 'Всички')}</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        <FieldGroup>
          <Label $isDark={isDark}>{t('Model', 'Модел')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={model}
              onChange={(e) => setModel(sanitizeCarMakeModel(e.target.value))}
              disabled={!make}
            >
              <option value="">{t('Any Model', 'Всички')}</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        <FieldGroup>
          <Label $isDark={isDark}>{t('First Reg.', 'Година от')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">{t('Any Year', 'Всички')}</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        <FieldGroup>
          <Label $isDark={isDark}>{t('Price up to', 'Цена до')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            >
              <option value="">{t('Any Price', 'Всички')}</option>
              <option value="5000">€ 5,000</option>
              <option value="10000">€ 10,000</option>
              <option value="15000">€ 15,000</option>
              <option value="20000">€ 20,000</option>
              <option value="30000">€ 30,000</option>
              <option value="50000">€ 50,000</option>
              <option value="75000">€ 75,000</option>
              <option value="100000">€ 100,000</option>
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        <FieldGroup style={{ gridColumn: mode === 'expanded' ? '1 / -1' : 'auto' }}>
          <SearchButton $isDark={isDark} onClick={handleSearch}>
            <Search size={20} />
            {t('Search', 'Търси')}
          </SearchButton>
        </FieldGroup>

        {showAdvancedLink && (
          <AdvancedLink 
            $isDark={isDark} 
            onClick={() => navigate('/advanced-search')}
          >
            {t('Detailed Search →', 'Подробно търсене →')}
          </AdvancedLink>
        )}
      </FormGrid>
    </WidgetContainer>
  );
};

export default React.memo(UnifiedSearchBar);

// Export for backward compatibility
export { UnifiedSearchBar as SearchWidget };
export { UnifiedSearchBar as HomeSearchBar };
