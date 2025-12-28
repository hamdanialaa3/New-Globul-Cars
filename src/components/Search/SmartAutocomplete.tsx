/**
 * Smart Autocomplete Component
 * مكون البحث التلقائي الذكي
 * 
 * Features:
 * - Real-time suggestions as user types
 * - Keyboard navigation (↑↓ arrows, Enter, Escape)
 * - Highlighted matching text
 * - Recent searches from localStorage
 * - Mobile-friendly
 * - Bulgarian/English support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { smartSearchService } from '@/services/search/smart-search.service';
import { searchAnalyticsService } from '@/services/analytics/search-analytics.service';
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 3.5rem;
  font-size: 1rem;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#2d3748' : '#e2e8f0'};
  border-radius: 16px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1f2e' : '#fff'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#a0aec0'};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#a0aec0'};
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#a0aec0'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2d3748' : '#e2e8f0'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  }
`;

const DropdownContainer = styled.div<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1f2e' : '#fff'};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(-10px)'};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  transition: all 0.2s;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#0a0e1a' : '#f1f5f9'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    border-radius: 4px;
  }
`;

const DropdownSection = styled.div`
  padding: 0.75rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#2d3748' : '#e2e8f0'};
  }
`;

const SectionHeader = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#718096' : '#a0aec0'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuggestionItem = styled.div<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.15s;
  background: ${props => props.$active 
    ? props.theme.mode === 'dark' ? '#2d3748' : '#f7fafc'
    : 'transparent'
  };
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2d3748' : '#f7fafc'};
  }
`;

const SuggestionContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SuggestionText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  font-weight: 500;
`;

const SuggestionHighlight = styled.span`
  color: #667eea;
  font-weight: 600;
`;

const SuggestionMeta = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#718096' : '#a0aec0'};
  margin-top: 0.25rem;
`;

const SuggestionCount = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#718096' : '#a0aec0'};
  background: ${({ theme }) => theme.mode === 'dark' ? '#0a0e1a' : '#edf2f7'};
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.mode === 'dark' ? '#718096' : '#a0aec0'};
  
  svg {
    margin: 0 auto 0.5rem;
    opacity: 0.5;
  }
`;

const RecentItem = styled(SuggestionItem)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RecentText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#718096'};
`;

const RemoveButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2d3748' : '#e2e8f0'};
    color: #f56565;
  }
`;

interface Suggestion {
  type: 'make' | 'model' | 'recent';
  text: string;
  count?: number;
  meta?: string;
}

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 200;
const RECENT_SEARCHES_KEY = 'bulgarski_mobili_recent_searches';

export const SmartAutocomplete: React.FC<SmartAutocompleteProps> = ({
  value,
  onChange,
  onSearch,
  placeholder
}) => {
  const { language, t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        logger.error('Failed to parse recent searches', error as Error);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove recent search
  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== query);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fetch suggestions from service
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      // Get autocomplete results from smart search service
      const results = await smartSearchService.getAutocompleteSuggestions(query, 10);
      
      const newSuggestions: Suggestion[] = [];

      // Add make suggestions
      results.makes?.forEach(make => {
        newSuggestions.push({
          type: 'make',
          text: make.value,
          count: make.count,
          meta: t('suggestions.make', 'Марка')
        });
      });

      // Add model suggestions
      results.models?.forEach(model => {
        newSuggestions.push({
          type: 'model',
          text: model.value,
          count: model.count,
          meta: t('suggestions.model', 'Модел')
        });
      });

      setSuggestions(newSuggestions);
      setShowDropdown(true);

    } catch (error) {
      logger.error('Failed to fetch autocomplete suggestions', error as Error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Debounced input handler
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
      setShowDropdown(value.length === 0 && recentSearches.length > 0);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, fetchSuggestions, recentSearches.length]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && recentSearches.length > 0) {
        setShowDropdown(true);
      }
      return;
    }

    const totalItems = suggestions.length + (value.length === 0 ? recentSearches.length : 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => (prev + 1) % totalItems);
        break;

      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;

      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < totalItems) {
          const allItems = [...suggestions, ...recentSearches.map(r => ({ type: 'recent' as const, text: r }))];
          const selected = allItems[activeIndex];
          handleSelectSuggestion(selected.text);
        } else {
          handleSearch();
        }
        break;

      case 'Escape':
        event.preventDefault();
        setShowDropdown(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (text: string) => {
    onChange(text);
    setShowDropdown(false);
    setActiveIndex(-1);
    saveRecentSearch(text);

    // Track autocomplete usage
    searchAnalyticsService.logSearch({
      query: text,
      resultsCount: 0,
      processingTime: 0,
      source: 'autocomplete',
      filters: {}
    });
  };

  // Handle search execution
  const handleSearch = () => {
    if (value.trim()) {
      saveRecentSearch(value);
      onSearch();
    }
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  // Handle clear button
  const handleClear = () => {
    onChange('');
    setShowDropdown(recentSearches.length > 0);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <SuggestionHighlight>{match}</SuggestionHighlight>
        {after}
      </>
    );
  };

  const showRecents = value.length === 0 && recentSearches.length > 0;
  const showSuggestions = suggestions.length > 0;
  const hasContent = showRecents || showSuggestions;

  return (
    <Container ref={containerRef}>
      <SearchInputWrapper>
        <SearchIcon size={20} />
        <SearchInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(hasContent)}
          placeholder={placeholder || t('search.placeholder', 'Търси марка, модел...')}
        />
        {value && (
          <ClearButton onClick={handleClear} aria-label="Clear search">
            <X size={18} />
          </ClearButton>
        )}
      </SearchInputWrapper>

      <DropdownContainer $show={showDropdown && hasContent}>
        {/* Recent Searches */}
        {showRecents && (
          <DropdownSection>
            <SectionHeader>
              <Clock size={14} />
              {t('recent.title', 'Скорошни търсения')}
            </SectionHeader>
            {recentSearches.map((search, index) => (
              <RecentItem
                key={search}
                $active={activeIndex === suggestions.length + index}
                onClick={() => handleSelectSuggestion(search)}
              >
                <RecentText>
                  <Clock size={16} />
                  {search}
                </RecentText>
                <RemoveButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(search);
                  }}
                  aria-label="Remove from recent"
                >
                  <X size={14} />
                </RemoveButton>
              </RecentItem>
            ))}
          </DropdownSection>
        )}

        {/* Suggestions */}
        {showSuggestions && (
          <DropdownSection>
            <SectionHeader>
              <TrendingUp size={14} />
              {t('suggestions.title', 'Предложения')}
            </SectionHeader>
            {suggestions.length === 0 ? (
              <EmptyState>
                <Search size={32} />
                <div>{t('suggestions.empty', 'Няма намерени резултати')}</div>
              </EmptyState>
            ) : (
              suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`${suggestion.type}-${suggestion.text}`}
                  $active={activeIndex === index}
                  onClick={() => handleSelectSuggestion(suggestion.text)}
                >
                  <SuggestionContent>
                    <div>
                      <SuggestionText>
                        {highlightText(suggestion.text, value)}
                      </SuggestionText>
                      {suggestion.meta && (
                        <SuggestionMeta>{suggestion.meta}</SuggestionMeta>
                      )}
                    </div>
                    {suggestion.count !== undefined && (
                      <SuggestionCount>
                        {suggestion.count} {t('suggestions.cars', 'коли')}
                      </SuggestionCount>
                    )}
                  </SuggestionContent>
                </SuggestionItem>
              ))
            )}
          </DropdownSection>
        )}
      </DropdownContainer>
    </Container>
  );
};

export default SmartAutocomplete;
