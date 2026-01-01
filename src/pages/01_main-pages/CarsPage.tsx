// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace - Modern & Professional Design
// صفحة عرض السيارات مع بحث بالكلمات المفتاحية والذكاء الاصطناعي
// ⚡ Performance Optimized with Firebase Caching + AI Smart Search
//
// 🔍 SEARCH STRATEGY:
// - /cars → Simple keyword-based search (this page)
// - /advanced-search → Advanced filters with all vehicle specifications
// 
// Note: Mobile filter drawer removed as per project requirement.
// All advanced filtering is handled via /advanced-search page.

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
import { firebaseCache, cacheKeys } from '../../services/firebase/UnifiedFirebaseService';
import CarCardCompact from '../../components/CarCard/CarCardCompact';
import { ResponsiveGrid } from '../../components/layout/ResponsiveGrid';
import { Virtuoso } from 'react-virtuoso';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { smartSearchService } from '../../services/search/smart-search.service';
import { searchHistoryService } from '../../services/search/search-history.service';
import { searchAnalyticsService } from '../../services/analytics/search-analytics.service';
import { SmartAutocomplete } from '../../components/Search/SmartAutocomplete';
import AISearchButton from '../../components/Search/AISearchButton';
import SaveSearchButton from '../../components/Search/SaveSearchButton';
import { SearchCriteria } from '../../services/search/saved-searches-alerts.service';
import { Search, X, Clock, TrendingUp, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

// ⚡ NEW PERFORMANCE SERVICES - Phase 2 Optimization
import { queryOptimizationService } from '../../services/search/query-optimization.service';
import { paginationService, PaginationState } from '../../services/search/pagination.service';
import { browserCacheStrategy } from '../../services/search/browser-cache-strategy.service';

const PALETTE = {
  primary: '#0B5FFF',
  primaryHover: '#0A4FDB',
  accent: '#00C48C',
  text: '#0F172A',
  muted: '#475569',
  surface: '#FFFFFF',
  gradient: 'linear-gradient(135deg, #0B5FFF 0%, #061B4F 100%)',
};

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

const rotateGear = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const CarsContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(160deg, #050914 0%, #0b1224 40%, #05070f 100%)'
      : `linear-gradient(160deg, ${theme.colors.grey[50]} 0%, ${theme.colors.grey[100]} 45%, ${theme.colors.background.default} 100%)`};
  padding: 72px 0 96px;
  transition: background 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -120px;
    background-image:
      linear-gradient(
        ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(2, 6, 23, 0.06)')} 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(2, 6, 23, 0.06)')} 1px,
        transparent 1px
      );
    background-size: 160px 160px;
    opacity: ${({ theme }) => (theme.mode === 'dark' ? 0.6 : 0.35)};
    mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9), transparent 70%);
  }

  &::after {
    content: '';
    position: absolute;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    top: -110px;
    right: -150px;
    background:
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0 30%, transparent 32%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.35) 0 6%, transparent 7% 12%, rgba(255, 255, 255, 0.18) 13% 16%, transparent 17% 100%),
      conic-gradient(from 0deg,
        rgba(255,255,255,0.35) 0deg 10deg,
        transparent 10deg 20deg,
        rgba(255,255,255,0.3) 20deg 30deg,
        transparent 30deg 40deg,
        rgba(255,255,255,0.25) 40deg 50deg,
        transparent 50deg 60deg,
        rgba(255,255,255,0.3) 60deg 70deg,
        transparent 70deg 80deg,
        rgba(255,255,255,0.22) 80deg 90deg,
        transparent 90deg 100deg,
        rgba(255,255,255,0.3) 100deg 110deg,
        transparent 110deg 120deg,
        rgba(255,255,255,0.25) 120deg 130deg,
        transparent 130deg 140deg,
        rgba(255,255,255,0.3) 140deg 150deg,
        transparent 150deg 360deg);
    mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0 68%, transparent 74% 100%);
    animation: ${rotateGear} 22s linear infinite;
    opacity: 0.75;
    mix-blend-mode: screen;
    filter: drop-shadow(0 18px 60px rgba(0,0,0,0.45));
  }
  
  @media (max-width: 768px) {
    padding: 48px 0 80px;
  }
  
  @media (max-width: 480px) {
    padding: 36px 0 70px;
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 14px;
    max-width: 100%;
  }
