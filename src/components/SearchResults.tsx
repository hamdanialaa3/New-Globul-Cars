import React, { useState , memo} from 'react';
import styled from 'styled-components';
import { 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
// 🔴 CRITICAL: Use reusable EmptyState component
import { NoSearchResults } from './EmptyStates';
import LazyImage from './LazyImage';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  location: string;
  date: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize: number;
  color: string;
  condition: string;
  features: string[];
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  isFavorite: boolean;
  isPromoted: boolean;
  isNew: boolean;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  onResultClick?: (result: SearchResult) => void;
  onFavoriteToggle?: (resultId: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
  style?: React.CSSProperties;
  showFilters?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
  showPagination?: boolean;
}

const SearchResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SearchResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchResultsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchResultsCount = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultsControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchResultsSort = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SearchResultsViewToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  overflow: hidden;
`;

const SearchResultsViewButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  background: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : 'transparent'
  };
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.contrastText : theme.colors.text.primary
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, isActive }) => 
      isActive ? theme.colors.primary.dark : theme.colors.grey[100]
    };
  }
`;

const SearchResultsGrid = styled.div<{ view: 'grid' | 'list' }>`
  display: grid;
  grid-template-columns: ${({ view }) => 
    view === 'grid' 
      ? 'repeat(auto-fill, minmax(300px, 1fr))' 
      : '1fr'
  };
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SearchResultCard = styled.div<{ view: 'grid' | 'list' }>`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  display: ${({ view }) => view === 'list' ? 'flex' : 'block'};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const SearchResultImage = styled.div<{ view: 'grid' | 'list' }>`
  position: relative;
  width: ${({ view }) => view === 'list' ? '200px' : '100%'};
  height: ${({ view }) => view === 'list' ? '150px' : '200px'};
  flex-shrink: 0;
  overflow: hidden;
`;

const SearchResultBadges = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SearchResultBadge = styled.span<{ type: 'promoted' | 'new' | 'favorite' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'promoted': return theme.colors.warning.main;
      case 'new': return theme.colors.success.main;
      case 'favorite': return theme.colors.error.main;
      default: return theme.colors.grey[300];
    }
  }};
  color: white;
`;

const SearchResultContent = styled.div<{ view: 'grid' | 'list' }>`
  padding: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SearchResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SearchResultTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.4;
`;

const SearchResultPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  text-align: right;
`;

const SearchResultMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SearchResultMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const SearchResultFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SearchResultFeature = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.grey[100]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const SearchResultSeller = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SearchResultSellerAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.grey[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultSellerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchResultSellerName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SearchResultSellerRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultsPagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const SearchResultsPaginationButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.light + '10'};
  }
`;

const SearchResultsPaginationInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 ${({ theme }) => theme.spacing.md};
`;

