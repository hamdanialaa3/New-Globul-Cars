import defaultStyled, { css, keyframes } from 'styled-components';

const styled = defaultStyled;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PALETTE = {
  primary: '#0B5FFF',
  primaryHover: '#0A4FDB',
  accent: '#00C48C',
};

// Page Header
export const PageHeader = styled.div`
  position: relative;
  text-align: center;
  margin: 0 auto 32px;
  max-width: 1000px;
  padding: 40px 32px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(12, 18, 32, 0.78)'
      : 'rgba(255, 255, 255, 0.88)'};
  border-radius: 18px;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : theme.colors.grey[200])};
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 25px 70px rgba(0, 0, 0, 0.4)'
      : '0 22px 60px rgba(15, 23, 42, 0.10)'};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f8fbff' : theme.colors.text.primary)};
  backdrop-filter: blur(14px);
  ${css`animation: ${fadeInUp} 0.6s ease-out;`}

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 24px 18px;
  }

  h1 {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
    color: ${({ theme }) => (theme.mode === 'dark' ? '#fefefe' : theme.colors.text.primary)};

    @media (max-width: 768px) {
      font-size: 1.6rem;
      margin-bottom: 8px;
    }
  }

  p {
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    color: ${({ theme }) => (theme.mode === 'dark' ? '#e0e8ff' : theme.colors.text.secondary)};
    max-width: 680px;
    margin: 0 auto;
    line-height: 1.5;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

// Search Section
export const SearchSection = styled.div`
  max-width: 1000px;
  margin: 20px auto 32px;
  ${css`animation: ${fadeInUp} 0.7s ease-out 0.1s both;`}
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin: 14px auto 20px;
    padding: 0 8px;
  }
`;

export const SearchBarWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

export const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.92)'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : theme.colors.grey[200])};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 20px 50px rgba(0, 0, 0, 0.35)'
      : '0 14px 34px rgba(15, 23, 42, 0.10)'};
  backdrop-filter: blur(12px);
  
  &:focus-within {
    border-color: rgba(11, 95, 255, 0.6);
    box-shadow: 0 22px 60px rgba(11, 95, 255, 0.16);
    transform: translateY(-2px);
  }
  
  &:hover {
    box-shadow: 0 22px 55px rgba(0, 0, 0, 0.42);
  }
`;

export const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : theme.colors.text.secondary};
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.05rem;
  padding: 1.25rem 0.5rem;
  font-weight: 500;
  background: transparent;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f8fbff' : theme.colors.text.primary)};
  
  &::placeholder {
    color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : theme.colors.text.secondary};
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem 0.5rem;
  }
`;

export const SearchActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.75rem;
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(2, 6, 23, 0.05)'};
    color: ${PALETTE.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const SearchButton = styled.button`
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.92), rgba(10, 79, 219, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 18px 36px rgba(11, 95, 255, 0.32);
  backdrop-filter: blur(6px);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(11, 95, 255, 1), rgba(10, 79, 219, 1));
    box-shadow: 0 22px 44px rgba(11, 95, 255, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.875rem;
  }
`;

// Action Buttons Row
export const ActionButtonsRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ai' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  overflow: hidden;
  color: #f6f8ff;
  backdrop-filter: blur(10px);
  
  ${props => props.variant === 'primary' && css`
    background: linear-gradient(135deg, rgba(11, 95, 255, 0.9), rgba(10, 79, 219, 0.9));
    box-shadow: 0 20px 40px rgba(11, 95, 255, 0.25);
    
    &:hover {
      transform: translateY(-3px);
      background: linear-gradient(135deg, rgba(11, 95, 255, 1), rgba(10, 79, 219, 1));
      box-shadow: 0 24px 48px rgba(11, 95, 255, 0.35);
    }
  `}
  
  ${props => props.variant === 'ai' && css`
    background: linear-gradient(135deg, rgba(0, 196, 140, 0.9), rgba(0, 168, 120, 0.9));
    color: #052f1f;
    box-shadow: 0 18px 38px rgba(0, 196, 140, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 22px 42px rgba(0, 196, 140, 0.38);
    }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background: rgba(255, 255, 255, 0.08);
    color: #e9edf6;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.25);
    
    &:hover {
      border-color: rgba(11, 95, 255, 0.6);
      color: #f6f8ff;
      box-shadow: 0 20px 34px rgba(0, 0, 0, 0.35);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
    flex: 1;
    justify-content: center;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// Suggestions Dropdown
export const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(12, 18, 32, 0.94)' : 'rgba(255, 255, 255, 0.96)'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme.colors.grey[200])};
  border-radius: 12px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 24px 60px rgba(0, 0, 0, 0.45)'
      : '0 18px 44px rgba(15, 23, 42, 0.14)'};
  backdrop-filter: blur(12px);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  transition: background 0.3s ease, border-color 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1d2e' : '#f1f3f5'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#cbd5e0'};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? '#4a5568' : '#a0aec0'};
    }
  }
`;

export const SuggestionSection = styled.div`
  padding: 0.75rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

export const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary};
  text-transform: uppercase;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const SuggestionItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f5f7ff' : theme.colors.text.primary)};
  transition: background 0.15s;
  
  &:hover {
    background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(2, 6, 23, 0.05)'};
  }
  
  &:active {
    background: ${({ theme }) => theme.mode === 'dark' ? '#3d4554' : '#e9ecef'};
  }
`;
