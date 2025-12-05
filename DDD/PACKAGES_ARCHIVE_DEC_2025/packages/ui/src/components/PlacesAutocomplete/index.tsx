// Places Autocomplete Component
// مكون البحث الذكي للمدن باستخدام Google Places API

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Search, MapPin, X } from 'lucide-react';
import googleMapsService from '@globul-cars/services/google-maps-enhanced.service';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  color: #667eea;
  width: 20px;
  height: 20px;
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #667eea;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SuggestionsList = styled.ul<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const SuggestionItem = styled.li<{ $isSelected: boolean }>`
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${props => props.$isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border-bottom: 1px solid #f0f0f0;

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  &:hover {
    background: rgba(102, 126, 234, 0.15);
  }

  svg {
    width: 18px;
    height: 18px;
    color: #667eea;
    flex-shrink: 0;
  }
`;

const SuggestionText = styled.div`
  flex: 1;
`;

const MainText = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
`;

const SecondaryText = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.2rem;
`;

const NoResults = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const LoadingState = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: #667eea;
  font-size: 0.9rem;
`;

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: any) => void;
  placeholder?: string;
  countryCode?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  countryCode = 'bg'
}) => {
  const { language } = useLanguage();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search places when input changes
  useEffect(() => {
    const searchPlaces = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      
      try {
        // Initialize service
        googleMapsService.initialize();
        
        // Search places
        const results = await googleMapsService.searchPlaces(value, countryCode);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching places:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [value, countryCode]);

  const handleSelect = (suggestion: any) => {
    onChange(suggestion.structured_formatting.main_text);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const defaultPlaceholder = language === 'bg' 
    ? 'Търсене на град или местоположение...' 
    : 'Search for city or location...';

  return (
    <Container ref={containerRef}>
      <SearchContainer>
        <SearchIcon />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || defaultPlaceholder}
        />
        {value && (
          <ClearButton onClick={handleClear} type="button">
            <X />
          </ClearButton>
        )}
      </SearchContainer>

      <SuggestionsList $show={showSuggestions}>
        {loading ? (
          <LoadingState>
            {language === 'bg' ? '🔄 Търсене...' : '🔄 Searching...'}
          </LoadingState>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion.place_id}
              $isSelected={index === selectedIndex}
              onClick={() => handleSelect(suggestion)}
            >
              <MapPin />
              <SuggestionText>
                <MainText>{suggestion.structured_formatting.main_text}</MainText>
                <SecondaryText>{suggestion.structured_formatting.secondary_text}</SecondaryText>
              </SuggestionText>
            </SuggestionItem>
          ))
        ) : value.length >= 2 ? (
          <NoResults>
            {language === 'bg' 
              ? 'Няма намерени резултати' 
              : 'No results found'}
          </NoResults>
        ) : null}
      </SuggestionsList>
    </Container>
  );
};

export default PlacesAutocomplete;

