import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Search, TrendingUp, Clock, Star, Filter } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'trending' | 'category' | 'brand' | 'model';
  category?: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SmartSearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
  maxSuggestions?: number;
  showCategories?: boolean;
  showCounts?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSearch?: (query: string) => void;
}

const SmartSearchSuggestionsContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
`;

const SmartSearchSuggestionsHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  background: ${({ theme }) => theme.colors.grey[50]};
`;

const SmartSearchSuggestionsTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SmartSearchSuggestionsSection = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const SmartSearchSuggestionsSectionHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[100]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SmartSearchSuggestionsSectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SmartSearchSuggestionsClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[200]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SmartSearchSuggestionsList = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

const SmartSearchSuggestionItem = styled.button<{ isHighlighted: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  background: ${({ theme, isHighlighted }) => 
    isHighlighted ? theme.colors.primary.light + '20' : 'transparent'
  };
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.primary.light + '20'};
  }
`;

const SmartSearchSuggestionIcon = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'recent': return theme.colors.text.secondary;
      case 'popular': return theme.colors.warning.main;
      case 'trending': return theme.colors.success.main;
      case 'category': return theme.colors.primary.main;
      case 'brand': return theme.colors.info.main;
      case 'model': return theme.colors.secondary.main;
      default: return theme.colors.text.secondary;
    }
  }};
  flex-shrink: 0;
`;

const SmartSearchSuggestionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SmartSearchSuggestionText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
`;

const SmartSearchSuggestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SmartSearchSuggestionCategory = styled.span`
  background: ${({ theme }) => theme.colors.grey[200]};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SmartSearchSuggestionCount = styled.span`
  background: ${({ theme }) => theme.colors.primary.light + '20'};
  color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const SmartSearchSuggestionsEmpty = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SmartSearchSuggestions: React.FC<SmartSearchSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  onClearRecent,
  maxSuggestions = 20,
  showCategories = true,
  showCounts = true,
  className,
  style,
  onSearch,
}) => {
  const { t } = useTranslation();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    if (!groups[suggestion.type]) groups[suggestion.type] = [];
    groups[suggestion.type].push(suggestion);
    return groups;
  }, {} as Record<string, SearchSuggestion[]>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock size={16} />;
      case 'popular':
        return <Star size={16} />;
      case 'trending':
        return <TrendingUp size={16} />;
      case 'category':
        return <Filter size={16} />;
      case 'brand':
        return <Search size={16} />;
      case 'model':
        return <Search size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recent':
        return t('smartSearch.types.recent', 'Recent Searches');
      case 'popular':
        return t('smartSearch.types.popular', 'Popular Searches');
      case 'trending':
        return t('smartSearch.types.trending', 'Trending Searches');
      case 'category':
        return t('smartSearch.types.category', 'Categories');
      case 'brand':
        return t('smartSearch.types.brand', 'Brands');
      case 'model':
        return t('smartSearch.types.model', 'Models');
      default:
        return type;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionClick(suggestion);
    onSearch?.(suggestion.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalSuggestions = suggestions.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleItemMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  if (suggestions.length === 0) {
    return (
      <SmartSearchSuggestionsContainer className={className} style={style}>
        <SmartSearchSuggestionsEmpty>
          {t('smartSearch.empty', 'No suggestions available')}
        </SmartSearchSuggestionsEmpty>
      </SmartSearchSuggestionsContainer>
    );
  }

  return (
    <SmartSearchSuggestionsContainer 
      className={className} 
      style={style}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <SmartSearchSuggestionsHeader>
        <SmartSearchSuggestionsTitle>
          {t('smartSearch.title', 'Search Suggestions')}
        </SmartSearchSuggestionsTitle>
      </SmartSearchSuggestionsHeader>

      {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
        <SmartSearchSuggestionsSection key={type}>
          <SmartSearchSuggestionsSectionHeader>
            <SmartSearchSuggestionsSectionTitle>
              {getTypeLabel(type)}
            </SmartSearchSuggestionsSectionTitle>
            {type === 'recent' && onClearRecent && (
              <SmartSearchSuggestionsClearButton onClick={onClearRecent}>
                {t('smartSearch.clearRecent', 'Clear')}
              </SmartSearchSuggestionsClearButton>
            )}
          </SmartSearchSuggestionsSectionHeader>
          
          <SmartSearchSuggestionsList>
            {typeSuggestions.slice(0, maxSuggestions).map((suggestion, index) => {
              const globalIndex = suggestions.findIndex(s => s.id === suggestion.id);
              return (
                <SmartSearchSuggestionItem
                  key={suggestion.id}
                  ref={(el: HTMLButtonElement | null) => { itemRefs.current[globalIndex] = el; }}
                  isHighlighted={globalIndex === highlightedIndex}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => handleItemMouseEnter(globalIndex)}
                >
                  <SmartSearchSuggestionIcon type={suggestion.type}>
                    {suggestion.icon || getTypeIcon(suggestion.type)}
                  </SmartSearchSuggestionIcon>
                  
                  <SmartSearchSuggestionContent>
                    <SmartSearchSuggestionText>
                      {suggestion.text}
                    </SmartSearchSuggestionText>
                    
                    <SmartSearchSuggestionMeta>
                      {showCategories && suggestion.category && (
                        <SmartSearchSuggestionCategory>
                          {suggestion.category}
                        </SmartSearchSuggestionCategory>
                      )}
                      {showCounts && suggestion.count && (
                        <SmartSearchSuggestionCount>
                          {suggestion.count}
                        </SmartSearchSuggestionCount>
                      )}
                    </SmartSearchSuggestionMeta>
                  </SmartSearchSuggestionContent>
                </SmartSearchSuggestionItem>
              );
            })}
          </SmartSearchSuggestionsList>
        </SmartSearchSuggestionsSection>
      ))}
    </SmartSearchSuggestionsContainer>
  );
};

export default SmartSearchSuggestions;