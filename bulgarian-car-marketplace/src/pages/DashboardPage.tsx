import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthProvider';
import { dashboardService, DashboardStats, DashboardCar, DashboardMessage, DashboardNotification } from '../services/dashboardService';

// Modern Dark Glass Color Palette
const colors = {
  primary: {
    blue: '#00D4FF',
    blueMedium: '#0099CC',
    blueDark: '#006699',
    blueDeep: '#003D66',
  },
  neutral: {
    black: '#000000',
    blackLight: '#0A0A0A',
    blackMedium: '#1A1A1A',
    blackSoft: '#2A2A2A',
    gray: '#404040',
    grayLight: '#666666',
    grayLighter: '#999999',
    white: '#FFFFFF',
  },
  glass: {
    dark: 'rgba(0, 0, 0, 0.8)',
    medium: 'rgba(0, 0, 0, 0.6)',
    light: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    highlight: 'rgba(0, 212, 255, 0.1)',
  },
  accent: {
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF4444',
    info: '#00D4FF',
  }
};

// Modern Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
`;


const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Main Container - Enhanced Dark Glass Theme
const DashboardContainer = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 25%, #2A2A2A 50%, #1A1A1A 75%, #0A0A0A 100%),
    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.04) 0%, transparent 60%),
    radial-gradient(circle at 40% 40%, rgba(0, 212, 255, 0.02) 0%, transparent 60%);
  position: relative;
  overflow-x: hidden;
  padding: 1.5rem 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.015) 50%, transparent 70%);
    animation: ${shimmer} 4s ease-in-out infinite;
    pointer-events: none;
  }
`;

// Header Section - Enhanced Glass Effect
const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  background: ${colors.glass.dark};
  backdrop-filter: blur(25px);
  border: 1px solid ${colors.glass.border};
  border-radius: 32px;
  padding: 2.5rem 2rem;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.08;
    pointer-events: none;
  }

  h1 {
    font-size: 2.2rem;
    font-weight: 600;
    background: linear-gradient(135deg, ${colors.neutral.white}, ${colors.primary.blue});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.75rem;
    text-shadow: 0 2px 12px rgba(0, 212, 255, 0.2);
    position: relative;
    z-index: 1;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 1rem;
    color: ${colors.neutral.grayLighter};
    opacity: 0.85;
    max-width: 550px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    line-height: 1.5;
  }
`;

// Container
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.25rem;
`;

// Stats Grid - Enhanced
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

// Stat Card - Enhanced Glass Effect
const StatCard = styled.div`
  background: ${colors.glass.medium};
  backdrop-filter: blur(30px);
  border: 1px solid ${colors.glass.border};
  border-radius: 28px;
  padding: 2.25rem 2rem;
  animation: ${fadeIn} 1s ease-out;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.04;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 48px rgba(0, 212, 255, 0.15);
    border-color: ${colors.primary.blue};
    animation: ${glow} 2s ease-in-out infinite;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${colors.primary.blue}, ${colors.primary.blueDark});
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    font-size: 1.4rem;
    box-shadow: 0 6px 16px rgba(0, 212, 255, 0.25);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .stat-value {
    font-size: 2.2rem;
    font-weight: 600;
    color: ${colors.primary.blue};
    margin-bottom: 0.4rem;
    text-shadow: 0 1px 8px rgba(0, 212, 255, 0.2);
    position: relative;
    z-index: 1;
    letter-spacing: -0.01em;
  }

  .stat-label {
    font-size: 0.95rem;
    color: ${colors.neutral.grayLighter};
    opacity: 0.85;
    margin-bottom: 0.4rem;
    position: relative;
    z-index: 1;
    line-height: 1.4;
  }

  .stat-change {
    font-size: 0.85rem;
    font-weight: 500;
    position: relative;
    z-index: 1;

    &.positive {
      color: ${colors.accent.success};
      text-shadow: 0 1px 6px rgba(0, 255, 136, 0.2);
    }

    &.negative {
      color: ${colors.accent.error};
      text-shadow: 0 1px 6px rgba(255, 68, 68, 0.2);
    }

    &.warning {
      color: ${colors.accent.warning};
      text-shadow: 0 1px 6px rgba(255, 184, 0, 0.2);
    }

    &.info {
      color: ${colors.accent.info};
      text-shadow: 0 1px 6px rgba(0, 212, 255, 0.2);
    }
  }
`;

