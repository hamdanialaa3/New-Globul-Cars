/**
 * Dealer Analytics Dashboard
 * Professional dashboard for car dealers
 * 
 * File: src/components/dealer/DealerAnalyticsDashboard.tsx
 * Created: January 8, 2026
 * Based on: AutoScout24, AutoTrader UK dealer dashboards
 */

import React, { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Eye, Phone, MessageCircle, Star, TrendingUp, TrendingDown,
  Car, DollarSign, Clock, Users, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Calendar, ChevronRight,
  Lightbulb, AlertCircle, CheckCircle, RefreshCw, Target,
  Award, Zap, Crown, Activity, Trophy
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.9; }
`;

const slideInRight = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// ==================== STYLED COMPONENTS ====================

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  background: var(--bg-card);
  padding: 0.35rem;
  border-radius: 12px;
  border: 2px solid var(--border-primary);
`;

const PeriodButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${p => p.$active ? css`
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  ` : css`
    background: transparent;
    color: var(--text-secondary);
    
    &:hover {
      color: var(--text-primary);
      background: var(--bg-secondary);
    }
  `}
`;

// ==================== STATS GRID ====================

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $delay?: number }>`
  background: var(--bg-card);
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid var(--border-primary);
  animation: ${fadeIn} 0.6s ease-out ${p => (p.$delay || 0) * 0.1}s both;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-primary);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const StatTrend = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${p => p.$positive 
    ? 'rgba(16, 185, 129, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)'
  };
  color: ${p => p.$positive ? '#10b981' : '#ef4444'};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

// ==================== MAIN GRID ====================

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== TOP LISTINGS ====================

const Card = styled.div<{ $delay?: number }>`
  background: var(--bg-card);
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid var(--border-primary);
  animation: ${fadeIn} 0.6s ease-out ${p => (p.$delay || 0) * 0.1}s both;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--accent-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const ListingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListingItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(102, 126, 234, 0.08);
    transform: translateX(5px);
  }
`;

const ListingImage = styled.div<{ $bgUrl?: string }>`
  width: 80px;
  height: 60px;
  border-radius: 10px;
  background: ${p => p.$bgUrl 
    ? `url(${p.$bgUrl}) center/cover`
    : 'var(--bg-tertiary)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: var(--text-muted);
  }
`;

const ListingInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListingTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListingMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const ListingMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ListingPrice = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--accent-primary);
  text-align: right;
`;

// ==================== RECOMMENDATIONS ====================

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RecommendationItem = styled.div<{ $type: 'success' | 'warning' | 'info' }>`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 14px;
  background: ${p => p.$type === 'success'
    ? 'rgba(16, 185, 129, 0.1)'
    : p.$type === 'warning'
    ? 'rgba(245, 158, 11, 0.1)'
    : 'rgba(102, 126, 234, 0.1)'
  };
  border-left: 4px solid ${p => p.$type === 'success'
    ? '#10b981'
    : p.$type === 'warning'
    ? '#f59e0b'
    : 'var(--accent-primary)'
  };
  animation: ${slideInRight} 0.5s ease-out;
`;

const RecommendationIcon = styled.div<{ $type: 'success' | 'warning' | 'info' }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${p => p.$type === 'success'
    ? '#10b981'
    : p.$type === 'warning'
    ? '#f59e0b'
    : 'var(--accent-primary)'
  };
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const RecommendationContent = styled.div`
  flex: 1;
`;

const RecommendationTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const RecommendationDesc = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

// ==================== PERFORMANCE CHART (Simple) ====================

const ChartContainer = styled.div`
  margin-bottom: 2rem;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  height: 200px;
  align-items: flex-end;
  padding: 1rem 0;
`;

const ChartBar = styled.div<{ $height: number; $color: string }>`
  height: ${p => p.$height}%;
  background: ${p => p.$color};
  border-radius: 8px 8px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-5px);
    
    &::before {
      opacity: 1;
    }
  }
  
  &::before {
    content: attr(data-value);
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s ease;
    box-shadow: var(--shadow-md);
    white-space: nowrap;
  }
