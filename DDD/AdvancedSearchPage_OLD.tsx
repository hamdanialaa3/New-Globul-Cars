// src/pages/AdvancedSearchPage/AdvancedSearchPage.tsx
// Main component for Advanced Search Page
// Refactored from monolithic 1699-line file to modular structure

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
  SectionTitle,
  ExpandIcon,
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
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.basicData}
              onClick={() => toggleSection('basicData')}
            >
              <SectionTitle>{t('advancedSearch.basicData')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.basicData} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.basicData}>
              <SectionBody>
                <FormGrid>
                  <FormGroup>
                    <label>{t('advancedSearch.make')}</label>
                    <SearchSelect name="make" value={searchData.make} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {carMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.model')}</label>
                    <SearchInput
                      type="text"
                      name="model"
                      value={searchData.model}
                      onChange={handleInputChange}
                      placeholder={t('advancedSearch.modelPlaceholder')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.vehicleType')}</label>
                    <SearchSelect name="vehicleType" value={searchData.vehicleType} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="cabriolet">{t('advancedSearch.cabriolet')}</option>
                      <option value="estate">{t('advancedSearch.estate')}</option>
                      <option value="offroad">{t('advancedSearch.offroad')}</option>
                      <option value="saloon">{t('advancedSearch.saloon')}</option>
                      <option value="small">{t('advancedSearch.small')}</option>
                      <option value="sports">{t('advancedSearch.sports')}</option>
                      <option value="van">{t('advancedSearch.van')}</option>
                      <option value="other">{t('advancedSearch.other')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.numberOfSeats')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="seatsFrom"
                        value={searchData.seatsFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span></span>
                      <SearchInput
                        type="number"
                        name="seatsTo"
                        value={searchData.seatsTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.to')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.numberOfDoors')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="doorsFrom"
                        value={searchData.doorsFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span></span>
                      <SearchInput
                        type="number"
                        name="doorsTo"
                        value={searchData.doorsTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.toPlaceholder')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.slidingDoor')}</label>
                    <SearchSelect name="slidingDoor" value={searchData.slidingDoor} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="yes">{t('advancedSearch.yes')}</option>
                      <option value="no">{t('advancedSearch.no')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.typeAndCondition')}</label>
                    <SearchSelect name="condition" value={searchData.condition} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="new">{t('advancedSearch.newCondition')}</option>
                      <option value="used">{t('advancedSearch.usedCondition')}</option>
                      <option value="pre-registration">{t('advancedSearch.preRegistrationCondition')}</option>
                      <option value="employee">{t('advancedSearch.employeeCondition')}</option>
                      <option value="classic">{t('advancedSearch.classicCondition')}</option>
                      <option value="demonstration">{t('advancedSearch.demonstrationCondition')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.paymentType')}</label>
                    <SearchSelect name="paymentType" value={searchData.paymentType} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.allOptions')}</option>
                      <option value="buy">{t('advancedSearch.purchaseOption')}</option>
                      <option value="leasing">{t('advancedSearch.leasingOption')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.price')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="priceFrom"
                        value={searchData.priceFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.fromPlaceholder')}
                      />
                      <span>€</span>
                      <SearchInput
                        type="number"
                        name="priceTo"
                        value={searchData.priceTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.toPlaceholder')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.firstRegistration')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="firstRegistrationFrom"
                        value={searchData.firstRegistrationFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.fromPlaceholder')}
                        min="1950"
                        max="2025"
                      />
                      <span></span>
                      <SearchInput
                        type="number"
                        name="firstRegistrationTo"
                        value={searchData.firstRegistrationTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.toPlaceholder')}
                        min="1950"
                        max="2025"
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.mileage')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="mileageFrom"
                        value={searchData.mileageFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.fromPlaceholder')}
                      />
                      <span>km</span>
                      <SearchInput
                        type="number"
                        name="mileageTo"
                        value={searchData.mileageTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.toPlaceholder')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.huValidUntil')}</label>
                    <SearchInput
                      type="number"
                      name="huValid"
                      value={searchData.huValid}
                      onChange={handleInputChange}
                      placeholder={t('advancedSearch.exampleYear')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.numberOfOwners')}</label>
                    <SearchSelect name="ownersCount" value={searchData.ownersCount} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.allOptions')}</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.fullServiceHistory')}</label>
                    <SearchSelect name="serviceHistory" value={searchData.serviceHistory} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.allOptions')}</option>
                      <option value="yes">{t('advancedSearch.yesOption')}</option>
                      <option value="no">{t('advancedSearch.noOption')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.roadworthy')}</label>
                    <SearchSelect name="roadworthy" value={searchData.roadworthy} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.allOptions')}</option>
                      <option value="yes">{t('advancedSearch.yesOption')}</option>
                      <option value="no">{t('advancedSearch.noOption')}</option>
                    </SearchSelect>
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Technical Data Section */}
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.technicalData}
              onClick={() => toggleSection('technicalData')}
            >
              <SectionTitle>{t('advancedSearch.technicalData')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.technicalData} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.technicalData}>
              <SectionBody>
                <FormGrid>
                  <FormGroup>
                    <label>{t('advancedSearch.fuelType')}</label>
                    <SearchSelect name="fuelType" value={searchData.fuelType} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {fuelTypes.map(fuel => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.power')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="powerFrom"
                        value={searchData.powerFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span>kW</span>
                      <SearchInput
                        type="number"
                        name="powerTo"
                        value={searchData.powerTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.to')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.cubicCapacity')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="cubicCapacityFrom"
                        value={searchData.cubicCapacityFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span>cm³</span>
                      <SearchInput
                        type="number"
                        name="cubicCapacityTo"
                        value={searchData.cubicCapacityTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.to')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.fuelTankVolume')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="fuelTankVolumeFrom"
                        value={searchData.fuelTankVolumeFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span>l</span>
                      <SearchInput
                        type="number"
                        name="fuelTankVolumeTo"
                        value={searchData.fuelTankVolumeTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.to')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.weight')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="weightFrom"
                        value={searchData.weightFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span>kg</span>
                      <SearchInput
                        type="number"
                        name="weightTo"
                        value={searchData.weightTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.to')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.cylinders')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="cylindersFrom"
                        value={searchData.cylindersFrom}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.from')}
                      />
                      <span></span>
                      <SearchInput
                        type="number"
                        name="cylindersTo"
                        value={searchData.cylindersTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.to')}
                      />
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.driveType')}</label>
                    <SearchSelect name="driveType" value={searchData.driveType} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="front">{t('advancedSearch.frontWheelDrive')}</option>
                      <option value="rear">{t('advancedSearch.rearWheelDrive')}</option>
                      <option value="all">{t('advancedSearch.allWheelDrive')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.transmission')}</label>
                    <SearchSelect name="transmission" value={searchData.transmission} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="manual">{t('advancedSearch.manualTransmission')}</option>
                      <option value="automatic">{t('advancedSearch.automaticTransmission')}</option>
                      <option value="semi-automatic">{t('advancedSearch.semiAutomaticTransmission')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.fuelConsumption')}</label>
                    <RangeGroup>
                      <SearchInput
                        type="number"
                        name="fuelConsumptionUpTo"
                        value={searchData.fuelConsumptionUpTo}
                        onChange={handleInputChange}
                        placeholder={t('advancedSearch.upTo')}
                      />
                      <span>l/100km</span>
                    </RangeGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.emissionSticker')}</label>
                    <SearchSelect name="emissionSticker" value={searchData.emissionSticker} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="green">{t('advancedSearch.greenSticker')}</option>
                      <option value="yellow">{t('advancedSearch.yellowSticker')}</option>
                      <option value="red">{t('advancedSearch.redSticker')}</option>
                      <option value="none">{t('advancedSearch.noSticker')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.emissionClass')}</label>
                    <SearchSelect name="emissionClass" value={searchData.emissionClass} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="euro1">Euro 1</option>
                      <option value="euro2">Euro 2</option>
                      <option value="euro3">Euro 3</option>
                      <option value="euro4">Euro 4</option>
                      <option value="euro5">Euro 5</option>
                      <option value="euro6">Euro 6</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.particulateFilter')}</label>
                    <SearchSelect name="particulateFilter" value={searchData.particulateFilter} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="yes">{t('advancedSearch.yes')}</option>
                      <option value="no">{t('advancedSearch.no')}</option>
                    </SearchSelect>
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Exterior Section */}
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.exterior}
              onClick={() => toggleSection('exterior')}
            >
              <SectionTitle>{t('advancedSearch.exterior')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.exterior} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.exterior}>
              <SectionBody>
                <FormGrid>
                  <FormGroup>
                    <label>{t('advancedSearch.exteriorColor')}</label>
                    <SearchSelect name="exteriorColor" value={searchData.exteriorColor} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {exteriorColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.trailerCoupling')}</label>
                    <SearchSelect name="trailerCoupling" value={searchData.trailerCoupling} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="yes">{t('advancedSearch.yes')}</option>
                      <option value="no">{t('advancedSearch.no')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.trailerLoadBraked')}</label>
                    <SearchInput
                      type="number"
                      name="trailerLoadBraked"
                      value={searchData.trailerLoadBraked}
                      onChange={handleInputChange}
                      placeholder={t('advancedSearch.kg')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.trailerLoadUnbraked')}</label>
                    <SearchInput
                      type="number"
                      name="trailerLoadUnbraked"
                      value={searchData.trailerLoadUnbraked}
                      onChange={handleInputChange}
                      placeholder={t('advancedSearch.kg')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.noseWeight')}</label>
                    <SearchInput
                      type="number"
                      name="noseWeight"
                      value={searchData.noseWeight}
                      onChange={handleInputChange}
                      placeholder={t('advancedSearch.kg')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.parkingSensors')}</label>
                    <CheckboxGroup>
                      {[
                        t('advancedSearch.frontParkingSensors'),
                        t('advancedSearch.rearParkingSensors'),
                        t('advancedSearch.frontAndRearParkingSensors'),
                        t('advancedSearch.cameraParkingSensors'),
                        t('advancedSearch.selfParkingSensors'),
                        t('advancedSearch.parkAssistParkingSensors')
                      ].map(sensor => (
                        <CheckboxLabel key={sensor}>
                          <input
                            type="checkbox"
                            checked={searchData.parkingSensors.includes(sensor)}
                            onChange={() => handleCheckboxToggle('parkingSensors', sensor)}
                          />
                          <CustomCheckbox checked={searchData.parkingSensors.includes(sensor)} />
                          {sensor}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.cruiseControl')}</label>
                    <SearchSelect name="cruiseControl" value={searchData.cruiseControl} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="yes">{t('advancedSearch.yes')}</option>
                      <option value="no">{t('advancedSearch.no')}</option>
                    </SearchSelect>
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Interior Section */}
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.interior}
              onClick={() => toggleSection('interior')}
            >
              <SectionTitle>{t('advancedSearch.interior')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.interior} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.interior}>
              <SectionBody>
                <FormGrid>
                  <FormGroup>
                    <label>{t('advancedSearch.interiorColor')}</label>
                    <SearchSelect name="interiorColor" value={searchData.interiorColor} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {interiorColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.interiorMaterial')}</label>
                    <SearchSelect name="interiorMaterial" value={searchData.interiorMaterial} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {interiorMaterials.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.airbags')}</label>
                    <SearchSelect name="airbags" value={searchData.airbags} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="2">{t('advancedSearch.airbags2')}</option>
                      <option value="4">{t('advancedSearch.airbags4')}</option>
                      <option value="6">{t('advancedSearch.airbags6')}</option>
                      <option value="8+">{t('advancedSearch.airbags8Plus')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.airConditioning')}</label>
                    <SearchSelect name="airConditioning" value={searchData.airConditioning} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="manual">{t('advancedSearch.manualAirConditioning')}</option>
                      <option value="automatic">{t('advancedSearch.automaticAirConditioning')}</option>
                      <option value="no">{t('advancedSearch.noAirConditioning')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.extras')}</label>
                    <CheckboxGroup>
                      {[
                        t('advancedSearch.absExtras'),
                        t('advancedSearch.edcExtras'),
                        t('advancedSearch.navigationExtras'),
                        t('advancedSearch.electricWindowsExtras'),
                        t('advancedSearch.electricSeatsExtras'),
                        t('advancedSearch.airConditioningExtras'),
                        t('advancedSearch.cruiseControlExtras'),
                        t('advancedSearch.alloyWheelsExtras'),
                        t('advancedSearch.xenonHeadlightsExtras'),
                        t('advancedSearch.panoramaRoofExtras'),
                        t('advancedSearch.bluetoothExtras'),
                        t('advancedSearch.heatedSeatsExtras')
                      ].map(extra => (
                        <CheckboxLabel key={extra}>
                          <input
                            type="checkbox"
                            checked={searchData.extras.includes(extra)}
                            onChange={() => handleCheckboxToggle('extras', extra)}
                          />
                          <CustomCheckbox checked={searchData.extras.includes(extra)} />
                          {extra}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Offer Details Section */}
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.offerDetails}
              onClick={() => toggleSection('offerDetails')}
            >
              <SectionTitle>{t('advancedSearch.offerDetails')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.offerDetails} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.offerDetails}>
              <SectionBody>
                <FormGrid>
                  <FormGroup>
                    <label>{t('advancedSearch.seller')}</label>
                    <SearchSelect name="seller" value={searchData.seller} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="dealer">{t('advancedSearch.dealer')}</option>
                      <option value="private">{t('advancedSearch.privateSeller')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.dealerRating')}</label>
                    <SearchSelect name="dealerRating" value={searchData.dealerRating} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="excellent">{t('advancedSearch.excellentRating')}</option>
                      <option value="very-good">{t('advancedSearch.veryGoodRating')}</option>
                      <option value="good">{t('advancedSearch.goodRating')}</option>
                      <option value="satisfactory">{t('advancedSearch.satisfactoryRating')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.adOnlineSince')}</label>
                    <SearchSelect name="adOnlineSince" value={searchData.adOnlineSince} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="1">{t('advancedSearch.lastDay')}</option>
                      <option value="3">{t('advancedSearch.last3Days')}</option>
                      <option value="7">{t('advancedSearch.lastWeek')}</option>
                      <option value="30">{t('advancedSearch.lastMonth')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.adsWithPictures')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={searchData.adsWithPictures}
                        onChange={(e) => handleInputChange({ target: { name: 'adsWithPictures', value: e.target.checked } } as any)}
                      />
                      <CustomCheckbox checked={searchData.adsWithPictures} />
                      {t('advancedSearch.onlyWithPictures')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.adsWithVideo')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="adsWithVideo"
                        checked={searchData.adsWithVideo}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.adsWithVideo} />
                      {t('advancedSearch.onlyWithVideo')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.discountOffers')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="discountOffers"
                        checked={searchData.discountOffers}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.discountOffers} />
                      {t('advancedSearch.onlyDiscountOffers')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.nonSmokerVehicle')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="nonSmokerVehicle"
                        checked={searchData.nonSmokerVehicle}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.nonSmokerVehicle} />
                      {t('advancedSearch.onlyNonSmoker')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.taxi')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="taxi"
                        checked={searchData.taxi}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.taxi} />
                      {t('advancedSearch.onlyTaxi')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.vatReclaimable')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="vatReclaimable"
                        checked={searchData.vatReclaimable}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.vatReclaimable} />
                      {t('advancedSearch.onlyVatReclaimable')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.warranty')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="warranty"
                        checked={searchData.warranty}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.warranty} />
                      {t('advancedSearch.onlyWithWarranty')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.damagedVehicles')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="damagedVehicles"
                        checked={searchData.damagedVehicles}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.damagedVehicles} />
                      {t('advancedSearch.includeDamaged')}
                    </CheckboxLabel>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.commercialExport')}</label>
                    <SearchSelect name="commercialExport" value={searchData.commercialExport} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="yes">{t('advancedSearch.yes')}</option>
                      <option value="no">{t('advancedSearch.no')}</option>
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.approvedUsedProgramme')}</label>
                    <SearchSelect name="approvedUsedProgramme" value={searchData.approvedUsedProgramme} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      <option value="yes">{t('advancedSearch.yes')}</option>
                      <option value="no">{t('advancedSearch.no')}</option>
                    </SearchSelect>
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Location Section */}
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.location}
              onClick={() => toggleSection('location')}
            >
              <SectionTitle>{t('advancedSearch.location')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.location} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.location}>
              <SectionBody>
                <FormGrid>
                  <FormGroup>
                    <label>{t('advancedSearch.country')}</label>
                    <SearchSelect name="country" value={searchData.country} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.city')}</label>
                    <SearchSelect name="city" value={searchData.city} onChange={handleInputChange}>
                      <option value="">{t('advancedSearch.all')}</option>
                      {bulgarianCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.radius')}</label>
                    <SearchSelect name="radius" value={searchData.radius} onChange={handleInputChange}>
                      {radiusOptions.map(radius => (
                        <option key={radius} value={radius}>{radius}</option>
                      ))}
                    </SearchSelect>
                  </FormGroup>

                  <FormGroup>
                    <label>{t('advancedSearch.deliveryOffers')}</label>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="deliveryOffers"
                        checked={searchData.deliveryOffers}
                        onChange={handleInputChange}
                      />
                      <CustomCheckbox checked={searchData.deliveryOffers} />
                      {t('advancedSearch.onlyDeliveryOffers')}
                    </CheckboxLabel>
                  </FormGroup>
                </FormGrid>
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Search Description Section */}
          <SectionCard>
            <SectionHeader
              isOpen={sectionsOpen.searchDescription}
              onClick={() => toggleSection('searchDescription')}
            >
              <SectionTitle>{t('advancedSearch.searchInDescription')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.searchDescription} />
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
          <ActionSection>
            <ResetButton type="button" onClick={handleReset}>
              {t('advancedSearch.resetFilters')}
            </ResetButton>
            <SearchButton 
              type="button" 
              onClick={() => setShowSaveModal(true)}
              style={{ 
                background: '#28a745',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <Bookmark size={18} />
              {t('advancedSearch.saveSearch') || 'حفظ البحث'}
            </SearchButton>
            <SearchButton type="submit" disabled={isSearching}>
              {isSearching ? t('advancedSearch.searching') : t('advancedSearch.searchCars')}
            </SearchButton>
          </ActionSection>

          {/* Save Search Modal */}
          {showSaveModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }} onClick={() => setShowSaveModal(false)}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#212529'
                }}>
                  💾 {t('advancedSearch.saveSearch') || 'حفظ البحث'}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  marginBottom: '24px'
                }}>
                  {t('advancedSearch.saveSearchDescription') || 'أعط اسماً لهذا البحث للوصول السريع لاحقاً'}
                </p>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#212529'
                  }}>
                    {t('advancedSearch.searchName') || 'اسم البحث'}
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={t('advancedSearch.searchNamePlaceholder') || 'مثال: BMW 3 Series 2020+ Sofia'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#005ca9'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                    autoFocus
                  />
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#6c757d',
                    marginBottom: '8px'
                  }}>
                    📋 {t('advancedSearch.searchSummary') || 'ملخص البحث'}:
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#212529',
                    fontWeight: '500'
                  }}>
                    {getSearchSummary(convertToSavedSearchFilters(searchData))}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#f8f9fa',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  >
                    {t('common.cancel') || 'إلغاء'}
                  </button>
                  <button
                    onClick={handleSaveSearch}
                    disabled={!searchName.trim()}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: searchName.trim() ? '#28a745' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: searchName.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (searchName.trim()) e.currentTarget.style.background = '#218838';
                    }}
                    onMouseLeave={(e) => {
                      if (searchName.trim()) e.currentTarget.style.background = '#28a745';
                    }}
                  >
                    <Bookmark size={18} />
                    {t('advancedSearch.save') || 'حفظ'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </SearchForm>

        {/* Results Summary Placeholder */}
        <ResultsSummary>
          <h4>{t('advancedSearch.searchResults')}</h4>
          <p>{t('advancedSearch.applyFiltersAbove')}</p>
        </ResultsSummary>
      </Container>
    </SearchContainer>
  );
};

export default AdvancedSearchPage;