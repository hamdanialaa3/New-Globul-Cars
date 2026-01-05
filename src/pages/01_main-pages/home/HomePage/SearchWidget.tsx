
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, CheckCircle, Car } from 'lucide-react';

import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import { logger } from '../../../../services/logger-service';
import { sanitizeCarMakeModel } from '../../../../utils/inputSanitizer';

// --- Styled Components ---

const WidgetContainer = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)'};
  border-radius: 12px; /* Mobile.de uses softer, smaller radii on mobile cards */
  box-shadow: ${props => props.$isDark
    ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.1)'
    : '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)'}; /* Subtler, professional shadow */
  padding: 0;
  overflow: hidden;
  max-width: 1100px;
  width: 100%;
  position: relative;
  z-index: 10;
  font-family: 'Inter', sans-serif;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Oil-like fluid transition */

  @media (max-width: 768px) {
    border-radius: 0; /* Full bleed on very small screens or slight radius */
    margin: 0 -20px; /* Negative margin to span full width if container has padding */
    width: calc(100% + 40px);
    box-shadow: none; /* Flat on mobile for app-like feel */
    background: ${props => props.$isDark ? '#0f172a' : '#ffffff'};
  }
`;

const TabsContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.5)'
    : '#f1f5f9'};
  border-bottom: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  padding: 4px;
  gap: 4px;

  @media (max-width: 768px) {
    padding: 8px 16px;
    gap: 8px;
    background: transparent;
    border-bottom: none;
  }
`;

const Tab = styled.button<{ $active: boolean; $isDark: boolean; $tabType?: 'all' | 'new' | 'used' }>`
  flex: 1;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 15px; /* Readable size */
  border: none;
  background: ${props => {
    if (props.$active) return props.$isDark ? '#334155' : '#ffffff';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$active) return props.$isDark ? '#ffffff' : '#0f172a';
    return props.$isDark ? '#94a3b8' : '#64748b';
  }};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: ${props => props.$active
    ? '0 2px 8px rgba(0,0,0,0.08)'
    : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 14px;
    border-radius: 20px; /* Pill shape on mobile */
    border: 1px solid ${props => props.$active
    ? (props.$isDark ? '#38bdf8' : '#FF7900')
    : (props.$isDark ? '#334155' : '#e2e8f0')};
    background: ${props => props.$active
    ? (props.$isDark ? 'rgba(56, 189, 248, 0.1)' : '#FFF4EB')
    : 'transparent'};
    color: ${props => props.$active
    ? (props.$isDark ? '#38bdf8' : '#FF7900')
    : (props.$isDark ? '#94a3b8' : '#64748b')};
    box-shadow: none;
  }
`;

const FormGrid = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 16px;
  padding: 24px;
  background: transparent;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column; /* Vertical Stack */
    gap: 16px; 
    padding: 16px;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const Label = styled.label<{ $isDark: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$isDark ? '#cbd5e1' : '#475569'};
  margin-left: 2px;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  height: 48px; /* Desktop height */
  padding: 0 16px;
  padding-right: 40px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.$isDark ? '#f1f5f9' : '#0f172a'};
  background-color: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#cbd5e1'};
  border-radius: 8px;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:focus {
    outline: none;
    border-color: ${props => props.$isDark ? '#38bdf8' : '#FF7900'};
    box-shadow: 0 0 0 3px ${props => props.$isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 121, 0, 0.1)'};
  }

  /* Mobile Optimization */
  @media (max-width: 768px) {
    height: 52px; /* Taller touch target */
    font-size: 16px; /* Prevents iOS zoom */
    border-radius: 10px;
    background-color: ${props => props.$isDark ? '#1e293b' : '#f8fafc'};
    border-color: ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  }
`;

const IconWrapper = styled.div<{ $isDark: boolean }>`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const SearchButton = styled.button<{ $isDark: boolean }>`
  height: 48px;
  padding: 0 32px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
  /* Desktop: Orange gradient */
  background: linear-gradient(135deg, #FF7900 0%, #FF9433 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 12px rgba(255, 121, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(255, 121, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Optimization */
  @media (max-width: 768px) {
    width: 100%;
    height: 56px; /* Maximum impact button */
    font-size: 18px;
    border-radius: 12px;
    margin-top: 16px;
    box-shadow: 0 8px 20px rgba(255, 121, 0, 0.25);
  }
`;

