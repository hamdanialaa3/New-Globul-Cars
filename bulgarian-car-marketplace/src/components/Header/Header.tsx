// Professional Header Component inspired by mobile.de design
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Settings,
  Menu,
  X,
  Car,
  Heart,
  MessageCircle,
  Bell
} from 'lucide-react';
import LogoGallery from '../LogoGallery';
import EnhancedNavLink from '../EnhancedNavLink';
import TopBrandsMenu from '../TopBrands/TopBrandsMenu';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

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

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
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
            {/* Quick Actions */}
            <div className="quick-actions">
              <button
                className="action-button"
                onClick={() => navigate('/favorites')}
                title="Favorites"
              >
                <Heart size={20} />
              </button>
              <button
                className="action-button"
                onClick={() => navigate('/messages')}
                title="Messages"
              >
                <MessageCircle size={20} />
              </button>
              <button
                className="action-button"
                onClick={() => navigate('/notifications')}
                title="Notifications"
              >
                <Bell size={20} />
              </button>
            </div>

            {/* User Section */}
            <div className="user-section">
              {user ? (
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
                    title="Settings"
                  >
                    <Settings size={20} />
                  </button>

                  {/* Settings Dropdown */}
                  {isSettingsOpen && (
                    <div className="settings-dropdown">
                      <div className="settings-header">
                        <span>Logged as ALAA</span>
                      </div>
                      <div className="settings-menu">
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/overview')}
                        >
                          Overview
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/messages')}
                        >
                          Messages
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/my-searches')}
                        >
                          My Searches
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/car-park')}
                        >
                          Car park
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/orders')}
                        >
                          Orders
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/financing')}
                        >
                          Financing
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/ads')}
                        >
                          Ads
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/direct-sale')}
                        >
                          Direct Sale
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/my-vehicles')}
                        >
                          My vehicles
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/settings')}
                        >
                          Settings
                        </button>
                        <button
                          className="settings-item"
                          onClick={() => handleSettingsItemClick('/communication')}
                        >
                          Communication
                        </button>
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
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    className="login-button"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button
                    className="register-button"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </button>
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
              Home
            </EnhancedNavLink>
            
            {/* Top Brands Menu */}
            <TopBrandsMenu />
            
            <EnhancedNavLink href="/cars" className="nav-link">
              Cars
            </EnhancedNavLink>
            <EnhancedNavLink href="/advanced-search" className="nav-link" requireAuth={true}>
              Advanced Search
            </EnhancedNavLink>
            <EnhancedNavLink href="/sell" className="nav-link" requireAuth={true}>
              Sell Car
            </EnhancedNavLink>
            <EnhancedNavLink href="/brand-gallery" className="nav-link" requireAuth={true}>
              Brand Gallery
            </EnhancedNavLink>
            <EnhancedNavLink href="/dealers" className="nav-link" requireAuth={true}>
              Dealers
            </EnhancedNavLink>
            <EnhancedNavLink href="/finance" className="nav-link" requireAuth={true}>
              Finance
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
            
            {/* Top Brands Menu - Mobile */}
            <div style={{ margin: '8px 0' }}>
              <TopBrandsMenu />
            </div>
            
            <EnhancedNavLink href="/cars" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Cars
            </EnhancedNavLink>
            <EnhancedNavLink href="/advanced-search" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              Advanced Search
            </EnhancedNavLink>
            <EnhancedNavLink href="/sell" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              Sell Car
            </EnhancedNavLink>
            <EnhancedNavLink href="/brand-gallery" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              Brand Gallery
            </EnhancedNavLink>
            <EnhancedNavLink href="/dealers" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              Dealers
            </EnhancedNavLink>
            <EnhancedNavLink href="/finance" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} requireAuth={true}>
              Finance
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
                Login
              </button>
              <button
                className="mobile-register-button"
                onClick={() => {
                  navigate('/register');
                  setIsMenuOpen(false);
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;