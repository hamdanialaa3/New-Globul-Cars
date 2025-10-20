/**
 * Dealership Information Form
 * Complete form for dealership/showroom profile information
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Save,
  Check
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { dealershipService } from '../../../services/dealership/dealership.service';
import { 
  DEFAULT_WORKING_HOURS, 
  DEFAULT_SERVICES, 
  DEFAULT_CERTIFICATIONS,
  type DealershipInfo,
  type LegalForm,
  type VehicleType,
  type CarCategory
} from '../../../types/dealership.types';
import { useToast } from '../../Toast';

interface DealershipInfoFormProps {
  userId: string;
}

const DealershipInfoForm: React.FC<DealershipInfoFormProps> = ({ userId }) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dealershipInfo, setDealershipInfo] = useState<Partial<DealershipInfo>>({
    workingHours: DEFAULT_WORKING_HOURS,
    services: DEFAULT_SERVICES,
    certifications: DEFAULT_CERTIFICATIONS,
    documents: [],
    galleryImages: []
  });

  const loadDealershipInfo = useCallback(async () => {
    try {
      setLoading(true);
      const info = await dealershipService.getDealershipInfo(userId);
      if (info) {
        setDealershipInfo(info);
      }
    } catch (error) {
      console.error('Error loading dealership info:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDealershipInfo();
  }, [loadDealershipInfo]);

  const handleInputChange = (field: keyof DealershipInfo, value: any) => {
    setDealershipInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof DealershipInfo, field: string, value: any) => {
    setDealershipInfo(prev => ({
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
      
      // Validation
      if (!dealershipInfo.dealershipNameBG) {
        showToast('error', language === 'bg' ? 'Моля въведете име на автокъща' : 'Please enter dealership name');
        return;
      }
      
      await dealershipService.saveDealershipInfo(userId, dealershipInfo);
      showToast('success', language === 'bg' ? 'Информацията е запазена' : 'Information saved successfully');
    } catch (error) {
      console.error('Error saving dealership info:', error);
      showToast('error', language === 'bg' ? 'Грешка при запазване' : 'Error saving information');
    } finally {
      setSaving(false);
    }
  };

  const t = {
    // Section Headers
    basicInfo: language === 'bg' ? 'Основна информация' : 'Basic Information',
    addressInfo: language === 'bg' ? 'Адрес' : 'Address',
    contactInfo: language === 'bg' ? 'Контакти' : 'Contact Information',
    businessDetails: language === 'bg' ? 'Бизнес детайли' : 'Business Details',
    workingHours: language === 'bg' ? 'Работно време' : 'Working Hours',
    
    // Fields
    dealershipName: language === 'bg' ? 'Име на автокъща (Български)' : 'Dealership Name (Bulgarian)',
    dealershipNameEN: language === 'bg' ? 'Име на автокъща (Английски)' : 'Dealership Name (English)',
    legalForm: language === 'bg' ? 'Правна форма' : 'Legal Form',
    vatNumber: language === 'bg' ? 'ДДС номер' : 'VAT Number',
    companyRegNumber: language === 'bg' ? 'ЕИК' : 'Company Registration Number',
    
    // Address
    city: language === 'bg' ? 'Град' : 'City',
    street: language === 'bg' ? 'Улица' : 'Street',
    number: language === 'bg' ? 'Номер' : 'Number',
    postalCode: language === 'bg' ? 'Пощенски код' : 'Postal Code',
    region: language === 'bg' ? 'Област' : 'Region',
    
    // Contact
    primaryPhone: language === 'bg' ? 'Основен телефон' : 'Primary Phone',
    secondaryPhone: language === 'bg' ? 'Допълнителен телефон' : 'Secondary Phone',
    officialEmail: language === 'bg' ? 'Официален имейл' : 'Official Email',
    website: language === 'bg' ? 'Уебсайт' : 'Website',
    
    // Business
    vehicleTypes: language === 'bg' ? 'Тип автомобили' : 'Vehicle Types',
    carCategories: language === 'bg' ? 'Категории' : 'Categories',
    
    // Legal Forms
    legalForms: {
      EOOD: 'ЕООД - Еднолично дружество с ограничена отговорност',
      OOD: 'ООД - Дружество с ограничена отговорност',
      AD: 'АД - Акционерно дружество',
      SOLE_TRADER: 'Едноличен търговец',
      ET: 'ЕТ'
    },
    
    // Vehicle Types
    vehicleTypeOptions: {
      new: language === 'bg' ? 'Нови' : 'New',
      used: language === 'bg' ? 'Употребявани' : 'Used',
      both: language === 'bg' ? 'И двата' : 'Both'
    },
    
    // Car Categories
    carCategoryOptions: {
      passenger: language === 'bg' ? 'Лекови автомобили' : 'Passenger Cars',
      trucks: language === 'bg' ? 'Камиони' : 'Trucks',
      vans: language === 'bg' ? 'Ванове' : 'Vans',
      luxury: language === 'bg' ? 'Луксозни' : 'Luxury',
      commercial: language === 'bg' ? 'Търговски' : 'Commercial',
      motorcycles: language === 'bg' ? 'Мотоциклети' : 'Motorcycles'
    },
    
    // Services
    services: language === 'bg' ? 'Услуги' : 'Services',
    financing: language === 'bg' ? 'Финансиране/Лизинг' : 'Financing/Leasing',
    warranty: language === 'bg' ? 'Гаранция' : 'Warranty',
    maintenance: language === 'bg' ? 'Сервизна поддръжка' : 'Maintenance',
    importOnDemand: language === 'bg' ? 'Внос по поръчка' : 'Import on Demand',
    tradeIn: language === 'bg' ? 'Изкупуване на стари автомобили' : 'Trade-In',
    insurance: language === 'bg' ? 'Застраховка' : 'Insurance',
    registration: language === 'bg' ? 'Регистрация' : 'Registration',
    delivery: language === 'bg' ? 'Доставка' : 'Delivery',
    
    // Buttons
    save: language === 'bg' ? 'Запази' : 'Save',
    saving: language === 'bg' ? 'Запазване...' : 'Saving...'
  };

  if (loading) {
    return <LoadingContainer>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingContainer>;
  }

  return (
    <FormContainer>
      {/* Basic Information */}
      <Section>
        <SectionHeader>
          <Building2 size={20} />
          <h3>{t.basicInfo}</h3>
        </SectionHeader>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.dealershipName} *</Label>
            <Input
              type="text"
              value={dealershipInfo.dealershipNameBG || ''}
              onChange={(e) => handleInputChange('dealershipNameBG', e.target.value)}
              placeholder="Пример: Авто Център София"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.dealershipNameEN}</Label>
            <Input
              type="text"
              value={dealershipInfo.dealershipNameEN || ''}
              onChange={(e) => handleInputChange('dealershipNameEN', e.target.value)}
              placeholder="Example: Auto Center Sofia"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.legalForm} *</Label>
            <Select
              value={dealershipInfo.legalForm || ''}
              onChange={(e) => handleInputChange('legalForm', e.target.value as LegalForm)}
            >
              <option value="">-- {language === 'bg' ? 'Изберете' : 'Select'} --</option>
              <option value="EOOD">{t.legalForms.EOOD}</option>
              <option value="OOD">{t.legalForms.OOD}</option>
              <option value="AD">{t.legalForms.AD}</option>
              <option value="SOLE_TRADER">{t.legalForms.SOLE_TRADER}</option>
              <option value="ET">{t.legalForms.ET}</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>{t.vatNumber}</Label>
            <Input
              type="text"
              value={dealershipInfo.vatNumber || ''}
              onChange={(e) => handleInputChange('vatNumber', e.target.value)}
              placeholder="BG123456789"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.companyRegNumber}</Label>
            <Input
              type="text"
              value={dealershipInfo.companyRegNumber || ''}
              onChange={(e) => handleInputChange('companyRegNumber', e.target.value)}
              placeholder="123456789"
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Address Information */}
      <Section>
        <SectionHeader>
          <MapPin size={20} />
          <h3>{t.addressInfo}</h3>
        </SectionHeader>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.city} *</Label>
            <Input
              type="text"
              value={dealershipInfo.address?.city || ''}
              onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
              placeholder={language === 'bg' ? 'София' : 'Sofia'}
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.street}</Label>
            <Input
              type="text"
              value={dealershipInfo.address?.street || ''}
              onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
              placeholder={language === 'bg' ? 'бул. България' : 'Bulgaria Blvd.'}
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.number}</Label>
            <Input
              type="text"
              value={dealershipInfo.address?.number || ''}
              onChange={(e) => handleNestedChange('address', 'number', e.target.value)}
              placeholder="123"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.postalCode}</Label>
            <Input
              type="text"
              value={dealershipInfo.address?.postalCode || ''}
              onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
              placeholder="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.region}</Label>
            <Input
              type="text"
              value={dealershipInfo.address?.region || ''}
              onChange={(e) => handleNestedChange('address', 'region', e.target.value)}
              placeholder={language === 'bg' ? 'София-град' : 'Sofia-city'}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Contact Information */}
      <Section>
        <SectionHeader>
          <Phone size={20} />
          <h3>{t.contactInfo}</h3>
        </SectionHeader>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.primaryPhone} *</Label>
            <Input
              type="tel"
              value={dealershipInfo.primaryPhone || ''}
              onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
              placeholder="+359 888 123 456"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.secondaryPhone}</Label>
            <Input
              type="tel"
              value={dealershipInfo.secondaryPhone || ''}
              onChange={(e) => handleInputChange('secondaryPhone', e.target.value)}
              placeholder="+359 888 654 321"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.officialEmail} *</Label>
            <Input
              type="email"
              value={dealershipInfo.officialEmail || ''}
              onChange={(e) => handleInputChange('officialEmail', e.target.value)}
              placeholder="info@autocenter.bg"
            />
          </FormGroup>

          <FormGroup>
            <Label>{t.website}</Label>
            <Input
              type="url"
              value={dealershipInfo.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.autocenter.bg"
            />
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Business Details */}
      <Section>
        <SectionHeader>
          <Building2 size={20} />
          <h3>{t.businessDetails}</h3>
        </SectionHeader>
        
        <FormGrid>
          <FormGroup>
            <Label>{t.vehicleTypes}</Label>
            <Select
              value={dealershipInfo.vehicleTypes || ''}
              onChange={(e) => handleInputChange('vehicleTypes', e.target.value as VehicleType)}
            >
              <option value="">-- {language === 'bg' ? 'Изберете' : 'Select'} --</option>
              <option value="new">{t.vehicleTypeOptions.new}</option>
              <option value="used">{t.vehicleTypeOptions.used}</option>
              <option value="both">{t.vehicleTypeOptions.both}</option>
            </Select>
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>{t.carCategories}</Label>
            <CheckboxGrid>
              {Object.entries(t.carCategoryOptions).map(([key, label]) => (
                <CheckboxLabel key={key}>
                  <input
                    type="checkbox"
                    checked={dealershipInfo.carCategories?.includes(key as CarCategory) || false}
                    onChange={(e) => {
                      const categories = dealershipInfo.carCategories || [];
                      if (e.target.checked) {
                        handleInputChange('carCategories', [...categories, key as CarCategory]);
                      } else {
                        handleInputChange('carCategories', categories.filter(c => c !== key));
                      }
                    }}
                  />
                  <span>{label}</span>
                </CheckboxLabel>
              ))}
            </CheckboxGrid>
          </FormGroup>
        </FormGrid>
      </Section>

      {/* Services */}
      <Section>
        <SectionHeader>
          <Check size={20} />
          <h3>{t.services}</h3>
        </SectionHeader>
        
        <CheckboxGrid>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.financing || false}
              onChange={(e) => handleNestedChange('services', 'financing', e.target.checked)}
            />
            <span>{t.financing}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.warranty || false}
              onChange={(e) => handleNestedChange('services', 'warranty', e.target.checked)}
            />
            <span>{t.warranty}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.maintenance || false}
              onChange={(e) => handleNestedChange('services', 'maintenance', e.target.checked)}
            />
            <span>{t.maintenance}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.importOnDemand || false}
              onChange={(e) => handleNestedChange('services', 'importOnDemand', e.target.checked)}
            />
            <span>{t.importOnDemand}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.tradeIn || false}
              onChange={(e) => handleNestedChange('services', 'tradeIn', e.target.checked)}
            />
            <span>{t.tradeIn}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.insurance || false}
              onChange={(e) => handleNestedChange('services', 'insurance', e.target.checked)}
            />
            <span>{t.insurance}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.registration || false}
              onChange={(e) => handleNestedChange('services', 'registration', e.target.checked)}
            />
            <span>{t.registration}</span>
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={dealershipInfo.services?.delivery || false}
              onChange={(e) => handleNestedChange('services', 'delivery', e.target.checked)}
            />
            <span>{t.delivery}</span>
          </CheckboxLabel>
        </CheckboxGrid>
      </Section>

      {/* Save Button */}
      <SaveButton onClick={handleSave} disabled={saving}>
        <Save size={18} />
        {saving ? t.saving : t.save}
      </SaveButton>
    </FormContainer>
  );
};

export default DealershipInfoForm;

// Styled Components

const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: #666;
  font-size: 16px;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
  
  h3 {
    margin: 0;
    font-size: 18px;
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

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #16a34a;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #16a34a;
  }
  
  span {
    font-size: 14px;
    color: #374151;
  }
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
  
  svg {
    animation: ${props => props.disabled ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
