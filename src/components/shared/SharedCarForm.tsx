// SharedCarForm.tsx - ???? ????? ??????? ??????? (??? + ???)
// Mobile.de inspired design with Bulgarian localization

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../locales/useTranslation';
import { BULGARIAN_CITIES } from '../../constants/bulgarianCities';

// Mobile.de color system - exact colors
const colors = {
  primary: {
    orange: '#FF7900',
    blue: '#0066CC',
    darkBlue: '#003D79'
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    grayBorder: '#D0D7DE',
    grayText: '#656D76'
  },
  text: {
    primary: '#24292F',
    secondary: '#656D76'
  },
  status: {
    success: '#10B981',
    error: '#EF4444'
  }
};

// SharedCarData interface - covers both search and listing scenarios
export interface SharedCarData {
  // Basic Vehicle Information
  make: string;
  model: string;
  vehicleType: string;
  condition: string;
  firstRegistrationYear: string;
  mileage: string;
  
  // Price Information
  price: string;
  currency: string;
  vatReclaimable: boolean;
  paymentType: string;
  
  // Technical Specifications
  fuelType: string;
  transmission: string;
  power: string;
  engineSize: string;
  driveType: string;
  fuelConsumption: string;
  emissionClass: string;
  
  // Physical Attributes
  exteriorColor: string;
  interiorColor: string;
  doors: string;
  seats: string;
  
  // Equipment & Features
  airConditioning: string;
  parkingSensors: string[];
  extras: string[];
  
  // Location & Contact
  location: string;
  contactPhone: string;
  contactEmail: string;
  
  // Additional Options
  warranty: boolean;
  serviceHistory: boolean;
  nonSmokerVehicle: boolean;
  
  // Images (for listing mode)
  images?: File[];
  mainImage?: File;
}

// Styled Components - Mobile.de exact styling
const FormContainer = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden;
`;

const SectionCard = styled.div`
  border-bottom: 1px solid ${colors.neutral.grayBorder};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${props => props.isOpen ? colors.neutral.lightGray : colors.neutral.white};
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: ${props => props.isOpen ? `1px solid ${colors.neutral.grayBorder}` : 'none'};

  &:hover {
    background: ${colors.neutral.lightGray};
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.text.primary};
  margin: 0;
  padding: 0;
  border: none;
`;

const ExpandIcon = styled.span<{ isOpen: boolean }>`
  font-size: 14px;
  color: ${colors.text.secondary};
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  &::before {
    content: '▼';
  }
`;

const SectionContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  padding: 20px;
  background: ${colors.neutral.white};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text.primary};
  margin-bottom: 4px;
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  transition: border-color 0.2s ease;
  height: 44px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.blue};
  }

  &:hover {
    border-color: ${colors.primary.blue};
  }
`;

const SearchSelect = styled.select`
  padding: 12px 16px;
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  cursor: pointer;
  transition: border-color 0.2s ease;
  height: 44px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  option {
    background: ${colors.neutral.white};
    color: ${colors.text.primary};
    padding: 8px 16px;
    font-size: 14px;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.blue};
  }

  &:hover {
    border-color: ${colors.primary.blue};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${colors.text.primary};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;

  &:hover {
    background: rgba(0, 102, 204, 0.05);
  }

  input[type="checkbox"] {
    display: none;
  }
`;

const CustomCheckbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? colors.status.success : 'rgba(239, 68, 68, 0.3)'};
  background: ${props => props.checked ? colors.status.success : 'rgba(239, 68, 68, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;

  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
    opacity: ${props => props.checked ? 1 : 0};
    transform: ${props => props.checked ? 'scale(1)' : 'scale(0.3)'};
    transition: all 0.2s ease;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const RangeGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;

  span {
    color: ${colors.text.secondary};
    font-size: 14px;
    white-space: nowrap;
    padding: 0 4px;
  }

  input {
    flex: 1;
  }
`;

// File upload styling for listing mode
const ImageUploadArea = styled.div`
  border: 2px dashed ${colors.neutral.grayBorder};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: ${colors.neutral.lightGray};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primary.blue};
    background: rgba(0, 102, 204, 0.05);
  }

  input[type="file"] {
    display: none;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const PreviewImage = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${colors.neutral.grayBorder};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: ${colors.status.error};
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Progress notification for listing completion
const ProgressNotification = styled.div<{ progress: number }>`
  background: linear-gradient(135deg, ${colors.primary.orange}, ${colors.primary.blue});
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: rgba(255, 255, 255, 0.2);
    transition: width 0.3s ease;
  }

  .progress-text {
    position: relative;
    z-index: 2;
    font-weight: 500;
  }

  .progress-subtitle {
    position: relative;
    z-index: 2;
    font-size: 12px;
    opacity: 0.9;
    margin-top: 4px;
  }
`;

// Component Props
interface SharedCarFormProps {
  mode: 'search' | 'listing'; // Determines if it's for search or listing
  data: SharedCarData;
  onDataChange: (data: SharedCarData) => void;
  onSubmit: (data: SharedCarData) => void;
  loading?: boolean;
  className?: string;
}

const SharedCarForm: React.FC<SharedCarFormProps> = ({
  mode,
  data,
  onDataChange,
  onSubmit,
  loading = false,
  className
}) => {
  const { t } = useTranslation();
  const previewUrlsRef = useRef<Map<number, string>>(new Map());

  // Cleanup preview URLs
  useEffect(() => {
    if (!data.images) return;
    
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
    
    data.images.forEach((image, index) => {
      const url = URL.createObjectURL(image);
      previewUrlsRef.current.set(index, url);
    });
    
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, [data.images]);
  
  // Section visibility state
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    basic: true,
    technical: false,
    equipment: false,
    contact: mode === 'listing', // Open by default for listing mode
    images: mode === 'listing'
  });

  // Toggle section visibility
  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Handle input changes
  const handleInputChange = (field: keyof SharedCarData, value: string | boolean) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  // Handle checkbox toggles for array fields
  const handleCheckboxToggle = (fieldName: keyof SharedCarData, value: string) => {
    const currentArray = data[fieldName] as string[];
    const isChecked = currentArray.includes(value);
    
    if (isChecked) {
      handleInputChange(fieldName, currentArray.filter((item: any) => item !== value) as any);
    } else {
      handleInputChange(fieldName, [...currentArray, value] as any);
    }
  };

  // Calculate completion progress for listing mode
  const getCompletionProgress = (): number => {
    if (mode !== 'listing') return 100;
    
    const requiredFields = ['make', 'model', 'price', 'mileage', 'fuelType'];
    const optionalFields = ['transmission', 'power', 'exteriorColor', 'contactPhone'];
    
    const requiredFilled = requiredFields.filter(field => 
      data[field as keyof SharedCarData] && 
      String(data[field as keyof SharedCarData]).length > 0
    ).length;
    
    const optionalFilled = optionalFields.filter(field => 
      data[field as keyof SharedCarData] && 
      String(data[field as keyof SharedCarData]).length > 0
    ).length;
    
    const requiredProgress = (requiredFilled / requiredFields.length) * 70; // 70% for required
    const optionalProgress = (optionalFilled / optionalFields.length) * 30; // 30% for optional
    
    return Math.round(requiredProgress + optionalProgress);
  };

  // Handle file uploads for listing mode
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (mode !== 'listing') return;
    
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      const currentImages = data.images || [];
      
      onDataChange({
        ...data,
        images: [...currentImages, ...newImages]
      });
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    if (mode !== 'listing' || !data.images) return;
    
    const updatedImages = data.images.filter((_, i) => i !== index);
    onDataChange({
      ...data,
      images: updatedImages
    });
  };

  const progress = getCompletionProgress();

  return (
    <FormContainer className={className}>
      {/* Progress notification for listing mode */}
      {mode === 'listing' && (
        <ProgressNotification progress={progress}>
          <div className="progress-text">
            {progress < 50 ? 
              'Започнете с основните данни за автомобила' : 
              progress < 80 ? 
                'Добавете още детайли за по-добра видимост' : 
                'Отлично! Обявата ви е почти готова'
            }
          </div>
          <div className="progress-subtitle">
            Напълнено: {progress}% - {progress < 80 ? 'Колкото повече детайли, толкова повече интерес!' : 'Готово за публикуване!'}
          </div>
        </ProgressNotification>
      )}

      {/* Basic Information Section */}
      <SectionCard>
        <SectionHeader 
          isOpen={openSections.basic} 
          onClick={() => toggleSection('basic')}
        >
          <SectionTitle>
            {mode === 'search' ? 'Търсене на автомобил' : 'Основни данни'}
          </SectionTitle>
          <ExpandIcon isOpen={openSections.basic} />
        </SectionHeader>
        
        <SectionContent isOpen={openSections.basic}>
          <FormGrid>
            <FormGroup>
              <FormLabel>Марка *</FormLabel>
              <SearchSelect 
                value={data.make} 
                onChange={(e) => handleInputChange('make', e.target.value)}
              >
                <option value="">Всички марки</option>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="volkswagen">Volkswagen</option>
                <option value="toyota">Toyota</option>
                <option value="peugeot">Peugeot</option>
                <option value="renault">Renault</option>
                <option value="ford">Ford</option>
                <option value="opel">Opel</option>
                <option value="skoda">Škoda</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Модел</FormLabel>
              <SearchSelect 
                value={data.model} 
                onChange={(e) => handleInputChange('model', e.target.value)}
                disabled={!data.make}
              >
                <option value="">Всички модели</option>
                {data.make === 'audi' && (
                  <>
                    <option value="a3">A3</option>
                    <option value="a4">A4</option>
                    <option value="a6">A6</option>
                    <option value="q3">Q3</option>
                    <option value="q5">Q5</option>
                  </>
                )}
                {data.make === 'bmw' && (
                  <>
                    <option value="series3">3 Series</option>
                    <option value="series5">5 Series</option>
                    <option value="x3">X3</option>
                    <option value="x5">X5</option>
                  </>
                )}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Тип превозно средство</FormLabel>
              <SearchSelect 
                value={data.vehicleType} 
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
              >
                <option value="">Всички типове</option>
                <option value="sedan">Седан</option>
                <option value="hatchback">Хечбек</option>
                <option value="suv">SUV</option>
                <option value="wagon">Комби</option>
                <option value="coupe">Купе</option>
                <option value="convertible">Кабриолет</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Състояние</FormLabel>
              <SearchSelect 
                value={data.condition} 
                onChange={(e) => handleInputChange('condition', e.target.value)}
              >
                <option value="">Всички</option>
                <option value="new">Нов автомобил</option>
                <option value="used">Употребяван</option>
                <option value="demonstration">Демонстрационен</option>
                <option value="oldtimer">Ретро автомобил</option>
              </SearchSelect>
            </FormGroup>

            {mode === 'search' ? (
              <>
                <FormGroup>
                  <FormLabel>Цена</FormLabel>
                  <RangeGroup>
                    <SearchInput 
                      type="number" 
                      placeholder="от"
                      value={data.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                    <span>до</span>
                    <SearchInput 
                      type="number" 
                      placeholder="до"
                    />
                  </RangeGroup>
                </FormGroup>
              </>
            ) : (
              <FormGroup>
                <FormLabel>Цена *</FormLabel>
                <SearchInput 
                  type="number" 
                  placeholder="Въведете цена в EUR"
                  value={data.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup>
              <FormLabel>Пробег {mode === 'listing' ? '*' : ''}</FormLabel>
              <SearchInput 
                type="number" 
                placeholder={mode === 'search' ? "до" : "Пробег в км"}
                value={data.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
              />
            </FormGroup>
          </FormGrid>
        </SectionContent>
      </SectionCard>

      {/* Technical Specifications Section */}
      <SectionCard>
        <SectionHeader 
          isOpen={openSections.technical} 
          onClick={() => toggleSection('technical')}
        >
          <SectionTitle>Технически характеристики</SectionTitle>
          <ExpandIcon isOpen={openSections.technical} />
        </SectionHeader>
        
        <SectionContent isOpen={openSections.technical}>
          <FormGrid>
            <FormGroup>
              <FormLabel>Гориво</FormLabel>
              <SearchSelect 
                value={data.fuelType} 
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
              >
                <option value="">Всички горива</option>
                <option value="petrol">Бензин</option>
                <option value="diesel">Дизел</option>
                <option value="hybrid">Хибрид</option>
                <option value="electric">Електрически</option>
                <option value="lpg">ГНП</option>
                <option value="cng">Метан</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Скоростна кутия</FormLabel>
              <SearchSelect 
                value={data.transmission} 
                onChange={(e) => handleInputChange('transmission', e.target.value)}
              >
                <option value="">Всички</option>
                <option value="manual">Ръчна</option>
                <option value="automatic">Автоматична</option>
                <option value="semi-automatic">Полуавтоматична</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Мощност (к.с.)</FormLabel>
              <SearchInput 
                type="number" 
                placeholder={mode === 'search' ? "до" : "Мощност в к.с."}
                value={data.power}
                onChange={(e) => handleInputChange('power', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Обем на двигателя (см³)</FormLabel>
              <SearchInput 
                type="number" 
                placeholder={mode === 'search' ? "до" : "Обем в см³"}
                value={data.engineSize}
                onChange={(e) => handleInputChange('engineSize', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Предаване</FormLabel>
              <SearchSelect 
                value={data.driveType} 
                onChange={(e) => handleInputChange('driveType', e.target.value)}
              >
                <option value="">Всички</option>
                <option value="front">Предно</option>
                <option value="rear">Задно</option>
                <option value="awd">4x4 / AWD</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Разход на гориво (л/100км)</FormLabel>
              <SearchInput 
                type="number" 
                placeholder="Разход"
                value={data.fuelConsumption}
                onChange={(e) => handleInputChange('fuelConsumption', e.target.value)}
                step="0.1"
              />
            </FormGroup>
          </FormGrid>
        </SectionContent>
      </SectionCard>

      {/* Equipment & Features Section */}
      <SectionCard>
        <SectionHeader 
          isOpen={openSections.equipment} 
          onClick={() => toggleSection('equipment')}
        >
          <SectionTitle>Оборудване и екстри</SectionTitle>
          <ExpandIcon isOpen={openSections.equipment} />
        </SectionHeader>
        
        <SectionContent isOpen={openSections.equipment}>
          <FormGrid>
            <FormGroup>
              <FormLabel>Цвят на каросерията</FormLabel>
              <SearchSelect 
                value={data.exteriorColor} 
                onChange={(e) => handleInputChange('exteriorColor', e.target.value)}
              >
                <option value="">Всички цветове</option>
                <option value="black">Черен</option>
                <option value="white">Бял</option>
                <option value="silver">Сребрист</option>
                <option value="gray">Сив</option>
                <option value="blue">Син</option>
                <option value="red">Червен</option>
                <option value="green">Зелен</option>
                <option value="brown">Кафяв</option>
                <option value="yellow">Жълт</option>
                <option value="other">Друг</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Цвят на интериора</FormLabel>
              <SearchSelect 
                value={data.interiorColor} 
                onChange={(e) => handleInputChange('interiorColor', e.target.value)}
              >
                <option value="">Всички цветове</option>
                <option value="black">Черен</option>
                <option value="gray">Сив</option>
                <option value="beige">Бежов</option>
                <option value="brown">Кафяв</option>
                <option value="red">Червен</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Врати</FormLabel>
              <SearchSelect 
                value={data.doors} 
                onChange={(e) => handleInputChange('doors', e.target.value)}
              >
                <option value="">Всички</option>
                <option value="2">2 врати</option>
                <option value="3">3 врати</option>
                <option value="4">4 врати</option>
                <option value="5">5 врати</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Места</FormLabel>
              <SearchSelect 
                value={data.seats} 
                onChange={(e) => handleInputChange('seats', e.target.value)}
              >
                <option value="">Всички</option>
                <option value="2">2 места</option>
                <option value="4">4 места</option>
                <option value="5">5 места</option>
                <option value="7">7 места</option>
                <option value="8">8+ места</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Климатизация</FormLabel>
              <SearchSelect 
                value={data.airConditioning} 
                onChange={(e) => handleInputChange('airConditioning', e.target.value)}
              >
                <option value="">Няма значение</option>
                <option value="manual">Ръчна климатизация</option>
                <option value="automatic">Автоматичен климатрон</option>
                <option value="dual">Двузонов климатрон</option>
                <option value="multi">Многозонов климатрон</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>

          {/* Parking Sensors Checkboxes */}
          <FormGroup>
            <FormLabel>Паркинг асистенти</FormLabel>
            <CheckboxGroup>
              <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'front')}>
                <CustomCheckbox checked={data.parkingSensors.includes('front')} />
                Предни сензори
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'rear')}>
                <CustomCheckbox checked={data.parkingSensors.includes('rear')} />
                Задни сензори
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'camera')}>
                <CustomCheckbox checked={data.parkingSensors.includes('camera')} />
                Камера за паркиране
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', '360camera')}>
                <CustomCheckbox checked={data.parkingSensors.includes('360camera')} />
                360° камера
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>

          {/* Additional Equipment */}
          <FormGroup>
            <FormLabel>Допълнително оборудване</FormLabel>
            <CheckboxGroup>
              <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'disabled')}>
                <CustomCheckbox checked={data.extras.includes('disabled')} />
                Достъп за инвалиди
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'electricSeats')}>
                <CustomCheckbox checked={data.extras.includes('electricSeats')} />
                Електрически седалки
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'heatedSeats')}>
                <CustomCheckbox checked={data.extras.includes('heatedSeats')} />
                Отопляеми седалки
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'electricWindows')}>
                <CustomCheckbox checked={data.extras.includes('electricWindows')} />
                Ел. стъкла
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'cruiseControl')}>
                <CustomCheckbox checked={data.extras.includes('cruiseControl')} />
                Круиз контрол
              </CheckboxLabel>
              <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'navigation')}>
                <CustomCheckbox checked={data.extras.includes('navigation')} />
                Навигация
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>
        </SectionContent>
      </SectionCard>

      {/* Contact Information - Only for listing mode */}
      {mode === 'listing' && (
        <SectionCard>
          <SectionHeader 
            isOpen={openSections.contact} 
            onClick={() => toggleSection('contact')}
          >
            <SectionTitle>Данни за контакт</SectionTitle>
            <ExpandIcon isOpen={openSections.contact} />
          </SectionHeader>
          
          <SectionContent isOpen={openSections.contact}>
            <FormGrid>
              <FormGroup>
                <FormLabel>Местоположение *</FormLabel>
                <SearchSelect 
                  value={data.location} 
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  <option value="">Изберете град</option>
                  {BULGARIAN_CITIES.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.nameBg}
                    </option>
                  ))}
                </SearchSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Телефон за контакт</FormLabel>
                <SearchInput 
                  type="tel" 
                  placeholder="+359 XXX XXX XXX"
                  value={data.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Имейл за контакт</FormLabel>
                <SearchInput 
                  type="email" 
                  placeholder="your@email.com"
                  value={data.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </FormGroup>
            </FormGrid>

            {/* Additional Options */}
            <FormGroup>
              <FormLabel>Допълнителни опции</FormLabel>
              <CheckboxGroup>
                <CheckboxLabel onClick={() => handleInputChange('warranty', !data.warranty)}>
                  <CustomCheckbox checked={data.warranty} />
                  Гаранция
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleInputChange('serviceHistory', !data.serviceHistory)}>
                  <CustomCheckbox checked={data.serviceHistory} />
                  Сервизна история
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleInputChange('nonSmokerVehicle', !data.nonSmokerVehicle)}>
                  <CustomCheckbox checked={data.nonSmokerVehicle} />
                  Непушач
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleInputChange('vatReclaimable', !data.vatReclaimable)}>
                  <CustomCheckbox checked={data.vatReclaimable} />
                  Възстановим ДДС
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>
          </SectionContent>
        </SectionCard>
      )}

      {/* Image Upload - Only for listing mode */}
      {mode === 'listing' && (
        <SectionCard>
          <SectionHeader 
            isOpen={openSections.images} 
            onClick={() => toggleSection('images')}
          >
            <SectionTitle>Снимки на автомобила</SectionTitle>
            <ExpandIcon isOpen={openSections.images} />
          </SectionHeader>
          
          <SectionContent isOpen={openSections.images}>
            <ImageUploadArea>
              <input 
                type="file" 
                id="images"
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label htmlFor="images">
                <div style={{fontSize: '48px', marginBottom: '16px'}}>📷</div>
                <div style={{fontSize: '16px', marginBottom: '8px'}}>
                  Добавете снимки на автомобила
                </div>
                <div style={{fontSize: '14px', color: colors.text.secondary}}>
                  Максимум 20 снимки • JPEG, PNG до 10MB всяка
                </div>
              </label>
            </ImageUploadArea>

            {data.images && data.images.length > 0 && (
              <ImagePreview>
                {data.images.map((image, index) => (
                  <PreviewImage key={index}>
                    <img 
                      src={previewUrlsRef.current.get(index) || ''} 
                      alt={`Preview ${index + 1}`} 
                    />
                    <button 
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </PreviewImage>
                ))}
              </ImagePreview>
            )}
          </SectionContent>
        </SectionCard>
      )}
    </FormContainer>
  );
};

export default SharedCarForm;
