import React, { useState } from 'react';
import { useAdvancedSearch } from './hooks/useAdvancedSearch';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { SearchData } from './types';
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

const AdvancedSearchPage: React.FC = () => {
  const {
    searchData,
    isSearching,
    sectionsOpen,
    toggleSection,
    handleCheckboxToggle,
    handleInputChange,
    handleSearch,
    handleReset,
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
              isOpen={sectionsOpen.searchDescription}
              onClick={() => toggleSection('searchDescription')}
            >
              <span>{t('advancedSearch.searchInDescription')}</span>
              <span>{sectionsOpen.searchDescription ? '▲' : '▼'}</span>
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.searchDescription}>
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
            isSearching={isSearching}
          />
        </SearchForm>

        {/* Results Summary Placeholder */}
        <ResultsSummary>
          <h4>{t('advancedSearch.searchResults')}</h4>
          <p>{t('advancedSearch.applyFiltersAbove')}</p>
        </ResultsSummary>
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
