// src/pages/SellCarPage.tsx
// Sell Car Page for Bulgarian Car Marketplace

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

// Styled Components
const SellCarContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 0;
  background: #f8fafc;
`;

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1a202c;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    color: #4a5568;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #1a202c;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #1976d2;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: #1a202c;
    font-size: 0.875rem;
  }

  input, select, textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: 2px solid ${({ variant }) => variant === 'secondary' ? '#d1d5db' : '#1976d2'};
  background: ${({ variant }) => variant === 'secondary' ? 'transparent' : '#1976d2'};
  color: ${({ variant }) => variant === 'secondary' ? '#1a202c' : 'white'};
  font-weight: bold;
  font-size: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  min-width: 150px;

  &:hover {
    background: ${({ variant }) => variant === 'secondary' ? '#f3f4f6' : '#1565c0'};
    border-color: ${({ variant }) => variant === 'secondary' ? '#9ca3af' : '#1565c0'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      background: ${({ variant }) => variant === 'secondary' ? 'transparent' : '#1976d2'};
      border-color: ${({ variant }) => variant === 'secondary' ? '#d1d5db' : '#1976d2'};
      transform: none;
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

// Sell Car Page Component
const SellCarPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    city: '',
    title: '',
    description: ''
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Обявата беше изпратена успешно! / Listing submitted successfully!');
      navigate('/cars');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Възникна грешка / Error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Common car makes
  const carMakes = [
    'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Chevrolet',
    'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volvo', 'Peugeot', 'Renault',
    'Citroën', 'Fiat', 'Opel', 'Škoda', 'SEAT', 'Dacia', 'Mitsubishi', 'Suzuki'
  ];

  // Years from current year down to 1990
  const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);

  return (
    <SellCarContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>{t('sellCar.title', 'Продай колата си')}</h1>
          <p>{t('sellCar.subtitle', 'Публикувайте обява за вашата кола за по-бързо продаване')}</p>
        </PageHeader>

        {/* Form */}
        <FormContainer>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <FormSection>
              <h3>{t('sellCar.basicInfo', 'Основна информация')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('sellCar.make', 'Марка')} *</label>
                  <select name="make" value={formData.make} onChange={handleInputChange} required>
                    <option value="">{t('sellCar.selectMake', 'Избери марка')}</option>
                    {carMakes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.model', 'Модел')} *</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder={t('sellCar.modelPlaceholder', 'Въведете модел')}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.year', 'Година')} *</label>
                  <select name="year" value={formData.year} onChange={handleInputChange} required>
                    <option value="">{t('sellCar.selectYear', 'Избери година')}</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.price', 'Цена')} (€) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="15000"
                    min="0"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.mileage', 'Пробег (км)')}</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="150000"
                    min="0"
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.fuelType', 'Тип гориво')}</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectFuelType', 'Избери тип гориво')}</option>
                    <option value="petrol">{t('sellCar.fuelTypes.petrol', 'Бензин')}</option>
                    <option value="diesel">{t('sellCar.fuelTypes.diesel', 'Дизел')}</option>
                    <option value="electric">{t('sellCar.fuelTypes.electric', 'Електрически')}</option>
                    <option value="hybrid">{t('sellCar.fuelTypes.hybrid', 'Хибриден')}</option>
                    <option value="gas">{t('sellCar.fuelTypes.gas', 'Газ')}</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.transmission', 'Трансмисия')}</label>
                  <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectTransmission', 'Izberi transmisiya')}</option>
                    <option value="manual">{t('sellCar.transmissions.manual', 'Ръчна')}</option>
                    <option value="automatic">{t('sellCar.transmissions.automatic', 'Автоматична')}</option>
                    <option value="semiAutomatic">{t('sellCar.transmissions.semiAutomatic', 'Полуавтоматична')}</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.city', 'Град')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('sellCar.cityPlaceholder', 'Въведете град')}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Description */}
            <FormSection>
              <h3>{t('sellCar.description', 'Описание')}</h3>
              <FormGroup>
                <label>{t('sellCar.title', 'Заглавие')}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('sellCar.titlePlaceholder', 'Кратко заглавие за обявата')}
                />
              </FormGroup>

              <FormGroup>
                <label>{t('sellCar.description', 'Описание')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('sellCar.descriptionPlaceholder', 'Опишете вашата кола подробно...')}
                  rows={4}
                />
              </FormGroup>
            </FormSection>

            {/* Form Actions */}
            <FormActions>
              <ActionButton type="button" variant="secondary" onClick={() => navigate('/cars')}>
                {t('common.cancel', 'Отказ')}
              </ActionButton>
              <ActionButton type="submit" disabled={loading}>
                {loading ? t('common.loading', 'Зареждане...') : t('sellCar.submit', 'Публикувай обява')}
              </ActionButton>
            </FormActions>
          </form>
        </FormContainer>
      </PageContainer>
    </SellCarContainer>
  );
};

export default SellCarPage;

