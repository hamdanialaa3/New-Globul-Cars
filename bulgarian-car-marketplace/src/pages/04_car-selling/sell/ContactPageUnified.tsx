// Contact Page Unified - Responsive Design
// صفحة تواصل موحدة - تصميم متجاوب
// Combines MobileContactPage + UnifiedContactPage functionality
// يجمع وظائف MobileContactPage + UnifiedContactPage

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import SellWorkflowService from '../../../services/sellWorkflowService';
import SelectWithOther from '../../../components/shared/SelectWithOther';
import { CURRENCIES, PRICE_TYPES, AVAILABLE_HOURS } from '../../../data/dropdown-options';
import { toast } from 'react-toastify';
import { ErrorMessages, getErrorMessage } from '../../../constants/ErrorMessages';
import ReviewSummary from '../../../components/ReviewSummary';
import ImageUploadProgress from '../../../components/ImageUploadProgress';
import KeyboardShortcutsHelper from '../../../components/KeyboardShortcutsHelper';
import useDraftAutoSave from '../../../hooks/useDraftAutoSave';
import { useSellWorkflow } from '../../../hooks/useSellWorkflow';
import useWorkflowStep from '../../../hooks/useWorkflowStep';
import WorkflowPersistenceService from '../../../services/workflowPersistenceService';
import ImageUploadService from '../../../services/image-upload-service';
import { logger } from '../../../services/logger-service';
import { SellWorkflowLayout } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { useContactForm } from './Contact/useContactForm';
import { CONTACT_METHODS } from './Contact/contactConstants';
import { ContactIcons } from '../../../components/icons/contact/ContactMethodIcons';

// Mobile Components
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { SellProgressBar } from '../../../components/SellWorkflow';

// Styles - Conditional import based on device
const MobileContactStyles = React.lazy(() => import('./MobileContactPage.styles'));
const UnifiedContactStyles = React.lazy(() => import('./UnifiedContactStyles'));

