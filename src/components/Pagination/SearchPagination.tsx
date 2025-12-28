// src/components/Pagination/SearchPagination.tsx
// ⚡ Reusable Pagination Component for Search Results
// مكون Pagination قابل لإعادة الاستخدام لجميع صفحات البحث

import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationState } from '../../services/search/pagination.service';

interface SearchPaginationProps {
  paginationState: PaginationState;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
  language?: 'bg' | 'en';
  itemName?: { singular: string; plural: string };
}

const SearchPagination: React.FC<SearchPaginationProps> = ({
  paginationState,
  onNextPage,
  onPreviousPage,
  onGoToPage,
  language = 'en',
  itemName = { singular: 'car', plural: 'cars' }
}) => {
  const stats = {
    showingFrom: paginationState.offset + 1,
    showingTo: Math.min(paginationState.offset + paginationState.limit, paginationState.totalItems),
    showingTotal: paginationState.totalItems
  };

  const getItemName = () => {
    const count = stats.showingTotal;
    if (language === 'bg') {
      return count === 1 ? itemName.singular : itemName.plural;
    }
    return count === 1 ? itemName.singular : itemName.plural;
  };

  // Generate page numbers to display (max 7 pages: [1] ... [3] [4] [5] ... [10])
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const current = paginationState.currentPage;
    const total = paginationState.totalPages;
    
    if (total <= 7) {
      // Show all pages if 7 or less
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    // Always show first and last page
    const pages: (number | 'ellipsis')[] = [1];
    
    if (current <= 3) {
      // Near start: [1] [2] [3] [4] ... [10]
      pages.push(2, 3, 4, 'ellipsis', total);
    } else if (current >= total - 2) {
      // Near end: [1] ... [7] [8] [9] [10]
      pages.push('ellipsis', total - 3, total - 2, total - 1, total);
    } else {
      // Middle: [1] ... [4] [5] [6] ... [10]
      pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis', total);
    }
    
    return pages;
  };

  const handleFirstPage = () => {
    if (paginationState.currentPage !== 1) {
      onGoToPage(1);
    }
  };

  const handleLastPage = () => {
    if (paginationState.currentPage !== paginationState.totalPages) {
      onGoToPage(paginationState.totalPages);
    }
  };

  return (
    <PaginationContainer>
      {/* Results Info */}
      <ResultsInfo>
        {language === 'bg' ? 'Показани' : 'Showing'}{' '}
        <span>{stats.showingFrom}</span>-<span>{stats.showingTo}</span>{' '}
        {language === 'bg' ? 'от' : 'of'}{' '}
        <span>{stats.showingTotal}</span> {getItemName()}
      </ResultsInfo>

      {/* Pagination Buttons */}
      <PaginationButtons>
        {/* First Page */}
        <NavButton
          onClick={handleFirstPage}
          disabled={!paginationState.hasPreviousPage}
          aria-label={language === 'bg' ? 'Първа страница' : 'First page'}
        >
          <ChevronsLeft />
        </NavButton>

        {/* Previous Page */}
        <NavButton
          onClick={onPreviousPage}
          disabled={!paginationState.hasPreviousPage}
          aria-label={language === 'bg' ? 'Предишна страница' : 'Previous page'}
        >
          <ChevronLeft />
          <span className="button-text">
            {language === 'bg' ? 'Предишна' : 'Previous'}
          </span>
        </NavButton>

        {/* Page Numbers */}
        <PageNumbers>
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>;
            }
            
            return (
              <PageNumberButton
                key={page}
                onClick={() => onGoToPage(page)}
                active={page === paginationState.currentPage}
                aria-label={`${language === 'bg' ? 'Страница' : 'Page'} ${page}`}
                aria-current={page === paginationState.currentPage ? 'page' : undefined}
              >
                {page}
              </PageNumberButton>
            );
          })}
        </PageNumbers>

        {/* Next Page */}
        <NavButton
          onClick={onNextPage}
          disabled={!paginationState.hasNextPage}
          aria-label={language === 'bg' ? 'Следваща страница' : 'Next page'}
        >
          <span className="button-text">
            {language === 'bg' ? 'Следваща' : 'Next'}
          </span>
          <ChevronRight />
        </NavButton>

        {/* Last Page */}
        <NavButton
          onClick={handleLastPage}
          disabled={!paginationState.hasNextPage}
          aria-label={language === 'bg' ? 'Последна страница' : 'Last page'}
        >
          <ChevronsRight />
        </NavButton>
      </PaginationButtons>
    </PaginationContainer>
  );
};

export default SearchPagination;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

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
  backdrop-filter: blur(10px);
  
  @media (max-width: 968px) {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
`;

const ResultsInfo = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
  
  @media (max-width: 968px) {
    text-align: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 968px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.colors.grey[300]};
  background: ${props => props.disabled 
    ? 'rgba(100, 100, 100, 0.1)' 
    : ({ theme }) => theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.15)' : '#0B5FFF'};
  color: ${props => props.disabled 
    ? 'rgba(150, 150, 150, 0.5)' 
    : '#fff'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.25)' : '#0A4FDB'};
    box-shadow: 0 8px 20px rgba(11, 95, 255, 0.25);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  .button-text {
    @media (max-width: 640px) {
      display: none;
    }
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  
  @media (max-width: 640px) {
    gap: 2px;
  }
`;

const PageNumberButton = styled.button<{ active?: boolean }>`
  min-width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 8px;
  font-weight: ${props => props.active ? 700 : 600};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.active 
    ? '#0B5FFF' 
    : ({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.active 
    ? '#0B5FFF' 
    : ({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.active 
    ? '#fff' 
    : ({ theme }) => theme.colors.text.primary};
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.active ? '#0A4FDB' : 'rgba(11, 95, 255, 0.15)'};
    border-color: #0B5FFF;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 640px) {
    min-width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
`;

const Ellipsis = styled.span`
  padding: 8px 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  user-select: none;
`;
