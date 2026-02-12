import defaultStyled, { css } from 'styled-components';

import { baseButtonStyles, pulse } from './animations';

const styled = defaultStyled;
// ==================== BUTTONS & ACTIONS ====================

export const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin: 16px 20px;
    padding: 0;
  }
  
  @media (max-width: 480px) {
    margin: 12px 16px;
    gap: 6px;
  }
  
  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    margin: 12px 12px;
  }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $themeColor?: string }>`
  ${baseButtonStyles}

  ${({ $variant = 'secondary', theme, $themeColor }) => {
    const mainColor = $themeColor || (typeof theme.colors.primary === 'string' ? theme.colors.primary : theme.colors.primary.main);
    switch ($variant) {
      case 'primary':
        return css`
          background-color: ${mainColor};
          color: #fff;
          border-color: ${mainColor};
          animation: ${pulse(typeof mainColor === 'string' ? mainColor : mainColor)} 2s infinite;

          &:hover:not(:disabled) {
            background-color: ${mainColor};
            filter: brightness(1.1);
          }
          
          @media (max-width: 768px) {
            animation: none;
            padding: 10px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            min-height: 44px;
            
            &:active {
              transform: scale(0.98);
              filter: brightness(0.95);
            }
          }
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.warning || '#ef4444'};
          color: #fff;
          border-color: ${theme.colors.warning || '#ef4444'};

          &:hover:not(:disabled) {
            background-color: #dc2626;
            filter: brightness(1.1);
          }
          
          @media (max-width: 768px) {
            padding: 10px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            min-height: 44px;
            
            &:active {
              transform: scale(0.98);
              filter: brightness(0.95);
            }
          }
        `;
      case 'secondary':
      default:
        return css`
          background-color: transparent;
          color: ${theme.colors.text};
          border-color: ${theme.colors.grey?.[300] || 'rgba(0, 0, 0, 0.2)'};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.background?.paper || theme.colors.background.default};
            border-color: ${theme.colors.primary};
            color: ${theme.colors.primary};
          }
          
          @media (max-width: 768px) {
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            color: ${theme.colors.text};
            padding: 10px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            min-height: 44px;
            
            &:active {
              transform: scale(0.98);
              background-color: var(--bg-hover);
            }
          }
        `;
    }
  }}
`;

export const FollowButton = styled.button<{ $following: boolean }>`
  ${baseButtonStyles}
  background-color: ${({ $following, theme }) => $following ? 'transparent' : theme.colors.accent.main};
  color: ${({ $following, theme }) => $following ? theme.colors.accent.main : '#fff'};
  border-color: ${({ theme }) => theme.colors.accent.main};
  min-width: 120px;

  &:hover:not(:disabled) {
    background-color: ${({ $following, theme }) => $following ? theme.colors.accent.light : theme.colors.accent.dark};
    color: #fff;
    filter: brightness(1.1);
  }
`;

export const ActionButtonCompact = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  width: 100%;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: white;
    
    &:hover {
      background: var(--accent-primary-hover);
      transform: translateY(-1px);
    }
  ` : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    
    &:hover {
      background: var(--bg-hover);
    }
  `}
  
  html[data-theme="dark"] & {
    ${props => props.$variant === 'primary' ? `
      background: #fb923c;
      color: white;
    ` : `
      background: #2a2a2a;
      color: #f8fafc;
      border-color: rgba(255, 255, 255, 0.1);
    `}
  }
`;

// ==================== FORMS ====================

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    background-color: ${({ theme }) => theme.colors.background.default};
    font-family: 'Martica', 'Arial', sans-serif;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}30;
    }
  }
  
  @media (max-width: 768px) {
    gap: 6px;
    
    label {
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    input, select, textarea {
      padding: 12px 16px;
      font-size: 16px;
      min-height: 48px;
      border-radius: 8px;
      border: 1px solid var(--border-primary);
      background: white;
      -webkit-tap-highlight-color: transparent;
      
      &:focus {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px var(--accent-light);
      }
      
      &::placeholder {
        color: var(--text-muted);
        font-size: 15px;
      }
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
  }
  
  @media (max-width: 480px) {
    label {
      font-size: 0.8125rem;
    }
    
    input, select, textarea {
      padding: 10px 14px;
      min-height: 46px;
    }
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    position: sticky;
    bottom: 70px;
    left: 0;
    right: 0;
    margin: 0 -16px;
    padding: 12px 16px;
    background: white;
    border-top: 1px solid var(--border-primary);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
    z-index: 8;
    justify-content: stretch;
    gap: 8px;
    
    button {
      flex: 1;
      margin: 0;
    }
  }
  
  @media (max-width: 480px) {
    bottom: 60px;
    padding: 10px 12px;
  }
`;

export const SaveButton = styled(ActionButton).attrs({ $variant: 'primary' })``;

export const CancelButton = styled(ActionButton).attrs({ $variant: 'secondary' })``;

// ==================== NEUMORPHIC FIELDS ====================

export const NeumorphicInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const NeumorphicFieldWrapper = styled.div`
  position: relative;
`;

export const NeumorphicFieldLabel = styled.label<{ $themeColor?: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme, $themeColor }) => $themeColor || theme.colors.primary.main};
  margin-bottom: 0.5rem;
  display: block;
`;

export const NeumorphicInfoField = styled.div`
  background: ${({ theme }) => theme.colors.grey[100]};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: inset 5px 5px 10px ${({ theme }) => theme.colors.grey[200]},
              inset -5px -5px 10px #ffffff;
`;

export const NeumorphicFieldValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;
