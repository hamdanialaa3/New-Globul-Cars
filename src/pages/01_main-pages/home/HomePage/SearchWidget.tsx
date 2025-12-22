
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
    ? 'linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(20, 25, 35, 0.95) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.98) 100%)'};
  border-radius: 20px;
  box-shadow: ${props => props.$isDark
    ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 143, 16, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
  padding: 0;
  overflow: hidden;
  max-width: 1100px;
  width: 100%;
  position: relative;
  z-index: 10;
  font-family: 'Martica', 'Arial', sans-serif;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    border-radius: 16px;
    box-shadow: ${props => props.$isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.4)'
      : '0 10px 30px rgba(0, 0, 0, 0.1)'};
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

const Tab = styled.button<{ $active: boolean; $isDark: boolean; $tabType?: 'all' | 'new' | 'used' }>`
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
    return props.$isDark
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
  }};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  color: ${props => {
    if (props.$active) {
      return props.$isDark ? '#FFD700' : '#0F172A';
    }
    return props.$isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b';
  }};
  text-align: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  
  /* Glassmorphism glow effect */
  box-shadow: ${props => {
    if (props.$active) {
      return props.$isDark
        ? '0 8px 32px rgba(255, 215, 0, 0.25), 0 0 0 0px rgba(255, 215, 0, 0), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 8px 32px rgba(255, 143, 16, 0.2), 0 0 0 0px rgba(255, 143, 16, 0), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
    }
    return '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 0px rgba(255, 255, 255, 0)';
  }};

  /* Animated glow ring */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 12px;
    padding: 2px;
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.2), transparent)'
      : 'linear-gradient(135deg, rgba(255, 143, 16, 0.3), rgba(255, 165, 0, 0.15), transparent)'};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Shimmer effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    background: ${props => {
      if (props.$active) {
        return props.$isDark
          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.18) 0%, rgba(255, 165, 0, 0.12) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)';
      }
      return props.$isDark
        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 165, 0, 0.04) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)';
    }};
    color: ${props => {
      if (props.$active) {
        return props.$isDark ? '#FFD700' : '#0F172A';
      }
      return props.$isDark ? 'rgba(255, 255, 255, 0.85)' : '#475569';
    }};
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.$active) {
        return props.$isDark
          ? '0 12px 40px rgba(255, 215, 0, 0.35), 0 0 0 0px rgba(255, 215, 0, 0), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          : '0 12px 40px rgba(255, 143, 16, 0.3), 0 0 0 0px rgba(255, 143, 16, 0), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
      }
      return props.$isDark
        ? '0 8px 24px rgba(255, 215, 0, 0.15), 0 0 0 0px rgba(255, 215, 0, 0)'
        : '0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 0px rgba(255, 255, 255, 0)';
    }};
    
    &::before {
      opacity: ${props => props.$active ? 1 : 0.5};
    }
    
    &::after {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const FormGrid = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 1.25rem;
  padding: 2rem 1.5rem;
  background: ${props => props.$isDark 
    ? 'transparent' 
    : 'transparent'};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 1.5rem 1rem;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const Label = styled.label<{ $isDark: boolean }>`
  font-size: 0.688rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: ${props => props.$isDark 
    ? 'rgba(255, 217, 0, 0.56)' 
    : '#64748b'};
  margin-left: 0.5rem;
  transition: color 0.3s ease;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 0.875rem 1.125rem;
  padding-right: 2.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.$isDark ? '#FFD700' : '#0f172a'};
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(30, 35, 45, 0.6) 0%, rgba(20, 25, 35, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)'};
  border: ${props => props.$isDark
    ? '1px solid rgba(255, 215, 0, 0.2)'
    : '1px solid rgba(203, 213, 225, 0.6)'};
  border-radius: 12px;
  appearance: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$isDark
    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.05)'
    : 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.05)'};

  &:hover {
    border-color: ${props => props.$isDark ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 143, 16, 0.4)'};
    transform: translateY(-1px);
    box-shadow: ${props => props.$isDark
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(255, 215, 0, 0.15)'
      : 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(255, 143, 16, 0.15)'};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
    box-shadow: ${props => props.$isDark
      ? '0 0 0 4px rgba(255, 215, 0, 0.2), 0 4px 12px rgba(255, 215, 0, 0.25)'
      : '0 0 0 4px rgba(255, 143, 16, 0.2), 0 4px 12px rgba(255, 143, 16, 0.15)'};
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(40, 45, 55, 0.8) 0%, rgba(30, 35, 45, 0.8) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(250, 252, 255, 1) 100%)'};
    transform: translateY(-2px);
  }

  &:disabled {
    background: ${props => props.$isDark ? 'rgba(20, 25, 35, 0.4)' : 'rgba(241, 245, 249, 0.6)'};
    color: ${props => props.$isDark ? 'rgba(255, 215, 0, 0.3)' : '#94a3b8'};
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    background: ${props => props.$isDark ? '#1a1f2e' : '#ffffff'};
    color: ${props => props.$isDark ? '#FFD700' : '#0f172a'};
  }
