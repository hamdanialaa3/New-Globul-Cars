
import styled, { keyframes } from 'styled-components';

// Animations
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

export const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  flex: 1;
  min-height: 0;
`;

export const StepContent = styled.div<{ $direction: 'forward' | 'backward' }>`
  animation: ${props => props.$direction === 'forward' ? slideInRight : slideInLeft} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  text-align: center;
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  position: relative;
  flex-wrap: wrap;
  z-index: 1;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: 1.5rem;
    
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

export const ResetButton = styled.button<{ disabled?: boolean }>`
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  position: relative;
  white-space: nowrap;
  line-height: 1.4;
  min-height: 44px; /* Touch target size */
  z-index: 10;
  
  &:hover:not(:disabled) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &:not(:disabled) {
    pointer-events: auto;
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  @media (max-width: 640px) and (orientation: portrait) {
    padding: 0.625rem 0.875rem;
    font-size: 0;
    min-width: 44px;
    width: auto;
    justify-content: center;
    
    svg {
      width: 18px;
      height: 18px;
      margin: 0;
    }
    
    span {
      display: none;
    }
  }
  
  @media (max-width: 896px) and (orientation: landscape) {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    gap: 0.375rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0;
    min-width: 40px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const ResetConfirmDialog = styled.div`
  position: absolute;
  bottom: calc(100% + 1rem);
  left: 0;
  padding: 1rem;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  animation: ${fadeIn} 0.2s ease-out;
  
  @media (max-width: 640px) {
    left: 50%;
    transform: translateX(-50%);
    min-width: 250px;
    bottom: calc(100% + 0.5rem);
  }
`;

export const ResetConfirmTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #f59e0b;
  }
`;

export const ResetConfirmText = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
`;

export const ResetConfirmButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

export const ConfirmButton = styled.button<{ $variant: 'danger' | 'cancel' }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.$variant === 'danger' ? `
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
      transform: scale(1.05);
    }
    ` : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-hover);
    }
  `}
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  position: relative;
  white-space: nowrap;
  line-height: 1.4;
  min-height: 44px; /* Touch target size */
  
  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }
  ` : `
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border);
    
    &:hover:not(:disabled) {
      border-color: var(--accent-primary);
      background: var(--bg-hover);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 640px) and (orientation: portrait) {
    padding: 0.75rem 1rem;
    font-size: 0;
    min-width: 48px;
    width: auto;
    justify-content: center;
    
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

export const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 10px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  
  /* Fix text wrapping and alignment */
  & > * {
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  /* Allow text elements to wrap if needed */
  & > div:not(:last-child) {
    white-space: nowrap;
  }
`;

export const DraftBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--success);
  font-weight: 600;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  white-space: nowrap;
  line-height: 1.4;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: var(--success);
    border-radius: 50%;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }
`;
