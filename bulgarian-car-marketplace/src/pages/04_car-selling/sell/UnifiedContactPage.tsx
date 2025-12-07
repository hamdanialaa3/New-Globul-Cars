// Unified Contact Page - All Contact Info in One Page
// صفحة موحدة للتواصل - كل المعلومات في مكان واحد

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../components/WorkflowVisualization';
import SellWorkflowService from '../../../services/sellWorkflowService';
import { carValidationService, ValidationResult } from '../../../services/validation/car-validation.service';
import SelectWithOther from '../../../components/shared/SelectWithOther';
import { CURRENCIES, PRICE_TYPES, AVAILABLE_HOURS } from '../../../data/dropdown-options';
import * as S from './UnifiedContactStyles';
import { toast } from 'react-toastify';
import { ErrorMessages, getErrorMessage } from '../../../constants/ErrorMessages';
import ImageUploadProgress from '../../../components/ImageUploadProgress';
import KeyboardShortcutsHelper from '../../../components/KeyboardShortcutsHelper';
import useDraftAutoSave from '../../../hooks/useDraftAutoSave';
import { useSellWorkflow } from '../../../hooks/useSellWorkflow';
import { useUnifiedWorkflow } from '../../../hooks/useUnifiedWorkflow';
import useWorkflowStep from '../../../hooks/useWorkflowStep';
import WorkflowPersistenceService from '../../../services/workflowPersistenceService';
import ImageUploadService from '../../../services/image-upload-service';
import { logger } from '../../../services/logger-service';
import { SellWorkflowLayout } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { useContactForm } from './Contact/useContactForm';
import { CONTACT_METHODS } from './Contact/contactConstants';
import { ContactIcons } from '../../../components/icons/contact/ContactMethodIcons';

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

  // ✅ UNIFIED WORKFLOW: Use unified workflow (Step 6 - Contact) - MUST BE BEFORE useState that uses it
  const { workflowData: unifiedWorkflowData, updateData, clearWorkflow, markAsPublished } = useUnifiedWorkflow(6);
  
  // 🆕 Hooks for new features (legacy support)
  const { workflowData, updateWorkflowData, clearWorkflowData } = useSellWorkflow();

  // ✅ FIX: Use unifiedWorkflowData in initializer (available now)
  const [pricingData, setPricingData] = useState(() => ({
    price: searchParams.get('price') || unifiedWorkflowData?.price || workflowData?.price || '',
    currency: searchParams.get('currency') || unifiedWorkflowData?.currency || workflowData?.currency || 'EUR',
    priceType:
      searchParams.get('priceType') ||
      (unifiedWorkflowData?.priceType as string) ||
      (workflowData?.priceType as string) ||
      'fixed',
    negotiable:
      searchParams.get('negotiable') === 'true' ||
      unifiedWorkflowData?.negotiable === true ||
      unifiedWorkflowData?.negotiable === 'true' ||
      workflowData?.negotiable === true ||
      workflowData?.negotiable === 'true'
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForcePublish, setShowForcePublish] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // Validation state for contact info
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);
  
  // 🆕 New state for enhancements
  const [showReview, setShowReview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  
  useEffect(() => {
    SellWorkflowStepStateService.markPending('contact');
  }, []);

  // ✅ UNIFIED WORKFLOW: Restore contact data from saved workflow on mount
  useEffect(() => {
    if (unifiedWorkflowData && Object.keys(unifiedWorkflowData).length > 0) {
      console.log('🔄 Restoring contact data from unified workflow:', {
        sellerName: unifiedWorkflowData.sellerName,
        sellerEmail: unifiedWorkflowData.sellerEmail,
        sellerPhone: unifiedWorkflowData.sellerPhone,
        region: unifiedWorkflowData.region,
        city: unifiedWorkflowData.city
      });
      
      // Restore contact fields if they exist in workflow data and form is empty
      if (unifiedWorkflowData.sellerName && !contactData.sellerName) {
        handleFieldChange('sellerName', unifiedWorkflowData.sellerName);
      }
      if (unifiedWorkflowData.sellerEmail && !contactData.sellerEmail) {
        handleFieldChange('sellerEmail', unifiedWorkflowData.sellerEmail);
      }
      if (unifiedWorkflowData.sellerPhone && !contactData.sellerPhone) {
        handleFieldChange('sellerPhone', unifiedWorkflowData.sellerPhone);
      }
      if (unifiedWorkflowData.region && !contactData.region) {
        handleFieldChange('region', unifiedWorkflowData.region);
      }
      if (unifiedWorkflowData.city && !contactData.city) {
        handleFieldChange('city', unifiedWorkflowData.city);
      }
      if (unifiedWorkflowData.postalCode && !contactData.postalCode) {
        handleFieldChange('postalCode', unifiedWorkflowData.postalCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unifiedWorkflowData]); // Run when unifiedWorkflowData changes (including on mount)
  
  // ✅ UNIFIED WORKFLOW: Save contact data on every change
  useEffect(() => {
    updateData({
      sellerName: contactData.sellerName,
      sellerEmail: contactData.sellerEmail,
      sellerPhone: contactData.sellerPhone,
      region: contactData.region,
      city: contactData.city,
      postalCode: contactData.postalCode
    });
  }, [contactData, updateData]);
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

  // ✅ FIX: Update pricingData from unifiedWorkflowData (priority) or workflowData
  // ✅ FIX: Use ref and debounce to prevent infinite loop
  const pricingDataTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUpdatedPricingRef = useRef(false);
  
  useEffect(() => {
    // Clear any existing timer
    if (pricingDataTimerRef.current) {
      clearTimeout(pricingDataTimerRef.current);
    }
    
    // Reset flag on mount
    if (!hasUpdatedPricingRef.current) {
      hasUpdatedPricingRef.current = false;
    }
    
    // Debounce the update
    pricingDataTimerRef.current = setTimeout(() => {
      const sourceData = unifiedWorkflowData || workflowData;
      if (sourceData && (sourceData.price || sourceData.currency || sourceData.priceType !== undefined || sourceData.negotiable !== undefined)) {
        setPricingData(prev => {
          // Only update if values are actually different
          const newPrice = prev.price || sourceData.price || '';
          const newCurrency = prev.currency || sourceData.currency || 'EUR';
          const newPriceType = prev.priceType || (sourceData.priceType as string) || 'fixed';
          const newNegotiable = typeof prev.negotiable === 'boolean'
            ? prev.negotiable
            : sourceData.negotiable === true || sourceData.negotiable === 'true';
          
          // Check if values changed
          if (prev.price === newPrice && 
              prev.currency === newCurrency && 
              prev.priceType === newPriceType && 
              prev.negotiable === newNegotiable) {
            return prev; // No change, return previous state
          }
          
          hasUpdatedPricingRef.current = true;
          return {
            price: newPrice,
            currency: newCurrency,
            priceType: newPriceType,
            negotiable: newNegotiable
          };
        });
      }
    }, 500); // 500ms debounce
    
    return () => {
      if (pricingDataTimerRef.current) {
        clearTimeout(pricingDataTimerRef.current);
      }
    };
  }, [
    unifiedWorkflowData?.price,
    unifiedWorkflowData?.currency,
    unifiedWorkflowData?.priceType,
    unifiedWorkflowData?.negotiable,
    workflowData?.price,
    workflowData?.currency,
    workflowData?.priceType,
    workflowData?.negotiable
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
  const validateForm = async (): Promise<boolean> => {
    console.log('🔍 validateForm called', {
      unifiedWorkflowData: unifiedWorkflowData ? Object.keys(unifiedWorkflowData).length + ' keys' : 'null',
      workflowData: workflowData ? Object.keys(workflowData).length + ' keys' : 'null',
      make,
      year,
      images
    });
    
    // ✅ FIX: Use unifiedWorkflowData first, then fallback to workflowData
    const resolvedMake = unifiedWorkflowData?.make || workflowData?.make || make;
    
    // ✅ FIX: Extract year from firstRegistration if year is not directly available
    let resolvedYear = unifiedWorkflowData?.year || workflowData?.year || year;
    
    // If year is still null/undefined, try to extract it from firstRegistration
    if (!resolvedYear) {
      const firstRegistration = unifiedWorkflowData?.firstRegistration || workflowData?.firstRegistration;
      if (firstRegistration) {
        // Extract year from date string (format: "YYYY-MM" or "YYYY-MM-DD")
        const yearMatch = String(firstRegistration).match(/^(\d{4})/);
        if (yearMatch) {
          resolvedYear = yearMatch[1];
          console.log('🔍 Extracted year from firstRegistration:', resolvedYear);
        }
      }
    }
    
    console.log('🔍 Resolved values:', { resolvedMake, resolvedYear });

    if (!resolvedMake) {
      console.warn('❌ Validation failed: MAKE_REQUIRED');
      toast.error(getErrorMessage('MAKE_REQUIRED', language as 'bg' | 'en'));
      logError('MAKE_REQUIRED');
      return false;
    }

    if (!resolvedYear) {
      console.warn('❌ Validation failed: YEAR_REQUIRED');
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

    // ✅ FIX: Check IndexedDB directly for images (most reliable source)
    let totalImages = 0;
    let imagesSource = 'none';
    
    try {
      // Try IndexedDB first
      const ImageStorageServiceModule = await import('../../../services/ImageStorageService');
      const savedImages = await ImageStorageServiceModule.ImageStorageService.getImages();
      if (savedImages && savedImages.length > 0) {
        totalImages = savedImages.length;
        imagesSource = 'IndexedDB';
        console.log('🔍 Images from IndexedDB:', totalImages);
      }
    } catch (error) {
      console.warn('⚠️ Failed to check IndexedDB, trying localStorage', error);
    }
    
    // Fallback to localStorage if IndexedDB is empty
    if (totalImages === 0) {
      try {
        const localStorageImages = WorkflowPersistenceService.getImages();
        if (localStorageImages && localStorageImages.length > 0) {
          totalImages = localStorageImages.length;
          imagesSource = 'localStorage';
          console.log('🔍 Images from localStorage:', totalImages);
        }
      } catch (error) {
        console.warn('⚠️ Failed to check localStorage', error);
      }
    }
    
    // Final fallback to workflow data
    if (totalImages === 0) {
      totalImages =
        unifiedWorkflowData?.imagesCount ??
        workflowData?.imagesCount ??
      (images ? parseInt(images, 10) : 0);
      if (totalImages > 0) {
        imagesSource = 'workflowData';
      }
    }

    console.log('🔍 Images count:', { 
      totalImages, 
      imagesSource,
      unifiedImagesCount: unifiedWorkflowData?.imagesCount, 
      workflowImagesCount: workflowData?.imagesCount, 
      imagesParam: images 
    });

    // ✅ FIX: Images are recommended but not blocking - allow publishing without images with warning
    if (!totalImages || Number.isNaN(totalImages) || totalImages === 0) {
      console.warn('⚠️ No images found, but allowing publish (images are recommended, not required)', { totalImages, imagesSource });
      // Show warning but don't block - images are recommended, not critical
      toast.warning(
        language === 'bg'
          ? 'Препоръчва се да добавите поне една снимка за по-добра видимост на обявата. Продължавате ли без снимки?'
          : 'It is recommended to add at least one image for better listing visibility. Continue without images?',
        { autoClose: 4000 }
      );
      // Don't return false - allow publishing without images
      // logError('IMAGES_REQUIRED'); // Don't log as error since it's not blocking
    }

    console.log('✅ Validation passed');
    return true;
  };

  const handlePublish = async () => {
    console.log('🚀 handlePublish called');
    setError('');
    
    // 🆕 Validate first (now async to check IndexedDB)
    const isValid = await validateForm();
    console.log('✅ Validation result:', isValid);
    
    if (!isValid) {
      console.warn('❌ Validation failed, blocking publish');
      setIsSubmitting(false);
      return;
    }

    console.log('✅ Validation passed, proceeding with publish');
    setIsSubmitting(true);

    try {
      // ✅ FIX: Merge unifiedWorkflowData (priority) with workflowData
      const mergedWorkflowData = { ...workflowData, ...unifiedWorkflowData };
      
      const fallbackModel = language === 'bg' ? 'Неизвестен модел' : 'Unknown Model';
      const finalModel =
        mergedWorkflowData.model ||
        model ||
        fallbackModel;

      const payload = {
        ...mergedWorkflowData,
        vehicleType: mergedWorkflowData.vehicleType || vehicleType || 'car',
        sellerType: mergedWorkflowData.sellerType || sellerType || 'private',
        make: mergedWorkflowData.make || make || '',
        model: finalModel,
        year: mergedWorkflowData.year || year || '',
        mileage: mergedWorkflowData.mileage || mileage || '0',
        fuelType: mergedWorkflowData.fuelType || fuelType || '',
        transmission: mergedWorkflowData.transmission || transmission || '',
        color: mergedWorkflowData.color || color || '',
        price: pricingData.price || mergedWorkflowData.price || '',
        currency: pricingData.currency || mergedWorkflowData.currency || 'EUR',
        priceType: pricingData.priceType || mergedWorkflowData.priceType || 'fixed',
        negotiable: pricingData.negotiable,
        safety: mergedWorkflowData.safety || mergedWorkflowData.safetyEquipment?.join(',') || safety || '',
        comfort: mergedWorkflowData.comfort || mergedWorkflowData.comfortEquipment?.join(',') || comfort || '',
        infotainment: mergedWorkflowData.infotainment || mergedWorkflowData.infotainmentEquipment?.join(',') || infotainment || '',
        extras: mergedWorkflowData.extras || mergedWorkflowData.extrasEquipment?.join(',') || extras || '',
        sellerName: contactData.sellerName || mergedWorkflowData.sellerName || '',
        sellerEmail: contactData.sellerEmail || mergedWorkflowData.sellerEmail || '',
        sellerPhone: contactData.sellerPhone || mergedWorkflowData.sellerPhone || '',
        additionalPhone: contactData.additionalPhone || mergedWorkflowData.additionalPhone || '',
        preferredContact: contactData.preferredContact.join(','),
        availableHours: contactData.availableHours || mergedWorkflowData.availableHours || '',
        additionalInfo: contactData.notes || mergedWorkflowData.additionalInfo || '',
        region: contactData.region || mergedWorkflowData.region || '',
        city: contactData.city || mergedWorkflowData.city || '',
        postalCode: contactData.postalCode || mergedWorkflowData.postalCode || '',
        location: contactData.location || mergedWorkflowData.location || '',
        images: mergedWorkflowData.images,
        imagesCount: mergedWorkflowData.imagesCount
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

      // ✅ Load images from IndexedDB (primary source) or localStorage (fallback)
      let imageFiles: File[] = [];
      try {
        // Try IndexedDB first (most reliable)
        const ImageStorageServiceModule = await import('../../../services/ImageStorageService');
        const savedImages = await ImageStorageServiceModule.ImageStorageService.getImages();
        console.log('📸 Images from IndexedDB:', { 
          count: savedImages?.length || 0, 
          images: savedImages?.map((f: File) => ({ name: f.name, size: f.size, type: f.type })) || []
        });
        
        if (savedImages && savedImages.length > 0) {
          // getImages() already returns File[] directly
          imageFiles = savedImages;
          console.log('✅ Loaded images from IndexedDB:', imageFiles.length);
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`Loaded ${imageFiles.length} images from IndexedDB`);
          }
        } else {
          // Fallback to localStorage
          console.log('⚠️ No images in IndexedDB, trying localStorage...');
        imageFiles = WorkflowPersistenceService.getImagesAsFiles();
          console.log('📸 Images from localStorage:', { 
            count: imageFiles.length, 
            images: imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
          });
        if (process.env.NODE_ENV === 'development') {
            logger.debug(`Loaded ${imageFiles.length} images from localStorage (fallback)`);
          }
        }
      } catch (error) {
        console.error('❌ Error loading images from IndexedDB:', error);
        logger.error('Error loading images', error as Error);
        // Final fallback to localStorage
        try {
          imageFiles = WorkflowPersistenceService.getImagesAsFiles();
          console.log('📸 Fallback: Images from localStorage:', imageFiles.length);
        } catch (fallbackError) {
          console.error('❌ Error loading images from WorkflowPersistenceService:', fallbackError);
          logger.error('Error loading images from WorkflowPersistenceService', fallbackError as Error);
        }
      }

      // ✅ FIX: Pass imageFiles directly to createCarListing - it handles upload internally
      console.log('📸 Final imageFiles before createCarListing:', { 
        imageCount: imageFiles.length,
        imageFiles: imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        areFilesValid: imageFiles.every(f => f instanceof File)
      });
      
      if (imageFiles && imageFiles.length > 0) {
        setTotalImages(imageFiles.length);
        console.log('✅ Images ready for upload:', imageFiles.length);
      } else {
        console.warn('⚠️ No images found! Publishing without images.');
      }

      // ✅ FIX: Check if we're in edit mode
      const isEditMode = sessionStorage.getItem('edit_mode') === 'true';
      const editCarId = sessionStorage.getItem('edit_car_id');
      
      let carId: string;
      
      if (isEditMode && editCarId) {
        // ✅ EDIT MODE: Update existing listing
        console.log('✏️ Edit mode detected, updating car:', editCarId);
        
        // Transform payload for update (same as create)
        const carData = SellWorkflowService.transformWorkflowData(payload, userId);
        
        // Get the appropriate collection name
        const collectionName = SellWorkflowService.getCollectionNameForVehicleType(carData.vehicleType || 'car');
        
        // Update the car listing
        await SellWorkflowService.updateCarListing(editCarId, carData, collectionName);
        
        // Upload new images if provided
        if (imageFiles && imageFiles.length > 0) {
          try {
            const imageUrls = await SellWorkflowService.uploadCarImages(editCarId, imageFiles, carData.vehicleType);
            
            // Update images in the listing
            const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('../../../firebase/firebase-config');
            await updateDoc(doc(db, collectionName, editCarId), {
              images: imageUrls,
              updatedAt: serverTimestamp()
            });
            
            console.log('✅ Images updated for car:', editCarId, imageUrls.length);
            toast.success(
              language === 'bg'
                ? `Обявата е обновена успешно с ${imageUrls.length} снимки!`
                : `Listing updated successfully with ${imageUrls.length} images!`,
              { autoClose: 3000 }
            );
          } catch (uploadError) {
            console.error('❌ Failed to upload images during edit:', uploadError);
            logger.error('Failed to upload images during edit', uploadError as Error, { carId: editCarId });
            toast.warning(
              language === 'bg'
                ? 'Обявата е обновена, но има проблем с качването на снимките'
                : 'Listing updated, but there was an issue uploading images',
              { autoClose: 4000 }
            );
            // Don't throw - allow update to complete even if images fail
          }
        } else {
          // No new images, but update was successful
          toast.success(
            language === 'bg'
              ? 'Обявата е обновена успешно!'
              : 'Listing updated successfully!',
            { autoClose: 3000 }
          );
        }
        
        carId = editCarId;
        
        // Clear edit mode flags
        sessionStorage.removeItem('edit_mode');
        sessionStorage.removeItem('edit_car_id');
        sessionStorage.removeItem('edit_car_data');
        
        console.log('✅ Car listing updated successfully:', carId);
        
        // Navigate to profile after successful update
        setTimeout(() => {
          navigate('/profile/my-ads');
        }, 800);
      } else {
        // ✅ CREATE MODE: Create new listing
        console.log('🚀 Calling createCarListing with:', { 
          hasPayload: !!payload, 
          userId, 
          imageCount: imageFiles.length,
          imageFilesProvided: imageFiles.length > 0
        });
        carId = await SellWorkflowService.createCarListing(payload, userId, imageFiles);

        if (!carId) {
          throw new Error('Failed to create listing');
        }

        if (process.env.NODE_ENV === 'development') {
          logger.debug('Car listing created', { carId, imageCount: imageFiles.length });
        }
      }

      // ✅ Images are already uploaded by createCarListing, no need to upload again
      if (imageFiles && imageFiles.length > 0) {
        console.log('✅ Images should be uploaded by createCarListing');
        toast.success(
            language === 'bg'
            ? `Обявата е създадена успешно с ${imageFiles.length} снимки!`
            : `Listing created successfully with ${imageFiles.length} images!`,
          { autoClose: 3000 }
        );
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
        const N8nService = await import('../../../services/n8n-integration');
        await N8nService.default.onCarPublished(currentUser.uid, carId, payload as any);
      } catch (n8nError) {
        logger.warn('N8N webhook failed (non-critical)', { error: n8nError, carId });
      }

      // ✅ Clear unified workflow data FIRST (including images from IndexedDB)
      await markAsPublished(); // Mark as published to prevent timer auto-delete
      await clearWorkflow(); // Clear all local data including IndexedDB images
      
      // Clear legacy workflow data
      clearWorkflowData();
      localStorage.removeItem('current_draft_id');
      
      // ✅ Delete draft from Firestore if exists
      const draftId = localStorage.getItem('current_draft_id');
      if (draftId && currentUser) {
        try {
          const DraftsService = await import('../../../services/drafts-service');
          await DraftsService.default.deleteDraft(draftId);
          logger.info('Draft deleted from Firestore after publishing', { draftId });
        } catch (error) {
          // Non-critical - continue
          logger.warn('Failed to delete Firestore draft after publishing (non-critical)', { error, draftId });
        }
      }

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