const ContactPageUnified: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  const {
    contactData,
    availableRegions,
    availableCities,
    handleFieldChange,
    toggleContactMethod
  } = useContactForm({ language: language as 'bg' | 'en', requireContactFields: false });

  const [showOtherCityInput, setShowOtherCityInput] = useState(false);
  const [otherCityValue, setOtherCityValue] = useState('');

  const [pricingData, setPricingData] = useState(() => ({
    price: searchParams.get('price') || '',
    currency: searchParams.get('currency') || 'EUR',
    priceType: searchParams.get('priceType') || 'fixed',
    negotiable: searchParams.get('negotiable') === 'true'
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForcePublish, setShowForcePublish] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Enhanced state for reviews and uploads
  const [showReview, setShowReview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  useEffect(() => {
    SellWorkflowStepStateService.markPending('contact');
  }, []);

  // Hooks for enhanced features
  const { workflowData, updateWorkflowData, clearWorkflowData } = useSellWorkflow();
  const { saveDraft, isSaving, getTimeSinceLastSave } = useDraftAutoSave(
    { ...workflowData, ...Object.fromEntries(searchParams) },
    { currentStep: 7, interval: 30000 }
  );
  const { markComplete, logError } = useWorkflowStep(7, 'Contact Info');

  // Extract ALL parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const transmission = searchParams.get('tr');
  const color = searchParams.get('cl');
  const safety = searchParams.get('safety');
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');
  const extras = searchParams.get('extras');
  const images = searchParams.get('images');
  const price = searchParams.get('price');
  const currency = searchParams.get('currency');
  const priceType = searchParams.get('priceType');
  const negotiable = searchParams.get('negotiable');

  useEffect(() => {
    if (!currentUser) return;
    if (!contactData.sellerName && currentUser.displayName) {
      handleFieldChange('sellerName', currentUser.displayName);
    }
    if (!contactData.sellerEmail && currentUser.email) {
      handleFieldChange('sellerEmail', currentUser.email);
    }
  }, [currentUser, contactData.sellerName, contactData.sellerEmail, handleFieldChange]);

  useEffect(() => {
    const hasPrimaryContact =
      contactData.sellerName ||
      contactData.sellerEmail ||
      contactData.sellerPhone;

    if (hasPrimaryContact) {
      SellWorkflowStepStateService.markCompleted('contact');
    } else {
      SellWorkflowStepStateService.markPending('contact');
    }
  }, [contactData.sellerName, contactData.sellerEmail, contactData.sellerPhone]);

  // Handle city selection
  const handleCityChange = (value: string) => {
    if (value === 'OTHER') {
      setShowOtherCityInput(true);
      handleFieldChange('city', '');
    } else {
      setShowOtherCityInput(false);
      handleFieldChange('city', value);
    }
  };

  // Handle other city input
  const handleOtherCityChange = (value: string) => {
    setOtherCityValue(value);
    handleFieldChange('city', value);
  };

  useEffect(() => {
    if (contactData.city && !availableCities.some(city => city.name === contactData.city)) {
      setShowOtherCityInput(true);
      setOtherCityValue(contactData.city);
    } else {
      setShowOtherCityInput(false);
      setOtherCityValue('');
    }
  }, [contactData.city, availableCities]);

  // Handle pricing changes
  const handlePricingChange = (field: string, value: string | boolean) => {
    setPricingData(prev => ({ ...prev, [field]: value }));
  };

  // Validation function
  const validateForm = (): boolean => {
    const resolvedYear = workflowData.year || year;
    const resolvedModel = workflowData.model || model;

    if (!resolvedModel || resolvedModel.trim() === '') {
      toast.error(getErrorMessage('MODEL_REQUIRED', language as 'bg' | 'en'));
      logError('MODEL_REQUIRED');
      return false;
    }

    if (!resolvedYear) {
      toast.error(getErrorMessage('YEAR_REQUIRED', language as 'bg' | 'en'));
      logError('YEAR_REQUIRED');
      return false;
    }

    const yearNum = parseInt(resolvedYear, 10);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      toast.error(
        getErrorMessage('YEAR_INVALID', language as 'bg' | 'en', {
          currentYear: currentYear.toString()
        })
      );
      return false;
    }

    const totalImages =
      workflowData.imagesCount ??
      (images ? parseInt(images, 10) : 0);

    if (!totalImages || Number.isNaN(totalImages) || totalImages === 0) {
      toast.error(
        language === 'bg'
          ? 'Добавете поне една снимка, за да публикувате.'
          : 'Please add at least one image before publishing.'
      );
      logError('IMAGES_REQUIRED');
      return false;
    }

    return true;
  };

  // Handle publish
  const handlePublish = async () => {
    setError('');

    // Validate first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fallbackModel = language === 'bg' ? 'Неизвестен модел' : 'Unknown Model';
      const finalModel =
        workflowData.model ||
        model ||
        fallbackModel;

      const payload = {
        ...workflowData,
        vehicleType: workflowData.vehicleType || vehicleType || 'car',
        sellerType: workflowData.sellerType || sellerType || 'private',
        make: workflowData.make || make || '',
        model: finalModel,
        year: workflowData.year || year || '',
        mileage: workflowData.mileage || mileage || '0',
        fuelType: workflowData.fuelType || fuelType || '',
        transmission: workflowData.transmission || transmission || '',
        color: workflowData.color || color || '',
        price: pricingData.price || workflowData.price || '',
        currency: pricingData.currency || workflowData.currency || 'EUR',
        priceType: pricingData.priceType || workflowData.priceType || 'fixed',
        negotiable: pricingData.negotiable,
        safety: workflowData.safety || safety || '',
        comfort: workflowData.comfort || comfort || '',
        infotainment: workflowData.infotainment || infotainment || '',
        extras: workflowData.extras || extras || '',
        sellerName: contactData.sellerName || workflowData.sellerName || '',
        sellerEmail: contactData.sellerEmail || workflowData.sellerEmail || '',
        sellerPhone: contactData.sellerPhone || workflowData.sellerPhone || '',
        additionalPhone: contactData.additionalPhone || workflowData.additionalPhone || '',
        preferredContact: contactData.preferredContact.join(','),
        availableHours: contactData.availableHours || workflowData.availableHours || '',
        additionalInfo: contactData.notes || workflowData.additionalInfo || '',
        region: contactData.region || workflowData.region || '',
        city: contactData.city || workflowData.city || '',
        postalCode: contactData.postalCode || workflowData.postalCode || '',
        location: contactData.location || workflowData.location || '',
        images: workflowData.images,
        imagesCount: workflowData.imagesCount
      };

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Creating car listing with workflow data', { workflowData });
      }

      // Get current user ID
      const userId = currentUser?.uid;
      if (!userId) {
        throw new Error(language === 'bg'
          ? 'Моля влезте в профила си'
          : 'Please log in to your account');
      }

      // Flexible validation: Check critical fields only
      const validation = SellWorkflowService.validateWorkflowData(payload, false);

      const carId = await SellWorkflowService.createCarListing(payload, userId);

      // Clear workflow data
      clearWorkflowData();
      localStorage.removeItem('current_draft_id');

      // Success message with toast
      toast.success(
        getErrorMessage('PUBLISHED_SUCCESS', language as 'bg' | 'en'),
        {
          autoClose: 3000,
          position: 'top-center'
        }
      );

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car listing published successfully', { carId });
      }

      setTimeout(() => {
        navigate('/profile/my-ads');
      }, 800);

    } catch (error: any) {
      logger.error('Error creating listing', error as Error, {
        userId: currentUser?.uid,
        errorMessage: error.message
      });
      setError(error.message || (language === 'bg'
        ? 'Възникна грешка при създаване на обявата'
        : 'Error creating listing'));
      setIsSubmitting(false);
    }
  };

  // Handle mobile form submission (navigate to preview)
  const handleMobileSubmit = async () => {
    if (!canContinue) return;

    const params = new URLSearchParams(searchParams.toString());
    Object.entries({
      name: contactData.sellerName,
      phone: contactData.sellerPhone,
      email: contactData.sellerEmail,
      city: contactData.city,
      zipCode: contactData.postalCode
    }).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Navigate to preview/confirmation page
    navigate(`/sell/inserat/${vehicleType || 'car'}/preview?${params.toString()}`);
  };

  const canContinue = !!(
    contactData.sellerName &&
    contactData.sellerPhone &&
    contactData.sellerEmail
  );

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: true },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: true },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  // Flexible validation: Allow publishing with partial data
  const isFormValid = true;

  // Render mobile version
  if (isMobile) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <MobileContactStyles.default.PageWrapper>
          <MobileHeader />
          <div style={{ padding: '0.75rem 1rem 0' }}>
            <SellProgressBar currentStep="contact" />
          </div>

          <MobileContactStyles.default.ContentWrapper>
            <MobileContainer maxWidth="md">
              <MobileStack spacing="lg">
                <MobileContactStyles.default.HeaderSection>
                  <MobileContactStyles.default.PageTitle>
                    {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                  </MobileContactStyles.default.PageTitle>
                  <MobileContactStyles.default.PageSubtitle>
                    {language === 'bg'
                      ? 'Въведете данни за контакт'
                      : 'Enter contact details'}
                  </MobileContactStyles.default.PageSubtitle>
                </MobileContactStyles.default.HeaderSection>

                <MobileContactStyles.default.Card>
                  <MobileContactStyles.default.Grid>
                    <MobileContactStyles.default.FieldGroup>
                      <MobileContactStyles.default.Label htmlFor="name" $required>
                        {language === 'bg' ? 'Име' : 'Name'}
                      </MobileContactStyles.default.Label>
                      <MobileContactStyles.default.Input
                        id="name"
                        type="text"
                        value={contactData.sellerName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('sellerName', e.target.value)}
                        placeholder={language === 'bg' ? 'Вашето име' : 'Your name'}
                      />
                    </MobileContactStyles.default.FieldGroup>

                    <MobileContactStyles.default.FieldGroup>
                      <MobileContactStyles.default.Label htmlFor="phone" $required>
                        {language === 'bg' ? 'Телефон' : 'Phone'}
                      </MobileContactStyles.default.Label>
                      <MobileContactStyles.default.Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        value={contactData.sellerPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('sellerPhone', e.target.value)}
                        placeholder="+359 888 123 456"
                      />
                    </MobileContactStyles.default.FieldGroup>

                    <MobileContactStyles.default.FieldGroup>
                      <MobileContactStyles.default.Label htmlFor="email" $required>
                        {language === 'bg' ? 'Имейл' : 'Email'}
                      </MobileContactStyles.default.Label>
                      <MobileContactStyles.default.Input
                        id="email"
                        type="email"
                        inputMode="email"
                        value={contactData.sellerEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('sellerEmail', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </MobileContactStyles.default.FieldGroup>

                    <MobileContactStyles.default.FieldGroup>
                      <MobileContactStyles.default.Label htmlFor="city">
                        {language === 'bg' ? 'Град' : 'City'}
                      </MobileContactStyles.default.Label>
                      <MobileContactStyles.default.Input
                        id="city"
                        type="text"
                        value={contactData.city}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleCityChange(e.target.value)}
                        placeholder={language === 'bg' ? 'Вашият град' : 'Your city'}
                      />
                    </MobileContactStyles.default.FieldGroup>

                    <MobileContactStyles.default.FieldGroup>
                      <MobileContactStyles.default.Label htmlFor="zipCode">
                        {language === 'bg' ? 'Пощенски код' : 'Postal Code'}
                      </MobileContactStyles.default.Label>
                      <MobileContactStyles.default.Input
                        id="zipCode"
                        type="text"
                        inputMode="numeric"
                        value={contactData.postalCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('postalCode', e.target.value)}
                        placeholder="1000"
                      />
                    </MobileContactStyles.default.FieldGroup>
                  </MobileContactStyles.default.Grid>
                </MobileContactStyles.default.Card>

                <MobileContactStyles.default.InfoCard>
                  <MobileContactStyles.default.InfoTitle>
                    {language === 'bg' ? 'Важна информация' : 'Important Information'}
                  </MobileContactStyles.default.InfoTitle>
                  <MobileContactStyles.default.InfoText>
                    {language === 'bg'
                      ? 'Вашите данни за контакт ще бъдат видими само за купувачите, които проявят интерес към обявата ви.'
                      : 'Your contact details will only be visible to buyers who show interest in your listing.'}
                  </MobileContactStyles.default.InfoText>
                </MobileContactStyles.default.InfoCard>
              </MobileStack>
            </MobileContainer>
          </MobileContactStyles.default.ContentWrapper>

          <MobileContactStyles.default.StickyFooter>
            <MobileContactStyles.default.PrimaryButton
              $enabled={canContinue}
              onClick={handleMobileSubmit}
              disabled={!canContinue}
            >
              {language === 'bg' ? 'Продължи' : 'Continue'}
            </MobileContactStyles.default.PrimaryButton>
          </MobileContactStyles.default.StickyFooter>
        </MobileContactStyles.default.PageWrapper>
      </React.Suspense>
    );
  }

  // Render desktop version
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <UnifiedContactStyles.default.Container>
        <SplitScreenLayout
          leftContent={
            <UnifiedContactStyles.default.ContentSection>
              <UnifiedContactStyles.default.HeaderCard>
                <UnifiedContactStyles.default.Title>
                  {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                </UnifiedContactStyles.default.Title>
                <UnifiedContactStyles.default.Subtitle>
                  {language === 'bg'
                    ? 'Въведете данни за контакт и местоположение'
                    : 'Enter contact and location details'}
                </UnifiedContactStyles.default.Subtitle>
              </UnifiedContactStyles.default.HeaderCard>

              {/* Navigation Buttons */}
              <UnifiedContactStyles.default.NavigationButtons>
                <UnifiedContactStyles.default.Button
                  type="button"
                  $variant="secondary"
                  onClick={() => navigate(-1)}
                >
                  {language === 'bg' ? 'Назад' : 'Back'}
                </UnifiedContactStyles.default.Button>

                <UnifiedContactStyles.default.Button
                  type="button"
                  $variant="secondary"
                  onClick={() => saveDraft(true)}
                  disabled={isSaving}
                >
                  {language === 'bg' ? 'Запази' : 'Save Draft'}
                </UnifiedContactStyles.default.Button>

                <UnifiedContactStyles.default.Button
                  type="button"
                  $variant="primary"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
                    : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
                  }
                </UnifiedContactStyles.default.Button>
              </UnifiedContactStyles.default.NavigationButtons>

              {/* Review Summary */}
              <ReviewSummary
                workflowData={workflowData as Record<string, unknown>}
                imagesCount={workflowData.imagesCount || 0}
                language={language as 'bg' | 'en'}
                onEdit={() => navigate(-1)}
              />

              {/* Pricing Section */}
              <UnifiedContactStyles.default.SectionCard>
                <UnifiedContactStyles.default.SectionTitle>
                  {language === 'bg' ? 'Ценова информация' : 'Pricing Information'}
                </UnifiedContactStyles.default.SectionTitle>

                <UnifiedContactStyles.default.CompactGrid>
                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Цена' : 'Price'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="number"
                      value={pricingData.price}
                      onChange={(e) => handlePricingChange('price', e.target.value)}
                      placeholder={language === 'bg' ? 'Въведете цена' : 'Enter price'}
                      required
                      min="100"
                      max="1000000"
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Валута' : 'Currency'}
                    </UnifiedContactStyles.default.Label>
                    <SelectWithOther
                      options={CURRENCIES}
                      value={pricingData.currency}
                      onChange={(value) => handlePricingChange('currency', value)}
                      placeholder={language === 'bg' ? 'Изберете валута' : 'Select currency'}
                      label={language === 'bg' ? 'Валута' : 'Currency'}
                      required
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Тип цена' : 'Price Type'}
                    </UnifiedContactStyles.default.Label>
                    <SelectWithOther
                      options={PRICE_TYPES}
                      value={pricingData.priceType}
                      onChange={(value) => handlePricingChange('priceType', value)}
                      placeholder={language === 'bg' ? 'Изберете тип цена' : 'Select price type'}
                      label={language === 'bg' ? 'Тип цена' : 'Price Type'}
                      required
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={pricingData.negotiable}
                        onChange={(e) => handlePricingChange('negotiable', e.target.checked)}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      {language === 'bg' ? 'Договаряне възможно' : 'Negotiable'}
                    </UnifiedContactStyles.default.Label>
                  </UnifiedContactStyles.default.FormGroup>
                </UnifiedContactStyles.default.CompactGrid>
              </UnifiedContactStyles.default.SectionCard>

              {/* Personal Information */}
              <UnifiedContactStyles.default.SectionCard>
                <UnifiedContactStyles.default.SectionTitle>
                  {language === 'bg' ? 'Лична информация' : 'Personal Information'}
                </UnifiedContactStyles.default.SectionTitle>

                <UnifiedContactStyles.default.CompactGrid>
                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Име' : 'Name'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="text"
                      value={contactData.sellerName}
                      onChange={(e) => handleFieldChange('sellerName', e.target.value)}
                      placeholder={language === 'bg' ? 'Вашето име' : 'Your name'}
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Имейл' : 'Email'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="email"
                      value={contactData.sellerEmail}
                      onChange={(e) => handleFieldChange('sellerEmail', e.target.value)}
                      placeholder={language === 'bg' ? 'вашият@имейл.com' : 'your@email.com'}
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Телефон' : 'Phone'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="tel"
                      value={contactData.sellerPhone}
                      onChange={(e) => handleFieldChange('sellerPhone', e.target.value)}
                      placeholder="+359 888 123 456"
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label>
                      {language === 'bg' ? 'Допълнителен телефон' : 'Additional Phone'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="tel"
                      value={contactData.additionalPhone}
                      onChange={(e) => handleFieldChange('additionalPhone', e.target.value)}
                      placeholder={language === 'bg' ? '+359 888 654 321' : '+359 888 654 321'}
                    />
                  </UnifiedContactStyles.default.FormGroup>
                </UnifiedContactStyles.default.CompactGrid>
              </UnifiedContactStyles.default.SectionCard>

              {/* Location */}
              <UnifiedContactStyles.default.SectionCard>
                <UnifiedContactStyles.default.SectionTitle>
                  {language === 'bg' ? 'Местоположение' : 'Location'}
                </UnifiedContactStyles.default.SectionTitle>

                <UnifiedContactStyles.default.CompactGrid>
                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Област' : 'Region'}
                    </UnifiedContactStyles.default.Label>
                    <SelectWithOther
                      options={availableRegions.map(region => ({
                        value: region.name,
                        label: region.name,
                        labelEn: region.nameEn
                      }))}
                      value={contactData.region}
                      onChange={(value) => handleFieldChange('region', value)}
                      placeholder={language === 'bg' ? 'Изберете област' : 'Select region'}
                      label={language === 'bg' ? 'Област' : 'Region'}
                      required
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label $required>
                      {language === 'bg' ? 'Град' : 'City'}
                    </UnifiedContactStyles.default.Label>
                    <SelectWithOther
                      options={availableCities.map(city => ({
                        value: city.name,
                        label: city.name,
                        labelEn: city.nameEn || city.name
                      }))}
                      value={contactData.city}
                      onChange={(value) => handleCityChange(value)}
                      placeholder={language === 'bg' ? 'Изберете град' : 'Select city'}
                      label={language === 'bg' ? 'Град' : 'City'}
                      required
                      disabled={!contactData.region}
                      otherPlaceholder={language === 'bg' ? 'Въведете град' : 'Enter city name'}
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label>
                      {language === 'bg' ? 'Пощенски код' : 'Postal Code'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="text"
                      value={contactData.postalCode}
                      onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                      placeholder="1000"
                    />
                  </UnifiedContactStyles.default.FormGroup>

                  <UnifiedContactStyles.default.FormGroup>
                    <UnifiedContactStyles.default.Label>
                      {language === 'bg' ? 'Точно местоположение' : 'Exact Location'}
                    </UnifiedContactStyles.default.Label>
                    <UnifiedContactStyles.default.Input
                      type="text"
                      value={contactData.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder={language === 'bg' ? 'Улица, номер' : 'Street, number'}
                    />
                  </UnifiedContactStyles.default.FormGroup>
                </UnifiedContactStyles.default.CompactGrid>
              </UnifiedContactStyles.default.SectionCard>

              {/* Contact Methods */}
              <UnifiedContactStyles.default.SectionCard>
                <UnifiedContactStyles.default.SectionTitle>
                  {language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method'}
                </UnifiedContactStyles.default.SectionTitle>

                <UnifiedContactStyles.default.ContactMethodsContainer>
                  {CONTACT_METHODS.map(method => {
                    const isSelected = contactData.preferredContact.includes(method.id);
                    const IconComponent = ContactIcons[method.icon];

                    return (
                      <UnifiedContactStyles.default.ContactMethodButton
                        key={method.id}
                        type="button"
                        $selected={isSelected}
                        onClick={() => toggleContactMethod(method.id)}
                      >
                        <IconComponent />
                        <span>{method.label[language as 'bg' | 'en']}</span>
                      </UnifiedContactStyles.default.ContactMethodButton>
                    );
                  })}
                </UnifiedContactStyles.default.ContactMethodsContainer>

                {/* Available Hours */}
                <UnifiedContactStyles.default.FormGroup>
                  <UnifiedContactStyles.default.Label>
                    {language === 'bg' ? 'Предпочитани часове за контакт' : 'Preferred Contact Hours'}
                  </UnifiedContactStyles.default.Label>
                  <SelectWithOther
                    options={AVAILABLE_HOURS}
                    value={contactData.availableHours}
                    onChange={(value) => handleFieldChange('availableHours', value)}
                    placeholder={language === 'bg' ? 'Изберете часове' : 'Select hours'}
                    label={language === 'bg' ? 'Часове' : 'Hours'}
                  />
                </UnifiedContactStyles.default.FormGroup>

                {/* Additional Notes */}
                <UnifiedContactStyles.default.FormGroup>
                  <UnifiedContactStyles.default.Label>
                    {language === 'bg' ? 'Допълнителна информация' : 'Additional Information'}
                  </UnifiedContactStyles.default.Label>
                  <UnifiedContactStyles.default.TextArea
                    value={contactData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder={language === 'bg'
                      ? 'Допълнителни детайли за контакта...'
                      : 'Additional contact details...'}
                    rows={3}
                  />
                </UnifiedContactStyles.default.FormGroup>
              </UnifiedContactStyles.default.SectionCard>
            </UnifiedContactStyles.default.ContentSection>
          }
          rightContent={null}
        />
      </UnifiedContactStyles.default.Container>
    </React.Suspense>
  );
};

export default ContactPageUnified;