import React from 'react';
import { SharedCarData } from '../SharedCarForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface BasicInfoSectionProps {
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
  RangeGroup: any;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
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
  SearchInput,
  RangeGroup
}) => {
  const { t } = useLanguage();
  
  return (
    <SectionCard>
      <SectionHeader isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>
          {mode === 'search' ? t('common.searchCar') || 'Търсене на автомобил' : t('common.basicInfo') || 'Основни данни'}
        </SectionTitle>
        <ExpandIcon isOpen={isOpen} />
      </SectionHeader>
      
      <SectionContent isOpen={isOpen}>
        <FormGrid>
          <FormGroup>
            <FormLabel>Марка *</FormLabel>
            <SearchSelect 
              value={data.make} 
              onChange={(e: any) => onInputChange('make', e.target.value)}
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
              onChange={(e: any) => onInputChange('model', e.target.value)}
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
            <FormLabel>{t('common.vehicleType') || 'Тип превозно средство'}</FormLabel>
            <SearchSelect 
              value={data.vehicleType} 
              onChange={(e: any) => onInputChange('vehicleType', e.target.value)}
            >
              <option value="">{t('bodyTypes.allTypes')}</option>
              <option value="sedan">{t('bodyTypes.sedan')}</option>
              <option value="hatchback">{t('bodyTypes.hatchback')}</option>
              <option value="suv">{t('bodyTypes.suv')}</option>
              <option value="wagon">{t('bodyTypes.wagon')}</option>
              <option value="coupe">{t('bodyTypes.coupe')}</option>
              <option value="convertible">{t('bodyTypes.convertible')}</option>
            </SearchSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Състояние</FormLabel>
            <SearchSelect 
              value={data.condition} 
              onChange={(e: any) => onInputChange('condition', e.target.value)}
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
                    onChange={(e: any) => onInputChange('price', e.target.value)}
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
                onChange={(e: any) => onInputChange('price', e.target.value)}
              />
            </FormGroup>
          )}

          <FormGroup>
            <FormLabel>Пробег {mode === 'listing' ? '*' : ''}</FormLabel>
            <SearchInput 
              type="number" 
              placeholder={mode === 'search' ? "до" : "Пробег в км"}
              value={data.mileage}
              onChange={(e: any) => onInputChange('mileage', e.target.value)}
            />
          </FormGroup>
        </FormGrid>
      </SectionContent>
    </SectionCard>
  );
};

