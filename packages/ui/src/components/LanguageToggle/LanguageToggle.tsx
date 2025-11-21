// Smart Language Toggle Button Component
import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

interface LanguageToggleProps {
  className?: string;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = '', 
  showText = false,
  size = 'medium'
}) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'bg' ? 'en' : 'bg';
    setLanguage(newLanguage);
  };

  const getLanguageText = () => language === 'bg' ? 'БГ' : 'EN';

  return (
    <button 
      className={`action-button ${className}`}
      onClick={toggleLanguage}
      title={language === 'bg' ? 'Switch to English' : 'Превключи на български'}
      aria-label={language === 'bg' ? 'Switch to English' : 'Превключи на български'}
    >
      <Globe size={20} />
      {showText && <span style={{ marginLeft: '4px', fontSize: '12px' }}>{getLanguageText()}</span>}
    </button>
  );
};

export default LanguageToggle;
