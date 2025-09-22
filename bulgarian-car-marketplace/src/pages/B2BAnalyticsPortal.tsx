// src/pages/B2BAnalyticsPortal.tsx
// B2B Analytics Portal for Bulgarian Car Marketplace Partners

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';
import {
  RegionalPriceChart,
  MarketTrendsChart,
  SalesPeakChart,
  PriceDistributionChart
} from '../components/analytics/Charts';

const PortalContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const PortalHeader = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.h1`
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const SubscriptionBadge = styled.div<{ tier: string }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-top: 15px;

  ${props => {
    switch (props.tier) {
      case 'enterprise':
        return 'background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white;';
      case 'premium':
        return 'background: linear-gradient(45deg, #ffd93d, #ff8c42); color: white;';
      case 'basic':
        return 'background: linear-gradient(45deg, #6bcf7f, #4ecdc4); color: white;';
      default:
        return 'background: #ecf0f1; color: #7f8c8d;';
    }
  }}
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const DashboardCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardIcon = styled.span`
  font-size: 1.5rem;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const MetricCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 20px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c0392b;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f8d7da;
  margin: 20px 0;
  text-align: center;
`;

const NoSubscriptionMessage = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const UpgradeButton = styled.button`
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

interface SubscriptionStatus {
  hasSubscription: boolean;
  tier: string | null;
  status: string | null;
  expiresAt: Date | null;
  isActive: boolean;
}

interface PriceAnalytics {
  averagePrice: number;
  sampleSize: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
}

interface RegionalData {
  city: string;
  averagePrice: number;
  sampleSize: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
}

interface SalesPeakData {
  hour: number;
  salesCount: number;
  averagePrice: number;
  currency: string;
}

const B2BAnalyticsPortal: React.FC = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [priceAnalytics, setPriceAnalytics] = useState<PriceAnalytics | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [salesPeakData, setSalesPeakData] = useState<SalesPeakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const getSubscriptionStatus = httpsCallable(functions, 'getSubscriptionStatus');
      const result = await getSubscriptionStatus();
      setSubscriptionStatus(result.data as SubscriptionStatus);

      if ((result.data as SubscriptionStatus).isActive) {
        await loadAnalyticsData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Load price analytics for popular models
      const getAveragePrice = httpsCallable(functions, 'getAveragePriceByModel');
      const priceResult = await getAveragePrice({ model: 'Golf' }); // Example model
      setPriceAnalytics(priceResult.data as PriceAnalytics);

      // Load market trends
      const getTrends = httpsCallable(functions, 'getMarketTrends');
      const trendsResult = await getTrends({ period: '30' });
      setMarketTrends(trendsResult.data as MarketTrend[]);

      // Load regional price variations
      const getRegional = httpsCallable(functions, 'getRegionalPriceVariations');
      const regionalResult = await getRegional({ model: 'Golf' });
      setRegionalData(regionalResult.data as RegionalData[]);

      // Load sales peak hours
      const getSalesPeaks = httpsCallable(functions, 'getSalesPeakHours');
      const salesResult = await getSalesPeaks({ period: '90' });
      setSalesPeakData(salesResult.data as SalesPeakData[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <PortalContainer>
        <LoadingSpinner />
      </PortalContainer>
    );
  }

  if (!subscriptionStatus?.isActive) {
    return (
      <PortalContainer>
        <NoSubscriptionMessage>
          <h2>🚫 Нямате активен абонамент</h2>
          <p>
            За достъп до B2B Analytics Portal е необходим активен абонамент.
            Свържете се с нас за повече информация.
          </p>
          <UpgradeButton onClick={() => window.location.href = 'mailto:contact@globul-cars.bg'}>
            Свържете се с нас
          </UpgradeButton>
        </NoSubscriptionMessage>
      </PortalContainer>
    );
  }

  return (
    <PortalContainer>
      <PortalHeader>
        <HeaderTitle>B2B Analytics Portal</HeaderTitle>
        <HeaderSubtitle>
          Аналитични данни и прозрения за пазара на автомобили в България
        </HeaderSubtitle>
        <SubscriptionBadge tier={subscriptionStatus.tier || 'basic'}>
          {subscriptionStatus.tier?.toUpperCase()} PLAN
        </SubscriptionBadge>
      </PortalHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DashboardGrid>
        <DashboardCard>
          <CardTitle>
            <CardIcon>📊</CardIcon>
            Средни цени на моделите
          </CardTitle>
          {priceAnalytics && (
            <MetricGrid>
              <MetricCard>
                <MetricValue>{formatCurrency(priceAnalytics.averagePrice)}</MetricValue>
                <MetricLabel>Средна цена</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{priceAnalytics.sampleSize}</MetricValue>
                <MetricLabel>Брой обяви</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{formatCurrency(priceAnalytics.minPrice)}</MetricValue>
                <MetricLabel>Минимална цена</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{formatCurrency(priceAnalytics.maxPrice)}</MetricValue>
                <MetricLabel>Максимална цена</MetricLabel>
              </MetricCard>
            </MetricGrid>
          )}
        </DashboardCard>

        <DashboardCard>
          <CardTitle>
            <CardIcon>📈</CardIcon>
            Трендове на пазара
          </CardTitle>
          <div>
            {marketTrends.slice(0, 5).map((trend, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <span>{trend.make} {trend.model}</span>
                <span>{trend.searchCount} търсения</span>
                <span>{formatCurrency(trend.averagePrice)}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard>
          <CardTitle>
            <CardIcon>🏆</CardIcon>
            Регионални вариации
          </CardTitle>
          <p>Данни за цените по градове в България</p>
          <ChartContainer>
            {regionalData.length > 0 ? (
              <RegionalPriceChart data={regionalData} />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                Зареждане на данни...
              </div>
            )}
          </ChartContainer>
        </DashboardCard>

        <DashboardCard>
          <CardTitle>
            <CardIcon>⏰</CardIcon>
            Пикови часове за продажби
          </CardTitle>
          <p>Най-добрите часове за публикуване на обяви</p>
          <ChartContainer>
            {salesPeakData.length > 0 ? (
              <SalesPeakChart data={salesPeakData} />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                Зареждане на данни...
              </div>
            )}
          </ChartContainer>
        </DashboardCard>
      </DashboardGrid>
    </PortalContainer>
  );
};

export default B2BAnalyticsPortal;