/**
 * Seller Badge Display Component
 * عرض شارات البائع والتحقق
 * 
 * Displays all badges earned by seller with:
 * - Badge icon/name
 * - Verification date
 * - Badge type indication
 * 
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, 
  Award, 
  Shield, 
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';
import { TrustBadge, BadgeType } from '@/types/trust.types';
import { useLanguage } from '@/contexts/LanguageContext';

interface SellerBadgeDisplayProps {
  badges: TrustBadge[];
  sellerScore?: number;
  verificationLevel?: 'basic' | 'verified' | 'premium';
  compact?: boolean;
  showTooltip?: boolean;
}

// ==================== STYLES ====================

const Container = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$compact ? '8px' : '12px'};
  align-items: center;
`;

const BadgeWrapper = styled.div<{ $type: BadgeType }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => getBadgeColor(props.$type).bg};
  color: ${props => getBadgeColor(props.$type).text};
  border: 1.5px solid ${props => getBadgeColor(props.$type).border};
  transition: all 0.2s ease;
  cursor: help;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => getBadgeColor(props.$type).shadow};
  }
`;

const BadgeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
`;

const BadgeText = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const VerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 24px;
  background: rgba(59, 130, 246, 0.1);
  border: 1.5px solid #3b82f6;
  color: #3b82f6;
  font-weight: 700;
  font-size: 14px;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  margin-bottom: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;

  ${BadgeWrapper}:hover & {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

// ==================== BADGE COLORS ====================

function getBadgeColor(type: BadgeType) {
  const colors = {
    'email_verified': {
      bg: 'rgba(139, 92, 246, 0.1)',
      text: '#7c3aed',
      border: '#d8b4fe',
      shadow: 'rgba(139, 92, 246, 0.2)'
    },
    'phone_verified': {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#2563eb',
      border: '#bfdbfe',
      shadow: 'rgba(59, 130, 246, 0.2)'
    },
    'id_verified': {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: '#059669',
      border: '#a7f3d0',
      shadow: 'rgba(16, 185, 129, 0.2)'
    },
    'business_verified': {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#b45309',
      border: '#fde68a',
      shadow: 'rgba(245, 158, 11, 0.2)'
    },
    'fast_responder': {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: '#dc2626',
      border: '#fecaca',
      shadow: 'rgba(239, 68, 68, 0.2)'
    },
    'top_seller': {
      bg: 'rgba(168, 85, 247, 0.1)',
      text: '#a855f7',
      border: '#e9d5ff',
      shadow: 'rgba(168, 85, 247, 0.2)'
    },
    'trusted_dealer': {
      bg: 'rgba(34, 197, 94, 0.1)',
      text: '#15803d',
      border: '#bbf7d0',
      shadow: 'rgba(34, 197, 94, 0.2)'
    },
    'premium_seller': {
      bg: 'rgba(236, 72, 153, 0.1)',
      text: '#be185d',
      border: '#fbcfe8',
      shadow: 'rgba(236, 72, 153, 0.2)'
    },
  };

  return colors[type] || colors['email_verified'];
}

// ==================== BADGE ICON SELECTOR ====================

function getBadgeIcon(type: BadgeType) {
  const iconProps = { size: 16, strokeWidth: 2.5 };

  switch (type) {
    case 'email_verified':
      return <CheckCircle {...iconProps} />;
    case 'phone_verified':
      return <CheckCircle {...iconProps} />;
    case 'id_verified':
      return <Shield {...iconProps} />;
    case 'business_verified':
      return <Award {...iconProps} />;
    case 'fast_responder':
      return <Zap {...iconProps} />;
    case 'top_seller':
      return <Award {...iconProps} />;
    case 'trusted_dealer':
      return <Shield {...iconProps} />;
    case 'premium_seller':
      return <Award {...iconProps} />;
    default:
      return <CheckCircle {...iconProps} />;
  }
}

// ==================== BADGE LABEL SELECTOR ====================

function getBadgeLabel(type: BadgeType, language: 'bg' | 'en') {
  const labels = {
    'email_verified': { bg: 'Имейл проверен', en: 'Email Verified' },
    'phone_verified': { bg: 'Телефон проверен', en: 'Phone Verified' },
    'id_verified': { bg: 'Лична карта проверена', en: 'ID Verified' },
    'business_verified': { bg: 'Бизнес проверен', en: 'Business Verified' },
    'fast_responder': { bg: 'Бърз отговор', en: 'Fast Responder' },
    'top_seller': { bg: 'Топ продавач', en: 'Top Seller' },
    'trusted_dealer': { bg: 'Доверен търговец', en: 'Trusted Dealer' },
    'premium_seller': { bg: 'Премиум продавач', en: 'Premium Seller' },
  };

  return labels[type]?.[language] || type;
}

// ==================== MAIN COMPONENT ====================

export const SellerBadgeDisplay: React.FC<SellerBadgeDisplayProps> = ({
  badges = [],
  sellerScore,
  verificationLevel,
  compact = false,
  showTooltip = true
}) => {
  const { language } = useLanguage();

  if (!badges.length && !sellerScore && !verificationLevel) {
    return null;
  }

  const sortedBadges = [...badges].sort((a, b) => {
    // Priority: ID verification > Business > Others
    const priority: Record<BadgeType, number> = {
      'id_verified': 0,
      'business_verified': 1,
      'email_verified': 2,
      'phone_verified': 3,
      'fast_responder': 4,
      'top_seller': 5,
      'trusted_dealer': 6,
      'premium_seller': 7,
    };
    return (priority[a.type] ?? 99) - (priority[b.type] ?? 99);
  });

  return (
    <Container $compact={compact}>
      {/* Seller Score */}
      {sellerScore !== undefined && sellerScore > 0 && (
        <ScoreDisplay title={`Trust Score: ${sellerScore}/100`}>
          <Award size={16} />
          {sellerScore}%
        </ScoreDisplay>
      )}

      {/* Verification Level Badge */}
      {verificationLevel === 'verified' && (
        <VerificationBadge title="Email & Phone Verified">
          <CheckCircle size={16} />
          {language === 'bg' ? 'Проверен' : 'Verified'}
        </VerificationBadge>
      )}

      {verificationLevel === 'premium' && (
        <VerificationBadge title="Premium Verified Seller">
          <Shield size={16} />
          {language === 'bg' ? 'Премиум' : 'Premium'}
        </VerificationBadge>
      )}

      {/* Individual Badges */}
      {sortedBadges.map(badge => (
        <BadgeWrapper
          key={`${badge.type}-${badge.verifiedAt}`}
          $type={badge.type}
          title={`${getBadgeLabel(badge.type, language)} • Verified on ${new Date(badge.verifiedAt).toLocaleDateString()}`}
        >
          <BadgeIcon>
            {getBadgeIcon(badge.type)}
          </BadgeIcon>
          <BadgeText>
            {getBadgeLabel(badge.type, language)}
          </BadgeText>
          {showTooltip && (
            <Tooltip>
              {language === 'bg' ? 'Проверен' : 'Verified'}
            </Tooltip>
          )}
        </BadgeWrapper>
      ))}
    </Container>
  );
};

export default SellerBadgeDisplay;
