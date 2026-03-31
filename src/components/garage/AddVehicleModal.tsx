import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { garageService } from '../../services/garage/garage-service';
import { logger } from '../../services/logger-service';
import { X } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #1a1a2e;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 4px;

    &:hover {
      background: #f0f0f0;
      color: #333;
    }
  }
`;

const FormForm = styled.form`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: #333;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #0056b3;
      box-shadow: 0 0 0 2px rgba(0,86,179,0.1);
    }
  }
`;

const DatesGroup = styled.div`
  border: 1px dashed #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: #fafafa;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    color: #555;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .cancel {
    background: white;
    border: 1px solid #ccc;
    color: #555;
  }

  .submit {
    background: #0056b3;
    border: 1px solid #0056b3;
    color: white;

    &:disabled {
      background: #80abe5;
      border-color: #80abe5;
      cursor: not-allowed;
    }
  }
`;

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    motExpiry: '',
    insuranceExpiry: '',
    vignetteExpiry: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setLoading(true);
    try {
      await garageService.addVehicle(currentUser.uid, {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10),
        vin: formData.vin,
        licensePlate: formData.licensePlate || undefined,
        documents: {
          motExpiry: formData.motExpiry || undefined,
          insuranceExpiry: formData.insuranceExpiry || undefined,
          vignetteExpiry: formData.vignetteExpiry || undefined,
        }
      });
      onSuccess();
    } catch (err) {
      logger.error('AddVehicleModal', 'Submission failed', { err });
      alert('Възникна грешка при добавянето.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Добави Автомобил</h2>
          <button onClick={onClose}><X size={20} /></button>
        </ModalHeader>
        <FormForm onSubmit={handleSubmit}>
          
          <FormGroup>
            <label>Марка *</label>
            <input required name="make" value={formData.make} onChange={handleChange} placeholder="напр. Toyota" />
          </FormGroup>

          <FormGroup>
            <label>Модел *</label>
            <input required name="model" value={formData.model} onChange={handleChange} placeholder="напр. Corolla" />
          </FormGroup>

          <FormGroup>
            <label>Година *</label>
            <input required type="number" min="1950" max={new Date().getFullYear() + 1} name="year" value={formData.year} onChange={handleChange} placeholder="2020" />
          </FormGroup>

          <FormGroup>
            <label>VIN (Рама) *</label>
            <input required name="vin" value={formData.vin} onChange={handleChange} placeholder="17 символа" maxLength={17} />
          </FormGroup>

          <FormGroup>
            <label>Рег. Номер</label>
            <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="напр. СВ1234АВ" />
          </FormGroup>

          <DatesGroup>
            <h4>Дати на валидност (по избор)</h4>
            <FormGroup>
              <label>ГТП</label>
              <input type="date" name="motExpiry" value={formData.motExpiry} onChange={handleChange} />
            </FormGroup>
            <FormGroup style={{marginTop: '1rem'}}>
              <label>Гражданска Отговорност</label>
              <input type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange} />
            </FormGroup>
            <FormGroup style={{marginTop: '1rem'}}>
              <label>Винетка</label>
              <input type="date" name="vignetteExpiry" value={formData.vignetteExpiry} onChange={handleChange} />
            </FormGroup>
          </DatesGroup>

          <ButtonGroup>
            <button type="button" className="cancel" onClick={onClose}>Отказ</button>
            <button type="submit" className="submit" disabled={loading}>
              {loading ? 'Запазване...' : 'Добави'}
            </button>
          </ButtonGroup>
        </FormForm>
      </ModalContainer>
    </Overlay>
  );
};
