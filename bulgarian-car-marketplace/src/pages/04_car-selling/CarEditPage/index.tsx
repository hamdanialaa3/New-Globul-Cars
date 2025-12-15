import React, { useState, useEffect, useCallback, ChangeEvent, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { unifiedCarService, UnifiedCar } from '../../../services/car';
import { logger } from '../../../services/logger-service';
import BrandModelMarkdownDropdown from '../../../components/BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import { BODY_TYPES as WORKFLOW_BODY_TYPES } from '../sell/VehicleData/types';
import { BULGARIA_PROVINCES } from '../../../services/bulgaria-locations.service';
import UnifiedCitiesService from '../../../services/unified-cities-service';
import {
  PageWrapper,
  TopBar,
  TopBarLeft,
  TopBarRight,
  BackButton,
  SaveButton,
  CancelButton,
  Container,
  MainSection,
  LeftColumn,
  RightColumn,
  Card,
  SectionTitle,
  ImageSection,
  MainImageContainer,
  MainImage,
  ImageNavButton,
  ThumbnailGrid,
  Thumbnail,
  AddImageButton,
  RemoveImageButton,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  CheckboxGroup,
  CheckboxLabel,
  PriceInput,
  PriceWrapper,
  CurrencySelect,
  TwoColumnGrid,
  ThreeColumnGrid,
  EquipmentSection,
  EquipmentCategory,
  EquipmentTitle,
  EquipmentGrid,
  EquipmentItem,
  ContactSection,
  LoadingOverlay,
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage,
  StatusBadge,
  PillGroup,
  PillButton,
  ToggleGroup,
  ToggleButton,
  InlineFieldRow,
  InlineHint,
} from './styles';
import { translations } from './translations';
import {
  ArrowLeft,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', '__other__'];
const TRANSMISSIONS = ['manual', 'automatic'];
const COLORS = ['white', 'black', 'silver', 'gray', 'blue', 'red', 'green', 'other'];
const CONDITIONS = ['new', 'used', 'parts'];
const DRIVE_TYPES = ['front-wheel', 'rear-wheel', 'all-wheel'];

const DOOR_CHIP_OPTIONS = [
  { value: '2', label: '2/3' },
  { value: '4', label: '4/5' },
  { value: '6', label: '6/7' },
];

const ROADWORTHY_CHOICES: Array<'yes' | 'no'> = ['yes', 'no'];
const SALE_TYPE_CHOICES: Array<'private' | 'commercial'> = ['private', 'commercial'];
const SALE_TIMELINE_CHOICES: Array<'unknown' | 'soon' | 'months'> = ['unknown', 'soon', 'months'];

const FIRST_REGISTRATION_MONTHS = [
  { value: '01', labelBg: 'Януари', labelEn: 'January' },
  { value: '02', labelBg: 'Февруари', labelEn: 'February' },
  { value: '03', labelBg: 'Март', labelEn: 'March' },
  { value: '04', labelBg: 'Април', labelEn: 'April' },
  { value: '05', labelBg: 'Май', labelEn: 'May' },
  { value: '06', labelBg: 'Юни', labelEn: 'June' },
  { value: '07', labelBg: 'Юли', labelEn: 'July' },
  { value: '08', labelBg: 'Август', labelEn: 'August' },
  { value: '09', labelBg: 'Септември', labelEn: 'September' },
  { value: '10', labelBg: 'Октомври', labelEn: 'October' },
  { value: '11', labelBg: 'Ноември', labelEn: 'November' },
  { value: '12', labelBg: 'Декември', labelEn: 'December' }
];

const SAFETY_EQUIPMENT = [
  'abs', 'esp', 'airbags', 'parkingSensors', 'rearviewCamera',
  'blindSpotMonitor', 'laneDeparture', 'collisionWarning'
];

const COMFORT_EQUIPMENT = [
  'ac', 'climate', 'heatedSeats', 'ventilatedSeats',
  'sunroof', 'rainSensor', 'cruiseControl', 'parkAssist'
];

const INFOTAINMENT_EQUIPMENT = [
  'navigation', 'bluetooth', 'usb', 'carPlay', 'androidAuto',
  'soundSystem', 'wifi', 'radio'
];

const EXTRA_EQUIPMENT = [
  'ledLights', 'xenon', 'daylight', 'alloyWheels', 'keyless',
  'startStop', 'sportPackage', 'towHitch'
];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '');

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = slugify(value);
    if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
    if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  }
  return Boolean(value);
};

const normalizeFuelTypeValue = (fuel?: string) => {
  if (!fuel) return { value: '' } as const;
  const normalized = slugify(fuel);
  const mapping: Record<string, string> = {
    petrol: 'petrol', gasoline: 'petrol', benzine: 'petrol', benzin: 'petrol',
    diesel: 'diesel',
    electric: 'electric', ev: 'electric', electro: 'electric',
    hybrid: 'hybrid', phev: 'hybrid', pluginhybrid: 'hybrid',
    lpg: 'lpg', gas: 'lpg', autogas: 'lpg',
  };
  const mapped = mapping[normalized];
  if (mapped) return { value: mapped } as const;
  if (FUEL_TYPES.includes(fuel.toLowerCase() as typeof FUEL_TYPES[number])) {
    return { value: fuel.toLowerCase() } as const;
  }
  return { value: '__other__', other: fuel } as const;
};

const normalizeTransmissionValue = (transmission?: string) => {
  if (!transmission) return '';
  const normalized = slugify(transmission);
  if (normalized.includes('auto')) return 'automatic';
  if (normalized.includes('manual')) return 'manual';
  return transmission.toLowerCase();
};

