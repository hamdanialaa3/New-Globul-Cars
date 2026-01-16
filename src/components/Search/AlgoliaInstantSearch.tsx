// AlgoliaInstantSearch.tsx
// Advanced instant search component with filters

import React from 'react';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Stats,
  ClearRefinements,
  RangeInput,
  Configure,
  SortBy,
  CurrentRefinements
} from 'react-instantsearch-hooks-web';
import { algoliaClient, INDICES } from '../../services/algolia/algolia-client';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Car, MapPin, Fuel, Settings, Calendar, Euro, Gauge } from 'lucide-react';
import 'instantsearch.css/themes/satellite.css';
import '../../styles/algolia-custom.css';
import AISearchButton from './AISearchButton';
import { useSearchParams } from 'react-router-dom';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SearchContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const SearchHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
  }
`;

const SearchBoxWrapper = styled.div`
  margin-bottom: 2rem;
  
  .ais-SearchBox {
    max-width: 800px;
    margin: 0 auto;
  }

  .ais-SearchBox-form {
    background: var(--bg-card);
    border: 2px solid var(--border-primary);
    border-radius: 50px;
    padding: 0.5rem;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
  }

  .ais-SearchBox-form:focus-within {
    border-color: #FF8F10;
    box-shadow: 0 0 0 4px rgba(255, 143, 16, 0.1);
  }

  .ais-SearchBox-input {
    background: transparent;
    border: none;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    color: var(--text-primary);
    width: 100%;
    outline: none;

    &::placeholder {
      color: var(--text-secondary);
    }
  }

  .ais-SearchBox-submit,
  .ais-SearchBox-reset {
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(255, 143, 16, 0.4);
    }

    svg {
      color: white;
      width: 20px;
      height: 20px;
    }
  }

  .ais-SearchBox-reset {
    background: var(--bg-hover);
    
    svg {
      color: var(--text-secondary);
    }
  }
`;

const StatsWrapper = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: 968px) {
    position: relative;
    top: 0;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;

  h4 {
    color: var(--text-primary);
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 18px;
      height: 18px;
      color: #FF8F10;
    }
  }

  .ais-RefinementList-list {
    list-style: none;
    padding: 0;
  }

  .ais-RefinementList-item {
    padding: 0.4rem 0;
  }

  .ais-RefinementList-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      color: #FF8F10;
    }
  }

  .ais-RefinementList-checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-primary);
    border-radius: 4px;
    cursor: pointer;

    &:checked {
      background: #FF8F10;
      border-color: #FF8F10;
    }
  }

  .ais-RefinementList-count {
    margin-left: auto;
    background: rgba(255, 143, 16, 0.1);
    color: #FF8F10;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .ais-RangeInput {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .ais-RangeInput-input {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.5rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    width: 100%;

    &:focus {
      outline: none;
      border-color: #FF8F10;
      box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
    }
  }

  .ais-RangeInput-separator {
    color: var(--text-secondary);
  }
`;

const MainContent = styled.main`
  min-height: 600px;

  .ais-Hits-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .ais-Hits-item {
    background: none;
    border: none;
    padding: 0;
  }
`;

const HitCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: #FF8F10;
  }
`;

const HitImage = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const HitBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const HitContent = styled.div`
  padding: 1.25rem;
`;

const HitTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  mark {
    background: rgba(255, 143, 16, 0.2);
    color: #FF8F10;
    font-weight: 800;
  }
`;

const HitPrice = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: #FF8F10;
  margin-bottom: 1rem;
`;

const HitSpecs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SpecBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  background: rgba(255, 143, 16, 0.08);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;

  svg {
    width: 14px;
    height: 14px;
    color: #FF8F10;
  }
`;

const SortByWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  .ais-SortBy {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ais-SortBy-select {
    background: var(--bg-card);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #FF8F10;
      box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
    }

    &:hover {
      border-color: #FF8F10;
    }
  }
