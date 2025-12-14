import React, { useState, useEffect } from 'react';
import { CarListing } from '../../../types/CarListing';
import { brandsModelsDataService } from '../../../services/brands-models-data.service';
import { logger } from '../../../services/logger-service';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../../data/bulgaria-locations';
import {
  DetailsSection,
  SectionTitle,
  DetailRow,
  DetailLabel,
  DetailValue,
  EditableInput,
  EditableSelect,
  EquipmentSection,
  PriceSection,
  SectionIcon,
} from '../CarDetailsPage.styles';
import { ToggleSwitch } from './ToggleSwitch';

interface CarEditFormProps {
  car: CarListing;
  editedCar: Partial<CarListing>;
  language: 'bg' | 'en';
  showOtherMake: boolean;
  showOtherModel: boolean;
  showOtherFuelType: boolean;
  showOtherTransmission: boolean;
  showOtherColor: boolean;
  showOtherDoors: boolean;
  showOtherSeats: boolean;
  availableModels: string[];
  availableCities: string[];
  onInputChange: (field: keyof CarListing, value: any) => void;
  onSetShowOther: (field: string, value: boolean) => void;
  onSetAvailableCities: (cities: string[]) => void;
  onDelete?: () => void;
}

export const CarEditForm: React.FC<CarEditFormProps> = ({
  car,
  editedCar,
  language,
  showOtherMake,
  showOtherModel,
  showOtherFuelType,
  showOtherTransmission,
  showOtherColor,
  showOtherDoors,
  showOtherSeats,
  availableModels,
  availableCities,
  onInputChange,
  onSetShowOther,
  onSetAvailableCities,
  onDelete,
}) => {
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);

  // Load all brands on mount
  useEffect(() => {
    brandsModelsDataService.getAllBrands()
      .then(brands => setAvailableMakes(brands))
      .catch(error => {
        logger.error('Error loading brands', error as Error);
        setAvailableMakes([]);
      });
  }, []);

  return (
    <>
      {/* Price Section - Only for Edit Mode */}
      <PriceSection>
        <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--btn-primary-text)', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
            {language === 'bg' ? 'Цена (EUR)*' : 'Price (EUR)*'}
          </h3>
        </div>
        <div>
          <EditableInput
            type="number"
            value={editedCar.price || ''}
            onChange={(e) => onInputChange('price', parseInt(e.target.value) || 0)}
            placeholder={language === 'bg' ? 'Въведете цена' : 'Enter price'}
            style={{ 
              fontSize: '2rem', 
              textAlign: 'center', 
              marginBottom: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'var(--btn-primary-text)'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <label style={{ color: 'var(--btn-primary-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={editedCar.negotiable || false}
                onChange={(e) => onInputChange('negotiable', e.target.checked)}
              />
              {language === 'bg' ? 'Договорна' : 'Negotiable'}
            </label>
          </div>
        </div>
      </PriceSection>

      <DetailsSection>
        <SectionTitle>
          {language === 'bg' ? 'Основни данни' : 'Basic Information'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Марка' : 'Make'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherMake ? 'Other' : (editedCar.make || '')}
              aria-label={language === 'bg' ? 'Изберете марка' : 'Select make'}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('make', true);
                  onInputChange('make', '');
                } else {
                  onSetShowOther('make', false);
                  onInputChange('make', e.target.value);
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете марка' : 'Select make'}</option>
              {availableMakes.filter(make => make !== 'Other').map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
              <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
            </EditableSelect>
            {showOtherMake && (
              <EditableInput
                value={editedCar.make || ''}
                onChange={(e) => onInputChange('make', e.target.value)}
                placeholder={language === 'bg' ? 'Въведете марка' : 'Enter make'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Модел' : 'Model'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherModel ? 'Other' : (editedCar.model || '')}
              aria-label={language === 'bg' ? 'Изберете модел' : 'Select model'}
              disabled={!editedCar.make || availableModels.length === 0}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('model', true);
                  onInputChange('model', '');
                } else {
                  onSetShowOther('model', false);
                  onInputChange('model', e.target.value);
                }
              }}
            >
              <option value="">
                {!editedCar.make 
                  ? (language === 'bg' ? 'Първо изберете марка' : 'Select make first')
                  : (language === 'bg' ? 'Изберете модел' : 'Select model')
                }
              </option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
              {availableModels.length > 0 && (
                <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
              )}
            </EditableSelect>
            {showOtherModel && (
              <EditableInput
                value={editedCar.model || ''}
                onChange={(e) => onInputChange('model', e.target.value)}
                placeholder={language === 'bg' ? 'Въведете модел' : 'Enter model'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Година' : 'Year'}</DetailLabel>
          <EditableInput
            type="number"
            value={editedCar.year || ''}
            onChange={(e) => onInputChange('year', parseInt(e.target.value) || 0)}
            placeholder={language === 'bg' ? 'Въведете година' : 'Enter year'}
          />
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Пробег' : 'Mileage'}</DetailLabel>
          <EditableInput
            type="number"
            value={editedCar.mileage || ''}
            onChange={(e) => onInputChange('mileage', parseInt(e.target.value) || 0)}
            placeholder={language === 'bg' ? 'Въведете пробег' : 'Enter mileage'}
          />
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Гориво' : 'Fuel Type'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherFuelType ? 'Other' : (editedCar.fuelType || '')}
              aria-label={language === 'bg' ? 'Изберете гориво' : 'Select fuel type'}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('fuelType', true);
                } else {
                  onSetShowOther('fuelType', false);
                  onInputChange('fuelType', e.target.value);
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете гориво' : 'Select fuel type'}</option>
              <option value="Petrol">{language === 'bg' ? 'Бензин' : 'Petrol'}</option>
              <option value="Diesel">{language === 'bg' ? 'Дизел' : 'Diesel'}</option>
              <option value="Electric">{language === 'bg' ? 'Електрически' : 'Electric'}</option>
              <option value="Hybrid">{language === 'bg' ? 'Хибрид' : 'Hybrid'}</option>
              <option value="LPG">{language === 'bg' ? 'ГПГ' : 'LPG'}</option>
              <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
            </EditableSelect>
            {showOtherFuelType && (
              <EditableInput
                value={editedCar.fuelType || ''}
                onChange={(e) => onInputChange('fuelType', e.target.value)}
                placeholder={language === 'bg' ? 'Въведете вид гориво' : 'Enter fuel type'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherTransmission ? 'Other' : (editedCar.transmission || '')}
              aria-label={language === 'bg' ? 'Изберете трансмисия' : 'Select transmission'}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('transmission', true);
                } else {
                  onSetShowOther('transmission', false);
                  onInputChange('transmission', e.target.value);
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете трансмисия' : 'Select transmission'}</option>
              <option value="Manual">{language === 'bg' ? 'Ръчна' : 'Manual'}</option>
              <option value="Automatic">{language === 'bg' ? 'Автоматична' : 'Automatic'}</option>
              <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
            </EditableSelect>
            {showOtherTransmission && (
              <EditableInput
                value={editedCar.transmission || ''}
                onChange={(e) => onInputChange('transmission', e.target.value)}
                placeholder={language === 'bg' ? 'Въведете тип трансмисия' : 'Enter transmission type'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Мощност' : 'Power'}</DetailLabel>
          <EditableInput
            type="number"
            value={editedCar.power || ''}
            onChange={(e) => onInputChange('power', parseInt(e.target.value) || 0)}
            placeholder={language === 'bg' ? 'Въведете мощност (к.с.)' : 'Enter power (HP)'}
          />
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Цвят' : 'Color'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherColor ? 'Other' : (editedCar.color || '')}
              aria-label={language === 'bg' ? 'Изберете цвят' : 'Select color'}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('color', true);
                } else {
                  onSetShowOther('color', false);
                  onInputChange('color', e.target.value);
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете цвят' : 'Select color'}</option>
              <option value="White">{language === 'bg' ? 'Бял' : 'White'}</option>
              <option value="Black">{language === 'bg' ? 'Черен' : 'Black'}</option>
              <option value="Silver">{language === 'bg' ? 'Сребърен' : 'Silver'}</option>
              <option value="Gray">{language === 'bg' ? 'Сив' : 'Gray'}</option>
              <option value="Red">{language === 'bg' ? 'Червен' : 'Red'}</option>
              <option value="Blue">{language === 'bg' ? 'Син' : 'Blue'}</option>
              <option value="Green">{language === 'bg' ? 'Зелен' : 'Green'}</option>
              <option value="Yellow">{language === 'bg' ? 'Жълт' : 'Yellow'}</option>
              <option value="Orange">{language === 'bg' ? 'Оранжев' : 'Orange'}</option>
              <option value="Brown">{language === 'bg' ? 'Кафяв' : 'Brown'}</option>
              <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
            </EditableSelect>
            {showOtherColor && (
              <EditableInput
                value={editedCar.color || ''}
                onChange={(e) => onInputChange('color', e.target.value)}
                placeholder={language === 'bg' ? 'Въведете цвят' : 'Enter color'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Врати' : 'Doors'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherDoors ? 'Other' : (editedCar.numberOfDoors?.toString() || editedCar.doors?.toString() || '')}
              aria-label={language === 'bg' ? 'Изберете брой врати' : 'Select doors'}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('doors', true);
                } else {
                  onSetShowOther('doors', false);
                  onInputChange('numberOfDoors', parseInt(e.target.value));
                  onInputChange('doors', parseInt(e.target.value));
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете брой врати' : 'Select doors'}</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
            </EditableSelect>
            {showOtherDoors && (
              <EditableInput
                value={editedCar.numberOfDoors || editedCar.doors || ''}
                onChange={(e) => {
                  onInputChange('numberOfDoors', parseInt(e.target.value));
                  onInputChange('doors', parseInt(e.target.value));
                }}
                placeholder={language === 'bg' ? 'Въведете брой врати' : 'Enter doors'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Места' : 'Seats'}</DetailLabel>
          <>
            <EditableSelect
              value={showOtherSeats ? 'Other' : (editedCar.numberOfSeats?.toString() || editedCar.seats?.toString() || '')}
              aria-label={language === 'bg' ? 'Изберете брой места' : 'Select seats'}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  onSetShowOther('seats', true);
                } else {
                  onSetShowOther('seats', false);
                  onInputChange('numberOfSeats', parseInt(e.target.value));
                  onInputChange('seats', parseInt(e.target.value));
                }
              }}
            >
              <option value="">{language === 'bg' ? 'Изберете брой места' : 'Select seats'}</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option className="other-option" value="Other">{language === 'bg' ? '▼ Друго' : '▼ Other'}</option>
            </EditableSelect>
            {showOtherSeats && (
              <EditableInput
                value={editedCar.numberOfSeats || editedCar.seats || ''}
                onChange={(e) => {
                  onInputChange('numberOfSeats', parseInt(e.target.value));
                  onInputChange('seats', parseInt(e.target.value));
                }}
                placeholder={language === 'bg' ? 'Въведете брой места' : 'Enter seats'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </>
        </DetailRow>
      </DetailsSection>

      {/* History Section */}
      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'История' : 'History'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Има история на аварии' : 'Has accident history'}</DetailLabel>
          <ToggleSwitch
            isOn={editedCar.accidentHistory === true}
            onToggle={() => onInputChange('accidentHistory', !editedCar.accidentHistory)}
            label={editedCar.accidentHistory ? (language === 'bg' ? 'Да' : 'Yes') : (language === 'bg' ? 'Не' : 'No')}
          />
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Има сервизна история' : 'Has service history'}</DetailLabel>
          <ToggleSwitch
            isOn={editedCar.serviceHistory === true}
            onToggle={() => onInputChange('serviceHistory', !editedCar.serviceHistory)}
            label={editedCar.serviceHistory ? (language === 'bg' ? 'Да' : 'Yes') : (language === 'bg' ? 'Не' : 'No')}
          />
        </DetailRow>
      </EquipmentSection>

      {/* Equipment Sections */}
      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Оборудване за безопасност' : 'Safety Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'abs', label: 'ABS' },
            { key: 'esp', label: 'ESP' },
            { key: 'airbags', label: 'Airbags' },
            { key: 'parkingSensors', label: 'Parking Sensors' },
            { key: 'rearviewCamera', label: 'Rearview Camera' },
            { key: 'blindSpotMonitor', label: 'Blind Spot Monitor' },
            { key: 'laneDeparture', label: 'Lane Departure' },
            { key: 'collisionWarning', label: 'Collision Warning' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{option.label}</span>
              <ToggleSwitch
                isOn={Boolean(editedCar[option.key as keyof CarListing])}
                onToggle={() => onInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
              />
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Оборудване за комфорт' : 'Comfort Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'airConditioning', label: 'Air Conditioning' },
            { key: 'climateControl', label: 'Climate Control' },
            { key: 'heatedSeats', label: 'Heated Seats' },
            { key: 'ventilatedSeats', label: 'Ventilated Seats' },
            { key: 'sunroof', label: 'Sunroof' },
            { key: 'rainSensor', label: 'Rain Sensor' },
            { key: 'cruiseControl', label: 'Cruise Control' },
            { key: 'parkAssist', label: 'Park Assist' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{option.label}</span>
              <ToggleSwitch
                isOn={Boolean(editedCar[option.key as keyof CarListing])}
                onToggle={() => onInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
              />
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Информационно-развлекателна система' : 'Infotainment Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'bluetooth', label: 'Bluetooth' },
            { key: 'navigation', label: 'Navigation' },
            { key: 'appleCarPlay', label: 'Apple CarPlay' },
            { key: 'androidAuto', label: 'Android Auto' },
            { key: 'soundSystem', label: 'Sound System' },
            { key: 'radio', label: 'Radio' },
            { key: 'wifiHotspot', label: 'Wi-Fi Hotspot' },
            { key: 'usbPorts', label: 'USB Ports' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{option.label}</span>
              <ToggleSwitch
                isOn={Boolean(editedCar[option.key as keyof CarListing])}
                onToggle={() => onInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
              />
            </div>
          ))}
        </div>
      </EquipmentSection>

      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'Външно оборудване' : 'Exterior Equipment'}
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {[
            { key: 'ledLights', label: 'LED Lights' },
            { key: 'xenonLights', label: 'Xenon Lights' },
            { key: 'daytimeRunningLights', label: 'Daytime Running Lights' },
            { key: 'alloyWheels', label: 'Alloy Wheels' },
            { key: 'keylessEntry', label: 'Keyless Entry' },
            { key: 'startStopSystem', label: 'Start/Stop System' },
            { key: 'sportPackage', label: 'Sport Package' },
            { key: 'towHitch', label: 'Tow Hitch' }
          ].map(option => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{option.label}</span>
              <ToggleSwitch
                isOn={Boolean(editedCar[option.key as keyof CarListing])}
                onToggle={() => onInputChange(option.key as keyof CarListing, !editedCar[option.key as keyof CarListing])}
              />
            </div>
          ))}
        </div>
      </EquipmentSection>

      {/* Personal Information */}
      <EquipmentSection>
        <SectionTitle style={{ display: 'flex', alignItems: 'center' }}>
          <SectionIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="white"/>
              <path d="M12 14C8.67 14 2 15.67 2 19V20C2 20.55 2.45 21 3 21H21C21.55 21 22 20.55 22 20V19C22 15.67 15.33 14 12 14Z" fill="white"/>
            </svg>
          </SectionIcon>
          {language === 'bg' ? 'Лична информация' : 'Personal Information'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Име' : 'Name'}</DetailLabel>
          <EditableInput
            value={editedCar.sellerName || ''}
            onChange={(e) => onInputChange('sellerName', e.target.value)}
            placeholder={language === 'bg' ? 'Въведете име' : 'Enter name'}
          />
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Имейл' : 'Email'}</DetailLabel>
          <EditableInput
            type="email"
            value={editedCar.sellerEmail || ''}
            onChange={(e) => onInputChange('sellerEmail', e.target.value)}
            placeholder={language === 'bg' ? 'Въведете имейл' : 'Enter email'}
          />
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Телефон' : 'Phone'}</DetailLabel>
          <EditableInput
            type="tel"
            value={editedCar.sellerPhone || ''}
            onChange={(e) => onInputChange('sellerPhone', e.target.value)}
            placeholder={language === 'bg' ? 'Въведете телефон' : 'Enter phone'}
          />
        </DetailRow>
      </EquipmentSection>

      {/* Location */}
      <EquipmentSection>
        <SectionTitle style={{ display: 'flex', alignItems: 'center' }}>
          <SectionIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white"/>
            </svg>
          </SectionIcon>
          {language === 'bg' ? 'Местоположение' : 'Location'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Регион' : 'Region'}</DetailLabel>
          <EditableSelect
            value={editedCar.region || ''}
            aria-label={language === 'bg' ? 'Изберете регион' : 'Select region'}
            onChange={(e) => {
              const regionName = e.target.value;
              onInputChange('region', regionName);
              
              if (regionName) {
                const cities = getCitiesByRegion(regionName);
                const cityNames = cities.map(city => typeof city === 'string' ? city : city.name);
                onSetAvailableCities(cityNames);
                onInputChange('city', '');
              } else {
                onSetAvailableCities([]);
              }
            }}
          >
            <option value="">{language === 'bg' ? 'Изберете регион' : 'Select region'}</option>
            {BULGARIA_REGIONS.map((region) => (
              <option key={region.name} value={region.name}>
                {language === 'bg' ? region.name : region.nameEn}
              </option>
            ))}
          </EditableSelect>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Град' : 'City'}</DetailLabel>
          {availableCities.length > 0 ? (
            <EditableSelect
              value={editedCar.city || ''}
              aria-label={language === 'bg' ? 'Изберете град' : 'Select city'}
              onChange={(e) => onInputChange('city', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете град' : 'Select city'}</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </EditableSelect>
          ) : (
            <EditableInput
              value={editedCar.city || ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder={language === 'bg' ? 'Първо изберете регион' : 'Select region first'}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          )}
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</DetailLabel>
          <EditableInput
            value={editedCar.postalCode || ''}
            onChange={(e) => onInputChange('postalCode', e.target.value)}
            placeholder={language === 'bg' ? 'Въведете пощенски код' : 'Enter postal code'}
          />
        </DetailRow>
      </EquipmentSection>

      {/* Delete Button Section */}
      {onDelete && (
        <EquipmentSection style={{ 
          marginTop: '2rem',
          borderTop: '2px solid rgba(239, 68, 68, 0.2)',
          paddingTop: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onDelete}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🗑️</span>
              {language === 'bg' ? 'Изтриване на обявата' : 'Delete Listing'}
            </button>
          </div>
        </EquipmentSection>
      )}
    </>
  );
};

