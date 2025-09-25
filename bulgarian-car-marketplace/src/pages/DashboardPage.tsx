import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

// Professional Color Palette - Black & Yellow System
const colors = {
  primary: {
    yellow: '#FFD700',
    yellowMedium: '#F4C430',
    yellowDark: '#DAA520',
    yellowDeep: '#B8860B',
  },
  neutral: {
    black: '#000000',
    blackLight: '#1a1a1a',
    blackMedium: '#333333',
    blackSoft: '#4a4a4a',
    gray: '#666666',
    grayLight: '#999999',
    grayLighter: '#cccccc',
    white: '#ffffff',
  },
  accent: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Main Container
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${colors.neutral.blackLight} 0%,
    ${colors.primary.yellowMedium} 25%,
    ${colors.primary.yellowDark} 50%,
    ${colors.neutral.blackMedium} 75%,
    ${colors.neutral.black} 100%
  );
  padding: 2rem 0;
`;

// Header Section
const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 24px;
  padding: 3rem 2rem;
  animation: ${fadeIn} 0.8s ease-out;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${colors.primary.yellow}, ${colors.primary.yellowDark});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: ${colors.neutral.white};
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
`;

// Container
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

// Stat Card
const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 24px;
  padding: 2rem;
  animation: ${fadeIn} 1s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(218, 165, 32, 0.2);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, ${colors.primary.yellow}, ${colors.primary.yellowDark});
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${colors.primary.yellow};
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1rem;
    color: ${colors.neutral.white};
    opacity: 0.9;
    margin-bottom: 0.5rem;
  }

  .stat-change {
    font-size: 0.9rem;
    font-weight: 500;

    &.positive {
      color: ${colors.accent.success};
    }

    &.negative {
      color: ${colors.accent.error};
    }
  }
`;

// Content Grid
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Main Content
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Sidebar
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Content Card
const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 24px;
  padding: 2rem;
  animation: ${slideIn} 0.8s ease-out;

  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: ${colors.primary.yellow};
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &::before {
      content: '';
      width: 4px;
      height: 24px;
      background: ${colors.primary.yellow};
      border-radius: 2px;
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
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .car-image {
    width: 80px;
    height: 60px;
    background: ${colors.neutral.gray};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.neutral.white};
    font-size: 0.8rem;
  }

  .car-info {
    flex: 1;

    .car-title {
      font-weight: 600;
      color: ${colors.neutral.white};
      margin-bottom: 0.25rem;
    }

    .car-details {
      font-size: 0.9rem;
      color: ${colors.neutral.grayLight};
    }
  }

  .car-status {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;

    &.active {
      background: rgba(16, 185, 129, 0.2);
      color: ${colors.accent.success};
    }

    &.pending {
      background: rgba(245, 158, 11, 0.2);
      color: ${colors.accent.warning};
    }

    &.sold {
      background: rgba(239, 68, 68, 0.2);
      color: ${colors.accent.error};
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
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border-left: 4px solid ${colors.primary.yellow};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;

    .sender {
      font-weight: 600;
      color: ${colors.neutral.white};
    }

    .time {
      font-size: 0.8rem;
      color: ${colors.neutral.grayLight};
    }
  }

  .message-preview {
    color: ${colors.neutral.grayLight};
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

// Notification List
const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border-left: 4px solid ${colors.accent.info};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .notification-content {
    color: ${colors.neutral.white};
    margin-bottom: 0.5rem;
  }

  .notification-time {
    font-size: 0.8rem;
    color: ${colors.neutral.grayLight};
  }
`;

