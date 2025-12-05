import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, X, User, Settings, Heart, MessageCircle, Calendar, LogOut, Search, Car, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { media, spacing, colors, zIndex, shadows, borderRadius } from '../../styles/design-system';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import CyberToggle from '../CyberToggle/CyberToggle';

const HeaderContainer = styled.header<{ $isDark?: boolean }>`
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.25)'} !important;
  backdrop-filter: blur(25px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
  border-bottom: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(0, 0, 0, 0.06)'} !important;
  z-index: ${zIndex.sticky};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background 0.3s ease, border-color 0.3s ease;
  
  /* Override any global header styles */
  background-color: ${({ $isDark }) => 
    $isDark ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.25)'} !important;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md};
  max-width: 1280px;
  margin: 0 auto;
  height: 64px;

  ${media.maxMobile} {
    height: 60px;
    padding: ${spacing.sm} ${spacing.md};
  }
`;

const Logo = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : colors.primary.main};
  transition: color 0.3s ease;
  margin-left: -24px; /* تقريب من الوسط بمقدار 3 أحرف */

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }

  ${media.maxMobile} {
    font-size: 18px;
    margin-left: -18px; /* تقليل المسافة في الموبايل */
    img {
      width: 40px;
      height: 40px;
    }
  }
`;

const LeftNav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-left: ${spacing.lg};

  ${media.maxMobile} {
    display: none;
  }
`;

const MainNavButton = styled.button<{ $isDark?: boolean; $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.lg};
  border: 2px solid ${({ $isDark, $primary }) => 
    $primary 
      ? ($isDark ? 'rgba(255, 107, 53, 0.5)' : colors.primary.main)
      : ($isDark ? 'rgba(148, 163, 184, 0.3)' : colors.surface.border)};
  background: ${({ $isDark, $primary }) => 
    $primary
      ? ($isDark ? 'rgba(255, 107, 53, 0.2)' : colors.primary.main)
      : ($isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(255, 255, 255, 0.5)')};
  color: ${({ $isDark, $primary }) => 
    $primary 
      ? '#ffffff'
      : ($isDark ? '#cbd5e1' : colors.neutral.gray700)};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $isDark }) => 
      $isDark 
        ? '0 4px 12px rgba(255, 107, 53, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.15)'};
    border-color: ${({ $isDark }) => 
      $isDark ? 'rgba(255, 107, 53, 0.8)' : colors.primary.dark};
    background: ${({ $isDark, $primary }) => 
      $primary
        ? ($isDark ? 'rgba(255, 107, 53, 0.4)' : colors.primary.dark)
        : ($isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.8)')};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;


const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  position: relative;
  z-index: ${zIndex.sticky + 1};
  margin-right: -24px; /* تقريب من الوسط بمقدار 3 أحرف */

  ${media.maxMobile} {
    margin-right: -18px; /* تقليل المسافة في الموبايل */
  }
`;

const IconButton = styled.button<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  color: ${({ $isDark }) => $isDark ? '#cbd5e1' : colors.neutral.gray700};
  transition: all 0.2s;

  &:hover {
    background: ${({ $isDark }) => $isDark ? 'rgba(148, 163, 184, 0.1)' : colors.neutral.gray100};
    color: ${({ $isDark }) => $isDark ? '#f1f5f9' : colors.primary.main};
  }

  ${media.maxMobile} {
    width: 36px;
    height: 36px;
  }
`;

const MenuButton = styled(IconButton)`
  display: none;

  ${media.maxMobile} {
    display: flex;
  }
`;

const SettingsButton = styled.button<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border: 2px solid ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.3)' : colors.surface.border};
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(255, 255, 255, 0.5)'};
  color: ${({ $isDark }) => $isDark ? '#cbd5e1' : colors.neutral.gray700};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  &:hover {
    background: ${({ $isDark }) => 
      $isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(255, 255, 255, 0.8)'};
    border-color: ${({ $isDark }) => 
      $isDark ? 'rgba(255, 107, 53, 0.5)' : colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${({ $isDark }) => 
      $isDark 
        ? '0 4px 12px rgba(255, 107, 53, 0.2)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  svg {
    width: 18px;
    height: 18px;
  }

  ${media.maxMobile} {
    padding: ${spacing.xs} ${spacing.sm};
    font-size: 14px;
  }
`;

const SettingsDropdown = styled.div<{ $isOpen: boolean; $isDark?: boolean }>`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 320px;
  max-height: 600px;
  overflow-y: auto;
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 16px;
  box-shadow: ${({ $isDark }) => 
    $isDark 
      ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
      : '0 20px 60px rgba(0, 0, 0, 0.15)'};
  z-index: ${zIndex.modal};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: ${spacing.md};

  ${media.maxMobile} {
    min-width: 280px;
    right: -10px;
  }
`;


// Professional Settings Row - Clean and Modern
const SettingsRow = styled.button<{ $isDark?: boolean; $highlight?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  background: ${({ $isDark, $highlight }) => 
    $highlight
      ? ($isDark ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 107, 53, 0.05)')
      : 'transparent'};
  border: none;
  border-bottom: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ $isDark }) => $isDark ? '#ff6b35' : colors.primary.main};
    transform: scaleY(0);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: ${({ $isDark }) => 
      $isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.03)'};
    padding-left: ${spacing.xl};
    
    &::before {
      transform: scaleY(1);
    }

    .row-icon {
      transform: scale(1.1);
      color: ${({ $isDark }) => $isDark ? '#ff6b35' : colors.primary.main};
    }

    .row-text {
      color: ${({ $isDark }) => $isDark ? '#f1f5f9' : colors.primary.main};
      font-weight: 600;
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const RowIcon = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2.5px;
    color: ${({ $isDark }) => $isDark ? '#94a3b8' : colors.neutral.gray600};
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const RowContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const RowTitle = styled.span<{ $isDark?: boolean }>`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ $isDark }) => $isDark ? '#cbd5e1' : colors.neutral.gray800};
  transition: all 0.25s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowSubtitle = styled.span<{ $isDark?: boolean }>`
  font-size: 0.8125rem;
  font-weight: 400;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : colors.neutral.gray500};
  transition: all 0.25s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowBadge = styled.span<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: ${({ $isDark }) => $isDark ? '#ff6b35' : colors.primary.main};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
  flex-shrink: 0;
`;

