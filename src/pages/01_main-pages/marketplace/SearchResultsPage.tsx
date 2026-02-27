import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MarketplaceProductService } from '../../../services/marketplace/marketplace-product.service';
import { Product, MarketplaceFilters } from '../../../types/marketplace.types';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Search, Filter, Grid, List, Star } from 'lucide-react';
import { logger } from '@/services/logger-service';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<MarketplaceFilters>({
    searchQuery: searchParams.get('q') || '',
    minPrice: undefined,
    maxPrice: undefined,
    condition: undefined,
    minRating: undefined,
    inStock: true,
    freeShipping: false,
  });

  const productService = MarketplaceProductService.getInstance();

  const texts = {
    bg: {
      searchResults: 'Резултати от търсенето',
      foundProducts: 'Намерени продукти',
      noResults: 'Няма намерени продукти',
      tryDifferent: 'Опитайте с различни ключови думи',
      filters: 'Филтри',
      sortBy: 'Подреди по',
      priceRange: 'Ценова граница',
      condition: 'Състояние',
      rating: 'Оценка',
      availability: 'Наличност',
      inStock: 'В наличност',
      freeShipping: 'Безплатна доставка',
      apply: 'Приложи',
      clear: 'Изчисти',
      viewGrid: 'Мрежа',
      viewList: 'Списък',
      from: 'от',
      to: 'до',
      new: 'Ново',
      used: 'Употребявано',
      refurbished: 'Реновирано',
      all: 'Всички',
      starsAndUp: 'звезди и нагоре',
      bgn: 'лв',
    },
    en: {
      searchResults: 'Search Results',
      foundProducts: 'Products Found',
      noResults: 'No products found',
      tryDifferent: 'Try different keywords',
      filters: 'Filters',
      sortBy: 'Sort By',
      priceRange: 'Price Range',
      condition: 'Condition',
      rating: 'Rating',
      availability: 'Availability',
      inStock: 'In Stock',
      freeShipping: 'Free Shipping',
      apply: 'Apply',
      clear: 'Clear',
      viewGrid: 'Grid',
      viewList: 'List',
      from: 'from',
      to: 'to',
      new: 'New',
      used: 'Used',
      refurbished: 'Refurbished',
      all: 'All',
      starsAndUp: 'stars & up',
      bgn: 'BGN',
    },
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== filters.searchQuery) {
      setFilters((prev) => ({ ...prev, searchQuery: query }));
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const results = await productService.searchProducts(filters);
      setProducts(results);
    } catch (error) {
      logger.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof MarketplaceFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: searchParams.get('q') || '',
      minPrice: undefined,
      maxPrice: undefined,
      condition: undefined,
      minRating: undefined,
      inStock: true,
      freeShipping: false,
    });
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new':
        return t.new;
      case 'used':
        return t.used;
      case 'refurbished':
        return t.refurbished;
      default:
        return condition;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          {t.searchResults}
          {filters.searchQuery && `: "${filters.searchQuery}"`}
        </Title>
        <HeaderActions>
          <ViewToggle>
            <ViewButton $active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              <Grid size={20} />
              {t.viewGrid}
            </ViewButton>
            <ViewButton $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              <List size={20} />
              {t.viewList}
            </ViewButton>
          </ViewToggle>
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
            {t.filters}
          </FilterButton>
        </HeaderActions>
      </Header>

      <ContentWrapper>
        {/* Filters Sidebar */}
        <FiltersSidebar $show={showFilters}>
          <FiltersHeader>
            <h3>{t.filters}</h3>
            <ClearButton onClick={clearFilters}>{t.clear}</ClearButton>
          </FiltersHeader>

          <FilterSection>
            <FilterTitle>{t.priceRange}</FilterTitle>
            <PriceInputs>
              <PriceInput
                type="number"
                placeholder={t.from}
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
              <span>-</span>
              <PriceInput
                type="number"
                placeholder={t.to}
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </PriceInputs>
          </FilterSection>

          <FilterSection>
            <FilterTitle>{t.condition}</FilterTitle>
            <RadioGroup>
              <RadioOption>
                <input
                  type="radio"
                  name="condition"
                  checked={!filters.condition}
                  onChange={() => handleFilterChange('condition', undefined)}
                />
                <label>{t.all}</label>
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === 'new'}
                  onChange={() => handleFilterChange('condition', 'new')}
                />
                <label>{t.new}</label>
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === 'used'}
                  onChange={() => handleFilterChange('condition', 'used')}
                />
                <label>{t.used}</label>
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === 'refurbished'}
                  onChange={() => handleFilterChange('condition', 'refurbished')}
                />
                <label>{t.refurbished}</label>
              </RadioOption>
            </RadioGroup>
          </FilterSection>

          <FilterSection>
            <FilterTitle>{t.rating}</FilterTitle>
            <RadioGroup>
              {[4, 3, 2, 1].map((rating) => (
                <RadioOption key={rating}>
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleFilterChange('minRating', rating)}
                  />
                  <label>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < rating ? '#f39c12' : 'none'}
                        color="#f39c12"
                      />
                    ))}
                    <span style={{ marginLeft: '0.5rem' }}>
                      {rating}+ {t.starsAndUp}
                    </span>
                  </label>
                </RadioOption>
              ))}
            </RadioGroup>
          </FilterSection>

          <FilterSection>
            <FilterTitle>{t.availability}</FilterTitle>
            <CheckboxOption>
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              />
              <label>{t.inStock}</label>
            </CheckboxOption>
            <CheckboxOption>
              <input
                type="checkbox"
                checked={filters.freeShipping || false}
                onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
              />
              <label>{t.freeShipping}</label>
            </CheckboxOption>
          </FilterSection>
        </FiltersSidebar>

        {/* Products Grid/List */}
        <ProductsContainer>
          <ResultsCount>
            {products.length} {t.foundProducts}
          </ResultsCount>

          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          ) : products.length === 0 ? (
            <EmptyState>
              <Search size={64} color="#ccc" />
              <h3>{t.noResults}</h3>
              <p>{t.tryDifferent}</p>
            </EmptyState>
          ) : viewMode === 'grid' ? (
            <ProductsGrid>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                >
                  <ProductImage>
                    <img src={product.images[0] || '/placeholder-product.jpg'} alt={product.title} loading="lazy" width={300} height={300} />
                  </ProductImage>
                  <ProductInfo>
                    <ProductTitle>{product.title}</ProductTitle>
                    <ProductRating>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < Math.round(product.rating?.average || 0) ? '#f39c12' : 'none'}
                          color="#f39c12"
                        />
                      ))}
                      <span>({product.rating?.count || 0})</span>
                    </ProductRating>
                    <ProductPrice>{product.pricing.price.toFixed(2)} {t.bgn}</ProductPrice>
                    {product.shipping.isFreeShipping && (
                      <FreeShippingBadge>{t.freeShipping}</FreeShippingBadge>
                    )}
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          ) : (
            <ProductsList>
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                >
                  <ListImage>
                    <img src={product.images[0] || '/placeholder-product.jpg'} alt={product.title} loading="lazy" width={120} height={120} />
                  </ListImage>
                  <ListInfo>
                    <ListTitle>{product.title}</ListTitle>
                    <ListDesc>{product.shortDescription}</ListDesc>
                    <ListMeta>
                      <ProductRating>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.round(product.rating?.average || 0) ? '#f39c12' : 'none'}
                            color="#f39c12"
                          />
                        ))}
                        <span>({product.rating?.count || 0})</span>
                      </ProductRating>
                      <span>•</span>
                      <span>{getConditionText(product.condition)}</span>
                      {product.shipping.isFreeShipping && (
                        <>
                          <span>•</span>
                          <FreeShippingBadge>{t.freeShipping}</FreeShippingBadge>
                        </>
                      )}
                    </ListMeta>
                  </ListInfo>
                  <ListPrice>{product.pricing.price.toFixed(2)} {t.bgn}</ListPrice>
                </ProductListItem>
              ))}
            </ProductsList>
          )}
        </ProductsContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme?.colors?.background || '#f8f9fa'};
  padding: 2rem 1rem;
