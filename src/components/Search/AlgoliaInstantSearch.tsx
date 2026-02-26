// AlgoliaInstantSearch.tsx
// Advanced instant search component with filters
// ⚡ World-Class Search Experience with AI & Mobile Optimization

import React, { useState, useEffect } from 'react';
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
  CurrentRefinements,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch-hooks-web';
import { algoliaClient, INDICES } from '../../services/algolia/algolia-client';
import styled, { css } from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Car, MapPin, Fuel, Settings, Calendar, Euro, Gauge, Filter, X, Zap } from 'lucide-react';
import 'instantsearch.css/themes/satellite.css';
import '../../styles/algolia-custom.css';
import AISearchButton from './AISearchButton';
import { AnimatePresence, motion } from 'framer-motion';
import NoSearchResults from '../EmptyStates/NoSearchResults';
import LoadingSpinner from '../../components/LoadingSpinner';
import MobileDeCard from './MobileDeCard';
import { sanitizeHighlight } from '../../utils/sanitize';
import '../../styles/mobile-de-search.css';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

// ... styled components kept for unexpected dependencies, but implementation will use CSS classes ...
const SearchContainer = styled.div`
  /* Legacy styles overridden by mde-grid-container */
`;

const SearchHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;

  h1 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--text-primary) 0%, rgba(var(--text-primary-rgb), 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SearchBoxWrapper = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
  
  .ais-SearchBox {
    max-width: 800px;
    margin: 0 auto;
  }

  .ais-SearchBox-form {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 24px;
    padding: 0.5rem;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
  }

  .ais-SearchBox-form:focus-within {
    border-color: #0B5FFF;
    box-shadow: 0 15px 40px -10px rgba(11, 95, 255, 0.15);
    transform: translateY(-2px);
  }

  .ais-SearchBox-input {
    background: transparent;
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 1.1rem;
    color: var(--text-primary);
    flex: 1;
    outline: none;

    &::placeholder {
      color: var(--text-secondary);
      font-weight: 400;
    }
  }

  .ais-SearchBox-submit,
  .ais-SearchBox-reset {
    background: transparent;
    border: none;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(0,0,0,0.05);
    }

    svg {
      width: 20px;
      height: 20px;
      fill: var(--text-secondary);
    }
  }
  
  .ais-SearchBox-submit {
     background: #0B5FFF;
     
     &:hover {
        background: #004ad7;
        transform: scale(1.05);
     }
     
     svg {
        fill: white;
     }
  }
