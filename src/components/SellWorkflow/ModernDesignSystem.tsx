// Modern Design System for Sell Workflow
// نظام تصميم عصري متقدم - Material Design 3 + Glassmorphism

import styled, { keyframes, css } from 'styled-components';

// ============================================================================
// 🎨 MODERN COLOR SYSTEM - نظام الألوان العصري
// ============================================================================

export const colors = {
  // Primary Colors - Automotive Theme
  primary: {
    main: '#FF6B35',      // Vibrant Orange (Car theme)
    light: '#FF8C61',
    dark: '#E5512A',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)',
  },
  secondary: {
    main: '#004E89',      // Deep Blue (Trust & Reliability)
    light: '#1A6EAA',
    dark: '#003866',
    gradient: 'linear-gradient(135deg, #004E89 0%, #1A6EAA 100%)',
  },
  accent: {
    success: '#10B981',   // Green
    warning: '#F59E0B',   // Amber
    error: '#EF4444',     // Red
    info: '#3B82F6',      // Blue
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
  // Glass Effects
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.1)',
  },
};

// ============================================================================
// 🌟 ADVANCED ANIMATIONS - أنيميشن متقدم
// ============================================================================

// Ripple Effect Animation
export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Smooth Scale In
export const scaleIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Slide Up Fade In
export const slideUpFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Shimmer Loading Effect
export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Pulse Glow Effect
export const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 107, 53, 0.6);
  }
`;

// Floating Animation
export const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// ============================================================================
// 🎯 MODERN BUTTON SYSTEM - نظام الأزرار العصري
// ============================================================================

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  $size?: 'sm' | 'md' | 'lg' | 'xl';
  $fullWidth?: boolean;
  $loading?: boolean;
  $icon?: boolean;
}

export const ModernButton = styled.button<ButtonProps>`
  /* Base Styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Prevent text selection */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  /* Size Variants */
  ${props => props.$size === 'sm' && css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: 8px;
  `}
  
  ${props => props.$size === 'md' && css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 10px;
  `}
  
  ${props => props.$size === 'lg' && css`
    padding: 1rem 2rem;
    font-size: 1.125rem;
    border-radius: 12px;
  `}
  
  ${props => props.$size === 'xl' && css`
    padding: 1.25rem 2.5rem;
    font-size: 1.25rem;
    border-radius: 14px;
  `}
  
  /* Default to medium if not specified */
  ${props => !props.$size && css`
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
  `}
  
  /* Full Width */
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  /* Color Variants */
  ${props => props.$variant === 'primary' && css`
    background: ${colors.primary.gradient};
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background: ${colors.secondary.gradient};
    color: white;
    box-shadow: 0 4px 12px rgba(0, 78, 137, 0.3);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 78, 137, 0.4);
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background: transparent;
    color: ${colors.primary.main};
    border: 2px solid ${colors.primary.main};
    
    &:hover:not(:disabled) {
      background: ${colors.primary.main};
      color: white;
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.$variant === 'ghost' && css`
    background: transparent;
    color: ${colors.neutral.gray700};
    
    &:hover:not(:disabled) {
      background: ${colors.neutral.gray100};
    }
  `}
  
  ${props => props.$variant === 'danger' && css`
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
    }
  `}
  
  /* Icon Only Button */
  ${props => props.$icon && css`
    padding: 0.75rem;
    aspect-ratio: 1;
    border-radius: 50%;
  `}
  
  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  /* Loading State */
  ${props => props.$loading && css`
    pointer-events: none;
    opacity: 0.8;
  `}
  
  /* Ripple Effect Container */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active:not(:disabled)::after {
    width: 300px;
    height: 300px;
    opacity: 0;
    transition: 0s;
  }
`;

// ============================================================================
// 💎 GLASSMORPHISM CARD - بطاقات زجاجية
// ============================================================================

interface GlassCardProps {
  $elevated?: boolean;
  $interactive?: boolean;
  $glow?: boolean;
}

export const GlassCard = styled.div<GlassCardProps>`
  background: ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.$elevated && css`
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.06);
  `}
  
  ${props => props.$interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.08);
    }
  `}
  
  ${props => props.$glow && css`
    animation: ${pulseGlow} 2s ease-in-out infinite;
  `}
