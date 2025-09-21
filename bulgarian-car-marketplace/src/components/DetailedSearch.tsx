// src/components/DetailedSearch.tsx
// مكون البحث التفصيلي المستوحى من mobile.de

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { getAllMakes, getModelsByMake, getGenerationsByModel, getBodyStylesByGeneration } from '../constants/carData_static';

interface DetailedSearchFilters {
  // Basisdaten
  make: string;
  model: string;
  generation: string;
  bodyStyle: string;
  vehicleType: string;
  seats: { from: string; to: string };
  doors: string;
  slidingDoor: string;
  condition: string;
  paymentType: string;
  price: { from: string; to: string };
  firstRegistration: { from: string; to: string };
  mileage: { from: string; to: string };
  huValid: string;
  owner: string;
  serviceHistory: boolean;
  roadworthy: boolean;
  inspection: boolean;
  country: string;
  location: string;
  radius: string;
  delivery: boolean;

  // Technische Daten
  fuelType: string;
  power: { from: string; to: string; unit: 'PS' | 'kW' };
  displacement: { from: string; to: string };
  tankSize: { from: string; to: string };
  weight: { from: string; to: string };
  cylinders: { from: string; to: string };
  driveType: string;
  transmission: string;
  fuelConsumption: string;
  emissionSticker: string;
  emissionClass: string;
  particulateFilter: boolean;

  // Exterieur
  exteriorColor: string;
  metallic: boolean;
  matte: boolean;
  towbar: string;
  towbarAssistant: boolean;
  brakedTrailerLoad: string;
  unbrakedTrailerLoad: string;
  supportLoad: string;
  parkingAssist: string[];
  cruiseControl: string;

  // Innenausstattung
  interiorColor: string;
  interiorMaterial: string;
  airbags: string;
  climateControl: string;
  extras: string[];

  // Angebotsdetails
  sellerType: string;
  sellerRating: string;
  onlineSince: string;
  warranty: boolean;
  withImages: boolean;
  withVideo: boolean;
  vatDeductible: boolean;
  nonSmoker: boolean;
  reducedPrice: boolean;
  taxi: boolean;
  damagedVehicles: string;
  business: string;
  qualitySeal: string;
  searchDescription: string;
}

interface DetailedSearchProps {
  onSearch: (filters: DetailedSearchFilters) => void;
  onSaveSearch?: () => void;
  onClose?: () => void;
  initialFilters?: Partial<DetailedSearchFilters>;
}

const SearchContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SearchHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }
`;

const SearchContent = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  padding-bottom: ${({ theme }) => theme.spacing.xl};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: ${({ theme }) => theme.colors.primary.main};
    margin-right: ${({ theme }) => theme.spacing.md};
    border-radius: 2px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg});
`;

const FormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;

  > * {
    flex: 1;
  }
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  input, select {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    background: ${({ theme }) => theme.colors.background.paper};
    transition: border-color 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
    }
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  input {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl});
  padding-top: ${({ theme }) => theme.spacing.xl});
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const SearchButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const SaveSearchButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary.main};
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DetailedSearch: React.FC<DetailedSearchProps> = ({
  onSearch,
  onSaveSearch,
  onClose,
  initialFilters = {}
}) => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<DetailedSearchFilters>({
    // Basisdaten
    make: '',
    model: '',
    generation: '',
    bodyStyle: '',
    vehicleType: '',
    seats: { from: '', to: '' },
    doors: '',
    slidingDoor: '',
    condition: '',
    paymentType: '',
    price: { from: '', to: '' },
    firstRegistration: { from: '', to: '' },
    mileage: { from: '', to: '' },
    huValid: '',
    owner: '',
    serviceHistory: false,
    roadworthy: false,
    inspection: false,
    country: '',
    location: '',
    radius: '10',
    delivery: false,

    // Technische Daten
    fuelType: '',
    power: { from: '', to: '', unit: 'PS' },
    displacement: { from: '', to: '' },
    tankSize: { from: '', to: '' },
    weight: { from: '', to: '' },
    cylinders: { from: '', to: '' },
    driveType: '',
    transmission: '',
    fuelConsumption: '',
    emissionSticker: '',
    emissionClass: '',
    particulateFilter: false,

    // Exterieur
    exteriorColor: '',
    metallic: false,
    matte: false,
    towbar: '',
    towbarAssistant: false,
    brakedTrailerLoad: '',
    unbrakedTrailerLoad: '',
    supportLoad: '',
    parkingAssist: [],
    cruiseControl: '',

    // Innenausstattung
    interiorColor: '',
    interiorMaterial: '',
    airbags: '',
    climateControl: '',
    extras: [],

    // Angebotsdetails
    sellerType: '',
    sellerRating: '',
    onlineSince: '',
    warranty: false,
    withImages: false,
    withVideo: false,
    vatDeductible: false,
    nonSmoker: false,
    reducedPrice: false,
    taxi: false,
    damagedVehicles: '',
    business: '',
    qualitySeal: '',
    searchDescription: '',
    ...initialFilters
  });

  const [makes] = useState(() => getAllMakes());
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [generations, setGenerations] = useState<{ id: string; name: string; years: string }[]>([]);
  const [bodyStyles, setBodyStyles] = useState<{ id: string; name: string }[]>([]);

  // تحديث الموديلات عند تغيير الشركة
  useEffect(() => {
    if (filters.make) {
      const newModels = getModelsByMake(filters.make);
      setModels(newModels);
      setFilters(prev => ({ ...prev, model: '', generation: '', bodyStyle: '' }));
    } else {
      setModels([]);
    }
  }, [filters.make]);

  // تحديث الأجيال عند تغيير الموديل
  useEffect(() => {
    if (filters.make && filters.model) {
      const newGenerations = getGenerationsByModel(filters.make, filters.model);
      setGenerations(newGenerations);
      setFilters(prev => ({ ...prev, generation: '', bodyStyle: '' }));
    } else {
      setGenerations([]);
    }
  }, [filters.make, filters.model]);

  // تحديث أنواع الهيكل عند تغيير الجيل
  useEffect(() => {
    if (filters.make && filters.model && filters.generation) {
      const newBodyStyles = getBodyStylesByGeneration(filters.make, filters.model, filters.generation);
      setBodyStyles(newBodyStyles);
      setFilters(prev => ({ ...prev, bodyStyle: '' }));
    } else {
      setBodyStyles([]);
    }
  }, [filters.make, filters.model, filters.generation]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedFilterChange = (parentKey: string, childKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey as keyof DetailedSearchFilters] as any,
        [childKey]: value
      }
    }));
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleArrayChange = (key: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
        ? [...(prev[key as keyof DetailedSearchFilters] as string[]), value]
        : (prev[key as keyof DetailedSearchFilters] as string[]).filter(item => item !== value)
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSaveSearch = () => {
    if (onSaveSearch) {
      onSaveSearch();
    }
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <h2>{t('detailedSearch.title')}</h2>
        {onClose && (
          <CloseButton onClick={onClose} title={t('common.close')}>
            ×
          </CloseButton>
        )}
      </SearchHeader>

      <SearchContent>
        {/* Basisdaten */}
        <Section>
          <SectionTitle>{t('detailedSearch.sections.basicData')}</SectionTitle>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.basicData.make')}</label>
              <select
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.anyMake')}</option>
                {makes.map(make => (
                  <option key={make.id} value={make.id}>{make.name}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.model')}</label>
              <select
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                disabled={!filters.make}
              >
                <option value="">{t('detailedSearch.basicData.anyModel')}</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.generation')}</label>
              <select
                value={filters.generation}
                onChange={(e) => handleFilterChange('generation', e.target.value)}
                disabled={!filters.model}
              >
                <option value="">{t('detailedSearch.basicData.anyGeneration')}</option>
                {generations.map(gen => (
                  <option key={gen.id} value={gen.id}>{gen.name} ({gen.years})</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.bodyStyle')}</label>
              <select
                value={filters.bodyStyle}
                onChange={(e) => handleFilterChange('bodyStyle', e.target.value)}
                disabled={!filters.generation}
              >
                <option value="">{t('detailedSearch.basicData.anyBodyStyle')}</option>
                {bodyStyles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.basicData.vehicleType')}</label>
              <select
                value={filters.vehicleType}
                onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.anyVehicleType')}</option>
                <option value="convertible">{t('detailedSearch.basicData.convertible')}</option>
                <option value="suv">{t('detailedSearch.basicData.suv')}</option>
                <option value="hatchback">{t('detailedSearch.basicData.hatchback')}</option>
                <option value="sedan">{t('detailedSearch.basicData.sedan')}</option>
                <option value="coupe">{t('detailedSearch.basicData.coupe')}</option>
                <option value="wagon">{t('detailedSearch.basicData.wagon')}</option>
                <option value="minivan">{t('detailedSearch.basicData.minivan')}</option>
                <option value="pickup">{t('detailedSearch.basicData.pickup')}</option>
                <option value="other">{t('detailedSearch.basicData.other')}</option>
              </select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.basicData.seatsFrom')}</label>
                <select
                  value={filters.seats.from}
                  onChange={(e) => handleNestedFilterChange('seats', 'from', e.target.value)}
                >
                  <option value="">{t('detailedSearch.basicData.any')}</option>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.basicData.seatsTo')}</label>
                <select
                  value={filters.seats.to}
                  onChange={(e) => handleNestedFilterChange('seats', 'to', e.target.value)}
                >
                  <option value="">{t('detailedSearch.basicData.any')}</option>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label>{t('detailedSearch.basicData.doors')}</label>
              <select
                value={filters.doors}
                onChange={(e) => handleFilterChange('doors', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.slidingDoor')}</label>
              <select
                value={filters.slidingDoor}
                onChange={(e) => handleFilterChange('slidingDoor', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="yes">{t('detailedSearch.basicData.yes')}</option>
                <option value="no">{t('detailedSearch.basicData.no')}</option>
              </select>
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.basicData.condition')}</label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="new">{t('detailedSearch.basicData.new')}</option>
                <option value="used">{t('detailedSearch.basicData.used')}</option>
                <option value="dayRegistration">{t('detailedSearch.basicData.dayRegistration')}</option>
                <option value="yearCar">{t('detailedSearch.basicData.yearCar')}</option>
                <option value="classic">{t('detailedSearch.basicData.classic')}</option>
                <option value="demo">{t('detailedSearch.basicData.demo')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.paymentType')}</label>
              <select
                value={filters.paymentType}
                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="buy">{t('detailedSearch.basicData.buy')}</option>
                <option value="lease">{t('detailedSearch.basicData.lease')}</option>
              </select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.basicData.priceFrom')} (€)</label>
                <input
                  type="number"
                  value={filters.price.from}
                  onChange={(e) => handleNestedFilterChange('price', 'from', e.target.value)}
                  placeholder={t('detailedSearch.basicData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.basicData.priceTo')} (€)</label>
                <input
                  type="number"
                  value={filters.price.to}
                  onChange={(e) => handleNestedFilterChange('price', 'to', e.target.value)}
                  placeholder={t('detailedSearch.basicData.any')}
                />
              </FormGroup>
            </FormRow>
          </FormGrid>

          <FormGrid>
            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.basicData.firstRegistrationFrom')}</label>
                <input
                  type="number"
                  min="1900"
                  max="2025"
                  value={filters.firstRegistration.from}
                  onChange={(e) => handleNestedFilterChange('firstRegistration', 'from', e.target.value)}
                  placeholder={t('detailedSearch.basicData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.basicData.firstRegistrationTo')}</label>
                <input
                  type="number"
                  min="1900"
                  max="2025"
                  value={filters.firstRegistration.to}
                  onChange={(e) => handleNestedFilterChange('firstRegistration', 'to', e.target.value)}
                  placeholder={t('detailedSearch.basicData.any')}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.basicData.mileageFrom')} (km)</label>
                <input
                  type="number"
                  value={filters.mileage.from}
                  onChange={(e) => handleNestedFilterChange('mileage', 'from', e.target.value)}
                  placeholder={t('detailedSearch.basicData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.basicData.mileageTo')} (km)</label>
                <input
                  type="number"
                  value={filters.mileage.to}
                  onChange={(e) => handleNestedFilterChange('mileage', 'to', e.target.value)}
                  placeholder={t('detailedSearch.basicData.any')}
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label>{t('detailedSearch.basicData.huValid')}</label>
              <select
                value={filters.huValid}
                onChange={(e) => handleFilterChange('huValid', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="1">1 {t('detailedSearch.basicData.month')}</option>
                <option value="3">3 {t('detailedSearch.basicData.months')}</option>
                <option value="6">6 {t('detailedSearch.basicData.months')}</option>
                <option value="12">12 {t('detailedSearch.basicData.months')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.owner')}</label>
              <select
                value={filters.owner}
                onChange={(e) => handleFilterChange('owner', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </FormGroup>
          </FormGrid>

          <CheckboxGroup>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.serviceHistory}
                onChange={(e) => handleCheckboxChange('serviceHistory', e.target.checked)}
              />
              {t('detailedSearch.basicData.serviceHistory')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.roadworthy}
                onChange={(e) => handleCheckboxChange('roadworthy', e.target.checked)}
              />
              {t('detailedSearch.basicData.roadworthy')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.inspection}
                onChange={(e) => handleCheckboxChange('inspection', e.target.checked)}
              />
              {t('detailedSearch.basicData.inspection')}
            </Checkbox>
          </CheckboxGroup>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.basicData.country')}</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">{t('detailedSearch.basicData.any')}</option>
                <option value="BG">България</option>
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
                <option value="CH">Schweiz</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.location')}</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder={t('detailedSearch.basicData.any')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.basicData.radius')} (km)</label>
              <select
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', e.target.value)}
              >
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="200">200 km</option>
              </select>
            </FormGroup>
          </FormGrid>

          <Checkbox>
            <input
              type="checkbox"
              checked={filters.delivery}
              onChange={(e) => handleCheckboxChange('delivery', e.target.checked)}
            />
            {t('detailedSearch.basicData.delivery')}
          </Checkbox>
        </Section>

        {/* Technische Daten */}
        <Section>
          <SectionTitle>{t('detailedSearch.sections.technicalData')}</SectionTitle>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.technicalData.fuelType')}</label>
              <select
                value={filters.fuelType}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              >
                <option value="">{t('detailedSearch.technicalData.any')}</option>
                <option value="petrol">{t('detailedSearch.technicalData.petrol')}</option>
                <option value="diesel">{t('detailedSearch.technicalData.diesel')}</option>
                <option value="electric">{t('detailedSearch.technicalData.electric')}</option>
                <option value="ethanol">{t('detailedSearch.technicalData.ethanol')}</option>
                <option value="hybrid_diesel">{t('detailedSearch.technicalData.hybrid_diesel')}</option>
                <option value="hybrid_petrol">{t('detailedSearch.technicalData.hybrid_petrol')}</option>
                <option value="hydrogen">{t('detailedSearch.technicalData.hydrogen')}</option>
                <option value="lpg">{t('detailedSearch.technicalData.lpg')}</option>
                <option value="cng">{t('detailedSearch.technicalData.cng')}</option>
                <option value="plugin_hybrid">{t('detailedSearch.technicalData.plugin_hybrid')}</option>
                <option value="other">{t('detailedSearch.technicalData.other')}</option>
              </select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.powerFrom')} ({filters.power.unit})</label>
                <input
                  type="number"
                  value={filters.power.from}
                  onChange={(e) => handleNestedFilterChange('power', 'from', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.powerTo')} ({filters.power.unit})</label>
                <input
                  type="number"
                  value={filters.power.to}
                  onChange={(e) => handleNestedFilterChange('power', 'to', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.powerUnit')}</label>
                <select
                  value={filters.power.unit}
                  onChange={(e) => handleNestedFilterChange('power', 'unit', e.target.value)}
                >
                  <option value="PS">PS</option>
                  <option value="kW">kW</option>
                </select>
              </FormGroup>
            </FormRow>
          </FormGrid>

          <FormGrid>
            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.displacementFrom')} (cm³)</label>
                <input
                  type="number"
                  value={filters.displacement.from}
                  onChange={(e) => handleNestedFilterChange('displacement', 'from', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.displacementTo')} (cm³)</label>
                <input
                  type="number"
                  value={filters.displacement.to}
                  onChange={(e) => handleNestedFilterChange('displacement', 'to', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.tankSizeFrom')} (l)</label>
                <input
                  type="number"
                  value={filters.tankSize.from}
                  onChange={(e) => handleNestedFilterChange('tankSize', 'from', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.tankSizeTo')} (l)</label>
                <input
                  type="number"
                  value={filters.tankSize.to}
                  onChange={(e) => handleNestedFilterChange('tankSize', 'to', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.weightFrom')} (kg)</label>
                <input
                  type="number"
                  value={filters.weight.from}
                  onChange={(e) => handleNestedFilterChange('weight', 'from', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.weightTo')} (kg)</label>
                <input
                  type="number"
                  value={filters.weight.to}
                  onChange={(e) => handleNestedFilterChange('weight', 'to', e.target.value)}
                  placeholder={t('detailedSearch.technicalData.any')}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.cylindersFrom')}</label>
                <select
                  value={filters.cylinders.from}
                  onChange={(e) => handleNestedFilterChange('cylinders', 'from', e.target.value)}
                >
                  <option value="">{t('detailedSearch.technicalData.any')}</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup>
                <label>{t('detailedSearch.technicalData.cylindersTo')}</label>
                <select
                  value={filters.cylinders.to}
                  onChange={(e) => handleNestedFilterChange('cylinders', 'to', e.target.value)}
                >
                  <option value="">{t('detailedSearch.technicalData.any')}</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </FormGroup>
            </FormRow>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.technicalData.driveType')}</label>
              <select
                value={filters.driveType}
                onChange={(e) => handleFilterChange('driveType', e.target.value)}
              >
                <option value="">{t('detailedSearch.technicalData.any')}</option>
                <option value="fwd">{t('detailedSearch.technicalData.fwd')}</option>
                <option value="rwd">{t('detailedSearch.technicalData.rwd')}</option>
                <option value="awd">{t('detailedSearch.technicalData.awd')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.technicalData.transmission')}</label>
              <select
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
              >
                <option value="">{t('detailedSearch.technicalData.any')}</option>
                <option value="manual">{t('detailedSearch.technicalData.manual')}</option>
                <option value="automatic">{t('detailedSearch.technicalData.automatic')}</option>
                <option value="semi_automatic">{t('detailedSearch.technicalData.semi_automatic')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.technicalData.fuelConsumption')} (l/100km)</label>
              <input
                type="number"
                step="0.1"
                value={filters.fuelConsumption}
                onChange={(e) => handleFilterChange('fuelConsumption', e.target.value)}
                placeholder={t('detailedSearch.technicalData.any')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.technicalData.emissionSticker')}</label>
              <select
                value={filters.emissionSticker}
                onChange={(e) => handleFilterChange('emissionSticker', e.target.value)}
              >
                <option value="">{t('detailedSearch.technicalData.any')}</option>
                <option value="1">{t('detailedSearch.technicalData.red')}</option>
                <option value="2">{t('detailedSearch.technicalData.yellow')}</option>
                <option value="3">{t('detailedSearch.technicalData.green')}</option>
                <option value="4">{t('detailedSearch.technicalData.blue')}</option>
              </select>
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.technicalData.emissionClass')}</label>
              <select
                value={filters.emissionClass}
                onChange={(e) => handleFilterChange('emissionClass', e.target.value)}
              >
                <option value="">{t('detailedSearch.technicalData.any')}</option>
                <option value="euro1">Euro 1</option>
                <option value="euro2">Euro 2</option>
                <option value="euro3">Euro 3</option>
                <option value="euro4">Euro 4</option>
                <option value="euro5">Euro 5</option>
                <option value="euro6">Euro 6</option>
              </select>
            </FormGroup>

            <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={filters.particulateFilter}
                  onChange={(e) => handleCheckboxChange('particulateFilter', e.target.checked)}
                />
                {t('detailedSearch.technicalData.particulateFilter')}
              </Checkbox>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Exterieur */}
        <Section>
          <SectionTitle>{t('detailedSearch.sections.exterior')}</SectionTitle>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.exterior.color')}</label>
              <select
                value={filters.exteriorColor}
                onChange={(e) => handleFilterChange('exteriorColor', e.target.value)}
              >
                <option value="">{t('detailedSearch.exterior.any')}</option>
                <option value="black">{t('detailedSearch.exterior.black')}</option>
                <option value="white">{t('detailedSearch.exterior.white')}</option>
                <option value="grey">{t('detailedSearch.exterior.grey')}</option>
                <option value="silver">{t('detailedSearch.exterior.silver')}</option>
                <option value="blue">{t('detailedSearch.exterior.blue')}</option>
                <option value="red">{t('detailedSearch.exterior.red')}</option>
                <option value="green">{t('detailedSearch.exterior.green')}</option>
                <option value="brown">{t('detailedSearch.exterior.brown')}</option>
                <option value="beige">{t('detailedSearch.exterior.beige')}</option>
                <option value="orange">{t('detailedSearch.exterior.orange')}</option>
                <option value="yellow">{t('detailedSearch.exterior.yellow')}</option>
                <option value="purple">{t('detailedSearch.exterior.purple')}</option>
                <option value="gold">{t('detailedSearch.exterior.gold')}</option>
              </select>
            </FormGroup>

            <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={filters.metallic}
                  onChange={(e) => handleCheckboxChange('metallic', e.target.checked)}
                />
                {t('detailedSearch.exterior.metallic')}
              </Checkbox>
            </FormGroup>

            <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={filters.matte}
                  onChange={(e) => handleCheckboxChange('matte', e.target.checked)}
                />
                {t('detailedSearch.exterior.matte')}
              </Checkbox>
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.exterior.towbar')}</label>
              <select
                value={filters.towbar}
                onChange={(e) => handleFilterChange('towbar', e.target.value)}
              >
                <option value="">{t('detailedSearch.exterior.any')}</option>
                <option value="fixed">{t('detailedSearch.exterior.fixed')}</option>
                <option value="removable">{t('detailedSearch.exterior.removable')}</option>
                <option value="swiveling">{t('detailedSearch.exterior.swiveling')}</option>
              </select>
            </FormGroup>

            <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={filters.towbarAssistant}
                  onChange={(e) => handleCheckboxChange('towbarAssistant', e.target.checked)}
                />
                {t('detailedSearch.exterior.towbarAssistant')}
              </Checkbox>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.exterior.brakedTrailerLoad')} (kg)</label>
              <input
                type="number"
                value={filters.brakedTrailerLoad}
                onChange={(e) => handleFilterChange('brakedTrailerLoad', e.target.value)}
                placeholder={t('detailedSearch.exterior.any')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.exterior.unbrakedTrailerLoad')} (kg)</label>
              <input
                type="number"
                value={filters.unbrakedTrailerLoad}
                onChange={(e) => handleFilterChange('unbrakedTrailerLoad', e.target.value)}
                placeholder={t('detailedSearch.exterior.any')}
              />
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.exterior.supportLoad')} (kg)</label>
              <input
                type="number"
                value={filters.supportLoad}
                onChange={(e) => handleFilterChange('supportLoad', e.target.value)}
                placeholder={t('detailedSearch.exterior.any')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.exterior.parkingAssist')}</label>
              <select
                multiple
                value={filters.parkingAssist}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('parkingAssist', options);
                }}
                style={{ height: '120px' }}
              >
                <option value="360_camera">{t('detailedSearch.exterior.360camera')}</option>
                <option value="rear_camera">{t('detailedSearch.exterior.rearCamera')}</option>
                <option value="parking_sensors">{t('detailedSearch.exterior.parkingSensors')}</option>
                <option value="self_steering">{t('detailedSearch.exterior.selfSteering')}</option>
                <option value="front_sensors">{t('detailedSearch.exterior.frontSensors')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.exterior.cruiseControl')}</label>
              <select
                value={filters.cruiseControl}
                onChange={(e) => handleFilterChange('cruiseControl', e.target.value)}
              >
                <option value="">{t('detailedSearch.exterior.any')}</option>
                <option value="cruise_control">{t('detailedSearch.exterior.cruiseControl')}</option>
                <option value="adaptive_cruise">{t('detailedSearch.exterior.adaptiveCruise')}</option>
              </select>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Innenausstattung */}
        <Section>
          <SectionTitle>{t('detailedSearch.sections.interior')}</SectionTitle>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.interior.color')}</label>
              <select
                value={filters.interiorColor}
                onChange={(e) => handleFilterChange('interiorColor', e.target.value)}
              >
                <option value="">{t('detailedSearch.interior.any')}</option>
                <option value="black">{t('detailedSearch.interior.black')}</option>
                <option value="beige">{t('detailedSearch.interior.beige')}</option>
                <option value="grey">{t('detailedSearch.interior.grey')}</option>
                <option value="brown">{t('detailedSearch.interior.brown')}</option>
                <option value="red">{t('detailedSearch.interior.red')}</option>
                <option value="blue">{t('detailedSearch.interior.blue')}</option>
                <option value="other">{t('detailedSearch.interior.other')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.interior.material')}</label>
              <select
                value={filters.interiorMaterial}
                onChange={(e) => handleFilterChange('interiorMaterial', e.target.value)}
              >
                <option value="">{t('detailedSearch.interior.any')}</option>
                <option value="cloth">{t('detailedSearch.interior.cloth')}</option>
                <option value="artificial_leather">{t('detailedSearch.interior.artificialLeather')}</option>
                <option value="leather">{t('detailedSearch.interior.leather')}</option>
                <option value="alcantara">{t('detailedSearch.interior.alcantara')}</option>
                <option value="part_leather">{t('detailedSearch.interior.partLeather')}</option>
                <option value="velours">{t('detailedSearch.interior.velours')}</option>
                <option value="other">{t('detailedSearch.interior.other')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.interior.airbags')}</label>
              <select
                value={filters.airbags}
                onChange={(e) => handleFilterChange('airbags', e.target.value)}
              >
                <option value="">{t('detailedSearch.interior.any')}</option>
                <option value="driver">{t('detailedSearch.interior.driver')}</option>
                <option value="front">{t('detailedSearch.interior.front')}</option>
                <option value="front_side">{t('detailedSearch.interior.frontSide')}</option>
                <option value="front_side_rear">{t('detailedSearch.interior.frontSideRear')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.interior.climateControl')}</label>
              <select
                value={filters.climateControl}
                onChange={(e) => handleFilterChange('climateControl', e.target.value)}
              >
                <option value="">{t('detailedSearch.interior.any')}</option>
                <option value="none">{t('detailedSearch.interior.none')}</option>
                <option value="ac">{t('detailedSearch.interior.ac')}</option>
                <option value="climate">{t('detailedSearch.interior.climate')}</option>
                <option value="dual_zone">{t('detailedSearch.interior.dualZone')}</option>
                <option value="triple_zone">{t('detailedSearch.interior.tripleZone')}</option>
                <option value="quad_zone">{t('detailedSearch.interior.quadZone')}</option>
              </select>
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <label>{t('detailedSearch.interior.extras')}</label>
            <CheckboxGroup>
              {[
                'alarm', 'ambient_lighting', 'android_auto', 'apple_carplay', 'armrest',
                'heated_steering_wheel', 'disabled_accessible', 'bluetooth', 'onboard_computer',
                'cd_player', 'electric_windows', 'electric_mirrors', 'electric_mirrors_foldable',
                'electric_seats', 'electric_seats_memory', 'electric_seats_rear', 'hands_free',
                'folding_rear_seat', 'head_up_display', 'wireless_charging', 'auto_dimming_mirror',
                'isofix', 'isofix_passenger', 'leather_steering_wheel', 'lumbar_support', 'massage_seats',
                'fatigue_detection', 'multifunction_steering_wheel', 'integrated_music_streaming',
                'navigation', 'emergency_call', 'dab_radio', 'smoker_package', 'onboard_computer',
                'radio_tuner', 'tv', 'folding_passenger_seat', 'usb', 'virtual_mirrors',
                'digital_cockpit', 'winter_package', 'wifi_hotspot'
              ].map(extra => (
                <Checkbox key={extra}>
                  <input
                    type="checkbox"
                    checked={filters.extras.includes(extra)}
                    onChange={(e) => handleArrayChange('extras', extra, e.target.checked)}
                  />
                  {t(`detailedSearch.interior.extras.${extra}`)}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </FormGroup>
        </Section>

        {/* Angebotsdetails */}
        <Section>
          <SectionTitle>{t('detailedSearch.sections.offerDetails')}</SectionTitle>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.offerDetails.sellerType')}</label>
              <select
                value={filters.sellerType}
                onChange={(e) => handleFilterChange('sellerType', e.target.value)}
              >
                <option value="">{t('detailedSearch.offerDetails.any')}</option>
                <option value="dealer">{t('detailedSearch.offerDetails.dealer')}</option>
                <option value="private">{t('detailedSearch.offerDetails.private')}</option>
                <option value="company">{t('detailedSearch.offerDetails.company')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.offerDetails.sellerRating')}</label>
              <select
                value={filters.sellerRating}
                onChange={(e) => handleFilterChange('sellerRating', e.target.value)}
              >
                <option value="">{t('detailedSearch.offerDetails.any')}</option>
                <option value="3">3 {t('detailedSearch.offerDetails.stars')}</option>
                <option value="4">4 {t('detailedSearch.offerDetails.stars')}</option>
                <option value="5">5 {t('detailedSearch.offerDetails.stars')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.offerDetails.onlineSince')}</label>
              <select
                value={filters.onlineSince}
                onChange={(e) => handleFilterChange('onlineSince', e.target.value)}
              >
                <option value="">{t('detailedSearch.offerDetails.any')}</option>
                <option value="1">1 {t('detailedSearch.offerDetails.day')}</option>
                <option value="3">3 {t('detailedSearch.offerDetails.days')}</option>
                <option value="7">7 {t('detailedSearch.offerDetails.days')}</option>
                <option value="14">14 {t('detailedSearch.offerDetails.days')}</option>
              </select>
            </FormGroup>
          </FormGrid>

          <CheckboxGroup>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.warranty}
                onChange={(e) => handleCheckboxChange('warranty', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.warranty')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.withImages}
                onChange={(e) => handleCheckboxChange('withImages', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.withImages')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.withVideo}
                onChange={(e) => handleCheckboxChange('withVideo', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.withVideo')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.vatDeductible}
                onChange={(e) => handleCheckboxChange('vatDeductible', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.vatDeductible')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.nonSmoker}
                onChange={(e) => handleCheckboxChange('nonSmoker', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.nonSmoker')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.reducedPrice}
                onChange={(e) => handleCheckboxChange('reducedPrice', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.reducedPrice')}
            </Checkbox>
            <Checkbox>
              <input
                type="checkbox"
                checked={filters.taxi}
                onChange={(e) => handleCheckboxChange('taxi', e.target.checked)}
              />
              {t('detailedSearch.offerDetails.taxi')}
            </Checkbox>
          </CheckboxGroup>

          <FormGrid>
            <FormGroup>
              <label>{t('detailedSearch.offerDetails.damagedVehicles')}</label>
              <select
                value={filters.damagedVehicles}
                onChange={(e) => handleFilterChange('damagedVehicles', e.target.value)}
              >
                <option value="">{t('detailedSearch.offerDetails.any')}</option>
                <option value="exclude">{t('detailedSearch.offerDetails.exclude')}</option>
                <option value="include">{t('detailedSearch.offerDetails.include')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.offerDetails.business')}</label>
              <select
                value={filters.business}
                onChange={(e) => handleFilterChange('business', e.target.value)}
              >
                <option value="">{t('detailedSearch.offerDetails.any')}</option>
                <option value="exclude">{t('detailedSearch.offerDetails.exclude')}</option>
                <option value="include">{t('detailedSearch.offerDetails.include')}</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>{t('detailedSearch.offerDetails.qualitySeal')}</label>
              <select
                value={filters.qualitySeal}
                onChange={(e) => handleFilterChange('qualitySeal', e.target.value)}
              >
                <option value="">{t('detailedSearch.offerDetails.choose')}</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <label>{t('detailedSearch.offerDetails.searchDescription')}</label>
            <input
              type="text"
              value={filters.searchDescription}
              onChange={(e) => handleFilterChange('searchDescription', e.target.value)}
              placeholder={t('detailedSearch.offerDetails.searchPlaceholder')}
            />
          </FormGroup>
        </Section>

        {/* أزرار البحث */}
        <ButtonGroup>
          <SearchButton onClick={handleSearch}>
            {t('detailedSearch.search')}
          </SearchButton>
          <SaveSearchButton onClick={handleSaveSearch}>
            {t('detailedSearch.saveSearch')}
          </SaveSearchButton>
        </ButtonGroup>
      </SearchContent>
    </SearchContainer>
  );
};

export default DetailedSearch;