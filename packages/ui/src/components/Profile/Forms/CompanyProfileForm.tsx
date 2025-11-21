/**
 * Company Profile Form
 * Phase 3: UI Components & Forms
 * 
 * Complete form for company profile setup and editing.
 * Uses CompanyRepository for data persistence.
 * 
 * File: src/components/Profile/Forms/CompanyProfileForm.tsx
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Building2, Phone, Mail, Globe, MapPin, Users, Save, X, Briefcase } from 'lucide-react';
import { CompanyRepository } from '../../../repositories/CompanyRepository';
import { useToast } from '../../Toast';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import type { CompanyInfo, CompanyInfoUpdate, CompanyLegalForm } from '@globul-cars/core/typescompany/company.types';

interface CompanyProfileFormProps {
  uid: string;
  initialData?: CompanyInfo;
  onSave?: (data: CompanyInfo) => void;
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
    border-color: ${props => props.$themeColor || '#1d4ed8'};
    box-shadow: 0 0 0 3px ${props => props.$themeColor || '#1d4ed8'}20;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select<{ $themeColor?: string }>`
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 0.938rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$themeColor || '#1d4ed8'};
    box-shadow: 0 0 0 3px ${props => props.$themeColor || '#1d4ed8'}20;
  }

  option {
    background: #2a2a2a;
    color: #ffffff;
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
      ? `linear-gradient(135deg, ${props.$themeColor || '#1d4ed8'} 0%, ${props.$themeColor || '#1e40af'} 100%)`
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

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  uid,
  initialData,
  onSave,
  onCancel,
  themeColor = '#1d4ed8'
}) => {
  const toast = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({
    companyNameBG: '',
    companyNameEN: '',
    bulstat: '',
    vatNumber: '',
    registrationNumber: '',
    legalForm: 'ЕООД',
    headquarters: {
      type: 'headquarters',
      street: '',
      city: 'София',
      region: 'София',
      postalCode: '',
      country: 'Bulgaria',
      isPrimary: true
    },
    contact: {
      phone: '',
      phoneCountryCode: '+359',
      email: '',
      website: ''
    },
    structure: {
      employeeCount: 0,
      departments: []
    },
    fleet: {
      totalVehicles: 0,
      services: {
        leasing: false,
        rental: false,
        carSharing: false,
        chauffeurService: false
      }
    },
    certifications: {
      iso9001: false,
      iso14001: false,
      iso45001: false,
      industryCertifications: []
    },
    media: {
      galleryImages: []
    },
    settings: {
      displayLanguages: ['bg'],
      currency: 'EUR',
      privacySettings: {
        showPhone: true,
        showEmail: true,
        showAddress: true,
        showEmployeeCount: false,
        showFleetSize: false,
        allowDirectContact: true,
        requireNDA: false
      },
      notifications: {
        newInquiries: true,
        newOrders: true,
        weeklyReport: true,
        monthlyReport: true,
        quarterlyReport: false
      },
      businessRules: {
        autoApprovalEnabled: false,
        requiresQuote: true,
        bulkDiscountEnabled: false
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
      if (!formData.companyNameBG || !formData.bulstat) {
        toast.error('Моля попълнете задължителните полета');
        return;
      }

      await CompanyRepository.updateWithUserSync(uid, formData as CompanyInfoUpdate);

      toast.success('Информацията е запазена успешно');
      
      if (onSave && initialData) {
        onSave({ ...initialData, ...formData } as CompanyInfo);
      }
    } catch (error) {
      logger.error('Error saving company form', error as Error);
      toast.error('Грешка при запазване');
    } finally {
      setLoading(false);
    }
  };

  const legalForms: CompanyLegalForm[] = ['ЕООД', 'ООД', 'АД', 'ЕАД', 'ЕТ', 'other'];

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        {/* Company Information */}
        <FormSection>
          <SectionTitle>
            <Building2 size={20} />
            Информация за компанията
          </SectionTitle>
          <FormRow>
            <FormField>
              <Label>Име на компанията (BG) *</Label>
              <Input
                type="text"
                value={formData.companyNameBG || ''}
                onChange={(e) => handleInputChange('companyNameBG', e.target.value)}
                placeholder="Глобул Карс ЕООД"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>Company Name (EN)</Label>
              <Input
                type="text"
                value={formData.companyNameEN || ''}
                onChange={(e) => handleInputChange('companyNameEN', e.target.value)}
                placeholder="Globul Cars Ltd"
                $themeColor={themeColor}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>БУЛСТАТ/ЕИК *</Label>
              <Input
                type="text"
                value={formData.bulstat || ''}
                onChange={(e) => handleInputChange('bulstat', e.target.value)}
                placeholder="123456789"
                pattern="\d{9}(\d{4})?"
                $themeColor={themeColor}
                required
              />
            </FormField>
            <FormField>
              <Label>Правна форма *</Label>
              <Select
                value={formData.legalForm || 'ЕООД'}
                onChange={(e) => handleInputChange('legalForm', e.target.value)}
                $themeColor={themeColor}
                required
              >
                {legalForms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </Select>
            </FormField>
          </FormRow>
        </FormSection>

        {/* Contact Information */}
        <FormSection>
          <SectionTitle>
            <Phone size={20} />
            Контакти
          </SectionTitle>
          <FormRow>
            <FormField>
              <Label>Телефон *</Label>
              <Input
                type="tel"
                value={formData.contact?.phone || ''}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                placeholder="+359 2 123 4567"
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
                placeholder="info@company.bg"
                $themeColor={themeColor}
                required
              />
            </FormField>
          </FormRow>
        </FormSection>

        {/* Fleet Information */}
        <FormSection>
          <SectionTitle>
            <Briefcase size={20} />
            Автопарк
          </SectionTitle>
          <FormRow>
            <FormField>
              <Label>Брой превозни средства</Label>
              <Input
                type="number"
                value={formData.fleet?.totalVehicles || 0}
                onChange={(e) => handleInputChange('fleet.totalVehicles', parseInt(e.target.value))}
                min="0"
                $themeColor={themeColor}
              />
            </FormField>
            <FormField>
              <Label>Брой служители</Label>
              <Input
                type="number"
                value={formData.structure?.employeeCount || 0}
                onChange={(e) => handleInputChange('structure.employeeCount', parseInt(e.target.value))}
                min="0"
                $themeColor={themeColor}
              />
            </FormField>
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

export default CompanyProfileForm;

