// src/components/Notifications/NotificationBell.tsx
// Notifications Bell Component
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Bell } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { useLanguage } from '../../contexts/LanguageContext';

const BellContainer = styled.div`
  position: relative;
`;

const BellButton = styled.button`
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 121, 0, 0.1);
  }
  
  svg {
    color: #495057;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const Dropdown = styled.div<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: ${props => props.$show ? 'block' : 'none'};
  overflow: hidden;
  z-index: 1000;
  
  @media (max-width: 480px) {
    width: calc(100vw - 32px);
    right: -16px;
  }
`;

const DropdownHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const MarkAllRead = styled.button`
  background: none;
  border: none;
  color: #FF7900;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationsList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const NotificationItem = styled.div<{ $read: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid #f8f9fa;
  background: ${props => props.$read ? 'white' : '#fff8f0'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: #212529;
`;

const NotificationMessage = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 4px;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #adb5bd;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  
  svg {
    margin-bottom: 12px;
    opacity: 0.3;
  }
`;

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Notification[];

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => 
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'bg' ? 'Сега' : 'Now';
    if (minutes < 60) return `${minutes}${language === 'bg' ? 'м' : 'm'}`;
    if (hours < 24) return `${hours}${language === 'bg' ? 'ч' : 'h'}`;
    return `${days}${language === 'bg' ? 'д' : 'd'}`;
  };

  return (
    <BellContainer ref={dropdownRef}>
      <BellButton onClick={() => setShow(!show)}>
        <Bell size={20} />
        {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
      </BellButton>

      <Dropdown $show={show}>
        <DropdownHeader>
          <h3>{language === 'bg' ? 'Известия' : 'Notifications'}</h3>
          {unreadCount > 0 && (
            <MarkAllRead onClick={handleMarkAllAsRead}>
              {language === 'bg' ? 'Маркирай всички' : 'Mark all read'}
            </MarkAllRead>
          )}
        </DropdownHeader>

        <NotificationsList>
          {notifications.length === 0 ? (
            <EmptyState>
              <Bell size={48} />
              <div>{language === 'bg' ? 'Няма известия' : 'No notifications'}</div>
            </EmptyState>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                $read={notification.read}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
                <NotificationTime>{formatTime(notification.createdAt)}</NotificationTime>
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </Dropdown>
    </BellContainer>
  );
};

export default NotificationBell;

