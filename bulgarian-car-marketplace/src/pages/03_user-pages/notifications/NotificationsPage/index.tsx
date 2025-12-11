// Professional Notifications Page for Bulgarian Car Marketplace
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { logger } from '../../../../services/logger-service';
import {
  Bell,
  MessageCircle,
  Search,
  User,
  Car,
  Heart,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Settings
} from 'lucide-react';
import './NotificationsPage.css';

interface Notification {
  id: string;
  type: 'message' | 'search' | 'login' | 'car' | 'favorite' | 'offer' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'system'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter, language]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simulate loading notifications from Firebase
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: t('common.notifications.types.message'),
          message: language === 'bg' ? 'Имате ново съобщение за вашата обява BMW X5' : 'You have a new message about your BMW X5 listing',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: '/messages'
        },
        {
          id: '2',
          type: 'search',
          title: t('common.notifications.types.search'),
          message: language === 'bg' ? 'Нови автомобили, отговарящи на вашето търсене за "Audi A4" под 20000 EUR' : 'New cars matching your search for "Audi A4" under 20000 EUR',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          actionUrl: '/cars?search=Audi%20A4&maxPrice=20000'
        },
        {
          id: '3',
          type: 'login',
          title: t('common.notifications.types.security'),
          message: language === 'bg' ? 'Нов вход от Chrome на Windows' : 'New login from Chrome on Windows',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: '/profile/security'
        },
        {
          id: '4',
          type: 'car',
          title: t('common.notifications.types.car'),
          message: language === 'bg' ? 'Вашата обява Mercedes C-Class е видяна 25 пъти днес' : 'Your Mercedes C-Class listing has been viewed 25 times today',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: false,
          actionUrl: '/my-listings'
        },
        {
          id: '5',
          type: 'system',
          title: t('common.notifications.types.system'),
          message: language === 'bg' ? 'Планираната поддръжка приключи. Всички услуги са отново онлайн.' : 'Scheduled maintenance completed. All services are back online.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          read: true
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      logger.error('Error loading notifications', error as Error, { userId: user?.uid });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    // TODO: Update in Firebase
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    // TODO: Update in Firebase
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    // TODO: Delete from Firebase
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle size={20} />;
      case 'search': return <Search size={20} />;
      case 'login': return <User size={20} />;
      case 'car': return <Car size={20} />;
      case 'favorite': return <Heart size={20} />;
      case 'offer': return <ShoppingCart size={20} />;
      case 'alert': return <AlertTriangle size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return '#007bff';
      case 'search': return '#28a745';
      case 'login': return '#ffc107';
      case 'car': return '#dc3545';
      case 'favorite': return '#e83e8c';
      case 'offer': return '#17a2b8';
      case 'alert': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'messages': return notif.type === 'message';
      case 'system': return notif.type === 'system' || notif.type === 'alert';
      default: return true;
    }
  });

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('common.notifications.justNow');
    if (minutes < 60) {
      const minutesText = minutes === 1 
        ? (language === 'bg' ? 'минута' : 'minute')
        : t('common.notifications.minutesAgo');
      return `${minutes} ${minutesText}`;
    }
    if (hours < 24) {
      const hoursText = hours === 1
        ? (language === 'bg' ? 'час' : 'hour')
        : t('common.notifications.hoursAgo');
      return `${hours} ${hoursText}`;
    }
    const daysText = days === 1
      ? (language === 'bg' ? 'ден' : 'day')
      : t('common.notifications.daysAgo');
    return `${days} ${daysText}`;
  };

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="login-required">
            <Bell size={48} />
            <h2>{t('common.notifications.loginRequired')}</h2>
            <p>{t('common.notifications.loginToView')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-left">
            <Bell size={32} />
            <h1>{t('common.notifications.title')}</h1>
          </div>
          <div className="header-actions">
            <button
              className="action-button secondary"
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.read)}
            >
              <CheckCircle size={16} />
              {t('common.notifications.markAllRead')}
            </button>
            <button className="action-button secondary">
              <Settings size={16} />
              {t('common.notifications.settings')}
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('common.notifications.all')} ({notifications.length})
          </button>
          <button
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            {t('common.notifications.unread')} ({notifications.filter(n => !n.read).length})
          </button>
          <button
            className={`filter-button ${filter === 'messages' ? 'active' : ''}`}
            onClick={() => setFilter('messages')}
          >
            {t('common.notifications.messages')} ({notifications.filter(n => n.type === 'message').length})
          </button>
          <button
            className={`filter-button ${filter === 'system' ? 'active' : ''}`}
            onClick={() => setFilter('system')}
          >
            {t('common.notifications.system')} ({notifications.filter(n => n.type === 'system' || n.type === 'alert').length})
          </button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{t('common.notifications.loading')}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} />
              <h3>{t('common.notifications.noNotifications')}</h3>
              <p>{t('common.notifications.noNotificationsDesc')}</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  <div
                    className="icon-wrapper"
                    style={{ backgroundColor: getNotificationColor(notification.type) }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="notification-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('common.notifications.viewDetails')}
                    </a>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="action-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      title={t('common.notifications.markAsRead')}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    className="action-icon delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title={t('common.notifications.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;