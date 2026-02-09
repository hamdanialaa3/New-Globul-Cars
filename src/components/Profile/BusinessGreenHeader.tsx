/**
 * Business Header Component (Dynamic Colors)
 * شريط ديناميكي احترافي تحت الصورة الشخصية
 * يحتوي على معلومات المستخدم والإحصائيات والأزرار
 * يدعم الوضع الفاتح والغامق واللغات (BG/EN) والاستجابة الكاملة
 * 🎨 COLORS: Private=Orange, Dealer=Green, Company=Blue
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageCircle, UserPlus, UserCheck, Shield, Phone as PhoneIcon, RefreshCw, Crown } from 'lucide-react';
import BlockUserButton from '../messaging/BlockUserButton';
import { FollowButton as StyledFollowButton } from '../../pages/03_user-pages/profile/ProfilePage/TabNavigation.styles';
import FollowButton from '../social/FollowButton';
import type { BulgarianUser } from '../../types/user/bulgarian-user.types';
import { usePromotionalOffer } from '../../hooks/usePromotionalOffer';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';

// ==================== COLOR CONFIGURATIONS ====================
// 🟧 Private (Personal) = ORANGE
// 🟩 Dealer = GREEN  
// 🟦 Company = BLUE
const HEADER_COLORS = {
  private: {
    light: 'linear-gradient(135deg, rgba(255, 143, 16, 0.98) 0%, rgba(255, 159, 42, 0.95) 50%, rgba(255, 121, 0, 0.98) 100%)',
    dark: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(255, 143, 16, 0.9) 28%)',
    border: 'rgba(255, 143, 16, 0.6)',
    shadow: 'rgba(255, 143, 16, 0.2)',
  },
  dealer: {
    light: 'linear-gradient(135deg, rgba(16, 163, 74, 0.98) 0%, rgba(34, 197, 94, 0.95) 50%, rgba(22, 163, 74, 0.98) 100%)',
    dark: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(34, 197, 94, 0.9) 28%)',
    border: 'rgba(34, 197, 94, 0.6)',
    shadow: 'rgba(16, 163, 74, 0.2)',
  },
  company: {
    light: 'linear-gradient(135deg, rgba(29, 78, 216, 0.98) 0%, rgba(59, 130, 246, 0.95) 50%, rgba(30, 64, 175, 0.98) 100%)',
    dark: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(59, 130, 246, 0.9) 28%)',
    border: 'rgba(59, 130, 246, 0.6)',
    shadow: 'rgba(29, 78, 216, 0.2)',
  },
};

// ==================== STYLED COMPONENTS ====================

const GreenHeaderContainer = styled.div<{ $isDark: boolean; $profileType?: 'private' | 'dealer' | 'company' }>`
  position: relative;
  width: 100%;
  background: ${props => {
    const colors = HEADER_COLORS[props.$profileType || 'dealer'];
    return props.$isDark ? colors.dark : colors.light;
  }};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 3px solid ${props => {
    const colors = HEADER_COLORS[props.$profileType || 'dealer'];
    return colors.border;
  }};
  box-shadow: ${props => {
    const colors = HEADER_COLORS[props.$profileType || 'dealer'];
    return `0 4px 16px ${colors.shadow}, 0 2px 8px ${colors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`;
  }};
  padding: 24px 36px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;
  margin-top: 60px;
  margin-bottom: 24px;
  border-radius: 16px;
  
  /* Desktop Layout */
  @media (min-width: 1025px) {
    padding: 28px 48px;
    gap: 24px;
    margin-top: 60px;
  }
  
  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 22px 36px;
    gap: 20px;
    margin-top: 50px;
  }
  
  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px 20px;
    gap: 16px;
    align-items: stretch;
    margin-top: 40px;
  }
  
  /* Small Mobile */
  @media (max-width: 480px) {
    padding: 14px 16px;
    gap: 12px;
    margin-top: 30px;
  }
`;
const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const UserInfoSection = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
  max-width: 280px;
  flex-shrink: 1;
  
  @media (max-width: 768px) {
    min-width: auto;
    max-width: 100%;
    width: 100%;
    text-align: center;
    align-items: center;
  }
`;

const UserName = styled.h2<{ $isDark: boolean }>`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: ${props => props.$isDark ? '#f0fdf4' : '#ffffff'};
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const UserEmail = styled.div<{ $isDark: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$isDark ? 'rgba(240, 253, 244, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
  font-weight: 500;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// 🎨 LED STRIP ANIMATION - Pulsing glow effect
const ledPulse = css`
  @keyframes ledPulse {
    0% {
      opacity: 1;
      box-shadow: 
        0 0 5px currentColor,
        0 0 10px currentColor,
        0 0 20px currentColor,
        0 0 30px currentColor;
    }
    50% {
      opacity: 0.6;
      box-shadow: 
        0 0 2px currentColor,
        0 0 5px currentColor,
        0 0 10px currentColor;
    }
    100% {
      opacity: 1;
      box-shadow: 
        0 0 5px currentColor,
        0 0 10px currentColor,
        0 0 20px currentColor,
        0 0 30px currentColor;
    }
  }
