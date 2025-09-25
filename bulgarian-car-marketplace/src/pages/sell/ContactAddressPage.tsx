import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const ContactAddressContainer = styled.div`
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

const LocationCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const LocationTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
`;

const LocationText = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const ContactAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [address, setAddress] = useState({
    location: '',
    city: '',
    region: '',
    postalCode: ''
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

  const regions = [
    'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен',
    'Сливен', 'Добрич', 'Шумен', 'Перник', 'Хасково', 'Ямбол', 'Кърджали',
    'Кюстендил', 'Ловеч', 'Монтана', 'Пазарджик', 'Разград', 'Силистра',
    'Смолян', 'Търговище', 'Габрово', 'Видин', 'Враца', 'Велико Търново'
  ];

  const handleInputChange = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
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

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/kontakt/name?${params.toString()}`);
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
    if (sellerName) params.set('sellerName', sellerName);
    if (sellerEmail) params.set('sellerEmail', sellerEmail);
    if (sellerPhone) params.set('sellerPhone', sellerPhone);
    if (preferredContact) params.set('preferredContact', preferredContact);
    if (address.location) params.set('location', address.location);
    if (address.city) params.set('city', address.city);
    if (address.region) params.set('region', address.region);
    if (address.postalCode) params.set('postalCode', address.postalCode);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/kontakt/telefonnummer?${params.toString()}`);
  };

  return (
    <ContactAddressContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Контакт - Адрес</Title>
          <Subtitle>
            Въведете адреса на превозното средство
          </Subtitle>
        </HeaderCard>

        <FormCard>
          <FormGrid>
            <FormGroup>
              <Label>Област *</Label>
              <Select
                value={address.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                required
              >
                <option value="">Изберете област</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Град *</Label>
              <Input
                type="text"
                value={address.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Име на града"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Пощенски код</Label>
              <Input
                type="text"
                value={address.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="1000"
              />
            </FormGroup>

            <FormGroup>
              <Label>Точно местоположение</Label>
              <Input
                type="text"
                value={address.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Улица, номер, квартал"
              />
            </FormGroup>
          </FormGrid>
        </FormCard>

        {address.region && address.city && (
          <LocationCard>
            <LocationTitle>📍 Местоположение на превозното средство</LocationTitle>
            <LocationText>
              {address.city}, {address.region}{address.postalCode ? `, ${address.postalCode}` : ''}
            </LocationText>
          </LocationCard>
        )}

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!address.region || !address.city}
          >
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>ℹ️ За адреса</InfoTitle>
          <InfoText>
            Адресът на превозното средство е важен за купувачите, за да могат 
            да го видят лично. Всички полета с * са задължителни. Можете да 
            промените тази информация по-късно.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ContactAddressContainer>
  );
};

export default ContactAddressPage;
