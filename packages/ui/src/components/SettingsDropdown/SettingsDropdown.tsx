// Settings Dropdown Component with Language and Theme Options
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import './SettingsDropdown.css';

interface SettingsDropdownProps {
  className?: string;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: 'bg' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsOpen(false);
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className={`settings-dropdown ${className}`} ref={dropdownRef}>
      <button
        className="settings-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('settings.title')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="settings-icon">⚙️</span>
        <span className="settings-text">{t('settings.title')}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="settings-menu">
          {/* Language Section */}
          <div className="settings-section">
            <div className="settings-section-title">
              <span className="section-icon">🌐</span>
              {t('settings.language')}
            </div>
            <div className="settings-options">
              <button
                className={`settings-option ${language === 'bg' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('bg')}
              >
                <span className="flag">🇧🇬</span>
                <span>Български</span>
                {language === 'bg' && <span className="checkmark">✓</span>}
              </button>
              <button
                className={`settings-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <span className="flag">🇺🇸</span>
                <span>English</span>
                {language === 'en' && <span className="checkmark">✓</span>}
              </button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="settings-section">
            <div className="settings-section-title">
              <span className="section-icon">🎨</span>
              {t('settings.theme')}
            </div>
            <div className="settings-options">
              <button
                className="settings-option"
                onClick={handleThemeToggle}
              >
                <span className="theme-icon">🌙</span>
                <span>{t('settings.toggleTheme')}</span>
                <span className="toggle-indicator">⚡</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="settings-section">
            <div className="settings-section-title">
              <span className="section-icon">🚀</span>
              {t('settings.quickActions')}
            </div>
            <div className="settings-options">
              <button
                className="settings-option action-button"
                onClick={clearCache}
              >
                <span className="action-icon">🗑️</span>
                <span>{t('settings.clearCache')}</span>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="settings-footer">
            <div className="app-info">
              <span className="app-name">Globul Cars</span>
              <span className="app-version">v2.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;