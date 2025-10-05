// src/components/Profile/TrustBadge.tsx
// Trust Badge Component - مكون عرض درجة الثقة والشارات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { Shield, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TrustLevel, Badge } from '../../services/profile/trust-score-service';

// ==================== STYLED COMPONENTS ====================

const TrustContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TrustHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TrustLevelDisplay = styled.div<{ $level: TrustLevel }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1.125rem;
  color: ${props => {
    switch (props.$level) {
      case 'premium': return '#FFD700';
      case 'verified': return '#4CAF50';
      case 'trusted': return '#2196F3';
      case 'basic': return '#FF9800';
      default: return '#9E9E9E';
    }
  }};
`;

const TrustScore = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $score: number }>`
  height: 100%;
  width: ${props => props.$score}%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const BadgeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid #e0e0e0;
  
  span.icon {
    font-size: 1.125rem;
  }
  
  span.name {
    color: #666;
    font-weight: 500;
  }
`;

const EmptyBadges = styled.div`
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 0.875rem;
`;

// ==================== COMPONENT ====================

interface TrustBadgeProps {
  trustScore: number;
  level: TrustLevel;
  badges?: Badge[];
}

const TrustBadgeComponent: React.FC<TrustBadgeProps> = ({
  trustScore,
  level,
  badges = []
}) => {
  const { t, language } = useLanguage();

  // Get level name
  const getLevelName = (): string => {
    const names = {
      unverified: { bg: 'Непотвърден', en: 'Unverified' },
      basic: { bg: 'Основен', en: 'Basic' },
      trusted: { bg: 'Доверен', en: 'Trusted' },
      verified: { bg: 'Потвърден', en: 'Verified' },
      premium: { bg: 'Премиум', en: 'Premium' }
    };

    return names[level][language];
  };

  // Get level icon
  const getLevelIcon = (): string => {
    const icons = {
      unverified: '❌',
      basic: '⚠️',
      trusted: '✅',
      verified: '🛡️',
      premium: '💎'
    };

    return icons[level];
  };

  return (
    <TrustContainer>
      {/* Header */}
      <TrustHeader>
        <TrustLevelDisplay $level={level}>
          <span>{getLevelIcon()}</span>
          <span>{getLevelName()}</span>
        </TrustLevelDisplay>
        <TrustScore>{trustScore}/100</TrustScore>
      </TrustHeader>

      {/* Progress Bar */}
      <ProgressBarContainer>
        <ProgressBar $score={trustScore} />
      </ProgressBarContainer>

      {/* Badges */}
      {badges.length > 0 ? (
        <BadgesContainer>
          {badges.map(badge => (
            <BadgeItem key={badge.id}>
              <span className="icon">{badge.icon}</span>
              <span className="name">
                {language === 'bg' ? badge.name : badge.nameEn}
              </span>
            </BadgeItem>
          ))}
        </BadgesContainer>
      ) : (
        <EmptyBadges>
          No badges yet. Complete verification to earn badges!
        </EmptyBadges>
      )}
    </TrustContainer>
  );
};

export default TrustBadgeComponent;
