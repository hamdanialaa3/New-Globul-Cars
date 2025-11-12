// Equipment Pages Shared Styles
// أنماط مشتركة لصفحات المعدات

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

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: var(--shadow-md);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCard = styled.div<{ $isSelected: boolean }>`
  position: relative;
  background: ${props => props.$isSelected 
    ? 'var(--accent-primary)' 
    : 'var(--bg-secondary)'
  };
  border: 2px solid ${props => props.$isSelected ? 'var(--accent-orange)' : 'var(--border)'};
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const FeatureIcon = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$isSelected 
    ? 'var(--bg-accent)' 
    : 'var(--bg-secondary)'
  };

  svg {
    color: ${props => props.$isSelected ? 'var(--text-on-accent)' : 'var(--accent-orange)'};
  }
`;

export const FeatureLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: inherit;
  line-height: 1.3;
`;

export const CheckMark = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: var(--success);
  color: var(--text-on-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: var(--shadow-md);
`;

export const InfoBox = styled.div`
  background: var(--bg-accent);
  border-left: 4px solid var(--accent-orange);
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

