import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const ContactNameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
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

const ContactNamePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contact, setContact] = useState({
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    preferredContact: [] as string[]
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
  const price = searchParams.get('price');
  const currency = searchParams.get('currency');
  const priceType = searchParams.get('priceType');
  const negotiable = searchParams.get('negotiable');
  const financing = searchParams.get('financing');
  const tradeIn = searchParams.get('tradeIn');
  const warranty = searchParams.get('warranty');
  const warrantyMonths = searchParams.get('warrantyMonths');
  const paymentMethods = searchParams.get('paymentMethods');

  const preferredContactMethods = [
    'Телефон',
    'Имейл',
    'WhatsApp',
    'Viber',
    'Telegram',
    'Facebook Messenger',
    'SMS'
  ];

  const handleInputChange = (field: string, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
  };

  const handleContactMethodToggle = (method: string) => {
    const newMethods = contact.preferredContact.includes(method)
      ? contact.preferredContact.filter(m => m !== method)
      : [...contact.preferredContact, method];
    
    setContact(prev => ({ ...prev, preferredContact: newMethods }));
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
    if (price) params.set('price', price);
    if (currency) params.set('currency', currency);
    if (priceType) params.set('priceType', priceType);
    if (negotiable) params.set('negotiable', negotiable);
    if (financing) params.set('financing', financing);
    if (tradeIn) params.set('tradeIn', tradeIn);
    if (warranty) params.set('warranty', warranty);
    if (warrantyMonths) params.set('warrantyMonths', warrantyMonths);
    if (paymentMethods) params.set('paymentMethods', paymentMethods);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/details/preis?${params.toString()}`);
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
    if (price) params.set('price', price);
    if (currency) params.set('currency', currency);
    if (priceType) params.set('priceType', priceType);
    if (negotiable) params.set('negotiable', negotiable);
    if (financing) params.set('financing', financing);
    if (tradeIn) params.set('tradeIn', tradeIn);
    if (warranty) params.set('warranty', warranty);
    if (warrantyMonths) params.set('warrantyMonths', warrantyMonths);
    if (paymentMethods) params.set('paymentMethods', paymentMethods);
    if (contact.sellerName) params.set('sellerName', contact.sellerName);
    if (contact.sellerEmail) params.set('sellerEmail', contact.sellerEmail);
    if (contact.sellerPhone) params.set('sellerPhone', contact.sellerPhone);
    if (contact.preferredContact.length > 0) {
      params.set('preferredContact', contact.preferredContact.join(','));
    }

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/kontakt/adresse?${params.toString()}`);
  };

  return (
    <ContactNameContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Контакт - Име</Title>
          <Subtitle>
            Въведете вашите контактни данни
          </Subtitle>
        </HeaderCard>

        <FormCard>
          <FormGrid>
            <FormGroup>
              <Label>Име *</Label>
              <Input
                type="text"
                value={contact.sellerName}
                onChange={(e) => handleInputChange('sellerName', e.target.value)}
                placeholder="Вашето име"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Имейл *</Label>
              <Input
                type="email"
                value={contact.sellerEmail}
                onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Телефон *</Label>
              <Input
                type="tel"
                value={contact.sellerPhone}
                onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                placeholder="+359 888 123 456"
                required
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Предпочитан начин на контакт</Label>
            <CheckboxGroup>
              {preferredContactMethods.map((method) => (
                <CheckboxItem key={method}>
                  <Checkbox
                    type="checkbox"
                    checked={contact.preferredContact.includes(method)}
                    onChange={() => handleContactMethodToggle(method)}
                  />
                  <CheckboxText>{method}</CheckboxText>
                </CheckboxItem>
              ))}
            </CheckboxGroup>
          </FormGroup>
        </FormCard>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!contact.sellerName || !contact.sellerEmail || !contact.sellerPhone}
          >
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>ℹ️ За контактните данни</InfoTitle>
          <InfoText>
            Всички полета с * са задължителни. Информацията за контакт ще бъде видима 
            за купувачите. Можете да промените тази информация по-късно. Уверете се, 
            че телефонният номер е активен. Проверете правилността на имейл адреса.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ContactNameContainer>
  );
};

export default ContactNamePage;
