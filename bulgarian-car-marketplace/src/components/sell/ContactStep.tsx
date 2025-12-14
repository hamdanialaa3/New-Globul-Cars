import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';

interface ContactStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const ContactCard = styled.div`
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

const ContactStep: React.FC<ContactStepProps> = ({ data, onDataChange }) => {
  const [contact, setContact] = useState({
    sellerName: data.sellerName || '',
    sellerEmail: data.sellerEmail || '',
    sellerPhone: data.sellerPhone || '',
    sellerType: data.sellerType || 'private',
    companyName: data.companyName || '',
    companyAddress: data.companyAddress || '',
    companyWebsite: data.companyWebsite || '',
    location: data.location || '',
    city: data.locationData?.cityName || '',
    region: data.region || '',
    postalCode: data.postalCode || '',
    preferredContact: data.preferredContact || [],
    availableHours: data.availableHours || '',
    additionalInfo: data.additionalInfo || ''
  });

  const regions = [
    'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен',
    'Сливен', 'Добрич', 'Шумен', 'Перник', 'Хасково', 'Ямбол', 'Кърджали',
    'Кюстендил', 'Ловеч', 'Монтана', 'Пазарджик', 'Разград', 'Силистра',
    'Смолян', 'Търговище', 'Габрово', 'Видин', 'Враца', 'Велико Търново'
  ];

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
    const newContact = { ...contact, [field]: value };
    setContact(newContact);
    onDataChange(newContact);
  };

  const handleContactMethodToggle = (method: string) => {
    const newMethods = contact.preferredContact.includes(method)
      ? contact.preferredContact.filter(m => m !== method)
      : [...contact.preferredContact, method];
    
    const newContact = { ...contact, preferredContact: newMethods };
    setContact(newContact);
    onDataChange(newContact);
  };

  return (
    <StepContainer>
      <ContactGrid>
        <ContactCard>
          <CardTitle>👤 Лична информация</CardTitle>
          
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
        </ContactCard>

        <ContactCard>
          <CardTitle>🏢 Фирмена информация</CardTitle>
          
          <FormGroup>
            <Label>Име на фирмата</Label>
            <Input
              type="text"
              value={contact.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Име на фирмата"
            />
          </FormGroup>

          <FormGroup>
            <Label>Адрес на фирмата</Label>
            <TextArea
              value={contact.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              placeholder="Пълен адрес на фирмата"
            />
          </FormGroup>

          <FormGroup>
            <Label>Уебсайт</Label>
            <Input
              type="url"
              value={contact.companyWebsite}
              onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
              placeholder="https://www.example.com"
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
        </ContactCard>
      </ContactGrid>

      <ContactCard>
        <CardTitle>📍 Местоположение</CardTitle>
        
        <ContactGrid>
          <FormGroup>
            <Label>Област *</Label>
            <Select
              value={contact.region}
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
              value={contact.locationData?.cityName}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Име на града"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Пощенски код</Label>
            <Input
              type="text"
              value={contact.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label>Точно местоположение</Label>
            <Input
              type="text"
              value={contact.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Улица, номер, квартал"
            />
          </FormGroup>
        </ContactGrid>
      </ContactCard>

      <ContactCard>
        <CardTitle>📝 Допълнителна информация</CardTitle>
        
        <FormGroup>
          <Label>Допълнителна информация за контакт</Label>
          <TextArea
            value={contact.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            placeholder="Допълнителна информация, която искате да споделите с купувачите..."
          />
        </FormGroup>
      </ContactCard>

      <LocationCard>
        <LocationTitle>📍 Местоположение на превозното средство</LocationTitle>
        <LocationText>
          {contact.region && contact.locationData?.cityName 
            ? `${contact.locationData?.cityName}, ${contact.region}${contact.postalCode ? `, ${contact.postalCode}` : ''}`
            : 'Моля, попълнете местоположението на превозното средство'
          }
        </LocationText>
      </LocationCard>

      <InfoCard>
        <InfoTitle>ℹ️ Важна информация за контакт</InfoTitle>
        <InfoText>
          • Всички полета с * са задължителни<br/>
          • Информацията за контакт ще бъде видима за купувачите<br/>
          • Можете да промените тази информация по-късно<br/>
          • Уверете се, че телефонният номер е активен<br/>
          • Проверете правилността на имейл адреса
        </InfoText>
      </InfoCard>
    </StepContainer>
  );
};

export default ContactStep;
