// Unified Equipment Styles with Cyber Toggle Buttons
// أنماط الصفحة الموحدة مع أزرار Toggle متقدمة

import styled from 'styled-components';

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const HeaderCard = styled.div`
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  padding: 2.5rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent-primary);
  }
`;

export const Title = styled.h1`
  font-size: 1.75rem; /* 28px - Global Standard */
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem; /* 16px */
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
`;

export const BrandOrbitInline = styled.div`
  align-self: flex-start;
  max-width: 240px;
  margin-top: 1rem;
`;

// Tabs
export const TabsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Tab = styled.button<{ $isActive: boolean; $hasSelection: boolean; $isEmpty: boolean }>`
  position: relative;
  background: ${props => props.$isActive 
    ? 'var(--accent-primary)' 
    : 'var(--bg-accent)'
  };
  
  /* ⚡ LED PULSING BORDER - Green when selected, Red when empty */
  border: 2px solid ${props => {
    if (props.$isEmpty && !props.$isActive) return 'var(--error)';
    if (props.$hasSelection && !props.$isActive) return 'var(--success)';
    return 'transparent';
  }};
  
  animation: ${props => {
    if (props.$isEmpty && !props.$isActive) return 'ledPulseRed 1.5s ease-in-out infinite';
    if (props.$hasSelection && !props.$isActive) return 'ledPulseGreen 1.5s ease-in-out infinite';
    return 'none';
  }};
  
  @keyframes ledPulseRed {
    0%, 100% {
      border-color: var(--error);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
    }
    50% {
      border-color: #ff6b6b;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
    }
  }
  
  @keyframes ledPulseGreen {
    0%, 100% {
      border-color: var(--success);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }
    50% {
      border-color: #4ade80;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
    }
  }
  
  border-radius: 12px;
  padding: 1rem 0.5rem; /* تقليل padding الأفقي */
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 60px;
  white-space: nowrap; /* لا ينزل النص */

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Professional Tab Icons - CSS only
export const SafetyIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    clip-path: polygon(
      50% 0%, 90% 20%, 90% 60%, 50% 100%, 10% 60%, 10% 20%
    );
    filter: drop-shadow(0 0 4px currentColor);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 10px;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-top: none;
    border-left: none;
    transform: translate(-55%, -60%) rotate(45deg);
  }
`;

export const ComfortIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    clip-path: polygon(
      30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%
    );
    animation: sparkle 2s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    box-shadow: 
      -6px -6px 0 0 rgba(255, 255, 255, 0.7),
      6px -6px 0 0 rgba(255, 255, 255, 0.7),
      -6px 6px 0 0 rgba(255, 255, 255, 0.7),
      6px 6px 0 0 rgba(255, 255, 255, 0.7);
  }
  
  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }
`;

export const InfotainmentIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    border-radius: 50%;
    filter: drop-shadow(0 0 4px currentColor);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 8px 10px;
    border-color: transparent transparent transparent rgba(255, 255, 255, 0.9);
    margin-left: 2px;
  }
`;

export const ExtrasIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 2px;
    background: currentColor;
    box-shadow: 
      0 -4px 0 0 currentColor,
      0 4px 0 0 currentColor;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    width: 12px;
    height: 2px;
    background: currentColor;
    box-shadow: 
      0 -4px 0 0 currentColor,
      0 4px 0 0 currentColor;
    filter: drop-shadow(0 0 4px currentColor);
  }
`;

export const TabLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: inherit;
  white-space: nowrap; /* لا ينزل لسطرين */
`;

export const TabBadge = styled.span`
  background: var(--success);
  color: var(--text-on-accent);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
`;

// Features Container - No Scrollbar, All Visible
export const FeaturesContainer = styled.div`
  background: var(--bg-card);
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: none; /* إزالة max-height */
  overflow-y: visible; /* كل شيء ظاهر */
`;

export const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--bg-accent);
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-disabled);
  }
`;

export const FeatureInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const FeatureIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-accent);
  color: var(--accent-primary);
`;

export const FeatureName = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
`;

// ==================== CYBER TOGGLE BUTTON ====================

export const CyberToggleWrapper = styled.div`
  position: relative;
  width: 60px;
  height: 30px;
  user-select: none;
  overflow: hidden;
`;

export const CyberToggleCheckbox = styled.input`
  display: none;
`;

export const CyberToggleLabel = styled.label`
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

export const ToggleTrack = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #2c2f33;
  border-radius: 20px;
  transition: background 0.4s ease-in-out;
  box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.4);

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    background: #fff;
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.7, 1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: #03e9f4;
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} &::before {
    transform: translateX(30px);
  }
`;

export const ToggleThumbIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #fff;
  mask-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(32px) translateY(-50%);
    opacity: 1;
  }
`;

export const ToggleThumbDots = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 
    -7px 0 0 0 #fff,
    7px 0 0 0 #fff,
    0 -7px 0 0 #fff,
    0 7px 0 0 #fff;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translate(30px, -50%);
    opacity: 0;
  }
`;

export const ToggleThumbHighlight = styled.span`
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5), transparent);
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(32px) translateY(-50%);
    opacity: 1;
  }
`;

export const ToggleLabels = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: space-between;
  width: 80%;
  font-size: 0.5rem; /* 8px - أصغر ليحتوي الكلمتين */
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  pointer-events: none;
  color: var(--text-secondary);
`;

export const ToggleLabelOn = styled.span`
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  color: var(--text-on-accent);

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 1;
  }
`;

export const ToggleLabelOff = styled.span`
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
  color: var(--text-on-accent);

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 0;
  }
`;

// ==================== INFO & NAVIGATION ====================

export const InfoBox = styled.div`
  background: var(--bg-accent);
  border-left: 4px solid var(--accent-primary);
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.6;
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem; /* 16px - Global Standard */
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  ${props => props.$variant === 'primary' 
    ? `
      background: var(--accent-primary);
      color: var(--text-on-accent);
      box-shadow: var(--shadow-md);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
    `
    : `
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 2px solid var(--border);
      
      &:hover {
        background: var(--bg-disabled);
      }
    `
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