const AdvancedLink = styled.button<{ $isDark: boolean }>`
  grid-column: 1 / -1;
  background: none;
  border: none;
  color: ${props => props.$isDark ? '#38bdf8' : '#003366'}; /* Mobile.de blue link color */
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  text-align: right;
  padding: 8px 0;
  transition: color 0.2s ease;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
    padding: 12px;
    font-size: 15px;
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'}; /* Muted on mobile */
  }
`;

// --- Component ---

const SearchWidget: React.FC = () => {
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
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i); // Last 30 years

  // Load Brands
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

  // Load Models
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

  // Handlers
  const handleSearch = () => {
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

    navigate(`/advanced-search?${params.toString()}`);
  };

  const t = (en: string, bg: string) => language === 'bg' ? bg : en;

  return (
    <WidgetContainer $isDark={isDark}>
      <TabsContainer $isDark={isDark}>
        <Tab
          $active={activeTab === 'all'}
          $isDark={isDark}
          $tabType="all"
          onClick={() => setActiveTab('all')}
        >
          <Car size={16} />
          {t('All Cars', 'Всички')}
        </Tab>
        <Tab
          $active={activeTab === 'used'}
          $isDark={isDark}
          $tabType="used"
          onClick={() => {
            setActiveTab('used');
            navigate('/sell/auto?condition=used');
          }}
        >
          <CheckCircle size={16} />
          {t('Used', 'Употребявани')}
        </Tab>
        <Tab
          $active={activeTab === 'new'}
          $isDark={isDark}
          $tabType="new"
          onClick={() => {
            setActiveTab('new');
            navigate('/sell/auto?condition=new');
          }}
        >
          {t('New', 'Нови')}
        </Tab>
      </TabsContainer>

      <FormGrid $isDark={isDark}>
        {/* Make Select */}
        <FieldGroup>
          <Label $isDark={isDark}>{t('Make', 'Марка')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={make}
              onChange={(e) => setMake(sanitizeCarMakeModel(e.target.value))}
            >
              <option value="">{t('Any Make', 'Всички марки')}</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        {/* Model Select */}
        <FieldGroup>
          <Label $isDark={isDark}>{t('Model', 'Модел')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={model}
              onChange={(e) => setModel(sanitizeCarMakeModel(e.target.value))}
              disabled={!make}
            >
              <option value="">{t('Any Model', 'Всички модели')}</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        {/* Year Select */}
        <FieldGroup>
          <Label $isDark={isDark}>{t('First Reg.', 'Година от')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">{t('Any Year', 'От година')}</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <IconWrapper $isDark={isDark}><ChevronDown size={16} /></IconWrapper>
          </SelectWrapper>
        </FieldGroup>

        {/* Price Select */}
        <FieldGroup>
          <Label $isDark={isDark}>{t('Price up to', 'Цена до')}</Label>
          <SelectWrapper>
            <Select
              $isDark={isDark}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            >
              <option value="">{t('Any Price', 'До цена')}</option>
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

        {/* Search Button */}
        <FieldGroup style={{ justifyContent: 'flex-end', marginTop: 'auto' }}>
          <SearchButton $isDark={isDark} onClick={handleSearch}>
            <Search size={20} />
            {language === 'bg' ? `Покажи ${Math.floor(Math.random() * 5000) + 1000} обяви` : `Show ${Math.floor(Math.random() * 5000) + 1000} offers`}
          </SearchButton>
        </FieldGroup>

        {/* Advanced Search Link */}
        <AdvancedLink $isDark={isDark} onClick={() => navigate('/advanced-search')}>
          {t('Detailed Search', 'Подробно търсене')}
        </AdvancedLink>

      </FormGrid>
    </WidgetContainer>
  );
};

export default SearchWidget;
