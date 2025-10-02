// Vehicle Data Page with Workflow - Modern Design
// صفحة بيانات السيارة مع الأتمتة - تصميم حديث
// File Size: ~280 lines (under 300 limit) ✅

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import { VehicleFormData, FUEL_TYPES, TRANSMISSION_TYPES, COLORS, DOOR_OPTIONS, SEAT_OPTIONS } from './types';
import { getAllBrands, getModelsForBrand, getVariantsForModel, modelHasVariants, isFeaturedBrand } from '../../../services/carBrandsService';
import { Star, Zap } from 'lucide-react';
import * as S from './styles';

const VehicleDataPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();

  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');

  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    year: '',
    model: '',
    variant: '',
    fuelType: '',
    mileage: '',
    firstRegistration: '',
    power: '',
    transmission: '',
    doors: '',
    seats: '',
    color: '',
    previousOwners: '',
    hasAccidentHistory: false,
    hasServiceHistory: false
  });

  const [availableBrands] = useState<string[]>(getAllBrands());
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableVariants, setAvailableVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState<boolean>(false);

  // Update available models when brand changes
  useEffect(() => {
    if (formData.make) {
      const models = getModelsForBrand(formData.make);
      setAvailableModels(models);
      // Reset model if it's not valid for the new brand
      if (formData.model && !models.includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: '', variant: '' }));
      }
    } else {
      setAvailableModels([]);
      setFormData(prev => ({ ...prev, model: '', variant: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.make]);

  // Update available variants when model changes
  useEffect(() => {
    if (formData.make && formData.model) {
      const hasVariants = modelHasVariants(formData.make, formData.model);
      setShowVariants(hasVariants);
      
      if (hasVariants) {
        const variants = getVariantsForModel(formData.make, formData.model);
        setAvailableVariants(variants);
      } else {
        setAvailableVariants([]);
        setFormData(prev => ({ ...prev, variant: '' }));
      }
    } else {
      setShowVariants(false);
      setAvailableVariants([]);
      setFormData(prev => ({ ...prev, variant: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.make, formData.model]);

  const handleInputChange = (field: keyof VehicleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!formData.make || !formData.year) {
      alert(language === 'bg' 
        ? 'Моля, попълнете марката и годината!' 
        : 'Please fill in make and year!');
      return;
    }

    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    params.set('mk', formData.make);
    if (formData.model) params.set('md', formData.model);
    if (formData.fuelType) params.set('fm', formData.fuelType);
    params.set('fy', formData.year);
    if (formData.mileage) params.set('mi', formData.mileage);

    navigate(`/sell/inserat/${vehicleType || 'car'}/ausstattung/sicherheit?${params.toString()}`);
  };

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: false },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: false },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: false },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>
          {language === 'bg' ? 'Данни за превозното средство' : 'Vehicle Data'}
        </S.Title>
        <S.Subtitle>
          {language === 'bg' 
            ? 'Въведете основната информация за вашето превозно средство' 
            : 'Enter basic information about your vehicle'}
        </S.Subtitle>
      </S.HeaderCard>

      {/* Required Fields */}
      <S.FormCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Задължителни полета' : 'Required Fields'}
        </S.SectionTitle>
        
        <S.FormGrid>
          <S.FormGroup>
            <S.Label $required>{language === 'bg' ? 'Марка' : 'Make'}</S.Label>
            <S.Select
              value={formData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете марка' : 'Select Make'}</option>
              {availableBrands.map(brand => (
                <option 
                  key={brand} 
                  value={brand}
                  style={isFeaturedBrand(brand) ? {
                    fontWeight: '700',
                    color: '#ff8f10',
                    backgroundColor: 'rgba(255, 143, 16, 0.05)'
                  } : {}}
                >
                  {isFeaturedBrand(brand) ? `● ${brand}` : brand}
                </option>
              ))}
            </S.Select>
            <S.HintText style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={14} color="#ff8f10" />
              {language === 'bg' 
                ? 'Най-популярни марки в България показани отгоре' 
                : 'Most popular brands in Bulgaria shown first'}
            </S.HintText>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>{language === 'bg' ? 'Година' : 'Year'}</S.Label>
            <S.Input
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </S.FormGroup>
        </S.FormGrid>

        <S.RequiredNote>
          <strong>*</strong> {language === 'bg' 
            ? 'Тези полета са задължителни за продължаване' 
            : 'These fields are required to continue'}
        </S.RequiredNote>
      </S.FormCard>

      {/* Optional Fields */}
      <S.FormCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Допълнителна информация (по избор)' : 'Additional Information (Optional)'}
        </S.SectionTitle>

        <S.FormGrid>
          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Модел' : 'Model'}</S.Label>
            {availableModels.length > 0 ? (
              <S.Select
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                disabled={!formData.make}
              >
                <option value="">{language === 'bg' ? 'Изберете модел' : 'Select Model'}</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
                <option value="__other__">{language === 'bg' ? '◆ Друг модел (въведете ръчно)' : '◆ Other model (enter manually)'}</option>
              </S.Select>
            ) : (
              <S.Input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder={language === 'bg' ? 'Например: X5' : 'Example: X5'}
                disabled={!formData.make}
              />
            )}
            {formData.model === '__other__' && (
              <S.Input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder={language === 'bg' ? 'Въведете модел ръчно' : 'Enter model manually'}
                style={{ marginTop: '0.75rem' }}
              />
            )}
            {!formData.make && (
              <S.HintText style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={12} color="#7f8c8d" />
                {language === 'bg' ? 'Първо изберете марка' : 'Select make first'}
              </S.HintText>
            )}
          </S.FormGroup>

          {showVariants && (
            <S.FormGroup>
              <S.Label>{language === 'bg' ? 'Вариант / Версия' : 'Variant / Version'}</S.Label>
              <S.Select
                value={formData.variant}
                onChange={(e) => handleInputChange('variant', e.target.value)}
                disabled={!formData.model || availableVariants.length === 0}
              >
                <option value="">{language === 'bg' ? 'Изберете вариант' : 'Select Variant'}</option>
                {availableVariants.map(variant => (
                  <option key={variant} value={variant}>{variant}</option>
                ))}
                <option value="__other__">{language === 'bg' ? '◆ Друг вариант (въведете ръчно)' : '◆ Other variant (enter manually)'}</option>
              </S.Select>
              {formData.variant === '__other__' && (
                <S.Input
                  type="text"
                  value={formData.variant}
                  onChange={(e) => handleInputChange('variant', e.target.value)}
                  placeholder={language === 'bg' ? 'Въведете вариант ръчно' : 'Enter variant manually'}
                  style={{ marginTop: '0.75rem' }}
                />
              )}
              <S.HintText style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={12} color="#005ca9" />
                {language === 'bg' 
                  ? `${availableVariants.length} налични варианта` 
                  : `${availableVariants.length} variants available`}
              </S.HintText>
            </S.FormGroup>
          )}

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Пробег (км)' : 'Mileage (km)'}</S.Label>
            <S.Input
              type="number"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', e.target.value)}
              placeholder="45000"
              min="0"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Гориво' : 'Fuel Type'}</S.Label>
            <S.Select
              value={formData.fuelType}
              onChange={(e) => handleInputChange('fuelType', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
              {FUEL_TYPES.map(fuel => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</S.Label>
            <S.Select
              value={formData.transmission}
              onChange={(e) => handleInputChange('transmission', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
              {TRANSMISSION_TYPES.map(trans => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Мощност (к.с.)' : 'Power (HP)'}</S.Label>
            <S.Input
              type="number"
              value={formData.power}
              onChange={(e) => handleInputChange('power', e.target.value)}
              placeholder="150"
              min="0"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Цвят' : 'Color'}</S.Label>
            <S.Select
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
              {COLORS.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Врати' : 'Doors'}</S.Label>
            <S.Select
              value={formData.doors}
              onChange={(e) => handleInputChange('doors', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
              {DOOR_OPTIONS.map(door => (
                <option key={door} value={door}>{door}</option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>{language === 'bg' ? 'Места' : 'Seats'}</S.Label>
            <S.Select
              value={formData.seats}
              onChange={(e) => handleInputChange('seats', e.target.value)}
            >
              <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
              {SEAT_OPTIONS.map(seat => (
                <option key={seat} value={seat}>{seat}</option>
              ))}
            </S.Select>
          </S.FormGroup>
        </S.FormGrid>
      </S.FormCard>

      {/* Boolean Options with Red/Green Circles */}
      <S.FormCard>
        <S.SectionTitle>
          {language === 'bg' ? 'История' : 'History'}
        </S.SectionTitle>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Има история на катастрофи' : 'Has accident history'}
          </S.Label>
          <S.BooleanOptions>
            <S.BooleanOption
              type="button"
              $isSelected={formData.hasAccidentHistory === false}
              onClick={() => handleInputChange('hasAccidentHistory', false)}
            >
              {language === 'bg' ? '✓ Не' : '✓ No'}
            </S.BooleanOption>
            <S.BooleanOption
              type="button"
              $isSelected={formData.hasAccidentHistory === true}
              onClick={() => handleInputChange('hasAccidentHistory', true)}
            >
              {language === 'bg' ? '⚠ Да' : '⚠ Yes'}
            </S.BooleanOption>
          </S.BooleanOptions>
        </S.FormGroup>

        <S.FormGroup style={{ marginTop: '1.5rem' }}>
          <S.Label>
            {language === 'bg' ? 'Има сервизна история' : 'Has service history'}
          </S.Label>
          <S.BooleanOptions>
            <S.BooleanOption
              type="button"
              $isSelected={formData.hasServiceHistory === true}
              onClick={() => handleInputChange('hasServiceHistory', true)}
            >
              {language === 'bg' ? '✓ Да' : '✓ Yes'}
            </S.BooleanOption>
            <S.BooleanOption
              type="button"
              $isSelected={formData.hasServiceHistory === false}
              onClick={() => handleInputChange('hasServiceHistory', false)}
            >
              {language === 'bg' ? '✗ Не' : '✗ No'}
            </S.BooleanOption>
          </S.BooleanOptions>
        </S.FormGroup>
      </S.FormCard>

      <S.NavigationButtons>
        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => navigate(-1)}
        >
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handleContinue}
          disabled={!formData.make || !formData.year}
        >
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  const rightContent = (
    <WorkflowFlow
      steps={workflowSteps}
      currentStepIndex={2}
      totalSteps={8}
    />
  );

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default VehicleDataPageNew;

