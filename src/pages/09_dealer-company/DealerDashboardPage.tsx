// src/pages/09_dealer-company/DealerDashboardPage.tsx
// Dealer Dashboard Page - Complete with Widgets
// لوحة تحكم التاجر الكاملة مع Widgets

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { dealerDashboardService, DealerDashboardData } from '../../services/dealer/dealer-dashboard.service';
import {
  PerformanceOverviewWidget,
  TopListingsWidget,
  AlertsWidget,
  TasksWidget,
  InventoryWidget
} from '../../components/dealer';
import { BulkUploadModal } from '../../components/dealer/BulkUploadModal';
import { SubscriptionDashboard } from '../../components/subscription/SubscriptionDashboard';
import { Package, TrendingUp, Upload, Crown, AlertCircle } from 'lucide-react';
import { logger } from '../../services/logger-service';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';
import { subscriptionService } from '../../services/billing/subscription-service';

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

const SubscriptionStatusWidget = styled.div`
  background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
`;

const SubscriptionInfo = styled.div`
  h3 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.95rem;
  }
`;

const UpgradeButton = styled.button`
  background: white;
  color: #0066cc;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BulkUploadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const UsageBar = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
  margin-top: 12px;
`;

const UsageFill = styled.div<{ percentage: number }>`
  width: ${props => Math.min(props.percentage, 100)}%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
`;

const UsageText = styled.span`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-top: 4px;
  display: block;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const LimitWarning = styled.div<{ isWarning: boolean }>`
  background: ${props => props.isWarning ? '#fef3c7' : '#d1e7f1'};
  border: 1px solid ${props => props.isWarning ? '#f59e0b' : '#3b82f6'};
  border-left: 4px solid ${props => props.isWarning ? '#f59e0b' : '#3b82f6'};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 1rem;
  display: flex;
  gap: 12px;
  color: ${props => props.isWarning ? '#92400e' : '#1e40af'};
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
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DealerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      loadDashboardData();
      loadUserPlan();
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

  const loadUserPlan = async () => {
    try {
      const plan = await subscriptionService.getUserPlan(currentUser?.uid || '');
      setUserPlan(plan || 'free');
    } catch (err) {
      logger.error('Error loading user plan', err as Error);
      setUserPlan('free');
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = '/dealer/subscription';
  };

  const handleBulkUploadComplete = () => {
    setBulkUploadModalOpen(false);
    loadDashboardData();
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0;
    return (current / limit) * 100;
  };

  const getSubscriptionStatus = () => {
    if (userPlan === 'free') {
      return {
        name: 'Free Plan',
        color: '#6b7280',
        unlimitedListings: false
      };
    }
    const plan = SUBSCRIPTION_PLANS[userPlan as any];
    return {
      name: plan?.name || 'Free',
      color: userPlan === 'dealer' ? '#0066cc' : '#9333ea',
      unlimitedListings: plan?.maxListings === -1
    };
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

      <SubscriptionStatusWidget>
        <SubscriptionInfo>
          <h3>
            <Crown size={24} />
            {language === 'bg' ? 'Текущ план' : 'Current Plan'}
          </h3>
          <p>{getSubscriptionStatus().name}</p>
          {!getSubscriptionStatus().unlimitedListings && dashboardData && (
            <>
              <UsageBar>
                <UsageFill
                  percentage={getUsagePercentage(
                    dashboardData.stats.activeListings,
                    SUBSCRIPTION_PLANS[userPlan as any]?.features?.maxListings || 10
                  )}
                />
              </UsageBar>
              <UsageText>
                {dashboardData.stats.activeListings} / {SUBSCRIPTION_PLANS[userPlan as any]?.features?.maxListings || 10} listings
              </UsageText>
            </>
          )}
        </SubscriptionInfo>
        {userPlan === 'free' && <UpgradeButton onClick={handleUpgradeClick}>
          Upgrade Now
        </UpgradeButton>}
      </SubscriptionStatusWidget>

      {userPlan === 'free' && (
        <LimitWarning isWarning={true}>
          <AlertCircle size={20} />
          <div>
            {language === 'bg'
              ? 'Безплатен план съдържа само 10 активни обяви. Надстройте на Dealer или Enterprise за неограничени обяви.'
              : 'Free plan limited to 10 listings. Upgrade to Dealer or Enterprise for unlimited listings.'}
          </div>
        </LimitWarning>
      )}

      {userPlan === 'company' && (
        <HeaderActions>
          <BulkUploadButton onClick={() => setBulkUploadModalOpen(true)}>
            <Upload size={18} />
            {language === 'bg' ? 'Групово качване' : 'Bulk Upload'}
          </BulkUploadButton>
          <BulkUploadButton onClick={() => navigate('/dealer/bulk-review/pending')}>
            <Package size={18} />
            {language === 'bg' ? 'Табло за преглед' : 'Review Dashboard'}
          </BulkUploadButton>
        </HeaderActions>
      )}

      <StatsOverview>
        <StatCard>
          <StatIcon color="#2563EB">
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

      <SubscriptionDashboard
        onUpgrade={() => navigate('/pricing')}
        onCancel={() => subscriptionService.getPortalLink().then(url => { window.location.href = url; })}
        onManagePayment={() => subscriptionService.getPortalLink().then(url => { window.location.href = url; })}
      />

      <WidgetsGrid>
        <FullWidthWidget>
          <PerformanceOverviewWidget stats={dashboardData.stats} />
        </FullWidthWidget>

        <FullWidthWidget>
          <TopListingsWidget listings={dashboardData.topListings} />
        </FullWidthWidget>

        <AlertsWidget alerts={dashboardData.alerts} onDismiss={handleDismissAlert} />

        <FullWidthWidget>
          <TasksWidget tasks={dashboardData.tasks} onComplete={handleCompleteTask} />
        </FullWidthWidget>

        <FullWidthWidget>
          <InventoryWidget listings={dashboardData.recentListings || []} />
        </FullWidthWidget>
      </WidgetsGrid>

      <BulkUploadModal
        isOpen={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
        onUploadComplete={handleBulkUploadComplete}
      />
    </Container>
  );
};

export default DealerDashboardPage;