const normalizeBodyTypeValue = (bodyType?: string) => {
  if (!bodyType) return { value: '' } as const;
  const normalized = slugify(bodyType);
  const mapping: Record<string, string> = {
    sedan: 'sedan',
    limousine: 'sedan',
    saloon: 'sedan',
    suv: 'suv',
    jeep: 'suv',
    crossover: 'suv',
    hatchback: 'hatchback',
    hatch: 'hatchback',
    coupe: 'coupe',
    wagon: 'wagon',
    kombi: 'wagon',
    estate: 'wagon',
    convertible: 'convertible',
    cabrio: 'convertible',
    cabriolet: 'convertible',
    pickup: 'pickup',
    minivan: 'minivan',
    van: 'minivan',
  };
  const mapped = mapping[normalized];
  if (mapped && WORKFLOW_BODY_TYPES.some(b => b.value === mapped)) {
    return { value: mapped } as const;
  }
  if (WORKFLOW_BODY_TYPES.some(b => b.value === bodyType)) {
    return { value: bodyType } as const;
  }
  return { value: 'other', other: bodyType } as const;
};

const normalizeColorValue = (color?: string) => {
  if (!color) return { value: '' } as const;
  const normalized = slugify(color);
  const mapping: Record<string, string> = {
    black: 'black',
    white: 'white',
    silver: 'silver',
    grey: 'gray',
    gray: 'gray',
    blue: 'blue',
    red: 'red',
    green: 'green'
  };
  const mapped = mapping[normalized];
  if (mapped && COLORS.includes(mapped)) {
    return { value: mapped } as const;
  }
  if (COLORS.includes(color.toLowerCase())) {
    return { value: color.toLowerCase() } as const;
  }
  return { value: 'other', other: color } as const;
};

const normalizeProvinceValue = (province?: string, lang: 'bg' | 'en' = 'bg') => {
  if (!province) return '';
  const normalized = slugify(province);
  const found = BULGARIA_PROVINCES.find(p => {
    const bg = slugify(p.bg);
    const en = slugify(p.en);
    return (
      normalized === bg ||
      normalized === en ||
      normalized === en.replace(/city$/, '') ||
      bg.includes(normalized) ||
      en.includes(normalized) ||
      normalized.includes(bg) ||
      normalized.includes(en)
    );
  });
  if (!found) return province;
  return lang === 'bg' ? found.bg : found.en;
};

const normalizeCityValue = (city?: string) => {
  if (!city) return '';
  const normalized = slugify(city);
  const cities = UnifiedCitiesService.getCitiesForSelect('en');
  const match = cities.find(c => {
    const byId = slugify(c.value);
    const byBg = slugify(c.labelBg);
    const byEn = slugify(c.labelEn);
    return (
      normalized === byId ||
      normalized === byBg ||
      normalized === byEn ||
      byId.includes(normalized) ||
      byBg.includes(normalized) ||
      byEn.includes(normalized) ||
      normalized.includes(byId)
    );
  });
  return match ? match.value : city;
};

const normalizeSaleTypeValue = (saleType?: string) => {
  if (!saleType) return 'private' as const;
  const normalized = slugify(saleType);
  if (
    normalized.includes('commerc') ||
    normalized.includes('dealer') ||
    normalized.includes('company') ||
    normalized.includes('business') ||
    normalized.includes('vat')
  ) {
    return 'commercial' as const;
  }
  return 'private' as const;
};

const normalizeSaleTimelineValue = (timeline?: string) => {
  if (!timeline) return 'unknown' as const;
  const normalized = slugify(timeline);
  if (normalized.includes('soon') || normalized.includes('asap')) return 'soon' as const;
  if (normalized.includes('month')) return 'months' as const;
  return 'unknown' as const;
};

const normalizePriceType = (priceType?: string) => {
  if (!priceType) return 'fixed' as const;
  const normalized = slugify(priceType);
  if (normalized.includes('negotiable') || normalized.includes('offer')) return 'negotiable' as const;
  if (normalized.includes('best')) return 'best_offer' as const;
  return 'fixed' as const;
};

const CarEditPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const t = translations[language as 'bg' | 'en'] || translations.en;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const [car, setCar] = useState<UnifiedCar | null>(null);
  const [formData, setFormData] = useState<Partial<UnifiedCar> & Record<string, unknown>>({});

  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Track preview URLs for cleanup
  const previewUrlsRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    const loadCarData = async () => {
      if (!carId) {
        setError(t.errors.carIdMissing);
        setLoading(false);
        return;
      }

      if (!currentUser) {
        return;
      }

      try {
        setLoading(true);
        const carData = await unifiedCarService.getCarById(carId);

        if (!carData) {
          setError(t.errors.carNotFound);
          setLoading(false);
          return;
        }

        const isOwner = carData.sellerId === currentUser.uid ||
          (carData as any).userId === currentUser.uid ||
          (carData as any).ownerId === currentUser.uid;

        if (!isOwner) {
          setError(t.errors.noPermission);
          setLoading(false);
          return;
        }

        const carDataExtended = carData as UnifiedCar & {
          fuel?: string;
          saleCity?: string;
          saleProvince?: string;
          sellerType?: string;
          registrationDate?: string;
          warranty?: boolean;
          currency?: string;
          priceType?: string;
          paymentMethods?: string[];
          preferredContact?: string[];
          bodyTypeOther?: string;
          fuelTypeOther?: string;
          colorOther?: string;
          doors?: string | number;
          numberOfDoors?: string | number;
          seats?: string | number;
          numberOfSeats?: string | number;
        };
        
        const isOwner = carData.sellerId === currentUser.uid ||
          carDataExtended.userId === currentUser.uid ||
          carDataExtended.ownerId === currentUser.uid;

        if (!isOwner) {
          setError(t.errors.noPermission);
          setLoading(false);
          return;
        }

        const normalizedFuel = normalizeFuelTypeValue(carDataExtended.fuelType || carDataExtended.fuel);
        const normalizedTransmission = normalizeTransmissionValue(carDataExtended.transmission);
        const normalizedBody = normalizeBodyTypeValue(carDataExtended.bodyType);
        const normalizedColor = normalizeColorValue(carDataExtended.color);
        const normalizedCity = normalizeCityValue(carDataExtended.city || carDataExtended.saleCity);
        const normalizedRegion = normalizeProvinceValue(carDataExtended.region || carDataExtended.saleProvince, language as 'bg' | 'en');
        const normalizedRoadworthy = normalizeBoolean(carDataExtended.roadworthy);
        const normalizedSaleType = normalizeSaleTypeValue(carDataExtended.saleType || carDataExtended.sellerType);
        const normalizedSaleTimeline = normalizeSaleTimelineValue(carDataExtended.saleTimeline);
        const normalizedPriceType = normalizePriceType(carDataExtended.priceType);
        const normalizedAccidentHistory = normalizeBoolean(carDataExtended.accidentHistory);
        const normalizedServiceHistory = normalizeBoolean(carDataExtended.serviceHistory);
        const normalizedNegotiable = normalizeBoolean(carDataExtended.negotiable);
        const normalizedFinancing = normalizeBoolean(carDataExtended.financing);
        const normalizedTradeIn = normalizeBoolean(carDataExtended.tradeIn);
        const normalizedVatDeductible = normalizeBoolean(carDataExtended.vatDeductible);
        const normalizedDoors = carDataExtended.doors ?? carDataExtended.numberOfDoors;
        const normalizedSeats = carDataExtended.seats ?? carDataExtended.numberOfSeats;

        const normalizedCar: UnifiedCar = {
          ...carData,
          vehicleType: carData.vehicleType || 'car',
          sellerType: normalizedSaleType,
          sellerName: carData.ownerName || carData.sellerName || currentUser.displayName || '',
          sellerEmail: carData.sellerEmail || currentUser.email || '',
          sellerPhone: carData.sellerPhone || '',
          city: normalizedCity || '',
          region: normalizedRegion || '',
          status: (carData.status as UnifiedCar['status']) || 'active',
          accidentHistory: normalizedAccidentHistory ?? false,
          serviceHistory: normalizedServiceHistory ?? false,
          negotiable: normalizedNegotiable ?? false,
          financing: normalizedFinancing ?? false,
          tradeIn: normalizedTradeIn ?? false,
          warranty: carDataExtended.warranty ?? false,
          vatDeductible: normalizedVatDeductible ?? carDataExtended.vatDeductible ?? false,
          price: carData.price ?? 0,
          currency: carDataExtended.currency || 'EUR',
          priceType: normalizedPriceType,
          paymentMethods: carDataExtended.paymentMethods || [],
          preferredContact: carDataExtended.preferredContact || [],
          firstRegistration: carDataExtended.firstRegistration || carDataExtended.registrationDate || (carData.year ? `${carData.year}` : ''),
          bodyType: normalizedBody.value,
          bodyTypeOther: normalizedBody.other || carDataExtended.bodyTypeOther || '',
          fuelType: normalizedFuel.value,
          fuelTypeOther: normalizedFuel.other || carDataExtended.fuelTypeOther || '',
          color: normalizedColor.value,
          colorOther: normalizedColor.other || carDataExtended.colorOther || '',
          roadworthy: normalizedRoadworthy ?? null,
          saleType: normalizedSaleType,
          saleTimeline: normalizedSaleTimeline,
          doors: normalizedDoors ? String(normalizedDoors) : '',
          seats: normalizedSeats ?? '',
        } as UnifiedCar;

        setCar(normalizedCar);
        setFormData(normalizedCar);
        setImages(normalizedCar.images || []);
        setLoading(false);

      } catch (err) {
        logger.error('Error loading car data for edit', err as Error, { carId });
        setError(t.errors.loadError);
        setLoading(false);
      }
    };

    loadCarData();
  }, [carId, currentUser, t, language]);

  // Cleanup preview URLs when images change
  useEffect(() => {
    // Revoke old URLs
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();

    // Create new URLs for File objects
    images.forEach((img, index) => {
      if (typeof img !== 'string') {
        const url = URL.createObjectURL(img as File);
        previewUrlsRef.current.set(index, url);
      }
    });

    // Cleanup on unmount
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, [images]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setError('');
    setSuccess('');
  }, []);

  const handleTextChange = (field: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleNumberChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(field, parseInt(e.target.value, 10));
  };

  const handleSelectChange = (field: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleSelectNumberChange = (field: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(field, parseInt(e.target.value, 10));
  };

  const handleNestedChange = useCallback((parent: string, field: string, value: unknown) => {
    setFormData(prev => {
      const parentValue = prev[parent] as Record<string, unknown> | undefined;
      return {
        ...prev,
        [parent]: {
          ...(parentValue || {}),
          [field]: value
        }
      };
    });
    setHasChanges(true);
  }, []);

  const handleEquipmentToggle = useCallback((category: string, item: string) => {
    setFormData(prev => {
      const currentList = (prev[category] as string[] | undefined) || [];
      const newList = currentList.includes(item)
        ? currentList.filter((i: string) => i !== item)
        : [...currentList, item];
      return { ...prev, [category]: newList };
    });
    setHasChanges(true);
  }, []);

  const registrationParts = useMemo(() => {
    if (!formData.firstRegistration) {
      return { year: '', month: '' };
    }
    const [year, month] = String(formData.firstRegistration).split('-');
    return {
      year: year || '',
      month: month || '',
    };
  }, [formData.firstRegistration]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const exampleYear = (currentYear - 10).toString();
    const exampleLabel = language === 'bg'
      ? `Пример: ${exampleYear} | Изберете година`
      : `Example: ${exampleYear} | Select year`;

    return [
      { value: '', label: exampleLabel },
      ...Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
        const year = (currentYear - i).toString();
        return { value: year, label: year };
      })
    ];
  }, [language]);

  const registrationMonthOptions = useMemo(
    () => [
      { value: '', label: language === 'bg' ? 'Месец' : 'Month' },
      ...FIRST_REGISTRATION_MONTHS.map(month => ({
        value: month.value,
        label: language === 'bg' ? month.labelBg : month.labelEn,
      })),
    ],
    [language]
  );

  const provinceOptions = useMemo(() => {
    return BULGARIA_PROVINCES.map(p => ({
      value: language === 'bg' ? p.bg : p.en,
      label: language === 'bg' ? p.bg : p.en,
    }));
  }, [language]);

  const cityOptions = useMemo(() => {
    return UnifiedCitiesService.getCitiesForSelect(language as 'bg' | 'en').map(c => ({
      value: c.value,
      label: language === 'bg' ? c.labelBg : c.labelEn,
    }));
  }, [language]);

  const updateFirstRegistration = useCallback(
    (nextYear?: string, nextMonth?: string) => {
      const year = nextYear ?? registrationParts.year;
      const month = nextMonth ?? registrationParts.month;
      const value = year ? `${year}${month ? `-${month}` : ''}` : '';
      handleInputChange('firstRegistration', value);
    },
    [handleInputChange, registrationParts]
  );

  const handleRegistrationYearChange = useCallback(
    (value: string) => {
      if (!value) {
        handleInputChange('firstRegistration', '');
        return;
      }
      updateFirstRegistration(value, undefined);
    },
    [handleInputChange, updateFirstRegistration]
  );

  const handleRegistrationMonthChange = useCallback(
    (value: string) => {
      if (!registrationParts.year) return;
      updateFirstRegistration(undefined, value || undefined);
    },
    [registrationParts.year, updateFirstRegistration]
  );

  const handleDoorSelect = useCallback((value: string) => {
    handleInputChange('doors', value);
  }, [handleInputChange]);

  const handleRoadworthyChange = useCallback((choice: 'yes' | 'no') => {
    handleInputChange('roadworthy', choice === 'yes');
  }, [handleInputChange]);

  const handleSaleTypeChange = useCallback((choice: 'private' | 'commercial') => {
    handleInputChange('saleType', choice);
  }, [handleInputChange]);

  const handleSaleTimelineChange = useCallback((choice: 'unknown' | 'soon' | 'months') => {
    handleInputChange('saleTimeline', choice);
  }, [handleInputChange]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 20) break;
        const file = files[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      }
      setImages(newImages);
      setHasChanges(true);
    } catch (err) {
      setError(t.errors.imageUploadFailed);
    } finally {
      setUploadingImage(false);
    }
  }, [images, t]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (selectedImageIndex >= index && selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
    }
    setHasChanges(true);
  }, [selectedImageIndex]);

  const nextImage = useCallback(() => {
    if (images.length > 0) {
      setSelectedImageIndex(prev => (prev + 1) % images.length);
    }
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      setSelectedImageIndex(prev => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  const handleSave = async () => {
    if (!carId || !currentUser) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: Partial<UnifiedCar> = {
        ...formData,
        images: images,
        updatedAt: new Date(),
      };

      await unifiedCarService.updateCar(carId, updateData);

      setSuccess(t.success.saved);
      setHasChanges(false);

      const updatedCar = await unifiedCarService.getCarById(carId);
      if (updatedCar) {
        const updatedCarExtended = updatedCar as UnifiedCar & {
          currency?: string;
          priceType?: string;
          paymentMethods?: string[];
          preferredContact?: string[];
        };
        const refreshed: UnifiedCar = {
          ...updatedCar,
          currency: updatedCarExtended.currency || 'EUR',
          priceType: updatedCarExtended.priceType || 'fixed',
          paymentMethods: updatedCarExtended.paymentMethods || [],
          preferredContact: updatedCarExtended.preferredContact || [],
        };
        setCar(refreshed);
        setFormData(refreshed);
        setImages(refreshed.images || []);
      }

    } catch (err) {
      logger.error('Error saving car data', err as Error, { carId });
      setError(t.errors.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm(t.confirmDiscard)) {
        navigate(`/car/${carId}`);
      }
    } else {
      navigate(`/car/${carId}`);
    }
  };

  const handleDelete = async () => {
    if (!carId || !currentUser) return;

    const carExtended = car as UnifiedCar & { sellerType?: string };
    const sellerType = carExtended?.sellerType || 'private';
    const quotaMessage = sellerType === 'dealer'
      ? (language === 'bg' ? 'الحد الشهري للتاجر/المعرض هو 10 سيارات.' : 'Dealers can list up to 10 cars per month.')
      : sellerType === 'company'
        ? (language === 'bg' ? 'الشركات لديها عدد غير محدود من الإعلانات.' : 'Companies have unlimited listings.')
        : (language === 'bg' ? 'الحد الشهري للبائع الشخصي هو 3 سيارات.' : 'Private sellers can list up to 3 cars per month.');

    const confirmationText = language === 'bg'
      ? `سيتم حذف هذا الإعلان نهائياً ولن يظهر مرة أخرى للمشترين. ${quotaMessage}\n\nهل أنت متأكد من الحذف؟`
      : `This listing will be permanently deleted and removed from all buyer views. ${quotaMessage}\n\nDo you want to proceed?`;

    const confirmed = window.confirm(confirmationText);
    if (!confirmed) return;

    // Secondary analytic question: sold vs canceled
    const soldConfirm = window.confirm(
      language === 'bg'
        ? 'هل تم بيع السيارة بالفعل؟ اختر "موافق" إذا تم البيع، أو "إلغاء" إذا ألغيت فكرة البيع.'
        : 'Was the car sold? Click OK if sold, or Cancel if you decided not to sell.'
    );
    const deleteOutcome = soldConfirm ? 'sold_before_delete' : 'canceled_before_delete';

    try {
      setDeleting(true);
      await unifiedCarService.deleteCar(carId);
      logger.info('Listing deleted with outcome', { carId, outcome: deleteOutcome, sellerType });
      setHasChanges(false);
      navigate('/my-listings');
    } catch (err) {
      logger.error('Error deleting car', err as Error, { carId });
      setError(language === 'bg'
        ? 'حدث خطأ أثناء الحذف. حاول مرة أخرى.'
        : 'Deletion failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper $isDark={isDark}>
        <LoadingOverlay>
          <LoadingSpinner />
          <span>{t.loading}</span>
        </LoadingOverlay>
      </PageWrapper>
    );
  }

  if (error && !car) {
    return (
      <PageWrapper $isDark={isDark}>
        <Container $isDark={isDark}>
          <ErrorMessage $isDark={isDark}>
            <AlertCircle size={48} />
            <h2>{error}</h2>
            <BackButton $isDark={isDark} onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              {t.back}
            </BackButton>
          </ErrorMessage>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper $isDark={isDark}>
      <TopBar $isDark={isDark}>
        <TopBarLeft>
          <BackButton $isDark={isDark} onClick={handleCancel}>
            <ArrowLeft size={18} />
            {t.back}
          </BackButton>
          <StatusBadge $status={car?.status || 'active'} $isDark={isDark}>
            {car?.status === 'active' ? t.status.active :
              car?.status === 'sold' ? t.status.sold :
                car?.status === 'draft' ? t.status.pending : t.status.inactive}
          </StatusBadge>
        </TopBarLeft>
        <TopBarRight>
          {hasChanges && (
            <CancelButton $isDark={isDark} onClick={() => {
              setFormData(car || {});
              setImages(car?.images || []);
              setHasChanges(false);
            }}>
              <X size={18} />
              {t.discardChanges}
            </CancelButton>
          )}
          <SaveButton
            $isDark={isDark}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? <LoadingSpinner /> : <Save size={18} />}
            {saving ? t.saving : t.save}
          </SaveButton>
        </TopBarRight>
      </TopBar>

      {error && <ErrorMessage $isDark={isDark} $inline>{error}</ErrorMessage>}
      {success && <SuccessMessage $isDark={isDark}><Check size={18} />{success}</SuccessMessage>}

      <Container $isDark={isDark}>
        <MainSection $isDark={isDark}>
          <LeftColumn $isDark={isDark}>

            <ImageSection $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.images}</SectionTitle>

              <MainImageContainer $isDark={isDark}>
                {images.length > 0 ? (
                  <>
                    <MainImage
                      src={typeof images[selectedImageIndex] === 'string'
                        ? images[selectedImageIndex] as string
                        : previewUrlsRef.current.get(selectedImageIndex) || ''}
                      alt={`${formData.make} ${formData.model}`}
                    />
                    {images.length > 1 && (
                      <>
                        <ImageNavButton $position="left" $isDark={isDark} onClick={prevImage}>
                          <ChevronLeft size={24} />
                        </ImageNavButton>
                        <ImageNavButton $position="right" $isDark={isDark} onClick={nextImage}>
                          <ChevronRight size={24} />
                        </ImageNavButton>
                      </>
                    )}
                    <RemoveImageButton
                      $isDark={isDark}
                      onClick={() => handleRemoveImage(selectedImageIndex)}
                    >
                      <Trash2 size={16} />
                    </RemoveImageButton>
                  </>
                ) : (
                  <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                    <Upload size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>{t.uploadImages}</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </MainImageContainer>

              <ThumbnailGrid $isDark={isDark}>
                {images.map((img, index) => (
                  <Thumbnail
                    key={index}
                    $isActive={index === selectedImageIndex}
                    $isDark={isDark}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={typeof img === 'string' ? img : previewUrlsRef.current.get(index) || ''}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </Thumbnail>
                ))}
                {images.length < 20 && (
                  <AddImageButton $isDark={isDark}>
                    <label>
                      <Plus size={24} />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleImageUpload}
                      />
                    </label>
                  </AddImageButton>
                )}
              </ThumbnailGrid>
            </ImageSection>

            <Card $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.basicInfo}</SectionTitle>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.makeModel}</Label>
                <BrandModelMarkdownDropdown
                  brand={formData.make || ''}
                  model={formData.model || ''}
                  onBrandChange={(brand) => handleInputChange('make', brand)}
                  onModelChange={(model) => handleInputChange('model', model)}
                />
                <InlineHint $isDark={isDark}>{t.hints.makeModel}</InlineHint>
              </FormGroup>

              <ThreeColumnGrid>
                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.year}</Label>
                  <Select
                    $isDark={isDark}
                    value={formData.year || ''}
                    onChange={handleSelectChange('year')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {yearOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.mileage}</Label>
                  <Input
                    $isDark={isDark}
                    type="number"
                    value={formData.mileage || ''}
                    onChange={handleNumberChange('mileage')}
                    placeholder="km"
                  />
                </FormGroup>

                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.power}</Label>
                  <Input
                    $isDark={isDark}
                    type="number"
                    value={(formData.power as number | undefined) || ''}
                    onChange={handleNumberChange('power')}
                    placeholder="hp"
                  />
                </FormGroup>
              </ThreeColumnGrid>

              <InlineFieldRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label $isDark={isDark}>{t.fields.firstRegistrationYear}</Label>
                  <Select
                    $isDark={isDark}
                    value={registrationParts.year}
                    onChange={(e) => handleRegistrationYearChange(e.target.value)}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {yearOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                  <Label $isDark={isDark}>{t.fields.firstRegistrationMonth}</Label>
                  <Select
                    $isDark={isDark}
                    value={registrationParts.month}
                    onChange={(e) => handleRegistrationMonthChange(e.target.value)}
                    disabled={!registrationParts.year}
                  >
                    {registrationMonthOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FormGroup>
              </InlineFieldRow>

              <TwoColumnGrid>
                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.fuelType}</Label>
                  <Select
                    $isDark={isDark}
                    value={formData.fuelType || ''}
                    onChange={handleSelectChange('fuelType')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {FUEL_TYPES.map(fuel => (
                      <option key={fuel} value={fuel}>
                        {t.fuelTypes[fuel as keyof typeof t.fuelTypes] || fuel}
                      </option>
                    ))}
                  </Select>
                  {formData.fuelType === '__other__' && (
                    <Input
                      $isDark={isDark}
                      style={{ marginTop: '0.5rem' }}
                      value={(formData.fuelTypeOther as string | undefined) || ''}
                      onChange={handleTextChange('fuelTypeOther')}
                      placeholder={t.placeholders.otherFuel}
                    />
                  )}
                </FormGroup>

                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.transmission}</Label>
                  <Select
                    $isDark={isDark}
                    value={formData.transmission || ''}
                    onChange={handleSelectChange('transmission')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {TRANSMISSIONS.map(trans => (
                      <option key={trans} value={trans}>
                        {t.transmissions[trans as keyof typeof t.transmissions] || trans}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </TwoColumnGrid>

              <TwoColumnGrid>
                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.bodyType}</Label>
                  <Select
                    $isDark={isDark}
                    value={(formData.bodyType as string | undefined) || ''}
                    onChange={handleSelectChange('bodyType')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {WORKFLOW_BODY_TYPES.map(body => (
                      <option key={body.value} value={body.value}>
                        {language === 'bg' ? body.labelBg : body.labelEn}
                      </option>
                    ))}
                  </Select>
                  {(formData.bodyType as string | undefined) === 'other' && (
                    <Input
                      $isDark={isDark}
                      style={{ marginTop: '0.5rem' }}
                      value={(formData.bodyTypeOther as string | undefined) || ''}
                      onChange={handleTextChange('bodyTypeOther')}
                      placeholder={t.placeholders.bodyTypeOther}
                    />
                  )}
                </FormGroup>

                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.color}</Label>
                  <Select
                    $isDark={isDark}
                    value={formData.color || ''}
                    onChange={handleSelectChange('color')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {COLORS.map(color => (
                      <option key={color} value={color}>
                        {t.colors[color as keyof typeof t.colors] || color}
                      </option>
                    ))}
                  </Select>
                  {formData.color === 'other' && (
                    <Input
                      $isDark={isDark}
                      style={{ marginTop: '0.5rem' }}
                      value={(formData.colorOther as string | undefined) || ''}
                      onChange={handleTextChange('colorOther')}
                      placeholder={t.placeholders.colorOther}
                    />
                  )}
                </FormGroup>
              </TwoColumnGrid>

              <TwoColumnGrid>
                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.doors}</Label>
                  <PillGroup>
                    {DOOR_CHIP_OPTIONS.map(option => (
                      <PillButton
                        key={option.value}
                        type="button"
                        $isDark={isDark}
                        $active={String(formData.doors) === option.value}
                        onClick={() => handleDoorSelect(option.value)}
                      >
                        {option.label}
                      </PillButton>
                    ))}
                  </PillGroup>
                  <InlineHint $isDark={isDark}>{t.hints.doors}</InlineHint>
                </FormGroup>

                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.seats}</Label>
                  <Select
                    $isDark={isDark}
                    value={(formData.seats as string | number | undefined) || (formData.numberOfSeats as string | number | undefined) || ''}
                    onChange={handleSelectNumberChange('seats')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {[2, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </Select>
                </FormGroup>
              </TwoColumnGrid>

              <TwoColumnGrid>
                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.condition}</Label>
                  <Select
                    $isDark={isDark}
                    value={(formData.condition as string | undefined) || ''}
                    onChange={handleSelectChange('condition')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>
                        {t.conditions[cond as keyof typeof t.conditions] || cond}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label $isDark={isDark}>{t.fields.driveType}</Label>
                  <Select
                    $isDark={isDark}
                    value={(formData.driveType as string | undefined) || ''}
                    onChange={handleSelectChange('driveType')}
                  >
                    <option value="">{t.placeholders.select}</option>
                    {DRIVE_TYPES.map(drive => (
                      <option key={drive} value={drive}>
                        {t.driveTypes[drive as keyof typeof t.driveTypes] || drive}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </TwoColumnGrid>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.roadworthy}</Label>
                <ToggleGroup>
                  {ROADWORTHY_CHOICES.map(choice => (
                    <ToggleButton
                      key={choice}
                      type="button"
                      $isDark={isDark}
                      $active={(formData.roadworthy ?? true) === (choice === 'yes')}
                      onClick={() => handleRoadworthyChange(choice)}
                    >
                      {t.roadworthyOptions[choice]}
                    </ToggleButton>
                  ))}
                </ToggleGroup>
              </FormGroup>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.saleType}</Label>
                <ToggleGroup>
                  {SALE_TYPE_CHOICES.map(choice => (
                    <ToggleButton
                      key={choice}
                      type="button"
                      $isDark={isDark}
                      $active={(formData.saleType || 'private') === choice}
                      onClick={() => handleSaleTypeChange(choice)}
                    >
                      {t.saleTypeOptions[choice]}
                    </ToggleButton>
                  ))}
                </ToggleGroup>
              </FormGroup>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.saleTimeline}</Label>
                <ToggleGroup>
                  {SALE_TIMELINE_CHOICES.map(choice => (
                    <ToggleButton
                      key={choice}
                      type="button"
                      $isDark={isDark}
                      $active={(formData.saleTimeline || 'unknown') === choice}
                      onClick={() => handleSaleTimelineChange(choice)}
                    >
                      {t.saleTimelineOptions[choice]}
                    </ToggleButton>
                  ))}
                </ToggleGroup>
              </FormGroup>

              <ToggleGroup>
                <ToggleButton
                  type="button"
                  $isDark={isDark}
                  $active={formData.accidentHistory === false}
                  onClick={() => handleInputChange('accidentHistory', formData.accidentHistory === false ? true : false)}
                >
                  {formData.accidentHistory === false && <Check size={14} style={{ marginRight: 6 }} />}
                  {t.fields.accidentFree}
                </ToggleButton>
                <ToggleButton
                  type="button"
                  $isDark={isDark}
                  $active={!!formData.serviceHistory}
                  onClick={() => handleInputChange('serviceHistory', !formData.serviceHistory)}
                >
                  {formData.serviceHistory && <Check size={14} style={{ marginRight: 6 }} />}
                  {t.fields.serviceHistory}
                </ToggleButton>
              </ToggleGroup>
            </Card>

            <Card $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.description}</SectionTitle>
              <FormGroup>
                <TextArea
                  $isDark={isDark}
                  value={(formData.description as string | undefined) || ''}
                  onChange={handleTextChange('description')}
                  placeholder={t.placeholders.description}
                  rows={6}
                />
              </FormGroup>
            </Card>

            <EquipmentSection $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.equipment}</SectionTitle>

              <EquipmentCategory>
                <EquipmentTitle $isDark={isDark}>{t.equipment.safety}</EquipmentTitle>
                <EquipmentGrid>
                  {SAFETY_EQUIPMENT.map(item => (
                    <EquipmentItem
                      key={item}
                      $isDark={isDark}
                      $isSelected={(formData.safetyEquipment || []).includes(item)}
                      onClick={() => handleEquipmentToggle('safetyEquipment', item)}
                    >
                      {(formData.safetyEquipment || []).includes(item) && <Check size={14} />}
                      {t.equipmentItems[item as keyof typeof t.equipmentItems] || item}
                    </EquipmentItem>
                  ))}
                </EquipmentGrid>
              </EquipmentCategory>

              <EquipmentCategory>
                <EquipmentTitle $isDark={isDark}>{t.equipment.comfort}</EquipmentTitle>
                <EquipmentGrid>
                  {COMFORT_EQUIPMENT.map(item => (
                    <EquipmentItem
                      key={item}
                      $isDark={isDark}
                      $isSelected={(formData.comfortEquipment || []).includes(item)}
                      onClick={() => handleEquipmentToggle('comfortEquipment', item)}
                    >
                      {(formData.comfortEquipment || []).includes(item) && <Check size={14} />}
                      {t.equipmentItems[item as keyof typeof t.equipmentItems] || item}
                    </EquipmentItem>
                  ))}
                </EquipmentGrid>
              </EquipmentCategory>

              <EquipmentCategory>
                <EquipmentTitle $isDark={isDark}>{t.equipment.infotainment}</EquipmentTitle>
                <EquipmentGrid>
                  {INFOTAINMENT_EQUIPMENT.map(item => (
                    <EquipmentItem
                      key={item}
                      $isDark={isDark}
                      $isSelected={(formData.infotainmentEquipment || []).includes(item)}
                      onClick={() => handleEquipmentToggle('infotainmentEquipment', item)}
                    >
                      {(formData.infotainmentEquipment || []).includes(item) && <Check size={14} />}
                      {t.equipmentItems[item as keyof typeof t.equipmentItems] || item}
                    </EquipmentItem>
                  ))}
                </EquipmentGrid>
              </EquipmentCategory>

              <EquipmentCategory>
                <EquipmentTitle $isDark={isDark}>{t.equipment.extras}</EquipmentTitle>
                <EquipmentGrid>
                  {EXTRA_EQUIPMENT.map(item => (
                    <EquipmentItem
                      key={item}
                      $isDark={isDark}
                      $isSelected={(formData.extrasEquipment || []).includes(item)}
                      onClick={() => handleEquipmentToggle('extrasEquipment', item)}
                    >
                      {(formData.extrasEquipment || []).includes(item) && <Check size={14} />}
                      {t.equipmentItems[item as keyof typeof t.equipmentItems] || item}
                    </EquipmentItem>
                  ))}
                </EquipmentGrid>
              </EquipmentCategory>
            </EquipmentSection>

          </LeftColumn>

          <RightColumn $isDark={isDark}>

            <Card $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.price}</SectionTitle>

              <PriceWrapper>
                <PriceInput
                  $isDark={isDark}
                  type="number"
                  value={formData.price || ''}
                  onChange={handleNumberChange('price')}
                  placeholder="0"
                />
                <CurrencySelect
                  $isDark={isDark}
                  value={formData.currency || 'EUR'}
                  onChange={handleSelectChange('currency')}
                >
                  <option value="EUR">EUR</option>
                  <option value="BGN">BGN</option>
                  <option value="USD">USD</option>
                </CurrencySelect>
              </PriceWrapper>

              <FormGroup style={{ marginTop: '1rem' }}>
                <Label $isDark={isDark}>{t.fields.priceType}</Label>
                <Select
                  $isDark={isDark}
                  value={formData.priceType || 'fixed'}
                  onChange={handleSelectChange('priceType')}
                >
                  <option value="fixed">{t.priceTypes.fixed}</option>
                  <option value="negotiable">{t.priceTypes.negotiable}</option>
                  <option value="best_offer">{t.priceTypes.bestOffer}</option>
                </Select>
              </FormGroup>

              <CheckboxGroup>
                <ToggleButton
                  type="button"
                  $isDark={isDark}
                  $active={!!formData.negotiable}
                  onClick={() => handleInputChange('negotiable', !formData.negotiable)}
                >
                  {formData.negotiable && <Check size={14} style={{ marginRight: 6 }} />}
                  {t.fields.negotiable}
                </ToggleButton>

                <ToggleButton
                  type="button"
                  $isDark={isDark}
                  $active={!!(formData.vatDeductible as boolean | undefined)}
                  onClick={() => handleInputChange('vatDeductible', !(formData.vatDeductible as boolean | undefined))}
                >
                  {(formData.vatDeductible as boolean | undefined) && <Check size={14} style={{ marginRight: 6 }} />}
                  {t.fields.vatDeductible}
                </ToggleButton>
              </CheckboxGroup>

              <CheckboxGroup>
                <ToggleButton
                  type="button"
                  $isDark={isDark}
                  $active={!!formData.financing}
                  onClick={() => handleInputChange('financing', !formData.financing)}
                >
                  {formData.financing && <Check size={14} style={{ marginRight: 6 }} />}
                  {t.fields.financing}
                </ToggleButton>

                <ToggleButton
                  type="button"
                  $isDark={isDark}
                  $active={!!formData.tradeIn}
                  onClick={() => handleInputChange('tradeIn', !formData.tradeIn)}
                >
                  {formData.tradeIn && <Check size={14} style={{ marginRight: 6 }} />}
                  {t.fields.tradeIn}
                </ToggleButton>
              </CheckboxGroup>
            </Card>

            <ContactSection $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.contact}</SectionTitle>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.sellerName}</Label>
                <Input
                  $isDark={isDark}
                  value={formData.sellerName || ''}
                  onChange={handleTextChange('sellerName')}
                />
              </FormGroup>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.sellerPhone}</Label>
                <Input
                  $isDark={isDark}
                  type="tel"
                  value={formData.sellerPhone || ''}
                  onChange={handleTextChange('sellerPhone')}
                  placeholder="+359..."
                />
              </FormGroup>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.sellerEmail}</Label>
                <Input
                  $isDark={isDark}
                  type="email"
                  value={formData.sellerEmail || ''}
                  onChange={handleTextChange('sellerEmail')}
                />
              </FormGroup>
            </ContactSection>

            <Card $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.location}</SectionTitle>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.locationData?.cityName}</Label>
                <Select
                  $isDark={isDark}
                  value={formData.locationData?.cityName || ''}
                  onChange={handleSelectChange('city')}
                >
                  <option value="">{t.placeholders.select}</option>
                  {cityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.region}</Label>
                <Select
                  $isDark={isDark}
                  value={formData.region || ''}
                  onChange={handleSelectChange('region')}
                >
                  <option value="">{t.placeholders.select}</option>
                  {provinceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </FormGroup>
            </Card>

            <Card $isDark={isDark}>
              <SectionTitle $isDark={isDark}>{t.sections.status}</SectionTitle>

              <FormGroup>
                <Label $isDark={isDark}>{t.fields.listingStatus}</Label>
                <Select
                  $isDark={isDark}
                  value={formData.status || 'active'}
                  onChange={handleSelectChange('status')}
                >
                  <option value="active">{t.status.active}</option>
                  <option value="draft">{t.status.pending}</option>
                  <option value="sold">{t.status.sold}</option>
                  <option value="inactive">{t.status.inactive}</option>
                </Select>
              </FormGroup>
            </Card>

          </RightColumn>
        </MainSection>
      </Container>

      {saving && (
        <LoadingOverlay>
          <LoadingSpinner />
          <span>{t.saving}</span>
        </LoadingOverlay>
      )}

      {/** Danger zone for permanent delete */}
      <Container $isDark={isDark}>
        <Card $isDark={isDark} style={{ borderColor: '#ef4444' }}>
          <SectionTitle $isDark={isDark} style={{ color: '#ef4444' }}>
            {language === 'bg' ? 'حذف نهائي للإعلان' : 'Permanent Listing Deletion'}
          </SectionTitle>
          <p style={{ margin: '0 0 1rem 0', color: isDark ? '#f8fafc' : '#0f172a' }}>
            {language === 'bg'
              ? 'سيتم حذف الإعلان نهائياً من جميع أماكن التخزين (محلياً وفايربيز) مع الحفاظ فقط على السجلات التحليلية والإدارية.'
              : 'This will permanently delete the listing from all storage (local and Firebase), keeping only analytical/admin traces.'}
          </p>
          <p style={{ margin: '0 0 1rem 0', color: isDark ? '#cbd5e1' : '#334155' }}>
            {language === 'bg'
              ? 'الحصص: البائع الشخصي 3 سيارات/شهر، التاجر 10 سيارات/شهر، الشركات عدد غير محدود.'
              : 'Quotas: Private 3 cars/month, Dealer 10 cars/month, Companies unlimited.'}
          </p>
          <SaveButton
            $isDark={isDark}
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: '#ef4444', borderColor: '#ef4444' }}
          >
            {deleting ? <LoadingSpinner /> : <Trash2 size={18} />}
            {deleting
              ? (language === 'bg' ? 'جاري الحذف...' : 'Deleting...')
              : (language === 'bg' ? 'حذف نهائي' : 'Delete Permanently')}
          </SaveButton>
        </Card>
      </Container>
    </PageWrapper>
  );
};

export default CarEditPage;
