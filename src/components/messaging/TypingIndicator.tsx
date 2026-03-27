// src/components/Messaging/TypingIndicator.tsx
// Typing Indicator Component - مؤشر الكتابة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`;

// ==================== STYLED COMPONENTS ====================

const IndicatorContainer = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 0.875rem;
  font-style: italic;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563EB;
  animation: ${bounce} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.$delay}s;
`;

// ==================== COMPONENT ====================

interface TypingIndicatorProps {
  userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName
}) => {
  const { language } = useLanguage();

  return (
    <IndicatorContainer>
      <span>
        {userName || (language === 'bg' ? 'Потребител' : 'User')}{' '}
        {language === 'bg' ? 'пише' : 'is typing'}
      </span>
      <DotsContainer>
        <Dot $delay={0} />
        <Dot $delay={0.2} />
        <Dot $delay={0.4} />
      </DotsContainer>
    </IndicatorContainer>
  );
};

export default TypingIndicator;

