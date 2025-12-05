import { logger } from '../../services/logger-service';
// src/components/analytics/B2BAnalyticsDashboard.tsx
// B2B Analytics Dashboard Component for Bulgarian Car Marketplace

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';
import {
  BarChart3,
  TrendingUp,
  Users,
  Car,
  Euro,
  Calendar,
  Download,
  Filter,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  totalListings: number;
  activeListings: number;
  totalUsers: number;
  averagePrice: number;
  priceTrend: number;
  popularMakes: Array<{ make: string; count: number; avgPrice: number }>;
  locationStats: Array<{ location: string; count: number; avgPrice: number }>;
  monthlyStats: Array<{ month: string; listings: number; avgPrice: number }>;
  marketInsights: {
    topPerformingMakes: string[];
    priceVolatility: number;
    marketGrowth: number;
  };
}

interface DashboardProps {
  subscriptionTier: string;
}

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  color: #3b82f6;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetricChange = styled.div<{ positive: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  background: #f9fafb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1.1rem;
`;

const InsightsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const InsightItem = styled.div`
  display: flex;
  align-items: start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InsightIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
  color: #d97706;
  flex-shrink: 0;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
`;

const B2BAnalyticsDashboard: React.FC<DashboardProps> = ({ subscriptionTier }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const getAnalytics = httpsCallable(functions, 'getB2BAnalytics');
      const result = await getAnalytics({
        dateRange,
        tier: subscriptionTier
      });

      setAnalytics(result.data as AnalyticsData);
    } catch (error: any) {
      logger.error('Error loading analytics:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [user, dateRange, subscriptionTier]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleExport = async () => {
    try {
      const exportAnalytics = httpsCallable(functions, 'exportB2BAnalytics');
      const result = await exportAnalytics({
        dateRange,
        format: 'csv'
      });

      // Create download link
      const blob = new Blob([result.data as string], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulgarian-car-analytics-${dateRange}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LoadingSpinner />
          <span style={{ marginLeft: '1rem', color: '#6b7280' }}>Loading analytics...</span>
        </div>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  if (!analytics) {
    return (
      <DashboardContainer>
        <ErrorMessage>
          <AlertCircle size={20} />
          No analytics data available
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>B2B Analytics Dashboard</Title>
        <Controls>
          <FilterButton>
            <Filter size={16} />
            {dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : 'Last Year'}
          </FilterButton>
          <ExportButton onClick={handleExport}>
            <Download size={16} />
            Export Data
          </ExportButton>
        </Controls>
      </Header>

      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <Car size={24} />
            </MetricIcon>
            <div>
              <MetricValue>{analytics.totalListings.toLocaleString()}</MetricValue>
              <MetricLabel>Total Listings</MetricLabel>
            </div>
          </MetricHeader>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <Users size={24} />
            </MetricIcon>
            <div>
              <MetricValue>{analytics.totalUsers.toLocaleString()}</MetricValue>
              <MetricLabel>Active Users</MetricLabel>
            </div>
          </MetricHeader>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <Euro size={24} />
            </MetricIcon>
            <div>
              <MetricValue>{formatPrice(analytics.averagePrice)}</MetricValue>
              <MetricLabel>Average Price</MetricLabel>
              <MetricChange positive={analytics.priceTrend > 0}>
                <TrendingUp size={14} />
                {analytics.priceTrend > 0 ? '+' : ''}{analytics.priceTrend.toFixed(1)}%
              </MetricChange>
            </div>
          </MetricHeader>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <BarChart3 size={24} />
            </MetricIcon>
            <div>
              <MetricValue>{analytics.activeListings.toLocaleString()}</MetricValue>
              <MetricLabel>Active Listings</MetricLabel>
            </div>
          </MetricHeader>
        </MetricCard>
      </MetricsGrid>

      {/* Charts */}
      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Popular Car Makes</ChartTitle>
          <ChartPlaceholder>
            <BarChart3 size={48} />
            <div style={{ marginLeft: '1rem' }}>
              <div>Chart visualization would be implemented here</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Top makes: {analytics.popularMakes.slice(0, 3).map(m => m.make).join(', ')}
              </div>
            </div>
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Price Trends</ChartTitle>
          <ChartPlaceholder>
            <TrendingUp size={48} />
            <div style={{ marginLeft: '1rem' }}>
              <div>Monthly price trend chart</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Market growth: {analytics.marketInsights.marketGrowth > 0 ? '+' : ''}{analytics.marketInsights.marketGrowth.toFixed(1)}%
              </div>
            </div>
          </ChartPlaceholder>
        </ChartCard>
      </ChartsGrid>

      {/* Market Insights */}
      <InsightsCard>
        <ChartTitle>Market Insights</ChartTitle>
        <InsightItem>
          <InsightIcon>
            <TrendingUp size={20} />
          </InsightIcon>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Top Performing Makes
            </div>
            <div style={{ color: '#6b7280' }}>
              {analytics.marketInsights.topPerformingMakes.join(', ')} are showing strong performance in the Bulgarian market
            </div>
          </div>
        </InsightItem>

        <InsightItem>
          <InsightIcon>
            <BarChart3 size={20} />
          </InsightIcon>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Price Volatility
            </div>
            <div style={{ color: '#6b7280' }}>
              Current market volatility is {analytics.marketInsights.priceVolatility.toFixed(1)}%,
              indicating {analytics.marketInsights.priceVolatility > 10 ? 'high' : 'moderate'} price fluctuations
            </div>
          </div>
        </InsightItem>

        <InsightItem>
          <InsightIcon>
            <Calendar size={20} />
          </InsightIcon>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Market Growth
            </div>
            <div style={{ color: '#6b7280' }}>
              The Bulgarian car market has grown by {analytics.marketInsights.marketGrowth > 0 ? '+' : ''}{analytics.marketInsights.marketGrowth.toFixed(1)}%
              compared to the previous period
            </div>
          </div>
        </InsightItem>
      </InsightsCard>
    </DashboardContainer>
  );
};

export default B2BAnalyticsDashboard;