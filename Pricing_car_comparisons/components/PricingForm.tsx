/**
 * نموذج إدخال بيانات السيارة
 * Car Pricing Form Component
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { CarSpecs } from '../types/pricing.types';
import { validateCarSpecs } from '../utils/validation';

interface PricingFormProps {
  onSubmit: (specs: CarSpecs) => void;
  isLoading?: boolean;
}

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 14px;
  background: ${props => props.disabled ? '#9ca3af' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const categories = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
];

export const PricingForm: React.FC<PricingFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<Partial<CarSpecs>>({
    brand: '',
    model: '',
    category: 'sedan',
    year: new Date().getFullYear(),
    mileage: 0,
    fuelType: 'petrol',
    transmission: 'manual',
    condition: 'good',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (field: keyof CarSpecs, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateCarSpecs(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData as CarSpecs);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <FormContainer>
      <FormTitle>معلومات السيارة</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>البراند (Brand)</Label>
          <Input
            type="text"
            value={formData.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="مثال: Mercedes-Benz"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>الموديل (Model)</Label>
          <Input
            type="text"
            value={formData.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="مثال: S 500"
            required
          />
        </FormGroup>

        <Row>
          <FormGroup>
            <Label>الفئة (Category)</Label>
            <Select
              value={formData.category || 'sedan'}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>السنة (Year)</Label>
            <Select
              value={formData.year || currentYear}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              required
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </FormGroup>
        </Row>

        <FormGroup>
          <Label>المسافة المقطوعة (Mileage) - km</Label>
          <Input
            type="number"
            value={formData.mileage || 0}
            onChange={(e) => handleChange('mileage', parseInt(e.target.value) || 0)}
            placeholder="مثال: 150000"
            min="0"
            max="1000000"
            required
          />
        </FormGroup>

        <Row>
          <FormGroup>
            <Label>نوع الوقود (Fuel Type)</Label>
            <Select
              value={formData.fuelType || 'petrol'}
              onChange={(e) => handleChange('fuelType', e.target.value)}
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="lpg">LPG</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>ناقل الحركة (Transmission)</Label>
            <Select
              value={formData.transmission || 'manual'}
              onChange={(e) => handleChange('transmission', e.target.value)}
            >
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </Select>
          </FormGroup>
        </Row>

        <FormGroup>
          <Label>الحالة (Condition)</Label>
          <Select
            value={formData.condition || 'good'}
            onChange={(e) => handleChange('condition', e.target.value)}
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </Select>
        </FormGroup>

        {errors.length > 0 && (
          <div>
            {errors.map((error, index) => (
              <ErrorMessage key={index}>{error}</ErrorMessage>
            ))}
          </div>
        )}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'جاري الحساب...' : 'احسب السعر'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};
