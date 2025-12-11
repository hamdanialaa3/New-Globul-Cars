// Pricing Page Unified - Responsive Design
// صفحة التسعير الموحدة - تصميم متجاوب
// Combines MobilePricingPage + Pricing/index.tsx functionality
// يجمع وظائف MobilePricingPage + Pricing/index.tsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import { Euro, TrendingUp, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { carValidationService, ValidationResult } from '../../../services/validation/car-validation.service';
import { usePricingForm } from './Pricing/usePricingForm';
import { useUnifiedWorkflow } from '../../../hooks/useUnifiedWorkflow';

// Mobile Components
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { SellProgressBar } from '../../../components/SellWorkflow';

// Desktop Styles - Import from existing Pricing page
const S = React.lazy(() => import('./Pricing/styles'));

// Mobile Styles
const MobilePricingStyles = React.lazy(() => import('./MobilePricingPage.styles'));

const PricingPageUnified: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  // ✅ UNIFIED WORKFLOW: Use unified workflow (Step 5 - Pricing)
  const { workflowData: unifiedWorkflowData, updateData } = useUnifiedWorkflow(5);
  const { pricingData, handleFieldChange, canContinue, serialize } = usePricingForm();
  
  // ✅ UNIFIED WORKFLOW: Restore pricing data from saved workflow on mount
  useEffect(() => {
    if (unifiedWorkflowData && Object.keys(unifiedWorkflowData).length > 0) {
      console.log('🔄 Restoring pricing data from unified workflow:', {
        price: unifiedWorkflowData.price,
        currency: unifiedWorkflowData.currency,
        priceType: unifiedWorkflowData.priceType,
        negotiable: unifiedWorkflowData.negotiable,
        vatDeductible: unifiedWorkflowData.vatDeductible
      });
      
      // Restore pricing fields if they exist in workflow data
      if (unifiedWorkflowData.price && !pricingData.price) {
        handleFieldChange('price', unifiedWorkflowData.price);
      }
      if (unifiedWorkflowData.currency && unifiedWorkflowData.currency !== pricingData.currency) {
        handleFieldChange('currency', unifiedWorkflowData.currency);
      }
      if (unifiedWorkflowData.priceType && unifiedWorkflowData.priceType !== pricingData.priceType) {
        handleFieldChange('priceType', unifiedWorkflowData.priceType as any);
      }
      if (unifiedWorkflowData.negotiable !== undefined && unifiedWorkflowData.negotiable !== pricingData.negotiable) {
        handleFieldChange('negotiable', unifiedWorkflowData.negotiable);
      }
      if (unifiedWorkflowData.vatDeductible !== undefined && unifiedWorkflowData.vatDeductible !== pricingData.vatDeductible) {
        handleFieldChange('vatDeductible', unifiedWorkflowData.vatDeductible);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unifiedWorkflowData]); // Run when unifiedWorkflowData changes (including on mount)
  
  // ✅ UNIFIED WORKFLOW: Save pricing data on every change
  useEffect(() => {
    updateData({
      price: pricingData.price,
      currency: pricingData.currency,
      priceType: pricingData.priceType,
      negotiable: pricingData.negotiable,
      vatDeductible: pricingData.vatDeductible
    });
  }, [pricingData, updateData]);
  
  // Legacy workflowData for backward compatibility
  const workflowData = unifiedWorkflowData as any;

  // Validation state
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);

  // Real-time price validation
  useEffect(() => {
    const result = carValidationService.validate({ price: parseFloat(pricingData.price || '0') } as any, 'draft');
    setValidationResult(result);
  }, [pricingData.price]);

  useEffect(() => {
    SellWorkflowStepStateService.markPending('pricing');
  }, []);

  useEffect(() => {
    if (pricingData.price && parseFloat(pricingData.price) > 0) {
      SellWorkflowStepStateService.markCompleted('pricing');
    } else {
      SellWorkflowStepStateService.markPending('pricing');
    }
  }, [pricingData.price]);

  const vehicleTypeParam = searchParams.get('vt');
  // ✅ FIX: Get make from multiple sources (URL params, unified workflow data)
  const make = searchParams.get('mk') || 
               searchParams.get('make') || 
               unifiedWorkflowData?.make || 
               (workflowData as any)?.make || 
               (workflowData as any)?.brand || 
               '';

  const handleContinue = (e?: React.MouseEvent) => {
    // ✅ FIX: Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!pricingData.price || parseFloat(pricingData.price) <= 0) {
      // ✅ Show user-friendly error message
      const errorMsg = language === 'bg'
        ? 'Моля въведете валидна цена преди да продължите.'
        : 'Please enter a valid price before continuing.';
      toast.error(errorMsg);
      return;
    }

    try {
      // ✅ CRITICAL: Serialize pricing data for next page
      const params = serialize();
      
      // ✅ CRITICAL: Ensure vehicleType is valid
      const validVehicleType = vehicleType || vehicleTypeParam || 'car';
      const targetPath = `/sell/inserat/${validVehicleType}/contact?${params.toString()}`;
      
      console.log('🚀 Navigating to contact page:', targetPath);
      console.log('📋 Pricing data:', {
        price: pricingData.price,
        currency: pricingData.currency,
        priceType: pricingData.priceType
      });
      
      // ✅ Navigate to contact page
      navigate(targetPath);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      toast.error(language === 'bg'
        ? 'Грешка при навигация. Моля опитайте отново.'
        : 'Navigation error. Please try again.');
    }
  };

  const formattedPrice = pricingData.price
    ? parseFloat(pricingData.price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')
    : '';

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: true },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  // Render mobile version
  if (isMobile) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <MobilePricingStyles.default.PageWrapper>
          <MobileHeader />
          <ProgressWrapper>
            <SellProgressBar currentStep="pricing" />
          </ProgressWrapper>

          <MobilePricingStyles.default.ContentWrapper>
            <MobileContainer maxWidth="md">
              <MobileStack spacing="lg">
                <MobilePricingStyles.default.HeaderSection>
                  <MobilePricingStyles.default.PageTitle>
                    {language === 'bg' ? 'Цена на превозното средство' : 'Vehicle Price'}
                  </MobilePricingStyles.default.PageTitle>
                  <MobilePricingStyles.default.PageSubtitle>
                    {language === 'bg'
                      ? 'Определете цената на вашето превозно средство'
                      : 'Set your vehicle price'}
                  </MobilePricingStyles.default.PageSubtitle>
                </MobilePricingStyles.default.HeaderSection>

                <MobilePricingStyles.default.Card>
                  <MobilePricingStyles.default.FieldGroup>
                    <MobilePricingStyles.default.Label htmlFor="price" $required>
                      {language === 'bg' ? 'Цена (EUR)' : 'Price (EUR)'}
                    </MobilePricingStyles.default.Label>
                    <MobilePricingStyles.default.Input
                      id="price"
                      type="number"
                      inputMode="numeric"
                      value={pricingData.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      placeholder="15000"
                      min="100"
                      max="1000000"
                    />
                    {formattedPrice && (
                      <MobilePricingStyles.default.FormattedPrice>
                        {formattedPrice} EUR
                      </MobilePricingStyles.default.FormattedPrice>
                    )}
                  </MobilePricingStyles.default.FieldGroup>

                  <MobilePricingStyles.default.FieldGroup>
                    <MobilePricingStyles.default.Label htmlFor="priceType">
                      {language === 'bg' ? 'Тип цена' : 'Price Type'}
                    </MobilePricingStyles.default.Label>
                    <MobilePricingStyles.default.Select
                      id="priceType"
                      value={pricingData.priceType}
                      onChange={(e) => handleFieldChange('priceType', e.target.value)}
                    >
                      <option value="fixed">
                        {language === 'bg' ? 'Фиксирана' : 'Fixed'}
                      </option>
                      <option value="negotiable">
                        {language === 'bg' ? 'Договаряема' : 'Negotiable'}
                      </option>
                      <option value="best_offer">
                        {language === 'bg' ? 'Най-добра оферта' : 'Best Offer'}
                      </option>
                    </MobilePricingStyles.default.Select>
                  </MobilePricingStyles.default.FieldGroup>

                  <MobilePricingStyles.default.FieldGroup>
                    <MobilePricingStyles.default.ToggleWrapper>
                      <MobilePricingStyles.default.ToggleSwitch $checked={pricingData.negotiable}>
                        <input
                          type="checkbox"
                          id="negotiable-mobile"
                          checked={pricingData.negotiable}
                          onChange={(e) => handleFieldChange('negotiable', e.target.checked)}
                        />
                        <span className="toggle-slider" />
                      </MobilePricingStyles.default.ToggleSwitch>
                      <MobilePricingStyles.default.ToggleLabel htmlFor="negotiable-mobile">
                        {language === 'bg' ? 'Договаряне възможно' : 'Negotiable'}
                      </MobilePricingStyles.default.ToggleLabel>
                    </MobilePricingStyles.default.ToggleWrapper>
                  </MobilePricingStyles.default.FieldGroup>
                </MobilePricingStyles.default.Card>

                <MobilePricingStyles.default.InfoCard>
                  <MobilePricingStyles.default.InfoTitle>
                    <TrendingUp size={20} />
                    {language === 'bg' ? 'Съвети за ценообразуване' : 'Pricing Tips'}
                  </MobilePricingStyles.default.InfoTitle>
                  <MobilePricingStyles.default.InfoText>
                    {language === 'bg'
                      ? 'Използвайте реалистични цени въз основа на пазара. Можете да проверите подобни обяви за сравнение.'
                      : 'Use realistic prices based on market value. You can check similar listings for comparison.'}
                  </MobilePricingStyles.default.InfoText>
                </MobilePricingStyles.default.InfoCard>
              </MobileStack>
            </MobileContainer>
          </MobilePricingStyles.default.ContentWrapper>

          <MobilePricingStyles.default.StickyFooter>
            <MobilePricingStyles.default.PrimaryButton
              $enabled={canContinue}
              onClick={(e) => handleContinue(e)}
              disabled={!canContinue}
            >
              {language === 'bg' ? 'Продължи' : 'Continue'}
            </MobilePricingStyles.default.PrimaryButton>
          </MobilePricingStyles.default.StickyFooter>
        </MobilePricingStyles.default.PageWrapper>
      </React.Suspense>
    );
  }

  // Render desktop version
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <S.default.FullWidthContainer>
        <S.default.ContentSection>
          {/* FREE LAYOUT - NO FRAMES OR BORDERS */}
          <S.default.FreeLayout>
            {/* Vehicle Summary - LEFT */}
            <S.default.SummarySection>
              {unifiedWorkflowData && (
                <>
                  {unifiedWorkflowData.mileage && (
                    <S.default.SummaryItem>
                      <S.default.SummaryIcon>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </S.default.SummaryIcon>
                      <S.default.SummaryText>
                        {unifiedWorkflowData.mileage.toLocaleString()} {language === 'bg' ? 'км' : 'km'}
                      </S.default.SummaryText>
                    </S.default.SummaryItem>
                  )}
                  {unifiedWorkflowData.transmission && (
                    <S.default.SummaryItem>
                      <S.default.SummaryIcon>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 9v6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </S.default.SummaryIcon>
                      <S.default.SummaryText>
                        {unifiedWorkflowData.transmission === 'automatic' 
                          ? (language === 'bg' ? 'Автоматична' : 'Automatic')
                          : (language === 'bg' ? 'Ръчна' : 'Manual')}
                      </S.default.SummaryText>
                    </S.default.SummaryItem>
                  )}
                  {unifiedWorkflowData.fuelType && (
                    <S.default.SummaryItem>
                      <S.default.SummaryIcon>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6h10v12H3z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M13 9h2l3 3v6h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="6" cy="18" r="1" fill="currentColor"/>
                        </svg>
                      </S.default.SummaryIcon>
                      <S.default.SummaryText>{unifiedWorkflowData.fuelType}</S.default.SummaryText>
                    </S.default.SummaryItem>
                  )}
                  {unifiedWorkflowData.color && (
                    <S.default.SummaryItem>
                      <S.default.SummaryIcon>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.3"/>
                        </svg>
                      </S.default.SummaryIcon>
                      <S.default.SummaryText>{unifiedWorkflowData.color}</S.default.SummaryText>
                    </S.default.SummaryItem>
                  )}
                </>
              )}
            </S.default.SummarySection>

            {/* Price Form - CENTER */}
            <S.default.PriceSection>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <S.default.Label>
                  {language === 'bg' ? 'Цена (EUR)' : 'Price (EUR)'}
                  <span style={{ color: '#ff8f10', marginLeft: '0.25rem' }}>*</span>
                </S.default.Label>
                <S.default.PriceInputWrapper>
                  <S.default.PriceIcon>
                    <Euro size={20} />
                  </S.default.PriceIcon>
                  <S.default.PriceInput
                    type="number"
                    value={pricingData.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    placeholder="15000"
                    min="100"
                    max="1000000"
                    $hasValue={Boolean(pricingData.price && pricingData.price.toString().length > 0)}
                  />
                </S.default.PriceInputWrapper>
                {formattedPrice && (
                  <S.default.FormattedPrice>
                    {formattedPrice} EUR
                  </S.default.FormattedPrice>
                )}
              </div>
              <S.default.FieldGroup style={{ width: '100%' }}>
                <S.default.Select
                  value={pricingData.priceType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    handleFieldChange('priceType', newType);
                    handleFieldChange('negotiable', newType === 'negotiable' || newType === 'best_offer');
                  }}
                >
                  <option value="fixed">{language === 'bg' ? 'Фиксирана' : 'Fixed'}</option>
                  <option value="negotiable">{language === 'bg' ? 'Договаряема' : 'Negotiable'}</option>
                  <option value="best_offer">{language === 'bg' ? 'Най-добра оферта' : 'Best Offer'}</option>
                </S.default.Select>
              </S.default.FieldGroup>
            </S.default.PriceSection>

            {/* Brand Logo - RIGHT */}
            {make && (
              <S.default.LogoSection>
                <WorkflowFlow
                  variant="inline"
                  currentStepIndex={4}
                  totalSteps={8}
                  carBrand={make || undefined}
                  language={language}
                />
              </S.default.LogoSection>
            )}
          </S.default.FreeLayout>

          {/* Navigation buttons below */}
          <S.default.NavigationButtons>
            <S.default.Button
              type="button"
              $variant="secondary"
              onClick={() => navigate(-1)}
            >
              ← {t('common.back')}
            </S.default.Button>
            <S.default.Button
              type="button"
              $variant="primary"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              {t('common.next')} →
            </S.default.Button>
          </S.default.NavigationButtons>

          {/* Info box */}
          <S.default.InfoBox>
            <Info size={20} />
            <div>
              <S.default.InfoTitle>
                {language === 'bg' ? 'Съвети за ценообразуване' : 'Pricing Tips'}
              </S.default.InfoTitle>
              <S.default.InfoText>
                {language === 'bg'
                  ? 'Използвайте реалистични цени въз основа на пазара. Можете да проверите подобни обяви за сравнение.'
                  : 'Use realistic prices based on market value. You can check similar listings for comparison.'}
              </S.default.InfoText>
            </div>
          </S.default.InfoBox>
        </S.default.ContentSection>
      </S.default.FullWidthContainer>
    </React.Suspense>
  );
};

export default PricingPageUnified;