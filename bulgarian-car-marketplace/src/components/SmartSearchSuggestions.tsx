import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Suggestion {
  type: 'brand' | 'model' | 'feature' | 'location';
  value: string;
  count: number;
}

interface SmartSearchSuggestionsProps {
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
  carData: any[];
}

export const SmartSearchSuggestions: React.FC<SmartSearchSuggestionsProps> = ({
  query,
  onSuggestionSelect,
  carData
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      // استخراج اقتراحات حقيقية من بيانات السيارات
      const brandSuggestions = carData.filter(car => car.brand.toLowerCase().includes(query.toLowerCase()))
        .map(car => ({ type: 'brand', value: car.brand, count: 1 }));
      const modelSuggestions = carData.filter(car => car.model.toLowerCase().includes(query.toLowerCase()))
        .map(car => ({ type: 'model', value: car.model, count: 1 }));
      const featureSuggestions = carData.flatMap(car =>
        (car.features as string[]).filter((f: string) => f.toLowerCase().includes(query.toLowerCase())).map((f: string) => ({ type: 'feature', value: f, count: 1 }))
      );
      const locationSuggestions = carData.filter(car => car.location && car.location.toLowerCase().includes(query.toLowerCase()))
        .map(car => ({ type: 'location', value: car.location, count: 1 }));
      const allSuggestions = [...brandSuggestions, ...modelSuggestions, ...featureSuggestions, ...locationSuggestions];
      // دمج وتصفية الاقتراحات المتكررة
      const uniqueSuggestions: Suggestion[] = [];
      allSuggestions.forEach(s => {
        const existing = uniqueSuggestions.find(u => u.value === s.value && u.type === s.type);
        if (existing) {
          existing.count += 1;
        } else {
          uniqueSuggestions.push({
            type: s.type as 'brand' | 'model' | 'feature' | 'location',
            value: s.value,
            count: s.count
          });
        }
      });
      setSuggestions(uniqueSuggestions.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query, carData]);

  if (!showSuggestions || suggestions.length === 0) return null;

  return (
    <SuggestionsContainer>
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={index}
          onClick={() => onSuggestionSelect(suggestion.value)}
        >
          <SuggestionText>
            {suggestion.value}
            <SuggestionType>{suggestion.type}</SuggestionType>
          </SuggestionText>
          <SuggestionCount>({suggestion.count})</SuggestionCount>
        </SuggestionItem>
      ))}
    </SuggestionsContainer>
  );
};

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.base};
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};
  &:hover {
    background: ${({ theme }) => theme.colors.grey[50]};
  }
  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionText = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SuggestionType = styled.span`
  background: ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  text-transform: uppercase;
`;

const SuggestionCount = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;
