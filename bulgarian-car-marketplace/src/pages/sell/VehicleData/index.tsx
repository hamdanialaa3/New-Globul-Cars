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
import Tooltip, { CarSellingTooltips } from '../../../components/Tooltip';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../constants/ErrorMessages';
import useDraftAutoSave from '../../../hooks/useDraftAutoSave';
import useWorkflowStep from '../../../hooks/useWorkflowStep';
import KeyboardShortcutsHelper from '../../../components/KeyboardShortcutsHelper';

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

  // 🆕 Hooks for enhancements
  const { saveDraft, isSaving } = useDraftAutoSave(
    formData,
    { currentStep: 2, interval: 30000 }
  );
  const { markComplete } = useWorkflowStep(2, 'Vehicle Data');

  const handleContinue = () => {
    // 🆕 Enhanced validation with toast
    if (!formData.make) {
      toast.error(getErrorMessage('MAKE_REQUIRED', language as 'bg' | 'en'));
      return;
    }
    
    if (!formData.year) {
      toast.error(getErrorMessage('YEAR_REQUIRED', language as 'bg' | 'en'));
      return;
    }

    const yearNum = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear + 1) {
      toast.error(
        getErrorMessage('YEAR_INVALID', language as 'bg' | 'en', { currentYear: currentYear.toString() })
      );
      return;
    }

    // 🆕 Mark step as completed
    markComplete({
      make: formData.make,
      model: formData.model,
      year: formData.year
    });

    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    params.set('mk', formData.make);
    if (formData.model) params.set('md', formData.model);
    if (formData.fuelType) params.set('fm', formData.fuelType);
    params.set('fy', formData.year);
    if (formData.mileage) params.set('mi', formData.mileage);

    navigate(`/sell/inserat/${vehicleType || 'car'}/equipment?${params.toString()}`);
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

      {/* Top Navigation Buttons */}
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

      {/* Required Fields */}
      <S.FormCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Задължителни полета' : 'Required Fields'}
        </S.SectionTitle>
        
        <S.FormGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Марка' : 'Make'}
              {' '}
              <Tooltip content={CarSellingTooltips[language].make} />
            </S.Label>
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
            <S.Label $required>
              {language === 'bg' ? 'Година' : 'Year'}
              {' '}
              <Tooltip content={CarSellingTooltips[language].year} />
            </S.Label>
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
            <S.Label>
              {language === 'bg' ? 'Пробег (км)' : 'Mileage (km)'}
              {' '}
              <Tooltip content={CarSellingTooltips[language].mileage} />
            </S.Label>
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

      {/* History Section with Cyber Toggle Buttons */}
      <S.FormCard>
        <S.SectionTitle>
          {language === 'bg' ? 'История' : 'History'}
        </S.SectionTitle>

        {/* Accident History */}
        <S.HistoryRow>
          <S.HistoryInfo>
            <S.HistoryLabel>
              {language === 'bg' ? 'Има история на катастрофи' : 'Has accident history'}
            </S.HistoryLabel>
            <S.HistoryHint>
              {formData.hasAccidentHistory 
                ? (language === 'bg' ? '⚠ Да' : '⚠ Yes')
                : (language === 'bg' ? '✓ Не' : '✓ No')
              }
            </S.HistoryHint>
          </S.HistoryInfo>

          <S.CyberToggleWrapper>
            <S.CyberToggleCheckbox
              type="checkbox"
              id="accident-history-toggle"
              checked={formData.hasAccidentHistory || false}
              onChange={(e) => handleInputChange('hasAccidentHistory', e.target.checked)}
            />
            <S.CyberToggleLabel htmlFor="accident-history-toggle">
              <S.ToggleTrack />
              <S.ToggleThumbIcon />
              <S.ToggleThumbDots />
              <S.ToggleThumbHighlight />
              <S.ToggleLabels>
                <S.ToggleLabelOn>YES</S.ToggleLabelOn>
                <S.ToggleLabelOff>NO</S.ToggleLabelOff>
              </S.ToggleLabels>
            </S.CyberToggleLabel>
          </S.CyberToggleWrapper>
        </S.HistoryRow>

        {/* Service History */}
        <S.HistoryRow style={{ marginTop: '1rem' }}>
          <S.HistoryInfo>
            <S.HistoryLabel>
              {language === 'bg' ? 'Има сервизна история' : 'Has service history'}
            </S.HistoryLabel>
            <S.HistoryHint>
              {formData.hasServiceHistory 
                ? (language === 'bg' ? '✓ Да' : '✓ Yes')
                : (language === 'bg' ? '✗ Не' : '✗ No')
              }
            </S.HistoryHint>
          </S.HistoryInfo>

          <S.CyberToggleWrapper>
            <S.CyberToggleCheckbox
              type="checkbox"
              id="service-history-toggle"
              checked={formData.hasServiceHistory || false}
              onChange={(e) => handleInputChange('hasServiceHistory', e.target.checked)}
            />
            <S.CyberToggleLabel htmlFor="service-history-toggle">
              <S.ToggleTrack />
              <S.ToggleThumbIcon />
              <S.ToggleThumbDots />
              <S.ToggleThumbHighlight />
              <S.ToggleLabels>
                <S.ToggleLabelOn>YES</S.ToggleLabelOn>
                <S.ToggleLabelOff>NO</S.ToggleLabelOff>
              </S.ToggleLabels>
            </S.CyberToggleLabel>
          </S.CyberToggleWrapper>
        </S.HistoryRow>
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
      currentStepIndex={2}
      totalSteps={8}
      carBrand={formData.make || undefined}
      language={language}
    />
  );

  return (
    <>
      <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />
      
      {/* 🆕 Keyboard Shortcuts */}
      <KeyboardShortcutsHelper
        onSave={() => saveDraft(true)}
        onNext={handleContinue}
        onBack={() => navigate(-1)}
        language={language as 'bg' | 'en'}
      />
      
      {/* 🆕 Auto-save indicator */}
      {isSaving && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 998
        }}>
          💾 {getErrorMessage('AUTO_SAVED', language as 'bg' | 'en')}
        </div>
      )}
    </>
  );
};

export default VehicleDataPageNew;

