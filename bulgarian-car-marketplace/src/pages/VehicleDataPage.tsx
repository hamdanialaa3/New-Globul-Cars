import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, Wrench } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  padding: 20px;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: #ffd700;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
`;

const StepIndicator = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Step = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  ${props => props.completed && `
    background: #ffd700;
    color: #1a1a2e;
  `}
  
  ${props => props.active && !props.completed && `
    background: rgba(255, 215, 0, 0.2);
    border: 2px solid #ffd700;
    color: #ffd700;
  `}
  
  ${props => !props.active && !props.completed && `
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  `}
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  color: #ffffff;
  font-size: 1rem;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  color: #ffffff;
  font-size: 1rem;

  option {
    background: #1a1a2e;
    color: #ffffff;
  }

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
  }
`;

const ContinueButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'linear-gradient(135deg, #ffd700, #ffed4a)'};
  color: ${props => props.disabled ? '#94a3b8' : '#1a1a2e'};
  border: none;
  padding: 18px 40px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: block;
  margin: 40px auto 0;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
  }
`;

interface VehicleData {
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  engineSize: string;
  power: string;
  doors: string;
  seats: string;
  color: string;
  condition: string;
  previousOwners: string;
}

const VehicleDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const brand = searchParams.get('brand') || '';
  const seller = searchParams.get('seller') || '';

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    engineSize: '',
    power: '',
    doors: '',
    seats: '',
    color: '',
    condition: '',
    previousOwners: ''
  });

  const handleInputChange = (field: keyof VehicleData, value: string) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return Object.values(vehicleData).every(value => value.trim() !== '');
  };

  const handleContinue = () => {
    if (isFormValid()) {
      const params = new URLSearchParams({
        brand,
        seller,
        ...vehicleData
      });
      navigate(`/sell/equipment?${params.toString()}`);
    }
  };

  const handleBack = () => {
    navigate(`/sell/seller-type?brand=${brand}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </BackButton>
          <Title>Данни за {brand}</Title>
        </Header>

        <StepIndicator>
          <Step completed>1</Step>
          <Step completed>2</Step>
          <Step active>3</Step>
          <Step>4</Step>
          <Step>5</Step>
          <Step>6</Step>
          <Step>7</Step>
        </StepIndicator>

        <FormSection>
          <SectionTitle>
            <Settings size={24} />
            Основни Данни
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Модел</Label>
              <Input
                type="text"
                placeholder="напр. A4, Golf, C-Class"
                value={vehicleData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Година на производство</Label>
              <Select
                value={vehicleData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              >
                <option value="">Избери година</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Пробег (км)</Label>
              <Input
                type="number"
                placeholder="150000"
                value={vehicleData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Гориво</Label>
              <Select
                value={vehicleData.fuelType}
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
              >
                <option value="">Избери гориво</option>
                <option value="petrol">Бензин</option>
                <option value="diesel">Дизел</option>
                <option value="hybrid">Хибрид</option>
                <option value="electric">Електрически</option>
                <option value="lpg">LPG</option>
                <option value="cng">CNG</option>
              </Select>
            </FormGroup>
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <Wrench size={24} />
            Технически Данни
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Скоростна кутия</Label>
              <Select
                value={vehicleData.transmission}
                onChange={(e) => handleInputChange('transmission', e.target.value)}
              >
                <option value="">Избери скоростна кутия</option>
                <option value="manual">Ръчна</option>
                <option value="automatic">Автоматична</option>
                <option value="semi-automatic">Полуавтоматична</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Обем на двигателя (л)</Label>
              <Input
                type="text"
                placeholder="2.0"
                value={vehicleData.engineSize}
                onChange={(e) => handleInputChange('engineSize', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Мощност (к.с.)</Label>
              <Input
                type="number"
                placeholder="150"
                value={vehicleData.power}
                onChange={(e) => handleInputChange('power', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Врати</Label>
              <Select
                value={vehicleData.doors}
                onChange={(e) => handleInputChange('doors', e.target.value)}
              >
                <option value="">Брой врати</option>
                <option value="2">2/3 врати</option>
                <option value="4">4/5 врати</option>
              </Select>
            </FormGroup>
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <Fuel size={24} />
            Състояние и Цвят
          </SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Места</Label>
              <Select
                value={vehicleData.seats}
                onChange={(e) => handleInputChange('seats', e.target.value)}
              >
                <option value="">Брой места</option>
                <option value="2">2 места</option>
                <option value="4">4 места</option>
                <option value="5">5 места</option>
                <option value="7">7 места</option>
                <option value="8+">8+ места</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Цвят</Label>
              <Select
                value={vehicleData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              >
                <option value="">Избери цвят</option>
                <option value="black">Черен</option>
                <option value="white">Бял</option>
                <option value="silver">Сребрист</option>
                <option value="gray">Сив</option>
                <option value="red">Червен</option>
                <option value="blue">Син</option>
                <option value="green">Зелен</option>
                <option value="brown">Кафяв</option>
                <option value="other">Друг</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Състояние</Label>
              <Select
                value={vehicleData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
              >
                <option value="">Избери състояние</option>
                <option value="new">Нов</option>
                <option value="excellent">Отлично</option>
                <option value="very-good">Много добро</option>
                <option value="good">Добро</option>
                <option value="fair">Задоволително</option>
                <option value="project">За ремонт</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Предишни собственици</Label>
              <Select
                value={vehicleData.previousOwners}
                onChange={(e) => handleInputChange('previousOwners', e.target.value)}
              >
                <option value="">Брой собственици</option>
                <option value="1">1 собственик</option>
                <option value="2">2 собственика</option>
                <option value="3">3 собственика</option>
                <option value="4+">4+ собственика</option>
              </Select>
            </FormGroup>
          </FormGrid>
        </FormSection>

        <ContinueButton
          disabled={!isFormValid()}
          onClick={handleContinue}
        >
          Продължи към Оборудване
        </ContinueButton>
      </Content>
    </Container>
  );
};

export default VehicleDataPage;