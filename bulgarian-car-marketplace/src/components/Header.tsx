// src/components/Header.tsx
// Header Component for Bulgarian Car Marketplace
// Header component for Bulgarian Car Marketplace

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { bulgarianAuthService } from '../firebase';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
import NotificationBell from './NotificationBell';
import TopBrandsMenu from './TopBrands/TopBrandsMenu';
// Replace 3D logo with official image logo
import { Settings, User, LogOut, LogIn, UserPlus, Type, MessageCircle } from 'lucide-react';
import { logger } from '../services/logger-service';

// Styled Components - Mobile.de Style with Metallic Bottom Section
const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

// Upper Header Section - Clean and Professional
const UpperHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary.main};
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary.dark};
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

const UpperHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Lower Header Section - Metallic Aluminum Effect
const LowerHeader = styled.div`
  background: linear-gradient(
    135deg,
    #ff8c42 0%,     /* Bright orange */
    #ff6b35 25%,    /* Vibrant orange */
    #e55a2b 50%,    /* Deep orange */
    #cc4a1f 75%,    /* Dark orange */
    #8b4513 90%,    /* Saddle brown */
    #2c2c2c 100%    /* Dark charcoal */
  );
  background-size: 400% 400%;
  animation: metallicShimmer 8s ease-in-out infinite;
  position: relative;

  /* Metallic texture overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
      linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%);
    pointer-events: none;
  }

  /* Subtle inner glow */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(255,140,66,0.3) 0%,
      rgba(255,107,53,0.2) 30%,
      rgba(229,90,43,0.1) 60%,
      rgba(204,74,31,0.05) 80%,
      transparent 100%
    );
    pointer-events: none;
  }

  @keyframes metallicShimmer {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const LowerHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.contrastText}; /* (Comment removed - was in Arabic)
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  img {
    height: 282px; /* ~250% of previous ~113px */
    width: auto;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.accent.main}; /* (Comment removed - was in Arabic)
    
    img {
      transform: scale(1.05);
    }
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.contrastText};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.2s ease-in-out;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.15);
    color: #fff;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Metallic glow effect on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  min-width: 200px;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '-10px')});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease-in-out;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  position: relative;

  &:hover {
    background: linear-gradient(135deg, rgba(255,140,66,0.1), rgba(255,107,53,0.1));
    color: ${({ theme }) => theme.colors.primary.main};
    transform: translateX(4px);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &.danger {
    color: ${({ theme }) => theme.colors.error.main};

    &:hover {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(211, 47, 47, 0.1));
      color: ${({ theme }) => theme.colors.error.dark};
    }
  }

  /* Subtle metallic highlight */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #ff8c42, #ff6b35);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const LanguageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ $active }) => $active ?
    'linear-gradient(135deg, #ff8c42, #ff6b35)' :
    'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active }) => $active ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${({ $active }) => $active ?
    'rgba(255, 255, 255, 0.3)' :
    'rgba(255, 255, 255, 0.2)'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  backdrop-filter: blur(10px);

  &:hover {
    background: ${({ $active }) => $active ?
      'linear-gradient(135deg, #ff6b35, #e55a2b)' :
      'rgba(255, 255, 255, 0.2)'};
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Settings menu styles
const SettingsMenu = styled.div`
  position: relative;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.3s ease-in-out;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

 