`;

// ============================================================================
// 📝 MODERN INPUT SYSTEM - نظام الحقول العصري
// ============================================================================

interface InputWrapperProps {
  $focused?: boolean;
  $hasError?: boolean;
  $hasValue?: boolean;
}

export const ModernInputWrapper = styled.div<InputWrapperProps>`
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
`;

export const ModernInput = styled.input<InputWrapperProps>`
  width: 100%;
  padding: 1rem 1rem 0.5rem 1rem;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'
  };
  border: 2px solid ${props =>
    props.$hasError ? colors.accent.error :
    props.$focused ? colors.primary.main :
    colors.neutral.gray300
  };
  border-radius: 12px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#111827'};
  
  &:hover:not(:disabled) {
    border-color: ${props =>
      props.$hasError ? colors.accent.error : colors.primary.light
    };
  }
  
  &:focus {
    border-color: ${props =>
      props.$hasError ? colors.accent.error : colors.primary.main
    };
    box-shadow: 0 0 0 4px ${props =>
      props.$hasError 
        ? 'rgba(239, 68, 68, 0.1)' 
        : 'rgba(255, 107, 53, 0.1)'
    };
  }
  
  &::placeholder {
    color: transparent;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FloatingLabel = styled.label<InputWrapperProps>`
  position: absolute;
  left: 1rem;
  top: ${props => props.$hasValue || props.$focused ? '0.5rem' : '1rem'};
  font-size: ${props => props.$hasValue || props.$focused ? '0.75rem' : '1rem'};
  color: ${props =>
    props.$hasError ? colors.accent.error :
    props.$focused ? colors.primary.main :
    colors.neutral.gray500
  };
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#0f172a' : 'white'
  };
  padding: 0 0.25rem;
  font-weight: ${props => props.$hasValue || props.$focused ? '600' : '400'};
`;

export const ModernSelect = styled.select<InputWrapperProps>`
  width: 100%;
  padding: 1rem 1rem 0.5rem 1rem;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'
  };
  border: 2px solid ${props =>
    props.$hasError ? colors.accent.error :
    props.$focused ? colors.primary.main :
    colors.neutral.gray300
  };
  border-radius: 12px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#111827'};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 20px;
  padding-right: 3rem;
  
  &:hover:not(:disabled) {
    border-color: ${props =>
      props.$hasError ? colors.accent.error : colors.primary.light
    };
  }
  
  &:focus {
    border-color: ${props =>
      props.$hasError ? colors.accent.error : colors.primary.main
    };
    box-shadow: 0 0 0 4px ${props =>
      props.$hasError 
        ? 'rgba(239, 68, 68, 0.1)' 
        : 'rgba(255, 107, 53, 0.1)'
    };
  }
`;

// ============================================================================
// 🎪 MODERN STEPPER - مؤشر الخطوات العصري
// ============================================================================

export const ModernStepperContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  background: ${({ theme }) =>
    theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
  };
  margin-bottom: 2rem;
  overflow-x: auto;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.5rem;
  }
`;

interface StepItemProps {
  $active?: boolean;
  $completed?: boolean;
  $clickable?: boolean;
}

export const StepItem = styled.div<StepItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  flex-shrink: 0;
  min-width: 80px;
  
  ${props => props.$clickable && css`
    &:hover {
      transform: translateY(-2px);
    }
  `}
`;

export const StepCircle = styled.div<StepItemProps>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  
  ${props => props.$completed && css`
    background: ${colors.accent.success};
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  `}
  
  ${props => props.$active && !props.$completed && css`
    background: ${colors.primary.gradient};
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
    animation: ${pulseGlow} 2s ease-in-out infinite;
  `}
  
  ${props => !props.$active && !props.$completed && css`
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : colors.neutral.gray200
    };
    color: ${colors.neutral.gray500};
  `}
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
`;

export const StepLabel = styled.div<StepItemProps>`
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: ${props =>
    props.$active ? colors.primary.main :
    props.$completed ? colors.accent.success :
    colors.neutral.gray500
  };
  transition: color 0.3s ease;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.625rem;
  }
`;

export const StepConnector = styled.div<{ $completed?: boolean }>`
  flex: 1;
  height: 3px;
  background: ${props =>
    props.$completed 
      ? colors.accent.success 
      : colors.neutral.gray200
  };
  border-radius: 2px;
  transition: all 0.3s ease;
  margin: 0 -0.5rem;
  
  @media (max-width: 768px) {
    height: 2px;
  }
`;

// ============================================================================
// 🎭 MODAL & OVERLAY - النوافذ المنبثقة
// ============================================================================

export const ModernOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${scaleIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ModernModal = styled.div`
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#0f172a' : 'white'
  };
  border-radius: 24px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUpFadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
  }
`;

// ============================================================================
// 🏷️ BADGES & CHIPS - الشارات
// ============================================================================

interface BadgeProps {
  $variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  $size?: 'sm' | 'md' | 'lg';
}

export const ModernBadge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  border-radius: 9999px;
  
  ${props => props.$size === 'sm' && css`
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  `}
  
  ${props => props.$size === 'md' && css`
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  `}
  
  ${props => props.$size === 'lg' && css`
    padding: 0.5rem 1rem;
    font-size: 1rem;
  `}
  
  ${props => !props.$size && css`
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  `}
  
  ${props => props.$variant === 'success' && css`
    background: rgba(16, 185, 129, 0.1);
    color: ${colors.accent.success};
  `}
  
  ${props => props.$variant === 'warning' && css`
    background: rgba(245, 158, 11, 0.1);
    color: ${colors.accent.warning};
  `}
  
  ${props => props.$variant === 'error' && css`
    background: rgba(239, 68, 68, 0.1);
    color: ${colors.accent.error};
  `}
  
  ${props => props.$variant === 'info' && css`
    background: rgba(59, 130, 246, 0.1);
    color: ${colors.accent.info};
  `}
  
  ${props => (!props.$variant || props.$variant === 'neutral') && css`
    background: ${colors.neutral.gray100};
    color: ${colors.neutral.gray700};
  `}
`;

// ============================================================================
// 📱 RESPONSIVE UTILITIES - أدوات التجاوب
// ============================================================================

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

export const Grid = styled.div<{ $cols?: number; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols || 2}, 1fr);
  gap: ${props => props.$gap || '1rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div<{ 
  $direction?: 'row' | 'column'; 
  $align?: string; 
  $justify?: string;
  $gap?: string;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  align-items: ${props => props.$align || 'stretch'};
  justify-content: ${props => props.$justify || 'flex-start'};
  gap: ${props => props.$gap || '0'};
`;

// ============================================================================
// 🎬 LOADING STATES - حالات التحميل
// ============================================================================

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${colors.neutral.gray200};
  border-top-color: ${colors.primary.main};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const SkeletonLoader = styled.div`
  background: linear-gradient(
    90deg,
    ${colors.neutral.gray200} 0%,
    ${colors.neutral.gray100} 50%,
    ${colors.neutral.gray200} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 8px;
  height: 20px;
  width: 100%;
`;
