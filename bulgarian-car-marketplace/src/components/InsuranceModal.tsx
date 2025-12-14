// src/components/InsuranceModal.tsx
// Insurance quote modal for Bulgarian car marketplace

import React, { useState } from 'react';
import styled from 'styled-components';
import { bulgarianFinancialServices } from '../services/financial-services';
import { InsuranceQuoteData } from '../types/firestore-models';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background: #f8f8f8;
    color: #666;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #007bff;
`;

const CarInfo = styled.div`
  background: #e8f4fd;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #bee5eb;
  margin-bottom: 20px;
`;

const CarInfoTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #0c5460;
  font-size: 16px;
`;

const CarInfoText = styled.p`
  margin: 5px 0;
  color: #0c5460;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
  font-size: 14px;
`;

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  carData: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
}

const InsuranceModal: React.FC<InsuranceModalProps> = ({
  isOpen,
  onClose,
  carData
}) => {
  const [formData, setFormData] = useState<InsuranceQuoteData>({
    fullName: '',
    email: '',
    phone: '',
    personalId: '',
    carMake: carData.make,
    carModel: carData.model,
    carYear: carData.year,
    carPrice: carData.price,
    carMileage: 0,
    insuranceType: 'comprehensive',
    coverageAmount: carData.price,
    deductible: 500,
    preferredInsurer: '',
    driverAge: 25,
    drivingExperience: 5,
    accidentHistory: false,
    licenseIssueDate: '',
    parkingLocation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'carPrice' || name === 'carMileage' || name === 'coverageAmount' || name === 'deductible' || name === 'driverAge' || name === 'drivingExperience'
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate Bulgarian Personal ID
      if (!bulgarianFinancialServices.validateBulgarianPersonalId(formData.personalId)) {
        throw new Error('Невалиден ЕГН');
      }

      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error('Моля попълнете всички задължителни полета');
      }

      // Submit the insurance quote request
      await bulgarianFinancialServices.submitInsuranceQuote(carData.id, formData);

      alert('Заявката за застраховка е изпратена успешно! Ще се свържем с Вас скоро.');
      onClose();

    } catch (error: unknown) {
      setError(error.message || 'Възникна грешка при изпращане на заявката');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Заявка за застраховка</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <CarInfo>
          <CarInfoTitle>Информация за автомобила</CarInfoTitle>
          <CarInfoText><strong>Модел:</strong> {carData.make} {carData.model}</CarInfoText>
          <CarInfoText><strong>Година:</strong> {carData.year}</CarInfoText>
          <CarInfoText><strong>Цена:</strong> {bulgarianFinancialServices.formatCurrency(carData.price)}</CarInfoText>
        </CarInfo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Лични данни</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Имена *</Label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>ЕГН *</Label>
                <Input
                  type="text"
                  name="personalId"
                  value={formData.personalId}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  maxLength={10}
                  required
                />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <Label>Имейл *</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Телефон *</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+359 XX XXX XXXX"
                  required
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Информация за автомобила</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Пробег (км) *</Label>
                <Input
                  type="number"
                  name="carMileage"
                  value={formData.carMileage}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Сума на покритието (€)</Label>
                <Input
                  type="number"
                  name="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={handleInputChange}
                  min="0"
                />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <Label>Франшиза (€)</Label>
                <Input
                  type="number"
                  name="deductible"
                  value={formData.deductible}
                  onChange={handleInputChange}
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <Label>Предпочитана застрахователна компания</Label>
                <Select
                  name="preferredInsurer"
                  value={formData.preferredInsurer}
                  onChange={handleInputChange}
                >
                  <option value="">Няма предпочитание</option>
                  <option value="allianz">Allianz Bulgaria</option>
                  <option value="bulstrad">Bulstrad</option>
                  <option value="uniqa">Uniqa</option>
                  <option value="generali">Generali</option>
                </Select>
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Информация за водача</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Възраст *</Label>
                <Input
                  type="number"
                  name="driverAge"
                  value={formData.driverAge}
                  onChange={handleInputChange}
                  min="18"
                  max="80"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Години шофьорски стаж *</Label>
                <Input
                  type="number"
                  name="drivingExperience"
                  value={formData.drivingExperience}
                  onChange={handleInputChange}
                  min="0"
                  max="60"
                  required
                />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <Label>Дата на издаване на книжка</Label>
                <Input
                  type="date"
                  name="licenseIssueDate"
                  value={formData.licenseIssueDate}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Местопаркиране</Label>
                <Input
                  type="text"
                  name="parkingLocation"
                  value={formData.parkingLocation}
                  onChange={handleInputChange}
                  placeholder="Град в България"
                />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  name="accidentHistory"
                  checked={formData.accidentHistory}
                  onChange={handleInputChange}
                />
                Имам история на пътно-транспортни произшествия
              </CheckboxLabel>
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>Вид застраховка</SectionTitle>
            <FormGroup>
              <Label>Тип застраховка *</Label>
              <Select
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleInputChange}
                required
              >
                <option value="comprehensive">Каско (пълно покритие)</option>
                <option value="third_party">Гражданска отговорност</option>
                <option value="accident_only">Само при злополука</option>
              </Select>
            </FormGroup>
          </FormSection>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Изпращане...' : 'Изпрати заявка за застраховка'}
          </SubmitButton>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default InsuranceModal;