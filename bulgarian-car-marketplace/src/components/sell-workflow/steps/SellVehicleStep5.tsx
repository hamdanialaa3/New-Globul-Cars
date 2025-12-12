// Sell Vehicle Step 5: Pricing
// الخطوة 5: السعر

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';

interface SellVehicleStep5Props {
  workflowData: SellWorkflowData;
  onUpdate: (updates: Partial<SellWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
`;

export const SellVehicleStep5: React.FC<SellVehicleStep5Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  return (
    <FormContainer>
      <FieldGroup>
        <Label>{language === 'bg' ? 'Цена' : 'Price'} *</Label>
        <Input
          type="number"
          value={workflowData.price || ''}
          onChange={(e) => onUpdate({ price: e.target.value })}
          placeholder={language === 'bg' ? 'Въведете цена' : 'Enter price'}
          min="0"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Валута' : 'Currency'}</Label>
        <Select
          value={workflowData.currency || 'EUR'}
          onChange={(e) => onUpdate({ currency: e.target.value })}
        >
          <option value="EUR">EUR</option>
          <option value="BGN">BGN</option>
          <option value="USD">USD</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Тип цена' : 'Price Type'}</Label>
        <Select
          value={workflowData.priceType || 'fixed'}
          onChange={(e) => onUpdate({ priceType: e.target.value })}
        >
          <option value="fixed">{language === 'bg' ? 'Фиксирана' : 'Fixed'}</option>
          <option value="negotiable">{language === 'bg' ? 'Договорна' : 'Negotiable'}</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <CheckboxGroup>
          <Checkbox
            type="checkbox"
            checked={workflowData.negotiable === true || workflowData.negotiable === 'true'}
            onChange={(e) => onUpdate({ negotiable: e.target.checked })}
          />
          <CheckboxLabel>
            {language === 'bg' ? 'Договаряне възможно' : 'Negotiable'}
          </CheckboxLabel>
        </CheckboxGroup>
      </FieldGroup>
    </FormContainer>
  );
};

export default SellVehicleStep5;
