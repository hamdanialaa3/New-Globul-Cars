import { useState } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { carDataBrowserService, CarDataFromFile } from '../services/carDataBrowserService';
import { useTranslation } from '../hooks/useTranslation';

interface CarSearchProps {
  onSearchResults: (results: CarDataFromFile[]) => void;
}

const SearchContainer = styled.div`
  background: ${(props: any) => props.theme.colors?.background?.paper || '#ffffff'};
  border-radius: ${(props: any) => props.theme.borderRadius?.lg || '12px'};
  padding: ${(props: any) => props.theme.spacing?.xl || '24px'};
  margin-bottom: ${(props: any) => props.theme.spacing?.xl || '24px'};
  box-shadow: ${(props: any) => props.theme.shadows?.base || '0 1px 3px rgba(0,0,0,0.1)'};
  border: 1px solid ${(props: any) => props.theme.colors?.grey?.[200] || '#e2e8f0'};
`;

// Header for simple search
const SearchHeader = styled.div`
  margin-bottom: ${(props: any) => props.theme.spacing?.lg || '18px'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchSection = styled.div`
  margin-bottom: ${(props: any) => props.theme.spacing?.xl || '24px'};
`;

const SearchTitle = styled.h3`
  font-size: ${(props: any) => props.theme.typography?.fontSize?.xl || '20px'};
  font-weight: ${(props: any) => props.theme.typography?.fontWeight?.bold || '700'};
  color: ${(props: any) => props.theme.colors?.text?.primary || '#333333'};
  margin: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${(props: any) => props.theme.spacing?.md || '16px'};
  border: 1px solid ${(props: any) => props.theme.colors?.grey?.[300] || '#cbd5e1'};
  border-radius: ${(props: any) => props.theme.borderRadius?.base || '6px'};
  font-size: ${(props: any) => props.theme.typography?.fontSize?.base || '16px'};
  background: ${(props: any) => props.theme.colors?.background?.paper || '#ffffff'};
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }

  &::placeholder {
    color: ${(props: any) => props.theme.colors?.text?.secondary || '#666666'};
  }
`;

// Removed internal advanced filters to avoid duplicating the standalone AdvancedSearch

const SearchButton = styled.button`
  width: 100%;
  padding: ${(props: any) => props.theme.spacing?.md || '16px'};
  background: ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
  color: ${(props: any) => props.theme.colors?.primary?.contrastText || '#ffffff'};
  border: 2px solid ${(props: any) => props.theme.colors?.primary?.main || '#0066cc'};
  border-radius: ${(props: any) => props.theme.borderRadius?.base || '6px'};
  font-weight: ${(props: any) => props.theme.typography?.fontWeight?.bold || '700'};
  font-size: ${(props: any) => props.theme.typography?.fontSize?.base || '16px'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${(props: any) => props.theme.colors?.primary?.dark || '#004499'};
    border-color: ${(props: any) => props.theme.colors?.primary?.dark || '#004499'};
  }

  &:active {
    transform: translateY(1px);
  }
`;

// No local results rendering here; results are handled by parent CarsPage

const CarSearchSystemNew: React.FC<CarSearchProps> = ({ onSearchResults }) => {
  const { t } = useTranslation();
  const [simpleSearch, setSimpleSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSimpleSearch = async () => {
    if (!simpleSearch.trim()) return;

    setIsLoading(true);
    try {
      const results = await carDataBrowserService.searchCars(simpleSearch);
      onSearchResults(results);
    } catch (error) {
      console.error('Simple search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSimpleSearch();
    }
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>{t('simple_search', 'Simple Search')}</SearchTitle>
      </SearchHeader>

      <SearchSection>
        <SearchInput
          type="text"
          placeholder={t('search_placeholder', 'Enter make, model, or keywords...')}
          value={simpleSearch}
          onChange={(e) => setSimpleSearch(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton
          onClick={handleSimpleSearch}
          disabled={isLoading}
        >
          {isLoading ? t('common.searching', 'Searching...') : t('common.search', 'Search')}
        </SearchButton>
      </SearchSection>
    </SearchContainer>
  );
};

export default CarSearchSystemNew;