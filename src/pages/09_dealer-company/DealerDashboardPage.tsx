// src/pages/09_dealer-company/DealerDashboardPage.tsx
// Dealer Dashboard Page - Complete with Widgets
// لوحة تحكم التاجر الكاملة مع Widgets

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { dealerDashboardService, DealerDashboardData } from '../../services/dealer/dealer-dashboard.service';
import {
  PerformanceOverviewWidget,
  TopListingsWidget,
  AlertsWidget,
  TasksWidget
} from '../../components/dealer';
import { Package, TrendingUp } from 'lucide-react';
import { logger } from '../../services/logger-service';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
`;

const WidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthWidget = styled.div`
  grid-column: 1 / -1;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.25rem;
  color: #7f8c8d;
`;

const ErrorContainer = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1.5rem;
  color: #c33;
  margin-bottom: 2rem;
`;

const DealerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DealerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const data = await dealerDashboardService.getDashboardData(currentUser.uid);
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Error loading dashboard data', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    // Persist dismissed alerts to localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissed-alerts') || '[]');
    if (!dismissed.includes(alertId)) {
      dismissed.push(alertId);
      localStorage.setItem('dismissed-alerts', JSON.stringify(dismissed));
    }
    // Update UI immediately
    setDashboardData(prev => prev ? {
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId)
    } : null);
  };

  const handleCompleteTask = (taskId: string) => {
    // Remove completed task from UI
    setDashboardData(prev => prev ? {
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    } : null);
    // Reload dashboard data to refresh stats
    if (currentUser?.uid) {
      setTimeout(() => loadDashboardData(), 500);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          {language === 'bg' 
            ? `Грешка при зареждане на данните: ${error}`
            : `Error loading data: ${error}`}
        </ErrorContainer>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container>
        <ErrorContainer>
          {language === 'bg' ? 'Няма данни' : 'No data available'}
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Package size={32} />
          {language === 'bg' ? 'Табло за управление' : 'Dealer Dashboard'}
        </Title>
        <Subtitle>
          {language === 'bg'
            ? 'Добре дошли обратно! Ето преглед на вашата дейност.'
            : 'Welcome back! Here\'s an overview of your activity.'}
        </Subtitle>
      </Header>

      <StatsOverview>
        <StatCard>
          <StatIcon color="#FF7900">
            <Package size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Общо обяви' : 'Total Listings'}</StatLabel>
            <StatValue>{dashboardData.stats.totalListings}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Активни' : 'Active'}</StatLabel>
            <StatValue>{dashboardData.stats.activeListings}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#3b82f6">
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Продадени' : 'Sold'}</StatLabel>
            <StatValue>{dashboardData.stats.soldListings}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <Package size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Чернови' : 'Drafts'}</StatLabel>
            <StatValue>{dashboardData.stats.draftListings}</StatValue>
          </StatContent>
        </StatCard>
      </StatsOverview>

      <WidgetsGrid>
        <FullWidthWidget>
          <PerformanceOverviewWidget stats={dashboardData.stats} />
        </FullWidthWidget>

        <FullWidthWidget>
          <TopListingsWidget listings={dashboardData.topListings} />
        </FullWidthWidget>

        <AlertsWidget alerts={dashboardData.alerts} onDismiss={handleDismissAlert} />

        <TasksWidget tasks={dashboardData.tasks} onComplete={handleCompleteTask} />
      </WidgetsGrid>
    </Container>
  );
};

export default DealerDashboardPage;