const SearchResultsEmpty = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResultsLoading = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading = false,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSortChange,
  onViewChange,
  onResultClick,
  onFavoriteToggle,
  onFilterChange,
  className,
  style,
  showFilters = true,
  showSort = true,
  showViewToggle = true,
  showPagination = true,
}) => {
  const { t } = useLanguage();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
    onViewChange?.(newView);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onSortChange?.(newSortBy, sortOrder);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
  };

  // Note: Sort order toggle and favorite toggle functions removed as they're not currently used in the UI

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('bg-BG');
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('bg-BG').format(mileage) + ' km';
  };

  if (loading) {
    return (
      <SearchResultsContainer className={className} style={style}>
        <SearchResultsLoading>
          {t('searchResults.loading')}
        </SearchResultsLoading>
      </SearchResultsContainer>
    );
  }

  if (results.length === 0) {
    return (
      <SearchResultsContainer className={className} style={style}>
        {/* 🔴 CRITICAL: Use reusable EmptyState component */}
        <NoSearchResults />
      </SearchResultsContainer>
    );
  }

  return (
    <SearchResultsContainer className={className} style={style}>
      <SearchResultsHeader>
        <SearchResultsInfo>
          <SearchResultsCount>
            {t('searchResults.count')}
          </SearchResultsCount>
        </SearchResultsInfo>

        <SearchResultsControls>
          {showSort && (
            <SearchResultsSort
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="relevance">{t('searchResults.sort.relevance')}</option>
              <option value="price">{t('searchResults.sort.price')}</option>
              <option value="date">{t('searchResults.sort.date')}</option>
              <option value="mileage">{t('searchResults.sort.mileage')}</option>
              <option value="year">{t('searchResults.sort.year')}</option>
            </SearchResultsSort>
          )}

          {showViewToggle && (
            <SearchResultsViewToggle>
              <SearchResultsViewButton
                isActive={view === 'grid'}
                onClick={() => handleViewChange('grid')}
              >
                <Grid size={16} />
                {t('searchResults.view.grid')}
              </SearchResultsViewButton>
              <SearchResultsViewButton
                isActive={view === 'list'}
                onClick={() => handleViewChange('list')}
              >
                <List size={16} />
                {t('searchResults.view.list')}
              </SearchResultsViewButton>
            </SearchResultsViewToggle>
          )}
        </SearchResultsControls>
      </SearchResultsHeader>

      <SearchResultsGrid view={view}>
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            view={view}
            onClick={() => handleResultClick(result)}
          >
            <SearchResultImage view={view}>
              <LazyImage
                src={result.image}
                alt={result.title}
                placeholder="/placeholder-car.jpg"
              />
              <SearchResultBadges>
                {result.isPromoted && (
                  <SearchResultBadge type="promoted">
                    {t('searchResults.badges.promoted')}
                  </SearchResultBadge>
                )}
                {result.isNew && (
                  <SearchResultBadge type="new">
                    {t('searchResults.badges.new')}
                  </SearchResultBadge>
                )}
                {result.isFavorite && (
                  <SearchResultBadge type="favorite">
                    {t('searchResults.badges.favorite')}
                  </SearchResultBadge>
                )}
              </SearchResultBadges>
            </SearchResultImage>

            <SearchResultContent view={view}>
              <SearchResultHeader>
                <SearchResultTitle>{result.title}</SearchResultTitle>
                <SearchResultPrice>
                  {formatPrice(result.price, result.currency)}
                </SearchResultPrice>
              </SearchResultHeader>

              <SearchResultMeta>
                <SearchResultMetaItem>
                  <MapPin size={14} />
                  {result.location}
                </SearchResultMetaItem>
                <SearchResultMetaItem>
                  <Calendar size={14} />
                  {formatDate(result.date)}
                </SearchResultMetaItem>
                <SearchResultMetaItem>
                  {result.year}
                </SearchResultMetaItem>
                <SearchResultMetaItem>
                  {formatMileage(result.mileage)}
                </SearchResultMetaItem>
              </SearchResultMeta>

              <SearchResultDescription>
                {result.description}
              </SearchResultDescription>

              <SearchResultFeatures>
                {result.features.slice(0, 3).map((feature, index) => (
                  <SearchResultFeature key={index}>
                    {feature}
                  </SearchResultFeature>
                ))}
                {result.features.length > 3 && (
                  <SearchResultFeature>
                    +{result.features.length - 3} more
                  </SearchResultFeature>
                )}
              </SearchResultFeatures>

              <SearchResultFooter>
                <SearchResultSeller>
                  <SearchResultSellerAvatar>
                    {result.seller.name.charAt(0).toUpperCase()}
                  </SearchResultSellerAvatar>
                  <SearchResultSellerInfo>
                    <SearchResultSellerName>
                      {result.seller.name}
                    </SearchResultSellerName>
                    <SearchResultSellerRating>
                      <Star size={12} />
                      {result.seller.rating}
                    </SearchResultSellerRating>
                  </SearchResultSellerInfo>
                </SearchResultSeller>

                <SearchResultRating>
                  <Star size={14} />
                  {result.rating}
                  <span>({result.reviewCount})</span>
                </SearchResultRating>
              </SearchResultFooter>
            </SearchResultContent>
          </SearchResultCard>
        ))}
      </SearchResultsGrid>

      {showPagination && totalPages > 1 && (
        <SearchResultsPagination>
          <SearchResultsPaginationButton
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            <ChevronLeft size={16} />
            {t('searchResults.pagination.previous')}
          </SearchResultsPaginationButton>

          <SearchResultsPaginationInfo>
            {t('searchResults.pagination.page')}
          </SearchResultsPaginationInfo>

          <SearchResultsPaginationButton
            disabled={currentPage === totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            {t('searchResults.pagination.next')}
            <ChevronRight size={16} />
          </SearchResultsPaginationButton>
        </SearchResultsPagination>
      )}
    </SearchResultsContainer>
  );
};

export default memo(SearchResults);
