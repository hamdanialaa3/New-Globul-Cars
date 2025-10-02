// Vehicle Data Page Styles
// أنماط صفحة بيانات السيارة

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
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 143, 16, 0.05);
`;

export const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(255, 143, 16, 0.2);
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
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => props.$required && `
    &::after {
      content: '*';
      color: #ff8f10;
      font-size: 1.1rem;
    }
  `}
`;

export const Input = styled.input`
  padding: 0.85rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }

  &:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  padding: 0.85rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
    opacity: 0.6;
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
      background: #27ae60;
      border-color: #27ae60;
      color: white;
      box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
    `
    : `
      background: white;
      border-color: #e74c3c;
      color: #e74c3c;
    `
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isSelected 
      ? '0 6px 20px rgba(39, 174, 96, 0.4)' 
      : '0 4px 15px rgba(231, 76, 60, 0.2)'
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

export const RequiredNote = styled.div`
  background: rgba(255, 143, 16, 0.1);
  border-left: 4px solid #ff8f10;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #2c3e50;
  margin-top: 1rem;

  strong {
    color: #ff8f10;
  }
`;

export const HintText = styled.small`
  display: block;
  margin-top: 0.5rem;
  color: #7f8c8d;
  font-size: 0.8rem;
  font-style: italic;
`;

