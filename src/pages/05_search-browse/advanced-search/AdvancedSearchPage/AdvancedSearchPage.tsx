import { logger } from '@/services/logger-service';
import React, { useState, useEffect } from 'react';
import { useAdvancedSearch } from './hooks/useAdvancedSearch';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useAuth } from '@/contexts/AuthProvider';
import { useSearchParams } from 'react-router-dom';
import { SearchData } from './types';
import { searchService } from '@/services/search/UnifiedSearchService';
import { withAiTrace, AI_TRACE_NAMES } from '@/services/performance/ai-performance-traces';
import CarCardCompact from '@/components/CarCard/CarCardCompact';
import { CarListing } from '@/types/CarListing';
import { smartSearchService } from '@/services/search/smart-search.service';
import styled from 'styled-components';
import { Search, Sparkles, X } from 'lucide-react';
import {
  SearchContainer,
  Container,
  HeaderSection,
  SearchForm,
  SectionCard,
  SectionHeader,
  SectionContent,
  SectionBody,
  FormGrid,
  FormGroup,
  SearchInput,
  ResultsSummary
} from './styles';
import { SaveSearchModal } from './components/SaveSearchModal';
import { SearchActions } from './components/SearchActions';
import { BasicDataSection } from './components/BasicDataSection';
import { TechnicalDataSection } from './components/TechnicalDataSection';
import { ExteriorSection } from './components/ExteriorSection';
import { InteriorSection } from './components/InteriorSection';
import { OfferDetailsSection } from './components/OfferDetailsSection';
import { LocationSection } from './components/LocationSection';

// ============================================================================
// QUICK SEARCH STYLED COMPONENTS
// ============================================================================

const QuickSearchCard = styled.div`
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const QuickSearchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: white;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-size: 0.95rem;
  }
`;

const QuickSearchInputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuickSearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  font-size: 1.05rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: white;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const QuickSearchButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #8b5cf6;
  background: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    font-size: 0.875rem;
    padding: 0.75rem 1.5rem;
  }
