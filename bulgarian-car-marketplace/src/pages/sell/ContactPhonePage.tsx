import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const ContactPhoneContainer = styled.div`
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

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
`;

const SummaryText = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const ContactPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contact, setContact] = useState({
    additionalPhone: '',
    availableHours: '',
    additionalInfo: ''
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
  const sellerName = searchParams.get('sellerName');
  const sellerEmail = searchParams.get('sellerEmail');
  const sellerPhone = searchParams.get('sellerPhone');
  const preferredContact = searchParams.get('preferredContact');
  const location = searchParams.get('location');
  const city = searchParams.get('city');
  const region = searchParams.get('region');
  const postalCode = searchParams.get('postalCode');

  const handleInputChange = (field: string, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
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
    if (sellerName) params.set('sellerName', sellerName);
    if (sellerEmail) params.set('sellerEmail', sellerEmail);
    if (sellerPhone) params.set('sellerPhone', sellerPhone);
    if (preferredContact) params.set('preferredContact', preferredContact);
    if (location) params.set('location', location);
    if (city) params.set('city', city);
    if (region) params.set('region', region);
    if (postalCode) params.set('postalCode', postalCode);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/kontakt/adresse?${params.toString()}`);
  };

  const handleFinish = () => {
    // Here you would typically save all the data to Firebase
    // For now, we'll just show a success message
    alert('Обявата е създадена успешно!');
    
    // Redirect to the main page or dashboard
    navigate('/');
  };

  return (
    <ContactPhoneContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Контакт - Телефон</Title>
          <Subtitle>
            Допълнителна информация за контакт
          </Subtitle>
        </HeaderCard>

        <FormCard>
          <FormGrid>
            <FormGroup>
              <Label>Допълнителен телефон</Label>
              <Input
                type="tel"
                value={contact.additionalPhone}
                onChange={(e) => handleInputChange('additionalPhone', e.target.value)}
                placeholder="+359 888 123 456"
              />
            </FormGroup>

            <FormGroup>
              <Label>Работно време</Label>
              <Input
                type="text"
                value={contact.availableHours}
                onChange={(e) => handleInputChange('availableHours', e.target.value)}
                placeholder="Понеделник - Петък: 9:00 - 18:00"
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Допълнителна информация за контакт</Label>
            <TextArea
              value={contact.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Допълнителна информация, която искате да споделите с купувачите..."
            />
          </FormGroup>
        </FormCard>

        <SummaryCard>
          <SummaryTitle>📋 Резюме на обявата</SummaryTitle>
          <SummaryText>
            <strong>Превозно средство:</strong> {make} {model} ({year})<br/>
            <strong>Пробег:</strong> {mileage} км<br/>
            <strong>Цена:</strong> {price} {currency}<br/>
            <strong>Продавач:</strong> {sellerName}<br/>
            <strong>Местоположение:</strong> {city}, {region}
          </SummaryText>
        </SummaryCard>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button variant="primary" onClick={handleFinish}>
            Завърши →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>ℹ️ За контактната информация</InfoTitle>
          <InfoText>
            Допълнителната контактна информация е по желание. Тя може да помогне 
            на купувачите да се свържат с вас по-лесно. Можете да промените тази 
            информация по-късно от вашия профил.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ContactPhoneContainer>
  );
};

export default ContactPhonePage;