// Profile Avatar Image Component
const ProfileAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme?.colors?.primary?.main || '#ff6b35'};
  background: ${({ theme }) => theme?.colors?.neutral?.gray100 || '#f8f9fa'};
`;

const ProfileRow = styled(SettingsRow)`
  padding: ${spacing.lg};
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 107, 53, 0.05)'};
  border-bottom: 2px solid ${({ $isDark }) => 
    $isDark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.15)'};
  margin-bottom: ${spacing.sm};

  ${RowIcon} {
    width: 48px;
    height: 48px;
    background: ${({ $isDark }) => 
      $isDark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.15)'};
    
    svg {
      width: 24px;
      height: 24px;
      color: ${({ $isDark }) => $isDark ? '#ff6b35' : colors.primary.main};
    }
  }

  ${RowTitle} {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ $isDark }) => $isDark ? '#f1f5f9' : colors.neutral.gray900};
  }

  ${RowSubtitle} {
    font-size: 0.875rem;
    color: ${({ $isDark }) => $isDark ? '#cbd5e1' : colors.neutral.gray600};
  }
`;

const Divider = styled.div<{ $isDark?: boolean }>`
  height: 1px;
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
  margin: ${spacing.sm} 0;
`;

const ThemeLanguageRow = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 10px;
  margin: ${spacing.sm} 0;
  border: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
`;

const ActionLabel = styled.span<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $isDark }) => $isDark ? '#cbd5e1' : colors.neutral.gray700};
  min-width: 80px;
`;

const MobileMenu = styled.div<{ $isOpen: boolean; $isDark?: boolean }>`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ $isDark }) => $isDark ? '#0f172a' : 'white'};
  z-index: ${zIndex.modal};
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s, background 0.3s;
  overflow-y: auto;
  padding: ${spacing.lg};
  display: none;

  ${media.maxMobile} {
    display: block;
  }
`;

const MobileMenuItem = styled.button<{ $isDark?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  border: none;
  background: transparent;
  text-align: left;
  font-size: 16px;
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : colors.neutral.gray900};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $isDark }) => $isDark ? 'rgba(148, 163, 184, 0.1)' : colors.neutral.gray100};
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${zIndex.modalBackdrop};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s, visibility 0.3s;
`;

const UnifiedHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSettingsOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsSettingsOpen(false);
  };

  const handleNotificationsClick = () => {
    handleSettingsItemClick('/notifications');
  };

  const handleSettingsItemClick = (path: string) => {
    navigate(path);
    setIsSettingsOpen(false);
  };

  return (
    <>
      <HeaderContainer $isDark={isDark}>
        <HeaderContent>
          <Logo $isDark={isDark} onClick={() => navigate('/')}>
            <img src="/Logo1.png" alt={language === 'bg' ? 'Български мобили' : 'Bulgarski Mobili'} />
            <span>{language === 'bg' ? 'Български мобили' : 'Bulgarski Mobili'}</span>
          </Logo>

          <LeftNav>
            <MainNavButton $isDark={isDark} onClick={() => navigate('/cars')}>
              <Search size={18} />
              <span>{language === 'bg' ? 'Търси коли' : 'Search Cars'}</span>
            </MainNavButton>
            <MainNavButton $isDark={isDark} $primary onClick={() => navigate('/sell')}>
              <Car size={18} />
              <span>{language === 'bg' ? 'Продай кола' : 'Sell Car'}</span>
            </MainNavButton>
          </LeftNav>

          <Actions ref={settingsRef}>
            <SettingsButton 
              $isDark={isDark} 
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
            >
              <Settings size={18} />
              <span>{language === 'bg' ? 'Настройки' : 'Settings'}</span>
              <ChevronDown size={16} style={{ 
                transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />
            </SettingsButton>

            <MenuButton $isDark={isDark} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MenuButton>

            {/* Settings Dropdown - Professional Row-based Design */}
            <SettingsDropdown $isOpen={isSettingsOpen} $isDark={isDark}>
              {/* 1. Profile Row - First and Highlighted */}
              {user ? (
                <ProfileRow 
                  $isDark={isDark}
                  onClick={() => handleSettingsItemClick('/profile')}
                >
                  {user.photoURL ? (
                    <ProfileAvatar 
                      src={user.photoURL} 
                      alt={user.displayName || 'Profile'}
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const iconContainer = e.currentTarget.nextElementSibling as HTMLElement;
                        if (iconContainer) iconContainer.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <RowIcon 
                    $isDark={isDark} 
                    className="row-icon"
                    style={{ display: user.photoURL ? 'none' : 'flex' }}
                  >
                    <User size={24} />
                  </RowIcon>
                  <RowContent>
                    <RowTitle $isDark={isDark} className="row-text">
                      {user.displayName || user.email?.split('@')[0] || t('header.myProfile')}
                    </RowTitle>
                    <RowSubtitle $isDark={isDark}>
                      {language === 'bg' ? 'Моят профил' : 'My Profile'}
                    </RowSubtitle>
                  </RowContent>
                </ProfileRow>
              ) : (
                <ProfileRow 
                  $isDark={isDark}
                  onClick={() => handleSettingsItemClick('/login')}
                >
                  <RowIcon $isDark={isDark} className="row-icon">
                    <User size={24} />
                  </RowIcon>
                  <RowContent>
                    <RowTitle $isDark={isDark} className="row-text">
                      {t('nav.login')}
                    </RowTitle>
                    <RowSubtitle $isDark={isDark}>
                      {language === 'bg' ? 'Влезте в профила си' : 'Sign in to your account'}
                    </RowSubtitle>
                  </RowContent>
                </ProfileRow>
              )}

              {/* 2. Notifications Row */}
              <SettingsRow 
                $isDark={isDark}
                onClick={handleNotificationsClick}
              >
                <RowIcon $isDark={isDark} className="row-icon">
                  <Bell size={20} />
                </RowIcon>
                <RowContent>
                  <RowTitle $isDark={isDark} className="row-text">
                    {t('nav.notifications')}
                  </RowTitle>
                  <RowSubtitle $isDark={isDark}>
                    {language === 'bg' ? 'Прегледайте всички известия' : 'View all notifications'}
                  </RowSubtitle>
                </RowContent>
                <RowBadge $isDark={isDark}>3</RowBadge>
              </SettingsRow>

              {/* 3. Messages Row */}
              <SettingsRow 
                $isDark={isDark}
                onClick={() => handleSettingsItemClick('/messages')}
              >
                <RowIcon $isDark={isDark} className="row-icon">
                  <MessageCircle size={20} />
                </RowIcon>
                <RowContent>
                  <RowTitle $isDark={isDark} className="row-text">
                    {t('nav.messages')}
                  </RowTitle>
                  <RowSubtitle $isDark={isDark}>
                    {language === 'bg' ? 'Вашите съобщения' : 'Your messages'}
                  </RowSubtitle>
                </RowContent>
                <RowBadge $isDark={isDark}>5</RowBadge>
              </SettingsRow>

              {/* 4. Favorites Row */}
              <SettingsRow 
                $isDark={isDark}
                onClick={() => handleSettingsItemClick('/favorites')}
              >
                <RowIcon $isDark={isDark} className="row-icon">
                  <Heart size={20} />
                </RowIcon>
                <RowContent>
                  <RowTitle $isDark={isDark} className="row-text">
                    {t('nav.favorites')}
                  </RowTitle>
                  <RowSubtitle $isDark={isDark}>
                    {language === 'bg' ? 'Запазени обяви' : 'Saved listings'}
                  </RowSubtitle>
                </RowContent>
              </SettingsRow>

              {/* 5. Events Row */}
              <SettingsRow 
                $isDark={isDark}
                onClick={() => handleSettingsItemClick('/events')}
              >
                <RowIcon $isDark={isDark} className="row-icon">
                  <Calendar size={20} />
                </RowIcon>
                <RowContent>
                  <RowTitle $isDark={isDark} className="row-text">
                    {t('nav.events') || 'Events'}
                  </RowTitle>
                  <RowSubtitle $isDark={isDark}>
                    {language === 'bg' ? 'Събития и акции' : 'Events and promotions'}
                  </RowSubtitle>
                </RowContent>
              </SettingsRow>

              <Divider $isDark={isDark} />

              {/* Theme & Language Section */}
              <ThemeLanguageRow $isDark={isDark}>
                <ActionLabel $isDark={isDark}>
                  {language === 'bg' ? 'Език' : 'Language'}
                </ActionLabel>
                <LanguageToggle size="small" showText={false} />
              </ThemeLanguageRow>
              <ThemeLanguageRow $isDark={isDark}>
                <ActionLabel $isDark={isDark}>
                  {language === 'bg' ? 'Тема' : 'Theme'}
                </ActionLabel>
                <CyberToggle />
              </ThemeLanguageRow>

              {/* Logout Row (if user is logged in) */}
              {user && (
                <>
                  <Divider $isDark={isDark} />
                  <SettingsRow 
                    $isDark={isDark}
                    onClick={handleLogout}
                  >
                    <RowIcon $isDark={isDark} className="row-icon">
                      <LogOut size={20} />
                    </RowIcon>
                    <RowContent>
                      <RowTitle $isDark={isDark} className="row-text">
                        {t('header.logout')}
                      </RowTitle>
                      <RowSubtitle $isDark={isDark}>
                        {language === 'bg' ? 'Излезте от профила си' : 'Sign out of your account'}
                      </RowSubtitle>
                    </RowContent>
                  </SettingsRow>
                </>
              )}
            </SettingsDropdown>
          </Actions>
        </HeaderContent>
      </HeaderContainer>

      <Overlay $isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)} />

      <MobileMenu $isOpen={isMenuOpen} $isDark={isDark}>
        <MobileMenuItem $isDark={isDark} onClick={() => navigate('/')}>
          {t('nav.home')}
        </MobileMenuItem>
        <MobileMenuItem $isDark={isDark} onClick={() => navigate('/cars')}>
          {t('nav.cars')}
        </MobileMenuItem>
        <MobileMenuItem $isDark={isDark} onClick={() => navigate('/sell')}>
          {t('home.hero.sellCar')}
        </MobileMenuItem>
        <MobileMenuItem $isDark={isDark} onClick={() => navigate('/dealers')}>
          {t('nav.dealers')}
        </MobileMenuItem>
        <MobileMenuItem $isDark={isDark} onClick={() => navigate('/favorites')}>
          <Heart size={20} />
          {t('nav.favorites')}
        </MobileMenuItem>
        <MobileMenuItem $isDark={isDark} onClick={() => navigate('/messages')}>
          <MessageCircle size={20} />
          {t('nav.messages')}
        </MobileMenuItem>
        {user && (
          <>
            <MobileMenuItem $isDark={isDark} onClick={() => navigate('/profile')}>
              <User size={20} />
              {t('header.myProfile')}
            </MobileMenuItem>
            <MobileMenuItem $isDark={isDark} onClick={() => navigate('/dashboard')}>
              <Settings size={20} />
              {t('header.overview')}
            </MobileMenuItem>
            <MobileMenuItem $isDark={isDark} onClick={handleLogout}>
              <LogOut size={20} />
              {t('header.logout')}
            </MobileMenuItem>
          </>
        )}
      </MobileMenu>
    </>
  );
};

export default UnifiedHeader;
