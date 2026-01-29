/**
 * Notification Bell Component
 * جرس الإشعارات
 * 
 * Features:
 * - Real-time notification updates
 * - Unread count badge
 * - Dropdown menu with recent notifications
 * - Mark as read on click
 * - Navigate to car details
 * - Mobile-responsive
 * 
 * Usage:
 * <NotificationBell />
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Bell, X, Check, Car, TrendingDown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { notificationService, Notification } from '../../../services/notifications/unified-notification.service';
import { logger } from '../../../services/logger-service';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real-time listener with error handling
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    try {
      unsubscribe = notificationService.listenToNotifications(
        user.uid,
        (newNotifications) => {
          // Only update state if component is still mounted
          if (!isMounted) return;

          setNotifications(newNotifications);

          // Count unread
          const unread = newNotifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);

          setIsLoading(false);
        },
        20 // Max 20 recent notifications
      );
    } catch (error) {
      logger.error('Failed to setup notification listener', error as Error);
      if (isMounted) {
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          logger.error('Error unsubscribing from notifications', error as Error);
        }
      }
    };
  }, [user?.uid]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
      }

      // Navigate to car details
      const carUrl = notificationService.getCarUrl(notification);
      navigate(carUrl);

      // Close dropdown
      setIsOpen(false);

    } catch (error) {
      logger.error('Failed to handle notification click', error as Error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await notificationService.markAllAsRead(user.uid);
      logger.info('Marked all notifications as read');
    } catch (error) {
      logger.error('Failed to mark all as read', error as Error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering notification click

    try {
      await notificationService.deleteNotification(notificationId);
      logger.info('Notification deleted', { notificationId });
    } catch (error) {
      logger.error('Failed to delete notification', error as Error);
    }
  };

  // Don't render if not authenticated
  if (!user?.uid) {
    return null;
  }

  // Translations
  const t = {
    noNotifications: language === 'bg' ? 'Няма нови известия' : 'No new notifications',
    markAllRead: language === 'bg' ? 'Маркирай всички като прочетени' : 'Mark all as read',
    newCarFrom: language === 'bg' ? 'нова кола от' : 'new car from',
    priceNow: language === 'bg' ? 'Цена сега' : 'Price now',
    loading: language === 'bg' ? 'Зареждане...' : 'Loading...'
  };

  return (
    <Container ref={dropdownRef}>
      <BellButton
        onClick={() => setIsOpen(!isOpen)}
        $hasUnread={unreadCount > 0}
        title={`${unreadCount} ${language === 'bg' ? 'нови известия' : 'new notifications'}`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
        )}
      </BellButton>

      {isOpen && (
        <Dropdown>
          <DropdownHeader>
            <h3>
              {language === 'bg' ? 'Известия' : 'Notifications'}
              {unreadCount > 0 && ` (${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <MarkAllButton onClick={handleMarkAllAsRead}>
                <Check size={14} />
                {t.markAllRead}
              </MarkAllButton>
            )}
          </DropdownHeader>

          <NotificationList>
            {isLoading ? (
              <EmptyState>{t.loading}</EmptyState>
            ) : notifications.length === 0 ? (
              <EmptyState>
                <Bell size={48} style={{ opacity: 0.3 }} />
                <p>{t.noNotifications}</p>
              </EmptyState>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  $isUnread={!notification.isRead}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationIcon type={notification.type}>
                    {notification.type === 'new_car_from_followed_seller' && <Car size={20} />}
                    {notification.type === 'price_drop' && <TrendingDown size={20} />}
                    {notification.type === 'message' && <MessageSquare size={20} />}
                  </NotificationIcon>

                  <NotificationContent>
                    <NotificationTitle>
                      <strong>{notification.carMake} {notification.carModel}</strong>
                    </NotificationTitle>
                    <NotificationText>
                      {t.newCarFrom} <strong>{notification.sellerName}</strong>
                    </NotificationText>
                    <NotificationMeta>
                      {t.priceNow}: <strong>€{notification.carPrice.toLocaleString()}</strong>
                      {' • '}
                      {formatTimestamp(notification.createdAt, language)}
                    </NotificationMeta>
                  </NotificationContent>

                  {notification.carImage && (
                    <NotificationImage src={notification.carImage} alt="" />
                  )}

                  <DeleteButton
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    title={language === 'bg' ? 'Изтрий' : 'Delete'}
                  >
                    <X size={16} />
                  </DeleteButton>
                </NotificationItem>
              ))
            )}
          </NotificationList>
        </Dropdown>
      )}
    </Container>
  );
};

// Helper: Format timestamp
function formatTimestamp(timestamp: any, language: string): string {
  if (!timestamp?.toDate) return '';

  const date = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return language === 'bg' ? 'Току-що' : 'Just now';
  } else if (diffMins < 60) {
    return language === 'bg' ? `Преди ${diffMins} мин` : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return language === 'bg' ? `Преди ${diffHours} ч` : `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return language === 'bg' ? `Преди ${diffDays} д` : `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-GB');
  }
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  position: relative;
`;

const BellButton = styled.button<{ $hasUnread: boolean }>`
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: ${props => props.$hasUnread ? 'var(--primary-blue)' : 'var(--text-primary)'};

  &:hover {
    background: var(--bg-secondary);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    display: block;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background: #EF4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 420px;
  max-height: 600px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100vw;
    max-width: 420px;
    right: -80px;
  }
`;

const DropdownHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const MarkAllButton = styled.button`
  background: transparent;
  border: none;
  color: var(--primary-blue);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(30, 58, 138, 0.1);
  }
`;

const NotificationList = styled.div`
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 3px;
  }
`;

const NotificationItem = styled.div<{ $isUnread: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background 0.2s ease;
  background: ${props => props.$isUnread ? 'rgba(30, 58, 138, 0.05)' : 'transparent'};
  position: relative;

  &:hover {
    background: var(--bg-secondary);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => {
    switch (props.type) {
      case 'new_car_from_followed_seller':
        return 'rgba(30, 58, 138, 0.1)';
      case 'price_drop':
        return 'rgba(16, 185, 129, 0.1)';
      case 'message':
        return 'rgba(245, 158, 11, 0.1)';
      default:
        return 'var(--bg-secondary)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'new_car_from_followed_seller':
        return 'var(--primary-blue)';
      case 'price_drop':
        return '#10B981';
      case 'message':
        return '#F59E0B';
      default:
        return 'var(--text-secondary)';
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.div`
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: var(--text-primary);

  strong {
    font-weight: 600;
  }
`;

const NotificationText = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 4px;

  strong {
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const NotificationMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);

  strong {
    color: var(--primary-blue);
    font-weight: 600;
  }
`;

const NotificationImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  opacity: 0;

  ${NotificationItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);

  p {
    margin-top: 12px;
    font-size: 0.9rem;
  }
`;

export default NotificationBell;
