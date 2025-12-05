// src/components/FinanceModal.tsx
// Finance application modal for Bulgarian car marketplace

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { bulgarianFinancialServices } from '../services/financial-services';
import { FinanceLeadData } from '../types/firestore-models';

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

const PaymentCalculator = styled.div`
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
  margin-top: 20px;
`;

const CalculatorTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #856404;
  font-size: 16px;
`;

const CalculatorResult = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #856404;
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-top: 10px;
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

interface FinanceModalProps {
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

const FinanceModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  carData
}) => {
  const [formData, setFormData] = useState<FinanceLeadData>({
    fullName: '',
    email: '',
    phone: '',
    personalId: '',
    carMake: carData.make,
    carModel: carData.model,
    carYear: carData.year,
    carPrice: carData.price,
    downPayment: 0,
    loanTerm: 60,
    monthlyIncome: 0,
    employmentStatus: 'employed',
    employerName: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    // Calculate monthly payment when relevant fields change
    if (formData.carPrice && formData.downPayment && formData.loanTerm) {
      const payment = bulgarianFinancialServices.calculateMonthlyPayment(
        formData.carPrice,
        formData.downPayment,
        formData.loanTerm
      );
      setMonthlyPayment(payment);
    }
  }, [formData.carPrice, formData.downPayment, formData.loanTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'carPrice' || name === 'downPayment' || name === 'loanTerm' || name === 'monthlyIncome'
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

      if (formData.downPayment >= formData.carPrice) {
        throw new Error('Първоначалната вноска трябва да бъде по-малка от цената на колата');
      }

      // Submit the finance lead
      await bulgarianFinancialServices.submitFinanceLead(carData.id, formData);

      alert('Заявката за финансиране е изпратена успешно! Ще се свържем с Вас скоро.');
      onClose();

    } catch (error: any) {
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
          <ModalTitle>Заявка за финансиране</ModalTitle>
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
            <SectionTitle>Информация за доходи</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Месечен доход *</Label>
                <Input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Трудов статус *</Label>
                <Select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="employed">Нает</option>
                  <option value="self_employed">Самонает</option>
                  <option value="retired">Пенсионер</option>
                  <option value="student">Студент</option>
                </Select>
              </FormGroup>
            </FormRow>
            {formData.employmentStatus === 'employed' && (
              <FormGroup>
                <Label>Име на работодателя</Label>
                <Input
                  type="text"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleInputChange}
                />
              </FormGroup>
            )}
          </FormSection>

          <FormSection>
            <SectionTitle>Условия на кредита</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Първоначална вноска (€)</Label>
                <Input
                  type="number"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleInputChange}
                  min="0"
                  max={carData.price - 1000}
                />
              </FormGroup>
              <FormGroup>
                <Label>Срок на кредита (месеца)</Label>
                <Select
                  name="loanTerm"
                  value={formData.loanTerm}
                  onChange={handleInputChange}
                >
                  <option value="24">24 месеца</option>
                  <option value="36">36 месеца</option>
                  <option value="48">48 месеца</option>
                  <option value="60">60 месеца</option>
                  <option value="72">72 месеца</option>
                </Select>
              </FormGroup>
            </FormRow>

            {monthlyPayment > 0 && (
              <PaymentCalculator>
                <CalculatorTitle>Приблизителна месечна вноска</CalculatorTitle>
                <CalculatorResult>
                  {bulgarianFinancialServices.formatCurrency(monthlyPayment)} / месец
                </CalculatorResult>
              </PaymentCalculator>
            )}
          </FormSection>

          <FormSection>
            <SectionTitle>Допълнителна информация</SectionTitle>
            <FormGroup>
              <Label>Допълнителни бележки</Label>
              <TextArea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Опишете допълнителни обстоятелства или предпочитания..."
              />
            </FormGroup>
          </FormSection>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Изпращане...' : 'Изпрати заявка за финансиране'}
          </SubmitButton>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FinanceModal;