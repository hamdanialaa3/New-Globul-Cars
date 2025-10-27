import React, { useState, useEffect } from 'react';
import { logger } from '../services/logger-service';
import styled from 'styled-components';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { realTimeNotificationsService, Notification } from '../services/real-time-notifications-service';

// Styled Components
const NotificationsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const NotificationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const NotificationsTitle = styled.h2`
  color: #1c1e21;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NotificationsControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ControlButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
    }
  }}
`;

const NotificationsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: white;
`;

const NotificationItem = styled.div<{ $unread: boolean; $priority: string }>`
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
  transition: all 0.2s;
  position: relative;
  background: ${props => props.$unread ? '#f8f9ff' : 'white'};
  border-left: 4px solid ${props => {
    switch (props.$priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }};

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  color: #495057;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
    }
  }}
`;

const PriorityBadge = styled.div<{ $priority: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const UnreadIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  color: #495057;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #6c757d;
  font-size: 14px;
  margin: 0;
`;

interface RealTimeNotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const [notificationsData, statsData] = await Promise.all([
          realTimeNotificationsService.getNotifications(50),
          realTimeNotificationsService.getNotificationStats()
        ]);
        
        setNotifications(notificationsData);
        setStats(statsData);
      } catch (error) {
        logger.error('Error loading notifications (realtime)', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // الاشتراك في الإشعارات الفورية
    const unsubscribe = realTimeNotificationsService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await realTimeNotificationsService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      logger.error('Error marking notification as read (realtime)', error as Error, { notificationId });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await realTimeNotificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      logger.error('Error deleting notification (realtime)', error as Error, { notificationId });
    }
  };

  const handleClearRead = async () => {
    try {
      await realTimeNotificationsService.clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      logger.error('Error clearing read notifications (realtime)', error as Error);
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <NotificationsContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading notifications...
        </div>
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <NotificationsHeader>
        <NotificationsTitle>
          <Bell size={24} />
          Real-time Notifications
        </NotificationsTitle>
        <NotificationsControls>
          <ControlButton $variant="secondary" onClick={handleClearRead}>
            <Trash2 size={16} />
            Clear Read
          </ControlButton>
          <ControlButton $variant="primary">
            <Settings size={16} />
            Settings
          </ControlButton>
        </NotificationsControls>
      </NotificationsHeader>

      {/* إحصائيات سريعة */}
      {stats && (
        <StatsContainer>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.unread}</StatValue>
            <StatLabel>Unread</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.byPriority.critical || 0}</StatValue>
            <StatLabel>Critical</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.byPriority.high || 0}</StatValue>
            <StatLabel>High Priority</StatLabel>
          </StatCard>
        </StatsContainer>
      )}

      {/* قائمة الإشعارات */}
      <NotificationsList>
        {notifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔔</EmptyIcon>
            <EmptyTitle>No Notifications</EmptyTitle>
            <EmptyDescription>
              You're all caught up! New notifications will appear here.
            </EmptyDescription>
          </EmptyState>
        ) : (
          notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              $unread={!notification.read}
              $priority={notification.priority}
            >
              {!notification.read && <UnreadIndicator />}
              
              <NotificationHeader>
                <div>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationTime>{formatTime(notification.timestamp)}</NotificationTime>
                </div>
                <PriorityBadge $priority={notification.priority}>
                  {notification.priority}
                </PriorityBadge>
              </NotificationHeader>

              <NotificationMessage>
                {notification.message}
              </NotificationMessage>

              <NotificationActions>
                {!notification.read && (
                  <ActionButton 
                    $variant="primary" 
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <Eye size={12} />
                    Mark Read
                  </ActionButton>
                )}
                
                {notification.actionRequired && (
                  <ActionButton $variant="secondary">
                    <AlertTriangle size={12} />
                    Action Required
                  </ActionButton>
                )}
                
                <ActionButton 
                  $variant="danger" 
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  <X size={12} />
                  Delete
                </ActionButton>
              </NotificationActions>
            </NotificationItem>
          ))
        )}
      </NotificationsList>
    </NotificationsContainer>
  );
};

export default RealTimeNotifications;
