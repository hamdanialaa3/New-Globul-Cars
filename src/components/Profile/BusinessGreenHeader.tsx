/**
 * Business Header Component (Dynamic Colors)
 * شريط ديناميكي احترافي تحت الصورة الشخصية
 * يحتوي على معلومات المستخدم والإحصائيات والأزرار
 * يدعم الوضع الفاتح والغامق واللغات (BG/EN) والاستجابة الكاملة
 * 🎨 COLORS: Private=Orange, Dealer=Green, Company=Blue
 */

import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageCircle, UserPlus, UserCheck, Shield, Phone as PhoneIcon, RefreshCw, Crown, ChevronDown, Handshake } from 'lucide-react';
import BlockUserButton from '../messaging/BlockUserButton';
import { FollowButton as StyledFollowButton } from '../../pages/03_user-pages/profile/ProfilePage/TabNavigation.styles';
import FollowButton from '../social/FollowButton';
import type { BulgarianUser } from '../../types/user/bulgarian-user.types';
import { usePromotionalOffer } from '../../hooks/usePromotionalOffer';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';

// ==================== COLOR CONFIGURATIONS ====================
// 🟧 Private (Personal) = ORANGE
// 🟩 Dealer = GREEN  
// 🟦 Company = BLUE
const HEADER_COLORS = {
  private: {
    light: 'linear-gradient(135deg, rgba(255, 122, 45, 0.98) 0%, rgba(229, 99, 26, 0.95) 50%, rgba(255, 159, 42, 0.98) 100%)',
    dark: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(255, 122, 45, 0.9) 28%)',
    border: 'rgba(255, 122, 45, 0.6)',
    shadow: 'rgba(255, 122, 45, 0.2)',
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
  --accent-rgb: ${props => {
    const colors = {
      private: '255, 122, 45',
      dealer: '34, 197, 94',
      company: '59, 130, 246',
    };
    return colors[props.$profileType || 'dealer'];
  }};
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
      private: 'linear-gradient(90deg, rgba(255, 159, 42, 0.15) 0%, rgba(255, 122, 45, 0.25) 50%, rgba(255, 159, 42, 0.15) 100%)',
      dealer: 'linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.25) 50%, rgba(34, 197, 94, 0.15) 100%)',
      company: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.25) 50%, rgba(59, 130, 246, 0.15) 100%)'
    };
    return colors[props.$profileType || 'private'];
  }};
  
  /* LED Strip Border */
  border: 2px solid ${props => {
    const colors = { private: '#FF7A2D', dealer: '#22c55e', company: '#3b82f6' };
    return colors[props.$profileType || 'private'];
  }};
  border-radius: 25px;
  
  /* LED Glow Color */
  color: ${props => {
    const colors = { private: '#FF7A2D', dealer: '#22c55e', company: '#3b82f6' };
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
      const colors = { private: '#FF7A2D', dealer: '#22c55e', company: '#3b82f6' };
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
      const colors = { private: '#FF7A2D', dealer: '#22c55e', company: '#3b82f6' };
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
    const colors = { private: '#FF7A2D', dealer: '#22c55e', company: '#3b82f6' };
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
    const colors = { private: '#FF7A2D', dealer: '#22c55e', company: '#3b82f6' };
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
    ? 'rgba(var(--accent-rgb), 0.15)' 
    : 'rgba(255, 255, 255, 0.15)'};
  border: 1px solid ${props => props.$isDark 
    ? 'rgba(var(--accent-rgb), 0.3)' 
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

// ==================== PLAN SELECTOR – PRECISION CONTROL PANEL ====================

const ledGlow = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

const PLAN_ACCENTS: Record<'private' | 'dealer' | 'company', { hex: string; rgb: string }> = {
  private: { hex: '#FF7A2D', rgb: '255, 122, 45' },
  dealer:  { hex: '#22c55e', rgb: '34, 197, 94' },
  company: { hex: '#3b82f6', rgb: '59, 130, 246' },
};

const RAIL_POSITIONS: Record<'private' | 'dealer' | 'company', number> = {
  private: 16.67, dealer: 50, company: 83.33,
};

/* Outer chassis — machined aluminum bezel */
const PlanDock = styled.div<{ $isDark: boolean }>`
  min-width: 320px;
  max-width: 460px;
  padding: 3px;
  border-radius: 18px;
  background: ${p => p.$isDark
    ? 'linear-gradient(174deg, #2e3240 0%, #1f222b 50%, #181a22 100%)'
    : 'linear-gradient(174deg, #e4e9f0 0%, #d6dce6 50%, #cbd3df 100%)'};
  box-shadow:
    0 4px 20px rgba(0,0,0,${p => p.$isDark ? '0.5' : '0.12'}),
    0 1px 3px rgba(0,0,0,${p => p.$isDark ? '0.3' : '0.08'}),
    inset 0 1px 0 ${p => p.$isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.7)'},
    inset 0 -1px 0 ${p => p.$isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.06)'};

  @media (max-width: 768px) {
    min-width: 100%;
    max-width: 100%;
  }
`;

/* Inner recessed panel area */
const DockInner = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 10px 10px;
  border-radius: 15px;
  background: ${p => p.$isDark
    ? 'linear-gradient(180deg, #14161c 0%, #181b22 100%)'
    : 'linear-gradient(180deg, #f2f5f9 0%, #e9edf3 100%)'};
  box-shadow:
    inset 0 2px 6px ${p => p.$isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.05)'},
    inset 0 -1px 0 ${p => p.$isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)'};
`;

/* Engraved header label */
const DockLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-align: center;
  padding-bottom: 4px;
  color: ${p => p.$isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.26)'};
  text-shadow: ${p => p.$isDark
    ? '0 1px 0 rgba(255,255,255,0.04)'
    : '0 1px 0 rgba(255,255,255,0.8)'};
`;

/* 3-column grid for the pushbutton modules */
const PlanModules = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`;

/* Individual pushbutton — physical press-in / raised states */
const PlanModule = styled.button<{
  $isDark: boolean;
  $active: boolean;
  $accentHex: string;
  $accentRgb: string;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 4px 10px;
  border-radius: 11px;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

  ${p => p.$active ? css`
    background: ${p.$isDark
      ? `linear-gradient(174deg, rgba(${p.$accentRgb}, 0.15) 0%, rgba(${p.$accentRgb}, 0.05) 100%)`
      : `linear-gradient(174deg, rgba(${p.$accentRgb}, 0.12) 0%, rgba(${p.$accentRgb}, 0.03) 100%)`};
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,${p.$isDark ? '0.5' : '0.06'}),
      inset 0 0 0 1.5px rgba(${p.$accentRgb}, 0.4),
      0 0 18px rgba(${p.$accentRgb}, 0.1);
    transform: scale(0.97) translateY(1px);
  ` : css`
    background: ${p.$isDark
      ? 'linear-gradient(174deg, #242830 0%, #1e2128 100%)'
      : 'linear-gradient(174deg, #ffffff 0%, #f5f7fa 100%)'};
    box-shadow:
      0 2px 6px rgba(0,0,0,${p.$isDark ? '0.32' : '0.07'}),
      inset 0 1px 0 ${p.$isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)'},
      inset 0 -1px 0 ${p.$isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'};
    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 6px 18px rgba(0,0,0,${p.$isDark ? '0.45' : '0.12'}),
        inset 0 1px 0 ${p.$isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.95)'};
    }
    &:active { transform: scale(0.97) translateY(1px); }
  `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }
`;

/* Status LED — glowing dot for the active module */
const ModuleLED = styled.div<{ $active: boolean; $color: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p => p.$active ? p.$color : 'rgba(128,128,128,0.2)'};
  box-shadow: ${p => p.$active
    ? `0 0 4px ${p.$color}, 0 0 12px ${p.$color}55`
    : 'inset 0 1px 2px rgba(0,0,0,0.3)'};
  transition: all 0.4s ease;
  ${p => p.$active && css`animation: ${ledGlow} 2.8s ease-in-out infinite;`}
`;

/* Icon wrapper — scales up when active */
const ModuleIcon = styled.div<{ $active: boolean; $color: string; $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$active
    ? p.$color
    : (p.$isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.16)')};
  transition: color 0.4s ease, transform 0.4s ease;
  ${p => p.$active && 'transform: scale(1.12);'}
`;

/* Plan name — bold uppercase label */
const ModuleName = styled.div<{ $active: boolean; $isDark: boolean }>`
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.$active
    ? (p.$isDark ? '#f0f4f8' : '#1a1f2e')
    : (p.$isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.26)')};
  transition: color 0.4s ease;
`;

/* Price & listing count */
const ModuleMeta = styled.div<{ $active: boolean; $isDark: boolean }>`
  font-size: 0.56rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.35;
  color: ${p => p.$active
    ? (p.$isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)')
    : (p.$isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)')};
  transition: color 0.4s ease;
`;

/* Groove rail connecting the three modules */
const PlanRail = styled.div<{ $isDark: boolean }>`
  position: relative;
  height: 3px;
  margin: 2px 24px 0;
  border-radius: 2px;
  background: ${p => p.$isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'};
  box-shadow: inset 0 1px 2px ${p => p.$isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.04)'};
`;

/* Sliding rail cursor — follows the active module with spring physics */
const RailCursor = styled.div<{ $pos: number; $color: string }>`
  position: absolute;
  top: 50%;
  left: ${p => `${p.$pos}%`};
  width: 22px;
  height: 5px;
  border-radius: 3px;
  background: ${p => p.$color};
  transform: translate(-50%, -50%);
  transition:
    left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.4s ease;
  box-shadow:
    0 0 6px ${p => `${p.$color}99`},
    0 0 18px ${p => `${p.$color}33`};
`;

/* LCD readout — monospace terminal display for status messages */
const DockReadout = styled.div<{ $isDark: boolean }>`
  font-size: 0.68rem;
  line-height: 1.5;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${p => p.$isDark
    ? 'linear-gradient(180deg, #0c0e13 0%, #10121a 100%)'
    : 'linear-gradient(180deg, #eaeff5 0%, #e1e6ee 100%)'};
  color: ${p => p.$isDark ? 'rgba(130, 210, 170, 0.8)' : 'rgba(30, 60, 45, 0.72)'};
  box-shadow:
    inset 0 1px 4px ${p => p.$isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.04)'},
    inset 0 -1px 0 ${p => p.$isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)'};
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: 0.01em;
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
          ? 'rgba(var(--accent-rgb), 0.2)' 
          : 'rgba(255, 255, 255, 0.15)'};
        color: ${props.$isDark ? '#dcfce7' : '#ffffff'};
        border: 1px solid ${props.$isDark 
          ? 'rgba(var(--accent-rgb), 0.4)' 
          : 'rgba(255, 255, 255, 0.3)'};
        
        &:hover {
          background: ${props.$isDark 
            ? 'rgba(var(--accent-rgb), 0.3)' 
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
  onConnect?: () => void;
  connectLoading?: boolean;
  isConnected?: boolean;
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
  onBlockChanged,
  onConnect,
  connectLoading = false,
  isConnected = false
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isFreeOffer } = usePromotionalOffer();
  const { settings } = useSiteSettings();
  const subscriptionMode = settings.pricing?.subscriptionMode === 'free' ? 'free' : 'paid';
  const canActivateWithoutPayment = subscriptionMode === 'free';

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
  const userProfileType = ((user.planTier === 'free' ? 'private' : user.profileType) as 'private' | 'dealer' | 'company') || 'private';
  
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

  const switcherHint = canActivateWithoutPayment
    ? (language === 'bg'
      ? 'Изборът на Търговец или Компания ще активира плана веднага без плащане, докато режимът за безплатни абонаменти е активен.'
      : 'Choosing Dealer or Company will activate the plan instantly without payment while free subscriptions mode is active.')
    : (language === 'bg'
      ? 'Изборът на Търговец или Компания ще ви пренасочи към плащане. Връщането към Личен профил остава безплатно.'
      : 'Choosing Dealer or Company will redirect you to payment. Switching back to Personal remains free.');

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
            <PlanDock $isDark={isDark}>
              <DockInner $isDark={isDark}>
                <DockLabel $isDark={isDark}>
                  {language === 'bg' ? 'ТИП АКАУНТ' : 'ACCOUNT TYPE'}
                </DockLabel>

                <PlanModules>
                  {([
                    {
                      type: 'private' as const,
                      icon: <Shield size={18} />,
                      name: language === 'bg' ? 'Личен' : 'Personal',
                      meta: language === 'bg' ? 'Безплатно · 3 обяви' : 'Free · 3 cars',
                    },
                    {
                      type: 'dealer' as const,
                      icon: <Shield size={18} />,
                      name: language === 'bg' ? 'Търговец' : 'Dealer',
                      meta: canActivateWithoutPayment
                        ? (language === 'bg' ? `Активирай · ${dealerListings} обяви` : `Activate · ${dealerListings} cars`)
                        : (language === 'bg' ? `${dealerPrice}/мес · ${dealerListings} обяви` : `${dealerPrice}/mo · ${dealerListings} cars`),
                    },
                    {
                      type: 'company' as const,
                      icon: <Crown size={18} />,
                      name: language === 'bg' ? 'Компания' : 'Company',
                      meta: canActivateWithoutPayment
                        ? (language === 'bg' ? `Активирай · ${companyListings} обяви` : `Activate · ${companyListings} cars`)
                        : (language === 'bg' ? `${companyPrice}/мес · ${companyListings} обяви` : `${companyPrice}/mo · ${companyListings} cars`),
                    },
                  ]).map(plan => {
                    const accent = PLAN_ACCENTS[plan.type];
                    const isActive = userProfileType === plan.type;
                    return (
                      <PlanModule
                        key={plan.type}
                        $isDark={isDark}
                        $active={isActive}
                        $accentHex={accent.hex}
                        $accentRgb={accent.rgb}
                        onClick={() => onProfileSwitch?.(plan.type)}
                        disabled={syncing}
                      >
                        <ModuleLED $active={isActive} $color={accent.hex} />
                        <ModuleIcon $active={isActive} $color={accent.hex} $isDark={isDark}>
                          {plan.icon}
                        </ModuleIcon>
                        <ModuleName $active={isActive} $isDark={isDark}>
                          {plan.name}
                        </ModuleName>
                        <ModuleMeta $active={isActive} $isDark={isDark}>
                          {plan.meta}
                        </ModuleMeta>
                      </PlanModule>
                    );
                  })}
                </PlanModules>

                <PlanRail $isDark={isDark}>
                  <RailCursor
                    $pos={RAIL_POSITIONS[userProfileType]}
                    $color={PLAN_ACCENTS[userProfileType].hex}
                  />
                </PlanRail>

                <DockReadout $isDark={isDark}>
                  {switcherHint}
                </DockReadout>
              </DockInner>
            </PlanDock>

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
                  userProfileType === 'dealer' ? '#16a34a' : '#FF7A2D'
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

            {onConnect && (
              <ActionButton
                $variant={isConnected ? 'secondary' : 'primary'}
                $isDark={isDark}
                onClick={onConnect}
                disabled={connectLoading || isConnected}
              >
                <Handshake size={16} />
                {connectLoading
                  ? (language === 'bg' ? 'Свързване...' : 'Connecting...')
                  : isConnected
                    ? (language === 'bg' ? 'Свързани' : 'Connected')
                    : (language === 'bg' ? 'Свържи се' : 'Connect')}
              </ActionButton>
            )}
            
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


