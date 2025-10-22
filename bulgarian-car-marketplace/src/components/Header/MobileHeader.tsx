// MobileHeader.tsx - Professional Mobile Header Component
// Clean 1-row header + Slide-out menu for all actions

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Menu,
  X,
  User,
  Heart,
  MessageCircle,
  Calendar,
  Bell,
  Settings,
  Globe,
  LogOut,
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Star,
  Bookmark,
  HelpCircle,
  Shield
} from 'lucide-react';
import './MobileHeader.css';

const MobileHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
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

  const handleMenuItemClick = (path: string) => {
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
      {/* ✅ MAIN HEADER - Fixed Top */}
      <header className="mobile-header-fixed">
        <div className="mobile-header-container">
          {/* 1. Hamburger Menu Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 2. Logo (Center) */}
          <div className="mobile-logo" onClick={() => navigate('/')}>
            <img 
              src="/globul-logo.png" 
              alt="Globul Cars"
              className="mobile-logo-icon"
            />
            <span className="mobile-logo-text">Globul Cars</span>
          </div>

          {/* 3. User/Login Button (Right) */}
          <div className="mobile-user-section">
            {user ? (
              <button 
                className="mobile-user-btn"
                onClick={() => handleMenuItemClick('/profile')}
              >
                <User size={20} />
              </button>
            ) : (
              <button 
                className="mobile-login-btn"
                onClick={() => handleMenuItemClick('/login')}
              >
                {language === 'bg' ? 'Вход' : 'Login'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ✅ SLIDE-OUT MENU - Professional Drawer */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Menu Header */}
          <div className="mobile-menu-header">
            <img src="/globul-logo.png" alt="Globul Cars" className="menu-logo" />
            <button className="menu-close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* User Info (if logged in) */}
          {user && (
            <div className="mobile-user-info">
              <div className="user-avatar">
                <User size={32} />
              </div>
              <div className="user-details">
                <div className="user-name">{user.displayName || user.email?.split('@')[0]}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Menu Content - Scrollable */}
          <div className="mobile-menu-content">
            
            {/* Primary Actions */}
            <div className="menu-section">
              <div className="menu-section-title">{language === 'bg' ? 'Основни' : 'Main'}</div>
              
              <button className="menu-item" onClick={() => handleMenuItemClick('/')}>
                <LayoutDashboard size={20} />
                <span>{language === 'bg' ? 'Начало' : 'Home'}</span>
              </button>

              <button className="menu-item" onClick={() => handleMenuItemClick('/cars')}>
                <ShoppingBag size={20} />
                <span>{language === 'bg' ? 'Автомобили' : 'Cars'}</span>
              </button>

              <button className="menu-item" onClick={() => handleMenuItemClick('/favorites')}>
                <Heart size={20} />
                <span>{language === 'bg' ? 'Любими' : 'Favorites'}</span>
              </button>

              <button className="menu-item" onClick={() => handleMenuItemClick('/messages')}>
                <MessageCircle size={20} />
                <span>{language === 'bg' ? 'Съобщения' : 'Messages'}</span>
              </button>

              <button className="menu-item" onClick={() => handleMenuItemClick('/events')}>
                <Calendar size={20} />
                <span>{language === 'bg' ? 'Събития' : 'Events'}</span>
              </button>

              <button className="menu-item" onClick={() => handleMenuItemClick('/profile/notifications')}>
                <Bell size={20} />
                <span>{language === 'bg' ? 'Известия' : 'Notifications'}</span>
              </button>
            </div>

            {/* User-specific Actions (if logged in) */}
            {user && (
              <div className="menu-section">
                <div className="menu-section-title">{language === 'bg' ? 'Моят профил' : 'My Account'}</div>
                
                <button className="menu-item" onClick={() => handleMenuItemClick('/profile')}>
                  <User size={20} />
                  <span>{language === 'bg' ? 'Профил' : 'Profile'}</span>
                </button>

                <button className="menu-item" onClick={() => handleMenuItemClick('/analytics')}>
                  <BarChart3 size={20} />
                  <span>{language === 'bg' ? 'Статистики' : 'Analytics'}</span>
                </button>

                <button className="menu-item" onClick={() => handleMenuItemClick('/dashboard')}>
                  <LayoutDashboard size={20} />
                  <span>{language === 'bg' ? 'Табло' : 'Dashboard'}</span>
                </button>

                <button className="menu-item" onClick={() => handleMenuItemClick('/saved-searches')}>
                  <Bookmark size={20} />
                  <span>{language === 'bg' ? 'Запазени търсения' : 'Saved Searches'}</span>
                </button>
              </div>
            )}

            {/* Settings & Language */}
            <div className="menu-section">
              <div className="menu-section-title">{language === 'bg' ? 'Настройки' : 'Settings'}</div>
              
              <button className="menu-item" onClick={toggleLanguage}>
                <Globe size={20} />
                <span>
                  {language === 'bg' ? 'English' : 'Български'}
                </span>
                <span className="menu-item-badge">{language.toUpperCase()}</span>
              </button>

              {user && (
                <button className="menu-item" onClick={() => handleMenuItemClick('/settings')}>
                  <Settings size={20} />
                  <span>{language === 'bg' ? 'Настройки' : 'Settings'}</span>
                </button>
              )}

              <button className="menu-item" onClick={() => handleMenuItemClick('/help')}>
                <HelpCircle size={20} />
                <span>{language === 'bg' ? 'Помощ' : 'Help'}</span>
              </button>

              <button className="menu-item" onClick={() => handleMenuItemClick('/privacy')}>
                <Shield size={20} />
                <span>{language === 'bg' ? 'Поверителност' : 'Privacy'}</span>
              </button>
            </div>

            {/* Logout / Login */}
            <div className="menu-section">
              {user ? (
                <button className="menu-item logout-item" onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>{language === 'bg' ? 'Изход' : 'Logout'}</span>
                </button>
              ) : (
                <>
                  <button className="menu-item primary-item" onClick={() => handleMenuItemClick('/login')}>
                    <User size={20} />
                    <span>{language === 'bg' ? 'Вход' : 'Login'}</span>
                  </button>
                  <button className="menu-item" onClick={() => handleMenuItemClick('/register')}>
                    <User size={20} />
                    <span>{language === 'bg' ? 'Регистрация' : 'Register'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Menu Footer */}
          <div className="mobile-menu-footer">
            <div className="footer-text">
              © 2025 Globul Cars
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;

