// Professional Header Component inspired by mobile.de design
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Search,
  User,
  Settings,
  Menu,
  X,
  Car,
  Heart,
  MessageCircle,
  Bell,
  LayoutDashboard,
  BarChart3,
  UserCircle,
  FileText,
  ShoppingCart,
  Calculator,
  TrendingUp,
  Sliders,
  Sun,
  Type,
  Globe,
  UserCog,
  Edit,
  Image,
  Shield,
  HelpCircle,
  Book,
  AlertTriangle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Key,
  ShieldCheck,
  Monitor,
  Calendar
} from 'lucide-react';
import EnhancedNavLink from '../EnhancedNavLink';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import ProfileTypeSwitcher from './ProfileTypeSwitcher';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainNavOpen, setIsMainNavOpen] = useState(false);
  const [isProfileTypeOpen, setIsProfileTypeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [helpSupportOpen, setHelpSupportOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLDivElement>(null);
  const profileTypeRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSettingsItemClick = (path: string) => {
    setIsSettingsOpen(false);
    navigate(path);
  };

  const toggleMainNav = () => {
    setIsMainNavOpen(!isMainNavOpen);
  };

  const handleMainNavItemClick = (path: string) => {
    setIsMainNavOpen(false);
    navigate(path);
  };
  
  const toggleProfileType = () => {
    setIsProfileTypeOpen(!isProfileTypeOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // ✅ FIX: Don't close profile type dropdown if clicking on modal
      // Check if click is on modal overlay or modal content
      const isModalClick = (target as HTMLElement).closest('[data-modal="profile-type-confirm"]') 
        || (target as HTMLElement).getAttribute('data-modal') === 'profile-type-confirm';
      
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setIsSettingsOpen(false);
      }
      if (mainNavRef.current && !mainNavRef.current.contains(target)) {
        setIsMainNavOpen(false);
      }
      // ✅ Only close profile type dropdown if NOT clicking on modal
      if (profileTypeRef.current && !profileTypeRef.current.contains(target) && !isModalClick) {
        setIsProfileTypeOpen(false);
      }
      // Note: NotificationDropdown handles its own outside clicks
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="mobile-de-header">
      <div className="header-top">
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo-section" onClick={() => navigate('/')}>
            <img 
              src="/globul-logo.png" 
              alt="Globul Cars Logo" 
              className="logo-icon"
              style={{ width: '75px', height: '75px', objectFit: 'contain' }}
            />
            <span className="logo-text">Globul Cars</span>
          </div>

          {/* Search Bar Removed */}

          {/* Central Action Buttons */}
          <div className="central-actions">
            <LanguageToggle size="small" showText={false} className="action-bar-button" />
            
            <button
              className="action-bar-button"
              onClick={() => navigate('/favorites')}
              title={t('nav.favorites')}
            >
              <Heart size={20} />
            </button>
            
            <button
              className="action-bar-button"
              onClick={() => navigate('/messages')}
              title={t('nav.messages')}
            >
              <MessageCircle size={20} />
            </button>
            
            <button
              className="action-bar-button"
              onClick={() => navigate('/events')}
              title={t('nav.events') || 'Events'}
            >
              <Calendar size={20} />
            </button>
            
            <NotificationDropdown
              isOpen={isNotificationsOpen}
              onToggle={toggleNotifications}
              onClose={closeNotifications}
            />
            
            {/* Seller Type Dropdown - Only visible on Profile page */}
            {user && location.pathname === '/profile' && (
              <div className="main-nav-dropdown" ref={profileTypeRef} style={{ position: 'relative', marginLeft: '8px' }}>
                <button 
                  className="action-bar-button"
                  onClick={toggleProfileType}
                  aria-expanded={isProfileTypeOpen}
                  style={{ 
                    background: 'linear-gradient(135deg, #FF8F10 0%, #FFAA00 100%)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                  title={language === 'bg' ? 'Тип продавач' : 'Seller Type'}
                >
                  <User size={16} />
                  <span style={{ whiteSpace: 'nowrap' }}>{language === 'bg' ? 'Тип' : 'Type'}</span>
                  <svg 
                    className={`arrow ${isProfileTypeOpen ? 'rotate' : ''}`}
                    width="10" 
                    height="10" 
                    viewBox="0 0 12 12"
                    style={{ marginLeft: '-2px' }}
                  >
                    <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>

                {isProfileTypeOpen && (
                  <div style={{ 
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    minWidth: '200px',
                    zIndex: 10000,
                    border: '2px solid rgba(255, 143, 16, 0.1)',
                    padding: '12px'
                  }}>
                    <ProfileTypeSwitcher />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="header-actions">
            {/* User Section */}
            <div className="user-section">
              {user ? (
                <div className="user-section-content">

                  <div className="user-menu" ref={settingsRef}>
                  <button className="user-button" onClick={() => navigate('/profile')}>
                    <User size={20} />
                    <span className="user-name">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>
                  <button
                    className="settings-button"
                    onClick={toggleSettings}
                    title={t('nav.settings')}
                  >
                    <Settings size={20} />
                  </button>

                  {/* Settings Dropdown */}
                  {isSettingsOpen && (
                    <div className="settings-dropdown">
                      <div className="settings-header">
                        <span>{t('header.loggedAs')} {user.displayName || user.email?.split('@')[0]}</span>
                      </div>
                      <div className="settings-menu">
                        {/* Section 1: My Account */}
                        <div className="menu-section">
                          <div className="section-title">
                            <User size={16} />
                            <span>{t('header.myAccount')}</span>
                          </div>
                          
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/dashboard')}>
                            <LayoutDashboard size={18} />
                            <span>{t('header.overview')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/analytics')}>
                            <BarChart3 size={18} />
                            <span>{t('header.myStatistics')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/profile')}>
                            <UserCircle size={18} />
                            <span>{t('header.myProfile')}</span>
                          </button>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Section 2: My Vehicles */}
                        <div className="menu-section">
                          <div className="section-title">
                            <Car size={16} />
                            <span>{t('header.vehiclesSection')}</span>
                          </div>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/profile?tab=garage')}>
                            <Car size={18} />
                            <span>{t('header.carPark')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/profile?tab=garage')}>
                            <FileText size={18} />
                            <span>{t('header.myAds')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/saved-searches')}>
                            <Search size={18} />
                            <span>{t('header.savedSearches')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/favorites')}>
                            <Heart size={18} />
                            <span>{t('header.myFavorites')}</span>
                          </button>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Section 3: Communication */}
                        <div className="menu-section">
                          <div className="section-title">
                            <MessageCircle size={16} />
                            <span>{t('header.communicationSection')}</span>
                          </div>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/messages')}>
                            <MessageCircle size={18} />
                            <span>{t('header.messages')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/notifications')}>
                            <Bell size={18} />
                            <span>{t('header.notifications')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/messages')}>
                            <HelpCircle size={18} />
                            <span>{t('header.inquiries')}</span>
                          </button>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Section 4: Finance */}
                        <div className="menu-section">
                          <div className="section-title">
                            <Calculator size={16} />
                            <span>{t('header.financeSection')}</span>
                          </div>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/finance')}>
                            <Calculator size={18} />
                            <span>{t('header.financeCalculator')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/invoices')}>
                            <FileText size={18} />
                            <span>{t('header.invoices')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/commissions')}>
                            <TrendingUp size={18} />
                            <span>{t('header.commissions')}</span>
                          </button>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Section 5: Settings & Control */}
                        <div className="menu-section">
                          <div className="section-title">
                            <Settings size={16} />
                            <span>{t('header.settingsSection')}</span>
                          </div>
                          
                          {/* Preferences - Navigate to Profile Settings Tab */}
                        <button
                            className="settings-item"
                            onClick={() => handleSettingsItemClick('/profile?tab=settings')}
                        >
                            <Sliders size={18} />
                            <span>{t('header.preferences')}</span>
                        </button>
                          {/* Account Settings - Navigate to Profile Tab */}
                        <button
                            className="settings-item"
                            onClick={() => handleSettingsItemClick('/profile?tab=profile')}
                          >
                            <UserCog size={18} />
                            <span>{t('header.accountSettings')}</span>
                          </button>

                          {/* Security - Navigate to Profile Settings Tab */}
                        <button
                            className="settings-item"
                            onClick={() => handleSettingsItemClick('/profile?tab=settings')}
                        >
                            <Shield size={18} />
                            <span>{t('header.security')}</span>
                        </button>

                          {/* Help & Support - Navigate to Help Page */}
                        <button
                            className="settings-item"
                            onClick={() => handleSettingsItemClick('/help')}
                        >
                            <HelpCircle size={18} />
                            <span>{t('header.helpSupport')}</span>
                        </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    className="logout-button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <LogOut size={18} />
                    <span>{t('header.logout')}</span>
                  </button>
                  </div>
                </div>
              ) : (
                <div className="auth-section">
                  <div className="auth-buttons">
                    <button
                      className="login-button led-glow"
                      onClick={() => navigate('/login')}
                    >
                      {t('nav.login')}
                    </button>
                    <button
                      className="register-button"
                      onClick={() => navigate('/register')}
                    >
                      {t('nav.register')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="header-nav">
        <div className="nav-container">
          <div className="nav-links">
            <EnhancedNavLink href="/" className="nav-link">
              {t('nav.home')}
            </EnhancedNavLink>
            
            {/* Main Navigation Dropdown */}
            <div className="main-nav-dropdown" ref={mainNavRef}>
              <button 
                className="nav-link main-nav-trigger"
                onClick={toggleMainNav}
                aria-expanded={isMainNavOpen}
              >
                <Menu size={16} />
                <span>{t('nav.explore')}</span>
                <svg 
                  className={`arrow ${isMainNavOpen ? 'rotate' : ''}`}
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12"
                >
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>

              {/* Main Navigation Dropdown Menu */}
              {isMainNavOpen && (
                <div className="main-nav-menu">
                  <div className="main-nav-header">
                    <span>{t('nav.exploreCars')}</span>
                  </div>
                  <div className="main-nav-items">
                    <button
                      className="main-nav-item"
                      onClick={() => handleMainNavItemClick('/top-brands')}
                    >
                      <Car size={18} />
                      <span>{t('nav.topBrands')}</span>
                    </button>
                    <button
                      className="main-nav-item"
                      onClick={() => handleMainNavItemClick('/cars')}
                    >
                      <Search size={18} />
                      <span>{t('nav.searchCars')}</span>
                    </button>
                    <button
                      className="main-nav-item"
                      onClick={() => handleMainNavItemClick('/advanced-search')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-4.35-4.35"/>
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m13 2-2 8-8-2 8-2 2-8z"/>
                      </svg>
                      <span>{t('nav.advancedSearch')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <EnhancedNavLink href="/sell" className="nav-link" requireAuth={true}>
              {t('home.hero.sellCar')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/brand-gallery" className="nav-link" requireAuth={true}>
              {t('nav.brandGallery')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/dealers" className="nav-link" requireAuth={true}>
              {t('nav.dealers')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/finance" className="nav-link" requireAuth={true}>
              {t('nav.finance')}
            </EnhancedNavLink>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">

          <div className="mobile-nav-links">
            <EnhancedNavLink href="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </EnhancedNavLink>
            
            <EnhancedNavLink href="/cars" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.cars')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/advanced-search" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              {t('search.advanced')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/sell" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              {t('home.hero.sellCar')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/brand-gallery" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              {t('nav.brandGallery')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/dealers" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              {t('nav.dealers')}
            </EnhancedNavLink>
            <EnhancedNavLink href="/finance" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              {t('nav.finance')}
            </EnhancedNavLink>
          </div>

          {!user && (
            <div className="mobile-auth-buttons">
              <button
                className="mobile-login-button"
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                {t('nav.login')}
              </button>
              <button
                className="mobile-register-button"
                onClick={() => {
                  navigate('/register');
                  setIsMenuOpen(false);
                }}
              >
                {t('nav.register')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;