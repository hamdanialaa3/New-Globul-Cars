// Sell Vehicle Step 6: Contact
// الخطوة 6: معلومات الاتصال

import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../../data/bulgaria-locations';
import { getPostalCodesForCity } from '../../../data/bulgaria-postal-codes';

interface SellVehicleStep6Props {
  workflowData: SellWorkflowData;
  onUpdate: (updates: Partial<SellWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SectionDivider = styled.hr`
  border: none;
  height: 1px;
  background: var(--border);
  margin: 1rem 0;
  opacity: 0.3;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.5rem 0;
`;

export const SellVehicleStep6: React.FC<SellVehicleStep6Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  // Get available cities based on selected region
  const availableCities = useMemo(() => {
    if (!workflowData.region) return [];
    return getCitiesByRegion(workflowData.region, language as 'bg' | 'en');
  }, [workflowData.region, language]);

  // Get available postal codes based on selected city
  const availablePostalCodes = useMemo(() => {
    if (!workflowData.city || !workflowData.region) return [];
    return getPostalCodesForCity(workflowData.city, workflowData.region);
  }, [workflowData.city, workflowData.region]);

  // Clear city and postal code when region changes
  useEffect(() => {
    if (workflowData.region && workflowData.city) {
      const cities = getCitiesByRegion(workflowData.region, language as 'bg' | 'en');
      if (!cities.some(c => c.name === workflowData.city)) {
        onUpdate({ city: '', postalCode: '' });
      }
    }
  }, [workflowData.region, language, onUpdate, workflowData.city]);

  // Clear postal code when city changes
  useEffect(() => {
    if (workflowData.city && workflowData.postalCode) {
      const postalCodes = getPostalCodesForCity(workflowData.city, workflowData.region || '');
      if (!postalCodes.some(pc => pc.code === workflowData.postalCode)) {
        onUpdate({ postalCode: '' });
      }
    }
  }, [workflowData.city, workflowData.region, onUpdate, workflowData.postalCode]);

  return (
    <FormContainer>
      {/* Contact Information */}
      <SectionTitle>{language === 'bg' ? 'Информация за контакт' : 'Contact Information'}</SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Име' : 'Name'} *</Label>
        <Input
          type="text"
          value={workflowData.sellerName || ''}
          onChange={(e) => onUpdate({ sellerName: e.target.value })}
          placeholder={language === 'bg' ? 'Вашето име' : 'Your name'}
          required
        />
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Имейл' : 'Email'} *</Label>
        <Input
          type="email"
          value={workflowData.sellerEmail || ''}
          onChange={(e) => onUpdate({ sellerEmail: e.target.value })}
          placeholder={language === 'bg' ? 'your@email.com' : 'your@email.com'}
          required
        />
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Телефон' : 'Phone'} *</Label>
        <Input
          type="tel"
          value={workflowData.sellerPhone || ''}
          onChange={(e) => onUpdate({ sellerPhone: e.target.value })}
          placeholder={language === 'bg' ? '+359 888 123 456' : '+359 888 123 456'}
          required
        />
      </FieldGroup>

      <SectionDivider />

      {/* Address Information */}
      <SectionTitle>{language === 'bg' ? 'Адресна информация' : 'Address Information'}</SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Област' : 'Region'} *</Label>
        <Select
          value={workflowData.region || ''}
          onChange={(e) => {
            onUpdate({ 
              region: e.target.value,
              city: '', // Clear city when region changes
              postalCode: '', // Clear postal code when region changes
            });
          }}
          required
        >
          <option value="">{language === 'bg' ? 'Изберете област' : 'Select region'}</option>
          {BULGARIA_REGIONS.map(region => (
            <option key={region.name} value={region.name}>
              {language === 'bg' ? region.name : region.nameEn}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Град' : 'City'} *</Label>
        <Select
          value={workflowData.city || ''}
          onChange={(e) => {
            onUpdate({ 
              city: e.target.value,
              postalCode: '', // Clear postal code when city changes
            });
          }}
          disabled={!workflowData.region}
          required
        >
          <option value="">{language === 'bg' ? 'Изберете град' : 'Select city'}</option>
          {availableCities.map(city => (
            <option key={city.name} value={city.name}>
              {language === 'bg' ? city.name : (city.nameEn || city.name)}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</Label>
        <Select
          value={workflowData.postalCode || ''}
          onChange={(e) => onUpdate({ postalCode: e.target.value })}
          disabled={!workflowData.city}
        >
          <option value="">{language === 'bg' ? 'Изберете пощенски код' : 'Select postal code'}</option>
          {availablePostalCodes.map(pc => (
            <option key={pc.code} value={pc.code}>
              {pc.code} {pc.district ? `- ${pc.district}` : ''}
            </option>
          ))}
        </Select>
      </FieldGroup>
    </FormContainer>
  );
};

export default SellVehicleStep6;
