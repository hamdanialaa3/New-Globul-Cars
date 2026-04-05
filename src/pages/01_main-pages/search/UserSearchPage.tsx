/**
 * UserSearchPage
 * Full-page user search with filters sidebar and results grid
 * Route: /search/users
 * Supports dark/light mode via CSS variables
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, X, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserSearch } from '@/hooks/useUserSearch';
import { UserSearchResultCard } from '@/components/search/UserSearchResultCard';
import type { UserSearchFilters, UserSearchSort } from '@/types/user-search.types';

const UserSearchPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const {
    results, loading, query, filters, sort, totalHits, page, totalPages,
    setQuery, setFilters, setSort, loadMore,
  } = useUserSearch();

  const t = (bg: string, en: string) => language === 'bg' ? bg : en;

  // Sync URL query param on mount OR load all users
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) {
      setQuery(q);
    } else if (!query) {
      // Load all users by default (empty query → Algolia custom ranking)
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key: keyof UserSearchFilters, value: any) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <Users size={28} />
          <PageTitle>{t('Търсене на потребители', 'Search Users')}</PageTitle>
        </HeaderContent>
        {totalHits > 0 && (
          <ResultCount>
            {totalHits} {t('резултата', 'results')}
          </ResultCount>
        )}
      </PageHeader>

      <SearchRow>
        <SearchInputWrapper>
          <Search size={18} />
          <SearchInput
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('Име, град, бизнес...', 'Name, city, business...')}
          />
        </SearchInputWrapper>
        <SortSelect value={sort} onChange={e => setSort(e.target.value as UserSearchSort)}>
          <option value="relevance">{t('Релевантност', 'Relevance')}</option>
          <option value="rating_desc">{t('Най-висок рейтинг', 'Highest Rating')}</option>
          <option value="listings_desc">{t('Най-много обяви', 'Most Listings')}</option>
          <option value="recent_activity">{t('Скоро активни', 'Recently Active')}</option>
        </SortSelect>
      </SearchRow>

      <Layout>
        {/* Filters Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <Filter size={16} />
            <span>{t('Филтри', 'Filters')}</span>
            {activeFilterCount > 0 && (
              <ClearFiltersBtn onClick={clearFilters} type="button">
                <X size={14} />
                {t('Изчисти', 'Clear')}
              </ClearFiltersBtn>
            )}
          </SidebarHeader>

          <FilterGroup>
            <FilterLabel>{t('Тип акаунт', 'Account Type')}</FilterLabel>
            <FilterSelect
              value={filters.accountType || ''}
              onChange={e => handleFilterChange('accountType', e.target.value)}
            >
              <option value="">{t('Всички', 'All')}</option>
              <option value="private">{t('Частно лице', 'Private')}</option>
              <option value="dealer">{t('Дилър', 'Dealer')}</option>
              <option value="company">{t('Компания', 'Company')}</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('Верифициран', 'Verified')}</FilterLabel>
            <FilterSelect
              value={filters.isVerified === undefined ? '' : String(filters.isVerified)}
              onChange={e => handleFilterChange('isVerified', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">{t('Всички', 'All')}</option>
              <option value="true">{t('Да', 'Yes')}</option>
              <option value="false">{t('Не', 'No')}</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('Мин. рейтинг', 'Min. Rating')}</FilterLabel>
            <FilterSelect
              value={filters.minRating || ''}
              onChange={e => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t('Всички', 'Any')}</option>
              <option value="4">4+ ★</option>
              <option value="3">3+ ★</option>
              <option value="2">2+ ★</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('Мин. обяви', 'Min. Listings')}</FilterLabel>
            <FilterSelect
              value={filters.minListings || ''}
              onChange={e => handleFilterChange('minListings', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t('Всички', 'Any')}</option>
              <option value="1">1+</option>
              <option value="5">5+</option>
              <option value="10">10+</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>{t('Град', 'City')}</FilterLabel>
            <FilterInput
              value={filters.city || ''}
              onChange={e => handleFilterChange('city', e.target.value)}
              placeholder={t('Въведете град', 'Enter city')}
            />
          </FilterGroup>
        </Sidebar>

        {/* Results Grid */}
        <ResultsArea>
          {loading && results.length === 0 && (
            <LoadingState>{t('Зареждане...', 'Loading...')}</LoadingState>
          )}

          {!loading && results.length === 0 && (
            <EmptyState>
              {t('Няма намерени потребители', 'No users found')}
            </EmptyState>
          )}

          <ResultsGrid>
            {results.map(user => (
              <UserSearchResultCard key={user.objectID} user={user} />
            ))}
          </ResultsGrid>

          {page < totalPages && (
            <LoadMoreBtn onClick={loadMore} disabled={loading} type="button">
              {loading ? t('Зареждане...', 'Loading...') : t('Зареди още', 'Load more')}
            </LoadMoreBtn>
          )}
        </ResultsArea>
      </Layout>
    </PageContainer>
  );
};

export default UserSearchPage;

// ============================================================================
// STYLED COMPONENTS — Dark/Light mode via CSS variables
// ============================================================================

const PageContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px;
  min-height: 60vh;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const ResultCount = styled.span`
  font-size: 0.9rem;
  color: var(--text-muted);
`;

const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 28px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-card);
  transition: border-color 0.2s;

  &:focus-within { border-color: var(--accent-primary); }

  svg { color: var(--text-muted); flex-shrink: 0; }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 14px 0;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-primary);
  background: transparent;

  &::placeholder { color: var(--text-muted); }
`;

const SortSelect = styled.select`
  padding: 14px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-card);
  font-size: 0.9rem;
  color: var(--text-secondary);
  outline: none;
  cursor: pointer;
  min-width: 180px;

  &:focus { border-color: var(--accent-primary); }

  option {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  height: fit-content;
  position: sticky;
  top: 100px;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--text-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-primary);
`;

const ClearFiltersBtn = styled.button`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #EF4444;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-tertiary);
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
  background: var(--bg-secondary);

  &:focus { border-color: var(--accent-primary); }

  option {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
  background: var(--bg-secondary);

  &:focus { border-color: var(--accent-primary); }
  &::placeholder { color: var(--text-muted); }
`;

const ResultsArea = styled.div`
  min-height: 200px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const LoadingState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1rem;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1rem;
`;

const LoadMoreBtn = styled.button`
  display: block;
  margin: 24px auto 0;
  padding: 12px 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) { background: var(--bg-hover); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
