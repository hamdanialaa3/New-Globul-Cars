import React from 'react';
import { CarListing } from '../../../types/CarListing';
import {
  EquipmentSection,
  SectionTitle,
  DetailRow,
  DetailLabel,
  DetailValue,
} from '../CarDetailsPage.styles';

interface CarEquipmentDisplayProps {
  car: CarListing;
  language: 'bg' | 'en';
}

export const CarEquipmentDisplay: React.FC<CarEquipmentDisplayProps> = ({ car, language }) => {
  return (
    <>
      {/* History Section */}
      <EquipmentSection>
        <SectionTitle>
          {language === 'bg' ? 'История' : 'History'}
        </SectionTitle>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Има история на аварии' : 'Has accident history'}</DetailLabel>
          <DetailValue>
            {car.accidentHistory === true ? (language === 'bg' ? 'Да' : 'Yes') : 
             car.accidentHistory === false ? (language === 'bg' ? 'Не' : 'No') : 'N/A'}
          </DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Има сервизна история' : 'Has service history'}</DetailLabel>
          <DetailValue>
            {car.serviceHistory === true ? (language === 'bg' ? 'Да' : 'Yes') : 
             car.serviceHistory === false ? (language === 'bg' ? 'Не' : 'No') : 'N/A'}
          </DetailValue>
        </DetailRow>
      </EquipmentSection>

      {/* Safety Equipment */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {car[option.key as keyof CarListing] ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </EquipmentSection>

      {/* Comfort Equipment */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {car[option.key as keyof CarListing] ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </EquipmentSection>

      {/* Infotainment Equipment */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {car[option.key as keyof CarListing] ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </EquipmentSection>

      {/* Exterior Equipment */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {car[option.key as keyof CarListing] ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </EquipmentSection>
    </>
  );
};

