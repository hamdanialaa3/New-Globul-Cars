/**
 * MobileHeader.tsx - Rebuilt from Scratch (Oct 23, 2025)
 * Clean mobile-first header with slide-out menu
 * Uses styled-components only (no CSS file dependency)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { logger } from '../../services/logger-service';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import CyberToggle from '../CyberToggle/CyberToggle';
import LanguageToggle from '../LanguageToggle/LanguageToggle';

// ========================================
// STYLED COMPONENTS
// ========================================

const HEADER_BUTTON_SIZE = '56px';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-primary);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
`;

const MenuButton = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${HEADER_BUTTON_SIZE};
  height: ${HEADER_BUTTON_SIZE};
  border: none;
  background: ${props => props.$isOpen ? 'var(--accent-primary)' : 'transparent'};
  color: ${props => props.$isOpen ? 'var(--text-inverse)' : 'var(--text-primary)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: ${props => props.$isOpen ? 'var(--accent-secondary)' : 'var(--bg-hover)'};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 32px;
    height: 32px;
    color: currentColor;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${HEADER_BUTTON_SIZE};
  height: ${HEADER_BUTTON_SIZE};
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: var(--bg-hover);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SettingsDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  z-index: 1002;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px;
`;

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-hover);
  }
`;

const SettingsLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${HEADER_BUTTON_SIZE};
  height: ${HEADER_BUTTON_SIZE};
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 32px;
    height: 32px;
  }
`;

const LoginButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${HEADER_BUTTON_SIZE};
  padding: 0 20px;
  height: ${HEADER_BUTTON_SIZE};
  border: none;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-radius: 18px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-secondary);
  }

  &:active {
    transform: scale(0.95);
    background: var(--accent-dark);
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const MenuDrawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: var(--bg-card);
  color: var(--text-primary);
  z-index: 1001;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, color 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
  min-height: 60px;
  transition: border-color 0.3s ease;
`;

const MenuLogo = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-primary);
  transition: color 0.3s ease;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary, linear-gradient(135deg, #1a73e8 0%, #1557b0 100%));
  color: var(--text-inverse);
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  
  /* CRITICAL FIX: Ensure all buttons are interactive */
  position: relative;
  z-index: 1;
  pointer-events: auto;
  -webkit-overflow-scrolling: touch;
`;

const MenuSection = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
  
  /* CRITICAL FIX: Prevent overlapping */
  position: relative;
  z-index: auto;
  pointer-events: auto;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
`;

const MenuItem = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: ${props =>
    props.$variant === 'primary' ? 'var(--accent-primary)' :
      props.$variant === 'danger' ? 'var(--error)' :
        'transparent'
  };
  color: ${props =>
    props.$variant ? 'var(--text-inverse)' : 'var(--text-primary)'
  };
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  font-weight: ${props => props.$variant ? 600 : 500};
  border-radius: ${props => props.$variant ? '8px' : '0'};
  margin: ${props => props.$variant ? '4px 16px' : '0'};
  
  /* CRITICAL FIX: Ensure buttons are clickable and don't overlap */
  position: relative;
  z-index: 1;
  pointer-events: auto !important;
  
  /* Better touch targets (Apple HIG) */
  min-height: 52px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:hover {
    background: ${props =>
    props.$variant === 'primary' ? 'var(--accent-secondary)' :
      props.$variant === 'danger' ? 'var(--error)' :
        'var(--bg-hover)'
  };
    filter: ${props => props.$variant ? 'brightness(0.95)' : 'none'};
  }

  &:active {
    transform: scale(0.98);
    background: ${props =>
    props.$variant === 'primary' ? 'var(--accent-dark)' :
      props.$variant === 'danger' ? 'var(--error)' :
        'var(--bg-hover)'
  };
    filter: ${props => props.$variant ? 'brightness(0.9)' : 'none'};
  }

  svg {
    flex-shrink: 0;
    color: currentColor;
  }
`;

const MenuItemText = styled.span`
  flex: 1;
`;

const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.1));
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
`;

const MenuFooter = styled.div`
  padding: 16px;
  border-top: 1px solid var(--border-primary, #e0e0e0);
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
`;

// ========================================
// SVG ICONS (Inline to avoid lucide-react dependency issues)
// ========================================

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17h2m10 0h2M7 17h10m-8-5h6l1-6H8l-1 6z" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m5.656-12.656l-4.243 4.243M7.172 16.828l-4.243 4.243M23 12h-6m-6 0H1m17.656 5.656l-4.243-4.243M7.172 7.172L2.929 2.929" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CrownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20v2H2zm0-2h20v2H2zM12 4l-4 8h8l-4-8z" />
    <circle cx="12" cy="4" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="20" cy="12" r="2" />
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ========================================
// COMPONENT
// ========================================

const MobileHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSettingsOpen(false);
  }, [location.pathname]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleMenuItemClick = (path: string) => () => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('MOBILE MENU CLICK', { path, current: location.pathname, ts: new Date().toISOString() });
    }

    // Ensure navigation happens
    try {
      navigate(path);
      setIsMenuOpen(false);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Navigation successful', { path });
      }
    } catch (error) {
      logger.error('Navigation failed', error as Error, { path });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      logger.error('Logout error', error as Error);
    }
  };

  return (
    <>
      {/* HEADER */}
      <HeaderContainer>
        <HeaderContent>
          <MenuButton
            type="button"
            $isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </MenuButton>

          <Logo onClick={() => navigate('/')}>
            Koli One
          </Logo>

          <UserSection ref={settingsRef}>
            <SettingsButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              aria-label={language === 'bg' ? 'Настройки' : 'Settings'}
            >
              <SettingsIcon />
            </SettingsButton>
            {user ? (
              <UserButton type="button" onClick={handleMenuItemClick('/profile')}>
                <UserIcon size={24} />
              </UserButton>
            ) : (
              <LoginButton type="button" onClick={handleMenuItemClick('/login')}>
                {language === 'bg' ? 'Вход' : 'Login'}
              </LoginButton>
            )}
            <SettingsDropdown $isOpen={isSettingsOpen}>
              <SettingsRow>
                <SettingsLabel>{language === 'bg' ? 'Език' : 'Language'}</SettingsLabel>
                <LanguageToggle size="small" showText={false} />
              </SettingsRow>
              <SettingsRow>
                <SettingsLabel>{language === 'bg' ? 'Тема' : 'Theme'}</SettingsLabel>
                <CyberToggle />
              </SettingsRow>
            </SettingsDropdown>
          </UserSection>
        </HeaderContent>
      </HeaderContainer>

      {/* OVERLAY */}
      <Overlay $isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)} />

      {/* DRAWER MENU */}
      <MenuDrawer $isOpen={isMenuOpen}>
        <MenuHeader>
          <MenuLogo>Koli One</MenuLogo>
          <CloseButton type="button" onClick={() => setIsMenuOpen(false)}>
            <XIcon />
          </CloseButton>
        </MenuHeader>

        {user && (
          <UserInfo>
            <UserAvatar>
              <UserIcon size={24} />
            </UserAvatar>
            <UserDetails>
              <UserName>{user.displayName || user.email?.split('@')[0]}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserDetails>
          </UserInfo>
        )}

        <MenuContent>
          {/* MAIN SECTION */}
          <MenuSection>
            <SectionTitle>{language === 'bg' ? 'Основни' : 'Main'}</SectionTitle>
            <MenuItem type="button" onClick={handleMenuItemClick('/')}>
              <HomeIcon />
              <MenuItemText>{language === 'bg' ? 'Начало' : 'Home'}</MenuItemText>
            </MenuItem>
            <MenuItem type="button" onClick={handleMenuItemClick('/cars')}>
              <CarIcon />
              <MenuItemText>{language === 'bg' ? 'Автомобили' : 'Cars'}</MenuItemText>
            </MenuItem>
            <MenuItem type="button" onClick={handleMenuItemClick('/advanced-search')}>
              <SearchIcon />
              <MenuItemText>{language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}</MenuItemText>
            </MenuItem>
            <MenuItem type="button" onClick={handleMenuItemClick('/top-brands')}>
              <StarIcon />
              <MenuItemText>{language === 'bg' ? 'Топ марки' : 'Top Brands'}</MenuItemText>
            </MenuItem>
            <MenuItem type="button" onClick={handleMenuItemClick('/about')}>
              <InfoIcon />
              <MenuItemText>{language === 'bg' ? 'За нас' : 'About'}</MenuItemText>
            </MenuItem>
            <MenuItem type="button" onClick={handleMenuItemClick('/contact')}>
              <PhoneIcon />
              <MenuItemText>{language === 'bg' ? 'Контакт' : 'Contact'}</MenuItemText>
            </MenuItem>
          </MenuSection>

          {/* PROTECTED PAGES SECTION (if logged in) */}
          {user && (
            <MenuSection>
              <SectionTitle>{language === 'bg' ? 'Мои страници' : 'My Pages'}</SectionTitle>
              <MenuItem type="button" onClick={handleMenuItemClick('/favorites')}>
                <HeartIcon />
                <MenuItemText>{language === 'bg' ? 'Любими' : 'Favorites'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/messages')}>
                <MessageIcon />
                <MenuItemText>{language === 'bg' ? 'Съобщения' : 'Messages'}</MenuItemText>
              </MenuItem>
            </MenuSection>
          )}

          {/* USER ACCOUNT SECTION (if logged in) */}
          {user && (
            <MenuSection>
              <SectionTitle>{language === 'bg' ? 'Моят акаунт' : 'My Account'}</SectionTitle>
              <MenuItem type="button" onClick={handleMenuItemClick('/profile')}>
                <UserIcon size={20} />
                <MenuItemText>{language === 'bg' ? 'Профил' : 'Profile'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/dashboard')}>
                <DashboardIcon />
                <MenuItemText>{language === 'bg' ? 'Табло за управление' : 'Dashboard'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/my-listings')}>
                <ListIcon />
                <MenuItemText>{language === 'bg' ? 'Моите обяви' : 'My Listings'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/my-drafts')}>
                <FileTextIcon />
                <MenuItemText>{language === 'bg' ? 'Чернови' : 'Drafts'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/users')}>
                <UsersIcon />
                <MenuItemText>{language === 'bg' ? 'Потребители' : 'Users'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/analytics')}>
                <BarChartIcon />
                <MenuItemText>{language === 'bg' ? 'Статистика' : 'Analytics'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/saved-searches')}>
                <BookmarkIcon />
                <MenuItemText>{language === 'bg' ? 'Запазени търсения' : 'Saved Searches'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/notifications')}>
                <BellIcon />
                <MenuItemText>{language === 'bg' ? 'Известия' : 'Notifications'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/events')}>
                <CalendarIcon />
                <MenuItemText>{language === 'bg' ? 'Събития' : 'Events'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/create-post')}>
                <PlusCircleIcon />
                <MenuItemText>{language === 'bg' ? 'Създай публикация' : 'Create Post'}</MenuItemText>
              </MenuItem>
            </MenuSection>
          )}

          {/* BILLING & SUBSCRIPTION SECTION (if logged in) */}
          {user && (
            <MenuSection>
              <SectionTitle>{language === 'bg' ? 'Финанси' : 'Finances'}</SectionTitle>
              <MenuItem type="button" onClick={handleMenuItemClick('/subscription')}>
                <CrownIcon />
                <MenuItemText>{language === 'bg' ? 'Абонамент' : 'Subscription'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/invoices')}>
                <FileIcon />
                <MenuItemText>{language === 'bg' ? 'Фактури' : 'Invoices'}</MenuItemText>
              </MenuItem>
              <MenuItem type="button" onClick={handleMenuItemClick('/commissions')}>
                <DollarIcon />
                <MenuItemText>{language === 'bg' ? 'Комисионни' : 'Commissions'}</MenuItemText>
              </MenuItem>
            </MenuSection>
          )}

          {/* SETTINGS SECTION */}
          <MenuSection>
            <SectionTitle>{language === 'bg' ? 'Настройки' : 'Settings'}</SectionTitle>
            <MenuItem type="button" onClick={toggleLanguage}>
              <GlobeIcon />
              <MenuItemText>
                {language === 'bg' ? 'English' : 'Български'}
              </MenuItemText>
              <Badge>{language.toUpperCase()}</Badge>
            </MenuItem>
            {user && (
              <>
                <MenuItem type="button" onClick={handleMenuItemClick('/profile')}>
                  <SettingsIcon />
                  <MenuItemText>{language === 'bg' ? 'Общи настройки' : 'General Settings'}</MenuItemText>
                </MenuItem>
                <MenuItem type="button" onClick={handleMenuItemClick('/profile')}>
                  <ShieldIcon />
                  <MenuItemText>{language === 'bg' ? 'Поверителност и сигурност' : 'Privacy & Security'}</MenuItemText>
                </MenuItem>
                <MenuItem type="button" onClick={handleMenuItemClick('/verification')}>
                  <LockIcon />
                  <MenuItemText>{language === 'bg' ? 'Удостоверяване' : 'Verification'}</MenuItemText>
                </MenuItem>
                <MenuItem type="button" onClick={handleMenuItemClick('/billing')}>
                  <CreditCardIcon />
                  <MenuItemText>{language === 'bg' ? 'Фактуриране и плащане' : 'Billing & Payment'}</MenuItemText>
                </MenuItem>
              </>
            )}
            <MenuItem type="button" onClick={handleMenuItemClick('/help')}>
              <HelpIcon />
              <MenuItemText>{language === 'bg' ? 'Помощ и поддръжка' : 'Help & Support'}</MenuItemText>
            </MenuItem>
          </MenuSection>

          {/* AUTH SECTION */}
          <MenuSection>
            {user ? (
              <>
                <MenuItem type="button" $variant="danger" onClick={handleLogout}>
                  <LogoutIcon />
                  <MenuItemText>{language === 'bg' ? 'Изход' : 'Logout'}</MenuItemText>
                </MenuItem>
              </>
            ) : (
              <>
                <SectionTitle>{language === 'bg' ? 'Удостоверяване' : 'Authentication'}</SectionTitle>
                <MenuItem type="button" $variant="primary" onClick={handleMenuItemClick('/login')}>
                  <KeyIcon />
                  <MenuItemText>{language === 'bg' ? 'Вход' : 'Login'}</MenuItemText>
                </MenuItem>
                <MenuItem type="button" onClick={handleMenuItemClick('/register')}>
                  <UserPlusIcon />
                  <MenuItemText>{language === 'bg' ? 'Създаване на нов акаунт' : 'Create New Account'}</MenuItemText>
                </MenuItem>
                <MenuItem type="button" onClick={handleMenuItemClick('/forgot-password')}>
                  <LockIcon />
                  <MenuItemText>{language === 'bg' ? 'Забравена парола?' : 'Forgot Password?'}</MenuItemText>
                </MenuItem>
              </>
            )}
          </MenuSection>
        </MenuContent>

        <MenuFooter>© 2025 BG Autos</MenuFooter>
      </MenuDrawer>
    </>
  );
};

export default MobileHeader;

