// Equipment Pages Shared Styles
// أنماط مشتركة لصفحات المعدات

import styled from 'styled-components';

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  border: 1px solid rgba(255, 143, 16, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
  }
`;

export const Title = styled.h1`
  font-size: 1.425rem; /* 150% من 0.95rem */
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.375rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
`;

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

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
    ? 'linear-gradient(135deg, #ff8f10, #005ca9)' 
    : 'rgba(255, 143, 16, 0.05)'
  };
  border: 2px solid ${props => props.$isSelected ? '#ff8f10' : 'rgba(255, 143, 16, 0.2)'};
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
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.25);
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
    ? 'rgba(255, 255, 255, 0.25)' 
    : 'rgba(255, 143, 16, 0.15)'
  };

  svg {
    color: ${props => props.$isSelected ? 'white' : '#ff8f10'};
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
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.4);
`;

export const InfoBox = styled.div`
  background: rgba(255, 143, 16, 0.08);
  border-left: 4px solid #ff8f10;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.6;
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ecf0f1;
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
      background: linear-gradient(135deg, #ff8f10, #005ca9);
      color: white;
      box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
      }
    `
    : `
      background: #f8f9fa;
      color: #6c757d;
      border: 2px solid #e9ecef;
      
      &:hover {
        background: #e9ecef;
      }
    `
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

