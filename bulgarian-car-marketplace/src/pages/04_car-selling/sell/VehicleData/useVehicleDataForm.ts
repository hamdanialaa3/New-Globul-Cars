import { logger } from '../../../../services/logger-service';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { brandsModelsDataService } from '../../../../services/brands-models-data.service';
import {
  getVariantsForModel,
  modelHasVariants
} from '../../../../services/carBrandsService';
import { resolveCanonicalBrand } from '../../../../services/brand-normalization';
import structuredBrandsData from '../../../../data/car-brands-structured.json';
import { VehicleFormData } from './types';
import { useUnifiedWorkflow } from '../../../../hooks/useUnifiedWorkflow';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';

const defaultForm: VehicleFormData = {
  make: '',
  makeRaw: '',
  year: '',
  model: '',
  variant: '',
  fuelType: '',
  mileage: '',
  condition: '',
  firstRegistration: '',
  power: '',
  transmission: '',
  doors: '',
  seats: '',
  color: '',
  previousOwners: '',
  
  // Purchase Information
  // purchaseMonth: '', // removed
  // purchaseYear: '', // removed
  // purchaseMileage: '', // removed
  // annualMileage: '', // removed
  // isSoleUser: null, // removed
  
  // Exterior Details
  exteriorColor: '',
  // trimLevel: '', // removed
  
  // Location fields (Bulgaria-specific)
  saleProvince: '',
  saleCity: '',
  salePostalCode: '',
  
  // Deprecated (kept for backward compatibility)
  saleCountry: '',
  saleLocation: '',
  
  saleType: 'private',
  saleTimeline: 'unknown',
  roadworthy: null,
  hasAccidentHistory: false,
  hasServiceHistory: false,
  bodyType: '',
  bodyTypeOther: '',
  // typed 'other' values
  makeOther: '',
  modelOther: '',
   // firstRegistrationYearOther and firstRegistrationMonthOther removed - no 'Other' for registration
  fuelTypeOther: '',
  colorOther: '',
  exteriorColorOther: '',
  // trimLevelOther: '' // removed
};

/**
 * Helper: returns the registration year string for a VehicleFormData value.
 * Prefers `year` if present (legacy/mobile select), otherwise extracts the year part from `firstRegistration`.
 */
export const getRegistrationYear = (data: Partial<VehicleFormData> | VehicleFormData | undefined): string => {
  if (!data) return '';
  const rawYear = (data as any).year || (data as any).firstRegistration || '';
  if (!rawYear) return '';
  return String(rawYear).split('-')[0];
};

export const useVehicleDataForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // ✅ UNIFIED WORKFLOW: Use unified workflow (Step 2 for Vehicle Data)
  const { workflowData, updateData, clearWorkflow } = useUnifiedWorkflow(2);

const initialValues = useMemo<VehicleFormData>(() => {
    const fromParams: Partial<VehicleFormData> = {
      make: searchParams.get('mk') || undefined,
      model: searchParams.get('md') || undefined,
      year: searchParams.get('fy') || undefined,
      fuelType: searchParams.get('fm') || undefined,
      mileage: searchParams.get('mi') || undefined,
      transmission: searchParams.get('tr') || undefined
    };

    // ✅ UNIFIED WORKFLOW: Prioritize unified workflow data over legacy workflow
    return {
      ...defaultForm,
      ...(workflowData || {}), // Use unified workflow data
      ...fromParams
    };
  }, [workflowData, searchParams]);

