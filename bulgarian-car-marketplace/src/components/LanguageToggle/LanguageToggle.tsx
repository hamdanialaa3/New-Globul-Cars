// Smart Language Toggle Button Component
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

interface LanguageToggleProps {
  className?: string;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = '', 
  showText = true,
  size = 'medium'
}) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'bg' ? 'en' : 'bg';
    setLanguage(newLanguage);
    
    // Show a brief notification
    const notification = document.createElement('div');
    notification.className = 'language-change-notification';
    notification.textContent = newLanguage === 'bg' 
      ? '🇧🇬 Български' 
      : '🇺🇸 English';
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 2 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);
  };

  const getFlag = () => language === 'bg' ? '🇧🇬' : '🇺🇸';
  const getLanguageName = () => language === 'bg' ? 'БГ' : 'EN';

  return (
    <button 
      className={`language-toggle ${size} ${className}`}
      onClick={toggleLanguage}
      title={language === 'bg' ? 'Switch to English' : 'Превключи на български'}
      aria-label={language === 'bg' ? 'Switch to English' : 'Превключи на български'}
    >
      <span className="flag">{getFlag()}</span>
      {showText && (
        <span className="language-text">
          {getLanguageName()}
        </span>
      )}
      <span className="toggle-arrow">↔️</span>
    </button>
  );
};

export default LanguageToggle;