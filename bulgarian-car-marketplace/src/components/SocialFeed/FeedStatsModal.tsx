/**
 * Feed Stats Modal
 * Detailed engagement statistics for feed items
 */

import React from 'react';
import styled from 'styled-components';
import { X, Eye, Heart, MessageCircle, Share2, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { FeedItem } from '../../services/social/smart-feed.service';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  margin: 0;
`;

const CloseButton = styled.button<{ $isDark: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$isDark ? '#cbd5e1' : '#65676b'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#e4e6eb'};
    transform: rotate(90deg);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
`;

const StatIcon = styled.div<{ $color: string; $isDark: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => `${props.$color}20`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  margin-bottom: 12px;
`;

const StatValue = styled.div<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

interface FeedStatsModalProps {
  item: FeedItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedStatsModal: React.FC<FeedStatsModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!item) return null;

  const engagement = item.engagement;
  const totalEngagement = engagement.likes + engagement.comments + engagement.shares;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isDark={isDark} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle $isDark={isDark}>
            {language === 'bg' ? 'Статистики' : 'Statistics'}
          </ModalTitle>
          <CloseButton $isDark={isDark} onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <StatsGrid>
          <StatCard $isDark={isDark}>
            <StatIcon $color="#3b82f6" $isDark={isDark}>
              <Eye size={20} />
            </StatIcon>
            <StatValue $isDark={isDark}>{engagement.views.toLocaleString()}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Гледания' : 'Views'}
            </StatLabel>
          </StatCard>

          <StatCard $isDark={isDark}>
            <StatIcon $color="#ef4444" $isDark={isDark}>
              <Heart size={20} />
            </StatIcon>
            <StatValue $isDark={isDark}>{engagement.likes.toLocaleString()}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Харесвания' : 'Likes'}
            </StatLabel>
          </StatCard>

          <StatCard $isDark={isDark}>
            <StatIcon $color="#22c55e" $isDark={isDark}>
              <MessageCircle size={20} />
            </StatIcon>
            <StatValue $isDark={isDark}>{engagement.comments.toLocaleString()}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Коментари' : 'Comments'}
            </StatLabel>
          </StatCard>

          <StatCard $isDark={isDark}>
            <StatIcon $color="#8b5cf6" $isDark={isDark}>
              <Share2 size={20} />
            </StatIcon>
            <StatValue $isDark={isDark}>{engagement.shares.toLocaleString()}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Споделяния' : 'Shares'}
            </StatLabel>
          </StatCard>

          <StatCard $isDark={isDark}>
            <StatIcon $color="#fbbf24" $isDark={isDark}>
              <TrendingUp size={20} />
            </StatIcon>
            <StatValue $isDark={isDark}>{totalEngagement.toLocaleString()}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Общо взаимодействие' : 'Total Engagement'}
            </StatLabel>
          </StatCard>

          <StatCard $isDark={isDark}>
            <StatIcon $color="#64748b" $isDark={isDark}>
              <Clock size={20} />
            </StatIcon>
            <StatValue $isDark={isDark}>
              {item.score.toFixed(1)}
            </StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Smart Score' : 'Smart Score'}
            </StatLabel>
          </StatCard>
        </StatsGrid>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FeedStatsModal;

