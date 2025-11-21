import React, { useState } from 'react';
import styled from 'styled-components';
import { X, MapPin } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { useProfile } from '@globul-cars/profile/hooks/useProfile';
import { toast } from 'react-toastify';
import { BULGARIAN_CITIES } from '@globul-cars/services/unified-cities-service';

interface LocationEditModalProps {
  onClose: () => void;
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { user, updateProfile } = useProfile();
  const [selectedCity, setSelectedCity] = useState(user?.locationData?.cityId || '');
  const [loading, setLoading] = useState(false);

  const getText = () => {
    if (language === 'bg') {
      return {
        title: 'Редактиране на местоположение',
        selectCity: 'Изберете град',
        cancel: 'Отказ',
        save: 'Запази',
        success: 'Местоположението е актуализирано успешно!',
        error: 'Грешка при актуализиране на местоположението'
      };
    } else {
      return {
        title: 'Edit Location',
        selectCity: 'Select City',
        cancel: 'Cancel',
        save: 'Save',
        success: 'Location updated successfully!',
        error: 'Error updating location'
      };
    }
  };

  const text = getText();

  const handleSave = async () => {
    if (!selectedCity) {
      toast.error(language === 'bg' ? 'Моля, изберете град' : 'Please select a city');
      return;
    }

    const city = BULGARIAN_CITIES.find(c => c.id === selectedCity);
    if (!city) return;

    setLoading(true);
    try {
      await updateProfile({
        locationData: {
          cityId: city.id,
          cityName: city.name,
          coordinates: city.coordinates,
          region: city.region
        }
      });
      toast.success(text.success);
      onClose();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <MapPin size={24} />
            {text.title}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <InputGroup>
            <Label>{text.selectCity}</Label>
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">{text.selectCity}</option>
              {BULGARIAN_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {language === 'bg' ? city.name.bg : city.name.en}
                </option>
              ))}
            </Select>
          </InputGroup>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>{text.cancel}</CancelButton>
          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? (language === 'bg' ? 'Зареждане...' : 'Loading...') : text.save}
          </SaveButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default LocationEditModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #FF8F10;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;

  &:hover {
    color: #1a1a1a;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e8e8e8;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e8e8e8;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #FF8F10;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e67e00;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