`;

const ChartLabels = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  text-align: center;
`;

const ChartLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

// ==================== QUICK ACTIONS ====================

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const QuickActionButton = styled.button<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${p => p.$color};
    transform: translateY(-5px);
    box-shadow: 0 10px 30px ${p => p.$color}30;
    
    .icon-container {
      background: ${p => p.$color};
      transform: scale(1.1);
    }
  }
`;

const QuickActionIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: ${p => p.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${p => p.$color};
  }
`;

const QuickActionLabel = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  text-align: center;
`;

// ==================== TYPES ====================

interface DashboardStats {
  views: { value: number; change: number };
  calls: { value: number; change: number };
  messages: { value: number; change: number };
  rating: { value: number; change: number };
}

interface TopListing {
  id: string;
  title: string;
  price: number;
  views: number;
  inquiries: number;
  image?: string;
}

interface Recommendation {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: { bg: string; en: string };
  description: { bg: string; en: string };
  icon: React.ReactNode;
}

// ==================== MAIN COMPONENT ====================

export const DealerAnalyticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const t = {
    bg: {
      title: '📊 Лоуча на Търговеца',
      subtitle: 'Добре дошъл обратно! Ето как се представя бизнесът ти.',
      week: 'Седмица',
      month: 'Месец',
      year: 'Година',
      views: 'Показвания',
      calls: 'Обаждания',
      messages: 'Съобщения',
      rating: 'Рейтинг',
      topListings: '🏆 Топ Обяви',
      viewAll: 'Виж всички',
      recommendations: '💡 Препоръки',
      weeklyPerformance: '📈 Седмична Активност',
      quickActions: '⚡ Бързи Действия',
      addListing: 'Добави обява',
      bulkUpload: 'Масово качване',
      promotions: 'Промоции',
      analytics: 'Пълна аналитика',
      inquiries: 'запитвания'
    },
    en: {
      title: '📊 Dealer Dashboard',
      subtitle: "Welcome back! Here's how your business is performing.",
      week: 'Week',
      month: 'Month',
      year: 'Year',
      views: 'Views',
      calls: 'Calls',
      messages: 'Messages',
      rating: 'Rating',
      topListings: '🏆 Top Listings',
      viewAll: 'View all',
      recommendations: '💡 Recommendations',
      weeklyPerformance: '📈 Weekly Performance',
      quickActions: '⚡ Quick Actions',
      addListing: 'Add listing',
      bulkUpload: 'Bulk upload',
      promotions: 'Promotions',
      analytics: 'Full analytics',
      inquiries: 'inquiries'
    }
  };
  
  const text = t[language] || t.en;

  const stats: DashboardStats = {
    views: { value: 1247, change: 23 },
    calls: { value: 34, change: 12 },
    messages: { value: 89, change: 45 },
    rating: { value: 4.8, change: 0.2 }
  };

  const topListings: TopListing[] = [
    { id: '1', title: 'BMW X5 2023 xDrive40i', price: 45000, views: 234, inquiries: 12 },
    { id: '2', title: 'Audi A4 Avant 2022', price: 32000, views: 189, inquiries: 8 },
    { id: '3', title: 'Mercedes C-Class 2021', price: 38000, views: 156, inquiries: 6 },
    { id: '4', title: 'VW Golf GTI 2022', price: 28000, views: 142, inquiries: 5 }
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'warning',
      title: { bg: 'Добави снимки отвътре', en: 'Add interior photos' },
      description: { 
        bg: '3 от твоите обяви нямат снимки на интериора. Обявите с интериорни снимки получават 35% повече показвания.',
        en: '3 of your listings are missing interior photos. Listings with interior photos get 35% more views.'
      },
      icon: <AlertCircle />
    },
    {
      id: '2',
      type: 'info',
      title: { bg: 'Отговаряй по-бързо', en: 'Respond faster' },
      description: {
        bg: 'Средното ти време за отговор е 4 часа. Намали го под 1 час за 50% повече продажби.',
        en: 'Your average response time is 4 hours. Reduce it to under 1 hour for 50% more sales.'
      },
      icon: <Clock />
    },
    {
      id: '3',
      type: 'success',
      title: { bg: 'Отлична седмица!', en: 'Great week!' },
      description: {
        bg: 'Твоите показвания са с 23% повече от миналата седмица. Продължавай така!',
        en: 'Your views are up 23% from last week. Keep it up!'
      },
      icon: <CheckCircle />
    }
  ];

  const weeklyData = [
    { day: language === 'bg' ? 'Пон' : 'Mon', views: 150, color: 'var(--accent-primary)' },
    { day: language === 'bg' ? 'Вто' : 'Tue', views: 180, color: 'var(--accent-primary)' },
    { day: language === 'bg' ? 'Сря' : 'Wed', views: 220, color: 'var(--accent-primary)' },
    { day: language === 'bg' ? 'Чет' : 'Thu', views: 190, color: 'var(--accent-primary)' },
    { day: language === 'bg' ? 'Пет' : 'Fri', views: 250, color: '#10b981' },
    { day: language === 'bg' ? 'Съб' : 'Sat', views: 310, color: '#10b981' },
    { day: language === 'bg' ? 'Нед' : 'Sun', views: 280, color: '#10b981' }
  ];

  const maxViews = Math.max(...weeklyData.map(d => d.views));

  return (
    <DashboardContainer>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>{text.title}</Title>
          <Subtitle>{text.subtitle}</Subtitle>
        </HeaderLeft>
        <PeriodSelector>
          <PeriodButton 
            $active={period === 'week'} 
            onClick={() => setPeriod('week')}
          >
            {text.week}
          </PeriodButton>
          <PeriodButton 
            $active={period === 'month'} 
            onClick={() => setPeriod('month')}
          >
            {text.month}
          </PeriodButton>
          <PeriodButton 
            $active={period === 'year'} 
            onClick={() => setPeriod('year')}
          >
            {text.year}
          </PeriodButton>
        </PeriodSelector>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard $delay={1}>
          <StatHeader>
            <StatIcon $color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <Eye />
            </StatIcon>
            <StatTrend $positive={stats.views.change > 0}>
              {stats.views.change > 0 ? <ArrowUpRight /> : <ArrowDownRight />}
              {Math.abs(stats.views.change)}%
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.views.value.toLocaleString()}</StatValue>
          <StatLabel>{text.views}</StatLabel>
        </StatCard>

        <StatCard $delay={2}>
          <StatHeader>
            <StatIcon $color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <Phone />
            </StatIcon>
            <StatTrend $positive={stats.calls.change > 0}>
              {stats.calls.change > 0 ? <ArrowUpRight /> : <ArrowDownRight />}
              {Math.abs(stats.calls.change)}%
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.calls.value}</StatValue>
          <StatLabel>{text.calls}</StatLabel>
        </StatCard>

        <StatCard $delay={3}>
          <StatHeader>
            <StatIcon $color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <MessageCircle />
            </StatIcon>
            <StatTrend $positive={stats.messages.change > 0}>
              {stats.messages.change > 0 ? <ArrowUpRight /> : <ArrowDownRight />}
              {Math.abs(stats.messages.change)}%
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.messages.value}</StatValue>
          <StatLabel>{text.messages}</StatLabel>
        </StatCard>

        <StatCard $delay={4}>
          <StatHeader>
            <StatIcon $color="linear-gradient(135deg, #ec4899 0%, #db2777 100%)">
              <Star />
            </StatIcon>
            <StatTrend $positive={stats.rating.change > 0}>
              {stats.rating.change > 0 ? <ArrowUpRight /> : <ArrowDownRight />}
              +{stats.rating.change}
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.rating.value}</StatValue>
          <StatLabel>{text.rating}</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Weekly Performance Chart */}
      <Card $delay={5} style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle>
            <Activity size={20} />
            {text.weeklyPerformance}
          </CardTitle>
        </CardHeader>
        <ChartContainer>
          <ChartGrid>
            {weeklyData.map((day, i) => (
              <ChartBar
                key={i}
                $height={(day.views / maxViews) * 100}
                $color={day.color}
                data-value={day.views}
              />
            ))}
          </ChartGrid>
          <ChartLabels>
            {weeklyData.map((day, i) => (
              <ChartLabel key={i}>{day.day}</ChartLabel>
            ))}
          </ChartLabels>
        </ChartContainer>
      </Card>

      {/* Main Grid */}
      <MainGrid>
        {/* Top Listings */}
        <Card $delay={6}>
          <CardHeader>
            <CardTitle>
              <Trophy size={20} />
              {text.topListings}
            </CardTitle>
            <ViewAllButton>
              {text.viewAll}
              <ChevronRight size={16} />
            </ViewAllButton>
          </CardHeader>
          <ListingsList>
            {topListings.map(listing => (
              <ListingItem key={listing.id}>
                <ListingImage>
                  <Car size={24} />
                </ListingImage>
                <ListingInfo>
                  <ListingTitle>{listing.title}</ListingTitle>
                  <ListingMeta>
                    <ListingMetaItem>
                      <Eye /> {listing.views}
                    </ListingMetaItem>
                    <ListingMetaItem>
                      <MessageCircle /> {listing.inquiries} {text.inquiries}
                    </ListingMetaItem>
                  </ListingMeta>
                </ListingInfo>
                <ListingPrice>{listing.price.toLocaleString()}€</ListingPrice>
              </ListingItem>
            ))}
          </ListingsList>
        </Card>

        {/* Recommendations */}
        <Card $delay={7}>
          <CardHeader>
            <CardTitle>
              <Lightbulb size={20} />
              {text.recommendations}
            </CardTitle>
          </CardHeader>
          <RecommendationsList>
            {recommendations.map(rec => (
              <RecommendationItem key={rec.id} $type={rec.type}>
                <RecommendationIcon $type={rec.type}>
                  {rec.icon}
                </RecommendationIcon>
                <RecommendationContent>
                  <RecommendationTitle>{rec.title[language]}</RecommendationTitle>
                  <RecommendationDesc>{rec.description[language]}</RecommendationDesc>
                </RecommendationContent>
              </RecommendationItem>
            ))}
          </RecommendationsList>
        </Card>
      </MainGrid>

      {/* Quick Actions */}
      <Card $delay={8}>
        <CardHeader>
          <CardTitle>
            <Zap size={20} />
            {text.quickActions}
          </CardTitle>
        </CardHeader>
        <QuickActionsGrid>
          <QuickActionButton $color="#667eea">
            <QuickActionIcon className="icon-container" $color="#667eea">
              <Car />
            </QuickActionIcon>
            <QuickActionLabel>{text.addListing}</QuickActionLabel>
          </QuickActionButton>
          <QuickActionButton $color="#10b981">
            <QuickActionIcon className="icon-container" $color="#10b981">
              <RefreshCw />
            </QuickActionIcon>
            <QuickActionLabel>{text.bulkUpload}</QuickActionLabel>
          </QuickActionButton>
          <QuickActionButton $color="#f59e0b">
            <QuickActionIcon className="icon-container" $color="#f59e0b">
              <Crown />
            </QuickActionIcon>
            <QuickActionLabel>{text.promotions}</QuickActionLabel>
          </QuickActionButton>
          <QuickActionButton $color="#8b5cf6">
            <QuickActionIcon className="icon-container" $color="#8b5cf6">
              <BarChart3 />
            </QuickActionIcon>
            <QuickActionLabel>{text.analytics}</QuickActionLabel>
          </QuickActionButton>
        </QuickActionsGrid>
      </Card>
    </DashboardContainer>
  );
};

export default DealerAnalyticsDashboard;
