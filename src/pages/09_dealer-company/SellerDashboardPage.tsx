/**
 * Seller Dashboard Page
 * Seller control panel - stats, alerts and tasks
 * 
 * Features:
 * - Dashboard statistics (listings, views, messages)
 * - Real-time alerts (missing images, low price, etc)
 * - Task management
 * - Response metrics
 * - Action items
 * 
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, AlertCircle, CheckCircle, Clock, 
  Eye, MessageSquare, DollarSign, Image as ImageIcon,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { dealerDashboardService } from '@/services/dealer/dealer-dashboard.service';
import { serviceLogger } from '@/services/logger-service';

// ==================== TYPES ====================

interface DashboardStats {
  activeListings: number;
  totalViews: number;
  totalMessages: number;
  avgResponseTime: number;
  responseRate: number;
}

interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DashboardTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

// ==================== STYLES ====================

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  margin-bottom: 16px;

  svg {
    stroke-width: 2;
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionContainer = styled.div`
  margin-bottom: 40px;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertCard = styled.div<{ $type: 'warning' | 'error' | 'info' }>`
  background: white;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const AlertIcon = styled.div<{ $type: 'warning' | 'error' | 'info' }>`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$type) {
      case 'error': return '#ef444415';
      case 'warning': return '#f59e0b15';
      case 'info': return '#3b82f615';
      default: return '#6b728015';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 14px;
`;

const AlertMessage = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const AlertAction = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TaskCard = styled.div<{ $priority: 'high' | 'medium' | 'low'; $completed: boolean }>`
  background: white;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid ${props => {
    switch (props.$priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }};
  opacity: ${props => props.$completed ? 0.6 : 1};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const TaskCheckbox = styled.input`
  margin-right: 12px;
  cursor: pointer;
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const TaskTitle = styled.div`
  font-weight: 700;
  color: #1f2937;
  font-size: 14px;
`;

const TaskDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-left: 28px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 12px;
  height: 100px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// ==================== MAIN COMPONENT ====================

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = React.useState<DashboardAlert[]>([]);
  const [tasks, setTasks] = React.useState<DashboardTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!user?.uid) return;

        // Load stats
        const statsData = await dealerDashboardService.getStats(user.uid);
        setStats(statsData);

        // Load alerts
        const alertsData = await dealerDashboardService.getAlerts(user.uid);
        const formattedAlerts: DashboardAlert[] = alertsData.map((alert: any) => ({
          id: alert.id || Math.random().toString(),
          type: (alert.severity || 'info') as 'warning' | 'error' | 'info',
          title: language === 'bg' ? alert.titleBg : alert.titleEn,
          message: language === 'bg' ? alert.messageBg : alert.messageEn,
        }));
        setAlerts(formattedAlerts);

        // Load tasks
        const tasksData = await dealerDashboardService.getTasks(user.uid);
        setTasks(tasksData || []);
      } catch (error) {
        // Show error state instead of silently falling back to mock data
        serviceLogger.error('SellerDashboard', 'Failed to load dashboard data', error);
        setStats({
          activeListings: 0,
          totalViews: 0,
          totalMessages: 0,
          avgResponseTime: 0,
          responseRate: 0
        });
        setAlerts([{
          id: 'load-error',
          type: 'error' as const,
          title: language === 'bg' ? 'Грешка при зареждане' : 'Loading Error',
          message: language === 'bg'
            ? 'Не успяхме да заредим данните. Моля, опитайте отново по-късно.'
            : 'Failed to load dashboard data. Please try again later.',
        }]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, language]);

  const labels = {
    bg: {
      title: 'Кабинет за продавачи',
      subtitle: 'Управляйте списъците, преглеждайте статистиката и отговаряйте на съобщения',
      stats: {
        listings: 'Активни списъци',
        views: 'Общо преглеждания',
        messages: 'Съобщения',
        responseTime: 'Средно време на отговор',
        responseRate: 'Процент на отговор'
      },
      alerts: 'Важни уведомления',
      tasks: 'Действия по списъците',
      noAlerts: 'Няма уведомления',
      noTasks: 'Всички действия са завършени'
    },
    en: {
      title: 'Seller Dashboard',
      subtitle: 'Manage your listings, view statistics, and respond to messages',
      stats: {
        listings: 'Active Listings',
        views: 'Total Views',
        messages: 'Messages',
        responseTime: 'Avg Response Time',
        responseRate: 'Response Rate'
      },
      alerts: 'Important Alerts',
      tasks: 'Action Items',
      noAlerts: 'No alerts',
      noTasks: 'All tasks completed'
    }
  };

  const text = language === 'bg' ? labels.bg : labels.en;

  if (!user) {
    return <Container>Please log in</Container>;
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>{text.title}</Title>
        <Subtitle>{text.subtitle}</Subtitle>
      </Header>

      {/* Statistics Cards */}
      <GridContainer>
        {loading ? (
          <>
            <LoadingSkeletons count={5} />
          </>
        ) : stats ? (
          <>
            <StatCard>
              <StatIcon $color="#3b82f6">
                <MessageSquare size={24} />
              </StatIcon>
              <StatValue>{stats.activeListings}</StatValue>
              <StatLabel>{text.stats.listings}</StatLabel>
            </StatCard>

            <StatCard>
              <StatIcon $color="#8b5cf6">
                <Eye size={24} />
              </StatIcon>
              <StatValue>{stats.totalViews.toLocaleString()}</StatValue>
              <StatLabel>{text.stats.views}</StatLabel>
              <StatChange $positive={true}>
                <ArrowUpRight />
                +12% {language === 'bg' ? 'тази седмица' : 'this week'}
              </StatChange>
            </StatCard>

            <StatCard>
              <StatIcon $color="#ec4899">
                <MessageSquare size={24} />
              </StatIcon>
              <StatValue>{stats.totalMessages}</StatValue>
              <StatLabel>{text.stats.messages}</StatLabel>
            </StatCard>

            <StatCard>
              <StatIcon $color="#f59e0b">
                <Clock size={24} />
              </StatIcon>
              <StatValue>{stats.avgResponseTime}h</StatValue>
              <StatLabel>{text.stats.responseTime}</StatLabel>
              <StatChange $positive={true}>
                <ArrowDownRight />
                -2h {language === 'bg' ? 'от средното' : 'vs avg'}
              </StatChange>
            </StatCard>

            <StatCard>
              <StatIcon $color="#10b981">
                <TrendingUp size={24} />
              </StatIcon>
              <StatValue>{stats.responseRate}%</StatValue>
              <StatLabel>{text.stats.responseRate}</StatLabel>
              <StatChange $positive={stats.responseRate > 80}>
                <ArrowUpRight />
                {stats.responseRate > 80 ? '+' : ''}{stats.responseRate - 85}%
              </StatChange>
            </StatCard>
          </>
        ) : null}
      </GridContainer>

      {/* Alerts Section */}
      <SectionContainer>
        <SectionTitle>
          <AlertCircle size={20} />
          {text.alerts}
        </SectionTitle>
        <AlertsList>
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <AlertCard key={alert.id} $type={alert.type}>
                <AlertIcon $type={alert.type}>
                  {alert.type === 'error' && <AlertCircle size={20} />}
                  {alert.type === 'warning' && <AlertCircle size={20} />}
                  {alert.type === 'info' && <AlertCircle size={20} />}
                </AlertIcon>
                <AlertContent>
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertMessage>{alert.message}</AlertMessage>
                </AlertContent>
                {alert.action && (
                  <AlertAction onClick={alert.action.onClick}>
                    {alert.action.label}
                  </AlertAction>
                )}
              </AlertCard>
            ))
          ) : (
            <EmptyState>
              <CheckCircle />
              <div>{text.noAlerts}</div>
            </EmptyState>
          )}
        </AlertsList>
      </SectionContainer>

      {/* Tasks Section */}
      <SectionContainer>
        <SectionTitle>
          <CheckCircle size={20} />
          {text.tasks}
        </SectionTitle>
        <TasksList>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} $priority={task.priority} $completed={task.completed}>
                <TaskHeader>
                  <TaskCheckbox type="checkbox" defaultChecked={task.completed} />
                  <TaskTitle>{task.title}</TaskTitle>
                </TaskHeader>
                <TaskDescription>{task.description}</TaskDescription>
              </TaskCard>
            ))
          ) : (
            <EmptyState>
              <CheckCircle />
              <div>{text.noTasks}</div>
            </EmptyState>
          )}
        </TasksList>
      </SectionContainer>
    </Container>
  );
};

// Helper component for loading skeletons
const LoadingSkeletons: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, idx) => (
      <LoadingSkeletonWrapper key={idx}>
        <LoadingSkeletonContent />
      </LoadingSkeletonWrapper>
    ))}
  </>
);

const LoadingSkeletonWrapper = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const LoadingSkeletonContent = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  height: 100px;
  border-radius: 8px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export default SellerDashboardPage;
