// Step 5: Pricing
// الخطوة 5: التسعير
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Euro, TrendingUp, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCarListingStore } from '../../stores/car-listing-store';
import { step5Schema, Step5Data } from '../../schemas/car-listing.schema';
import { toast } from 'react-toastify';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

const FormCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  
  span {
    color: #3b82f6;
  }
`;

const PriceInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const PriceIcon = styled.div`
  color: var(--text-secondary);
  display: flex;
  align-items: center;
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ToggleSwitch = styled.label<{ $checked: boolean }>`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$checked ? 'var(--accent-primary)' : '#ccc'};
    transition: 0.3s;
    border-radius: 26px;
    
    &:before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      transform: ${props => props.$checked ? 'translateX(24px)' : 'translateX(0)'};
    }
  }
`;

const ToggleLabel = styled.label`
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-accent);
  border-radius: 12px;
  margin-top: 1rem;
`;

const InfoIcon = styled.div`
  color: var(--accent-primary);
  flex-shrink: 0;
`;

const InfoText = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  
  strong {
    color: var(--text-primary);
  }
`;

const CurrencySelect = styled.select`
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorText = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

export const Step5Pricing: React.FC = () => {
  const { language } = useLanguage();
  const { formData, updateStepData, markStepComplete } = useCarListingStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: formData.step5 || {
      price: undefined,
      currency: 'EUR',
      negotiable: false,
      financing: false,
      tradeIn: false,
      warranty: false,
      vatDeductible: false,
    },
    mode: 'onChange',
  });

  const price = watch('price');
  const currency = watch('currency');
  const negotiable = watch('negotiable');

  // Auto-update store when form changes
  useEffect(() => {
    const subscription = watch((data) => {
      updateStepData('step5', data as Partial<Step5Data>);
      
      // Mark complete if price is filled
      if (data.price && data.price > 0) {
        markStepComplete(4);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStepData, markStepComplete]);

  return (
    <StepContainer>
      <div>
        <StepTitle>
          {language === 'bg' ? 'Цена на превозното средство' : 'Vehicle Price'}
        </StepTitle>
        <StepDescription>
          {language === 'bg'
            ? 'Определете цената на вашето превозно средство'
            : 'Set your vehicle price'}
        </StepDescription>
      </div>

      <form onSubmit={handleSubmit((data) => {
        updateStepData('step5', data);
        markStepComplete(4);
      })}>
        <FormCard>
          <Label htmlFor="price">
            {language === 'bg' ? 'Цена' : 'Price'}
            <span>*</span>
          </Label>
          
          <PriceInputWrapper>
            <PriceIcon>
              <Euro size={24} />
            </PriceIcon>
            <PriceInput
              id="price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              placeholder="15000"
              min="1"
              step="1"
            />
            <CurrencySelect
              {...register('currency')}
            >
              <option value="EUR">EUR</option>
              <option value="BGN">BGN</option>
              <option value="USD">USD</option>
            </CurrencySelect>
          </PriceInputWrapper>
          
          {errors.price && <ErrorText>{errors.price.message}</ErrorText>}

          <ToggleWrapper>
            <ToggleSwitch $checked={negotiable || false}>
              <input
                type="checkbox"
                {...register('negotiable')}
              />
              <span className="toggle-slider" />
            </ToggleSwitch>
            <ToggleLabel htmlFor="negotiable">
              {language === 'bg' ? 'Цената подлежи на договаряне' : 'Price is negotiable'}
            </ToggleLabel>
          </ToggleWrapper>

          <ToggleWrapper>
            <ToggleSwitch $checked={watch('financing') || false}>
              <input
                type="checkbox"
                {...register('financing')}
              />
              <span className="toggle-slider" />
            </ToggleSwitch>
            <ToggleLabel>
              {language === 'bg' ? 'Финансиране налични' : 'Financing available'}
            </ToggleLabel>
          </ToggleWrapper>

          <ToggleWrapper>
            <ToggleSwitch $checked={watch('tradeIn') || false}>
              <input
                type="checkbox"
                {...register('tradeIn')}
              />
              <span className="toggle-slider" />
            </ToggleSwitch>
            <ToggleLabel>
              {language === 'bg' ? 'Приемане на стар автомобил' : 'Trade-in accepted'}
            </ToggleLabel>
          </ToggleWrapper>

          <ToggleWrapper>
            <ToggleSwitch $checked={watch('warranty') || false}>
              <input
                type="checkbox"
                {...register('warranty')}
              />
              <span className="toggle-slider" />
            </ToggleSwitch>
            <ToggleLabel>
              {language === 'bg' ? 'Гаранция' : 'Warranty included'}
            </ToggleLabel>
          </ToggleWrapper>
        </FormCard>

        <InfoCard>
          <InfoIcon>
            <Info size={20} />
          </InfoIcon>
          <InfoText>
            <strong>{language === 'bg' ? 'Съвет:' : 'Tip:'}</strong>
            <br />
            {language === 'bg'
              ? 'Проучете пазарната цена на подобни превозни средства преди да определите цена.'
              : 'Research market prices for similar vehicles before setting your price.'}
          </InfoText>
        </InfoCard>
      </form>
    </StepContainer>
  );
};


