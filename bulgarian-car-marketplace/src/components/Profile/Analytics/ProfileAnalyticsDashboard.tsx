// src/components/Profile/Analytics/ProfileAnalyticsDashboard.tsx
// Profile Analytics Dashboard Component
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  Heart,
  Users,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
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
`;

const ChartTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #495057;
`;

const SimpleBarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
  padding: 16px;
  background: white;
  border-radius: 8px;
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
  }
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
`;

interface ProfileAnalyticsDashboardProps {
  userId: string;
}

export const ProfileAnalyticsDashboard: React.FC<ProfileAnalyticsDashboardProps> = ({ userId }) => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    uniqueVisitors: 0,
    carViews: 0,
    inquiries: 0,
    favorites: 0,
    followers: 0,
    responseTime: 0,
    conversionRate: 0
  });
  const [viewsByDay, setViewsByDay] = useState<Record<string, number>>({});

  useEffect(() => {
    loadAnalytics();
  }, [userId, period]);

  const loadAnalytics = async () => {
    // TODO: Implement real analytics loading
    // For now, using mock data
    setAnalytics({
      profileViews: 1234,
      uniqueVisitors: 892,
      carViews: 4567,
      inquiries: 145,
      favorites: 234,
      followers: 89,
      responseTime: 2.5,
      conversionRate: 3.2
    });

    setViewsByDay({
      'Mon': 45,
      'Tue': 62,
      'Wed': 38,
      'Thu': 71,
      'Fri': 55,
      'Sat': 40,
      'Sun': 33
    });
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
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
    return Math.max(...Object.values(viewsByDay));
  };

  return (
    <Container>
      <Header>
        <h2>
          <BarChart3 size={28} color="#FF7900" />
          {t('title')}
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
          <StatChange $positive={true}>+12.5%</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon $color="#0d6efd">
            <Users size={24} />
          </StatIcon>
          <StatValue>{analytics.uniqueVisitors.toLocaleString()}</StatValue>
          <StatLabel>{t('uniqueVisitors')}</StatLabel>
          <StatChange $positive={true}>+8.3%</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon $color="#198754">
            <MessageCircle size={24} />
          </StatIcon>
          <StatValue>{analytics.inquiries}</StatValue>
          <StatLabel>{t('inquiries')}</StatLabel>
          <StatChange $positive={true}>+15.7%</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon $color="#dc3545">
            <Heart size={24} />
          </StatIcon>
          <StatValue>{analytics.favorites}</StatValue>
          <StatLabel>{t('favorites')}</StatLabel>
          <StatChange $positive={false}>-2.1%</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon $color="#6f42c1">
            <TrendingUp size={24} />
          </StatIcon>
          <StatValue>{analytics.conversionRate}%</StatValue>
          <StatLabel>{t('conversionRate')}</StatLabel>
          <StatChange $positive={true}>+5.2%</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon $color="#fd7e14">
            <Clock size={24} />
          </StatIcon>
          <StatValue>{analytics.responseTime}h</StatValue>
          <StatLabel>{t('responseTime')}</StatLabel>
          <StatChange $positive={true}>-1.2h</StatChange>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <ChartTitle>{t('viewsOverTime')}</ChartTitle>
        <SimpleBarChart>
          {Object.entries(viewsByDay).map(([day, value]) => (
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

      <InsightsSection>
        <h4>
          <Activity size={20} />
          {t('insights')}
        </h4>
        <ul>
          <li>{language === 'bg' 
            ? 'Профилът ви получава най-много прегледи в петък' 
            : 'Your profile gets most views on Friday'}</li>
          <li>{language === 'bg'
            ? 'Времето за отговор е подобрено с 30% този месец'
            : 'Response time improved by 30% this month'}</li>
          <li>{language === 'bg'
            ? 'Добавете повече снимки към профила за повече ангажираност'
            : 'Add more photos to your profile for higher engagement'}</li>
          <li>{language === 'bg'
            ? 'Процентът на конверсия е над средния (2.1%)'
            : 'Conversion rate is above average (2.1%)'}</li>
        </ul>
      </InsightsSection>
    </Container>
  );
};

export default ProfileAnalyticsDashboard;

