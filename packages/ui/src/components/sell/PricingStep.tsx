import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '@globul-cars/core/typesCarListing';

interface PricingStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const PricingCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const CardTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    background-color: #f8f9fa;
    border-color: #e9ecef;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.8rem;
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

const CheckboxText = styled.span`
  font-size: 0.9rem;
  color: #2c3e50;
`;

const PriceDisplay = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
`;

const PriceLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const PriceValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PriceCurrency = styled.span`
  font-size: 1.5rem;
  opacity: 0.8;
`;

const PriceNote = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;

const PricingStep: React.FC<PricingStepProps> = ({ data, onDataChange }) => {
  const [pricing, setPricing] = useState({
    // store as string for input but convert when sending out
    price: (data.price?.toString?.() || ''),
    currency: data.currency || 'EUR',
    priceType: data.priceType || 'fixed',
    negotiable: data.negotiable || false,
    financing: data.financing || false,
    tradeIn: data.tradeIn || false,
    warranty: data.warranty || false,
    warrantyMonths: data.warrantyMonths || '',
    additionalCosts: data.additionalCosts || '',
    paymentMethods: data.paymentMethods || [],
    description: data.description || ''
  });

  const priceTypes = [
    { value: 'fixed', label: 'Фиксирана цена' },
    { value: 'negotiable', label: 'Договорна цена' },
    { value: 'auction', label: 'Търг' }
  ];

  const paymentMethods = [
    'Наложен платеж',
    'Банков превод',
    'Кредитна карта',
    'Кеш',
    'Лизинг',
    'Финансиране',
    'Обмяна'
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    const newPricing = { ...pricing, [field]: value };
    setPricing(newPricing);
    // convert numeric fields to number when calling parent
    const outbound: any = { ...newPricing };
    if (outbound.price !== '' && typeof outbound.price === 'string') outbound.price = parseFloat(outbound.price) || 0;
    if (outbound.warrantyMonths !== '' && typeof outbound.warrantyMonths === 'string') outbound.warrantyMonths = parseInt(outbound.warrantyMonths) || 0;
    onDataChange(outbound);
  };

  const handlePaymentMethodToggle = (method: string) => {
    const newMethods = pricing.paymentMethods.includes(method)
      ? pricing.paymentMethods.filter(m => m !== method)
      : [...pricing.paymentMethods, method];
    const newPricing = { ...pricing, paymentMethods: newMethods };
    setPricing(newPricing);
    const outbound: any = { ...newPricing };
    if (outbound.price !== '' && typeof outbound.price === 'string') outbound.price = parseFloat(outbound.price) || 0;
    if (outbound.warrantyMonths !== '' && typeof outbound.warrantyMonths === 'string') outbound.warrantyMonths = parseInt(outbound.warrantyMonths) || 0;
    onDataChange(outbound);
  };

  const formatPrice = (price: string | number) => {
    if (!price) return '0';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('bg-BG').format(num);
  };

  return (
    <StepContainer>
      <PricingGrid>
        <PricingCard>
          <CardTitle>💰 Основна цена</CardTitle>
          
          <FormGroup>
            <Label>Цена *</Label>
            <Input
              type="number"
              value={pricing.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="25000"
              min="0"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Валута</Label>
            <Select
              value={pricing.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
            >
              <option value="EUR">EUR (€)</option>
              <option value="BGN">BGN (лв)</option>
              <option value="USD">USD ($)</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Тип цена</Label>
            <Select
              value={pricing.priceType}
              onChange={(e) => handleInputChange('priceType', e.target.value)}
            >
              {priceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </FormGroup>
        </PricingCard>

        <PricingCard>
          <CardTitle>📋 Допълнителни условия</CardTitle>
          
          <CheckboxGroup>
            <CheckboxItem>
              <Checkbox
                type="checkbox"
                checked={pricing.negotiable}
                onChange={(e) => handleInputChange('negotiable', e.target.checked)}
              />
              <CheckboxText>Цената е договорна</CheckboxText>
            </CheckboxItem>
            <CheckboxItem>
              <Checkbox
                type="checkbox"
                checked={pricing.financing}
                onChange={(e) => handleInputChange('financing', e.target.checked)}
              />
              <CheckboxText>Възможно финансиране</CheckboxText>
            </CheckboxItem>
            <CheckboxItem>
              <Checkbox
                type="checkbox"
                checked={pricing.tradeIn}
                onChange={(e) => handleInputChange('tradeIn', e.target.checked)}
              />
              <CheckboxText>Приемам обмяна</CheckboxText>
            </CheckboxItem>
            <CheckboxItem>
              <Checkbox
                type="checkbox"
                checked={pricing.warranty}
                onChange={(e) => handleInputChange('warranty', e.target.checked)}
              />
              <CheckboxText>Предоставям гаранция</CheckboxText>
            </CheckboxItem>
          </CheckboxGroup>

          {pricing.warranty && (
            <FormGroup>
              <Label>Гаранция (месеци)</Label>
              <Input
                type="number"
                value={pricing.warrantyMonths}
                onChange={(e) => handleInputChange('warrantyMonths', parseInt(e.target.value))}
                placeholder="12"
                min="0"
              />
            </FormGroup>
          )}
        </PricingCard>
      </PricingGrid>

      <PricingCard>
        <CardTitle>💳 Начини на плащане</CardTitle>
        <CheckboxGroup>
          {paymentMethods.map((method) => (
            <CheckboxItem key={method}>
              <Checkbox
                type="checkbox"
                checked={pricing.paymentMethods.includes(method)}
                onChange={() => handlePaymentMethodToggle(method)}
              />
              <CheckboxText>{method}</CheckboxText>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </PricingCard>

      <PricingCard>
        <CardTitle>📝 Допълнителна информация</CardTitle>
        
        <FormGroup>
          <Label>Допълнителни разходи</Label>
          <TextArea
            value={pricing.additionalCosts}
            onChange={(e) => handleInputChange('additionalCosts', e.target.value)}
            placeholder="Например: Регистрационни такси, застраховка, технически преглед..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Описание на цената</Label>
          <TextArea
            value={pricing.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Опишете условията на продажбата, включените услуги, допълнителни разходи..."
          />
        </FormGroup>
      </PricingCard>

      {pricing.price && (
        <PriceDisplay>
          <PriceLabel>Обща цена</PriceLabel>
          <PriceValue>
            {formatPrice(pricing.price)}
            <PriceCurrency> {pricing.currency}</PriceCurrency>
          </PriceValue>
          <PriceNote>
            {pricing.negotiable ? 'Договорна цена' : 'Фиксирана цена'}
            {pricing.financing && ' • Възможно финансиране'}
            {pricing.tradeIn && ' • Приемам обмяна'}
            {pricing.warranty && ` • Гаранция ${pricing.warrantyMonths} месеца`}
          </PriceNote>
        </PriceDisplay>
      )}

      <InfoCard>
        <InfoTitle>💡 Съвети за ценообразуване</InfoTitle>
        <InfoText>
          • Проверете пазарните цени за подобни превозни средства<br/>
          • Вземете предвид състоянието, пробега и годината<br/>
          • Включете всички допълнителни разходи<br/>
          • Бъдете реалистични с очакванията си<br/>
          • Подгответе се за договаряне на цената
        </InfoText>
      </InfoCard>
    </StepContainer>
  );
};

export default PricingStep;