// Action Button
const ActionButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, ${colors.primary.yellow}, ${colors.primary.yellowDark});
  color: ${colors.neutral.black};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(218, 165, 32, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Quick Actions
const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Mock data - in real app, this would come from API
  const stats = [
    {
      icon: '🚗',
      value: '12',
      label: t('dashboard.stats.listingsOnline'),
      change: `+2 ${t('dashboard.stats.thisWeek')}`,
      changeType: 'positive'
    },
    {
      icon: '👁️',
      value: '1,247',
      label: t('dashboard.stats.views'),
      change: `+15% ${t('dashboard.stats.lastWeek')}`,
      changeType: 'positive'
    },
    {
      icon: '💬',
      value: '23',
      label: t('dashboard.stats.newInquiries'),
      change: `5 ${t('dashboard.stats.unread')}`,
      changeType: 'warning'
    },
    {
      icon: '💰',
      value: '€45,230',
      label: t('dashboard.stats.potentialSales'),
      change: t('dashboard.stats.basedOnInquiries'),
      changeType: 'info'
    }
  ];

  const recentCars = [
    {
      id: 1,
      title: 'BMW X3 2020',
      details: '2.0d, 190 к.с., Автоматична, Дизел',
      status: 'active',
      views: 89,
      inquiries: 5
    },
    {
      id: 2,
      title: 'Mercedes C-Class 2019',
      details: '2.0, 184 к.с., Автоматична, Бензин',
      status: 'active',
      views: 156,
      inquiries: 12
    },
    {
      id: 3,
      title: 'Audi A4 2018',
      details: '2.0 TDI, 150 к.с., Ръчна, Дизел',
      status: 'pending',
      views: 43,
      inquiries: 2
    },
    {
      id: 4,
      title: 'VW Passat 2021',
      details: '1.5 TSI, 150 к.с., Автоматична, Бензин',
      status: 'sold',
      views: 234,
      inquiries: 18
    }
  ];

  const recentMessages = [
    {
      id: 1,
      sender: 'Иван Петров',
      car: 'BMW X3 2020',
      message: 'Здравейте, интересувам се от колата. Може ли да се видим утре?',
      time: 'преди 2 часа',
      unread: true
    },
    {
      id: 2,
      sender: 'Мария Димитрова',
      car: 'Mercedes C-Class 2019',
      message: 'Колко е пробегът на колата? Има ли някакви проблеми?',
      time: 'преди 4 часа',
      unread: true
    },
    {
      id: 3,
      sender: 'Георги Стоянов',
      car: 'Audi A4 2018',
      message: 'Може ли да получа още снимки от интериора?',
      time: 'преди 6 часа',
      unread: false
    }
  ];

  const notifications = [
    {
      id: 1,
      content: 'Вашата обява за BMW X3 е одобрена и публикувана',
      time: 'преди 1 ден',
      type: 'success'
    },
    {
      id: 2,
      content: 'Нов клиент се интересува от Mercedes C-Class',
      time: 'преди 2 дни',
      type: 'info'
    },
    {
      id: 3,
      content: 'Напомняне: Обновете цената на Audi A4',
      time: 'преди 3 дни',
      type: 'warning'
    }
  ];

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
          {stats.map((stat, index) => (
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
                {recentCars.map(car => (
                  <CarItem key={car.id}>
                    <div className="car-image">Фото</div>
                    <div className="car-info">
                      <div className="car-title">{car.title}</div>
                      <div className="car-details">{car.details}</div>
                      <div className="car-details">
                        👁️ {car.views} {t('dashboard.stats.views').toLowerCase()} • 💬 {car.inquiries} {t('dashboard.stats.newInquiries').toLowerCase()}
                      </div>
                    </div>
                    <div className={`car-status ${car.status}`}>
                      {car.status === 'active' && t('dashboard.carStatus.active')}
                      {car.status === 'pending' && t('dashboard.carStatus.pending')}
                      {car.status === 'sold' && t('dashboard.carStatus.sold')}
                    </div>
                  </CarItem>
                ))}
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
                {recentMessages.map(message => (
                  <MessageItem key={message.id}>
                    <div className="message-header">
                      <span className="sender">{message.sender}</span>
                      <span className="time">{message.time}</span>
                    </div>
                    <div className="message-preview">
                      <strong>{message.car}:</strong> {message.message}
                    </div>
                  </MessageItem>
                ))}
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
                {notifications.map(notification => (
                  <NotificationItem key={notification.id}>
                    <div className="notification-content">
                      {notification.content}
                    </div>
                    <div className="notification-time">
                      {notification.time}
                    </div>
                  </NotificationItem>
                ))}
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