`;

const ledSweep = css`
  @keyframes ledSweep {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

// 🌟 LED SUBSCRIPTION BADGE - Premium animated badge
const AccountTypeBadge = styled.div<{ $isDark: boolean; $profileType?: 'private' | 'dealer' | 'company' }>`
  ${ledPulse}
  ${ledSweep}
  
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-top: 4px;
  
  /* Dynamic background based on profile type */
  background: ${props => {
    const colors = {
      private: 'linear-gradient(90deg, rgba(255, 143, 16, 0.15) 0%, rgba(255, 121, 0, 0.25) 50%, rgba(255, 143, 16, 0.15) 100%)',
      dealer: 'linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.25) 50%, rgba(34, 197, 94, 0.15) 100%)',
      company: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.25) 50%, rgba(59, 130, 246, 0.15) 100%)'
    };
    return colors[props.$profileType || 'private'];
  }};
  
  /* LED Strip Border */
  border: 2px solid ${props => {
    const colors = { private: '#FF8F10', dealer: '#22c55e', company: '#3b82f6' };
    return colors[props.$profileType || 'private'];
  }};
  border-radius: 25px;
  
  /* LED Glow Color */
  color: ${props => {
    const colors = { private: '#FF8F10', dealer: '#22c55e', company: '#3b82f6' };
    return colors[props.$profileType || 'private'];
  }};
  
  /* Pulsing LED Animation */
  animation: ledPulse 2s ease-in-out infinite;
  
  /* Glass effect */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* LED Sweep Effect Overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 25px;
    background: ${props => {
      const colors = { private: '#FF8F10', dealer: '#22c55e', company: '#3b82f6' };
      const color = colors[props.$profileType || 'private'];
      return `linear-gradient(90deg, transparent 0%, ${color}40 50%, transparent 100%)`;
    }};
    background-size: 200% 100%;
    animation: ledSweep 3s linear infinite;
    pointer-events: none;
  }
  
  /* Inner glow line */
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    left: 10%;
    right: 10%;
    height: 2px;
    background: ${props => {
      const colors = { private: '#FF8F10', dealer: '#22c55e', company: '#3b82f6' };
      const color = colors[props.$profileType || 'private'];
      return `linear-gradient(90deg, transparent, ${color}, transparent)`;
    }};
    border-radius: 2px;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.7rem;
  }
  
  @media (max-width: 480px) {
    padding: 5px 10px;
  }
`;

const BadgeIcon = styled.div<{ $profileType?: 'private' | 'dealer' | 'company' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    const colors = { private: '#FF8F10', dealer: '#22c55e', company: '#3b82f6' };
    return colors[props.$profileType || 'private'];
  }};
  filter: drop-shadow(0 0 4px currentColor);
`;

const BadgeText = styled.div<{ $profileType?: 'private' | 'dealer' | 'company' }>`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const BadgeTitle = styled.span<{ $profileType?: 'private' | 'dealer' | 'company' }>`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => {
    const colors = { private: '#FF8F10', dealer: '#22c55e', company: '#3b82f6' };
    return colors[props.$profileType || 'private'];
  }};
  text-shadow: 0 0 10px currentColor;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const BadgeSubtitle = styled.span`
  font-size: 0.55rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
  }
`;

const StatsSection = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 10px;
    width: 100%;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    justify-content: space-around;
  }
`;

const StatItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 90px;
  padding: 12px 16px;
  background: ${props => props.$isDark 
    ? 'rgba(34, 197, 94, 0.15)' 
    : 'rgba(255, 255, 255, 0.15)'};
  border: 1px solid ${props => props.$isDark 
    ? 'rgba(34, 197, 94, 0.3)' 
    : 'rgba(255, 255, 255, 0.25)'};
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    min-width: auto;
    flex: 1;
    padding: 8px 10px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    min-width: 0;
  }
