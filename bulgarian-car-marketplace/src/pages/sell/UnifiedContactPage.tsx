// Unified Contact Page - All Contact Info in One Page
// صفحة موحدة للتواصل - كل المعلومات في مكان واحد

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import SplitScreenLayout from '../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../components/WorkflowVisualization';
import SellWorkflowService from '../../services/sellWorkflowService';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../data/bulgaria-locations';
import * as S from './UnifiedContactStyles';
import { toast } from 'react-toastify';
import { ErrorMessages, getErrorMessage } from '../../constants/ErrorMessages';
import ReviewSummary from '../../components/ReviewSummary';
import ImageUploadProgress from '../../components/ImageUploadProgress';
import KeyboardShortcutsHelper from '../../components/KeyboardShortcutsHelper';
import useDraftAutoSave from '../../hooks/useDraftAutoSave';
import { useSellWorkflow } from '../../hooks/useSellWorkflow';
import useWorkflowStep from '../../hooks/useWorkflowStep';
import WorkflowPersistenceService from '../../services/workflowPersistenceService';
import ImageUploadService from '../../services/image-upload-service';
import { logger } from '../../services/logger-service';

const CONTACT_METHODS = [
  { id: 'phone', iconComponent: 'PhoneIcon', labelBg: 'Телефон', labelEn: 'Phone' },
  { id: 'email', iconComponent: 'EmailIcon', labelBg: 'Имейл', labelEn: 'Email' },
  { id: 'whatsapp', iconComponent: 'WhatsAppIcon', labelBg: 'WhatsApp', labelEn: 'WhatsApp' },
  { id: 'viber', iconComponent: 'ViberIcon', labelBg: 'Viber', labelEn: 'Viber' },
  { id: 'telegram', iconComponent: 'TelegramIcon', labelBg: 'Telegram', labelEn: 'Telegram' },
  { id: 'messenger', iconComponent: 'MessengerIcon', labelBg: 'Facebook Messenger', labelEn: 'Facebook Messenger' },
  { id: 'sms', iconComponent: 'SMSIcon', labelBg: 'SMS', labelEn: 'SMS' }
];

const UnifiedContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  // Helper function to get the appropriate icon component
  const getContactIcon = (iconComponent: string) => {
    switch (iconComponent) {
      case 'PhoneIcon': return <S.PhoneIcon />;
      case 'EmailIcon': return <S.EmailIcon />;
      case 'WhatsAppIcon': return <S.WhatsAppIcon />;
      case 'ViberIcon': return <S.ViberIcon />;
      case 'TelegramIcon': return <S.TelegramIcon />;
      case 'MessengerIcon': return <S.MessengerIcon />;
      case 'SMSIcon': return <S.SMSIcon />;
      default: return null;
    }
  };

  const [contactData, setContactData] = useState({
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    preferredContact: [] as string[],
    region: '',
    city: '',
    postalCode: '',
    location: '',
    additionalPhone: '',
    availableHours: '',
    notes: ''
  });

  const [availableCities, setAvailableCities] = useState<Array<{name: string; nameEn?: string}>>([]);
  const [showOtherCityInput, setShowOtherCityInput] = useState(false);
  const [otherCityValue, setOtherCityValue] = useState('');
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
  
  // 🆕 Hooks for new features
  const { workflowData, updateWorkflowData } = useSellWorkflow();
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

  // Load saved contact data from localStorage on mount
  useEffect(() => {
    const savedData = WorkflowPersistenceService.loadWorkflowData();
    if (savedData) {
      setContactData(prev => ({
        ...prev,
        ...savedData,
        sellerName: savedData.sellerName || prev.sellerName,
        sellerEmail: savedData.sellerEmail || prev.sellerEmail,
        sellerPhone: savedData.sellerPhone || prev.sellerPhone,
        region: savedData.region || prev.region,
        city: savedData.city || prev.city,
        // If city is custom (not in list), show input
        ...(savedData.city && !availableCities.some(c => c.name === savedData.city) 
          ? { city: savedData.city, showOtherCity: true, otherCityValue: savedData.city }
          : {})
      }));
    }
  }, []);
  
  // Auto-save contact data to localStorage whenever it changes
  useEffect(() => {
    WorkflowPersistenceService.saveWorkflowData({
      ...contactData,
      ...workflowData
    });
  }, [contactData]);

  // Load user profile data
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && !contactData.sellerName) {
        setContactData(prev => ({
          ...prev,
          sellerName: currentUser.displayName || prev.sellerName,
          sellerEmail: currentUser.email || prev.sellerEmail
        }));
      }
    };
    loadUserData();
  }, [currentUser]);

  // Update cities when region changes
  useEffect(() => {
    if (contactData.region) {
      const cities = getCitiesByRegion(contactData.region, language);
      setAvailableCities(cities);
      // Reset city if not in new region
      const cityNames = cities.map(c => c.name);
      if (!cityNames.includes(contactData.city)) {
        setContactData(prev => ({ ...prev, city: '' }));
        setShowOtherCityInput(false);
        setOtherCityValue('');
      }
    } else {
      setAvailableCities([]);
      setShowOtherCityInput(false);
    }
  }, [contactData.region, language]);
  
  // Handle city selection
  const handleCityChange = (value: string) => {
    if (value === 'OTHER') {
      setShowOtherCityInput(true);
      setContactData(prev => ({ ...prev, city: '' }));
    } else {
      setShowOtherCityInput(false);
      setContactData(prev => ({ ...prev, city: value }));
    }
  };
  
  // Handle other city input
  const handleOtherCityChange = (value: string) => {
    setOtherCityValue(value);
    setContactData(prev => ({ ...prev, city: value }));
  };

  const handleInputChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const toggleContactMethod = (methodId: string) => {
    setContactData(prev => ({
      ...prev,
      preferredContact: prev.preferredContact.includes(methodId)
        ? prev.preferredContact.filter(m => m !== methodId)
        : [...prev.preferredContact, methodId]
    }));
  };

  // 🆕 Enhanced validation with better error messages
  const validateForm = (): boolean => {
    // Make validation
    if (!make) {
      toast.error(getErrorMessage('MAKE_REQUIRED', language as 'bg' | 'en'));
      logError('MAKE_REQUIRED');
      return false;
    }

    // Year validation
    if (!year) {
      toast.error(getErrorMessage('YEAR_REQUIRED', language as 'bg' | 'en'));
      logError('YEAR_REQUIRED');
      return false;
    }

    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear + 1) {
      toast.error(
        getErrorMessage('YEAR_INVALID', language as 'bg' | 'en', { currentYear: currentYear.toString() })
      );
      return false;
    }

    // Price validation
    if (!price) {
      toast.error(getErrorMessage('PRICE_REQUIRED', language as 'bg' | 'en'));
      logError('PRICE_REQUIRED');
      return false;
    }

    const priceNum = parseFloat(price);
    if (priceNum < 100) {
      toast.error(getErrorMessage('PRICE_TOO_LOW', language as 'bg' | 'en'));
      return false;
    }
    if (priceNum > 1000000) {
      toast.error(getErrorMessage('PRICE_TOO_HIGH', language as 'bg' | 'en'));
      return false;
    }

    // Contact validation
    if (!contactData.sellerName) {
      toast.error(getErrorMessage('NAME_REQUIRED', language as 'bg' | 'en'));
      return false;
    }

    if (!contactData.sellerEmail) {
      toast.error(getErrorMessage('EMAIL_REQUIRED', language as 'bg' | 'en'));
      return false;
    }

    if (!contactData.sellerPhone) {
      toast.error(getErrorMessage('PHONE_REQUIRED', language as 'bg' | 'en'));
      return false;
    }

    // Location validation
    if (!contactData.region) {
      toast.error(getErrorMessage('REGION_REQUIRED', language as 'bg' | 'en'));
      return false;
    }

    if (!contactData.city) {
      toast.error(getErrorMessage('CITY_REQUIRED', language as 'bg' | 'en'));
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
      // Model is optional - use "Unknown" if not provided
      const finalModel = model || (language === 'bg' ? 'Неизвестен модел' : 'Unknown Model');

      // ✅ Build workflow data matching SellWorkflowService.transformWorkflowData structure
      const workflowData = {
        // Vehicle Type & Seller
        vehicleType: vehicleType || 'car',
        sellerType: sellerType || 'private',
        
        // Basic Vehicle Info (from URL params)
        make: make,
        model: finalModel,
        year: year,
        mileage: mileage || '0',
        fuelType: fuelType || 'Petrol',
        fm: fuelType || 'Petrol', // alternative key
        transmission: transmission || 'Manual',
        color: color || '',
        
        // Pricing (from URL params)
        price: price,
        currency: currency || 'EUR',
        priceType: priceType || 'fixed',
        negotiable: negotiable === 'true',
        
        // Equipment (from URL params - already comma-separated strings)
        safety: safety || '',
        comfort: comfort || '',
        infotainment: infotainment || '',
        extras: extras || '',
        
        // Contact Information (from form)
        sellerName: contactData.sellerName,
        sellerEmail: contactData.sellerEmail,
        sellerPhone: contactData.sellerPhone,
        additionalPhone: contactData.additionalPhone || '',
        preferredContact: contactData.preferredContact.join(','), // convert array to string
        availableHours: contactData.availableHours || '',
        additionalInfo: contactData.notes || '',
        
        // Location (from form)
        region: contactData.region,
        city: contactData.city,
        postalCode: contactData.postalCode || '',
        location: contactData.location || '',
        
        // Images (will be handled separately as File[])
        images: images || '0'
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
      const validation = SellWorkflowService.validateWorkflowData(workflowData, false);
      
      // If critical fields are missing, block publication
      if (validation.criticalMissing) {
        setError(`❌ ${language === 'bg' ? 'Критична информация липсва' : 'Critical information missing'}: ${validation.missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      // If non-critical fields are missing, show warning with option to proceed
      if (!validation.isValid && !showForcePublish) {
        setMissingFields(validation.missingFields);
        setError(`⚠️ ${language === 'bg' ? 'Препоръчителни полета липсват' : 'Recommended fields are missing'}: ${validation.missingFields.join(', ')}`);
        setShowForcePublish(true);
        setIsSubmitting(false);
        return;
      }

      // ✅ Load images from localStorage and convert to Files
      let imageFiles: File[] = [];
      try {
        const savedImagesJson = localStorage.getItem('globul_sell_workflow_images');
        if (savedImagesJson) {
          const base64Images = JSON.parse(savedImagesJson) as string[];
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`Found ${base64Images.length} images in localStorage`);
          }
          
          // Convert base64 to File objects
          imageFiles = await Promise.all(
            base64Images.map(async (base64, index) => {
              const response = await fetch(base64);
              const blob = await response.blob();
              return new File([blob], `car_image_${index + 1}.jpg`, { type: 'image/jpeg' });
            })
          );
          
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`Converted ${imageFiles.length} images to File objects`);
          }
        }
      } catch (error) {
        logger.error('Error loading images from localStorage', error as Error);
        // Continue without images - don't block listing creation
      }

      // 🆕 Create listing first (without images)
      const carId = await SellWorkflowService.createCarListing(workflowData, userId);

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
              ? '⚠️ Някои снимки не са качени, но обявата е създадена. Можете да добавите снимки по-късно.'
              : '⚠️ Some images failed to upload, but listing was created. You can add images later.',
            { autoClose: 5000 }
          );
        }
      }

      // 🆕 Mark step as completed in analytics
      await markComplete({
        carId,
        make,
        model: finalModel,
        price: price ? parseFloat(price) : 0
      });

      // 🌐 N8N Integration
      try {
        const N8nService = await import('../../services/n8n-integration');
        await N8nService.default.onCarPublished(currentUser.uid, carId, workflowData as any);
      } catch (n8nError) {
        logger.warn('N8N webhook failed (non-critical)', { error: n8nError, carId });
      }

      // 🆕 Clear all workflow data
      localStorage.removeItem('sell_workflow_images');
      localStorage.removeItem('sell_workflow_files');
      localStorage.removeItem('globul_cars_sell_workflow');
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

      // Navigate with delay
      setTimeout(() => {
        navigate(`/car-details/${carId}?published=true`);
      }, 1000);

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
  const isFormValid = contactData.sellerName && contactData.sellerEmail && contactData.sellerPhone;
  const hasLocation = contactData.region && contactData.city;

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
          $variant="secondary"
          onClick={() => saveDraft(true)}
          disabled={isSaving}
        >
          💾 {language === 'bg' ? 'Запази' : 'Save Draft'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handlePublish}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting 
            ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
            : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
          } →
        </S.Button>
      </S.NavigationButtons>

      {/* 🆕 Review Summary before publishing */}
      <ReviewSummary
        workflowData={Object.fromEntries(searchParams)}
        imagesCount={parseInt(localStorage.getItem('sell_workflow_files_count') || '0')}
        language={language as 'bg' | 'en'}
        onEdit={() => navigate(-1)}
      />

      {/* Section 1: Personal Info */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? '👤 Лична информация' : '👤 Personal Information'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Име' : 'Name'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.sellerName}
              onChange={(e) => handleInputChange('sellerName', e.target.value)}
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
              onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
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
              onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
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
              onChange={(e) => handleInputChange('additionalPhone', e.target.value)}
              placeholder={language === 'bg' ? '+359 888 654 321' : '+359 888 654 321'}
            />
          </S.FormGroup>
        </S.CompactGrid>
      </S.SectionCard>

      {/* Section 2: Location */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? '📍 Местоположение' : '📍 Location'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Област' : 'Region'}
            </S.Label>
            <S.Select
              value={contactData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Изберете област' : 'Select region'}
              </option>
              {BULGARIA_REGIONS.map(region => (
                <option key={region.name} value={region.name}>
                  {language === 'bg' ? region.name : region.nameEn}
                </option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Град' : 'City'}
            </S.Label>
            <S.Select
              value={showOtherCityInput ? 'OTHER' : contactData.city}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={!contactData.region}
            >
              <option value="">
                {language === 'bg' ? 'Изберете град' : 'Select city'}
              </option>
              {availableCities.map(city => (
                <option key={city.name} value={city.name}>
                  {language === 'bg' ? city.name : (city.nameEn || city.name)}
                </option>
              ))}
              <option value="OTHER" style={{ 
                color: '#005ca9', 
                fontWeight: 'bold',
                backgroundColor: '#f0f9ff'
              }}>
                {language === 'bg' ? '▼ Друго' : '▼ Other'}
              </option>
            </S.Select>
            {showOtherCityInput && (
              <S.Input
                type="text"
                value={otherCityValue}
                onChange={(e) => handleOtherCityChange(e.target.value)}
                placeholder={language === 'bg' ? 'Въведете град' : 'Enter city name'}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Пощенски код' : 'Postal Code'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
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
              onChange={(e) => handleInputChange('location', e.target.value)}
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
            
            return (
              <S.ContactMethodRow key={method.id}>
                <S.ContactMethodInfo>
                  {getContactIcon(method.iconComponent)}
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
          {language === 'bg' ? '📝 Допълнително' : '📝 Additional'}
        </S.SectionTitle>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Работно време' : 'Available Hours'}
          </S.Label>
          <S.Input
            type="text"
            value={contactData.availableHours}
            onChange={(e) => handleInputChange('availableHours', e.target.value)}
            placeholder={language === 'bg' 
              ? 'Понеделник - Петък: 9:00 - 18:00' 
              : 'Monday - Friday: 9:00 AM - 6:00 PM'}
          />
        </S.FormGroup>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Бележки' : 'Notes'}
          </S.Label>
          <S.TextArea
            value={contactData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
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
            {parseFloat(price || '0').toLocaleString()} {currency}
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
          <S.ErrorIcon>{showForcePublish ? '⚠️' : '❌'}</S.ErrorIcon>
          <S.ErrorText>{error}</S.ErrorText>
          {missingFields.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
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
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handlePublish}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting 
            ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
            : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
          } →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  const rightContent = <WorkflowFlow currentStepIndex={6} totalSteps={8} carBrand={make || undefined} language={language} />;

  return (
    <>
      <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />
      
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

export default UnifiedContactPage;

