import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { ProfileType } from '../../contexts/ProfileTypeContext';

// ==================== TYPES ====================

interface VerificationBadgeProps {
  type: 'email' | 'phone' | 'identity' | 'business';
  status: 'unverified' | 'pending' | 'verified';
  profileType: ProfileType;
}

interface Theme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  gradient: string;
}

// ==================== THEMES ====================

const THEMES: Record<ProfileType, Theme> = {
  private: {
    primary: '#FF8F10',
    primaryDark: '#FF6B00',
    primaryLight: '#FFB84D',
    gradient: 'linear-gradient(135deg, #FF8F10, #FF6B00)'
  },
  dealer: {
    primary: '#2196F3',
    primaryDark: '#1976D2',
    primaryLight: '#64B5F6',
    gradient: 'linear-gradient(135deg, #2196F3, #1976D2)'
  },
  company: {
    primary: '#1565C0',
    primaryDark: '#0D47A1',
    primaryLight: '#1E88E5',
    gradient: 'linear-gradient(135deg, #1565C0, #0D47A1)'
  }
};

// ==================== ANIMATIONS ====================

const badgePulse = keyframes`
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
`;

const iconBounce = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// ==================== STYLED COMPONENTS ====================

const BadgeContainer = styled.div<{ $status: string; $theme: Theme }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  
  background: ${props =>
    props.$status === 'verified'
      ? 'rgba(76, 175, 80, 0.15)'
      : props.$status === 'pending'
      ? 'rgba(255, 152, 0, 0.15)'
      : 'rgba(244, 67, 54, 0.15)'};
  
  border: 1px solid ${props =>
    props.$status === 'verified'
      ? 'rgba(76, 175, 80, 0.3)'
      : props.$status === 'pending'
      ? 'rgba(255, 152, 0, 0.3)'
      : 'rgba(244, 67, 54, 0.3)'};
  
  transition: all 0.3s ease;
  cursor: default;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${props =>
      props.$status === 'verified'
        ? 'rgba(76, 175, 80, 0.5)'
        : props.$status === 'pending'
        ? 'rgba(255, 152, 0, 0.5)'
        : 'rgba(244, 67, 54, 0.5)'};
  }
`;

const BadgeIcon = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  
  color: ${props =>
    props.$status === 'verified'
      ? '#4CAF50'
      : props.$status === 'pending'
      ? '#FF9800'
      : '#F44336'};
  
  animation: ${props => props.$status === 'verified' ? iconBounce : 'none'} 2s ease-in-out infinite;
`;

const BadgeText = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BadgeGlow = styled.div<{ $color: string }>`
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: ${props => props.$color};
  filter: blur(8px);
  opacity: 0.3;
  z-index: -1;
  animation: ${badgePulse} 2s ease-in-out infinite;
`;

// ==================== COMPONENT ====================

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  status,
  profileType
}) => {
  const theme = THEMES[profileType];
  
  const getLabel = (verificationType: string, verificationStatus: string): string => {
    const labels: Record<string, Record<string, { bg: string; en: string }>> = {
      email: {
        verified: { bg: 'Имейл потвърден', en: 'Email Verified' },
        pending: { bg: 'Имейл в изчакване', en: 'Email Pending' },
        unverified: { bg: 'Имейл непотвърден', en: 'Email Unverified' }
      },
      phone: {
        verified: { bg: 'Телефон потвърден', en: 'Phone Verified' },
        pending: { bg: 'Телефон в изчакване', en: 'Phone Pending' },
        unverified: { bg: 'Телефон непотвърден', en: 'Phone Unverified' }
      },
      identity: {
        verified: { bg: 'Самоличност потвърдена', en: 'Identity Verified' },
        pending: { bg: 'Самоличност в изчакване', en: 'Identity Pending' },
        unverified: { bg: 'Самоличност непотвърдена', en: 'Identity Unverified' }
      },
      business: {
        verified: { bg: 'Бизнес потвърден', en: 'Business Verified' },
        pending: { bg: 'Бизнес в изчакване', en: 'Business Pending' },
        unverified: { bg: 'Бизнес непотвърден', en: 'Business Unverified' }
      }
    };
    
    // Default to Bulgarian
    return labels[verificationType]?.[verificationStatus]?.bg || labels[verificationType]?.[verificationStatus]?.en || 'Unknown';
  };
  
  return (
    <BadgeContainer $status={status} $theme={theme}>
      <BadgeIcon $status={status}>
        {status === 'verified' && <CheckCircle size={20} />}
        {status === 'pending' && <Clock size={20} />}
        {status === 'unverified' && <AlertCircle size={20} />}
      </BadgeIcon>
      
      <BadgeText>{getLabel(type, status)}</BadgeText>
      
      {status === 'verified' && (
        <BadgeGlow $color={theme.colors.primary.main} />
      )}
    </BadgeContainer>
  );
};

export default VerificationBadge;
