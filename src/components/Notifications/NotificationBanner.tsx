import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, X } from 'lucide-react';
import { notificationService } from '../../services/notifications/unified-notification.service';

const Banner = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: ${props => props.$show ? '20px' : '-100px'};
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FF7900 0%, #FF9433 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(255, 121, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 9999;
  transition: bottom 0.3s;
  max-width: 90%;

  @media (max-width: 768px) {
    bottom: ${props => props.$show ? '80px' : '-100px'};
    padding: 12px 16px;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
`;

const Message = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const Button = styled.button`
  background: white;
  color: #FF7900;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const NotificationBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkPermission = () => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
        if (Notification.permission === 'default') {
          setTimeout(() => setShow(true), 3000);
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    const result = await notificationService.requestPermission();
    if (result) {
      setShow(false);
      // Show success message
      new Notification('🎉 تم التفعيل!', {
        body: 'سنرسل لك إشعارات عن السيارات الجديدة',
        icon: '/Logo1.png'
      });
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('notification-banner-closed', 'true');
  };

  if (permission !== 'default' || localStorage.getItem('notification-banner-closed')) {
    return null;
  }

  return (
    <Banner $show={show}>
      <Bell size={24} />
      <Content>
        <Title>🔔 فعّل الإشعارات</Title>
        <Message>احصل على تنبيهات فورية عن السيارات الجديدة والعروض</Message>
      </Content>
      <Button onClick={handleEnable}>تفعيل</Button>
      <CloseButton onClick={handleClose}>
        <X size={20} />
      </CloseButton>
    </Banner>
  );
};
