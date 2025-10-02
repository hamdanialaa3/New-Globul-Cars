// Pricing Page Styles
// أنماط صفحة التسعير

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
  font-size: 1.9rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
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

export const FormCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 143, 16, 0.05);
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.05rem;
`;

export const PriceInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

export const PriceIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #ff8f10;
  pointer-events: none;
`;

export const PriceInput = styled.input`
  width: 100%;
  padding: 1.25rem 1.25rem 1.25rem 4rem;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 4px rgba(255, 143, 16, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
    font-weight: 400;
  }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: rgba(255, 143, 16, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 143, 16, 0.1);
  }
`;

export const Checkbox = styled.input`
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #ff8f10;
`;

export const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
`;

export const InfoCard = styled.div`
  display: flex;
  gap: 1rem;
  background: rgba(0, 92, 169, 0.05);
  border-left: 4px solid #005ca9;
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
  background: rgba(0, 92, 169, 0.15);
  border-radius: 50%;
  color: #005ca9;
`;

export const InfoText = styled.div`
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.6;

  strong {
    color: #005ca9;
  }
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ecf0f1;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

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

