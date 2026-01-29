import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Button Components ====================

export const BackButton = styled.button`
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 1px solid var(--btn-secondary-border);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--btn-secondary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const ThemeToggleButton = styled.button`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  background: var(--accent-primary);
  color: var(--btn-primary-text);
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-button);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EditButton = styled.button`
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--btn-primary-bg);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-button);

  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const SaveButtonEnhanced = styled.button`
  background: var(--success);
  color: var(--btn-primary-text);
  border: 1px solid var(--success);
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

export const CancelButtonEnhanced = styled.button`
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 1px solid var(--btn-secondary-border);
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--btn-secondary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

// ==================== Toggle Switch Components ====================

export const ToggleSwitchContainer = styled.div<{ $isOn: boolean }>`
  position: relative;
  width: 32px;
  height: 32px;
  background: ${props => props.$isOn ? 'var(--success)' : 'var(--bg-card)'};
  border: 2px solid ${props => props.$isOn ? 'var(--success)' : 'var(--border-primary)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isOn 
    ? '0 2px 8px rgba(34, 197, 94, 0.3)'
    : 'var(--shadow-sm)'
  };

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.$isOn 
      ? '0 4px 12px rgba(34, 197, 94, 0.4)'
      : 'var(--shadow-md)'
    };
    border-color: ${props => props.$isOn ? 'var(--success)' : 'var(--accent-primary)'};
  }

  &:active {
    transform: scale(0.95);
  }

  &::before {
    content: ${props => props.$isOn ? "'✓'" : "'✗'"};
    font-size: 16px;
    font-weight: bold;
    color: ${props => props.$isOn ? 'var(--btn-primary-text)' : 'var(--text-tertiary)'};
    transition: all 0.3s ease;
  }
`;

export const ToggleSwitchInner = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleSwitchKnobContainer = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleSwitchKnob = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleSwitchNeon = styled.div<{ $isOn: boolean }>`
  display: none; /* Not needed in icon design */
`;

export const ToggleLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-left: 0.5rem;
  transition: color 0.3s ease;
`;

// ==================== Contact Method Components ====================

export const ContactIcon = styled.div<{ $isActive: boolean }>`
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  filter: ${props => props.$isActive ? 'none' : 'grayscale(100%)'};
  background: ${props => props.$isActive ? 'transparent' : 'rgba(220, 220, 220, 0.4)'};
  border-radius: 12px;

  &:hover {
    transform: ${props => props.$isActive ? 'translateY(-6px) scale(1.15)' : 'none'};
  }

  img, svg {
    width: 44px;
    height: 44px;
    position: relative;
    z-index: 1;
    opacity: ${props => props.$isActive ? '1' : '0.3'};
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    object-fit: contain;
    filter: ${props => props.$isActive 
      ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.1))'
      : 'none'
    };
  }

  &:hover img,
  &:hover svg {
    filter: ${props => props.$isActive 
      ? 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.18)) drop-shadow(0 10px 20px rgba(255, 121, 0, 0.2))'
      : 'none'
    };
    transform: ${props => props.$isActive ? 'scale(1.1)' : 'none'};
  }
`;

export const ContactLabel = styled.span<{ $isActive: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.$isActive ? 'var(--text-primary)' : 'var(--text-muted)'};
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  letter-spacing: 0.3px;
`;

export const ContactItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 0.65rem;
  border-radius: 14px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  background: ${props => props.$isActive ? 'transparent' : 'var(--bg-secondary)'};
  min-width: 92px;
  max-width: 115px;
  border: 2px solid ${props => props.$isActive ? 'transparent' : 'var(--border-primary)'};

  &:hover {
    transform: ${props => props.$isActive ? 'translateY(-5px)' : 'none'};
    background: ${props => props.$isActive ? 'var(--bg-accent)' : 'var(--bg-secondary)'};
  }

  &:hover ${ContactLabel} {
    color: ${props => props.$isActive ? 'var(--accent-primary)' : 'var(--text-muted)'};
  }
`;