// Content Grid - Enhanced
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
`;

// Main Content
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
`;

// Sidebar
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
`;

// Content Card - Enhanced Glass Effect
const ContentCard = styled.div`
  background: ${colors.glass.medium};
  backdrop-filter: blur(30px);
  border: 1px solid ${colors.glass.border};
  border-radius: 28px;
  padding: 2.25rem 2rem;
  animation: ${slideIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 212, 255, 0.08);
    border-color: ${colors.primary.blue};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.025;
    pointer-events: none;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: ${colors.primary.blue};
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-shadow: 0 1px 6px rgba(0, 212, 255, 0.2);
    position: relative;
    z-index: 1;
    letter-spacing: -0.01em;

    &::before {
      content: '';
      width: 3px;
      height: 20px;
      background: linear-gradient(135deg, ${colors.primary.blue}, ${colors.primary.blueDark});
      border-radius: 2px;
      box-shadow: 0 1px 6px rgba(0, 212, 255, 0.2);
    }
  }
`;

// Car List
const CarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: ${colors.glass.light};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.015;
    pointer-events: none;
  }

  &:hover {
    background: ${colors.glass.medium};
    transform: translateX(6px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.08);
    border-color: ${colors.primary.blue};
  }

  .car-image {
    width: 72px;
    height: 54px;
    background: linear-gradient(135deg, ${colors.neutral.gray}, ${colors.neutral.blackSoft});
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.neutral.white};
    font-size: 0.75rem;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .car-info {
    flex: 1;
    position: relative;
    z-index: 1;

    .car-title {
      font-weight: 600;
      color: ${colors.neutral.white};
      margin-bottom: 0.2rem;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
      font-size: 0.95rem;
    }

    .car-details {
      font-size: 0.85rem;
      color: ${colors.neutral.grayLighter};
      line-height: 1.4;
    }
  }

  .car-status {
    padding: 0.4rem 0.9rem;
    border-radius: 24px;
    font-size: 0.75rem;
    font-weight: 500;
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &.active {
      background: rgba(0, 255, 136, 0.15);
      color: ${colors.accent.success};
      border: 1px solid rgba(0, 255, 136, 0.25);
      box-shadow: 0 2px 8px rgba(0, 255, 136, 0.15);
    }

    &.pending {
      background: rgba(255, 184, 0, 0.15);
      color: ${colors.accent.warning};
      border: 1px solid rgba(255, 184, 0, 0.25);
      box-shadow: 0 2px 8px rgba(255, 184, 0, 0.15);
    }

    &.sold {
      background: rgba(255, 68, 68, 0.15);
      color: ${colors.accent.error};
      border: 1px solid rgba(255, 68, 68, 0.25);
      box-shadow: 0 2px 8px rgba(255, 68, 68, 0.15);
    }
  }
`;

// Message List
const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageItem = styled.div`
  padding: 1.25rem;
  background: ${colors.glass.light};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  border-left: 3px solid ${colors.primary.blue};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.015;
    pointer-events: none;
  }

  &:hover {
    background: ${colors.glass.medium};
    transform: translateX(6px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.08);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
    position: relative;
    z-index: 1;

    .sender {
      font-weight: 600;
      color: ${colors.neutral.white};
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
      font-size: 0.9rem;
    }

    .time {
      font-size: 0.75rem;
      color: ${colors.neutral.grayLighter};
    }
  }

  .message-preview {
    color: ${colors.neutral.grayLighter};
    font-size: 0.85rem;
    line-height: 1.4;
    position: relative;
    z-index: 1;
  }
`;

// Notification List
const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationItem = styled.div`
  padding: 1.25rem;
  background: ${colors.glass.light};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  border-left: 3px solid ${colors.accent.info};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.015;
    pointer-events: none;
  }

  &:hover {
    background: ${colors.glass.medium};
    transform: translateX(6px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.08);
  }

  .notification-content {
    color: ${colors.neutral.white};
    margin-bottom: 0.4rem;
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .notification-time {
    font-size: 0.75rem;
    color: ${colors.neutral.grayLighter};
    position: relative;
    z-index: 1;
  }
`;

