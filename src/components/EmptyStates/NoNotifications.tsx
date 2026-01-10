/**
 * 🔴 CRITICAL: No Notifications Empty State Component
 * مكون الحالة الفارغة للإشعارات
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses PascalCase for component name (CONSTITUTION Section 2.2)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Bell, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NoNotificationsProps {
  variant?: 'all' | 'unread';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16, 163, 74, 0.1) 0%, rgba(16, 163, 74, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    color: #10A363;
    opacity: 0.7;
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
`;

const NoNotifications: React.FC<NoNotificationsProps> = ({ variant = 'all' }) => {
  const { language } = useLanguage();
  const isBg = language === 'bg';

  // Title text based on language and variant
  const titleText = isBg
    ? variant === 'unread'
      ? 'Няма непрочетени известия'
      : 'Няма известия'
    : variant === 'unread'
      ? 'No Unread Notifications'
      : 'No Notifications';

  // Description text based on language and variant
  const descriptionText = isBg
    ? variant === 'unread'
      ? 'Всички ваши известия са прочетени. Ще получите известие, когато има нови събития.'
      : 'Все още нямате известия. Ще получите известия за нови съобщения, отговори и важни събития.'
    : variant === 'unread'
      ? "All your notifications have been read. You'll receive notifications when there are new events."
      : "You don't have any notifications yet. You'll receive notifications for new messages, replies, and important events.";

  return (
    <Container>
      <IconWrapper>
        {variant === 'unread' ? <CheckCircle size={48} /> : <Bell size={48} />}
      </IconWrapper>
      
      <Title>{titleText}</Title>
      
      <Description>{descriptionText}</Description>
    </Container>
  );
};

export default NoNotifications;