`;

const StatsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  padding: 0 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  margin-top: 1rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Mobile Filter Button
const FilterToggleButton = styled.button`
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;

  &:hover {
    border-color: #0B5FFF;
    color: #0B5FFF;
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

// Sidebar with mobile drawer support
const Sidebar = styled.aside<{ isOpen: boolean }>`
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  height: fit-content;
  position: sticky;
  top: 100px;
  transition: all 0.3s ease;
  z-index: 50;

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    height: 100vh;
    overflow-y: auto;
    border-radius: 0;
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    box-shadow: 5px 0 30px rgba(0,0,0,0.1);
  }
`;

const SidebarOverlay = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const SidebarHeader = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);

  h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;

  h4 {
    color: var(--text-primary);
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 18px;
      height: 18px;
      color: #0B5FFF;
    }
  }

  .ais-RefinementList-list {
    list-style: none;
    padding: 0;
  }

  .ais-RefinementList-item {
    padding: 0.3rem 0;
  }

  .ais-RefinementList-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:hover {
      color: #0B5FFF;
    }
  }

  .ais-RefinementList-checkbox {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-primary);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &:checked {
      background: #0B5FFF;
      border-color: #0B5FFF;
      
      &::after {
        content: '✓';
        position: absolute;
        color: white;
        font-size: 12px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  .ais-RefinementList-count {
    margin-left: auto;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .ais-RangeInput-form {
      display: flex;
      align-items: center;
      gap: 8px;
  }

  .ais-RangeInput-input {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.6rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    width: 80px;
    text-align: center;

    &:focus {
      outline: none;
      border-color: #0B5FFF;
      box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.1);
    }
  }
  
  .ais-RangeInput-submit {
      background: #0B5FFF;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 0.8rem;
      
      &:hover {
          background: #004ad7;
      }
  }
`;

const MainContent = styled.main`
  min-height: 600px;
  width: 100%;

  .ais-Hits-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

const HitCard = styled(motion.div)`
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -5px rgba(0,0,0,0.15);
    border-color: #0B5FFF;
  }
`;

const HitImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: var(--bg-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${HitCard}:hover & img {
    transform: scale(1.05);
  }
`;

const HitBadge = styled.div<{ type?: 'new' | 'vip' }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.type === 'new' ? '#00C48C' : '#0B5FFF'};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 2;
`;

const HitContent = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const HitTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  mark {
    background: rgba(11, 95, 255, 0.1);
    color: #0B5FFF;
    font-weight: 700;
    padding: 0 2px;
    border-radius: 2px;
  }
`;

const HitPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0B5FFF;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HitSpecs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
`;

const SpecBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  border: 1px solid var(--border-primary);

  svg {
    width: 14px;
    height: 14px;
    color: #0B5FFF;
  }
`;

const SortByWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  .ais-SortBy-select {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 10px;
    padding: 0.5rem 2rem 0.5rem 1rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 16px;

    &:focus {
      outline: none;
      border-color: #0B5FFF;
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
    &--selected .ais-Pagination-link {
      background: #0B5FFF;
      color: white;
      border-color: #0B5FFF;
    }

    &--disabled .ais-Pagination-link {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .ais-Pagination-link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 0.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 10px;
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;

    &:hover:not(.ais-Pagination-item--disabled .ais-Pagination-link) {
      border-color: #0B5FFF;
      color: #0B5FFF;
      transform: translateY(-2px);
    }
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
      navigate('/cars');
    }
  };

  return (
    <HitCard
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <HitImage>
        <img
          src={hit.images?.[0] || '/images/placeholder.png'}
          alt={`${hit.make} ${hit.model}`}
          loading="lazy"
        />
        {hit.condition === 'new' && (
          <HitBadge type="new">{isBg ? 'Ново' : 'New'}</HitBadge>
        )}
        {(hit.price > 50000) && (
          <HitBadge type="vip" style={{ right: hit.condition === 'new' ? '70px' : '12px' }}>VIP</HitBadge>
        )}
      </HitImage>

      <HitContent>
        <HitTitle dangerouslySetInnerHTML={{
          __html: sanitizeHighlight(`${hit._highlightResult?.make?.value || hit.make} ${hit._highlightResult?.model?.value || hit.model}`)
        }} />

        <HitPrice>€{hit.price?.toLocaleString()} <small style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>EUR</small></HitPrice>

        <HitSpecs>
          <SpecBadge title={isBg ? 'Година' : 'Year'}>
            <Calendar />
            {hit.year}
          </SpecBadge>
          <SpecBadge title={isBg ? 'Гориво' : 'Fuel'}>
            <Fuel />
            {hit.fuelType || hit.fuel}
          </SpecBadge>
          <SpecBadge title={isBg ? 'Скоростна кутия' : 'Transmission'}>
            <Settings />
            {hit.transmission}
          </SpecBadge>
          <SpecBadge title={isBg ? 'Пробег' : 'Mileage'}>
            <Gauge />
            {hit.mileage?.toLocaleString()} km
          </SpecBadge>
          {hit.location?.city && (
            <SpecBadge title={isBg ? 'Локация' : 'Location'}>
              <MapPin />
              {hit.locationData?.cityName || hit.location.city}
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

// ============================================================================
// SEARCH CONTENT SUB-COMPONENT
// ============================================================================

const SearchContent: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { results, status } = useInstantSearch();
  const { query, refine: refineQuery } = useSearchBox();

  const isBg = language === 'bg';

  const sortItems = [
    { label: isBg ? 'Най-нови' : 'Newest', value: INDICES.CARS },
    { label: isBg ? 'Цена: ниска към висока' : 'Price: Low to High', value: INDICES.CARS_PRICE_ASC },
    { label: isBg ? 'Цена: висока към ниска' : 'Price: High to Low', value: INDICES.CARS_PRICE_DESC },
    { label: isBg ? 'Година: най-нови' : 'Year: Newest', value: INDICES.CARS_YEAR_DESC },
    { label: isBg ? 'Пробег: най-малък' : 'Mileage: Lowest', value: INDICES.CARS_MILEAGE_ASC }
  ];

  // Close sidebar when route changes
  useEffect(() => {
    setIsFilterOpen(false);
  }, [searchParams]);

  // Handle No Results Logic
  const hasResults = results && results.nbHits > 0;
  // const isStalled = status === 'stalled'; // Can be used for loading indicators



  const handleClearFilters = () => {
    navigate(window.location.pathname);
  };

  const isLoading = status === 'loading' && !results;

  return (
    <SearchContainer>
      <SearchHeader>
        <h1>{isBg ? 'Търсене на автомобили' : 'Find Your Dream Car'}</h1>
        <p>
          {isBg
            ? 'Използвайте нашият интелигентен AI търсач за да намерите перфектната кола.'
            : 'Use our intelligent AI-powered search to find the perfect vehicle.'}
        </p>
      </SearchHeader>

      <SearchBoxWrapper>
        <SearchBox
          placeholder={isBg ? 'Търсете марка, модел, година (напр. BMW X5 2020)...' : 'Search make, model, year (e.g. BMW X5 2020)...'}
          autoFocus
        />

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <AISearchButton
            query={query}
            onSearch={(filters) => {
              const params = new URLSearchParams(window.location.search);
              if (filters.make) params.set('refinementList[make][0]', filters.make);
              if (filters.model) params.set('refinementList[model][0]', filters.model);
              if (filters.minPrice || filters.maxPrice) {
                const min = filters.minPrice || '';
                const max = filters.maxPrice || '';
                if (min || max) params.set('range[price]', `${min}:${max}`);
              }
              if (filters.fuelType) params.set('refinementList[fuel][0]', filters.fuelType);
              if (filters.transmission) params.set('refinementList[transmission][0]', filters.transmission);
              navigate(`${window.location.pathname}?${params.toString()}`);
            }}
            variant="secondary"
          />
        </div>
      </SearchBoxWrapper>

      <div className="mde-search-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="mde-result-count">
            <Stats translations={{
              rootElementText: ({ nbHits }) =>
                `${nbHits.toLocaleString()} ${isBg ? 'обяви' : 'Vehicles'}`
            }} />
          </span>
          {/* Save Search Button Placeholder */}
        </div>

        <div className="mde-sort-dropdown">
          <SortBy items={sortItems} />
        </div>
      </div>

      <div className="mde-grid-container">
        {/* Mobile Overlay */}
        <SidebarOverlay isOpen={isFilterOpen} onClick={() => setIsFilterOpen(false)} />

        <div className={`mde-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <SidebarHeader>
            <h3>{isBg ? 'Филтри' : 'Filters'}</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <X size={24} color="var(--text-primary)" />
            </button>
          </SidebarHeader>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <ClearRefinements
              translations={{
                resetButtonText: isBg ? 'Изчисти всички' : 'Clear all'
              }}
            />
          </div>

          <FilterSection>
            <h4>{isBg ? 'Марка' : 'Make'}</h4>
            <RefinementList
              attribute="make"
              limit={10}
              searchable
              searchablePlaceholder={isBg ? 'Търси марка...' : 'Search make...'}
              showMore
            />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Модел' : 'Model'}</h4>
            <RefinementList
              attribute="model"
              limit={10}
              searchable
              searchablePlaceholder={isBg ? 'Търси модел...' : 'Search model...'}
              showMore
            />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Година' : 'First Registration'}</h4>
            <RangeInput attribute="year" />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Цена (€)' : 'Price (€)'}</h4>
            <RangeInput attribute="price" />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Пробег' : 'Mileage'}</h4>
            <RangeInput attribute="mileage" />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Гориво' : 'Fuel'}</h4>
            <RefinementList attribute="fuelType" />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Скоростна кутия' : 'Transmission'}</h4>
            <RefinementList attribute="transmission" />
          </FilterSection>

          <FilterSection>
            <h4>{isBg ? 'Град' : 'City'}</h4>
            <RefinementList
              attribute="location.city"
              limit={10}
              searchable
              searchablePlaceholder={isBg ? 'Търси град...' : 'Search city...'}
              showMore
            />
          </FilterSection>
        </div>

        <div className="mde-main-content">
          <Configure
            // @ts-ignore
            hitsPerPage={20}
            attributesToSnippet={['make:10', 'model:10']}
            snippetEllipsisText="..."
          />

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', width: '100%' }}>
              <LoadingSpinner />
            </div>
          ) : hasResults ? (
            <>
              <CurrentRefinements
                transformItems={(items) => items.map(item => ({
                  ...item,
                  label: isBg && item.label === 'make' ? 'Марка' : item.label,
                }))}
              />

              <Hits hitComponent={MobileDeCard} />

              <PaginationWrapper>
                <Pagination
                  padding={1}
                  showFirst={false}
                  showLast={false}
                />
              </PaginationWrapper>
            </>
          ) : (
            <NoSearchResults
              query={query}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>
    </SearchContainer>
  );
};

// ============================================================================
// MAIN WRAPPER
// ============================================================================

const AlgoliaInstantSearch: React.FC = () => {
  return (
    <InstantSearch
      searchClient={algoliaClient}
      indexName={INDICES.CARS}
      routing={true}
    >
      <SearchContent />
    </InstantSearch>
  );
};

export default AlgoliaInstantSearch;
