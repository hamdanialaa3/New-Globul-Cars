import React from 'react';
import { SharedCarData } from '../SharedCarForm';

interface TechnicalSectionProps {
  mode: 'search' | 'listing';
  data: SharedCarData;
  onInputChange: (field: keyof SharedCarData, value: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  SectionCard: any;
  SectionHeader: any;
  SectionTitle: any;
  ExpandIcon: any;
  SectionContent: any;
  FormGrid: any;
  FormGroup: any;
  FormLabel: any;
  SearchSelect: any;
  SearchInput: any;
}

export const TechnicalSection: React.FC<TechnicalSectionProps> = ({
  mode,
  data,
  onInputChange,
  isOpen,
  onToggle,
  SectionCard,
  SectionHeader,
  SectionTitle,
  ExpandIcon,
  SectionContent,
  FormGrid,
  FormGroup,
  FormLabel,
  SearchSelect,
  SearchInput
}) => {
  return (
    <SectionCard>
      <SectionHeader isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>Технически характеристики</SectionTitle>
        <ExpandIcon isOpen={isOpen} />
      </SectionHeader>
      
      <SectionContent isOpen={isOpen}>
        <FormGrid>
          <FormGroup>
            <FormLabel>Гориво</FormLabel>
            <SearchSelect 
              value={data.fuelType} 
              onChange={(e: any) => onInputChange('fuelType', e.target.value)}
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
              onChange={(e: any) => onInputChange('transmission', e.target.value)}
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
              onChange={(e: any) => onInputChange('power', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Обем на двигателя (см³)</FormLabel>
            <SearchInput 
              type="number" 
              placeholder={mode === 'search' ? "до" : "Обем в см³"}
              value={data.engineSize}
              onChange={(e: any) => onInputChange('engineSize', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Предаване</FormLabel>
            <SearchSelect 
              value={data.driveType} 
              onChange={(e: any) => onInputChange('driveType', e.target.value)}
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
              onChange={(e: any) => onInputChange('fuelConsumption', e.target.value)}
              step="0.1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Емисии (Евро норма)</FormLabel>
            <SearchSelect 
              value={data.emissionClass} 
              onChange={(e: any) => onInputChange('emissionClass', e.target.value)}
            >
              <option value="">Всички</option>
              <option value="euro6">Euro 6</option>
              <option value="euro5">Euro 5</option>
              <option value="euro4">Euro 4</option>
              <option value="euro3">Euro 3</option>
            </SearchSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Цвят (външен)</FormLabel>
            <SearchSelect 
              value={data.exteriorColor} 
              onChange={(e: any) => onInputChange('exteriorColor', e.target.value)}
            >
              <option value="">Всички цветове</option>
              <option value="white">Бяло</option>
              <option value="black">Черно</option>
              <option value="silver">Сребристо</option>
              <option value="gray">Сиво</option>
              <option value="blue">Синьо</option>
              <option value="red">Червено</option>
              <option value="green">Зелено</option>
            </SearchSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Цвят (интериор)</FormLabel>
            <SearchSelect 
              value={data.interiorColor} 
              onChange={(e: any) => onInputChange('interiorColor', e.target.value)}
            >
              <option value="">Всички</option>
              <option value="black">Черен</option>
              <option value="beige">Бежов</option>
              <option value="brown">Кафяв</option>
              <option value="gray">Сив</option>
            </SearchSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Брой врати</FormLabel>
            <SearchSelect 
              value={data.doors} 
              onChange={(e: any) => onInputChange('doors', e.target.value)}
            >
              <option value="">Всички</option>
              <option value="2">2 врати</option>
              <option value="3">3 врати</option>
              <option value="4">4 врати</option>
              <option value="5">5 врати</option>
            </SearchSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Брой места</FormLabel>
            <SearchSelect 
              value={data.seats} 
              onChange={(e: any) => onInputChange('seats', e.target.value)}
            >
              <option value="">Всички</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7">7</option>
            </SearchSelect>
          </FormGroup>
        </FormGrid>
      </SectionContent>
    </SectionCard>
  );
};

