// CyberToggle.tsx - زر التبديل بين الوضع الليلي والنهاري بتصميم Cyber
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './CyberToggle.css';

const CyberToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="cyber-toggle-wrapper">
      <input 
        type="checkbox" 
        className="cyber-toggle-checkbox" 
        id="cyber-toggle"
        checked={isDark}
        onChange={toggleTheme}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      />
      <label htmlFor="cyber-toggle" className="cyber-toggle-label">
        <span className="toggle-track"></span>
        <span className="toggle-thumb-icon"></span>
        <span className="toggle-thumb-dots"></span>
        <span className="toggle-thumb-highlight"></span>
        <span className="toggle-labels">
          <span className="toggle-label-on">ON</span>
          <span className="toggle-label-off">OFF</span>
        </span>
      </label>
    </div>
  );
};

export default CyberToggle;

