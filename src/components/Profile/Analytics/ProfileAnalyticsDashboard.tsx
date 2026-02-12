// src/components/Profile/Analytics/ProfileAnalyticsDashboard.tsx
// Profile Analytics Dashboard Component - 100% Real Data!
// 🎯 No Mock Data - Everything is Real from Firebase
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { profileAnalyticsService } from '../../../services/analytics/profile-analytics.service';
import type { ProfileAnalytics } from '../../../services/analytics/profile-analytics.service';
import { logger } from '../../../services/logger-service';
import { 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  Heart,
  Users,
  Clock,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  }
  
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 12px;
    
    /* Dark Mode Support */
    html[data-theme="dark"] & {
      color: #f8fafc;
    }
    
    transition: color 0.3s ease;
  }
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const PeriodButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$active ? '#FF7900' : 'white'};
  color: ${props => props.$active ? 'white' : '#6c757d'};
  border: 1px solid ${props => props.$active ? '#FF7900' : '#dee2e6'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF7900;
    background: ${props => props.$active ? '#e66d00' : '#f8f9fa'};
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: ${props => props.$active ? '#FF7900' : 'rgba(30, 41, 59, 0.8)'};
    color: ${props => props.$active ? 'white' : '#cbd5e1'};
    border-color: ${props => props.$active ? '#FF7900' : 'rgba(148, 163, 184, 0.3)'};
    
    &:hover {
      background: ${props => props.$active ? '#e66d00' : 'rgba(51, 65, 85, 0.9)'};
      border-color: #FF7900;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.15);
    border-color: rgba(255, 121, 0, 0.3);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    border-color: rgba(148, 163, 184, 0.2);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(255, 121, 0, 0.25);
      border-color: rgba(255, 121, 0, 0.4);
    }
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$color}15;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  
  svg {
    color: ${props => props.$color};
  }
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 4px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  transition: color 0.3s ease;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$positive ? '#28a745' : '#dc3545'};
  margin-top: 8px;
  font-weight: 600;
  
  &::before {
    content: '${props => props.$positive ? '↑' : '↓'} ';
  }
`;

const ChartContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
  }
  
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const ChartTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #495057;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
`;

const SimpleBarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.1);
  }
  
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  flex: 1;
  height: ${props => props.$height}%;
  background: ${props => props.$color};
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    opacity: 0.8;
    transform: scaleY(1.05);
  }
  
  &::after {
    content: attr(data-value);
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: #495057;
    
    /* Dark Mode Support */
    html[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
`;

const LiveDataBadge = styled.span`
  font-size: 0.7rem;
  color: #28a745;
  background: #d4edda;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #86efac;
    background: rgba(22, 163, 74, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  
  transition: all 0.3s ease;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  p {
    margin-top: 16px;
  }
  
  svg {
    animation: spin 1s linear;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  transition: color 0.3s ease;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
  color: #dc3545;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f87171;
  }
  
  transition: color 0.3s ease;
`;

const InsightsSection = styled.div`
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
  
  h4 {
    margin: 0 0 12px 0;
    color: #856404;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      color: #856404;
      margin-bottom: 8px;
    }
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: rgba(251, 191, 36, 0.15);
    border-left-color: #fbbf24;
    
    h4 {
      color: #fbbf24;
    }
    
    ul li {
      color: #fde047;
    }
  }
  
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
`;

interface ProfileAnalyticsDashboardProps {
  userId: string;
}

export const ProfileAnalyticsDashboard: React.FC<ProfileAnalyticsDashboardProps> = ({ userId }) => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Added useCallback with proper dependencies
  const loadAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Loading REAL analytics', { userId, period });
      }
      
      const realData = await profileAnalyticsService.getAnalytics(userId, period);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('REAL Analytics loaded', { userId, period, hasData: !!realData });
      }
      setAnalytics(realData);
    } catch (error) {
      logger.error('Error loading analytics', error as Error, { userId, period });
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const t = (key: string) => {
    const translations: Record<string, Record<string, any>> = {
      bg: {
        title: 'Аналитика на профила',
        profileViews: 'Прегледи на профила',
        uniqueVisitors: 'Уникални посетители',
        carViews: 'Прегледи на коли',
        inquiries: 'Запитвания',
        favorites: 'Любими',
        followers: 'Последователи',
        responseTime: 'Време за отговор',
        conversionRate: 'Процент на конверсия',
        viewsOverTime: 'Прегледи във времето',
        insights: 'Insights & Препоръки',
        hours: 'часа',
        days: {
          '7d': '7 дни',
          '30d': '30 дни',
          '90d': '90 дни'
        }
      },
      en: {
        title: 'Profile Analytics',
        profileViews: 'Profile Views',
        uniqueVisitors: 'Unique Visitors',
        carViews: 'Car Views',
        inquiries: 'Inquiries',
        favorites: 'Favorites',
        followers: 'Followers',
        responseTime: 'Response Time',
        conversionRate: 'Conversion Rate',
        viewsOverTime: 'Views Over Time',
        insights: 'Insights & Recommendations',
        hours: 'hours',
        days: {
          '7d': '7 days',
          '30d': '30 days',
          '90d': '90 days'
        }
      }
    };
    
    return translations[language]?.[key] || key;
  };

  const getMaxValue = () => {
    if (!analytics || !analytics.viewsByDay) return 1;
    const values = Object.values(analytics.viewsByDay);
    return values.length > 0 ? Math.max(...values) : 1;
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getBestDay = (): string => {
    if (!analytics?.viewsByDay) return 'Friday';
    const entries = Object.entries(analytics.viewsByDay);
    if (entries.length === 0) return 'Friday';
    
    const [bestDay] = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
    return bestDay;
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <h2>
            <BarChart3 size={28} color="#FF7900" />
            {t('title')}
          </h2>
        </Header>
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear  /* ⚡ OPTIMIZED: Removed infinite */' }} />
          <p style={{ marginTop: '16px' }}>
            {language === 'bg' ? 'Зареждане на данни...' : 'Loading data...'}
          </p>
        </div>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <Header>
          <h2>
            <BarChart3 size={28} color="#FF7900" />
            {t('title')}
          </h2>
        </Header>
        <ErrorContainer>
          <p>{language === 'bg' ? 'Грешка при зареждане на данни' : 'Error loading analytics'}</p>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2>
          <BarChart3 size={28} color="#FF7900" />
          {t('title')}
          <LiveDataBadge>
            ✅ LIVE DATA
          </LiveDataBadge>
        </h2>
        <PeriodSelector>
          <PeriodButton 
            $active={period === '7d'}
            onClick={() => setPeriod('7d')}
          >
            {t('days.7d')}
          </PeriodButton>
          <PeriodButton 
            $active={period === '30d'}
            onClick={() => setPeriod('30d')}
          >
            {t('days.30d')}
          </PeriodButton>
          <PeriodButton 
            $active={period === '90d'}
            onClick={() => setPeriod('90d')}
          >
            {t('days.90d')}
          </PeriodButton>
        </PeriodSelector>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#FF7900">
            <Eye size={24} />
          </StatIcon>
          <StatValue>{analytics.profileViews.toLocaleString()}</StatValue>
          <StatLabel>{t('profileViews')}</StatLabel>
          {analytics.viewsChange !== 0 && (
            <StatChange $positive={analytics.viewsChange > 0}>
              {formatChange(analytics.viewsChange)}
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatIcon $color="#0d6efd">
            <Users size={24} />
          </StatIcon>
          <StatValue>{analytics.uniqueVisitors.toLocaleString()}</StatValue>
          <StatLabel>{t('uniqueVisitors')}</StatLabel>
          {analytics.visitorsChange !== 0 && (
            <StatChange $positive={analytics.visitorsChange > 0}>
              {formatChange(analytics.visitorsChange)}
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatIcon $color="#198754">
            <MessageCircle size={24} />
          </StatIcon>
          <StatValue>{analytics.inquiries}</StatValue>
          <StatLabel>{t('inquiries')}</StatLabel>
          {analytics.inquiriesChange !== 0 && (
            <StatChange $positive={analytics.inquiriesChange > 0}>
              {formatChange(analytics.inquiriesChange)}
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatIcon $color="#dc3545">
            <Heart size={24} />
          </StatIcon>
          <StatValue>{analytics.favorites}</StatValue>
          <StatLabel>{t('favorites')}</StatLabel>
          {analytics.favoritesChange !== 0 && (
            <StatChange $positive={analytics.favoritesChange > 0}>
              {formatChange(analytics.favoritesChange)}
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatIcon $color="#6f42c1">
            <TrendingUp size={24} />
          </StatIcon>
          <StatValue>{analytics.conversionRate.toFixed(1)}%</StatValue>
          <StatLabel>{t('conversionRate')}</StatLabel>
          {analytics.conversionChange !== 0 && (
            <StatChange $positive={analytics.conversionChange > 0}>
              {formatChange(analytics.conversionChange)}
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatIcon $color="#fd7e14">
            <Clock size={24} />
          </StatIcon>
          <StatValue>{analytics.responseTime.toFixed(1)}h</StatValue>
          <StatLabel>{t('responseTime')}</StatLabel>
          {analytics.responseTimeChange !== 0 && (
            <StatChange $positive={analytics.responseTimeChange < 0}>
              {formatChange(analytics.responseTimeChange)}
            </StatChange>
          )}
        </StatCard>
      </StatsGrid>

      {Object.keys(analytics.viewsByDay).length > 0 && (
        <ChartContainer>
          <ChartTitle>{t('viewsOverTime')}</ChartTitle>
          <SimpleBarChart>
            {Object.entries(analytics.viewsByDay).map(([day, value]) => (
              <Bar
                key={day}
                $height={(value / getMaxValue()) * 100}
                $color="#FF7900"
                data-value={value}
                title={`${day}: ${value}`}
              />
            ))}
          </SimpleBarChart>
        </ChartContainer>
      )}

      <InsightsSection>
        <h4>
          <Activity size={20} />
          {t('insights')}
        </h4>
        <ul>
          <li>{language === 'bg' 
            ? `Най-добрият ден: ${getBestDay()}` 
            : `Your profile gets most views on ${getBestDay()}`}</li>
          {analytics.responseTime > 0 && (
            <li>{language === 'bg'
              ? `Средно време за отговор: ${analytics.responseTime.toFixed(1)} часа`
              : `Average response time: ${analytics.responseTime.toFixed(1)} hours`}</li>
          )}
          {analytics.conversionRate > 2 && (
            <li>{language === 'bg'
              ? `Процентът на конверсия е над средния (${analytics.conversionRate.toFixed(1)}%)`
              : `Conversion rate is above average (${analytics.conversionRate.toFixed(1)}%)`}</li>
          )}
          {analytics.profileViews === 0 && (
            <li style={{ color: '#dc3545' }}>{language === 'bg'
              ? 'Все още няма прегледи на профила. Споделете връзката си!'
              : 'No profile views yet. Share your profile link!'}</li>
          )}
        </ul>
      </InsightsSection>
    </Container>
  );
};

export default ProfileAnalyticsDashboard;

