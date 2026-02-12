// src/components/trust/TrustBadge.tsx
// Trust Badge Component - Bulgarian Trust Badge
// Purpose: Display "Гарантиран Продавач" (Guaranteed Seller) badge for verified users

import React from 'react';
import styled from 'styled-components';
import { Shield, CheckCircle, Award, Star } from 'lucide-react';
import type { TrustSystem } from '@/types/trust.types';
import { useLanguage } from '@/contexts';

/**
 * Trust Badge Props
 */
interface TrustBadgeProps {
  trustData: TrustSystem;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
}

/**
 * Trust Badge Component
 * Display trust badge based on verification level
 */
const TrustBadge: React.FC<TrustBadgeProps> = ({
  trustData,
  size = 'medium',
  showLabel = true,
  variant = 'compact',
  onClick
}) => {
  const { t, language } = useLanguage();

  // Determine color and icon based on verification level
  const getBadgeConfig = () => {
    if (trustData.verificationLevel === 'premium') {
      return {
        color: '#FFD700', // Gold
        bgColor: '#FFF9E6',
        icon: Award,
        labelBg: 'Гарантиран Продавач',
        labelEn: 'Guaranteed Seller',
        borderColor: '#FFD700'
      };
    } else if (trustData.verificationLevel === 'verified') {
      return {
        color: '#10B981', // Green
        bgColor: '#ECFDF5',
        icon: CheckCircle,
        labelBg: 'Потвърден',
        labelEn: 'Verified',
        borderColor: '#10B981'
      };
    } else {
      return {
        color: '#6B7280', // Gray
        bgColor: '#F3F4F6',
        icon: Shield,
        labelBg: 'Основен',
        labelEn: 'Basic',
        borderColor: '#D1D5DB'
      };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const label = language === 'bg' ? config.labelBg : config.labelEn;

  // Calculate trust percentage
  const trustPercentage = Math.round(trustData.trustScore);

  if (variant === 'compact') {
    return (
      <CompactBadge
        onClick={onClick}
        $color={config.color}
        $bgColor={config.bgColor}
        $borderColor={config.borderColor}
        $size={size}
        $clickable={!!onClick}
      >
        <Icon size={size === 'small' ? 14 : size === 'large' ? 24 : 18} />
        {showLabel && <Label $size={size}>{label}</Label>}
        {trustData.verificationLevel === 'premium' && (
          <Star size={12} fill={config.color} />
        )}
      </CompactBadge>
    );
  }

  // Detailed variant
  return (
    <DetailedBadge
      onClick={onClick}
      $color={config.color}
      $bgColor={config.bgColor}
      $borderColor={config.borderColor}
      $clickable={!!onClick}
    >
      <BadgeHeader>
        <Icon size={24} />
        <BadgeTitle>{label}</BadgeTitle>
      </BadgeHeader>
      <TrustScore>
        <ScoreLabel>
          {language === 'bg' ? 'Оценка на доверие' : 'Trust Score'}
        </ScoreLabel>
        <ScoreValue>{trustPercentage}%</ScoreValue>
      </TrustScore>
      <BadgeFeatures>
        {trustData.phoneVerified && (
          <Feature>
            <CheckCircle size={14} />
            <FeatureText>
              {language === 'bg' ? 'Телефон потвърден' : 'Phone Verified'}
            </FeatureText>
          </Feature>
        )}
        {trustData.idVerified && (
          <Feature>
            <CheckCircle size={14} />
            <FeatureText>
              {language === 'bg' ? 'Лична карта потвърдена' : 'ID Verified'}
            </FeatureText>
          </Feature>
        )}
        {trustData.businessVerified && (
          <Feature>
            <CheckCircle size={14} />
            <FeatureText>
              {language === 'bg' ? 'Компания потвърдена' : 'Business Verified'}
            </FeatureText>
          </Feature>
        )}
      </BadgeFeatures>
    </DetailedBadge>
  );
};

// ==================== STYLED COMPONENTS ====================

const CompactBadge = styled.div<{
  $color: string;
  $bgColor: string;
  $borderColor: string;
  $size: 'small' | 'medium' | 'large';
  $clickable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.$size === 'small' ? '4px' : props.$size === 'large' ? '8px' : '6px'};
  padding: ${props => props.$size === 'small' ? '4px 8px' : props.$size === 'large' ? '8px 16px' : '6px 12px'};
  background-color: ${props => props.$bgColor};
  color: ${props => props.$color};
  border: 2px solid ${props => props.$borderColor};
  border-radius: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '20px' : '16px'};
  font-size: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '16px' : '14px'};
  font-weight: 600;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;

  &:hover {
    ${props => props.$clickable && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `}
  }
`;

const Label = styled.span<{ $size: 'small' | 'medium' | 'large' }>`
  white-space: nowrap;
  font-size: ${props => props.$size === 'small' ? '11px' : props.$size === 'large' ? '15px' : '13px'};
`;

const DetailedBadge = styled.div<{
  $color: string;
  $bgColor: string;
  $borderColor: string;
  $clickable: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: ${props => props.$bgColor};
  border: 2px solid ${props => props.$borderColor};
  border-radius: 12px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;

  &:hover {
    ${props => props.$clickable && `
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    `}
  }
`;

const BadgeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
`;

const BadgeTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: inherit;
`;

const TrustScore = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
`;

const ScoreLabel = styled.span`
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
`;

const ScoreValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: inherit;
`;

const BadgeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #10B981;
`;

const FeatureText = styled.span`
  font-size: 12px;
  color: #374151;
`;

export default TrustBadge;
