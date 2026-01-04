// Sell Vehicle Step 5: Pricing
// الخطوة 5: السعر

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';

interface SellVehicleStep5Props {
  workflowData: Partial<UnifiedWorkflowData>;
  onUpdate: (updates: Partial<UnifiedWorkflowData>) => void;
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

const PriceInputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem; /* Right padding for € symbol */
  border: 2px solid #9CA3AF;
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

const EuroSymbol = styled.span`
  position: absolute;
  right: 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  pointer-events: none;
`;

const Select = styled.select`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid #9CA3AF;
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


const AttentionPulse = styled.div<{ $isActive: boolean }>`
  border-radius: 12px;
  animation: ${props => props.$isActive ? 'pulse-attention 2s infinite' : 'none'};
  transition: box-shadow 0.3s ease;
  
  @keyframes pulse-attention {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
`;

const RevealWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleInteraction = () => {
    setIsActive(false);
  };

  return (
    <AttentionPulse
      ref={ref}
      $isActive={isActive}
      onClick={handleInteraction}
      onFocus={handleInteraction}
      onMouseDown={handleInteraction}
    >
      <FieldGroup>{children}</FieldGroup>
    </AttentionPulse>
  );
};

export const SellVehicleStep5: React.FC<SellVehicleStep5Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  // Progressive Reveal Logic
  const hasPrice = !!workflowData.price;
  const hasCurrency = !!workflowData.currency;

  // Success Styling Logic
  const successColor = '#22c55e';

  const getLabelStyle = (hasValue: boolean) => ({
    color: hasValue ? successColor : 'var(--text-primary)',
    transition: 'color 0.3s ease'
  });

  const getInputStyle = (hasValue: boolean) => ({
    borderColor: hasValue ? successColor : 'var(--border)',
    color: hasValue ? successColor : 'var(--text-primary)',
    fontWeight: hasValue ? '600' : 'normal',
    transition: 'all 0.3s ease'
  });

  return (
    <FormContainer>
      <FieldGroup>
        <Label style={getLabelStyle(hasPrice)}>{language === 'bg' ? 'Цена' : 'Price'} *</Label>
        <PriceInputWrapper>
          <Input
            type="number"
            value={workflowData.price || ''}
            onChange={(e) => onUpdate({ price: e.target.value })}
            placeholder={language === 'bg' ? 'Въведете цена' : 'Enter price'}
            min="0"
            required
            style={getInputStyle(hasPrice)}
          />
          <EuroSymbol>€</EuroSymbol>
        </PriceInputWrapper>
      </FieldGroup>

      {hasPrice && (
        <RevealWrapper>
          <Label style={getLabelStyle(hasCurrency)}>{language === 'bg' ? 'Валута' : 'Currency'}</Label>
          <Select
            value={workflowData.currency || 'EUR'}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            style={getInputStyle(hasCurrency)}
          >
            <option value="EUR">EUR</option>
            <option value="BGN">BGN</option>
            <option value="USD">USD</option>
          </Select>
        </RevealWrapper>
      )}

      {hasPrice && (
        <RevealWrapper>
          <Label>{language === 'bg' ? 'Тип цена' : 'Price Type'}</Label>
          <Select
            value={workflowData.priceType || 'fixed'}
            onChange={(e) => {
              const type = e.target.value;
              onUpdate({
                priceType: type,
                negotiable: type === 'negotiable' // Auto-sync checkbox state
              });
            }}
            style={getInputStyle(!!workflowData.priceType)}
          >
            <option value="fixed">{language === 'bg' ? 'Фиксирана' : 'Fixed'}</option>
            <option value="negotiable">{language === 'bg' ? 'Договорна' : 'Negotiable'}</option>
          </Select>
        </RevealWrapper>
      )}
    </FormContainer>
  );
};

export default SellVehicleStep5;