`;

const ToggleAdvancedButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// ============================================================================

const AdvancedSearchPage: React.FC = () => {
  const { user } = useAuth();
  const {
    searchData,
    isSearching,
    sectionsOpen,
    toggleSection,
    handleCheckboxToggle,
    handleInputChange,
    handleSearch: originalHandleSearch,
    handleReset: originalHandleReset,
    carMakes,
    fuelTypes,
    exteriorColors,
    interiorColors,
    interiorMaterials,
    countries,
    bulgarianCities,
    radiusOptions,
    t
  } = useAdvancedSearch();

  const { saveSearch, getSearchSummary } = useSavedSearches();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'smart' for smart search

  // ⚡ Quick/Smart Search State
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [isQuickSearching, setIsQuickSearching] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(mode === 'smart');

  // ⚡ NEW: Search results state
  const [searchResults, setSearchResults] = useState<CarListing[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);
  const [lastSource, setLastSource] = useState<string>('');
  const [lastMs, setLastMs] = useState<number | undefined>(undefined);
  const showSearchDebug = import.meta.env.VITE_SHOW_SEARCH_DEBUG === 'true';

  const convertToSavedSearchFilters = (data: SearchData): any => {
    return {
      make: data.make || undefined,
      model: data.model || undefined,
      priceMin: data.priceFrom ? parseInt(data.priceFrom) : undefined,
      priceMax: data.priceTo ? parseInt(data.priceTo) : undefined,
      yearMin: data.firstRegistrationFrom ? parseInt(data.firstRegistrationFrom) : undefined,
      yearMax: data.firstRegistrationTo ? parseInt(data.firstRegistrationTo) : undefined,
      mileageMax: data.mileageTo ? parseInt(data.mileageTo) : undefined,
      fuelType: data.fuelType || undefined,
      transmission: data.transmission || undefined,
      engineMin: data.cubicCapacityFrom ? parseInt(data.cubicCapacityFrom) : undefined,
      engineMax: data.cubicCapacityTo ? parseInt(data.cubicCapacityTo) : undefined,
      powerMin: data.powerFrom ? parseInt(data.powerFrom) : undefined,
      powerMax: data.powerTo ? parseInt(data.powerTo) : undefined,
      location: data.city || undefined,
      radius: data.radius ? parseInt(data.radius) : undefined,
      condition: data.condition || undefined,
      vehicleType: data.vehicleType || undefined,
    };
  };

  const [showSaveModal, setShowSaveModal] = useState(false);

  // ⚡ NEW: Enhanced search handler with caching + AI Performance Trace
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSearching(true);
    setCurrentPage(1);

    try {
      const result = await withAiTrace(
        'ai_search_advanced',
        async () => await searchService.advancedSearchPaged(searchData, 1, 20),
        (res) => ({ total_results: res.total, cache_hit: res.source === 'cache' ? 1 : 0 })
      );
      setSearchResults(result.cars as CarListing[]);
      setTotalResults(result.total);
      setTotalPages(Math.max(1, Math.ceil(result.total / 20)));
      setLastSource(result.source || '');
      setLastMs(result.processingMs);
      logger.info(`✅ Advanced search: ${result.total} results via ${result.source}`);

    } catch (error) {
      logger.error('Advanced search failed:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setSearching(false);
    }
  };

  // ⚡ NEW: Handle pagination
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setSearching(true);

    try {
      const result = await searchService.advancedSearchPaged(searchData, page, 20);
      setSearchResults(result.cars as CarListing[]);
      setLastSource(result.source || '');
      setLastMs(result.processingMs);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      logger.error('Pagination failed:', error);
    } finally {
      setSearching(false);
    }
  };

  // ⚡ NEW: Reset handler
  const handleReset = () => {
    originalHandleReset();
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setTotalPages(0);
  };

  const handleSaveSearch = async (name: string) => {
    const filters: Record<string, unknown> = convertToSavedSearchFilters(searchData);

    const success = await saveSearch({
      name: name.trim(),
      filters,
      resultsCount: 0,
      notifyOnNewResults: false
    });

    if (success) {
      setShowSaveModal(false);
    }
  };

  // ⚡ Quick Search Handler
  const handleQuickSearch = async () => {
    if (!quickSearchQuery.trim()) return;

    setIsQuickSearching(true);
    setSearching(true);

    try {
      // ⚡ Smart Search now searches across ALL vehicle collections (cars, suvs, trucks, etc.)
      const result = await smartSearchService.search(quickSearchQuery, user?.uid, 1, 20);

      if (result.cars.length === 0) {
        logger.warn('Smart search returned 0 results for query:', quickSearchQuery);
      }

      setSearchResults(result.cars as CarListing[]);
      setTotalResults(result.totalCount);
      setTotalPages(Math.max(1, Math.ceil(result.totalCount / 20)));
      setLastSource('smart-search');
      setLastMs(result.processingTime);
      logger.info(`✨ Smart search: ${result.totalCount} results`);

    } catch (error) {
      logger.error('Smart search failed:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsQuickSearching(false);
      setSearching(false);
    }
  };

  // Auto-open smart search mode if URL param is present
  useEffect(() => {
    if (mode === 'smart') {
      setShowQuickSearch(true);
    }
  }, [mode]);

  return (
    <SearchContainer>
      <Container>
        {/* Header */}
        <HeaderSection>
          <h1>{t('advancedSearch.title')}</h1>
          <p>{t('advancedSearch.subtitle')}</p>
        </HeaderSection>

        {/* ⚡ Quick/Smart Search Section */}
        {showQuickSearch && (
          <QuickSearchCard>
            <QuickSearchHeader>
              <div>
                <h3>
                  <Sparkles size={24} />
                  {t('advancedSearch.quickSearch', 'Quick Smart Search')}
                </h3>
                <p>{t('advancedSearch.quickSearchDesc', 'Search using natural language - try "BMW 2020 diesel Sofia" or "Mercedes under 15000"')}</p>
              </div>
            </QuickSearchHeader>

            <QuickSearchInputWrapper>
              <QuickSearchInput
                type="text"
                placeholder={t('advancedSearch.quickSearchPlaceholder', 'e.g., BMW X5 2020 diesel automatic Sofia...')}
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuickSearch();
                  }
                }}
              />
              {quickSearchQuery && (
                <QuickSearchButton
                  type="button"
                  onClick={() => setQuickSearchQuery('')}
                  style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', padding: '1rem' }}
                >
                  <X size={20} />
                </QuickSearchButton>
              )}
              <QuickSearchButton
                type="button"
                onClick={handleQuickSearch}
                disabled={!quickSearchQuery.trim() || isQuickSearching}
              >
                <Search size={20} />
                {isQuickSearching ? t('common.searching', 'Searching...') : t('common.search', 'Search')}
              </QuickSearchButton>
            </QuickSearchInputWrapper>

            <ToggleAdvancedButton onClick={() => setShowQuickSearch(false)}>
              {t('advancedSearch.useAdvancedFilters', '↓ Use Advanced Filters Instead')}
            </ToggleAdvancedButton>
          </QuickSearchCard>
        )}

        {/* Button to show Quick Search if hidden */}
        {!showQuickSearch && (
          <QuickSearchCard style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => setShowQuickSearch(true)}>
            <QuickSearchHeader style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                <Sparkles size={20} />
                <span style={{ fontSize: '1rem' }}>{t('advancedSearch.tryQuickSearch', '↑ Try Quick Smart Search Instead')}</span>
              </div>
            </QuickSearchHeader>
          </QuickSearchCard>
        )}

        {/* Search Form */}
        <SearchForm onSubmit={handleSearch}>
          {/* Basic Data Section */}
          <BasicDataSection
            searchData={searchData}
            isOpen={sectionsOpen.basicData}
            onToggle={() => toggleSection('basicData')}
            onChange={handleInputChange}
            carMakes={carMakes}
          />

          {/* Technical Data Section */}
          <TechnicalDataSection
            searchData={searchData}
            isOpen={sectionsOpen.technicalData}
            onToggle={() => toggleSection('technicalData')}
            onChange={handleInputChange}
            fuelTypes={fuelTypes}
          />

          {/* Exterior Section */}
          <ExteriorSection
            searchData={searchData}
            isOpen={sectionsOpen.exterior}
            onToggle={() => toggleSection('exterior')}
            onChange={handleInputChange}
            onCheckboxToggle={handleCheckboxToggle}
            exteriorColors={exteriorColors}
          />

          {/* Interior Section */}
          <InteriorSection
            searchData={searchData}
            isOpen={sectionsOpen.interior}
            onToggle={() => toggleSection('interior')}
            onChange={handleInputChange}
            onCheckboxToggle={handleCheckboxToggle}
            interiorColors={interiorColors}
            interiorMaterials={interiorMaterials}
          />

          {/* Offer Details Section */}
          <OfferDetailsSection
            searchData={searchData}
            isOpen={sectionsOpen.offerDetails}
            onToggle={() => toggleSection('offerDetails')}
            onChange={handleInputChange}
          />

          {/* Location Section */}
          <LocationSection
            searchData={searchData}
            isOpen={sectionsOpen.location}
            onToggle={() => toggleSection('location')}
            onChange={handleInputChange}
            countries={countries}
            bulgarianCities={bulgarianCities}
            radiusOptions={radiusOptions}
          />

          {/* Search Description Section */}
          <SectionCard>
            <SectionHeader
              $isOpen={sectionsOpen.searchDescription}
              onClick={() => toggleSection('searchDescription')}
            >
              <span>{t('advancedSearch.searchInDescription')}</span>
              <span>{sectionsOpen.searchDescription ? '▲' : '▼'}</span>
            </SectionHeader>
            <SectionContent $isOpen={sectionsOpen.searchDescription}>
              <SectionBody>
                <FormGrid>
                  <FormGroup style={{ gridColumn: '1 / -1' }}>
                    <label>{t('advancedSearch.descriptionPlaceholder')}</label>
                    <SearchInput
                      type="text"
                      name="searchDescription"
                      value={searchData.searchDescription || ''}
                      onChange={handleInputChange}
                      placeholder={t('advancedSearch.enterKeywords')}
                    />
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Action Buttons */}
          <SearchActions
            onReset={handleReset}
            onSaveClick={() => setShowSaveModal(true)}
            onSearch={handleSearch}
            isSearching={searching}
          />
        </SearchForm>

        {/* ⚡ NEW: Search Results */}
        {totalResults > 0 && (
          <ResultsSummary style={{ marginBottom: '2rem' }}>
            <h4>
              {totalResults} {totalResults === 1 ? 'car found' : 'cars found'}
            </h4>
            <p>Page {currentPage} of {totalPages}</p>
            {showSearchDebug && (
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                DEBUG: source={lastSource || 'n/a'}{lastMs !== undefined ? ` • ${lastMs}ms` : ''}
              </p>
            )}
          </ResultsSummary>
        )}

        {/* Results Grid */}
        {searchResults.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {searchResults.map((car: any) => (
              <CarCardCompact key={car.id} car={car} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '2rem'
          }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: '0.5rem 1rem',
                  border: page === currentPage ? '2px solid #005ca9' : '1px solid #e9ecef',
                  background: page === currentPage ? '#005ca9' : 'white',
                  color: page === currentPage ? 'white' : '#495057',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: page === currentPage ? 600 : 400
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Empty Results */}
        {!searching && searchResults.length === 0 && totalResults === 0 && (
          <ResultsSummary>
            <h4>{t('advancedSearch.searchResults')}</h4>
            <p>{t('advancedSearch.applyFiltersAbove')}</p>
          </ResultsSummary>
        )}
      </Container>

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSearch}
        searchSummary={getSearchSummary(convertToSavedSearchFilters(searchData))}
      />
    </SearchContainer>
  );
};

export default AdvancedSearchPage;
