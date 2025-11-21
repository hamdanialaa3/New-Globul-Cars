import React, { useState } from 'react';
import { useAdvancedSearch } from '@globul-cars/coreuseAdvancedSearch';
import { useSavedSearches } from '@globul-cars/coreuseSavedSearches';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { SearchData } from './types';
import { searchService } from '@globul-cars/services/search/UnifiedSearchService';
import { withAiTrace, AI_TRACE_NAMES } from '@globul-cars/services/performance/ai-performance-traces';
import CarCardCompact from '@globul-cars/ui/componentsCarCard/CarCardCompact';
import { CarListing } from '@globul-cars/core/typesCarListing';
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
import { SaveSearchModal } from '@globul-cars/ui/componentsSaveSearchModal';
import { SearchActions } from '@globul-cars/ui/componentsSearchActions';
import { BasicDataSection } from '@globul-cars/ui/componentsBasicDataSection';
import { TechnicalDataSection } from '@globul-cars/ui/componentsTechnicalDataSection';
import { ExteriorSection } from '@globul-cars/ui/componentsExteriorSection';
import { InteriorSection } from '@globul-cars/ui/componentsInteriorSection';
import { OfferDetailsSection } from '@globul-cars/ui/componentsOfferDetailsSection';
import { LocationSection } from '@globul-cars/ui/componentsLocationSection';

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
  
  // ⚡ NEW: Search results state
  const [searchResults, setSearchResults] = useState<CarListing[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);
  const [lastSource, setLastSource] = useState<string>('');
  const [lastMs, setLastMs] = useState<number | undefined>(undefined);
  const showSearchDebug = process.env.REACT_APP_SHOW_SEARCH_DEBUG === 'true';

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
      console.log(`✅ Advanced search: ${result.total} results via ${result.source}`);
      
    } catch (error) {
      console.error('Advanced search failed:', error);
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
      console.error('Pagination failed:', error);
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
    const filters: any = convertToSavedSearchFilters(searchData);

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

  return (
    <SearchContainer>
      <Container>
        {/* Header */}
        <HeaderSection>
          <h1>{t('advancedSearch.title')}</h1>
          <p>{t('advancedSearch.subtitle')}</p>
        </HeaderSection>

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
                      value={searchData.searchDescription}
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
            {searchResults.map(car => (
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
