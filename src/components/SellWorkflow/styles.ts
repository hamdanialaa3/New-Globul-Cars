
import styled, { keyframes } from 'styled-components';

// ============================================================================
// 🎨 MODERN ANIMATIONS - أنيميشن عصري محسّن
// ============================================================================

export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// New: Smooth Scale & Fade
export const scaleInFade = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// New: Gentle Bounce
export const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
`;

// ============================================================================
// 📦 MAIN CONTAINER - الحاوية الرئيسية
// ============================================================================

export const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
  
  /* Modern gradient background */
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 78, 137, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

export const StepContent = styled.div<{ $direction: 'forward' | 'backward' }>`
  animation: ${props => props.$direction === 'forward' ? slideInRight : slideInLeft} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 100%;
  display: flex;
  flex-direction: column;
  
  /* Clean card design - single frame */
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  /* Full content visible - no height restriction */
  min-height: auto;
  overflow: visible;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

export const StepTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366F1 0%, #004E89 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1.5rem 0;
  text-align: center;
  letter-spacing: -0.02em;
  animation: ${scaleInFade} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

// ============================================================================
// 🎯 NAVIGATION SECTION - قسم التنقل
// ============================================================================

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0 0 0;
  margin-top: 2rem;
  border-top: 2px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.06)'
  };
  position: relative;
  flex-wrap: wrap;
  z-index: 10;
  
  /* Add decorative glow line */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, #6366F1, transparent);
    border-radius: 2px;
    animation: ${fadeIn} 0.6s ease-out;
  }

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    margin-top: 0;
    position: sticky;
    bottom: 0;
    background: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(15, 23, 42, 0.97)'
        : 'rgba(255, 255, 255, 0.97)'
    };
    backdrop-filter: blur(12px);
    border-top: 1px solid ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)'
    };
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    border-radius: 0;
    flex-shrink: 0;

    &::before {
      display: none;
    }
    
    & > div {
      width: 100%;
      justify-content: center;
    }

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

// ============================================================================
// ⚠️ RESET BUTTON - زر إعادة التعيين
// ============================================================================

export const ResetButton = styled.button<{ disabled?: boolean }>`
  position: relative;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(239, 68, 68, 0.3)'
      : 'rgba(239, 68, 68, 0.2)'
  };
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(239, 68, 68, 0.08)'
      : 'rgba(239, 68, 68, 0.05)'
  };
  color: #EF4444;
  white-space: nowrap;
  line-height: 1.4;
  min-height: 48px;
  z-index: 10;
  overflow: hidden;
  
  /* Animated background gradient */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #EF4444, #DC2626);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &:hover:not(:disabled) {
    border-color: #EF4444;
    color: white;
    transform: translateY(-2px);
    box-shadow: 
      0 8px 20px rgba(239, 68, 68, 0.25),
      0 2px 6px rgba(239, 68, 68, 0.15);
    
    &::after {
      opacity: 1;
    }
    
    svg {
      transform: rotate(180deg);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &:not(:disabled) {
    pointer-events: auto;
  }
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  /* Mobile Styles */
  @media (max-width: 640px) and (orientation: portrait) {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
    min-width: unset;
    width: 100%;
    justify-content: center;
    
    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    
    span {
      display: inline;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.625rem 0.875rem;
    min-width: 44px;
    border-radius: 10px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// ============================================================================
// 💬 RESET CONFIRMATION DIALOG - مربع تأكيد إعادة التعيين
// ============================================================================

export const ResetConfirmDialog = styled.div`
  position: absolute;
  bottom: calc(100% + 1.25rem);
  left: 0;
  padding: 1.5rem;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(17, 24, 39, 0.95)'
      : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 1000;
  min-width: 320px;
  animation: ${bounceIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Arrow pointer */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 30px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)'
    };
  }
  
  @media (max-width: 640px) {
    left: 50%;
    transform: translateX(-50%);
    min-width: 280px;
    bottom: calc(100% + 0.75rem);
    padding: 1.25rem;
    border-radius: 14px;
    
    &::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

export const ResetConfirmTitle = styled.div`
  font-weight: 700;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#111827'};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  
  svg {
    color: #F59E0B;
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
  }
`;

export const ResetConfirmText = styled.div`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#6B7280'};
  margin-bottom: 1.25rem;
  line-height: 1.6;
  letter-spacing: 0.01em;
`;

export const ResetConfirmButtons = styled.div`
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
`;

export const ConfirmButton = styled.button<{ $variant: 'danger' | 'cancel' }>`
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
  
  ${props => props.$variant === 'danger' ? `
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    
    &:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    }
  ` : `
    background: ${(props: any) =>
      props.theme?.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'
    };
    color: ${(props: any) => props.theme?.mode === 'dark' ? '#fff' : '#374151'};
    
    &:hover {
      background: ${(props: any) =>
        props.theme?.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.08)'
      };
    }
  `}
  
  &:active {
    transform: scale(0.98);
  }
`;

