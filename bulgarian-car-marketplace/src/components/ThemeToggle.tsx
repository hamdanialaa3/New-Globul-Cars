import React from 'react';
import styled from 'styled-components';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'select';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onThemeChange?: (isDark: boolean) => void;
}

const ThemeToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ThemeToggleButton = styled.button<{ 
  size: string; 
  variant: string;
  isActive: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.xs;
      case 'lg': return theme.spacing.sm;
      default: return theme.spacing.xs;
    }
  }};
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  border: 1px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : 'transparent'
  };
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.contrastText : theme.colors.text.primary
  };
  font-size: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.sm;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ theme, isActive }) => 
      isActive ? theme.colors.primary.dark : theme.colors.grey[100]
    };
    border-color: ${({ theme, isActive }) => 
      isActive ? theme.colors.primary.dark : theme.colors.primary.main
    };
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ThemeToggleSwitch = styled.div<{ 
  size: string; 
  isActive: boolean;
}>`
  position: relative;
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '40px';
      case 'lg': return '60px';
      default: return '50px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '20px';
      case 'lg': return '30px';
      default: return '24px';
    }
  }};
  background: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : theme.colors.grey[300]
  };
  border-radius: ${({ size }) => {
    switch (size) {
      case 'sm': return '10px';
      case 'lg': return '15px';
      default: return '12px';
    }
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;

  &:hover {
    background: ${({ theme, isActive }) => 
      isActive ? theme.colors.primary.dark : theme.colors.grey[400]
    };
  }

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }
`;

const ThemeToggleSwitchThumb = styled.div<{ 
  size: string; 
  isActive: boolean;
}>`
  position: absolute;
  top: 2px;
  left: ${({ isActive, size }) => {
    if (isActive) {
      switch (size) {
        case 'sm': return '22px';
        case 'lg': return '32px';
        default: return '26px';
      }
    }
    return '2px';
  }};
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '16px';
      case 'lg': return '26px';
      default: return '20px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '16px';
      case 'lg': return '26px';
      default: return '20px';
    }
  }};
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ThemeToggleSelect = styled.select<{ size: string }>`
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.sm;
    }
  }};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ThemeToggleLabel = styled.span<{ size: string }>`
  font-size: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.sm;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ThemeToggleIcon = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
  }
`;

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = true,
  showIcon = true,
  className,
  style,
  onThemeChange,
}) => {
  const { t } = useTranslation();
  const { isDark, toggleTheme, setIsDark } = useTheme();

  const handleThemeChange = (newIsDark: boolean) => {
    setIsDark(newIsDark);
    onThemeChange?.(newIsDark);
  };

  const handleToggle = () => {
    toggleTheme();
    onThemeChange?.(!isDark);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'light') {
      handleThemeChange(false);
    } else if (value === 'dark') {
      handleThemeChange(true);
    } else {
      // Auto/system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      handleThemeChange(prefersDark);
    }
  };

  const getThemeIcon = () => {
    if (isDark) {
      return <Moon size={18} />;
    }
    return <Sun size={18} />;
  };

  const getThemeLabel = () => {
    if (isDark) {
      return t('themeToggle.dark', 'Dark');
    }
    return t('themeToggle.light', 'Light');
  };

  if (variant === 'switch') {
    return (
      <ThemeToggleContainer className={className} style={style}>
        {showLabel && (
          <ThemeToggleLabel size={size}>
            {getThemeLabel()}
          </ThemeToggleLabel>
        )}
        <ThemeToggleSwitch
          size={size}
          isActive={isDark}
          onClick={handleToggle}
          role="switch"
          aria-checked={isDark}
          aria-label={t('themeToggle.toggle', 'Toggle theme')}
        >
          <ThemeToggleSwitchThumb size={size} isActive={isDark} />
        </ThemeToggleSwitch>
      </ThemeToggleContainer>
    );
  }

  if (variant === 'select') {
    return (
      <ThemeToggleContainer className={className} style={style}>
        {showLabel && (
          <ThemeToggleLabel size={size}>
            {t('themeToggle.theme', 'Theme')}:
          </ThemeToggleLabel>
        )}
        <ThemeToggleSelect
          size={size}
          value={isDark ? 'dark' : 'light'}
          onChange={handleSelectChange}
        >
          <option value="light">{t('themeToggle.light', 'Light')}</option>
          <option value="dark">{t('themeToggle.dark', 'Dark')}</option>
          <option value="auto">{t('themeToggle.auto', 'Auto')}</option>
        </ThemeToggleSelect>
      </ThemeToggleContainer>
    );
  }

  // Default button variant
  return (
    <ThemeToggleContainer className={className} style={style}>
      <ThemeToggleButton
        size={size}
        variant={variant}
        isActive={isDark}
        onClick={handleToggle}
        aria-label={t('themeToggle.toggle', 'Toggle theme')}
      >
        {showIcon && (
          <ThemeToggleIcon size={size}>
            {getThemeIcon()}
          </ThemeToggleIcon>
        )}
        {showLabel && (
          <ThemeToggleLabel size={size}>
            {getThemeLabel()}
          </ThemeToggleLabel>
        )}
      </ThemeToggleButton>
    </ThemeToggleContainer>
  );
};

export default ThemeToggle;