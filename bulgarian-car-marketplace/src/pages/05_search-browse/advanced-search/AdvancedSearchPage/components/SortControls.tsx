// src/pages/AdvancedSearchPage/components/SortControls.tsx
// Sort controls for search results

import React from 'react';
import styled from 'styled-components';
import { SortOption } from '../types';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  processingTime: number;
  t: (key: string) => string;
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  onSortChange,
  totalResults,
  processingTime,
  t
}) => {
  return (
    <Container>
      <ResultsInfo>
        <ResultsCount>
          {totalResults.toLocaleString('bg-BG')} {t('advancedSearch.results')}
        </ResultsCount>
        <ProcessingTime>
          ({processingTime}ms)
        </ProcessingTime>
      </ResultsInfo>

      <SortWrapper>
        <SortLabel>{t('advancedSearch.sortBy')}:</SortLabel>
        <SortSelect value={sortBy} onChange={(e) => onSortChange(e.target.value as SortOption)}>
          <option value="createdAt_desc">{t('advancedSearch.sortNewestFirst')}</option>
          <option value="price_asc">{t('advancedSearch.sortPriceLowHigh')}</option>
          <option value="price_desc">{t('advancedSearch.sortPriceHighLow')}</option>
          <option value="year_desc">{t('advancedSearch.sortYearNewest')}</option>
          <option value="mileage_asc">{t('advancedSearch.sortMileageLow')}</option>
        </SortSelect>
      </SortWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResultsCount = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`;

const ProcessingTime = styled.span`
  font-size: 13px;
  color: #666;
`;

const SortWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SortLabel = styled.label`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const SortSelect = styled.select`
  padding: 8px 32px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23333" d="M6 9L1 4h10z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 8px center;
  appearance: none;

  &:hover {
    border-color: #FF8F10;
  }

  &:focus {
    outline: none;
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;
