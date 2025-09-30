// Professional Header Component inspired by mobile.de design
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
  Moon,
  Laptop,
  Type,
  Globe,
  Mail,
  Smartphone,
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
  Monitor
} from 'lucide-react';
import EnhancedNavLink from '../EnhancedNavLink';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainNavOpen, setIsMainNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [helpSupportOpen, setHelpSupportOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cars?search=${encodeURIComponent(searchQuery)}`);
    }
  };

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

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (mainNavRef.current && !mainNavRef.current.contains(event.target as Node)) {
        setIsMainNavOpen(false);
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
            <Car className="logo-icon" size={32} />
            <span className="logo-text">Globul Cars</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search for cars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {/* Right Section */}
          <div className="header-actions">
            {/* User Section */}
            <div className="user-section">
              {user ? (
                <div className="user-section-content">
                  {/* Quick Actions - Always visible */}
                  <div className="quick-actions">
                    <LanguageToggle size="small" showText={false} className="glow-button" />
                    
                    <button
                      className="action-button glow-button"
                      onClick={() => navigate('/favorites')}
                      title={t('nav.favorites')}
                    >
                      <Heart size={20} />
                    </button>
                    <button
                      className="action-button glow-button"
                      onClick={() => navigate('/messages')}
                      title={t('nav.messages')}
                    >
                      <MessageCircle size={20} />
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationsOpen}
                      onToggle={toggleNotifications}
                      onClose={closeNotifications}
                    />
                  </div>

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
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/dashboard')}>
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
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/my-listings')}>
                            <Car size={18} />
                            <span>{t('header.carPark')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/sell-car')}>
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
                          <button
                            className="settings-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSettingsOpen(false);
                              setIsNotificationsOpen(!isNotificationsOpen);
                            }}
                          >
                            <Bell size={18} />
                            <span>{t('header.notifications')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/messages')}>
                            <HelpCircle size={18} />
                            <span>{t('header.inquiries')}</span>
                          </button>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Section 4: Transactions */}
                        <div className="menu-section">
                          <div className="section-title">
                            <ShoppingCart size={16} />
                            <span>{t('header.transactionsSection')}</span>
                          </div>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/dashboard')}>
                            <ShoppingCart size={18} />
                            <span>{t('header.orders')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/finance')}>
                            <Calculator size={18} />
                            <span>{t('header.financeCalculator')}</span>
                          </button>
                          <button className="settings-item" onClick={() => handleSettingsItemClick('/dashboard')}>
                            <TrendingUp size={18} />
                            <span>{t('header.financialReports')}</span>
                          </button>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Section 5: Settings & Control */}
                        <div className="menu-section">
                          <div className="section-title">
                            <Settings size={16} />
                            <span>{t('header.settingsSection')}</span>
                          </div>
                          
                          {/* Preferences Submenu */}
                        <button
                            className="settings-item submenu-trigger"
                            onClick={() => setPreferencesOpen(!preferencesOpen)}
                        >
                            <Sliders size={18} />
                            <span>{t('header.preferences')}</span>
                            {preferencesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                          {preferencesOpen && (
                            <div className="submenu">
                              <div className="submenu-header">
                                <Sun size={16} />
                                <span>{t('header.appearance')}</span>
                              </div>
                              <div className="submenu-header">
                                <Type size={16} />
                                <span>{t('header.textSize')}</span>
                              </div>
                              <div className="submenu-header">
                                <Globe size={16} />
                                <span>{t('header.language')}</span>
                              </div>
                              <div className="submenu-header">
                                <Bell size={16} />
                                <span>{t('header.notificationSettings')}</span>
                              </div>
                            </div>
                          )}

                          {/* Account Settings Submenu */}
                        <button
                            className="settings-item submenu-trigger"
                            onClick={() => setAccountSettingsOpen(!accountSettingsOpen)}
                          >
                            <UserCog size={18} />
                            <span>{t('header.accountSettings')}</span>
                            {accountSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          {accountSettingsOpen && (
                            <div className="submenu">
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/profile/edit')}>
                                <Edit size={16} />
                                <span>{t('header.editProfile')}</span>
                              </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/profile/avatar')}>
                                <Image size={16} />
                                <span>{t('header.changeAvatar')}</span>
                              </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/profile/cover')}>
                                <Image size={16} />
                                <span>{t('header.changeCover')}</span>
                        </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/privacy')}>
                                <Shield size={16} />
                                <span>{t('header.privacySettings')}</span>
                        </button>
                            </div>
                          )}

                          {/* Security Submenu */}
                        <button
                            className="settings-item submenu-trigger"
                            onClick={() => setSecurityOpen(!securityOpen)}
                        >
                            <Shield size={18} />
                            <span>{t('header.security')}</span>
                            {securityOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                          {securityOpen && (
                            <div className="submenu">
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/security/password')}>
                                <Key size={16} />
                                <span>{t('header.changePassword')}</span>
                        </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/security/2fa')}>
                                <ShieldCheck size={16} />
                                <span>{t('header.twoFactorAuth')}</span>
                        </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/security/sessions')}>
                                <Monitor size={16} />
                                <span>{t('header.activeSessions')}</span>
                        </button>
                            </div>
                          )}

                          {/* Help & Support Submenu */}
                        <button
                            className="settings-item submenu-trigger"
                            onClick={() => setHelpSupportOpen(!helpSupportOpen)}
                        >
                            <HelpCircle size={18} />
                            <span>{t('header.helpSupport')}</span>
                            {helpSupportOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                          {helpSupportOpen && (
                            <div className="submenu">
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/help')}>
                                <Book size={16} />
                                <span>{t('header.faq')}</span>
                              </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/contact')}>
                                <MessageCircle size={16} />
                                <span>{t('header.contactSupport')}</span>
                              </button>
                              <button className="submenu-item" onClick={() => handleSettingsItemClick('/contact')}>
                                <AlertTriangle size={16} />
                                <span>{t('header.reportIssue')}</span>
                              </button>
                            </div>
                          )}
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
                  
                  {/* Quick Actions - Moved below auth buttons */}
                  <div className="quick-actions">
                    <LanguageToggle size="small" showText={false} className="glow-button" />
                    
                    <button
                      className="action-button glow-button"
                      onClick={() => navigate('/favorites')}
                      title={t('nav.favorites')}
                    >
                      <Heart size={20} />
                    </button>
                    <button
                      className="action-button glow-button"
                      onClick={() => navigate('/messages')}
                      title={t('nav.messages')}
                    >
                      <MessageCircle size={20} />
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationsOpen}
                      onToggle={toggleNotifications}
                      onClose={closeNotifications}
                    />
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
                <span>Explore</span>
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
                    <span>Explore Cars</span>
                  </div>
                  <div className="main-nav-items">
                    <button
                      className="main-nav-item"
                      onClick={() => handleMainNavItemClick('/top-brands')}
                    >
                      <Car size={18} />
                      <span>Top Brands</span>
                    </button>
                    <button
                      className="main-nav-item"
                      onClick={() => handleMainNavItemClick('/cars')}
                    >
                      <Search size={18} />
                      <span>Search Cars</span>
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
                      <span>Advanced Search</span>
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
          <div className="mobile-search">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search for cars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

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