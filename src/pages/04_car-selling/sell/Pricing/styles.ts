// Pricing Page Styles
// أنماط صفحة التسعير

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

export const FormCard = styled.div`
  background: var(--bg-card);
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.575rem; /* 150% من 1.05rem */
`;

export const PriceInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

export const PriceIcon = styled.div`
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-orange);
  pointer-events: none;
`;

export const PriceInput = styled.input`
  width: 100%;
  padding: 1.25rem 4rem 1.25rem 1.25rem;
  border: 2px solid var(--border);
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-orange);
    box-shadow: var(--focus-shadow);
  }

  &::placeholder {
    color: var(--text-placeholder);
    font-weight: 400;
  }
`;

// ✅ Professional Toggle Switch Component
export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-accent);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-hover);
  }
`;

export const ToggleSwitch = styled.label<{ $checked: boolean }>`
  position: relative;
  display: inline-block;
  width: 56px;
  height: 32px;
  cursor: pointer;
  flex-shrink: 0;

  /* Hide default checkbox */
  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  /* Toggle slider track */
  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$checked ? '#22c55e' : '#cbd5e1'};
    border-radius: 34px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$checked 
      ? '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
      : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'};

    /* Slider circle */
    &::before {
      content: '';
      position: absolute;
      height: 26px;
      width: 26px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 
                  0 1px 2px rgba(0, 0, 0, 0.1);
      transform: ${props => props.$checked ? 'translateX(24px)' : 'translateX(0)'};
    }

    /* Active glow effect */
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${props => props.$checked ? '100%' : '0%'};
      height: ${props => props.$checked ? '100%' : '0%'};
      background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
  }

  /* Hover effect */
  &:hover .toggle-slider {
    box-shadow: ${props => props.$checked 
      ? '0 6px 16px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
      : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)'};
  }

  /* Active/pressed state */
  &:active .toggle-slider::before {
    width: 30px;
  }

  /* Dark mode support */
  [data-theme="dark"] & .toggle-slider,
  .dark-theme & .toggle-slider {
    background-color: ${props => props.$checked ? '#22c55e' : '#475569'};
  }
`;

export const ToggleLabel = styled.label`
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  flex: 1;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--accent-primary);
  }
`;

// Legacy checkbox styles (kept for backward compatibility)
export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: var(--bg-accent);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-accent);
  }
`;

export const Checkbox = styled.input`
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: var(--accent-orange);
`;

export const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  font-weight: 500;
`;

export const InfoCard = styled.div`
  display: flex;
  gap: 1rem;
  background: var(--bg-accent);
  border-left: 4px solid var(--accent-primary);
  padding: 1.5rem;
  border-radius: 10px;
`;

export const InfoIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-accent);
  border-radius: 50%;
  color: var(--accent-primary);
`;

export const InfoText = styled.div`
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.6;

  strong {
    color: var(--accent-primary);
  }
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.3rem 0.75rem; /* حجم المربع */
  border: none;
  border-radius: 50px;
  font-size: 0.945rem; /* 150% من 0.63rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 48px;

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
        background: var(--bg-accent);
      }
    `
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