// Action Button - Enhanced Glass Effect
const ActionButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, ${colors.primary.blue}, ${colors.primary.blueDark});
  color: ${colors.neutral.white};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  box-shadow: 0 3px 12px rgba(0, 212, 255, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.25);
    animation: ${glow} 1.5s ease-in-out infinite;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
  
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Quick Actions - Enhanced
const QuickActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Real data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCars, setRecentCars] = useState<DashboardCar[]>([]);
  const [recentMessages, setRecentMessages] = useState<DashboardMessage[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    if (!user?.uid) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load initial data
        const [statsData, carsData, messagesData, notificationsData] = await Promise.all([
          dashboardService.getDashboardStats(user.uid),
          dashboardService.getRecentCars(user.uid, 5),
          dashboardService.getRecentMessages(user.uid, 5),
          dashboardService.getNotifications(user.uid, 5)
        ]);

        setStats(statsData);
        setRecentCars(carsData);
        setRecentMessages(messagesData);
        setNotifications(notificationsData);

        // Subscribe to real-time updates
        const unsubscribe = dashboardService.subscribeToDashboardUpdates(
          user.uid,
          setStats,
          setRecentCars,
          setRecentMessages,
          setNotifications
        );

        return unsubscribe;
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    let unsubscribe: (() => void) | undefined;
    loadDashboardData().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  // Format stats for display
  const formattedStats = stats ? [
    {
      icon: '🚗',
      value: stats.activeListings.toString(),
      label: t('dashboard.stats.listingsOnline'),
      change: `+${stats.weeklyViews} ${t('dashboard.stats.thisWeek')}`,
      changeType: 'positive' as const
    },
    {
      icon: '👁️',
      value: stats.totalViews.toLocaleString(),
      label: t('dashboard.stats.views'),
      change: `+${stats.weeklyViews} ${t('dashboard.stats.lastWeek')}`,
      changeType: 'positive' as const
    },
    {
      icon: '💬',
      value: recentMessages.length.toString(),
      label: t('dashboard.stats.newInquiries'),
      change: `${recentMessages.filter(m => !m.isRead).length} ${t('dashboard.stats.unread')}`,
      changeType: recentMessages.filter(m => !m.isRead).length > 0 ? 'warning' as const : 'info' as const
    },
    {
      icon: '💰',
      value: `€${stats.potentialSales.toLocaleString()}`,
      label: t('dashboard.stats.potentialSales'),
      change: t('dashboard.stats.basedOnInquiries'),
      changeType: 'info' as const
    }
  ] : [];

  // Helper functions
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('dashboard.timeAgo.justNow');
    if (diffInHours < 24) return t('dashboard.timeAgo.hoursAgo').replace('{{count}}', diffInHours.toString());
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t('dashboard.timeAgo.dayAgo');
    return t('dashboard.timeAgo.daysAgo').replace('{{count}}', diffInDays.toString());
  };

  const handleMarkMessageAsRead = async (messageId: string) => {
    try {
      await dashboardService.markMessageAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ color: colors.neutral.grayLighter }}>{t('common.loading')}</div>
          </div>
        </Container>
      </DashboardContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div style={{ color: colors.accent.error }}>{error}</div>
          </div>
        </Container>
      </DashboardContainer>
    );
  }


  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderSection>
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </HeaderSection>

      <Container>
        {/* Statistics */}
        <StatsGrid>
          {formattedStats.map((stat, index) => (
            <StatCard key={index}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            </StatCard>
          ))}
        </StatsGrid>

        {/* Main Content */}
        <ContentGrid>
          <MainContent>
            {/* Recent Cars */}
            <ContentCard>
              <h3>{t('dashboard.myListings')}</h3>
              <CarList>
                {recentCars.length > 0 ? recentCars.map(car => (
                  <CarItem key={car.id}>
                    <div className="car-image">
                      {car.imageUrl ? (
                        <img src={car.imageUrl} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        '🚗'
                      )}
                    </div>
                    <div className="car-info">
                      <div className="car-title">{car.title}</div>
                      <div className="car-details">{car.year} • {car.make} {car.model}</div>
                      <div className="car-details">
                        👁️ {car.views} {t('dashboard.stats.views').toLowerCase()} • 💬 {car.inquiries} {t('dashboard.stats.newInquiries').toLowerCase()}
                      </div>
                    </div>
                    <div className={`car-status ${car.status}`}>
                      {car.status === 'active' && t('dashboard.carStatus.active')}
                      {car.status === 'pending' && t('dashboard.carStatus.pending')}
                      {car.status === 'sold' && t('dashboard.carStatus.sold')}
                      {car.status === 'draft' && t('dashboard.carStatus.draft')}
                    </div>
                  </CarItem>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: colors.neutral.grayLighter }}>
                    {t('dashboard.noListings')}
                  </div>
                )}
              </CarList>
              <QuickActions>
                <ActionButton>
                  ➕ {t('dashboard.actions.addNewListing')}
                </ActionButton>
                <ActionButton>
                  📊 {t('dashboard.actions.viewStatistics')}
                </ActionButton>
              </QuickActions>
            </ContentCard>

            {/* Recent Messages */}
            <ContentCard>
              <h3>{t('dashboard.recentInquiries')}</h3>
              <MessageList>
                {recentMessages.length > 0 ? recentMessages.map(message => (
                  <MessageItem 
                    key={message.id} 
                    onClick={() => handleMarkMessageAsRead(message.id)}
                    style={{ cursor: message.isRead ? 'default' : 'pointer' }}
                  >
                    <div className="message-header">
                      <span className="sender">{message.senderName}</span>
                      <span className="time">{formatTimeAgo(message.timestamp)}</span>
                      {!message.isRead && <span style={{ color: colors.primary.blue }}>●</span>}
                    </div>
                    <div className="message-preview">
                      <strong>{message.carTitle}:</strong> {message.message}
                    </div>
                  </MessageItem>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: colors.neutral.grayLighter }}>
                    {t('dashboard.noMessages')}
                  </div>
                )}
              </MessageList>
              <ActionButton>
                📨 {t('dashboard.actions.viewAllMessages')}
              </ActionButton>
            </ContentCard>
          </MainContent>

          {/* Sidebar */}
          <Sidebar>
            {/* Notifications */}
            <ContentCard>
              <h3>{t('dashboard.notifications')}</h3>
              <NotificationList>
                {notifications.length > 0 ? notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    onClick={() => handleMarkNotificationAsRead(notification.id)}
                    style={{ cursor: notification.isRead ? 'default' : 'pointer' }}
                  >
                    <div className="notification-content">
                      {notification.title}
                      {!notification.isRead && <span style={{ color: colors.primary.blue, marginLeft: '0.5rem' }}>●</span>}
                    </div>
                    <div className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </div>
                  </NotificationItem>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: colors.neutral.grayLighter }}>
                    {t('dashboard.noNotifications')}
                  </div>
                )}
              </NotificationList>
            </ContentCard>

            {/* Quick Actions */}
            <ContentCard>
              <h3>{t('dashboard.quickActions')}</h3>
              <QuickActions>
                <ActionButton>
                  📝 {t('dashboard.actions.editProfile')}
                </ActionButton>
                <ActionButton>
                  ⚙️ {t('dashboard.actions.settings')}
                </ActionButton>
                <ActionButton>
                  📊 {t('dashboard.actions.financialReports')}
                </ActionButton>
                <ActionButton>
                  🆘 {t('dashboard.actions.support')}
                </ActionButton>
              </QuickActions>
            </ContentCard>

            {/* Performance Tips */}
            <ContentCard>
              <h3>{t('dashboard.improvementTips')}</h3>
              <div style={{ color: colors.neutral.white, lineHeight: '1.6' }}>
                <p>• {t('dashboard.tips.addMorePhotos')}</p>
                <p>• {t('dashboard.tips.respondQuickly')}</p>
                <p>• {t('dashboard.tips.maintainCompetitivePrices')}</p>
                <p>• {t('dashboard.tips.updateDescriptions')}</p>
              </div>
            </ContentCard>
          </Sidebar>
        </ContentGrid>
      </Container>
    </DashboardContainer>
  );
};

export default DashboardPage;