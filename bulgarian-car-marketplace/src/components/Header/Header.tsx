// Smart Header Component with Global Language Control
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import './Header.css';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section">
          <img 
            src="/logo.png" 
            alt="Globul Cars" 
            className="logo-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="logo-text">Globul Cars</span>
        </div>

        {/* Navigation */}
        <nav className="main-navigation">
          <a href="/" className="nav-link">
            {t('nav.home')}
          </a>
          <a href="/cars" className="nav-link">
            {t('nav.cars')}
          </a>
          <a href="/advanced-search" className="nav-link">
            {t('nav.advancedSearch')}
          </a>
          <a href="/sell" className="nav-link">
            {t('nav.sell')}
          </a>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          {/* Language Toggle */}
          <LanguageToggle size="small" className="header-language-toggle" />
          
          {/* User Actions */}
          <div className="user-actions">
            <button className="auth-button login-button">
              {t('nav.login')}
            </button>
            <button className="auth-button register-button">
              {t('nav.register')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;