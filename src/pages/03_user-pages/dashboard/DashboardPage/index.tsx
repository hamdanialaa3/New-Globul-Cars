import React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useDashboard } from './hooks/useDashboard';
import { Car, Eye, MessageCircle, Plus, BarChart3, Mail, Edit, Settings, FileText, HelpCircle, Loader } from 'lucide-react';
import * as S from './styles';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    recentCars,
    recentMessages,
    notifications,
    loading,
    error,
    formattedStats,
    formatTimeAgo,
    handleMarkMessageAsRead,
    handleMarkNotificationAsRead,
  } = useDashboard();

  // Loading state
  if (loading) {
    return (
      <S.DashboardContainer>
        <S.Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
              <Loader size={48} color={S.colors.neutral.grayLighter} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ color: S.colors.neutral.grayLighter }}>{t('common.loading')}</div>
          </div>
        </S.Container>
      </S.DashboardContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <S.DashboardContainer>
        <S.Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={S.colors.accent.error} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <div style={{ color: S.colors.accent.error }}>{error}</div>
          </div>
        </S.Container>
      </S.DashboardContainer>
    );
  }

  return (
    <S.DashboardContainer>
      {/* Header */}
      <S.HeaderSection>
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </S.HeaderSection>

      <S.Container>
        {/* Statistics */}
        <S.StatsGrid>
          {formattedStats.map((stat, index) => {
            const IconComponent = 
              stat.icon === 'car' ? Car :
              stat.icon === 'eye' ? Eye :
              stat.icon === 'message' ? MessageCircle :
              stat.icon === 'euro' ? BarChart3 : Car;
            
            return (
              <S.StatCard key={index}>
                <div className="stat-icon">
                  <IconComponent size={32} />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-change ${stat.changeType}`}>
                  {stat.change}
                </div>
              </S.StatCard>
            );
          })}
        </S.StatsGrid>

        {/* Main Content */}
        <S.ContentGrid>
          <S.MainContent>
            {/* Recent Cars */}
            <S.ContentCard>
              <h3>{t('dashboard.myListings')}</h3>
              <S.CarList>
                {recentCars.length > 0 ? recentCars.map((car: any) => (
                  <S.CarItem key={car.id}>
                    <div className="car-image">
                      {car.imageUrl ? (
                        <img src={car.imageUrl} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Car size={32} color="#adb5bd" />
                        </div>
                      )}
                    </div>
                    <div className="car-info">
                      <div className="car-title">{car.title}</div>
                      <div className="car-details">{car.year} • {car.make} {car.model}</div>
                      <div className="car-details" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} /> {car.views}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageCircle size={14} /> {car.inquiries}
                        </span>
                      </div>
                    </div>
                    <div className={`car-status ${car.status}`}>
                      {car.status === 'active' && t('dashboard.carStatus.active')}
                      {car.status === 'pending' && t('dashboard.carStatus.pending')}
                      {car.status === 'sold' && t('dashboard.carStatus.sold')}
                      {car.status === 'draft' && t('dashboard.carStatus.draft')}
                    </div>
                  </S.CarItem>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: S.colors.neutral.grayLighter }}>
                    {t('dashboard.noListings')}
                  </div>
                )}
              </S.CarList>
              <S.QuickActions>
                <S.ActionButton>
                  <Plus size={18} style={{ marginRight: '6px' }} />
                  {t('dashboard.actions.addNewListing')}
                </S.ActionButton>
                <S.ActionButton>
                  <BarChart3 size={18} style={{ marginRight: '6px' }} />
                  {t('dashboard.actions.viewStatistics')}
                </S.ActionButton>
              </S.QuickActions>
            </S.ContentCard>

            {/* Recent Messages */}
            <S.ContentCard>
              <h3>{t('dashboard.recentInquiries')}</h3>
              <S.MessageList>
                {recentMessages.length > 0 ? recentMessages.map(message => (
                  <S.MessageItem
                    key={message.id}
                    onClick={() => handleMarkMessageAsRead(message.id)}
                    style={{ cursor: message.isRead ? 'default' : 'pointer' }}
                  >
                    <div className="message-header">
                      <span className="sender">{message.senderName}</span>
                      <span className="time">{formatTimeAgo(message.timestamp)}</span>
                      {!message.isRead && <span style={{ color: S.colors.primary.blue }}>●</span>}
                    </div>
                    <div className="message-preview">
                      <strong>{message.carTitle}:</strong> {message.message}
                    </div>
                  </S.MessageItem>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: S.colors.neutral.grayLighter }}>
                    {t('dashboard.noMessages')}
                  </div>
                )}
              </S.MessageList>
              <S.ActionButton>
                <Mail size={18} style={{ marginRight: '6px' }} />
                {t('dashboard.actions.viewAllMessages')}
              </S.ActionButton>
            </S.ContentCard>
          </S.MainContent>

          {/* Sidebar */}
          <S.Sidebar>
            {/* Notifications */}
            <S.ContentCard>
              <h3>{t('dashboard.notifications')}</h3>
              <S.NotificationList>
                {notifications.length > 0 ? notifications.map(notification => (
                  <S.NotificationItem
                    key={notification.id}
                    onClick={() => handleMarkNotificationAsRead(notification.id)}
                    style={{ cursor: notification.isRead ? 'default' : 'pointer' }}
                  >
                    <div className="notification-content">
                      {notification.title}
                      {!notification.isRead && <span style={{ color: S.colors.primary.blue, marginLeft: '0.5rem' }}>●</span>}
                    </div>
                    <div className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </div>
                  </S.NotificationItem>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: S.colors.neutral.grayLighter }}>
                    {t('dashboard.noNotifications')}
                  </div>
                )}
              </S.NotificationList>
            </S.ContentCard>

            {/* Quick Actions */}
            <S.ContentCard>
              <h3>{t('dashboard.quickActions')}</h3>
              <S.QuickActions>
                <S.ActionButton>
                  <Edit size={18} style={{ marginRight: '6px' }} />
                  {t('dashboard.actions.editProfile')}
                </S.ActionButton>
                <S.ActionButton>
                  <Settings size={18} style={{ marginRight: '6px' }} />
                  {t('dashboard.actions.settings')}
                </S.ActionButton>
                <S.ActionButton>
                  <FileText size={18} style={{ marginRight: '6px' }} />
                  {t('dashboard.actions.financialReports')}
                </S.ActionButton>
                <S.ActionButton>
                  <HelpCircle size={18} style={{ marginRight: '6px' }} />
                  {t('dashboard.actions.support')}
                </S.ActionButton>
              </S.QuickActions>
            </S.ContentCard>

            {/* Performance Tips */}
            <S.ContentCard>
              <h3>{t('dashboard.improvementTips')}</h3>
              <div style={{ color: S.colors.neutral.white, lineHeight: '1.6' }}>
                <p>• {t('dashboard.tips.addMorePhotos')}</p>
                <p>• {t('dashboard.tips.respondQuickly')}</p>
                <p>• {t('dashboard.tips.maintainCompetitivePrices')}</p>
                <p>• {t('dashboard.tips.updateDescriptions')}</p>
              </div>
            </S.ContentCard>
          </S.Sidebar>
        </S.ContentGrid>
      </S.Container>
    </S.DashboardContainer>
  );
};

export default DashboardPage;