// Unified Contact Page Styles - Compact & Professional
// أنماط صفحة التواصل الموحدة - مضغوطة واحترافية

import styled from 'styled-components';

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HeaderCard = styled.div`
  background: var(--bg-card);
  border-radius: 15px;
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
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
  margin-top: 0.75rem;
`;

export const SectionCard = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
`;

export const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent-orange);
`;

export const CompactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const Label = styled.label<{ $required?: boolean }>`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.2rem; /* 150% من 0.8rem */
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => props.$required && `
    &::after {
      content: '*';
      color: var(--accent-orange);
      font-size: 1rem;
    }
  `}
`;

export const Input = styled.input`
  padding: 0.39rem; /* حجم المربع */
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.765rem; /* 150% من 0.51rem */
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-orange);
    box-shadow: var(--focus-shadow);
  }

  &::placeholder {
    color: var(--text-placeholder);
    font-size: 0.8rem;
  }

  &:disabled {
    background: var(--bg-disabled);
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  padding: 0.39rem; /* حجم المربع */
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.765rem; /* 150% من 0.51rem */
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-orange);
    box-shadow: var(--focus-shadow);
  }

  &:disabled {
    background: var(--bg-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.65rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-orange);
    box-shadow: var(--focus-shadow);
  }

  &::placeholder {
    color: var(--text-placeholder);
    font-size: 0.8rem;
  }
`;

// ==================== CONTACT METHODS ====================

export const ContactMethodsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ContactMethodRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--bg-accent);
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-accent);
  }
`;

export const ContactMethodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ContactIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg-card-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
  border: 1px solid var(--border);

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ContactMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-accent);
  font-size: 1rem;
`;

export const ContactMethodLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
`;

// ==================== CYBER TOGGLE ====================

export const CyberToggleWrapper = styled.div`
  position: relative;
  width: 70px;
  height: 34px;
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
  background: var(--bg-secondary);
  border-radius: 17px;
  transition: background 0.4s ease-in-out;
  box-shadow: var(--shadow-sm);

  &::before {
    content: '';
    position: absolute;
    top: 2.5px;
    left: 2.5px;
    width: 29px;
    height: 29px;
    background: var(--text-primary);
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.7, 1);
    box-shadow: var(--shadow-sm);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: var(--accent-primary);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} &::before {
    transform: translateX(36px);
  }
`;

export const ToggleThumbIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  background: var(--text-on-accent);
  mask-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(36px) translateY(-50%);
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
  background: var(--text-on-accent);
  border-radius: 50%;
  box-shadow: 
    -8px 0 0 0 var(--text-on-accent),
    8px 0 0 0 var(--text-on-accent),
    0 -8px 0 0 var(--text-on-accent),
    0 8px 0 0 var(--text-on-accent);
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translate(36px, -50%);
    opacity: 0;
  }
`;

export const ToggleThumbHighlight = styled.span`
  position: absolute;
  top: 50%;
  left: 6px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 70% 70%, var(--text-on-accent), transparent);
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(36px) translateY(-50%);
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
  width: 75%;
  font-size: 0.5rem; /* 8px - أصغر ليحتوي الكلمتين */
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  pointer-events: none;
  color: var(--text-secondary);
`;

export const ToggleLabelOn = styled.span`
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  color: #fff;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 1;
  }
`;

export const ToggleLabelOff = styled.span`
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
  color: #fff;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 0;
  }
`;

// ==================== SUMMARY CARD ====================

export const SummaryCard = styled.div`
  background: var(--bg-accent);
  border: 2px solid var(--accent-primary);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.5rem;
`;

export const SummaryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

export const SummaryLabel = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

export const SummaryValue = styled.span`
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 600;
`;

// ==================== ERROR CARD ====================

export const ErrorCard = styled.div<{ $hasWarning?: boolean }>`
  background: ${props => props.$hasWarning ? 'var(--bg-accent)' : 'var(--error)'};
  border: 2px solid ${props => props.$hasWarning ? 'var(--accent-orange)' : 'var(--error)'};
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: ${props => props.$hasWarning ? 'var(--text-primary)' : 'var(--text-on-accent)'};
`;

export const ErrorIcon = styled.span`
  font-size: 1.5rem;
`;

export const ErrorText = styled.span`
  font-size: 0.85rem;
  color: var(--error);
  font-weight: 600;
`;

// ==================== NAVIGATION ====================

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 0.255rem 0.6rem; /* حجم المربع */
  border: none;
  border-radius: 50px;
  font-size: 0.765rem; /* 150% من 0.51rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 39px;

  ${props => {
    if (props.$variant === 'primary') {
      return `
        background: var(--accent-primary);
        color: var(--text-on-accent);
        box-shadow: var(--shadow-md);
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      `;
    } else if (props.$variant === 'secondary') {
      return `
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border: 2px solid var(--border);
        
        &:hover {
          background: var(--bg-accent);
        }
      `;
    } else if (props.$variant === 'warning') {
      return `
        background: var(--accent-orange);
        color: var(--text-on-accent);
        font-weight: 700;
        box-shadow: var(--shadow-md);
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      `;
    } else {
      return `
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border: 2px solid var(--border);
        
        &:hover {
          background: var(--bg-accent);
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

// Auto-save notification
export const AutoSaveNotification = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--success);
  color: var(--text-on-accent);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  z-index: 998;
`;

