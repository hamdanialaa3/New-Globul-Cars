/**
 * 🔴 CRITICAL: No Search Results Empty State Component
 * مكون الحالة الفارغة لنتائج البحث
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses PascalCase for component name (CONSTITUTION Section 2.2)
 * - Proper error handling and logging (CONSTITUTION Section 4.4)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface NoSearchResultsProps {
  query?: string;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 400px;
`;

const IconWrapper = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 143, 16, 0.1) 0%, rgba(255, 143, 16, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    color: #FF8F10;
    opacity: 0.7;
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #6B7280;
  margin: 0 0 24px 0;
  line-height: 1.6;
  max-width: 400px;
`;

const QueryText = styled.span`
  font-weight: 600;
  color: #FF8F10;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
    }
  ` : `
    background: white;
    color: #6B7280;
    border: 2px solid #E5E7EB;
    
    &:hover {
      background: #F9FAFB;
      border-color: #D1D5DB;
    }
  `}
`;

const NoSearchResults: React.FC<NoSearchResultsProps> = ({
  query,
  onClearFilters,
  onRefresh,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isBg = language === 'bg';

  return (
    <Container>
      <IconWrapper>
        <Search size={48} />
      </IconWrapper>
      
      <Title>
        {isBg
          ? query
            ? `Няма резултати за "${query}"`
            : 'Няма намерени резултати'
          : query
            ? `No results for "${query}"`
            : 'No results found'}
      </Title>
      
      <Description>
        {isBg
          ? query
            ? `Съжаляваме, но не намерихме резултати за вашето търсене. Опитайте с други ключови думи или изчистете филтрите.`
            : 'Съжаляваме, но не намерихме резултати за вашите критерии. Опитайте да промените филтрите или да търсите отново.'
          : query
            ? `Sorry, we couldn't find any results for your search. Try different keywords or clear the filters.`
            : `Sorry, we couldn't find any results matching your criteria. Try adjusting the filters or search again.`}
      </Description>

      <ButtonGroup>
        {onClearFilters && (
          <Button onClick={onClearFilters}>
            <Filter size={18} />
            {isBg ? 'Изчисти филтри' : 'Clear Filters'}
          </Button>
        )}
        {onRefresh && (
          <Button onClick={onRefresh}>
            <RefreshCw size={18} />
            {isBg ? 'Опресни' : 'Refresh'}
          </Button>
        )}
        <Button $primary onClick={() => navigate('/cars')}>
          <Search size={18} />
          {isBg ? 'Разгледай всички коли' : 'Browse All Cars'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default NoSearchResults;
