/**
 * Business Information Form
 * Complete business registration details for Dealer & Company profiles
 * Bulgarian Business Requirements: EИК (UИК), VAT Number, Legal Form, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Building2, 
  FileText, 
  Shield, 
  Save,
  Loader,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProfileType } from '../../../contexts/ProfileTypeContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';

interface BusinessInfoFormProps {
  userId: string;
}

// Bulgarian Business Information Interface
export interface BulgarianBusinessInfo {
  // Legal Entity Information
  legalForm: 'EOOD' | 'OOD' | 'AD' | 'ET' | 'EAD' | '';  // ЕООД, ООД, АД, ЕТ
  registeredNameBG: string;      // Registered name in Bulgarian
  registeredNameEN?: string;      // Registered name in English
  
  // Registration Numbers (Critically important in BG)
  registrationNumber: string;     // EИК (Edinovmesten Indeks na Korporatsiata)
  uik?: string;                   // УИК (Unique Identification Code)
  vatNumber: string;             // VAT/DDS Number (ДДС)
  bulstat: string;                // Bulstat Number (Булстат)
  
  // Business Address
  registeredAddress: {
    city: string;
    street: string;
    number: string;
    postalCode: string;
    region: string;
  };
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  website?: string;
  
  // Manager/Director Information (for verification)
  manager?: {
    firstName: string;
    lastName: string;
    egn?: string;  // Personal number
    position: string;
  };
  
  // Additional Documentation (IDs for uploaded files)
  registrationCertificate?: string;  // Certificate of incorporation
  vatCertificate?: string;           // VAT registration certificate
  tradeLicense?: string;            // Trade license
  authorizedRepresentative?: string; // Authorized representative document
  
  // Verification Status
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const BusinessInformationForm: React.FC<BusinessInfoFormProps> = ({ userId }) => {
  const { language } = useLanguage();
  const { profileType } = useProfileType();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [businessInfo, setBusinessInfo] = useState<Partial<BulgarianBusinessInfo>>({
    legalForm: '',
    registeredNameBG: '',
    registeredNameEN: '',
    registrationNumber: '',
    uik: '',
    vatNumber: '',
    bulstat: '',
    registeredAddress: {
      city: '',
      street: '',
      number: '',
      postalCode: '',
      region: ''
    },
    contactEmail: '',
    contactPhone: '',
    website: '',
    manager: {
      firstName: '',
      lastName: '',
      position: ''
    },
    verified: false
  });

  // Load existing business info
  const loadBusinessInfo = useCallback(async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const businessData = data.businessInfo;
        
        if (businessData) {
          setBusinessInfo(businessData);
        }
      }
    } catch (err) {
      console.error('Error loading business info:', err);
      setError(language === 'bg' ? 'Грешка при зареждане' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [userId, language]);

  useEffect(() => {
    loadBusinessInfo();
  }, [loadBusinessInfo]);

  const handleInputChange = (field: keyof BulgarianBusinessInfo, value: any) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof BulgarianBusinessInfo, field: string, value: any) => {
    setBusinessInfo(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Validation
      if (!businessInfo.registeredNameBG) {
        setError(language === 'bg' ? 'Въведете име на фирма' : 'Please enter company name');
        return;
      }
      
      if (!businessInfo.registrationNumber) {
        setError(language === 'bg' ? 'Въведете ЕИК' : 'Please enter registration number');
        return;
      }
      
      if (!businessInfo.vatNumber) {
        setError(language === 'bg' ? 'Въведете ДДС номер' : 'Please enter VAT number');
        return;
      }
      
      // Save to Firestore
      await updateDoc(doc(db, 'users', userId), {
        businessInfo: {
          ...businessInfo,
          updatedAt: new Date()
        }
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error saving business info:', err);
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const t = {
    title: language === 'bg' ? 'Информация за бизнеса' : 'Business Information',
    subtitle: profileType === 'dealer' 
      ? (language === 'bg' ? 'Информация за автокъща' : 'Dealership Information')
      : (language === 'bg' ? 'Информация за компания' : 'Company Information'),
    
    legalForm: language === 'bg' ? 'Правна форма' : 'Legal Form',
    registeredName: language === 'bg' ? 'Име на фирма' : 'Company Name',
    registeredNameBG: language === 'bg' ? 'Име (Български)' : 'Name (Bulgarian)',
    registeredNameEN: language === 'bg' ? 'Име (Английски)' : 'Name (English)',
    
    // Registration Numbers
    registrationNumber: language === 'bg' ? 'ЕИК *' : 'Registration Number (EИК) *',
    registrationNumberHelp: language === 'bg' ? 'Единен идентификационен код' : 'Unified Identification Code',
    uik: language === 'bg' ? 'УИК' : 'Unique Identification Code',
    vatNumber: language === 'bg' ? 'ДДС номер *' : 'VAT Number *',
    vatHelp: language === 'bg' ? 'Данък добавена стойност' : 'Value Added Tax',
    bulstat: language === 'bg' ? 'Булстат' : 'Bulstat',
    
    // Address
    address: language === 'bg' ? 'Адрес на регистрация' : 'Registered Address',
    city: language === 'bg' ? 'Град *' : 'City *',
    street: language === 'bg' ? 'Улица *' : 'Street *',
    number: language === 'bg' ? 'Номер *' : 'Number *',
    postalCode: language === 'bg' ? 'Пощенски код' : 'Postal Code',
    region: language === 'bg' ? 'Област' : 'Region',
    
    // Contact
    contact: language === 'bg' ? 'Контакти' : 'Contact Information',
    contactEmail: language === 'bg' ? 'Имейл *' : 'Email *',
    contactPhone: language === 'bg' ? 'Телефон *' : 'Phone *',
    website: language === 'bg' ? 'Уебсайт' : 'Website',
    
    // Manager
    manager: language === 'bg' ? 'Управител' : 'Manager/Director',
    managerFirstName: language === 'bg' ? 'Собствено име' : 'First Name',
    managerLastName: language === 'bg' ? 'Фамилия' : 'Last Name',
    managerPosition: language === 'bg' ? 'Длъжност' : 'Position',
    managerEGN: language === 'bg' ? 'ЕГН' : 'Personal Number',
    
    // Legal Forms
    legalForms: {
      EOOD: 'ЕООД - Еднолично дружество с ограничена отговорност',
      OOD: 'ООД - Дружество с ограничена отговорност',
      AD: 'АД - Акционерно дружество',
      ET: 'ЕТ - Едноличен търговец',
      EAD: 'ЕАД - Еднолично акционерно дружество'
    },
    
    // Buttons
    save: language === 'bg' ? 'Запази' : 'Save',
    saving: language === 'bg' ? 'Запазване...' : 'Saving...',
    
    // Errors
    required: language === 'bg' ? 'Задължително поле' : 'Required field',
    saveError: language === 'bg' ? 'Грешка при запазване' : 'Error saving',
    saveSuccess: language === 'bg' ? 'Информацията е запазена' : 'Information saved'
  };

  if (loading) {
    return <LoadingContainer>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingContainer>;
  }

  return (
    <FormContainer>
      {/* Section Header */}
      <SectionHeader>
        <HeaderIcon>
          <Building2 size={24} />
        </HeaderIcon>
        <div>
          <Title>{t.title}</Title>
          <Subtitle>{t.subtitle}</Subtitle>
        </div>
      </SectionHeader>

      {/* Legal Entity Information */}
      <Section>
        <SectionTitle>
          <Shield size={20} />
          {language === 'bg' ? 'Правна информация' : 'Legal Entity Information'}
        </SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.legalForm} *</Label>
            <Select
              value={businessInfo.legalForm || ''}
              onChange={(e) => handleInputChange('legalForm', e.target.value)}
            >
              <option value="">-- {language === 'bg' ? 'Изберете' : 'Select'} --</option>
              <option value="EOOD">{t.legalForms.EOOD}</option>
              <option value="OOD">{t.legalForms.OOD}</option>
              <option value="AD">{t.legalForms.AD}</option>
              <option value="ET">{t.legalForms.ET}</option>
              <option value="EAD">{t.legalForms.EAD}</option>
            </Select>
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>{t.registeredNameBG} *</Label>
            <Input
              type="text"
              value={businessInfo.registeredNameBG || ''}
              onChange={(e) => handleInputChange('registeredNameBG', e.target.value)}
              placeholder={language === 'bg' ? 'Пример: Автокъща София ЕООД' : 'Example: Auto Center Sofia EOOD'}
            />
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>{t.registeredNameEN}</Label>
            <Input
              type="text"
              value={businessInfo.registeredNameEN || ''}
              onChange={(e) => handleInputChange('registeredNameEN', e.target.value)}
              placeholder="Example: Auto Center Sofia EOOD"
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Registration Numbers */}
      <Section>
        <SectionTitle>
          <FileText size={20} />
          {language === 'bg' ? 'Регистрационни номера' : 'Registration Numbers'}
        </SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.registrationNumber}</Label>
            <Input
              type="text"
              value={businessInfo.registrationNumber || ''}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              placeholder="123456789"
              required
            />
            <HelpText>{t.registrationNumberHelp}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t.vatNumber}</Label>
            <Input
              type="text"
              value={businessInfo.vatNumber || ''}
              onChange={(e) => handleInputChange('vatNumber', e.target.value)}
              placeholder="BG123456789"
              required
            />
            <HelpText>{t.vatHelp}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t.uik}</Label>
            <Input
              type="text"
              value={businessInfo.uik || ''}
              onChange={(e) => handleInputChange('uik', e.target.value)}
              placeholder="УИК123456"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.bulstat}</Label>
            <Input
              type="text"
              value={businessInfo.bulstat || ''}
              onChange={(e) => handleInputChange('bulstat', e.target.value)}
              placeholder="123456789"
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Registered Address */}
      <Section>
        <SectionTitle>
          <FileText size={20} />
          {t.address}
        </SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.city}</Label>
            <Input
              type="text"
              value={businessInfo.registeredAddress?.city || ''}
              onChange={(e) => handleNestedChange('registeredAddress', 'city', e.target.value)}
              placeholder={language === 'bg' ? 'София' : 'Sofia'}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.street}</Label>
            <Input
              type="text"
              value={businessInfo.registeredAddress?.street || ''}
              onChange={(e) => handleNestedChange('registeredAddress', 'street', e.target.value)}
              placeholder={language === 'bg' ? 'бул. България' : 'Bulgaria Blvd.'}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.number}</Label>
            <Input
              type="text"
              value={businessInfo.registeredAddress?.number || ''}
              onChange={(e) => handleNestedChange('registeredAddress', 'number', e.target.value)}
              placeholder="123"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.postalCode}</Label>
            <Input
              type="text"
              value={businessInfo.registeredAddress?.postalCode || ''}
              onChange={(e) => handleNestedChange('registeredAddress', 'postalCode', e.target.value)}
              placeholder="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.region}</Label>
            <Input
              type="text"
              value={businessInfo.registeredAddress?.region || ''}
              onChange={(e) => handleNestedChange('registeredAddress', 'region', e.target.value)}
              placeholder={language === 'bg' ? 'София-град' : 'Sofia-city'}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Contact Information */}
      <Section>
        <SectionTitle>
          <FileText size={20} />
          {t.contact}
        </SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.contactEmail}</Label>
            <Input
              type="email"
              value={businessInfo.contactEmail || ''}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="info@example.bg"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.contactPhone}</Label>
            <Input
              type="tel"
              value={businessInfo.contactPhone || ''}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="+359 888 123 456"
              required
            />
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>{t.website}</Label>
            <Input
              type="url"
              value={businessInfo.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.example.bg"
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Manager/Director Information */}
      <Section>
        <SectionTitle>
          <FileText size={20} />
          {t.manager}
        </SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.managerFirstName}</Label>
            <Input
              type="text"
              value={businessInfo.manager?.firstName || ''}
              onChange={(e) => handleNestedChange('manager', 'firstName', e.target.value)}
              placeholder="Ivan"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.managerLastName}</Label>
            <Input
              type="text"
              value={businessInfo.manager?.lastName || ''}
              onChange={(e) => handleNestedChange('manager', 'lastName', e.target.value)}
              placeholder="Ivanov"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.managerPosition}</Label>
            <Input
              type="text"
              value={businessInfo.manager?.position || ''}
              onChange={(e) => handleNestedChange('manager', 'position', e.target.value)}
              placeholder={language === 'bg' ? 'Мениджър' : 'Manager'}
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.managerEGN}</Label>
            <Input
              type="text"
              value={businessInfo.manager?.egn || ''}
              onChange={(e) => handleNestedChange('manager', 'egn', e.target.value)}
              placeholder="9508010133"
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Status Messages */}
      {success && (
        <SuccessMessage>
          <Check size={18} />
          {t.saveSuccess}
        </SuccessMessage>
      )}
      
      {error && (
        <ErrorMessage>
          <AlertCircle size={18} />
          {error}
        </ErrorMessage>
      )}

      {/* Save Button */}
      <SaveButton onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader size={18} className="spin" />
            {t.saving}
          </>
        ) : (
          <>
            <Save size={18} />
            {t.save}
          </>
        )}
      </SaveButton>
    </FormContainer>
  );
};

export default BusinessInformationForm;

// Styled Components
const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: #666;
  font-size: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
`;

const Section = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }
  
  svg {
    color: #16a34a;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
`;

const HelpText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #a7f3d0;
  
  svg {
    flex-shrink: 0;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
  
  svg {
    flex-shrink: 0;
  }
`;

