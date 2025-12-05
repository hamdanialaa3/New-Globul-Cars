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

// Equipment Sections Container - Horizontal Grid
export const EquipmentSectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Equipment Section - Beautiful Card Design
export const EquipmentSection = styled.div`
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--accent-primary);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-primary);

    &::before {
      transform: scaleX(1);
    }
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
`;

export const SectionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

export const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
`;

export const SectionBadge = styled.span`
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(var(--accent-primary-rgb), 0.3);
`;

// Tabs (kept for backward compatibility but not used)
export const TabsContainer = styled.div`
  display: none; /* Hidden - no longer used */
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

// Features Container - All visible, no scroll
export const FeaturesContainer = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow-y: visible;
  max-height: none;
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

// ==================== MODERN TOGGLE BUTTON (Neumorphism Style) ====================

export const CyberToggleWrapper = styled.div`
  position: relative;
  width: 50px;
  height: 26px;
  user-select: none;
`;

export const CyberToggleCheckbox = styled.input`
  display: none;
`;

export const CyberToggleLabel = styled.label`
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
`;

export const ToggleTrack = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  border-radius: 13px;
  transition: background 0.3s ease;
  
  /* Neumorphism effect - inset shadow */
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.1),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: #fff;
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Neumorphism effect - raised button */
    box-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.2),
      -1px -1px 2px rgba(255, 255, 255, 0.8);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: var(--accent-primary);
    box-shadow: 
      inset 2px 2px 4px rgba(0, 0, 0, 0.2),
      inset -2px -2px 4px rgba(255, 255, 255, 0.1);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} &::before {
    transform: translateX(24px);
    box-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.2),
      -1px -1px 2px rgba(255, 255, 255, 0.8);
  }
`;

// Remove all other toggle elements (no longer needed)
export const ToggleThumbIcon = styled.span`
  display: none;
`;

export const ToggleThumbDots = styled.span`
  display: none;
`;

export const ToggleThumbHighlight = styled.span`
  display: none;
`;

export const ToggleLabels = styled.span`
  display: none;
`;

export const ToggleLabelOn = styled.span`
  display: none;
`;

export const ToggleLabelOff = styled.span`
  display: none;
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