`;

const PageHeader = styled.div`
  position: relative;
  text-align: center;
  margin: 0 auto 32px;
  max-width: 1000px;
  padding: 40px 32px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(12, 18, 32, 0.78)'
      : 'rgba(255, 255, 255, 0.88)'};
  border-radius: 18px;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : theme.colors.grey[200])};
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 25px 70px rgba(0, 0, 0, 0.4)'
      : '0 22px 60px rgba(15, 23, 42, 0.10)'};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f8fbff' : theme.colors.text.primary)};
  backdrop-filter: blur(14px);
  ${css`animation: ${fadeInUp} 0.6s ease-out;`}

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 24px 18px;
  }

  h1 {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
    color: ${({ theme }) => (theme.mode === 'dark' ? '#fefefe' : theme.colors.text.primary)};

    @media (max-width: 768px) {
      font-size: 1.6rem;
      margin-bottom: 8px;
    }
  }

  p {
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    color: ${({ theme }) => (theme.mode === 'dark' ? '#e0e8ff' : theme.colors.text.secondary)};
    max-width: 680px;
    margin: 0 auto;
    line-height: 1.5;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const CityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(2, 6, 23, 0.06)'};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#fefefe' : theme.colors.text.primary)};
  padding: 0.65rem 1.35rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem auto 0;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.22)' : theme.colors.grey[200])};
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 16px 36px rgba(0, 0, 0, 0.28)'
      : '0 14px 30px rgba(15, 23, 42, 0.08)'};
  backdrop-filter: blur(10px);
`;

// ============================================================================
// MODERN SEARCH BAR WITH AI & ADVANCED FILTERS
// ============================================================================

const SearchSection = styled.div`
  max-width: 1000px;
  margin: 20px auto 32px;
  ${css`animation: ${fadeInUp} 0.7s ease-out 0.1s both;`}
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin: 14px auto 20px;
    padding: 0 8px;
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
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.92)'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : theme.colors.grey[200])};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 20px 50px rgba(0, 0, 0, 0.35)'
      : '0 14px 34px rgba(15, 23, 42, 0.10)'};
  backdrop-filter: blur(12px);
  
  &:focus-within {
    border-color: rgba(11, 95, 255, 0.6);
    box-shadow: 0 22px 60px rgba(11, 95, 255, 0.16);
    transform: translateY(-2px);
  }
  
  &:hover {
    box-shadow: 0 22px 55px rgba(0, 0, 0, 0.42);
  }
`;

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : theme.colors.text.secondary};
  
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
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f8fbff' : theme.colors.text.primary)};
  
  &::placeholder {
    color: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : theme.colors.text.secondary};
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
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(2, 6, 23, 0.05)'};
    color: ${PALETTE.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.92), rgba(10, 79, 219, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 18px 36px rgba(11, 95, 255, 0.32);
  backdrop-filter: blur(6px);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(11, 95, 255, 1), rgba(10, 79, 219, 1));
    box-shadow: 0 22px 44px rgba(11, 95, 255, 0.4);
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
  margin-bottom: 16px;
  
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
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  overflow: hidden;
  color: #f6f8ff;
  backdrop-filter: blur(10px);
  
  /* Primary - Advanced Search */
  ${props => props.variant === 'primary' && css`
    background: linear-gradient(135deg, rgba(11, 95, 255, 0.9), rgba(10, 79, 219, 0.9));
    box-shadow: 0 20px 40px rgba(11, 95, 255, 0.25);
    
    &:hover {
      transform: translateY(-3px);
      background: linear-gradient(135deg, rgba(11, 95, 255, 1), rgba(10, 79, 219, 1));
      box-shadow: 0 24px 48px rgba(11, 95, 255, 0.35);
    }
  `}
  
  /* AI Search */
  ${props => props.variant === 'ai' && css`
    background: linear-gradient(135deg, rgba(0, 196, 140, 0.9), rgba(0, 168, 120, 0.9));
    color: #052f1f;
    box-shadow: 0 18px 38px rgba(0, 196, 140, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 22px 42px rgba(0, 196, 140, 0.38);
    }
  `}
  
  /* Secondary - Filter Results */
  ${props => props.variant === 'secondary' && css`
    background: rgba(255, 255, 255, 0.08);
    color: #e9edf6;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.25);
    
    &:hover {
      border-color: rgba(11, 95, 255, 0.6);
      color: #f6f8ff;
      box-shadow: 0 20px 34px rgba(0, 0, 0, 0.35);
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
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(12, 18, 32, 0.94)' : 'rgba(255, 255, 255, 0.96)'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme.colors.grey[200])};
  border-radius: 12px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 24px 60px rgba(0, 0, 0, 0.45)'
      : '0 18px 44px rgba(15, 23, 42, 0.14)'};
  backdrop-filter: blur(12px);
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary};
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
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f5f7ff' : theme.colors.text.primary)};
  transition: background 0.15s;
  
  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(2, 6, 23, 0.05)'};
  }
  
  &:active {
    background: ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#e9ecef'};
  }
