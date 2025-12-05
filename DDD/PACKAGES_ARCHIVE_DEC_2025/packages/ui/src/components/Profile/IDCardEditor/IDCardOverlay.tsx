// ID Card Overlay - Main modal for editing ID data over card images
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { X, Check, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { IDCardData, ValidationResult } from './types';
import ResponsiveOverlay from './ResponsiveOverlay';
import EGNValidator from '@globul-cars/services/verification/egn-validator';
import DatePickerBulgarian from '../../shared/DatePickerBulgarian';
import NumberInputBulgarian from '../../shared/NumberInputBulgarian';
import SelectWithOther from '../../shared/SelectWithOther';
import { BULGARIA_REGIONS } from '@globul-cars/core/constants/bulgaria-locations';

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
    const requiredFields = [
      'documentNumber', 'personalNumber', 'lastNameBG', 'firstNameBG', 'middleNameBG',
      'lastNameEN', 'firstNameEN', 'middleNameEN', 'dateOfBirth', 'expiryDate'
    ];
    
    requiredFields.forEach(fieldId => {
      if (!formData[fieldId as keyof IDCardData]) {
        newErrors[fieldId] = language === 'bg' ? 'Задължително поле' : 'Required field';
      }
    });
    
    // Validate EGN
    if (formData.personalNumber) {
      if (!EGNValidator.validateEGN(formData.personalNumber)) {
        newErrors.personalNumber = language === 'bg' ? 'Невалиден ЕГН' : 'Invalid EGN';
      }
    }
    
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
            ? 'Попълнете данните си точно както са изписани на личната ви карта. النظام يتكيف تلقائياً مع حجم شاشتك!'
            : 'Fill in your information exactly as it appears on your ID card. System auto-adapts to your screen!'}
        </Instructions>

        {/* ⚡ NEW: Two-Column Layout - Form on Left, Image on Right */}
        <TwoColumnLayout>
          {/* LEFT COLUMN: Form Fields */}
          <FormColumn>
            <FormScrollArea>
              {activeTab === 'front' ? (
                <>
                  <FormSection>
                    <SectionTitle>📄 {language === 'bg' ? 'Документ' : 'Document'}</SectionTitle>
                    <FormField>
                      <Label>№ на документа / Document Number</Label>
                      <Input
                        value={formData.documentNumber}
                        onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
                        placeholder="AA0000000"
                        $hasError={!!errors.documentNumber}
                      />
                      {errors.documentNumber && <ErrorText>{errors.documentNumber}</ErrorText>}
                    </FormField>
                    
                    <FormField>
                      <Label>ЕГН / Personal Number</Label>
                      <Input
                        value={formData.personalNumber}
                        onChange={(e) => handleFieldChange('personalNumber', e.target.value)}
                        placeholder="9508010133"
                        maxLength={10}
                        $hasError={!!errors.personalNumber}
                      />
                      {errors.personalNumber && <ErrorText>{errors.personalNumber}</ErrorText>}
                    </FormField>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>👤 {language === 'bg' ? 'Имена (кирилица)' : 'Names (Cyrillic)'}</SectionTitle>
                    <FormRow>
                      <FormField>
                        <Label>Фамилия / Surname</Label>
                        <Input
                          value={formData.lastNameBG}
                          onChange={(e) => handleFieldChange('lastNameBG', e.target.value)}
                          placeholder="ИВАНОВА"
                          $hasError={!!errors.lastNameBG}
                        />
                      </FormField>
                      <FormField>
                        <Label>Име / Name</Label>
                        <Input
                          value={formData.firstNameBG}
                          onChange={(e) => handleFieldChange('firstNameBG', e.target.value)}
                          placeholder="СЛАВИНА"
                          $hasError={!!errors.firstNameBG}
                        />
                      </FormField>
                      <FormField>
                        <Label>Презиме / Father's Name</Label>
                        <Input
                          value={formData.middleNameBG}
                          onChange={(e) => handleFieldChange('middleNameBG', e.target.value)}
                          placeholder="ГЕОРГИЕВА"
                          $hasError={!!errors.middleNameBG}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>🔤 {language === 'bg' ? 'Имена (латиница)' : 'Names (Latin)'}</SectionTitle>
                    <FormRow>
                      <FormField>
                        <Label>Surname</Label>
                        <Input
                          value={formData.lastNameEN}
                          onChange={(e) => handleFieldChange('lastNameEN', e.target.value)}
                          placeholder="IVANOVA"
                          $hasError={!!errors.lastNameEN}
                        />
                      </FormField>
                      <FormField>
                        <Label>Name</Label>
                        <Input
                          value={formData.firstNameEN}
                          onChange={(e) => handleFieldChange('firstNameEN', e.target.value)}
                          placeholder="SLAVINA"
                          $hasError={!!errors.firstNameEN}
                        />
                      </FormField>
                      <FormField>
                        <Label>Father's Name</Label>
                        <Input
                          value={formData.middleNameEN}
                          onChange={(e) => handleFieldChange('middleNameEN', e.target.value)}
                          placeholder="GEORGIEVA"
                          $hasError={!!errors.middleNameEN}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>ℹ️ {language === 'bg' ? 'Лични данни' : 'Personal Info'}</SectionTitle>
                    <FormField>
                      <Label>Гражданство / Nationality</Label>
                      <Input
                        value={formData.nationality}
                        onChange={(e) => handleFieldChange('nationality', e.target.value)}
                        placeholder="БЪЛГАРИЯ / BGR"
                        readOnly
                      />
                    </FormField>
                    
                    <FormRow>
                      <FormField>
                        <Label>Дата на раждане / Date of Birth</Label>
                        <Input
                          value={formData.dateOfBirth}
                          onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                          placeholder="01.08.1995"
                          $hasError={!!errors.dateOfBirth}
                        />
                      </FormField>
                      <FormField>
                        <Label>Пол / Sex</Label>
                        <Select
                          value={formData.sex}
                          onChange={(e) => handleFieldChange('sex', e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="M">М / M</option>
                          <option value="F">Ж / F</option>
                        </Select>
                      </FormField>
                      <FormField>
                        <NumberInputBulgarian
                          value={formData.height}
                          onChange={(value) => handleFieldChange('height', value)}
                          label="Ръст / Height (cm)"
                          placeholder="168"
                          min={140}
                          max={220}
                          suffix="cm"
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>📅 {language === 'bg' ? 'Валидност' : 'Validity'}</SectionTitle>
                    <FormRow>
                      <FormField>
                        <DatePickerBulgarian
                          value={formData.expiryDate}
                          onChange={(value) => handleFieldChange('expiryDate', value)}
                          label="Валидност / Date of Expiry"
                          placeholder="17.06.2034"
                          error={!!errors.expiryDate}
                          minDate={new Date().toLocaleDateString('bg-BG').split('/').reverse().join('.')}
                        />
                      </FormField>
                      <FormField>
                        <Label>Издаден от / Authority</Label>
                        <Input
                          value={formData.issuingAuthority}
                          onChange={(e) => handleFieldChange('issuingAuthority', e.target.value)}
                          placeholder="MBP/Mol BGR"
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>
                </>
              ) : (
                <>
                  <FormSection>
                    <SectionTitle>🏠 {language === 'bg' ? 'Адрес' : 'Address'}</SectionTitle>
                    <FormField>
                      <Label>Място на раждане / Place of Birth</Label>
                      <Input
                        value={formData.placeOfBirth}
                        onChange={(e) => handleFieldChange('placeOfBirth', e.target.value)}
                        placeholder="СОФИЯ/SOFIA"
                      />
                    </FormField>
                    
                    <FormField>
                      <SelectWithOther
                        options={BULGARIA_REGIONS.map(region => ({
                          value: region.name,
                          label: region.name,
                          labelEn: region.nameEn
                        }))}
                        value={formData.addressOblast}
                        onChange={(value) => handleFieldChange('addressOblast', value)}
                        label="Област / Region"
                        placeholder={language === 'bg' ? 'Изберете област' : 'Select region'}
                        showOther={true}
                      />
                    </FormField>
                    
                    <FormField>
                      <Label>Община / Municipality</Label>
                      <Input
                        value={formData.addressMunicipality}
                        onChange={(e) => handleFieldChange('addressMunicipality', e.target.value)}
                        placeholder="общ.СТОЛИЧНА гр.СОФИЯ/SOFIA"
                      />
                    </FormField>
                    
                    <FormField>
                      <Label>Улица / Street</Label>
                      <Input
                        value={formData.addressStreet}
                        onChange={(e) => handleFieldChange('addressStreet', e.target.value)}
                        placeholder="бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 em.5 an.26"
                      />
                    </FormField>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>👁️ {language === 'bg' ? 'Физически характеристики' : 'Physical Features'}</SectionTitle>
                    <FormRow>
                      <FormField>
                        <NumberInputBulgarian
                          value={formData.height}
                          onChange={(value) => handleFieldChange('height', value)}
                          label="Ръст / Height (cm)"
                          placeholder="168"
                          min={140}
                          max={220}
                          suffix="cm"
                        />
                      </FormField>
                      <FormField>
                        <Label>Цвят на очите / Eye Color</Label>
                        <Select
                          value={formData.eyeColor}
                          onChange={(e) => handleFieldChange('eyeColor', e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="BROWN">КАФЯВИ/BROWN</option>
                          <option value="BLUE">СИН/BLUE</option>
                          <option value="GREEN">ЗЕЛЕН/GREEN</option>
                          <option value="GREY">СИВ/GREY</option>
                        </Select>
                      </FormField>
                    </FormRow>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>📄 {language === 'bg' ? 'Издаване' : 'Issuance'}</SectionTitle>
                    <FormRow>
                      <FormField>
                        <Label>Издаден от / Authority</Label>
                        <Input
                          value={formData.issuingAuthority}
                          onChange={(e) => handleFieldChange('issuingAuthority', e.target.value)}
                          placeholder="MBP/Mol BGR"
                        />
                      </FormField>
                      <FormField>
                        <DatePickerBulgarian
                          value={formData.issueDate}
                          onChange={(value) => handleFieldChange('issueDate', value)}
                          label="Дата на издаване / Date of Issue"
                          placeholder="17.06.2024"
                          maxDate={new Date().toLocaleDateString('bg-BG').split('/').reverse().join('.')}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>
                </>
              )}
            </FormScrollArea>
          </FormColumn>

          {/* RIGHT COLUMN: Reference Image */}
          <ImageColumn>
            <ImageLabel>
              📸 {language === 'bg' ? 'مرجع للمقارنة' : 'Reference for Comparison'}
            </ImageLabel>
            <ReferenceImage src={backgroundImage} alt="ID Card Reference" />
          </ImageColumn>
        </TwoColumnLayout>

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
  max-width: 1400px;  /* ⬆️ Increased for two-column layout */
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
  
  @media (max-width: 1200px) {
    max-width: 95%;
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

// NEW: Two-Column Layout Styles
const TwoColumnLayout = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  overflow: hidden;
  background: #f8f9fa;
  padding: 20px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FormColumn = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const FormScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #FF7900;
    border-radius: 4px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f2f5;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$hasError ? '#dc3545' : '#dee2e6'};
  border-radius: 8px;
  font-size: 0.95rem;
  color: #212529;
  background: ${props => props.$hasError ? '#fff5f5' : '#ffffff'};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc3545' : '#FF7900'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(255, 121, 0, 0.1)'};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
  
  &:read-only {
    background: #e9ecef;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #212529;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
  }
`;

const ErrorText = styled.span`
  font-size: 0.8rem;
  color: #dc3545;
  font-weight: 500;
`;

const ImageColumn = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const ImageLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 16px;
  text-align: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ReferenceImage = styled.img`
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export default IDCardOverlay;

