import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import SelectWithOther from '../../../components/shared/SelectWithOther';
import { CURRENCIES, PRICE_TYPES } from '../../../data/dropdown-options';
import { useLanguage } from '../../../contexts/LanguageContext';

const PricingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const Input = styled.input`
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

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          
          &:hover {
            background: #5a6268;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
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

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [pricing, setPricing] = useState({
    price: '',
    currency: 'EUR',
    priceType: 'fixed',
    negotiable: false,
    financing: false,
    tradeIn: false,
    warranty: false,
    warrantyMonths: '',
    additionalCosts: '',
    paymentMethods: [] as string[],
    description: ''
  });

  // Extract parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');
  const safety = searchParams.get('safety');
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');
  const extras = searchParams.get('extras');
  const images = searchParams.get('images');

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
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    const newMethods = pricing.paymentMethods.includes(method)
      ? pricing.paymentMethods.filter(m => m !== method)
      : [...pricing.paymentMethods, method];
    
    setPricing(prev => ({ ...prev, paymentMethods: newMethods }));
  };

  const formatPrice = (price: string) => {
    if (!price) return '0';
    return new Intl.NumberFormat('bg-BG').format(parseInt(price));
  };

  const handleBack = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);
    if (safety) params.set('safety', safety);
    if (comfort) params.set('comfort', comfort);
    if (infotainment) params.set('infotainment', infotainment);
    if (extras) params.set('extras', extras);
    if (images) params.set('images', images);

    // ✅ NEW ROUTE: Navigate to images page
    navigate(`/sell/inserat/${vehicleType || 'car'}/images?${params.toString()}`);
  };

  const handleContinue = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);
    if (safety) params.set('safety', safety);
    if (comfort) params.set('comfort', comfort);
    if (infotainment) params.set('infotainment', infotainment);
    if (extras) params.set('extras', extras);
    if (images) params.set('images', images);
    if (pricing.price) params.set('price', pricing.price);
    if (pricing.currency) params.set('currency', pricing.currency);
    if (pricing.priceType) params.set('priceType', pricing.priceType);
    if (pricing.negotiable) params.set('negotiable', 'true');
    if (pricing.financing) params.set('financing', 'true');
    if (pricing.tradeIn) params.set('tradeIn', 'true');
    if (pricing.warranty) params.set('warranty', 'true');
    if (pricing.warrantyMonths) params.set('warrantyMonths', pricing.warrantyMonths);
    if (pricing.paymentMethods.length > 0) {
      params.set('paymentMethods', pricing.paymentMethods.join(','));
    }

    // ✅ Use unified contact page
    navigate(`/sell/inserat/${vehicleType || 'pkw'}/contact?${params.toString()}`);
  };

  return (
    <PricingContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Цена</Title>
          <Subtitle>
            Определете цената и условията
          </Subtitle>
        </HeaderCard>

        <FormCard>
          <FormGrid>
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
              <SelectWithOther
                options={CURRENCIES}
                value={pricing.currency}
                onChange={(value) => handleInputChange('currency', value)}
                placeholder={language === 'bg' ? 'Изберете валута' : 'Select currency'}
                label={language === 'bg' ? 'Валута' : 'Currency'}
              />
            </FormGroup>

            <FormGroup>
              <Label>Тип цена</Label>
              <SelectWithOther
                options={PRICE_TYPES}
                value={pricing.priceType}
                onChange={(value) => handleInputChange('priceType', value)}
                placeholder={language === 'bg' ? 'Изберете тип цена' : 'Select price type'}
                label={language === 'bg' ? 'Тип цена' : 'Price Type'}
              />
            </FormGroup>
          </FormGrid>

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

          <FormGroup>
            <Label>Начини на плащане</Label>
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
          </FormGroup>

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
        </FormCard>

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

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!pricing.price}
          >
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>💡 Съвети за ценообразуване</InfoTitle>
          <InfoText>
            Проверете пазарните цени за подобни превозни средства. Вземете предвид 
            състоянието, пробега и годината. Включете всички допълнителни разходи. 
            Бъдете реалистични с очакванията си. Подгответе се за договаряне на цената.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </PricingContainer>
  );
};

export default PricingPage;
