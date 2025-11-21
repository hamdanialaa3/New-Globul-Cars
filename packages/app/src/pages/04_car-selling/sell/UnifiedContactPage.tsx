// Unified Contact Page - All Contact Info in One Page
// صفحة موحدة للتواصل - كل المعلومات في مكان واحد

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { useAuth } from '@globul-cars/core/contexts/AuthProvider';
import SplitScreenLayout from '@globul-cars/ui/components/SplitScreenLayout';
import { WorkflowFlow } from '@globul-cars/ui/components/WorkflowVisualization';
import SellWorkflowService from '@globul-cars/services/sellWorkflowService';
import SelectWithOther from '@globul-cars/ui/componentsshared/SelectWithOther';
import { CURRENCIES, PRICE_TYPES, AVAILABLE_HOURS } from '@globul-cars/core/constants/dropdown-options';
import * as S from './UnifiedContactStyles';
import { toast } from 'react-toastify';
import { ErrorMessages, getErrorMessage } from '@globul-cars/core/constantsErrorMessages';
import ReviewSummary from '@globul-cars/ui/components/ReviewSummary';
import ImageUploadProgress from '@globul-cars/ui/components/ImageUploadProgress';
import KeyboardShortcutsHelper from '@globul-cars/ui/components/KeyboardShortcutsHelper';
import useDraftAutoSave from '@globul-cars/core/useDraftAutoSave';
import { useSellWorkflow } from '@globul-cars/core/useSellWorkflow';
import useWorkflowStep from '@globul-cars/core/useWorkflowStep';
import WorkflowPersistenceService from '@globul-cars/services/workflowPersistenceService';
import ImageUploadService from '@globul-cars/services/image-upload-service';
import { logger } from '@globul-cars/services';
import { SellWorkflowLayout } from '@globul-cars/ui/components/SellWorkflow';
import SellWorkflowStepStateService from '@globul-cars/services/sellWorkflowStepState';
import { useContactForm } from './Contact/useContactForm';
import { CONTACT_METHODS } from './Contact/contactConstants';
import { ContactIcons } from '@globul-cars/ui/componentsicons/contact/ContactMethodIcons';

const UnifiedContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();

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
    price: searchParams.get('price') || workflowData.price || '',
    currency: searchParams.get('currency') || workflowData.currency || 'EUR',
    priceType:
      searchParams.get('priceType') ||
      (workflowData.priceType as string) ||
      'fixed',
    negotiable:
      searchParams.get('negotiable') === 'true' ||
      workflowData.negotiable === true ||
      workflowData.negotiable === 'true'
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForcePublish, setShowForcePublish] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // 🆕 New state for enhancements
  const [showReview, setShowReview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  useEffect(() => {
    SellWorkflowStepStateService.markPending('contact');
  }, []);

  
  // 🆕 Hooks for new features
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
  const model = searchParams.get('md'); // ← IMPORTANT!
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

  const handlePricingChange = (field: string, value: string | boolean) => {
    setPricingData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setPricingData(prev => ({
      price: prev.price || workflowData.price || '',
      currency: prev.currency || workflowData.currency || 'EUR',
      priceType:
        prev.priceType ||
        (workflowData.priceType as string) ||
        'fixed',
      negotiable:
        typeof prev.negotiable === 'boolean'
          ? prev.negotiable
          : workflowData.negotiable === true ||
            workflowData.negotiable === 'true'
    }));
  }, [
    workflowData.price,
    workflowData.currency,
    workflowData.priceType,
    workflowData.negotiable
  ]);

  useEffect(() => {
    updateWorkflowData(
      {
        price: pricingData.price,
        currency: pricingData.currency,
        priceType: pricingData.priceType,
        negotiable: pricingData.negotiable
      },
      'pricing'
    );
  }, [pricingData, updateWorkflowData]);

  // 🆕 Enhanced validation with better error messages
  const validateForm = (): boolean => {
    const resolvedMake = workflowData.make || make;
    const resolvedYear = workflowData.year || year;

    if (!resolvedMake) {
      toast.error(getErrorMessage('MAKE_REQUIRED', language as 'bg' | 'en'));
      logError('MAKE_REQUIRED');
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

  const handlePublish = async () => {
    setError('');
    
    // 🆕 Validate first
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
      
      // ⚡ FLEXIBLE VALIDATION: Check critical fields only
      const validation = SellWorkflowService.validateWorkflowData(payload, false);
      
      // If critical fields are missing, block publication
      if (validation.criticalMissing) {
        setError(
          `${language === 'bg' ? 'Критична информация липсва' : 'Critical information missing'}: ${validation.missingFields.join(', ')}`
        );
        setIsSubmitting(false);
        return;
      }
      
      // If non-critical fields are missing, show warning with option to proceed
      if (!validation.isValid && !showForcePublish) {
        setMissingFields(validation.missingFields);
        setError(
          `${language === 'bg' ? 'Препоръчителни полета липсват' : 'Recommended fields are missing'}: ${validation.missingFields.join(', ')}`
        );
        setShowForcePublish(true);
        setIsSubmitting(false);
        return;
      }

      // ✅ Load images from localStorage and convert to Files
      let imageFiles: File[] = [];
      try {
        imageFiles = WorkflowPersistenceService.getImagesAsFiles();
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Loaded ${imageFiles.length} images from persistence`);
        }
      } catch (error) {
        logger.error('Error loading images from WorkflowPersistenceService', error as Error);
      }

      // 🆕 Create listing first (without images)
      const carId = await SellWorkflowService.createCarListing(payload, userId);

      if (!carId) {
        throw new Error('Failed to create listing');
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car listing created', { carId });
      }

      // 🆕 Upload images with progress tracking (if available)
      if (imageFiles && imageFiles.length > 0) {
        setTotalImages(imageFiles.length);
        
        try {
          const imageUrls = await ImageUploadService.uploadMultipleImages(
            imageFiles,
            carId,
            (current, total, progress) => {
              setCurrentImageIndex(current);
              setUploadProgress(progress);
            },
            (fileName, error) => {
              logger.error(`Upload failed for ${fileName}`, error);
              setUploadErrors(prev => [...prev, `${fileName}: ${error.message}`]);
            }
          );

          if (process.env.NODE_ENV === 'development') {
            logger.debug(`Uploaded ${imageUrls.length} images`);
          }

          // Update car document with image URLs
          if (imageUrls.length > 0) {
            await SellWorkflowService.updateCarListing(carId, {
              images: imageUrls as any
            });
          }
        } catch (uploadError) {
          logger.error('Image upload failed', uploadError as Error, { carId });
          toast.warning(
            language === 'bg'
              ? 'Някои снимки не са качени, но обявата е създадена. Можете да добавите снимки по-късно.'
              : 'Some images failed to upload, but the listing was created. You can add images later.',
            { autoClose: 5000 }
          );
        }
      }

      // 🆕 Mark step as completed in analytics
      await markComplete({
        carId,
        make: payload.make,
        model: payload.model,
        price: payload.price ? parseFloat(payload.price) : 0
      });

      // 🌐 N8N Integration
      try {
        const N8nService = await import('@/services/n8n-integration');
        await N8nService.default.onCarPublished(currentUser.uid, carId, payload as any);
      } catch (n8nError) {
        logger.warn('N8N webhook failed (non-critical)', { error: n8nError, carId });
      }

      clearWorkflowData();
      localStorage.removeItem('current_draft_id');

      // 🆕 Success message with toast
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

  // ⚡ FLEXIBLE VALIDATION: Allow publishing with partial data
  const isFormValid = true;

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>
          {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
        </S.Title>
        <S.Subtitle>
          {language === 'bg' 
            ? 'Въведете данни за контакт и местоположение' 
            : 'Enter contact and location details'}
        </S.Subtitle>

        <S.BrandOrbitInline>
          <WorkflowFlow
            variant="inline"
            currentStepIndex={5}
            totalSteps={8}
            carBrand={make || workflowData.make || undefined}
            language={language}
          />
        </S.BrandOrbitInline>
      </S.HeaderCard>

      {/* Top Navigation Buttons */}
      <S.NavigationButtons>
        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => navigate(-1)}
        >
          {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => saveDraft(true)}
          disabled={isSaving}
        >
          {language === 'bg' ? 'Запази' : 'Save Draft'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
            : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
          }
        </S.Button>
      </S.NavigationButtons>

      {/* 🆕 Review Summary before publishing */}
      <ReviewSummary
        workflowData={workflowData as Record<string, unknown>}
        imagesCount={workflowData.imagesCount || 0}
        language={language as 'bg' | 'en'}
        onEdit={() => navigate(-1)}
      />

      {/* Section 1: Personal Info */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Ценова информация' : 'Pricing Information'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Цена' : 'Price'}
            </S.Label>
            <S.Input
              type="number"
              value={pricingData.price}
              onChange={(e) => handlePricingChange('price', e.target.value)}
              placeholder={language === 'bg' ? 'Въведете цена' : 'Enter price'}
              required
              min="100"
              max="1000000"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Валута' : 'Currency'}
            </S.Label>
            <SelectWithOther
              options={CURRENCIES}
              value={pricingData.currency}
              onChange={(value) => handlePricingChange('currency', value)}
              placeholder={language === 'bg' ? 'Изберете валута' : 'Select currency'}
              label={language === 'bg' ? 'Валута' : 'Currency'}
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Тип цена' : 'Price Type'}
            </S.Label>
            <SelectWithOther
              options={PRICE_TYPES}
              value={pricingData.priceType}
              onChange={(value) => handlePricingChange('priceType', value)}
              placeholder={language === 'bg' ? 'Изберете тип цена' : 'Select price type'}
              label={language === 'bg' ? 'Тип цена' : 'Price Type'}
              required
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={pricingData.negotiable}
                onChange={(e) => handlePricingChange('negotiable', e.target.checked)}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              {language === 'bg' ? 'Договаряне възможно' : 'Negotiable'}
            </S.Label>
          </S.FormGroup>
        </S.CompactGrid>
      </S.SectionCard>

      {/* Section 1: Personal Information */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Лична информация' : 'Personal Information'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Име' : 'Name'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.sellerName}
            onChange={(e) => handleFieldChange('sellerName', e.target.value)}
              placeholder={language === 'bg' ? 'Вашето име' : 'Your name'}
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Имейл' : 'Email'}
            </S.Label>
            <S.Input
              type="email"
              value={contactData.sellerEmail}
            onChange={(e) => handleFieldChange('sellerEmail', e.target.value)}
              placeholder={language === 'bg' ? 'вашият@имейл.com' : 'your@email.com'}
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Телефон' : 'Phone'}
            </S.Label>
            <S.Input
              type="tel"
              value={contactData.sellerPhone}
            onChange={(e) => handleFieldChange('sellerPhone', e.target.value)}
              placeholder="+359 888 123 456"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Допълнителен телефон' : 'Additional Phone'}
            </S.Label>
            <S.Input
              type="tel"
              value={contactData.additionalPhone}
            onChange={(e) => handleFieldChange('additionalPhone', e.target.value)}
              placeholder={language === 'bg' ? '+359 888 654 321' : '+359 888 654 321'}
            />
          </S.FormGroup>
        </S.CompactGrid>
      </S.SectionCard>

      {/* Section 2: Location */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Местоположение' : 'Location'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Област' : 'Region'}
            </S.Label>
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
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Град' : 'City'}
            </S.Label>
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
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Пощенски код' : 'Postal Code'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.postalCode}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              placeholder="1000"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Точно местоположение' : 'Exact Location'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder={language === 'bg' ? 'Улица, номер' : 'Street, number'}
            />
          </S.FormGroup>
        </S.CompactGrid>
      </S.SectionCard>

      {/* Section 3: Contact Methods */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method'}
        </S.SectionTitle>

        <S.ContactMethodsContainer>
          {CONTACT_METHODS.map(method => {
            const isSelected = contactData.preferredContact.includes(method.id);
            const IconComponent = ContactIcons[method.icon];

            return (
              <S.ContactMethodRow key={method.id}>
                <S.ContactMethodInfo>
                  <S.ContactIconWrapper>
                    <IconComponent size={18} />
                  </S.ContactIconWrapper>
                  <S.ContactMethodLabel>
                    {language === 'bg' ? method.labelBg : method.labelEn}
                  </S.ContactMethodLabel>
                </S.ContactMethodInfo>

                <S.CyberToggleWrapper>
                  <S.CyberToggleCheckbox
                    type="checkbox"
                    id={`contact-${method.id}`}
                    checked={isSelected}
                    onChange={() => toggleContactMethod(method.id)}
                  />
                  <S.CyberToggleLabel htmlFor={`contact-${method.id}`}>
                    <S.ToggleTrack />
                    <S.ToggleThumbIcon />
                    <S.ToggleThumbDots />
                    <S.ToggleThumbHighlight />
                    <S.ToggleLabels>
                      <S.ToggleLabelOn>ON</S.ToggleLabelOn>
                      <S.ToggleLabelOff>OFF</S.ToggleLabelOff>
                    </S.ToggleLabels>
                  </S.CyberToggleLabel>
                </S.CyberToggleWrapper>
              </S.ContactMethodRow>
            );
          })}
        </S.ContactMethodsContainer>
      </S.SectionCard>

      {/* Section 4: Additional Info */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Допълнително' : 'Additional'}
        </S.SectionTitle>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Работно време' : 'Available Hours'}
          </S.Label>
          <SelectWithOther
            options={AVAILABLE_HOURS}
            value={contactData.availableHours}
            onChange={(value) => handleFieldChange('availableHours', value)}
            placeholder={language === 'bg' 
              ? 'Изберете работно време' 
              : 'Select available hours'}
            showOther={true}
            otherPlaceholder={language === 'bg' 
              ? 'Въведете работно време' 
              : 'Enter available hours'}
          />
        </S.FormGroup>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Бележки' : 'Notes'}
          </S.Label>
          <S.TextArea
            value={contactData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder={language === 'bg' 
              ? 'Допълнителна информация за купувачите...' 
              : 'Additional information for buyers...'}
            rows={3}
          />
        </S.FormGroup>
      </S.SectionCard>

      {/* Summary Card */}
      <S.SummaryCard>
        <S.SummaryTitle>
          {language === 'bg' ? '📋 Резюме на обявата' : '📋 Listing Summary'}
        </S.SummaryTitle>

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Превозно средство:' : 'Vehicle:'}
          </S.SummaryLabel>
          <S.SummaryValue>
            {make} {model || (language === 'bg' ? '(модел неизвестен)' : '(model not specified)')} ({year})
          </S.SummaryValue>
        </S.SummaryRow>

        {mileage && (
          <S.SummaryRow>
            <S.SummaryLabel>
              {language === 'bg' ? 'Пробег:' : 'Mileage:'}
            </S.SummaryLabel>
            <S.SummaryValue>
              {parseInt(mileage).toLocaleString()} {language === 'bg' ? 'км' : 'km'}
            </S.SummaryValue>
          </S.SummaryRow>
        )}

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Цена:' : 'Price:'}
          </S.SummaryLabel>
          <S.SummaryValue>
            {parseFloat(pricingData.price || '0').toLocaleString()} EUR
          </S.SummaryValue>
        </S.SummaryRow>

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Продавач:' : 'Seller:'}
          </S.SummaryLabel>
          <S.SummaryValue>{contactData.sellerName}</S.SummaryValue>
        </S.SummaryRow>

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Местоположение:' : 'Location:'}
          </S.SummaryLabel>
          <S.SummaryValue>{contactData.city}, {contactData.region}</S.SummaryValue>
        </S.SummaryRow>
      </S.SummaryCard>

      {/* Error Display with Missing Fields List */}
      {error && (
        <S.ErrorCard $hasWarning={showForcePublish}>
          <S.ErrorIcon>{showForcePublish ? '!' : '×'}</S.ErrorIcon>
          <S.ErrorText>{error}</S.ErrorText>
          {missingFields.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <strong>{language === 'bg' ? 'Липсващи полета:' : 'Missing fields:'}</strong>
              <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </S.ErrorCard>
      )}

      {/* Navigation */}
      <S.NavigationButtons>
        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => navigate(-1)}
        >
          {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
            : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
          }
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  return (
    <SellWorkflowLayout currentStep="contact">
      <SplitScreenLayout leftContent={leftContent} />
      
      {/* 🆕 Image Upload Progress Modal */}
      <ImageUploadProgress
        isUploading={isSubmitting && totalImages > 0}
        currentImage={currentImageIndex}
        totalImages={totalImages}
        progress={uploadProgress}
        errors={uploadErrors}
        onRetry={() => {
          setUploadErrors([]);
          handlePublish();
        }}
      />
      
      {/* 🆕 Keyboard Shortcuts Helper */}
      <KeyboardShortcutsHelper
        onSave={() => saveDraft(true)}
        onPublish={handlePublish}
        onBack={() => navigate(-1)}
        language={language as 'bg' | 'en'}
      />
      
      {/* 🆕 Auto-save indicator */}
      {isSaving && (
        <S.AutoSaveNotification>
          {getErrorMessage('AUTO_SAVED', language as 'bg' | 'en')}
        </S.AutoSaveNotification>
      )}
    </SellWorkflowLayout>
  );
};

export default UnifiedContactPage;