`;

const PaginationWrapper = styled.div`
  margin-top: 3rem;
  display: flex;
  justify-content: center;

  .ais-Pagination-list {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
  }

  .ais-Pagination-item {
    background: var(--bg-card);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    transition: all 0.3s ease;

    &--selected {
      background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
      border-color: #FF8F10;
      
      .ais-Pagination-link {
        color: white;
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  .ais-Pagination-link {
    display: block;
    padding: 0.6rem 1rem;
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
  }
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ============================================================================
// COMPONENTS
// ============================================================================

interface HitProps {
  hit: any;
}

const Hit: React.FC<HitProps> = ({ hit }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBg = language === 'bg';

  const handleClick = () => {
    // ✅ CONSTITUTION: Use numeric URL pattern
    const sellerNumericId = hit.sellerNumericId || hit.ownerNumericId;
    const carNumericId = hit.carNumericId || hit.userCarSequenceId || hit.numericId;

    if (sellerNumericId && carNumericId) {
      navigate(`/car/${sellerNumericId}/${carNumericId}`);
    } else {
      // Fallback to search if no numeric IDs
      navigate('/cars');
    }
  };

  return (
    <HitCard onClick={handleClick}>
      <HitImage>
        <img
          src={hit.images?.[0] || '/assets/images/placeholder-car.jpg'}
          alt={`${hit.make} ${hit.model}`}
          loading="lazy"
        />
        {hit.condition === 'new' && (
          <HitBadge>{isBg ? 'Ново' : 'New'}</HitBadge>
        )}
      </HitImage>

      <HitContent>
        <HitTitle dangerouslySetInnerHTML={{
          __html: `${hit._highlightResult?.make?.value || hit.make} ${hit._highlightResult?.model?.value || hit.model}`
        }} />

        <HitPrice>€{hit.price?.toLocaleString()}</HitPrice>

        <HitSpecs>
          <SpecBadge>
            <Calendar />
            {hit.year}
          </SpecBadge>
          <SpecBadge>
            <Fuel />
            {hit.fuel}
          </SpecBadge>
          <SpecBadge>
            <Settings />
            {hit.transmission}
          </SpecBadge>
          <SpecBadge>
            <Gauge />
            {hit.mileage?.toLocaleString()} km
          </SpecBadge>
          {hit.location?.city && (
            <SpecBadge>
              <MapPin />
              {hit.locationData?.cityName}
            </SpecBadge>
          )}
        </HitSpecs>
      </HitContent>
    </HitCard>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AlgoliaInstantSearch: React.FC = () => {
  const { language } = useLanguage();
  const isBg = language === 'bg';

  const sortItems = [
    { label: isBg ? 'Най-нови' : 'Newest', value: INDICES.CARS },
    { label: isBg ? 'Цена: ниска към висока' : 'Price: Low to High', value: INDICES.CARS_PRICE_ASC },
    { label: isBg ? 'Цена: висока към ниска' : 'Price: High to Low', value: INDICES.CARS_PRICE_DESC },
    { label: isBg ? 'Година: най-нови' : 'Year: Newest', value: INDICES.CARS_YEAR_DESC },
    { label: isBg ? 'Пробег: най-малък' : 'Mileage: Lowest', value: INDICES.CARS_MILEAGE_ASC }
  ];

  return (
    <InstantSearch
      searchClient={algoliaClient}
      indexName={INDICES.CARS}
      routing={true}
    >
      <SearchContainer>
        <SearchHeader>
          <h1>{isBg ? '🔍 Търсене на автомобили' : '🔍 Search Cars'}</h1>
          <p>
            {isBg
              ? 'Намерете перфектния автомобил с нашия интелигентен търсач'
              : 'Find your perfect car with our intelligent search'}
          </p>
        </SearchHeader>

        <SearchBoxWrapper>
          <SearchBox
            placeholder={isBg ? 'Търсете марка, модел, година...' : 'Search make, model, year...'}
            autoFocus
          />
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            {/* Integrated Gemini NLQ Button */}
            <AISearchButton
              query={document.querySelector<HTMLInputElement>('.ais-SearchBox-input')?.value || ''}
              onSearch={(filters) => {
                // Construct Algolia-compatible URL params
                const params = new URLSearchParams(window.location.search);

                // Clear existing refinements to avoid conflicts
                // params = new URLSearchParams(); // Uncomment to reset completely

                if (filters.make) {
                  params.set('refinementList[make][0]', filters.make);
                }
                if (filters.model) {
                  params.set('refinementList[model][0]', filters.model);
                }
                if (filters.minPrice || filters.maxPrice) {
                  const min = filters.minPrice || '';
                  const max = filters.maxPrice || '';
                  if (min || max) params.set('range[price]', `${min}:${max}`);
                }
                if (filters.minYear || filters.maxYear) {
                  const min = filters.minYear || '';
                  const max = filters.maxYear || '';
                  if (min || max) params.set('range[year]', `${min}:${max}`);
                }
                if (filters.fuelType) {
                  params.set('refinementList[fuel][0]', filters.fuelType);
                }
                if (filters.transmission) {
                  params.set('refinementList[transmission][0]', filters.transmission);
                }
                if (filters.location) {
                  params.set('refinementList[location.city][0]', filters.location);
                }

                // Force navigation to apply filters
                const newUrl = `${window.location.pathname}?${params.toString()}`;
                // AI Navigation - removed console.log for production
                window.location.href = newUrl; // Force reload to trigger InstantSearch internal routing state
              }}
              variant="secondary"
            />
          </div>
        </SearchBoxWrapper>

        <StatsWrapper>
          <Stats
            translations={{
              rootElementText: ({ nbHits, processingTimeMS }) =>
                isBg
                  ? `${nbHits.toLocaleString()} резултата за ${processingTimeMS}ms`
                  : `${nbHits.toLocaleString()} results in ${processingTimeMS}ms`
            }}
          />
        </StatsWrapper>

        <SearchGrid>
          <Sidebar>
            <FilterSection>
              <h4>
                <Car />
                {isBg ? 'Марка' : 'Make'}
              </h4>
              <RefinementList
                attribute="make"
                limit={10}
                searchable
                searchablePlaceholder={isBg ? 'Търси марка...' : 'Search make...'}
                showMore
                showMoreLimit={30}
              />
            </FilterSection>

            <FilterSection>
              <h4>
                <Car />
                {isBg ? 'Модел' : 'Model'}
              </h4>
              <RefinementList
                attribute="model"
                limit={10}
                searchable
                searchablePlaceholder={isBg ? 'Търси модел...' : 'Search model...'}
                showMore
                showMoreLimit={30}
              />
            </FilterSection>

            <FilterSection>
              <h4>
                <Calendar />
                {isBg ? 'Година' : 'Year'}
              </h4>
              <RangeInput attribute="year" />
            </FilterSection>

            <FilterSection>
              <h4>
                <Euro />
                {isBg ? 'Цена (€)' : 'Price (€)'}
              </h4>
              <RangeInput attribute="price" />
            </FilterSection>

            <FilterSection>
              <h4>
                <Gauge />
                {isBg ? 'Пробег (km)' : 'Mileage (km)'}
              </h4>
              <RangeInput attribute="mileage" />
            </FilterSection>

            <FilterSection>
              <h4>
                <Fuel />
                {isBg ? 'Гориво' : 'Fuel Type'}
              </h4>
              <RefinementList attribute="fuel" />
            </FilterSection>

            <FilterSection>
              <h4>
                <Settings />
                {isBg ? 'Скоростна кутия' : 'Transmission'}
              </h4>
              <RefinementList attribute="transmission" />
            </FilterSection>

            <FilterSection>
              <h4>
                <Car />
                {isBg ? 'Тип купе' : 'Body Type'}
              </h4>
              <RefinementList attribute="bodyType" limit={8} />
            </FilterSection>

            <FilterSection>
              <h4>
                <MapPin />
                {isBg ? 'Град' : 'City'}
              </h4>
              <RefinementList
                attribute="location.city"
                limit={10}
                searchable
                searchablePlaceholder={isBg ? 'Търси град...' : 'Search city...'}
                showMore
                showMoreLimit={28}
              />
            </FilterSection>

            <ClearRefinements
              translations={{
                resetButtonText: isBg ? '🗑️ Изчисти филтри' : '🗑️ Clear Filters'
              }}
            />
          </Sidebar>

          <MainContent>
            <SortByWrapper>
              <CurrentRefinements />
              <SortBy
                items={sortItems}
              />
            </SortByWrapper>


            <Configure
              // @ts-ignore - Configure accepts valid Algolia parameters despite strict typing
              hitsPerPage={20}
              attributesToSnippet={['make:10', 'model:10']}
              snippetEllipsisText="..."
            />

            <Hits hitComponent={Hit} />

            <PaginationWrapper>
              <Pagination
                padding={2}
                showFirst
                showLast
              />
            </PaginationWrapper>
          </MainContent>
        </SearchGrid>
      </SearchContainer>
    </InstantSearch>
  );
};

export default AlgoliaInstantSearch;

