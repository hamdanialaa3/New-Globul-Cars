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
  font-size: 1.35rem; /* 150% من 0.9rem */
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
  padding: 0.51rem; /* حجم المربع صغير */
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.855rem; /* 150% من 0.57rem - النص كبير */
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
  padding: 0.51rem; /* حجم المربع صغير */
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.855rem; /* 150% من 0.57rem - النص كبير */
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
  padding: 0.3rem 0.75rem; /* حجم المربع صغير */
  border: none;
  border-radius: 50px;
  font-size: 0.945rem; /* 150% من 0.63rem - النص كبير */
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

// ==================== CYBER TOGGLE BUTTON STYLES ====================

export const HistoryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(255, 143, 16, 0.02);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 143, 16, 0.05);
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
  color: #2c3e50;
`;

export const HistoryHint = styled.span`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

export const CyberToggleWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 40px;
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
  background: #2c2f33;
  border-radius: 20px;
  transition: background 0.4s ease-in-out;
  box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.4);

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 38px;
    height: 34px;
    background: #fff;
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.7, 1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: #03e9f4;
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} &::before {
    transform: translateX(37px);
  }
`;

export const ToggleThumbIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: #fff;
  mask-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(38px) translateY(-50%);
    opacity: 1;
  }
`;

export const ToggleThumbDots = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 
    -10px 0 0 0 #fff,
    10px 0 0 0 #fff,
    0 -10px 0 0 #fff,
    0 10px 0 0 #fff;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translate(37px, -50%);
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
  background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5), transparent);
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
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  pointer-events: none;
  color: #555;
`;

export const ToggleLabelOn = styled.span`
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  color: #fff;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 1;
  }
`;

export const ToggleLabelOff = styled.span`
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
  color: #fff;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 0;
  }
`;