`;

const Header = styled.div`
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$active ? props.theme?.colors?.primary?.main || '#007bff' : 'white')};
  color: ${(props) => (props.$active ? 'white' : props.theme?.colors?.text || '#333')};
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$active ? props.theme?.colors?.primary?.dark || '#0056b3' : props.theme?.colors?.hover || '#f0f0f0'};
  }
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FiltersSidebar = styled.aside<{ $show: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 768px) {
    display: ${(props) => (props.$show ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
    overflow-y: auto;
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: ${(props) => props.theme?.colors?.text || '#333'};
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${(props) => props.theme?.colors?.border || '#eee'};

  &:last-child {
    border-bottom: none;
  }
`;

const FilterTitle = styled.h4`
  font-size: 1rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin: 0 0 1rem 0;
`;

const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  }
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type='radio'] {
    cursor: pointer;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: ${(props) => props.theme?.colors?.text || '#333'};
    font-size: 0.9rem;
  }
`;

const CheckboxOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  input[type='checkbox'] {
    cursor: pointer;
  }

  label {
    cursor: pointer;
    color: ${(props) => props.theme?.colors?.text || '#333'};
    font-size: 0.9rem;
  }
`;

const ProductsContainer = styled.div``;

const ResultsCount = styled.div`
  font-size: 1.1rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  margin-bottom: 1.5rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f9fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductTitle = styled.h3`
  font-size: 1rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;

  span {
    font-size: 0.85rem;
    color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
    margin-left: 0.25rem;
  }
`;

const ProductPrice = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  margin-bottom: 0.5rem;
`;

const FreeShippingBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProductListItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ListImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 100%;
    aspect-ratio: 1;
  }
`;

const ListInfo = styled.div`
  flex: 1;
`;

const ListTitle = styled.h3`
  font-size: 1.25rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin: 0 0 0.5rem 0;
`;

const ListDesc = styled.p`
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  line-height: 1.6;
  margin: 0 0 1rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ListMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const ListPrice = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  h3 {
    color: ${(props) => props.theme?.colors?.text || '#333'};
    margin: 0;
  }

  p {
    color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
    margin: 0;
  }
`;

export default SearchResultsPage;
