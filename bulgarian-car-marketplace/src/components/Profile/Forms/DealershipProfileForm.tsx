/**
 * Dealership Profile Form
 * Phase 3: UI Components & Forms
 * 
 * Complete form for dealer profile setup and editing.
 * Uses DealershipRepository for data persistence.
 * 
 * File: src/components/Profile/Forms/DealershipProfileForm.tsx
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Building2, Phone, Mail, Globe, MapPin, Clock, Save, X } from 'lucide-react';
import { DealershipRepository } from '../../../repositories/DealershipRepository';
import { ProfileMediaService } from '../../../services/profile/ProfileMediaService';
import { useToast } from '../../Toast';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { DealershipInfo, DealershipInfoUpdate } from '../../../types/dealership/dealership.types';

interface DealershipProfileFormProps {
  uid: string;
  initialData?: DealershipInfo;
  onSave?: (data: DealershipInfo) => void;
  onCancel?: () => void;
  themeColor?: string;
}

const FormContainer = styled.div`
  background: #3e3e3e;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.08);
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input<{ $themeColor?: string }>`
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 0.938rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$themeColor || '#16a34a'};
    box-shadow: 0 0 0 3px ${props => props.$themeColor || '#16a34a'}20;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea<{ $themeColor?: string }>`
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 0.938rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$themeColor || '#16a34a'};
    box-shadow: 0 0 0 3px ${props => props.$themeColor || '#16a34a'}20;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $themeColor?: string }>`
  background: ${props => 
    props.$variant === 'primary' 
      ? `linear-gradient(135deg, ${props.$themeColor || '#16a34a'} 0%, ${props.$themeColor || '#15803d'} 100%)`
      : 'linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)'
  };
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  display: flex;
  align-items: center;
  gap: 8px;
  
  box-shadow: 
    3px 3px 6px rgba(0, 0, 0, 0.3),
    -3px -3px 6px rgba(255, 255, 255, 0.05);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      5px 5px 10px rgba(0, 0, 0, 0.4),
      -5px -5px 10px rgba(255, 255, 255, 0.08);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DealershipProfileForm: React.FC<DealershipProfileFormProps> = ({
  uid,
  initialData,
  onSave,
  onCancel,
  themeColor = '#16a34a'
}) => {
  const toast = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DealershipInfo>>({
    dealershipNameBG: '',
    dealershipNameEN: '',
    eik: '',
    vatNumber: '',
    licenseNumber: '',
    address: {
      street: '',
      city: 'София',
      region: 'София',
      postalCode: '',
      country: 'Bulgaria'
    },
    contact: {
      phone: '',
      phoneCountryCode: '+359',
      email: '',
      website: ''
    },
    workingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
      sunday: { isOpen: false }
    },
    services: {
      newCarSales: true,
      usedCarSales: true,
      carImport: false,
      tradeIn: false,
      financing: false,
      leasing: false,
      insurance: false,
      maintenance: false,
      repairs: false,
      warranty: false,
      carWash: false,
      detailing: false,
      homeDelivery: false,
      testDrive: true,
      onlineReservation: false,
      specializations: [],
      brands: []
    },
    certifications: {
      brandCertifications: []
    },
    media: {
      galleryImages: []
    },
    settings: {
      displayLanguages: ['bg'],
      currency: 'EUR',
      privacySettings: {
        showPhoneNumber: true,
        showEmail: true,
        showAddress: true,
        showWorkingHours: true,
        allowDirectMessages: true,
        allowCalls: true
      },
      notifications: {
        newInquiries: true,
        newReviews: true,
        weeklyReport: true,
        monthlyReport: true
      },
      businessRules: {
        autoReplyEnabled: false
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      // Handle nested fields
      const updated = { ...prev } as any;
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.dealershipNameBG || !formData.eik) {
        toast.error('Моля попълнете задължителните полета');
        return;
      }

      // Save to repository
      await DealershipRepository.updateWithUserSync(uid, formData as DealershipInfoUpdate);

      toast.success('Информацията е запазена успешно');
      
      if (onSave && initialData) {
        onSave({ ...initialData, ...formData } as DealershipInfo);
      }
    } catch (error) {
      logger.error('Error saving dealership form', error as Error);
      toast.error('Грешка при запазване');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        {/* Legal Information */}
        <FormSection>
          <SectionTitle>
            <Building2 size={20} />
            Правна информация
          </SectionTitle>
          <FormRow>
            <FormField>
              <Label>Име на фирмата (BG) *</Label>
              <Input
                type="text"
                value={formData.dealershipNameBG || ''}
                onChange={(e) => handleInputChange('dealershipNameBG', e.target.value)}
                placeholder="Авто Трейд ЕООД"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>Company Name (EN)</Label>
              <Input
                type="text"
                value={formData.dealershipNameEN || ''}
                onChange={(e) => handleInputChange('dealershipNameEN', e.target.value)}
                placeholder="Auto Trade Ltd"
                $themeColor={themeColor}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>ЕИК/БУЛСТАТ *</Label>
              <Input
                type="text"
                value={formData.eik || ''}
                onChange={(e) => handleInputChange('eik', e.target.value)}
                placeholder="123456789"
                pattern="\d{9}(\d{4})?"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>ДДС номер</Label>
              <Input
                type="text"
                value={formData.vatNumber || ''}
                onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                placeholder="BG123456789"
                $themeColor={themeColor}
              />
            </FormField>
          </FormRow>
        </FormSection>

        {/* Contact Information */}
        <FormSection>
          <SectionTitle>
            <Phone size={20} />
            Информация за контакт
          </SectionTitle>
          <FormRow>
            <FormField>
              <Label>Телефон *</Label>
              <Input
                type="tel"
                value={formData.contact?.phone || ''}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                placeholder="+359 888 123 456"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>Имейл *</Label>
              <Input
                type="email"
                value={formData.contact?.email || ''}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                placeholder="info@autotrade.bg"
                $themeColor={themeColor}
                required
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>Уебсайт</Label>
              <Input
                type="url"
                value={formData.contact?.website || ''}
                onChange={(e) => handleInputChange('contact.website', e.target.value)}
                placeholder="https://autotrade.bg"
                $themeColor={themeColor}
              />
            </FormField>
          </FormRow>
        </FormSection>

        {/* Address */}
        <FormSection>
          <SectionTitle>
            <MapPin size={20} />
            Адрес
          </SectionTitle>
          <FormRow>
            <FormField>
              <Label>Улица *</Label>
              <Input
                type="text"
                value={formData.address?.street || ''}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="бул. Цариградско шосе 115"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>Град *</Label>
              <Input
                type="text"
                value={formData.address?.city || ''}
                onChange={(e) => handleInputChange('address.locationData?.cityName', e.target.value)}
                placeholder="София"
                $themeColor={themeColor}
                required
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>Област *</Label>
              <Input
                type="text"
                value={formData.address?.region || ''}
                onChange={(e) => handleInputChange('address.region', e.target.value)}
                placeholder="София"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>Пощенски код *</Label>
              <Input
                type="text"
                value={formData.address?.postalCode || ''}
                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                placeholder="1000"
                pattern="\d{4}"
                $themeColor={themeColor}
                required
              />
            </FormField>
          </FormRow>
        </FormSection>

        {/* Services */}
        <FormSection>
          <SectionTitle>
            <Clock size={20} />
            Услуги
          </SectionTitle>
          <FormRow>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.services?.newCarSales || false}
                onChange={(e) => handleInputChange('services.newCarSales', e.target.checked)}
              />
              Продажба на нови коли
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.services?.usedCarSales || false}
                onChange={(e) => handleInputChange('services.usedCarSales', e.target.checked)}
              />
              Продажба на употребявани коли
            </CheckboxLabel>
          </FormRow>
          <FormRow>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.services?.financing || false}
                onChange={(e) => handleInputChange('services.financing', e.target.checked)}
              />
              Финансиране
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.services?.insurance || false}
                onChange={(e) => handleInputChange('services.insurance', e.target.checked)}
              />
              Застраховане
            </CheckboxLabel>
          </FormRow>
          <FormRow>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.services?.maintenance || false}
                onChange={(e) => handleInputChange('services.maintenance', e.target.checked)}
              />
              Сервиз и поддръжка
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.services?.testDrive || false}
                onChange={(e) => handleInputChange('services.testDrive', e.target.checked)}
              />
              Тест драйв
            </CheckboxLabel>
          </FormRow>
        </FormSection>

        {/* Action Buttons */}
        <ButtonGroup>
          {onCancel && (
            <Button type="button" onClick={onCancel} $variant="secondary">
              <X size={18} />
              Отказ
            </Button>
          )}
          <Button type="submit" $variant="primary" $themeColor={themeColor} disabled={loading}>
            <Save size={18} />
            {loading ? 'Запазване...' : 'Запази'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default DealershipProfileForm;

