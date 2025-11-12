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

