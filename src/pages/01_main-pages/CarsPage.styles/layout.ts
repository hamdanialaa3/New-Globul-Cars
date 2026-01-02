import defaultStyled from 'styled-components';
const styled = defaultStyled;

const PALETTE = {
  primary: '#0B5FFF',
  primaryHover: '#0A4FDB',
  accent: '#00C48C',
  text: '#0F172A',
  muted: '#475569',
  surface: '#FFFFFF',
  gradient: 'linear-gradient(135deg, #0B5FFF 0%, #061B4F 100%)',
};

// Page Container & Layout
export const CarsContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(160deg, #050914 0%, #0b1224 40%, #05070f 100%)'
      : `linear-gradient(160deg, ${theme.colors.grey[50]} 0%, ${theme.colors.grey[100]} 45%, ${theme.colors.background.default} 100%)`};
  padding: 72px 0 96px;
  transition: background 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -120px;
    background-image:
      linear-gradient(
        ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(2, 6, 23, 0.06)')} 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(2, 6, 23, 0.06)')} 1px,
        transparent 1px
      );
    background-size: 160px 160px;
    opacity: ${({ theme }) => (theme.mode === 'dark' ? 0.6 : 0.35)};
    mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9), transparent 70%);
  }

  @media (max-width: 768px) {
    padding: 48px 0 80px;
  }
  
  @media (max-width: 480px) {
    padding: 36px 0 70px;
  }
`;

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 14px;
    max-width: 100%;
  }
`;

export const CarsGridWrapper = styled.div`
  margin-top: 32px;

  @media (max-width: 768px) {
    margin-top: 8px;
    margin-bottom: 90px;
    padding: 0;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 80px;
  }
`;

// Pagination
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 48px;
  padding: 24px;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 16px;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.colors.grey[200]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const PaginationInfo = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const PageButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.colors.grey[300]};
  background: ${props => props.disabled
    ? 'rgba(100, 100, 100, 0.1)'
    : ({ theme }) => theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.15)' : PALETTE.primary};
  color: ${props => props.disabled
    ? 'rgba(150, 150, 150, 0.5)'
    : ({ theme }) => theme.mode === 'dark' ? '#fff' : '#fff'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.25)' : PALETTE.primaryHover};
    box-shadow: 0 8px 20px rgba(11, 95, 255, 0.25);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PageNumber = styled.div`
  padding: 8px 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
`;

// City Badge
export const CityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(2, 6, 23, 0.06)'};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#fefefe' : theme.colors.text.primary)};
  padding: 0.65rem 1.35rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem auto 0;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.22)' : theme.colors.grey[200])};
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 16px 36px rgba(0, 0, 0, 0.28)'
      : '0 14px 30px rgba(15, 23, 42, 0.08)'};
  backdrop-filter: blur(10px);
`;
