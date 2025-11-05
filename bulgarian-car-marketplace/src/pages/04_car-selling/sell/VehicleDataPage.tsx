import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import SelectWithOther from '@/components/shared/SelectWithOther';
import { 
  CAR_BRANDS, 
  CAR_YEARS, 
  FUEL_TYPES, 
  TRANSMISSION_TYPES, 
  CAR_COLORS, 
  DOOR_COUNTS, 
  SEAT_COUNTS 
} from '@/data/dropdown-options';
import { useLanguage } from '@/contexts/LanguageContext';

const VehicleDataContainer = styled.div`
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
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: #667eea;
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

const VehicleDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    power: '',
    engineSize: '',
    color: '',
    doors: '',
    seats: '',
    previousOwners: '',
    accidentHistory: false,
    serviceHistory: false,
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

  // Initialize form with URL parameters
  useEffect(() => {
    if (make) setFormData(prev => ({ ...prev, make }));
    if (model) setFormData(prev => ({ ...prev, model }));
    if (year) setFormData(prev => ({ ...prev, year }));
    if (mileage) setFormData(prev => ({ ...prev, mileage }));
    if (fuelType) setFormData(prev => ({ ...prev, fuelType }));
  }, [make, model, year, mileage, fuelType]);

  const makes = [
    'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Opel', 'Ford', 'Peugeot', 
    'Renault', 'Citroën', 'Fiat', 'Toyota', 'Honda', 'Nissan', 'Hyundai', 
    'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Skoda', 'Seat', 
    'Alfa Romeo', 'Lancia', 'Ferrari', 'Lamborghini', 'Porsche', 'Jaguar', 
    'Land Rover', 'Mini', 'Smart', 'Dacia', 'Lada', 'UAZ', 'GAZ', 'Other'
  ];

  const fuelTypes = [
    'Бензин', 'Дизел', 'Хибрид', 'Електрически', 'Газ (LPG)', 'Газ (CNG)', 'Етанол'
  ];

  const transmissions = [
    'Ръчна', 'Автоматична', 'Полуавтоматична', 'CVT', 'DSG'
  ];

  const colors = [
    'Бял', 'Черен', 'Сребърен', 'Сив', 'Червен', 'Син', 'Зелен', 'Жълт', 
    'Оранжев', 'Кафяв', 'Бежов', 'Розов', 'Виолетов', 'Друг'
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/verkaeufertyp?${params.toString()}`);
  };

  const handleContinue = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (formData.make) params.set('mk', formData.make);
    if (formData.model) params.set('md', formData.model);
    if (formData.fuelType) params.set('fm', formData.fuelType);
    if (formData.year) params.set('fy', formData.year);
    if (formData.mileage) params.set('mi', formData.mileage);
    if (condition) params.set('i', condition);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/ausstattung?${params.toString()}`);
  };

  return (
    <VehicleDataContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Данни за превозното средство</Title>
          <Subtitle>
            Основна информация за превозното средство
          </Subtitle>
        </HeaderCard>

        <FormCard>
          <FormGrid>
            <FormGroup>
              <Label>Марка *</Label>
              <SelectWithOther
                options={CAR_BRANDS}
                value={formData.make}
                onChange={(value) => handleInputChange('make', value)}
                placeholder={language === 'bg' ? 'Изберете марка' : 'Select make'}
                label={language === 'bg' ? 'Марка' : 'Make'}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Модел *</Label>
              <Input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Например: X3, A4, Golf"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Година на производство *</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                placeholder="2020"
                min="1990"
                max="2024"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Пробег (км) *</Label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                placeholder="50000"
                min="0"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Тип гориво *</Label>
              <SelectWithOther
                options={FUEL_TYPES}
                value={formData.fuelType}
                onChange={(value) => handleInputChange('fuelType', value)}
                placeholder={language === 'bg' ? 'Изберете тип гориво' : 'Select fuel type'}
                label={language === 'bg' ? 'Тип гориво' : 'Fuel Type'}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Скоростна кутия *</Label>
              <SelectWithOther
                options={TRANSMISSION_TYPES}
                value={formData.transmission}
                onChange={(value) => handleInputChange('transmission', value)}
                placeholder={language === 'bg' ? 'Изберете скоростна кутия' : 'Select transmission'}
                label={language === 'bg' ? 'Скоростна кутия' : 'Transmission'}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Мощност (к.с.)</Label>
              <Input
                type="number"
                value={formData.power}
                onChange={(e) => handleInputChange('power', parseInt(e.target.value))}
                placeholder="150"
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Обем на двигателя (л)</Label>
              <Input
                type="number"
                value={formData.engineSize}
                onChange={(e) => handleInputChange('engineSize', parseFloat(e.target.value))}
                placeholder="2.0"
                step="0.1"
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Цвят</Label>
              <SelectWithOther
                options={CAR_COLORS}
                value={formData.color}
                onChange={(value) => handleInputChange('color', value)}
                placeholder={language === 'bg' ? 'Изберете цвят' : 'Select color'}
                label={language === 'bg' ? 'Цвят' : 'Color'}
              />
            </FormGroup>

            <FormGroup>
              <Label>Брой врати</Label>
              <SelectWithOther
                options={DOOR_COUNTS}
                value={formData.doors}
                onChange={(value) => handleInputChange('doors', value)}
                placeholder={language === 'bg' ? 'Изберете брой врати' : 'Select door count'}
                label={language === 'bg' ? 'Брой врати' : 'Door Count'}
              />
            </FormGroup>

            <FormGroup>
              <Label>Брой места</Label>
              <SelectWithOther
                options={SEAT_COUNTS}
                value={formData.seats}
                onChange={(value) => handleInputChange('seats', value)}
                placeholder={language === 'bg' ? 'Изберете брой места' : 'Select seat count'}
                label={language === 'bg' ? 'Брой места' : 'Seat Count'}
              />
            </FormGroup>

            <FormGroup>
              <Label>Предишни собственици</Label>
              <Select
                value={formData.previousOwners}
                onChange={(e) => handleInputChange('previousOwners', e.target.value)}
              >
                <option value="">Изберете брой собственици</option>
                <option value="1">1 (първи собственик)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Допълнителна информация</Label>
            <CheckboxGroup>
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  checked={formData.accidentHistory}
                  onChange={(e) => handleInputChange('accidentHistory', e.target.checked)}
                />
                <span>Има история на катастрофи</span>
              </CheckboxItem>
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  checked={formData.serviceHistory}
                  onChange={(e) => handleInputChange('serviceHistory', e.target.checked)}
                />
                <span>Има сервизна история</span>
              </CheckboxItem>
            </CheckboxGroup>
          </FormGroup>

          <FormGroup>
            <Label>Описание</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Опишете превозното средство, неговите особености и състояние..."
            />
          </FormGroup>
        </FormCard>

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!formData.make || !formData.model || !formData.year || !formData.mileage}
          >
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>💡 Съвет за по-добра обява</InfoTitle>
          <InfoText>
            Бъдете точни и честни при попълването на данните. Това ще ви помогне 
            да намерите сериозни купувачи по-бързо и ще изгради доверие.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </VehicleDataContainer>
  );
};

export default VehicleDataPage;