`;

const IconWrapper = styled.div<{ $isDark: boolean }>`
  position: absolute;
  right: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${props => props.$isDark ? 'rgba(255, 215, 0, 0.7)' : '#64748b'};
  transition: color 0.3s ease, transform 0.3s ease;

  ${SelectWrapper}:hover & {
    color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
    transform: translateY(-50%) rotate(180deg);
  }
`;

const SearchButton = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.25) 0%, rgba(0, 123, 255, 0.2) 100%)'
    : 'linear-gradient(135deg, rgba(0, 102, 255, 0.4) 0%, rgba(0, 123, 255, 0.35) 100%)'};
  color: ${props => props.$isDark ? '#FFFFFF' : '#FFFFFF'};
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  padding: 0 2.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  box-shadow: ${props => props.$isDark
    ? '0 8px 32px rgba(0, 102, 255, 0.3), 0 0 0 0px rgba(100, 181, 246, 0), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
    : '0 8px 32px rgba(0, 102, 255, 0.25), 0 0 0 0px rgba(59, 130, 246, 0), inset 0 1px 0 rgba(255, 255, 255, 0.4)'};
  min-height: 50px;
  position: relative;
  overflow: hidden;

  /* Animated glow ring */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 14px;
    padding: 2px;
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.5), rgba(100, 181, 246, 0.3), transparent)'
      : 'linear-gradient(135deg, rgba(0, 102, 255, 0.4), rgba(59, 130, 246, 0.25), transparent)'};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Shimmer effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
  }
  
  @media (max-width: 1024px) {
    grid-column: 1 / -1;
    padding: 1rem;
  }

  &:hover {
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(0, 123, 255, 0.35) 0%, rgba(37, 99, 235, 0.3) 100%)'
      : 'linear-gradient(135deg, rgba(0, 123, 255, 0.5) 0%, rgba(37, 99, 235, 0.45) 100%)'};
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${props => props.$isDark
      ? '0 12px 48px rgba(0, 102, 255, 0.45), 0 0 0 0px rgba(100, 181, 246, 0), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      : '0 12px 48px rgba(0, 102, 255, 0.4), 0 0 0 0px rgba(59, 130, 246, 0), inset 0 1px 0 rgba(255, 255, 255, 0.5)'};
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1);
  }
`;

const AdvancedLink = styled.button<{ $isDark: boolean }>`
  grid-column: 1 / -1;
  background: none;
  border: none;
  color: ${props => props.$isDark ? 'rgba(255, 215, 0, 0.8)' : '#003366'};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: right;
  padding: 0.75rem 0 0 0;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0.5rem;
    right: 0;
    width: 0;
    height: 2px;
    background: ${props => props.$isDark 
      ? 'linear-gradient(90deg, transparent, #FFD700, transparent)' 
      : 'linear-gradient(90deg, transparent, #FF8F10, transparent)'};
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: ${props => props.$isDark ? '#FFD700' : '#FF8F10'};
    
    &::after {
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    text-align: center;
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
        if (year) params.set('firstRegistrationFrom', year); // Correct mapping
        if (priceMax) params.set('priceTo', priceMax);

        // Condition mapping based on tab
        if (activeTab === 'new') {
            params.set('condition', 'new');
        } else if (activeTab === 'used') {
            params.set('condition', 'used');
        }

        navigate(`/cars?${params.toString()}`);
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
                    <Car size={18} />
                    {t('All Cars', 'Всички коли')}
                </Tab>
                <Tab
                    $active={activeTab === 'used'}
                    $isDark={isDark}
                    $tabType="used"
                    onClick={() => setActiveTab('used')}
                >
                    <CheckCircle size={18} />
                    {t('Used', 'Употребявани')}
                </Tab>
                <Tab
                    $active={activeTab === 'new'}
                    $isDark={isDark}
                    $tabType="new"
                    onClick={() => setActiveTab('new')}
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
                            <option value="">{t('Any Make', 'Всички')}</option>
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
                            <option value="">{t('Any Model', 'Всички')}</option>
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
                            <option value="">{t('Any Year', 'Всички')}</option>
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

                {/* Search Button */}
                <FieldGroup style={{ justifyContent: 'flex-end' }}>
                    <SearchButton $isDark={isDark} onClick={handleSearch}>
                        <Search size={20} />
                        {language === 'bg' ? 'Търси' : 'Search'}
                    </SearchButton>
                </FieldGroup>

                {/* Advanced Search Link */}
                <AdvancedLink $isDark={isDark} onClick={() => navigate('/advanced-search')}>
                    {t('Detailed Search →', 'Подробно търсене →')}
                </AdvancedLink>

            </FormGrid>
        </WidgetContainer>
    );
};

export default SearchWidget;
