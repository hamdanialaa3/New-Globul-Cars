import React from 'react';
import { Bookmark } from 'lucide-react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { ActionSection, ResetButton, SearchButton } from '../styles';

interface SearchActionsProps {
  onReset: () => void;
  onSaveClick: () => void;
  onSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
}

export const SearchActions: React.FC<SearchActionsProps> = ({
  onReset,
  onSaveClick,
  onSearch,
  isSearching
}) => {
  const { t } = useTranslation();

  return (
    <ActionSection>
      <ResetButton type="button" onClick={onReset}>
        {t('advancedSearch.resetFilters')}
      </ResetButton>
      <SearchButton 
        type="button" 
        onClick={onSaveClick}
        style={{ 
          background: '#28a745',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center'
        }}
      >
        <Bookmark size={18} />
        {t('advancedSearch.saveSearch')}
      </SearchButton>
      <SearchButton 
        type="submit" 
        disabled={isSearching}
        onClick={(e) => {
          e.preventDefault();
          onSearch(e as React.FormEvent);
        }}
      >
        {isSearching ? t('advancedSearch.searching') : t('advancedSearch.searchCars')}
      </SearchButton>
    </ActionSection>
  );
};

