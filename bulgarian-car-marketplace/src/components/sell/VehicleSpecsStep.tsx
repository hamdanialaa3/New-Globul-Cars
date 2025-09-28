import React, { useState } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';

interface VehicleSpecsStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const SpecSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h3`
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
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
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
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
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

const InfoCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
`;

const InfoText = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const VehicleSpecsStep: React.FC<VehicleSpecsStepProps> = ({ data, onDataChange }) => {
  const [specs, setSpecs] = useState({
    engineType: data.engineType || '',
    driveType: data.driveType || '',
    fuelConsumption: data.fuelConsumption || '',
    co2Emissions: data.co2Emissions || '',
    euroStandard: data.euroStandard || '',
    weight: data.weight || '',
    maxWeight: data.maxWeight || '',
    length: data.length || '',
    width: data.width || '',
    height: data.height || '',
    wheelbase: data.wheelbase || '',
    groundClearance: data.groundClearance || '',
    trunkVolume: data.trunkVolume || '',
    fuelTankCapacity: data.fuelTankCapacity || '',
    acceleration: data.acceleration || '',
    topSpeed: data.topSpeed || '',
    features: data.features || []
  });

  const engineTypes = [
    'Бензинов', 'Дизелов', 'Хибриден', 'Електрически', 'Газ (LPG)', 'Газ (CNG)', 'Етанол'
  ];

  const driveTypes = [
    'Предно задвижване', 'Задно задвижване', '4WD (Постоянен)', '4WD (Подключаем)', 'AWD'
  ];

  const euroStandards = [
    'Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d'
  ];

  const availableFeatures = [
    'ABS', 'ESP', 'Airbag', 'Климатик', 'Кожен салон', 'Кожен волан',
    'Ел. стъкла', 'Ел. огледала', 'Централно заключване', 'Аларма',
    'Навигация', 'Bluetooth', 'USB', 'AUX', 'CD Player', 'Radio',
    'Круиз контрол', 'Парктроник', 'Камера за заден ход', 'Слънчев покрив',
    'Ксенонови фарове', 'LED фарове', 'LED дневни светлини', 'LED задни светлини',
    'Спортни седалки', 'Спортни колела', 'Спортна окачване', 'Спортна спирачки',
    'Турбо', 'Компресор', 'Интеркулер', 'Катализатор', 'DPF', 'EGR',
    'Старт-стоп система', 'Регенеративно спиране', 'Еко режим', 'Спорт режим'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    const newSpecs = { ...specs, [field]: value };
    setSpecs(newSpecs);
    const numericFields = ['fuelConsumption','co2Emissions','weight','maxWeight','length','width','height','wheelbase','groundClearance','trunkVolume','fuelTankCapacity','acceleration','topSpeed'];
    const update: Partial<CarListing> = {};
    Object.keys(newSpecs).forEach(k => {
      const key = k as keyof typeof newSpecs;
      const val = (newSpecs as any)[key];
      if (numericFields.includes(key)) {
        if (val === '' || val === undefined) return; // skip empty
        const num = typeof val === 'number' ? val : parseFloat(val);
        if (!isNaN(num)) (update as any)[key] = num;
      } else {
        (update as any)[key] = val;
      }
    });
    onDataChange(update);
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = specs.features.includes(feature)
      ? specs.features.filter(f => f !== feature)
      : [...specs.features, feature];
    
    const newSpecs = { ...specs, features: newFeatures };
    setSpecs(newSpecs);
    onDataChange({ features: newFeatures });
  };

  return (
    <StepContainer>
      <SpecsGrid>
        <SpecSection>
          <SectionTitle>🔧 Двигател и задвижване</SectionTitle>
          
          <FormGroup>
            <Label>Тип двигател</Label>
            <Select
              value={specs.engineType}
              onChange={(e) => handleInputChange('engineType', e.target.value)}
            >
              <option value="">Изберете тип двигател</option>
              {engineTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Тип задвижване</Label>
            <Select
              value={specs.driveType}
              onChange={(e) => handleInputChange('driveType', e.target.value)}
            >
              <option value="">Изберете тип задвижване</option>
              {driveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Разход на гориво (л/100км)</Label>
            <Input
              type="number"
              value={specs.fuelConsumption}
              onChange={(e) => handleInputChange('fuelConsumption', parseFloat(e.target.value))}
              placeholder="7.5"
              step="0.1"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>CO2 емисии (г/км)</Label>
            <Input
              type="number"
              value={specs.co2Emissions}
              onChange={(e) => handleInputChange('co2Emissions', parseInt(e.target.value))}
              placeholder="120"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Евро стандарт</Label>
            <Select
              value={specs.euroStandard}
              onChange={(e) => handleInputChange('euroStandard', e.target.value)}
            >
              <option value="">Изберете евро стандарт</option>
              {euroStandards.map(standard => (
                <option key={standard} value={standard}>{standard}</option>
              ))}
            </Select>
          </FormGroup>
        </SpecSection>

        <SpecSection>
          <SectionTitle>📏 Размери и тегло</SectionTitle>
          
          <FormGroup>
            <Label>Тегло (кг)</Label>
            <Input
              type="number"
              value={specs.weight}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
              placeholder="1500"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Максимално тегло (кг)</Label>
            <Input
              type="number"
              value={specs.maxWeight}
              onChange={(e) => handleInputChange('maxWeight', parseInt(e.target.value))}
              placeholder="2000"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Дължина (мм)</Label>
            <Input
              type="number"
              value={specs.length}
              onChange={(e) => handleInputChange('length', parseInt(e.target.value))}
              placeholder="4500"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Ширина (мм)</Label>
            <Input
              type="number"
              value={specs.width}
              onChange={(e) => handleInputChange('width', parseInt(e.target.value))}
              placeholder="1800"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Височина (мм)</Label>
            <Input
              type="number"
              value={specs.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
              placeholder="1500"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Междуосие (мм)</Label>
            <Input
              type="number"
              value={specs.wheelbase}
              onChange={(e) => handleInputChange('wheelbase', parseInt(e.target.value))}
              placeholder="2700"
              min="0"
            />
          </FormGroup>
        </SpecSection>

        <SpecSection>
          <SectionTitle>⚡ Производителност</SectionTitle>
          
          <FormGroup>
            <Label>Ускорение 0-100 км/ч (сек)</Label>
            <Input
              type="number"
              value={specs.acceleration}
              onChange={(e) => handleInputChange('acceleration', parseFloat(e.target.value))}
              placeholder="8.5"
              step="0.1"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Максимална скорост (км/ч)</Label>
            <Input
              type="number"
              value={specs.topSpeed}
              onChange={(e) => handleInputChange('topSpeed', parseInt(e.target.value))}
              placeholder="200"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Обем на багажника (л)</Label>
            <Input
              type="number"
              value={specs.trunkVolume}
              onChange={(e) => handleInputChange('trunkVolume', parseInt(e.target.value))}
              placeholder="500"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Капацитет на резервоара (л)</Label>
            <Input
              type="number"
              value={specs.fuelTankCapacity}
              onChange={(e) => handleInputChange('fuelTankCapacity', parseInt(e.target.value))}
              placeholder="60"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Клиренс (мм)</Label>
            <Input
              type="number"
              value={specs.groundClearance}
              onChange={(e) => handleInputChange('groundClearance', parseInt(e.target.value))}
              placeholder="150"
              min="0"
            />
          </FormGroup>
        </SpecSection>
      </SpecsGrid>

      <SpecSection>
        <SectionTitle>🎛️ Оборудване и функции</SectionTitle>
        <CheckboxGroup>
          {availableFeatures.map((feature) => (
            <CheckboxItem key={feature}>
              <Checkbox
                type="checkbox"
                checked={specs.features.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
              />
              <CheckboxText>{feature}</CheckboxText>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </SpecSection>

      <InfoCard>
        <InfoTitle>💡 Съвет за техническите характеристики</InfoTitle>
        <InfoText>
          Точните технически характеристики помагат на купувачите да направят информиран избор. 
          Ако не сте сигурни за някои данни, можете да ги пропуснете или да се консултирате 
          с техническата документация на превозното средство.
        </InfoText>
      </InfoCard>
    </StepContainer>
  );
};

export default VehicleSpecsStep;
