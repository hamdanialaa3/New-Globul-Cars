import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CarListing } from '../../types/CarListing';
import { getAllMakes, getModelsByMake } from '@/data/car-makes-models';

interface VehicleDataStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
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

const VehicleDataStep: React.FC<VehicleDataStepProps> = ({ data, onDataChange }) => {
  const [formData, setFormData] = useState({
    make: data.make || '',
    model: data.model || '',
    year: data.year || '',
    mileage: data.mileage || '',
    fuelType: data.fuelType || '',
    transmission: data.transmission || '',
    power: data.power || '',
    engineSize: data.engineSize || '',
    color: data.color || '',
    doors: data.doors || '',
    seats: data.seats || '',
    previousOwners: data.previousOwners || '',
    accidentHistory: data.accidentHistory || false,
    serviceHistory: data.serviceHistory || false,
    description: data.description || ''
  });

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // Load models when make changes
  useEffect(() => {
    if (formData.make) {
      const models = getModelsByMake(formData.make);
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }
  }, [formData.make]);

  const makes = getAllMakes();

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
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Convert string numbers to actual numbers for specific fields
    const processedData: Partial<CarListing> = {
      make: newData.make,
      model: newData.model,
      year: field === 'year' ? (typeof value === 'string' ? parseInt(value) || 0 : value as number) : (typeof newData.year === 'string' ? parseInt(newData.year) || 0 : newData.year),
      mileage: field === 'mileage' ? (typeof value === 'string' ? parseInt(value) || 0 : value as number) : (typeof newData.mileage === 'string' ? parseInt(newData.mileage) || 0 : newData.mileage),
      fuelType: newData.fuelType,
      transmission: newData.transmission,
      power: field === 'power' ? (typeof value === 'string' ? parseInt(value) || 0 : value as number) : (typeof newData.power === 'string' ? parseInt(newData.power) || 0 : newData.power),
      engineSize: field === 'engineSize' ? (typeof value === 'string' ? parseFloat(value) || 0 : value as number) : (typeof newData.engineSize === 'string' ? parseFloat(newData.engineSize) || 0 : newData.engineSize),
      color: newData.color,
      doors: newData.doors,
      seats: newData.seats,
      previousOwners: newData.previousOwners,
      accidentHistory: newData.accidentHistory,
      serviceHistory: newData.serviceHistory,
      description: newData.description
    };
    
    onDataChange(processedData);
  };

  return (
    <StepContainer>
      <FormGrid>
        <FormGroup>
          <Label>Марка *</Label>
          <Select
            value={formData.make}
            onChange={(e) => handleInputChange('make', e.target.value)}
            required
          >
            <option value="">Изберете марка</option>
            {makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Модел *</Label>
          {availableModels.length > 0 ? (
            <Select
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              disabled={!formData.make}
              required
            >
              <option value="">
                {!formData.make ? 'Първо изберете марка' : 'Изберете модел'}
              </option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
              <option value="Other">Друго</option>
            </Select>
          ) : (
            <Input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder={formData.make ? "Въведете модел" : "Първо изберете марка"}
              disabled={!formData.make}
              required
            />
          )}
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
          <Select
            value={formData.fuelType}
            onChange={(e) => handleInputChange('fuelType', e.target.value)}
            required
          >
            <option value="">Изберете тип гориво</option>
            {fuelTypes.map(fuel => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Скоростна кутия *</Label>
          <Select
            value={formData.transmission}
            onChange={(e) => handleInputChange('transmission', e.target.value)}
            required
          >
            <option value="">Изберете скоростна кутия</option>
            {transmissions.map(trans => (
              <option key={trans} value={trans}>{trans}</option>
            ))}
          </Select>
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
          <Select
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
          >
            <option value="">Изберете цвят</option>
            {colors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Брой врати</Label>
          <Select
            value={formData.doors}
            onChange={(e) => handleInputChange('doors', e.target.value)}
          >
            <option value="">Изберете брой врати</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Брой места</Label>
          <Select
            value={formData.seats}
            onChange={(e) => handleInputChange('seats', e.target.value)}
          >
            <option value="">Изберете брой места</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </Select>
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

      <InfoCard>
        <InfoTitle>💡 Съвет за по-добра обява</InfoTitle>
        <InfoText>
          Бъдете точни и честни при попълването на данните. Това ще ви помогне 
          да намерите сериозни купувачи по-бързо и ще изгради доверие.
        </InfoText>
      </InfoCard>
    </StepContainer>
  );
};

export default VehicleDataStep;
