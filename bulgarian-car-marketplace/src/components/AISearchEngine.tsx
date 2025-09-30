// src/components/AISearchEngine.tsx
// AI-Powered Smart Search Engine for Bulgarian Car Marketplace

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

interface AISearchEngineProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  font-size: 1.1rem;
  border: 2px solid #e1e5e9;
  border-radius: 50px;
  outline: none;
  background: white;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &::placeholder {
    color: #999;
    font-style: italic;
  }

  &:focus {
    border-color: #005ca9;
    box-shadow: 0 4px 20px rgba(0, 84, 169, 0.15);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: #007bff;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #005ca9 0%, #007bff 100%);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 84, 169, 0.3);

  &:hover {
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 84, 169, 0.4);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
    color: white;
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 8px;
  border: 1px solid #e1e5e9;
`;

const SuggestionItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
    color: #005ca9;
  }

  &.highlighted {
    background: #e3f2fd;
    color: #005ca9;
    font-weight: 500;
  }
`;

const SearchInfo = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const AIIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #005ca9;
  font-weight: 500;
  font-size: 0.85rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AISearchEngine: React.FC<AISearchEngineProps> = ({
  onSearch,
  placeholder,
  className
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // AI-powered search suggestions based on keywords
  const generateSuggestions = useCallback((input: string) => {
    if (!input.trim()) return [];

    const keywords = input.toLowerCase().split(' ').filter(word => word.length > 0);

    // Predefined smart suggestions in both languages
    const englishSuggestions = [
      'luxury sedan',
      'sports car',
      'SUV family car',
      'electric vehicle',
      'diesel automatic',
      'low mileage',
      'recent model',
      'premium brand',
      'compact hatchback',
      'off-road vehicle'
    ];

    const bulgarianSuggestions = [
      'луксозен седан',
      'спортна кола',
      'семеен SUV',
      'електрическо превозно средство',
      'дизел автоматична',
      'нисък пробег',
      'нов модел',
      'премиум марка',
      'компактен хечбек',
      'офроуд превозно средство'
    ];

    const currentSuggestions = language === 'bg' ? bulgarianSuggestions : englishSuggestions;

    // Filter suggestions based on input keywords
    return currentSuggestions.filter(suggestion =>
      keywords.some(keyword =>
        suggestion.toLowerCase().includes(keyword)
      )
    ).slice(0, 5); // Limit to 5 suggestions
  }, [language]);

  useEffect(() => {
    if (query.length > 1) {
      const newSuggestions = generateSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, generateSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      setQuery(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSearch(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    return language === 'bg'
      ? 'Потърсете кола с AI... (напр. "луксозен седан" или "електрическа кола")'
      : 'Search for cars with AI... (e.g. "luxury sedan" or "electric car")';
  };

  return (
    <SearchContainer className={className}>
      <SearchInputWrapper>
        <SearchInput
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          autoComplete="off"
        />
        <SearchButton onClick={() => handleSearch()}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </SearchButton>
      </SearchInputWrapper>

      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={index}
              className={index === selectedIndex ? 'highlighted' : ''}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionsContainer>
      )}

      <SearchInfo>
        <AIIndicator>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {language === 'bg' ? 'AI مدعوم بالذكاء الاصطناعي' : 'AI-Powered Search'}
        </AIIndicator>
      </SearchInfo>
    </SearchContainer>
  );
};

export default AISearchEngine;