`;

// ⚡ NEW: Pagination Controls
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 48px;
  padding: 24px;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 16px;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.colors.grey[200]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const PaginationInfo = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PageButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.colors.grey[300]};
  background: ${props => props.disabled 
    ? 'rgba(100, 100, 100, 0.1)' 
    : ({ theme }) => theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.15)' : PALETTE.primary};
  color: ${props => props.disabled 
    ? 'rgba(150, 150, 150, 0.5)' 
    : ({ theme }) => theme.mode === 'dark' ? '#fff' : '#fff'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.25)' : PALETTE.primaryHover};
    box-shadow: 0 8px 20px rgba(11, 95, 255, 0.25);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const PageNumber = styled.div`
  padding: 8px 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
`;

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // ⚡ NEW: Smart Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSmartSearchActive, setIsSmartSearchActive] = useState(false);
  const [searchSessionId, setSearchSessionId] = useState<string | null>(null); // ✅ NEW: Track current search session for analytics
  
  // ⚡ NEW: Pagination State - Phase 2 Optimization
  const [paginationState, setPaginationState] = useState<PaginationState | null>(null);
  const [totalCars, setTotalCars] = useState(0);
  
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

  // ⚡ NEW: Handle AI search filters
  const handleAISearch = async (aiFilters: any) => {
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false);
    setIsSmartSearchActive(true);

    try {
      // Convert AI filters to search query
      const combinedQuery = [
        searchQuery,
        aiFilters.make?.join(' '),
        aiFilters.model?.join(' '),
        aiFilters.fuelType,
        aiFilters.transmission,
        aiFilters.city
      ].filter(Boolean).join(' ');

      const result = await smartSearchService.search(combinedQuery, user?.uid, 1, 100);
      setCars(result.cars as CarListing[]);
      logger.info('AI search completed', { aiFilters, resultsCount: result.cars.length });
    } catch (err) {
      logger.error('AI search failed', err as Error);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // ⚡ NEW: Handle smart search with analytics
  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to normal mode if search is empty
      setIsSmartSearchActive(false);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false);
    setIsSmartSearchActive(true); // Mark that we're in smart search mode
    
    const startTime = Date.now();
    
    try {
      const result = await smartSearchService.search(searchQuery, user?.uid, 1, 100);
      const processingTime = Date.now() - startTime;
      
      // 📊 Log search to analytics (only if user is logged in)
      if (user?.uid) {
        const searchId = await searchAnalyticsService.logSearch({
          query: searchQuery,
          resultsCount: result.cars.length,
          processingTime,
          source: 'direct',
          filters: {},
          userId: user.uid,
          language
        });
        
        // ✅ FIX: Save searchId for click tracking
        setSearchSessionId(searchId);
      }
      
      logger.debug('Smart Search Result', {
        context: 'CarsPage',
        action: 'smartSearch',
        data: {
          carsCount: result.cars.length,
          totalCount: result.totalCount,
          isPersonalized: result.isPersonalized,
          processingTime,
          firstCar: result.cars[0] ? {
            make: result.cars[0].make,
            model: result.cars[0].model,
            year: result.cars[0].year
          } : null
        }
      });
      
      setCars(result.cars as CarListing[]);
      setError(null); // Clear any previous errors
      
      logger.info('Smart search completed', { 
        query: searchQuery, 
        results: result.totalCount,
        personalized: result.isPersonalized,
        processingTime
      });
    } catch (err) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Smart search error:', err);
      logger.error('❌ Smart Search FAILED', err as Error, {
        context: 'CarsPage',
        action: 'smartSearch'
      });
      
      // Log failed search
      await searchAnalyticsService.logSearch({
        query: searchQuery,
        resultsCount: 0,
        processingTime,
        source: 'direct',
        filters: {},
        userId: user?.uid,
        language
      });
      
      setError('Search failed');
      setCars([]); // Clear cars on error
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Track car click for analytics
  const handleCarClick = async (car: CarListing, position: number) => {
    // ✅ STRICT CHECK: Only track if we have a valid search session
    if (!isSmartSearchActive || !searchQuery || !searchSessionId) {
      // Not a search result click - skip analytics
      return;
    }

    // Track click-through for search analytics
    try {
      await searchAnalyticsService.logClick({
        searchId: searchSessionId, // ✅ Guaranteed to be non-null here
        carId: car.id,
        position,
        userId: user?.uid
      });
    } catch (error) {
      // Silently fail - don't break user experience
      logger.error('Failed to log car click', error as Error);
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

  // ⚡ OPTIMIZED: Load cars with Query Optimization + Browser Cache + Pagination
  useEffect(() => {
    // Skip loading if smart search is active
    if (isSmartSearchActive) {
      return;
    }
    
    const loadCarsOptimized = async () => {
      const startTime = performance.now();
      
      try {
        setLoading(true);
        setError(null);
        
        // Read filters from URL params
        const regionParam = searchParams.get('city');
        const makeParam = searchParams.get('make');
        const pageParam = parseInt(searchParams.get('page') || '1', 10);
        
        logger.info('🔍 CarsPage - Loading with filters', { regionParam, makeParam, page: pageParam });

        // Build filters object
        const filters: Record<string, unknown> = {
          isActive: true,
          isSold: false
        };

        if (regionParam) filters.region = regionParam;
        if (makeParam) filters.make = makeParam;

        // Add all URL filter params
        const modelParam = searchParams.get('model');
        const fuelTypeParam = searchParams.get('fuelType');
        const transmissionParam = searchParams.get('transmission');
        const priceMinParam = searchParams.get('priceMin');
        const priceMaxParam = searchParams.get('priceMax');
        const yearMinParam = searchParams.get('yearMin');
        const yearMaxParam = searchParams.get('yearMax');

        if (modelParam) filters.model = modelParam;
        if (fuelTypeParam) filters.fuelType = fuelTypeParam;
        if (transmissionParam) filters.transmission = transmissionParam;
        if (priceMinParam) filters.minPrice = parseFloat(priceMinParam);
        if (priceMaxParam) filters.maxPrice = parseFloat(priceMaxParam);
        if (yearMinParam) filters.minYear = parseInt(yearMinParam);
        if (yearMaxParam) filters.maxYear = parseInt(yearMaxParam);

        // ⚡ Generate deterministic cache key
        const cacheKey = browserCacheStrategy.createCacheKey('cars_search', filters, { page: pageParam });
        
        // ⚡ Use Browser Cache Strategy with 5-minute TTL
        const result = await browserCacheStrategy.getOrFetch(
          cacheKey,
          async () => {
            logger.info('📡 Cache miss - fetching from queryOptimizationService...');
            // ⚡ Use Query Optimization Service for parallel multi-collection search
            return await queryOptimizationService.searchWithClientFilters(
              filters,
              { page: pageParam, limit: 20 } // 20 cars per page
            );
          },
          5 * 60 * 1000 // 5 minutes TTL
        );
        
        // Convert to CarListing format
        const carListings: CarListing[] = result.cars.map((car: any) => ({
          ...car,
          vehicleType: car.vehicleType || 'car',
          sellerType: car.sellerType || 'private',
          sellerName: car.sellerName || '',
          sellerEmail: car.sellerEmail || '',
          sellerPhone: car.sellerPhone || '',
          city: car.locationData?.cityName || '',
          region: car.region || '',
          status: car.status || 'active',
          currency: car.currency || 'EUR'
        } as CarListing));
        
        setCars(carListings);
        setTotalCars(result.totalCount);
        setPaginationState(result.pagination);
        
        const loadTime = performance.now() - startTime;
        logger.info(`⚡ Cars loaded in ${loadTime.toFixed(0)}ms`, {
          count: carListings.length,
          total: result.totalCount,
          page: pageParam,
          cacheStats: browserCacheStrategy.getStats()
        });
      } catch (err) {
        const error = err as Error;
        logger.error('❌ Error loading cars', error, {
          context: 'CarsPage',
          action: 'loadCarsOptimized'
        });
        setError(error.message || 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    loadCarsOptimized();
  }, [searchParams, isSmartSearchActive]);
  
  // ⚡ Pagination handlers
  const handleNextPage = () => {
    if (!paginationState?.hasNextPage) return;
    const newPage = paginationState.currentPage + 1;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePreviousPage = () => {
    if (!paginationState?.hasPreviousPage) return;
    const newPage = paginationState.currentPage - 1;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              {language === 'bg' ? 'Локация' : 'Location'}: {cityDisplayName} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Brand/Make Badge */}
          {makeParam && !cityData && (
            <CityBadge>
              {language === 'bg' ? 'Марка' : 'Make'}: {makeParam} · {cars.length} {carsCountText}
            </CityBadge>
          )}
          
          {/* Combined Badge (Region + Brand) */}
          {cityData && makeParam && (
            <CityBadge>
              {language === 'bg' ? 'Локация' : 'Location'}: {cityDisplayName} · {language === 'bg' ? 'Марка' : 'Make'}: {makeParam} · {cars.length} {carsCountText}
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
            
            {/* ✅ NEW: AI Smart Search Button */}
            <AISearchButton
              query={searchQuery}
              onSearch={handleAISearch}
              disabled={isSearching || !searchQuery.trim()}
              variant="secondary"
            />
          </ActionButtonsRow>

          {/* Main Search Bar - NEW: Smart Autocomplete */}
          <SearchBarWrapper>
            <SmartAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSmartSearch}
              onSelect={(value) => {
                setSearchQuery(value);
                // Auto-trigger search after selection
                setTimeout(() => handleSmartSearch(), 100);
              }}
              placeholder={
                language === 'bg' 
                  ? 'Търси марка, модел, град...' 
                  : 'Search make, model, city...'
              }
            />
          </SearchBarWrapper>

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
            <CarIcon size={64} color={PALETTE.accent} style={{ marginBottom: '16px', opacity: 0.65 }} />
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
          <>
            <CarsGridWrapper>
              {cars.length > 50 ? (
                // Use Virtual Scrolling for large lists (50+ items) for better performance
                <Virtuoso
                  data={cars}
                  itemContent={(index, car) => (
                    <div onClick={() => handleCarClick(car, index)}>
                      <CarCardCompact key={car.id} car={car} />
                    </div>
                  )}
                  style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
                  overscan={10}
                />
              ) : (
                // Use regular grid for smaller lists
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
                  {cars.map((car, index) => (
                    <div key={car.id} onClick={() => handleCarClick(car, index)}>
                      <CarCardCompact car={car} />
                    </div>
                  ))}
                </ResponsiveGrid>
              )}
            </CarsGridWrapper>

            {/* ⚡ NEW: Pagination Controls */}
            {paginationState && (paginationState.totalPages > 1) && (
              <PaginationContainer>
                <PaginationInfo>
                  {language === 'bg' ? 'Показани' : 'Showing'}{' '}
                  <span>{paginationState.offset + 1}</span>-
                  <span>{Math.min(paginationState.offset + paginationState.limit, totalCars)}</span>{' '}
                  {language === 'bg' ? 'от' : 'of'}{' '}
                  <span>{totalCars}</span> {carsCountText}
                </PaginationInfo>

                <PaginationButtons>
                  <PageButton
                    onClick={handlePreviousPage}
                    disabled={!paginationState.hasPreviousPage}
                  >
                    <ChevronLeft />
                    {language === 'bg' ? 'Предишна' : 'Previous'}
                  </PageButton>

                  <PageNumber>
                    {language === 'bg' ? 'Страница' : 'Page'} {paginationState.currentPage} {language === 'bg' ? 'от' : 'of'} {paginationState.totalPages}
                  </PageNumber>

                  <PageButton
                    onClick={handleNextPage}
                    disabled={!paginationState.hasNextPage}
                  >
                    {language === 'bg' ? 'Следваща' : 'Next'}
                    <ChevronRight />
                  </PageButton>
                </PaginationButtons>
              </PaginationContainer>
            )}
          </>
        )}

      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;