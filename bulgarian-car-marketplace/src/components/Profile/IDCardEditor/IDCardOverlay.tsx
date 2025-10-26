// ID Card Overlay - Main modal for editing ID data over card images
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { X, Check, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { FRONT_FIELDS, BACK_FIELDS, PHOTO_ZONE, SIGNATURE_ZONE } from './field-definitions';
import { IDCardData, ValidationResult } from './types';
import OverlayInput from './OverlayInput';
import EGNValidator from '../../../services/verification/egn-validator';

interface IDCardOverlayProps {
  initialData?: Partial<IDCardData>;
  onSave: (data: IDCardData) => void;
  onClose: () => void;
}

type TabType = 'front' | 'back';

const IDCardOverlay: React.FC<IDCardOverlayProps> = ({
  initialData,
  onSave,
  onClose
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('front');
  const [formData, setFormData] = useState<IDCardData>({
    documentNumber: '',
    personalNumber: '',
    firstNameBG: '',
    middleNameBG: '',
    lastNameBG: '',
    firstNameEN: '',
    middleNameEN: '',
    lastNameEN: '',
    nationality: 'БЪЛГАРИЯ / BGR',
    dateOfBirth: '',
    sex: '',
    height: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    placeOfBirth: '',
    addressOblast: '',
    addressMunicipality: '',
    addressStreet: '',
    eyeColor: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilling, setAutoFilling] = useState(false);

  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Auto-fill from EGN
  const handleAutoFillFromEGN = () => {
    const egn = formData.personalNumber;
    
    if (!egn || egn.length !== 10) {
      alert(language === 'bg' 
        ? 'Моля, въведете валиден ЕГН първо!' 
        : 'Please enter a valid EGN first!');
      return;
    }
    
    setAutoFilling(true);
    
    setTimeout(() => {
      const analysis = EGNValidator.analyzeEGN(egn);
      
      if (!analysis.valid) {
        alert(language === 'bg'
          ? `Невалиден ЕГН: ${analysis.errors?.join(', ')}`
          : `Invalid EGN: ${analysis.errors?.join(', ')}`);
        setAutoFilling(false);
        return;
      }
      
      // Auto-fill fields
      setFormData(prev => ({
        ...prev,
        dateOfBirth: analysis.birthDate 
          ? EGNValidator.formatBulgarianDate(analysis.birthDate) 
          : prev.dateOfBirth,
        sex: analysis.sex || prev.sex,
        placeOfBirth: analysis.region 
          ? `${analysis.region}/${analysis.region}` 
          : prev.placeOfBirth
      }));
      
      setAutoFilling(false);
      
      alert(language === 'bg'
        ? '✅ Данните са попълнени автоматично от ЕГН!'
        : '✅ Data auto-filled from EGN!');
    }, 500);
  };

  // Validate all fields
  const validateForm = (): ValidationResult => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    const allFields = activeTab === 'front' ? FRONT_FIELDS : BACK_FIELDS;
    
    allFields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = language === 'bg' ? 'Задължително поле' : 'Required field';
      }
      
      // Validate EGN
      if (field.id === 'personalNumber' && formData.personalNumber) {
        if (!EGNValidator.validateEGN(formData.personalNumber)) {
          newErrors[field.id] = language === 'bg' ? 'Невалиден ЕГН' : 'Invalid EGN';
        }
      }
      
      // Validate pattern
      if (field.pattern && formData[field.id]) {
        if (!field.pattern.test(formData[field.id] as string)) {
          newErrors[field.id] = language === 'bg' ? 'Невалиден формат' : 'Invalid format';
        }
      }
    });
    
    setErrors(newErrors);
    
    return {
      valid: Object.keys(newErrors).length === 0,
      errors: Object.values(newErrors)
    };
  };

  // Handle save
  const handleSave = () => {
    const validation = validateForm();
    
    if (!validation.valid) {
      alert(language === 'bg'
        ? `Моля, коригирайте грешките: ${validation.errors.join(', ')}`
        : `Please fix errors: ${validation.errors.join(', ')}`);
      return;
    }
    
    onSave(formData);
  };

  // Handle next/previous
  const handleNext = () => {
    if (activeTab === 'front') {
      setActiveTab('back');
    } else {
      handleSave();
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'back') {
      setActiveTab('front');
    }
  };

  const fields = activeTab === 'front' ? FRONT_FIELDS : BACK_FIELDS;
  const backgroundImage = activeTab === 'front'
    ? '/assets/ID_front (1).png'
    : '/assets/ID_Back.png';

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader>
          <ModalTitle>
            🆔 {language === 'bg' ? 'Редактиране на лична карта' : 'Edit ID Card'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        {/* Tabs */}
        <TabBar>
          <Tab 
            $active={activeTab === 'front'} 
            onClick={() => setActiveTab('front')}
          >
            {language === 'bg' ? 'Лице' : 'Front Side'}
          </Tab>
          <Tab 
            $active={activeTab === 'back'} 
            onClick={() => setActiveTab('back')}
          >
            {language === 'bg' ? 'Гръб' : 'Back Side'}
          </Tab>
        </TabBar>

        {/* Instructions */}
        <Instructions>
          {language === 'bg'
            ? 'Попълнете данните си точно както са изписани на личната ви карта'
            : 'Fill in your information exactly as it appears on your ID card'}
        </Instructions>

        {/* ID Card Canvas with Overlays */}
        <CardCanvas>
          {/* Background: ID Card Image (semi-transparent) */}
          <CardBackground 
            src={backgroundImage} 
            alt={activeTab === 'front' ? 'ID Front' : 'ID Back'}
          />
          
          {/* Overlay Inputs */}
          <OverlayContainer>
            {fields.map(field => (
              <OverlayInput
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={handleFieldChange}
                scale={1}
                isValid={!errors[field.id]}
                error={errors[field.id]}
              />
            ))}
          </OverlayContainer>
        </CardCanvas>

        {/* Auto-fill Bar (front side only) */}
        {activeTab === 'front' && (
          <AutoFillBar>
            <AutoFillButton 
              onClick={handleAutoFillFromEGN}
              disabled={!formData.personalNumber || formData.personalNumber.length !== 10}
            >
              <Sparkles size={16} />
              {autoFilling 
                ? (language === 'bg' ? 'Попълване...' : 'Filling...') 
                : (language === 'bg' ? 'Автоматично попълване от ЕГН' : 'Auto-fill from EGN')}
            </AutoFillButton>
            
            <ValidateButton onClick={validateForm}>
              <Check size={16} />
              {language === 'bg' ? 'Провери' : 'Validate'}
            </ValidateButton>
            
            <ResetButton onClick={() => setFormData({ ...initialData } as IDCardData)}>
              <RefreshCw size={16} />
              {language === 'bg' ? 'Нулиране' : 'Reset'}
            </ResetButton>
          </AutoFillBar>
        )}

        {/* Footer */}
        <ModalFooter>
          <FooterLeft>
            {activeTab === 'back' && (
              <NavButton onClick={handlePrevious}>
                <ChevronLeft size={18} />
                {language === 'bg' ? 'Назад' : 'Previous'}
              </NavButton>
            )}
          </FooterLeft>
          
          <FooterRight>
            <CancelButton onClick={onClose}>
              {language === 'bg' ? 'Откажи' : 'Cancel'}
            </CancelButton>
            
            <SaveButton onClick={handleNext}>
              {activeTab === 'front' 
                ? (
                  <>
                    {language === 'bg' ? 'Следващ' : 'Next'}
                    <ChevronRight size={18} />
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {language === 'bg' ? 'Запази' : 'Save'}
                  </>
                )}
            </SaveButton>
          </FooterRight>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Styled Components
const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  z-index: 10000;
  padding: 20px;
  
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 20px;
  
  width: 100%;
  max-width: 1000px;
  max-height: 95vh;
  
  display: flex;
  flex-direction: column;
  
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  padding: 24px;
  border-bottom: 2px solid #f0f2f5;
  
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    color: #212529;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 0;
  padding: 0 24px;
  border-bottom: 2px solid #e9ecef;
  
  flex-shrink: 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 14px 24px;
  border: none;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? '#FF7900' : '#6c757d'};
  
  font-size: 1rem;
  font-weight: 600;
  
  border-bottom: 3px solid ${props => props.$active ? '#FF7900' : 'transparent'};
  
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #FF7900;
    background: rgba(255, 121, 0, 0.05);
  }
`;

const Instructions = styled.div`
  padding: 16px 24px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  
  font-size: 0.9rem;
  color: #856404;
  line-height: 1.5;
  
  flex-shrink: 0;
`;

const CardCanvas = styled.div`
  flex: 1;
  overflow: auto;
  padding: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: #f8f9fa;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CardBackground = styled.img`
  width: 100%;
  max-width: 850px;
  height: auto;
  
  /* ⚡ Semi-transparent background (60% opacity) */
  opacity: 0.6;
  
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  
  pointer-events: none;
  user-select: none;
`;

const OverlayContainer = styled.div`
  position: absolute;
  inset: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
  
  @media (max-width: 768px) {
    inset: 16px;
  }
`;

const AutoFillBar = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  
  flex-shrink: 0;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const AutoFillButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 10px;
  
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    animation: ${props => props.disabled ? 'none' : 'pulse 2s infinite'};
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const ValidateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  
  padding: 12px 20px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 10px;
  
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  
  padding: 12px 20px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  padding: 20px 24px;
  border-top: 2px solid #f0f2f5;
  
  flex-shrink: 0;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  gap: 12px;
`;

const FooterRight = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 600px) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  
  padding: 12px 20px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 10px;
  
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default IDCardOverlay;