// Header Component
const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<BulgarianUser | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBoldText, setIsBoldText] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bulgarian.boldText') === 'true';
    }
    return false;
  });

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await bulgarianAuthService.getCurrentUserProfile();
        setUser(currentUser);
      } catch (error) {
        logger.error('Auth check failed', error as Error);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await bulgarianAuthService.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      logger.error('Logout error', error as Error);
    }
  };

  // Removed legacy toggleUserMenu, using settings menu instead

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isUserMenuOpen && !target.closest('.user-menu')) setIsUserMenuOpen(false);
      if (isSettingsOpen && !target.closest('.settings-menu')) setIsSettingsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isSettingsOpen]);

  // Apply bold text preference
  React.useEffect(() => {
    document.body.classList.toggle('bold-text', isBoldText);
    try {
      localStorage.setItem('bulgarian.boldText', String(isBoldText));
    } catch {}
  }, [isBoldText]);

  return (
    <HeaderContainer>
      {/* Upper Header - Logo and Essential Navigation */}
      <UpperHeader>
        <UpperHeaderContent>
          {/* Logo */}
          <Logo to="/" aria-label="MOBILE-EU Home">
            <img 
              src="/mobile-eu-logo.png" 
              alt="MOBILE-EU" 
              loading="eager" 
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          </Logo>

          {/* Essential Navigation - Key links only */}
          <Navigation>
            <NavLink to="/">{t('nav.home')}</NavLink>
            <NavLink to="/cars">{t('nav.cars')}</NavLink>
            <NavLink to="/sell">{t('nav.sell')}</NavLink>
          </Navigation>
        </UpperHeaderContent>
      </UpperHeader>

      {/* Lower Header - Metallic Section with Full Navigation */}
      <LowerHeader>
        <LowerHeaderContent>
          {/* Extended Navigation */}
          <Navigation>
            <NavLink to="/advanced-search">{t('nav.advancedSearch', 'Advanced Search')}</NavLink>
            <TopBrandsMenu />
          </Navigation>

          {/* Settings Menu and Notifications */}
          <Navigation>
            {/* Settings Menu: contains language, auth/profile, and text toggle */}
            <SettingsMenu className="settings-menu">
              <SettingsButton onClick={() => setIsSettingsOpen(!isSettingsOpen)} aria-haspopup="menu" aria-expanded={isSettingsOpen}>
                <Settings size={16} /> <span>{t('settings.title', 'Settings')}</span>
              </SettingsButton>
              <DropdownMenu $isOpen={isSettingsOpen}>
                {/* Language controls (moved, not duplicated) */}
                <div style={{ padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>{t('settings.language', 'Language')}</div>
                  <LanguageSelector>
                    <LanguageButton $active={language === 'bg'} onClick={() => setLanguage('bg')}>БГ</LanguageButton>
                    <LanguageButton $active={language === 'en'} onClick={() => setLanguage('en')}>EN</LanguageButton>
                  </LanguageSelector>
                </div>

                {/* Auth/Profile controls */}
                {user ? (
                  <>
                    <DropdownItem onClick={() => { navigate('/messages'); setIsSettingsOpen(false); }}>
                      <MessageCircle size={16} /> {t('messaging.title')}
                    </DropdownItem>
                    <DropdownItem onClick={() => { navigate('/dashboard'); setIsSettingsOpen(false); }}>
                      <User size={16} /> {t('settings.dashboard')}
                    </DropdownItem>
                    <DropdownItem onClick={() => { navigate('/analytics'); setIsSettingsOpen(false); }}>
                      <Settings size={16} /> {t('settings.analytics')}
                    </DropdownItem>
                    <DropdownItem onClick={() => { navigate('/digital-twin'); setIsSettingsOpen(false); }}>
                      <Settings size={16} /> {t('settings.digitalTwin')}
                    </DropdownItem>
                    <DropdownItem onClick={() => { navigate('/subscription'); setIsSettingsOpen(false); }}>
                      <Settings size={16} /> {t('settings.subscription')}
                    </DropdownItem>
                    <DropdownItem onClick={() => { handleLogout(); setIsSettingsOpen(false); }} className="danger">
                      <LogOut size={16} /> {t('nav.logout')}
                    </DropdownItem>
                  </>
                ) : (
                  <>
                    <DropdownItem onClick={() => { navigate('/login'); setIsSettingsOpen(false); }}>
                      <LogIn size={16} /> {t('nav.login')}
                    </DropdownItem>
                    <DropdownItem onClick={() => { navigate('/register'); setIsSettingsOpen(false); }}>
                      <UserPlus size={16} /> {t('nav.register')}
                    </DropdownItem>
                  </>
                )}

                {/* Bold text toggle */}
                <DropdownItem onClick={() => setIsBoldText(!isBoldText)}>
                  <Type size={16} />
                  {isBoldText ? t('settings.disableBoldText', 'Disable bold text') : t('settings.enableBoldText')}
                </DropdownItem>
              </DropdownMenu>
            </SettingsMenu>

            {/* Notification Bell remains available */}
            {user && <NotificationBell />}
          </Navigation>
        </LowerHeaderContent>
      </LowerHeader>
    </HeaderContainer>
  );
};

export default Header;