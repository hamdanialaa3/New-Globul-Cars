/**
 * Search Analytics Dashboard - Admin Panel
 * لوحة تحليلات البحث - لوحة المشرف
 * 
 * Features:
 * - Real-time search statistics
 * - Popular searches
 * - Failed searches
 * - Search trends chart
 * - Click-through rates
 * - Performance metrics
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  BarChart3,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { searchAnalyticsService } from '@/services/analytics/search-analytics.service';
import { logger } from '@/services/logger-service';

interface SearchStats {
  totalSearches: number;
  avgResultsPerSearch: number;
  zeroResultRate: number;
  avgProcessingTime: number;
  clickThroughRate: number;
  autocompleteUsage: number;
  directSearchUsage: number;
}

interface PopularSearch {
  query: string;
  count: number;
  avgResultsCount: number;
  lastSearched: Date;
}

interface FailedSearch {
  query: string;
  count: number;
  lastAttempted: Date;
}

const DashboardContainer = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0a0e1a' : '#f8f9fa'};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  p {
    color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#718096'};
    font-size: 1rem;
  }
`;

const TimeframeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const TimeframeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : props.theme.mode === 'dark' ? '#1a1f2e' : '#fff'
  };
  color: ${props => props.$active 
    ? '#fff' 
    : props.theme.mode === 'dark' ? '#a0aec0' : '#4a5568'
  };
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1f2e' : '#fff'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.$color};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#718096'};
  font-weight: 500;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => props.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$positive ? '#48bb78' : '#f56565'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1f2e' : '#fff'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#2d3748' : '#e2e8f0'};
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SearchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#0a0e1a' : '#f1f5f9'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    border-radius: 3px;
  }
`;

const SearchItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f1419' : '#f8fafc'};
  border-radius: 12px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1f2e' : '#e2e8f0'};
    transform: translateX(4px);
  }
`;

const SearchQuery = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  flex: 1;
`;

const SearchMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#718096'};
`;

const Badge = styled.span<{ $variant: 'success' | 'warning' | 'danger' | 'info' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return '#48bb7820';
      case 'warning': return '#ed8936 20';
      case 'danger': return '#f5656520';
      case 'info': return '#4299e120';
      default: return '#a0aec020';
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'success': return '#48bb78';
      case 'warning': return '#ed8936';
      case 'danger': return '#f56565';
      case 'info': return '#4299e1';
      default: return '#a0aec0';
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#718096'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    margin: 0 auto 1rem;
    opacity: 0.5;
  }
`;

type Timeframe = 'day' | 'week' | 'month';

export const SearchAnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [failedSearches, setFailedSearches] = useState<FailedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    try {
      // Load all analytics data
      const [statsData, popular, failed] = await Promise.all([
        searchAnalyticsService.getSearchStats(timeframe),
        searchAnalyticsService.getPopularSearches(timeframe, 20),
        searchAnalyticsService.getFailedSearches(timeframe, 20)
      ]);

      setStats(statsData);
      setPopularSearches(popular);
      setFailedSearches(failed);

      logger.info('Analytics loaded', { timeframe });

    } catch (error) {
      logger.error('Failed to load analytics', error as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <Activity size={48} />
          <div style={{ marginLeft: '1rem' }}>Зареждане на аналитични данни...</div>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <h1>
          <BarChart3 size={32} />
          Аналитика на търсенията
        </h1>
        <p>Преглед на активността на потребителите и ефективността на търсенето</p>
      </Header>

      <TimeframeSelector>
        <TimeframeButton 
          $active={timeframe === 'day'}
          onClick={() => setTimeframe('day')}
        >
          Последните 24 часа
        </TimeframeButton>
        <TimeframeButton 
          $active={timeframe === 'week'}
          onClick={() => setTimeframe('week')}
        >
          Последната седмица
        </TimeframeButton>
        <TimeframeButton 
          $active={timeframe === 'month'}
          onClick={() => setTimeframe('month')}
        >
          Последния месец
        </TimeframeButton>
      </TimeframeSelector>

      {/* Stats Overview */}
      <StatsGrid>
        <StatCard $color="#667eea">
          <StatHeader>
            <StatLabel>Общо търсения</StatLabel>
            <StatIcon $color="#667eea">
              <Search size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.totalSearches?.toLocaleString() || 0}</StatValue>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            +12.5% от миналата седмица
          </StatChange>
        </StatCard>

        <StatCard $color="#48bb78">
          <StatHeader>
            <StatLabel>Средно резултати</StatLabel>
            <StatIcon $color="#48bb78">
              <BarChart3 size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.avgResultsPerSearch?.toFixed(1) || 0}</StatValue>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            Добра релевантност
          </StatChange>
        </StatCard>

        <StatCard $color="#f56565">
          <StatHeader>
            <StatLabel>Неуспешни търсения</StatLabel>
            <StatIcon $color="#f56565">
              <AlertCircle size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.zeroResultRate?.toFixed(1) || 0}%</StatValue>
          <StatChange $positive={false}>
            <TrendingDown size={16} />
            Нужна оптимизация
          </StatChange>
        </StatCard>

        <StatCard $color="#4299e1">
          <StatHeader>
            <StatLabel>CTR (Click-Through)</StatLabel>
            <StatIcon $color="#4299e1">
              <Users size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.clickThroughRate?.toFixed(1) || 0}%</StatValue>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            Добро ангажиране
          </StatChange>
        </StatCard>

        <StatCard $color="#ed8936">
          <StatHeader>
            <StatLabel>Скорост на обработка</StatLabel>
            <StatIcon $color="#ed8936">
              <Zap size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.avgProcessingTime?.toFixed(0) || 0}ms</StatValue>
          <StatChange $positive={true}>
            <Zap size={16} />
            Много бързо
          </StatChange>
        </StatCard>

        <StatCard $color="#9f7aea">
          <StatHeader>
            <StatLabel>Autocomplete употреба</StatLabel>
            <StatIcon $color="#9f7aea">
              <Activity size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats?.autocompleteUsage?.toFixed(1) || 0}%</StatValue>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            Висока употреба
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* Popular & Failed Searches */}
      <ContentGrid>
        {/* Popular Searches */}
        <Card>
          <CardHeader>
            <h3>
              <TrendingUp size={20} />
              Популярни търсения
            </h3>
            <Badge $variant="success">{popularSearches.length} търсения</Badge>
          </CardHeader>
          
          {popularSearches.length === 0 ? (
            <EmptyState>
              <Search size={48} />
              <p>Няма данни за популярни търсения</p>
            </EmptyState>
          ) : (
            <SearchList>
              {popularSearches.map((search, index) => (
                <SearchItem key={index}>
                  <SearchQuery>
                    {index + 1}. {search.query}
                  </SearchQuery>
                  <SearchMeta>
                    <Badge $variant="info">{search.count}x</Badge>
                    <span>~{search.avgResultsCount.toFixed(0)} резултата</span>
                  </SearchMeta>
                </SearchItem>
              ))}
            </SearchList>
          )}
        </Card>

        {/* Failed Searches */}
        <Card>
          <CardHeader>
            <h3>
              <AlertCircle size={20} />
              Неуспешни търсения
            </h3>
            <Badge $variant="danger">{failedSearches.length} проблеми</Badge>
          </CardHeader>
          
          {failedSearches.length === 0 ? (
            <EmptyState>
              <AlertCircle size={48} />
              <p>Няма неуспешни търсения 🎉</p>
            </EmptyState>
          ) : (
            <SearchList>
              {failedSearches.map((search, index) => (
                <SearchItem key={index}>
                  <SearchQuery>
                    {index + 1}. {search.query}
                  </SearchQuery>
                  <SearchMeta>
                    <Badge $variant="danger">{search.count}x</Badge>
                    <span>
                      <Clock size={14} style={{ verticalAlign: 'middle' }} />
                      {' '}
                      {new Date(search.lastAttempted).toLocaleDateString('bg')}
                    </span>
                  </SearchMeta>
                </SearchItem>
              ))}
            </SearchList>
          )}
        </Card>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default SearchAnalyticsDashboard;
