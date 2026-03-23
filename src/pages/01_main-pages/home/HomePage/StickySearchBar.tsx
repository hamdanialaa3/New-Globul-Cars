/**
 * StickySearchBar.tsx
 * Лепкава лента за търсене - Sticky Search Bar
 * 
 * Features / Характеристики:
 * ✅ Hidden initially, appears on scroll (scrollY > 400)
 * ✅ Glassmorphism design
 * ✅ Keyword input + Make dropdown + Search button
 * ✅ High z-index (fixed position)
 * ✅ Smooth slide-down animation
 * ✅ Mobile responsive
 * 
 * @performance optimized with throttled scroll listener
 * @a11y keyboard accessible, ARIA labels
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { brandsModelsDataService } from '@/services/brands-models-data.service';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StickyContainer = styled(motion.div)<{ $isDark: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  /* Glassmorphism Effect */
  background: ${props => props.$isDark
    ? 'rgba(15, 23, 42, 0.85)'
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  
  box-shadow: 0 4px 30px ${props => props.$isDark
    ? 'rgba(0, 0, 0, 0.4)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const SearchBarInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 10px 16px;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const Logo = styled.div<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#38bdf8' : 'var(--accent-primary)'};
  margin-right: 16px;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInputWrapper = styled.div<{ $isDark: boolean }>`
  flex: 1;
  min-width: 150px;
  position: relative;
  
  input {
    width: 100%;
    padding: 10px 16px;
    padding-left: 40px;
    border-radius: 8px;
    border: 1px solid ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
    background: ${props => props.$isDark
      ? 'rgba(30, 41, 59, 0.6)'
      : 'rgba(248, 250, 252, 0.8)'};
    color: ${props => props.$isDark ? '#e2e8f0' : '#1e293b'};
    font-size: 0.95rem;
    transition: all 0.2s ease;
    
    &::placeholder {
      color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
    }
    
    &:focus {
      outline: none;
      border-color: ${props => props.$isDark ? '#38bdf8' : 'var(--accent-primary)'};
      box-shadow: 0 0 0 3px ${props => props.$isDark
        ? 'rgba(56, 189, 248, 0.15)'
        : 'rgba(255, 121, 0, 0.15)'};
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
    width: 18px;
    height: 18px;
  }
`;

const SelectWrapper = styled.div<{ $isDark: boolean }>`
  position: relative;
  min-width: 160px;
  
  select {
    width: 100%;
    padding: 10px 36px 10px 16px;
    border-radius: 8px;
    border: 1px solid ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'};
    background: ${props => props.$isDark
      ? 'rgba(30, 41, 59, 0.6)'
      : 'rgba(248, 250, 252, 0.8)'};
    color: ${props => props.$isDark ? '#e2e8f0' : '#1e293b'};
    font-size: 0.95rem;
    cursor: pointer;
    appearance: none;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: ${props => props.$isDark ? '#38bdf8' : 'var(--accent-primary)'};
    }
  }
  
  svg {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    min-width: 120px;
    flex: 1;
  }
`;

const SearchButton = styled.button<{ $isDark: boolean }>`
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%)'};
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.$isDark
      ? 'rgba(56, 189, 248, 0.3)'
      : 'rgba(255, 121, 0, 0.3)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    
    span {
      display: none;
    }
  }
`;

const CloseButton = styled.button<{ $isDark: boolean }>`
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.$isDark ? '#e2e8f0' : '#1e293b'};
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const StickySearchBar: React.FC = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();

  // Load brands
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const allBrands = await brandsModelsDataService.getAllBrands();
        setBrands(allBrands.slice(0, 50)); // Top 50 brands
      } catch {
        setBrands(['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Ford']);
      }
    };
    loadBrands();
  }, []);

  // Throttled scroll handler
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          if (!isManuallyHidden) {
            setIsVisible(shouldShow);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManuallyHidden]);

  // Reset manual hide when scrolling back to top
  useEffect(() => {
    if (window.scrollY < 200) {
      setIsManuallyHidden(false);
    }
  }, [isVisible]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedMake) params.set('make', selectedMake);
    
    navigate(`/cars?${params.toString()}`);
  }, [keyword, selectedMake, navigate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClose = useCallback(() => {
    setIsManuallyHidden(true);
    setIsVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <StickyContainer
          $isDark={isDarkMode}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <SearchBarInner>
            <Logo $isDark={isDarkMode}>Koli One</Logo>
            
            <SearchInputWrapper $isDark={isDarkMode}>
              <Search />
              <input
                type="text"
                placeholder={language === 'bg' ? 'Търси модел, ключова дума...' : 'Search model, keyword...'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                aria-label={language === 'bg' ? 'Търсене' : 'Search'}
              />
            </SearchInputWrapper>
            
            <SelectWrapper $isDark={isDarkMode}>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                aria-label={language === 'bg' ? 'Избери марка' : 'Select make'}
              >
                <option value="">{language === 'bg' ? 'Всички марки' : 'All Makes'}</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <ChevronDown />
            </SelectWrapper>
            
            <SearchButton $isDark={isDarkMode} onClick={handleSearch}>
              <Search size={18} />
              <span>{language === 'bg' ? 'Търси' : 'Search'}</span>
            </SearchButton>
            
            <CloseButton 
              $isDark={isDarkMode} 
              onClick={handleClose}
              aria-label={language === 'bg' ? 'Затвори' : 'Close'}
            >
              <X size={18} />
            </CloseButton>
          </SearchBarInner>
        </StickyContainer>
      )}
    </AnimatePresence>
  );
});

StickySearchBar.displayName = 'StickySearchBar';

export default StickySearchBar;
