// Unified Contact Page Styles - Compact & Professional
// أنماط صفحة التواصل الموحدة - مضغوطة واحترافية

import styled from 'styled-components';

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HeaderCard = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
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
  font-size: 1.75rem; /* 28px - Global Standard */
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem; /* 16px */
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
`;

export const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 143, 16, 0.05);
`;

export const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 143, 16, 0.15);
`;

export const CompactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const Label = styled.label<{ $required?: boolean }>`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.2rem; /* 150% من 0.8rem */
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => props.$required && `
    &::after {
      content: '*';
      color: #ff8f10;
      font-size: 1rem;
    }
  `}
`;

export const Input = styled.input`
  padding: 0.39rem; /* حجم المربع */
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.765rem; /* 150% من 0.51rem */
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
    font-size: 0.8rem;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  padding: 0.39rem; /* حجم المربع */
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.765rem; /* 150% من 0.51rem */
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
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.65rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
    font-size: 0.8rem;
  }
`;

// ==================== CONTACT METHODS ====================

export const ContactMethodsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ContactMethodRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 143, 16, 0.02);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 143, 16, 0.05);
  }
`;

export const ContactMethodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// Professional Contact Method Icons - CSS Only
export const PhoneIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border: 2px solid white;
    border-radius: 2px;
    transform: rotate(-25deg);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 10px;
    width: 4px;
    height: 8px;
    border: 2px solid white;
    border-top: none;
    border-left: none;
    border-radius: 0 0 3px 0;
    transform: rotate(-25deg);
  }
`;

export const EmailIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 10px;
    border: 2px solid white;
    border-radius: 2px;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 7px 0 7px;
    border-color: white transparent transparent transparent;
    margin-top: -2px;
  }
`;

export const WhatsAppIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid white;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 7px;
    left: 7px;
    width: 4px;
    height: 4px;
    background: white;
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }
`;

export const ViberIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7360f2, #8B66FF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 14px;
    border: 2px solid white;
    border-radius: 8px 8px 2px 2px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 12px;
    width: 4px;
    height: 2px;
    background: white;
    box-shadow: 0 2px 0 0 white;
  }
`;

export const TelegramIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0088cc, #00aaff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 0 6px 10px;
    border-color: transparent transparent transparent white;
    transform: rotate(-35deg);
    margin-left: 1px;
  }
`;

export const MessengerIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0084ff, #44beff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid white;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 0 0 5px;
    border-color: transparent transparent transparent white;
  }
`;

export const SMSIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 10px;
    border: 2px solid white;
    border-radius: 2px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 12px;
    width: 6px;
    height: 1px;
    background: white;
    box-shadow: 
      0 -2px 0 0 white,
      0 2px 0 0 white;
  }
`;

export const ContactMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 143, 16, 0.1);
  font-size: 1rem;
`;

export const ContactMethodLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
`;

// ==================== CYBER TOGGLE ====================

export const CyberToggleWrapper = styled.div`
  position: relative;
  width: 70px;
  height: 34px;
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
  border-radius: 17px;
  transition: background 0.4s ease-in-out;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.4);

  &::before {
    content: '';
    position: absolute;
    top: 2.5px;
    left: 2.5px;
    width: 29px;
    height: 29px;
    background: #fff;
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.7, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: #03e9f4;
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} &::before {
    transform: translateX(36px);
  }
`;

export const ToggleThumbIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  background: #fff;
  mask-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(36px) translateY(-50%);
    opacity: 1;
  }
`;

export const ToggleThumbDots = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 
    -8px 0 0 0 #fff,
    8px 0 0 0 #fff,
    0 -8px 0 0 #fff,
    0 8px 0 0 #fff;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translate(36px, -50%);
    opacity: 0;
  }
`;

export const ToggleThumbHighlight = styled.span`
  position: absolute;
  top: 50%;
  left: 6px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5), transparent);
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(36px) translateY(-50%);
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
  width: 75%;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
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

// ==================== SUMMARY CARD ====================

export const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.5rem;
`;

export const SummaryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #667eea;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

export const SummaryLabel = styled.span`
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
`;

export const SummaryValue = styled.span`
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 600;
`;

// ==================== ERROR CARD ====================

export const ErrorCard = styled.div`
  background: #fee;
  border: 2px solid #e74c3c;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ErrorIcon = styled.span`
  font-size: 1.5rem;
`;

export const ErrorText = styled.span`
  font-size: 0.85rem;
  color: #c0392b;
  font-weight: 600;
`;

// ==================== NAVIGATION ====================

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.255rem 0.6rem; /* حجم المربع */
  border: none;
  border-radius: 50px;
  font-size: 0.765rem; /* 150% من 0.51rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 39px;

  ${props => props.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #ff8f10, #005ca9);
      color: white;
      box-shadow: 0 6px 16px rgba(255, 143, 16, 0.3);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(255, 143, 16, 0.4);
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

