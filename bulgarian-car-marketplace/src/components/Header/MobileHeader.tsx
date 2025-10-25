/**
 * MobileHeader.tsx - NEW VERSION (Oct 25, 2025)
 * Clean mobile header with working navigation
 * All links are correctly configured
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';

// ========================================
// STYLED COMPONENTS
// ========================================

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const MenuButton = styled.button<{ $isOpen: boolean }>`
  width: 44px;
  height: 44px;
  border: none;
  background: ${props => props.$isOpen ? '#ff8f10' : 'transparent'};
  color: ${props => props.$isOpen ? '#fff' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ff8f10;
  cursor: pointer;
`;

const UserButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;

  &:active {
    transform: scale(0.95);
  }
`;

const LoginButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: #ff8f10;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
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
  transition: all 0.3s;
`;

const MenuDrawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: #fff;
  z-index: 1001;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 16px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const MenuHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
`;

const MenuLogo = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ff8f10;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;

  &:active {
    transform: scale(0.95);
  }
`;

const UserInfo = styled.div`
  padding: 20px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: #666;
`;

const MenuContent = styled.div`
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const MenuSection = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  position: relative;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  pointer-events: none;
  user-select: none;
`;

const MenuItem = styled.button<{ $variant?: 'primary' | 'danger' }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: ${props => 
    props.$variant === 'primary' ? '#ff8f10' :
    props.$variant === 'danger' ? '#dc3545' :
    'transparent'
  };
  color: ${props => 
    props.$variant ? '#fff' : '#333'
  };
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  transition: all 0.2s;
  border-radius: ${props => props.$variant ? '8px' : '0'};
  margin: ${props => props.$variant ? '4px 16px' : '0'};
  position: relative;
  z-index: 1;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${props => 
      props.$variant === 'primary' ? '#e07e0e' :
      props.$variant === 'danger' ? '#c82333' :
      'rgba(0, 0, 0, 0.04)'
    };
  }

  &:active {
    background: ${props => 
      props.$variant === 'primary' ? '#d07308' :
      props.$variant === 'danger' ? '#bd2130' :
      'rgba(0, 0, 0, 0.08)'
    };
    transform: scale(0.98);
  }

  span {
    flex: 1;
    pointer-events: none;
  }

  svg {
    flex-shrink: 0;
    pointer-events: none;
  }
`;

const MenuFooter = styled.div`
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #e0e0e0;
`;

// ========================================
// SVG ICONS
// ========================================

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 17h2m10 0h2M7 17h10"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CrownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 20h20"/>
    <circle cx="12" cy="4" r="2"/>
    <circle cx="4" cy="12" r="2"/>
    <circle cx="20" cy="12" r="2"/>
  </svg>
);

// ========================================
// COMPONENT
// ========================================

const MobileHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  // Navigate function with logging
  const navigateTo = (path: string) => {
    console.log('🔗 Navigating to:', path);
      navigate(path);
      setIsMenuOpen(false);
    };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </MenuButton>

          <Logo onClick={() => navigateTo('/')}>
            Globul Cars
          </Logo>

            {user ? (
            <UserButton type="button" onClick={() => navigateTo('/profile')}>
              <UserIcon />
              </UserButton>
            ) : (
            <LoginButton type="button" onClick={() => navigateTo('/login')}>
                {language === 'bg' ? 'Вход' : 'Login'}
              </LoginButton>
            )}
        </HeaderContent>
      </HeaderContainer>

      {/* OVERLAY */}
      <Overlay $isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)} />

      {/* DRAWER MENU */}
      <MenuDrawer $isOpen={isMenuOpen}>
        <MenuHeader>
          <MenuLogo>Globul Cars</MenuLogo>
          <CloseButton type="button" onClick={() => setIsMenuOpen(false)}>
            <XIcon />
          </CloseButton>
        </MenuHeader>

        {user && (
          <UserInfo>
              <UserName>{user.displayName || user.email?.split('@')[0]}</UserName>
              <UserEmail>{user.email}</UserEmail>
          </UserInfo>
        )}

        <MenuContent>
          {/* MAIN NAVIGATION */}
          <MenuSection>
            <SectionTitle>{language === 'bg' ? 'Навигация' : 'Navigation'}</SectionTitle>
            
            <MenuItem type="button" onClick={() => navigateTo('/')}>
              <HomeIcon />
              <span>{language === 'bg' ? 'Начало' : 'Home'}</span>
            </MenuItem>
            
            <MenuItem type="button" onClick={() => navigateTo('/cars')}>
              <CarIcon />
              <span>{language === 'bg' ? 'Автомобили' : 'Cars'}</span>
            </MenuItem>
            
            <MenuItem type="button" onClick={() => navigateTo('/advanced-search')}>
              <SearchIcon />
              <span>{language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}</span>
            </MenuItem>
            
            <MenuItem type="button" onClick={() => navigateTo('/top-brands')}>
              <StarIcon />
              <span>{language === 'bg' ? 'Топ марки' : 'Top Brands'}</span>
            </MenuItem>
            
            <MenuItem type="button" onClick={() => navigateTo('/about')}>
              <InfoIcon />
              <span>{language === 'bg' ? 'За нас' : 'About'}</span>
            </MenuItem>
            
            <MenuItem type="button" onClick={() => navigateTo('/contact')}>
              <PhoneIcon />
              <span>{language === 'bg' ? 'Контакт' : 'Contact'}</span>
            </MenuItem>
          </MenuSection>

          {/* USER SECTION - Only if logged in */}
          {user && (
            <>
            <MenuSection>
              <SectionTitle>{language === 'bg' ? 'Моят акаунт' : 'My Account'}</SectionTitle>
                
                <MenuItem type="button" onClick={() => navigateTo('/profile')}>
                  <UserIcon />
                  <span>{language === 'bg' ? 'Профил' : 'Profile'}</span>
              </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/dashboard')}>
                <DashboardIcon />
                  <span>{language === 'bg' ? 'Табло' : 'Dashboard'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/my-listings')}>
                  <ListIcon />
                  <span>{language === 'bg' ? 'Моите обяви' : 'My Listings'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/my-drafts')}>
                  <FileIcon />
                  <span>{language === 'bg' ? 'Чернови' : 'Drafts'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/favorites')}>
                  <HeartIcon />
                  <span>{language === 'bg' ? 'Любими' : 'Favorites'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/messages')}>
                  <MessageIcon />
                  <span>{language === 'bg' ? 'Съобщения' : 'Messages'}</span>
              </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/notifications')}>
                  <BellIcon />
                  <span>{language === 'bg' ? 'Известия' : 'Notifications'}</span>
              </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/saved-searches')}>
                <BookmarkIcon />
                  <span>{language === 'bg' ? 'Запазени търсения' : 'Saved Searches'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/users')}>
                  <UsersIcon />
                  <span>{language === 'bg' ? 'Потребители' : 'Users'}</span>
              </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/analytics')}>
                  <BarChartIcon />
                  <span>{language === 'bg' ? 'Статистика' : 'Analytics'}</span>
              </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/events')}>
                <CalendarIcon />
                  <span>{language === 'bg' ? 'Събития' : 'Events'}</span>
                </MenuItem>
              </MenuSection>

              {/* FINANCES SECTION */}
              <MenuSection>
                <SectionTitle>{language === 'bg' ? 'Финанси' : 'Finances'}</SectionTitle>
                
                <MenuItem type="button" onClick={() => navigateTo('/subscription')}>
                  <CrownIcon />
                  <span>{language === 'bg' ? 'Абонамент' : 'Subscription'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/invoices')}>
                  <FileIcon />
                  <span>{language === 'bg' ? 'Фактури' : 'Invoices'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/commissions')}>
                  <DollarIcon />
                  <span>{language === 'bg' ? 'Комисионни' : 'Commissions'}</span>
                </MenuItem>
                
                <MenuItem type="button" onClick={() => navigateTo('/billing')}>
                  <CreditCardIcon />
                  <span>{language === 'bg' ? 'Фактуриране' : 'Billing'}</span>
              </MenuItem>
            </MenuSection>
            </>
          )}

          {/* SETTINGS SECTION */}
          <MenuSection>
            <SectionTitle>{language === 'bg' ? 'Настройки' : 'Settings'}</SectionTitle>
            
            <MenuItem type="button" onClick={toggleLanguage}>
              <GlobeIcon />
              <span>{language === 'bg' ? 'English' : 'Български'}</span>
            </MenuItem>
            
            {user && (
              <MenuItem type="button" onClick={() => navigateTo('/profile')}>
                  <SettingsIcon />
                <span>{language === 'bg' ? 'Настройки на профила' : 'Profile Settings'}</span>
                </MenuItem>
            )}
            
            <MenuItem type="button" onClick={() => navigateTo('/help')}>
              <HelpIcon />
              <span>{language === 'bg' ? 'Помощ' : 'Help'}</span>
            </MenuItem>
          </MenuSection>

          {/* AUTH SECTION */}
          {user ? (
          <MenuSection>
                <MenuItem type="button" $variant="danger" onClick={handleLogout}>
                  <LogoutIcon />
                <span>{language === 'bg' ? 'Изход' : 'Logout'}</span>
                </MenuItem>
            </MenuSection>
          ) : (
            <MenuSection>
              <SectionTitle>{language === 'bg' ? 'Акаунт' : 'Account'}</SectionTitle>
              
              <MenuItem type="button" $variant="primary" onClick={() => navigateTo('/login')}>
                <UserIcon />
                <span>{language === 'bg' ? 'Вход' : 'Login'}</span>
                </MenuItem>
              
              <MenuItem type="button" onClick={() => navigateTo('/register')}>
                <PlusIcon />
                <span>{language === 'bg' ? 'Регистрация' : 'Register'}</span>
                </MenuItem>
            </MenuSection>
          )}
        </MenuContent>

        <MenuFooter>
          © 2025 Globul Cars · Bulgaria
        </MenuFooter>
      </MenuDrawer>
    </>
  );
};

export default MobileHeader;