// ============================================================================
// 🔘 MODERN BUTTONS - أزرار عصرية محسنة
// ============================================================================

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  /* Base Styles */
  position: relative;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  border: none;
  white-space: nowrap;
  line-height: 1.4;
  min-height: 52px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.01em;
  
  /* Ripple effect container */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease-out, height 0.6s ease-out;
  }
  
  &:active:not(:disabled)::before {
    width: 400px;
    height: 400px;
    opacity: 0;
    transition: 0s;
  }
  
  /* Icon styling */
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  /* Primary Variant - Orange Gradient */
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #FFA07A 100%);
    background-size: 200% 100%;
    color: white;
    box-shadow: 
      0 4px 14px rgba(99, 102, 241, 0.35),
      0 2px 6px rgba(99, 102, 241, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &:hover:not(:disabled) {
      background-position: 100% 0;
      transform: translateY(-3px) scale(1.02);
      box-shadow: 
        0 12px 28px rgba(99, 102, 241, 0.45),
        0 4px 12px rgba(99, 102, 241, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
      
      svg {
        transform: translateX(4px);
      }
    }
    
    &:active:not(:disabled) {
      transform: translateY(-1px) scale(1.01);
    }
  `}
  
  /* Secondary Variant - Blue Gradient */
  ${props => props.$variant === 'secondary' && `
    background: ${(p: any) => 
      p.theme?.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(255, 255, 255, 0.9)'
    };
    color: ${(p: any) => p.theme?.mode === 'dark' ? '#fff' : '#111827'};
    border: 2px solid ${(p: any) =>
      p.theme?.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.08)'
    };
    backdrop-filter: blur(12px);
    box-shadow: 
      0 4px 14px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    &:hover:not(:disabled) {
      border-color: #6366F1;
      background: ${(p: any) =>
        p.theme?.mode === 'dark'
          ? 'rgba(99, 102, 241, 0.15)'
          : 'rgba(99, 102, 241, 0.08)'
      };
      transform: translateY(-3px);
      box-shadow: 
        0 12px 28px rgba(99, 102, 241, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      
      svg {
        transform: translateX(-4px);
      }
    }
  `}
  
  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    
    &:hover {
      transform: none !important;
    }
  }
  
  /* Mobile Optimizations */
  @media (max-width: 640px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
    min-height: 48px;
    border-radius: 12px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1.25rem;
    font-size: 0;
    min-width: 48px;
    gap: 0;
    
    svg {
      width: 20px;
      height: 20px;
      margin: 0;
    }
    
    span {
      display: none;
    }
  }
  
  @media (max-width: 896px) and (orientation: landscape) {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    gap: 0.375rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.625rem 0.875rem;
    font-size: 0;
    min-width: 44px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// TimerBadge removed - Timer now shown in ModalWorkflowTimer only

// ============================================================================
// 🏷️ STATUS BADGES - شارات الحالة العصرية
// ============================================================================

export const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 10px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  & > * {
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  @media (max-width: 640px) {
    gap: 1rem;
    padding: 0 5px;
  }
`;

export const DraftBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.12) 0%,
    rgba(5, 150, 105, 0.12) 100%
  );
  border: 1.5px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(16, 185, 129, 0.35)'
      : 'rgba(16, 185, 129, 0.3)'
  };
  border-radius: 12px;
  color: #10B981;
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  line-height: 1.4;
  animation: ${scaleInFade} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 2px 8px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  /* Pulsing dot indicator */
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    flex-shrink: 0;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }

  @keyframes pulse-dot {
    0%, 100% { 
      transform: scale(0.9); 
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); 
    }
    50% { 
      transform: scale(1.1); 
      box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); 
    }
  }
  
  @media (max-width: 640px) {
    padding: 0.375rem 0.875rem;
    font-size: 0.8125rem;
    gap: 0.375rem;
    
    &::before {
      width: 6px;
      height: 6px;
    }
  }
`;

