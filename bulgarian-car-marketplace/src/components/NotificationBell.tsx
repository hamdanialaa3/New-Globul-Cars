import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationBellProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  maxNotifications?: number;
  showCount?: boolean;
  className?: string;
}

const NotificationBellContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NotificationBellButton = styled.button<{ $hasUnread: boolean }>`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }
`;

const NotificationCount = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${({ theme }) => theme.colors.error.main};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const NotificationDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationHeaderTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotificationHeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NotificationHeaderButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div<{ $isRead: boolean; $type: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $isRead }) => ($isRead ? 'transparent' : '#f8f9ff')};
  border-left: 3px solid ${({ theme, $type }) => {
    switch ($type) {
      case 'success': return theme.colors.success.main;
      case 'warning': return theme.colors.warning.main;
      case 'error': return theme.colors.error.main;
      case 'info': return theme.colors.info.main;
      default: return theme.colors.grey[300];
    }
  }};

  &:hover {
    background: ${({ theme }) => theme.colors.grey[50]};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotificationItemTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const NotificationItemTime = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const NotificationItemMessage = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const NotificationEmpty = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  maxNotifications = 10,
  showCount = true,
  className,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(() => notifications ?? []);

  // Sync when parent actually provides a notifications array reference (avoid recreating [])
  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  const unreadCount = localNotifications.filter(n => !n.read).length;
  const displayNotifications = localNotifications.slice(0, maxNotifications);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
      setLocalNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
    onNotificationClick?.(notification);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
    setLocalNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleClearAll = () => {
    onClearAll?.();
    setLocalNotifications([]);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notifications.justNow', 'Just now');
    if (minutes < 60) return t('notifications.minutesAgo', `${minutes}m ago`);
    if (hours < 24) return t('notifications.hoursAgo', `${hours}h ago`);
    return t('notifications.daysAgo', `${days}d ago`);
  };

  return (
    <NotificationBellContainer className={className}>
      <NotificationBellButton
        $hasUnread={unreadCount > 0}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('notifications.bellAriaLabel', 'Notifications')}
      >
        <Bell size={20} />
        {showCount && unreadCount > 0 && (
          <NotificationCount>{unreadCount}</NotificationCount>
        )}
      </NotificationBellButton>

  <NotificationDropdown $isOpen={isOpen}>
        <NotificationHeader>
          <NotificationHeaderTitle>
            {t('notifications.title', 'Notifications')}
          </NotificationHeaderTitle>
          <NotificationHeaderActions>
            {unreadCount > 0 && (
              <NotificationHeaderButton onClick={handleMarkAllAsRead}>
                {t('notifications.markAllRead', 'Mark all read')}
              </NotificationHeaderButton>
            )}
            {localNotifications.length > 0 && (
              <NotificationHeaderButton onClick={handleClearAll}>
                {t('notifications.clearAll', 'Clear all')}
              </NotificationHeaderButton>
            )}
            <NotificationHeaderButton onClick={() => setIsOpen(false)}>
              <X size={16} />
            </NotificationHeaderButton>
          </NotificationHeaderActions>
        </NotificationHeader>

        <NotificationList>
          {displayNotifications.length === 0 ? (
            <NotificationEmpty>
              {t('notifications.empty', 'No notifications')}
            </NotificationEmpty>
          ) : (
            displayNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                $isRead={notification.read}
                $type={notification.type}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationItemHeader>
                  <NotificationItemTitle>{notification.title}</NotificationItemTitle>
                  <NotificationItemTime>
                    {formatTime(notification.timestamp)}
                  </NotificationItemTime>
                </NotificationItemHeader>
                <NotificationItemMessage>
                  {notification.message}
                </NotificationItemMessage>
              </NotificationItem>
            ))
          )}
        </NotificationList>
      </NotificationDropdown>
    </NotificationBellContainer>
  );
};

export default NotificationBell;