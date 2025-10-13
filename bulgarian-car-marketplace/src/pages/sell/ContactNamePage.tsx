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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const ContactMethodRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(102, 126, 234, 0.02);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
  }
`;

const ContactMethodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ContactMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-size: 1.2rem;
`;

const ContactMethodLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
`;

// ==================== CYBER TOGGLE BUTTON STYLES ====================

const CyberToggleWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 40px;
  user-select: none;
  overflow: hidden;
`;

const CyberToggleCheckbox = styled.input`
  display: none;
`;

const CyberToggleLabel = styled.label`
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const ToggleTrack = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #2c2f33;
  border-radius: 20px;
  transition: background 0.4s ease-in-out;
  box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.4);

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 38px;
    height: 34px;
    background: #fff;
    border-radius: 50%;
    transform: translateX(0);
    transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.7, 1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    background: #03e9f4;
  }

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} &::before {
    transform: translateX(37px);
  }
`;

const ToggleThumbIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: #fff;
  mask-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(38px) translateY(-50%);
    opacity: 1;
  }
`;

const ToggleThumbDots = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 
    -10px 0 0 0 #fff,
    10px 0 0 0 #fff,
    0 -10px 0 0 #fff,
    0 10px 0 0 #fff;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translate(37px, -50%);
    opacity: 0;
  }
`;

const ToggleThumbHighlight = styled.span`
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5), transparent);
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  opacity: 0;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    transform: translateX(38px) translateY(-50%);
    opacity: 1;
  }
`;

const ToggleLabels = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: space-between;
  width: 80%;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  pointer-events: none;
  color: #555;
`;

const ToggleLabelOn = styled.span`
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  color: #fff;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 1;
  }
`;

const ToggleLabelOff = styled.span`
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
  color: #fff;

  ${CyberToggleCheckbox}:checked + ${CyberToggleLabel} & {
    opacity: 0;
  }
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
    { id: 'Телефон', label: 'Телефон', icon: '📞' },
    { id: 'Имейл', label: 'Имейл', icon: '📧' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
    { id: 'Viber', label: 'Viber', icon: '📱' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️' },
    { id: 'Facebook Messenger', label: 'Facebook Messenger', icon: '💭' },
    { id: 'SMS', label: 'SMS', icon: '📨' }
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
                <ContactMethodRow key={method.id}>
                  <ContactMethodInfo>
                    <ContactMethodIcon>{method.icon}</ContactMethodIcon>
                    <ContactMethodLabel>{method.label}</ContactMethodLabel>
                  </ContactMethodInfo>

                  <CyberToggleWrapper>
                    <CyberToggleCheckbox
                      type="checkbox"
                      id={`contact-method-${method.id}`}
                      checked={contact.preferredContact.includes(method.id)}
                      onChange={() => handleContactMethodToggle(method.id)}
                    />
                    <CyberToggleLabel htmlFor={`contact-method-${method.id}`}>
                      <ToggleTrack />
                      <ToggleThumbIcon />
                      <ToggleThumbDots />
                      <ToggleThumbHighlight />
                      <ToggleLabels>
                        <ToggleLabelOn>ON</ToggleLabelOn>
                        <ToggleLabelOff>OFF</ToggleLabelOff>
                      </ToggleLabels>
                    </CyberToggleLabel>
                  </CyberToggleWrapper>
                </ContactMethodRow>
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