`;

const StatValue = styled.div<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${props => props.$isDark ? '#dcfce7' : '#ffffff'};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$isDark ? 'rgba(220, 252, 231, 0.8)' : 'rgba(255, 255, 255, 0.85)'};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    gap: 8px;
    
    > * {
      width: 100%;
    }
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger'; $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  white-space: nowrap;
  min-width: 110px;
  
  ${props => {
    if (props.$variant === 'primary') {
      return css`
        background: ${props.$isDark 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(255, 255, 255, 0.25)'};
        color: ${props.$isDark ? '#f0fdf4' : '#ffffff'};
        border: 1px solid ${props.$isDark 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(255, 255, 255, 0.4)'};
        
        &:hover {
          background: ${props.$isDark 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(255, 255, 255, 0.35)'};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return css`
        background: ${props.$isDark 
          ? 'rgba(34, 197, 94, 0.2)' 
          : 'rgba(255, 255, 255, 0.15)'};
        color: ${props.$isDark ? '#dcfce7' : '#ffffff'};
        border: 1px solid ${props.$isDark 
          ? 'rgba(34, 197, 94, 0.4)' 
          : 'rgba(255, 255, 255, 0.3)'};
        
        &:hover {
          background: ${props.$isDark 
            ? 'rgba(34, 197, 94, 0.3)' 
            : 'rgba(255, 255, 255, 0.25)'};
          transform: translateY(-2px);
        }
      `;
    }
    if (props.$variant === 'danger') {
      return css`
        background: ${props.$isDark 
          ? 'rgba(239, 68, 68, 0.2)' 
          : 'rgba(239, 68, 68, 0.25)'};
        color: ${props.$isDark ? '#fecaca' : '#ffffff'};
        border: 1px solid ${props.$isDark 
          ? 'rgba(239, 68, 68, 0.4)' 
          : 'rgba(239, 68, 68, 0.4)'};
        
        &:hover {
          background: ${props.$isDark 
            ? 'rgba(239, 68, 68, 0.3)' 
            : 'rgba(239, 68, 68, 0.35)'};
          transform: translateY(-2px);
        }
      `;
    }
  }}
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.8125rem;
    min-width: 100px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 0.75rem;
    min-width: auto;
    width: 100%;
  }
`;

const FollowButtonWrapper = styled.div`
  @media (max-width: 480px) {
    width: 100%;
    
    button {
      width: 100%;
    }
  }
`;

// ==================== COMPONENT ====================

interface BusinessGreenHeaderProps {
  user: BulgarianUser | null;
  viewer: BulgarianUser | null;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  syncing?: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onProfileSwitch?: (newType: 'private' | 'dealer' | 'company') => void;
  onGoogleSync?: () => void;
  onBlockChanged?: (isBlocked: boolean) => void;
}

export const BusinessGreenHeader: React.FC<BusinessGreenHeaderProps> = ({
  user,
  viewer,
  isOwnProfile,
  isFollowing,
  followLoading,
  syncing = false,
  onFollow,
  onMessage,
  onProfileSwitch,
  onGoogleSync,
  onBlockChanged
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isFreeOffer } = usePromotionalOffer();

  // Dynamic plan labels based on free offer state
  const dealerPrice = `€${SUBSCRIPTION_PLANS.dealer.price.monthly}`;
  const companyPrice = `€${SUBSCRIPTION_PLANS.company.price.monthly}`;
  const dealerListings = SUBSCRIPTION_PLANS.dealer.features.maxListings;
  const companyListings = SUBSCRIPTION_PLANS.company.features.maxListings === -1 ? '∞' : SUBSCRIPTION_PLANS.company.features.maxListings;

  if (!user) return null;

  // ✅ STRICT: Show personal name (firstName + lastName)
  const userAny = user as any;
  const personalName = `${userAny.firstName || ''} ${userAny.lastName || ''}`.trim();
  const displayName = personalName || user.displayName || (language === 'bg' ? 'Анонимен' : 'Anonymous');
  const email = user.email || '';
  const userProfileType = (user.profileType as 'private' | 'dealer' | 'company') || 'private';
  
  // 🎨 Dynamic account type labels
  const accountTypeLabels = {
    private: { 
      title: language === 'bg' ? 'ЛИЧЕН' : 'PERSONAL',
      subtitle: language === 'bg' ? 'Безплатен план' : 'Free Plan'
    },
    dealer: { 
      title: language === 'bg' ? 'ДИЛЪР' : 'DEALER',
      subtitle: language === 'bg' ? 'Бизнес план' : 'Business Plan'
    },
    company: { 
      title: language === 'bg' ? 'КОМПАНИЯ' : 'COMPANY',
      subtitle: language === 'bg' ? 'Корпоративен план' : 'Corporate Plan'
    }
  };
  
  const accountLabel = accountTypeLabels[userProfileType];
  
  const stats = {
    views: user.stats?.totalViews || 0,
    listings: user.stats?.activeListings || 0,
    trust: user.stats?.trustScore || 0,
    followers: (user.stats as any)?.followersCount || 0,
    following: (user.stats as any)?.followingCount || 0
  };

  return (
    <GreenHeaderContainer $isDark={isDark} $profileType={userProfileType}>
      <HeaderContent>
        {/* User Info Section */}
        <UserInfoSection $isDark={isDark}>
          <UserName $isDark={isDark}>{displayName}</UserName>
          <UserEmail $isDark={isDark}>{email}</UserEmail>
          
          {/* 🌟 LED Subscription Badge */}
          <AccountTypeBadge $isDark={isDark} $profileType={userProfileType}>
            <BadgeIcon $profileType={userProfileType}>
              {userProfileType === 'company' ? <Crown size={14} /> : <Shield size={14} />}
            </BadgeIcon>
            <BadgeText>
              <BadgeTitle $profileType={userProfileType}>{accountLabel.title}</BadgeTitle>
              <BadgeSubtitle>{accountLabel.subtitle}</BadgeSubtitle>
            </BadgeText>
          </AccountTypeBadge>
        </UserInfoSection>

        {/* Stats Section */}
        <StatsSection>
          <StatItem $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.views}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Прегледи' : 'Views'}
            </StatLabel>
          </StatItem>
          <StatItem $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.listings}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Обяви' : 'Listings'}
            </StatLabel>
          </StatItem>
          <StatItem $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.trust}%</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Доверие' : 'Trust'}
            </StatLabel>
          </StatItem>
          <StatItem $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.followers}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Следващи' : 'Followers'}
            </StatLabel>
          </StatItem>
          <StatItem $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.following}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Следва' : 'Following'}
            </StatLabel>
          </StatItem>
        </StatsSection>
      </HeaderContent>

      {/* Actions Section */}
      <ActionsSection>
        {isOwnProfile ? (
          <>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
              <Crown size={14} style={{ position: 'absolute', left: '10px', zIndex: 1, pointerEvents: 'none', color: '#fbbf24' }} />
              <select
                value={user.profileType || 'private'}
                onChange={(e) => onProfileSwitch?.(e.target.value as 'private' | 'dealer' | 'company')}
                disabled={syncing}
                style={{
                  appearance: 'none',
                  padding: '6px 12px 6px 28px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.4)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                  color: isDark ? '#f0fdf4' : '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  outline: 'none'
                }}
              >
                <option value="private" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f0fdf4' : '#1a1a1a' }}>
                  {language === 'bg' ? 'Частен (Безплатен, 3 обяви)' : 'Private (Free, 3 cars)'}
                </option>
                <option value="dealer" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f0fdf4' : '#1a1a1a' }}>
                  {isFreeOffer
                    ? (language === 'bg' ? `Търговец (БЕЗПЛАТНО ✨, ${dealerListings} обяви)` : `Dealer (FREE ✨, ${dealerListings} cars)`)
                    : (language === 'bg' ? `Търговец (${dealerPrice}/мес, ${dealerListings} обяви)` : `Dealer (${dealerPrice}/mo, ${dealerListings} cars)`)}
                </option>
                <option value="company" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f0fdf4' : '#1a1a1a' }}>
                  {isFreeOffer
                    ? (language === 'bg' ? `Компания (БЕЗПЛАТНО ✨, ${companyListings} обяви)` : `Company (FREE ✨, ${companyListings} cars)`)
                    : (language === 'bg' ? `Компания (${companyPrice}/мес, ${companyListings} обяви)` : `Company (${companyPrice}/mo, ${companyListings} cars)`)}
                </option>
              </select>
            </div>

            <ActionButton 
              $variant="secondary" 
              $isDark={isDark}
              onClick={onGoogleSync}
            >
              <RefreshCw size={14} className={syncing ? 'spinning' : ''} />
              {syncing
                ? (language === 'bg' ? 'Синхронизиране...' : 'Syncing...')
                : (language === 'bg' ? 'Синхронизирай' : 'Sync')}
            </ActionButton>
          </>
        ) : (
          <>
            <FollowButtonWrapper>
              <FollowButton
                targetUserId={user.uid}
                initialIsFollowing={isFollowing}
                onStatusChange={(status) => {
                  onFollow(); // Let parent know something changed
                }}
                accentColor={
                  userProfileType === 'company' ? '#1d4ed8' : 
                  userProfileType === 'dealer' ? '#16a34a' : '#FF8F10'
                }
              />
            </FollowButtonWrapper>
            
            <ActionButton 
              $variant="primary" 
              $isDark={isDark}
              onClick={onMessage}
            >
              <PhoneIcon size={16} />
              {language === 'bg' ? 'Съобщение' : 'Message'}
            </ActionButton>
            
            {viewer?.uid && user?.uid && viewer.uid !== user.uid && (
              <BlockUserButton
                targetUserFirebaseId={user.uid}
                targetUserNumericId={user.numericId}
                targetUserName={user.displayName || user.email}
                size="medium"
                variant="secondary"
                onBlockChanged={onBlockChanged}
              />
            )}
          </>
        )}
      </ActionsSection>
    </GreenHeaderContainer>
  );
};

export default BusinessGreenHeader;
