// Vehicle Data Page Styles
// أنماط صفحة بيانات السيارة

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
    font-size: 1.5rem; /* 24px */
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem; /* 16px - Comfortable reading */
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
`;

export const FormCard = styled.div`
  background: var(--bg-card);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
`;

export const SectionTitle = styled.h3`
  font-size: 1.25rem; /* 20px - Clear hierarchy */
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  line-height: 1.4;
  border-bottom: 2px solid var(--accent-primary);
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label<{ $required?: boolean }>`
  font-size: 0.875rem; /* 14px - Standard label size */
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
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
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 1rem; /* 16px - Comfortable input text */
  line-height: 1.5;
  transition: all 0.3s ease;
  background: var(--bg-card);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-orange);
    box-shadow: 0 0 0 3px var(--focus-shadow);
  }

  &::placeholder {
    color: var(--text-placeholder);
    font-size: 0.938rem;
  }

  &:disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 1rem; /* 16px - Standard select size */
  line-height: 1.5;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-orange);
    box-shadow: 0 0 0 3px var(--focus-shadow);
  }

  &:disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  option {
    font-size: 1rem;
    padding: 0.5rem;
    line-height: 1.5;
  }
`;

export const BooleanOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const BooleanOption = styled.button<{ $isSelected: boolean }>`
  flex: 1;
  padding: 0.85rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
  
  ${props => props.$isSelected 
    ? `
      background: var(--success);
      border-color: var(--success);
      color: var(--text-on-accent);
      box-shadow: var(--shadow-md);
    `
    : `
      background: var(--bg-card);
      border-color: var(--error);
      color: var(--error);
    `
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isSelected 
      ? 'var(--shadow-lg)' 
      : 'var(--shadow-md)'
    };
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem; /* 16px - Global button standard */
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
        background: var(--bg-hover);
      }
    `
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

export const RequiredNote = styled.div`
  background: var(--bg-accent);
  border-left: 4px solid var(--accent-orange);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-top: 1rem;

  strong {
    color: var(--accent-orange);
  }
`;

export const BrandOrbitWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;

  & > div {
    max-width: 240px;
  }
`;

export const HintText = styled.small`
  display: block;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.75rem; /* 12px - Clear hints */
  line-height: 1.4;
  font-style: italic;
`;

// ==================== CYBER TOGGLE BUTTON STYLES ====================

export const HistoryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 10px;
  background: var(--bg-secondary);
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-hover);
  }
`;

export const HistoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const HistoryLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

export const HistoryHint = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

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
  background: var(--bg-secondary);
  border-radius: 15px;
  transition: background 0.4s ease-in-out;
  box-shadow: var(--shadow-sm);

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 26px;
    height: 26px;
    background: var(--bg-card);
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.7, 1);
    box-shadow: var(--shadow-sm);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: var(--accent-primary);
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
  background: var(--bg-card);
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
  background: var(--bg-card);
  border-radius: 50%;
  box-shadow: 
    -7px 0 0 0 var(--bg-card),
    7px 0 0 0 var(--bg-card),
    0 -7px 0 0 var(--bg-card),
    0 7px 0 0 var(--bg-card);
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
  background: var(--bg-accent);
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(38px) translateY(-50%);
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

