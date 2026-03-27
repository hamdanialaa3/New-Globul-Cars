// Professional Notification Dropdown Component
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import {
  Bell,
  MessageCircle,
  Search,
  User,
  Car,
  Heart,
  ShoppingCart,
  AlertTriangle,
  X,
  Settings,
  CheckCheck
} from 'lucide-react';
import './NotificationDropdown.css';

interface Notification {
  id: string;
  type: 'message' | 'search' | 'login' | 'car' | 'favorite' | 'offer' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time Firestore listener for notifications
  useEffect(() => {
    if (!user) return;
    let isActive = true;
    setLoading(true);

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isActive) return;
      const notifs: Notification[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.type || 'system',
          title: data.title || '',
          message: data.message || '',
          timestamp: data.timestamp?.toDate?.() || new Date(),
          read: data.read || false,
          actionUrl: data.actionUrl || undefined,
        };
      });
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      if (!isActive) return;
      logger.error('Error listening to notifications', error as Error);
      setLoading(false);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      const notifRef = doc(db, 'users', user.uid, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      logger.error('Error marking notification as read', error as Error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 0) return;
      const batch = writeBatch(db);
      unread.forEach(n => {
        const ref = doc(db, 'users', user.uid, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      logger.error('Error marking all notifications as read', error as Error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle size={16} />;
      case 'search': return <Search size={16} />;
      case 'login': return <User size={16} />;
      case 'car': return <Car size={16} />;
      case 'favorite': return <Heart size={16} />;
      case 'offer': return <ShoppingCart size={16} />;
      case 'alert': return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('notifications.justNow');
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return null;
  }

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button
        className={`notification-button ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={onToggle}
        title={t('nav.notifications')}
        aria-label={t('nav.notifications')}
      >
        <Bell size={22} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>{t('notifications.title')}</h4>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-button"
                  onClick={markAllAsRead}
                  title={language === 'bg' ? 'Маркирай всички като прочетени' : 'Mark all as read'}
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                className="close-button"
                onClick={onClose}
                title={t('common.close')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="dropdown-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{t('notifications.loading')}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={32} />
                <p>{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
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
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {formatTimestamp(notification.timestamp)}
                      </div>
                    </div>

                    {!notification.read && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}

                {notifications.length > 5 && (
                  <div className="view-all-notifications">
                    <span>+{notifications.length - 5} more</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="dropdown-footer">
            <button
              className="view-all-button"
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
            >
              {t('notifications.viewAll')}
            </button>
            <button
              className="settings-button"
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