const [formData, setFormData] = useState<VehicleFormData>(initialValues);
  const [availableVariants, setAvailableVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  // ✅ FIX: Update formData when URL parameters change
  useEffect(() => {
    const urlParams: Partial<VehicleFormData> = {
      make: searchParams.get('mk') || undefined,
      model: searchParams.get('md') || undefined,
      year: searchParams.get('fy') || undefined,
      fuelType: searchParams.get('fm') || undefined,
      mileage: searchParams.get('mi') || undefined,
      transmission: searchParams.get('tr') || undefined
    };

    // Update formData with URL params if they exist
    setFormData(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      Object.entries(urlParams).forEach(([key, value]) => {
        if (value && prev[key as keyof VehicleFormData] !== value) {
          updated[key as keyof VehicleFormData] = value as any;
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prev;
    });
  }, [searchParams]);

const formEquals = useCallback(
    (a: VehicleFormData, b: VehicleFormData) => {
      const keys = Object.keys(defaultForm) as (keyof VehicleFormData)[];
      return keys.every(key => a[key] === b[key]);
    },
    []
  );

  // ✅ UNIFIED WORKFLOW: Update formData when initialValues change (including when workflowData changes)
  // ✅ FIX: Preserve user input for bodyType and bodyTypeOther when updating from initialValues
  useEffect(() => {
    setFormData(prev => {
      // If formData has user-entered values that differ from initialValues, preserve them
      const preservedBodyType = prev.bodyType || initialValues.bodyType || '';
      const preservedBodyTypeOther = prev.bodyTypeOther || initialValues.bodyTypeOther || '';
      
      const updated = formEquals(prev, initialValues) ? prev : {
        ...initialValues,
        // Preserve bodyType if user has selected something
        bodyType: preservedBodyType,
        bodyTypeOther: preservedBodyTypeOther
      };
      
      return updated;
    });
  }, [initialValues, formEquals]);

  // ✅ UNIFIED WORKFLOW: Restore data from unified workflow when it changes (e.g., when navigating back)
  useEffect(() => {
    // ✅ Handle Clear Event (Timer Expiry)
    if (!workflowData) {
      setFormData(defaultForm);
      return;
    }

    if (Object.keys(workflowData).length > 0) {
      const hasSignificantData = !!(workflowData.make || workflowData.model || workflowData.year || workflowData.mileage);
      
      if (hasSignificantData) {
        // Only restore if formData is missing these values (to avoid overwriting user input)
        setFormData(prev => {
          const updated = { ...prev };
          let hasChanges = false;

          // Helper to restore field if missing or different
          const restore = (key: keyof VehicleFormData, value: any) => {
            if (value !== undefined && value !== null && prev[key] !== value) {
              updated[key] = value;
              hasChanges = true;
            }
          };

          restore('make', workflowData.make);
          restore('makeRaw', workflowData.makeRaw);
          restore('model', workflowData.model);
          restore('year', workflowData.year);
          restore('firstRegistration', workflowData.firstRegistration);
          restore('mileage', workflowData.mileage);
          restore('fuelType', workflowData.fuelType);
          restore('transmission', workflowData.transmission);
          restore('power', workflowData.power);
          restore('color', workflowData.color);
          restore('doors', workflowData.doors);
          restore('seats', workflowData.seats);
          restore('exteriorColor', workflowData.exteriorColor);
          restore('previousOwners', workflowData.previousOwners);
          restore('hasAccidentHistory', workflowData.hasAccidentHistory);
          restore('hasServiceHistory', workflowData.hasServiceHistory);
          restore('variant', workflowData.variant);
          restore('condition', workflowData.condition); // ✅ ADDED
          restore('roadworthy', workflowData.roadworthy);
          restore('saleType', workflowData.saleType as any);
          restore('saleTimeline', workflowData.saleTimeline as any);
          restore('saleProvince', workflowData.saleProvince || workflowData.region);
          restore('saleCity', workflowData.saleCity || workflowData.locationData?.cityName);
          restore('salePostalCode', workflowData.salePostalCode || workflowData.postalCode);
          restore('bodyType', workflowData.bodyType);
          restore('bodyTypeOther', workflowData.bodyTypeOther);
          restore('makeOther', workflowData.makeOther);
          restore('modelOther', workflowData.modelOther);
          restore('fuelTypeOther', workflowData.fuelTypeOther);
          restore('colorOther', workflowData.colorOther);
          restore('exteriorColorOther', workflowData.exteriorColorOther);
          restore('saleCountry', workflowData.saleCountry);
          restore('saleLocation', workflowData.saleLocation);

          return hasChanges ? updated : prev;
        });
      }
    }
  }, [workflowData]); // Run when workflowData changes

  // ✅ UNIFIED WORKFLOW: Auto-save to unified workflow
  // Use ref to prevent infinite loop while keeping updateData stable
  const updateDataRef = useRef(updateData);
  
  // Keep ref synchronized with latest updateData
  useEffect(() => {
    updateDataRef.current = updateData;
  }, [updateData]);

  // Debounced auto-save with stable ref - prevents infinite loop
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ UNIFIED WORKFLOW: Save to unified workflow
      updateDataRef.current({
        make: formData.make,
        makeRaw: formData.makeRaw, // ✅ ADDED
        model: formData.model,
        year: formData.year,
        firstRegistration: formData.firstRegistration,
        mileage: formData.mileage,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        power: formData.power,
        color: formData.color,
        doors: formData.doors,
        seats: formData.seats,
        exteriorColor: formData.exteriorColor, // ✅ ADDED
        previousOwners: formData.previousOwners, // ✅ ADDED
        hasAccidentHistory: formData.hasAccidentHistory, // ✅ ADDED
        hasServiceHistory: formData.hasServiceHistory, // ✅ ADDED
        variant: formData.variant, // ✅ ADDED
        condition: formData.condition, // ✅ ADDED
        roadworthy: formData.roadworthy ?? undefined,
        saleType: formData.saleType,
        saleTimeline: formData.saleTimeline,
        region: formData.saleProvince,
        city: formData.saleCity,
        postalCode: formData.salePostalCode,
        // ✅ FIX: Save bodyType and bodyTypeOther
        bodyType: formData.bodyType,
        bodyTypeOther: formData.bodyTypeOther,
        makeOther: formData.makeOther, // ✅ ADDED
        modelOther: formData.modelOther, // ✅ ADDED
        fuelTypeOther: formData.fuelTypeOther, // ✅ ADDED
        colorOther: formData.colorOther, // ✅ ADDED
        exteriorColorOther: formData.exteriorColorOther, // ✅ ADDED
        saleProvince: formData.saleProvince, // ✅ ADDED
        saleCity: formData.saleCity, // ✅ ADDED
        salePostalCode: formData.salePostalCode, // ✅ ADDED
        saleCountry: formData.saleCountry, // ✅ ADDED
        saleLocation: formData.saleLocation // ✅ ADDED
      });
    }, 500); // Save after 500ms of no changes
    
    return () => clearTimeout(timer);
  }, [formData]); // ✅ Safe: only depends on formData, uses stable ref for function

  // Load brands asynchronously
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  
  useEffect(() => {
    brandsModelsDataService.getAllBrands()
      .then(brands => setAvailableBrands(brands))
      .catch(error => {
        logger.error('[useVehicleDataForm] Failed to load brands:', error);
        setAvailableBrands([]);
      });
  }, []);

  // Load models asynchronously
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  useEffect(() => {
    if (!formData.make) {
      setAvailableModels([]);
      return;
    }

    // (we don't export helper here) function lives at module scope

    const canonical = resolveCanonicalBrand(formData.make);
    
    brandsModelsDataService.getModelsForBrand(canonical)
      .then(models => {
        // Extra fallback: direct structured lookup if empty
        if (models.length === 0) {
          const candidate = (structuredBrandsData as any)[canonical];
          if (candidate?.models) {
            const flattened: string[] = [];
            Object.values(candidate.models).forEach((arr: any) => flattened.push(...arr));
            setAvailableModels(Array.from(new Set(flattened)));
            return;
          }
        }
        logger.info('[useVehicleDataForm] brand selected:', formData.make, 'canonical:', canonical, 'models count:', models.length, 'first 8:', models.slice(0, 8));
        setAvailableModels(models);
      })
      .catch(error => {
        logger.error('[useVehicleDataForm] Failed to load models:', error);
        setAvailableModels([]);
      });
  }, [formData.make]);

  useEffect(() => {
    if (formData.make && formData.model) {
      const hasVariants = modelHasVariants(formData.make, formData.model);
      setShowVariants(hasVariants);
      if (hasVariants) {
        setAvailableVariants(getVariantsForModel(formData.make, formData.model));
      } else {
        setAvailableVariants([]);
        setFormData(prev => (prev.variant === '' ? prev : { ...prev, variant: '' }));
      }
    } else {
      setShowVariants(false);
      setAvailableVariants([]);
      setFormData(prev => (prev.variant === '' ? prev : { ...prev, variant: '' }));
    }
  }, [formData.make, formData.model]);

  const handleInputChange = useCallback(
    (field: keyof VehicleFormData, value: string | boolean) => {
      // 🐛 DEBUG: Log all input changes to track button clicks
      if (process.env.NODE_ENV === 'development') {
        serviceLogger.debug('handleInputChange called', { field, value, timestamp: new Date().toISOString() });
      }
      
      setFormData(prev => {
        const next = { ...prev, [field]: value };
        
        // 🐛 DEBUG: Log state change
        if (process.env.NODE_ENV === 'development') {
          serviceLogger.debug('formData updating', { field, oldValue: prev[field], newValue: value });
        }
        
        if (field === 'make') {
          // Preserve raw user input then store canonical form for consistency
          next.makeRaw = String(value);
          const canonical = resolveCanonicalBrand(String(value));
          next.make = canonical;
          next.model = '';
          next.variant = '';
        }
        if (field === 'model') {
          next.variant = '';
        }
        return next;
      });
    },
    []
  );

  const canContinue = useMemo(() => {
    // ✅ FIX: Only require brand, model and a registration year.
    // Support either `year` (legacy/mobile select) or `firstRegistration` (ISO-like "YYYY" or "YYYY-MM").
    const registrationYear = getRegistrationYear(formData);
    const hasBasicInfo = !!formData.make && !!formData.model && !!registrationYear;

    // 🐛 DEBUG: Log validation status
    if (process.env.NODE_ENV === 'development') {
      serviceLogger.debug('Form Validation', {
        make: formData.make || 'Missing',
        model: formData.model || 'Missing',
        year: formData.year || '(not set)',
        firstRegistration: formData.firstRegistration || '(not set)',
        registrationYear: registrationYear || 'Missing',
        canContinue: hasBasicInfo
      });
    }

    return hasBasicInfo; // Users can continue with minimal info (Brand + Model + Year)
  }, [
    formData.make,
    formData.model,
    formData.firstRegistration,
    formData.year
  ]);

  const buildURLSearchParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (formData.make) params.set('mk', formData.make === '__other__' ? (formData.makeOther || '') : formData.make);
    if (formData.model) params.set('md', formData.model === '__other__' ? (formData.modelOther || '') : formData.model);
    if (formData.fuelType) params.set('fm', formData.fuelType === '__other__' ? (formData.fuelTypeOther || '') : formData.fuelType);
    if (formData.mileage) params.set('mi', formData.mileage);
    if (formData.transmission) params.set('tr', formData.transmission);
    // Map typed 'Other' year/month to secure value
    // Prefer `year` if present (mobile/legacy), otherwise extract from `firstRegistration`.
    const fy = getRegistrationYear(formData);
    if (fy) params.set('fy', fy);
    if (formData.color) params.set('color', formData.color === 'other' ? (formData.colorOther || '') : formData.color);
    return params;
  }, [searchParams, formData]);

  const resetForm = useCallback(() => {
    // ✅ UNIFIED WORKFLOW: Clear unified workflow data
    clearWorkflow();
    
    // Reset step state
    SellWorkflowStepStateService.reset();
    
    // Reset form data to default
    setFormData(defaultForm);
    
    // Clear URL params
    setSearchParams({});
    
    // Clear localStorage/sessionStorage (unified workflow uses its own storage)
    localStorage.removeItem('unified-workflow-state');
    sessionStorage.removeItem('unified-workflow-state');
    
    // Reload page to ensure clean state
    window.location.reload();
  }, [clearWorkflow, setSearchParams]);

  return {
    formData,
    availableBrands,
    availableModels,
    availableVariants,
    showVariants,
    handleInputChange,
    canContinue,
    buildURLSearchParams,
    resetForm
  };
};

export default useVehicleDataForm;

