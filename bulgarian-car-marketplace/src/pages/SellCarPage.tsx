// src/pages/SellCarPage.tsx
// Sell Car Page for Bulgarian Car Marketplace

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { bulgarianCarService, BulgarianCar } from '../firebase';
import { CAR_MAKES, YEARS_OPTIONS, PRICE_SUGGESTIONS } from '../constants/carMakes';

// Styled Components
const SellCarContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  background: ${({ theme }) => theme.colors.grey[50]};
`;

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FormContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['3xl']};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  label {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  input, select, textarea {
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    background: ${({ theme }) => theme.colors.background.paper};
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary.main};
  }

  label {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    cursor: pointer;
  }
`;

const ImageUpload = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  background: ${({ theme }) => theme.colors.grey[50]};
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.main}10;
  }

  .upload-icon {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    color: ${({ theme }) => theme.colors.grey[400]};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: block;
  }

  .upload-text {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .upload-hint {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ImageItem = styled.div`
  position: relative;
  width: 100px;
  height: 75px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.grey[200]};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: ${({ theme }) => theme.colors.error.main};
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing['3xl']};
  padding-top: ${({ theme }) => theme.spacing['2xl']};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  border: 2px solid ${({ theme, variant }) =>
    variant === 'secondary' ? theme.colors.grey[300] : theme.colors.primary.main};
  background: ${({ theme, variant }) =>
    variant === 'secondary' ? 'transparent' : theme.colors.primary.main};
  color: ${({ theme, variant }) =>
    variant === 'secondary' ? theme.colors.text.primary : theme.colors.primary.contrastText};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  min-width: 150px;

  &:hover {
    background: ${({ theme, variant }) =>
      variant === 'secondary' ? theme.colors.grey[100] : theme.colors.primary.dark};
    border-color: ${({ theme, variant }) =>
      variant === 'secondary' ? theme.colors.grey[400] : theme.colors.primary.dark};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      background: ${({ theme, variant }) =>
        variant === 'secondary' ? 'transparent' : theme.colors.primary.main};
      border-color: ${({ theme }) => theme.colors.primary.main};
      transform: none;
    }
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  background: ${({ theme }) => theme.colors.success.light}20;
  border: 1px solid ${({ theme }) => theme.colors.success.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.success.main};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

// Comprehensive car makes list - Updated with complete list
// const CAR_MAKES = [
//   'Abarth', 'Acura', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Brilliance', 'Bugatti',
//   'Buick', 'BYD', 'Cadillac', 'Changan', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia',
//   'Daewoo', 'Daihatsu', 'Dodge', 'Dongfeng', 'DS Automobiles', 'Exeed', 'Ferrari', 'Fiat', 'Fisker', 'Ford',
//   'Forthing', 'GAZ', 'Geely', 'Genesis', 'GMC', 'Great Wall', 'Haval', 'Honda', 'Hongqi', 'Hummer',
//   'Hyundai', 'Infiniti', 'Iran Khodro', 'Isuzu', 'Iveco', 'Jaguar', 'JAC', 'Jeep', 'Jetour', 'Kia',
//   'Koenigsegg', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Leapmotor', 'Lexus', 'Lincoln', 'Lotus', 'Lucid Motors',
//   'MAN', 'Mahindra', 'Maserati', 'Maxus', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini',
//   'Mitsubishi', 'Moskvitch', 'NIO', 'Nissan', 'Opel', 'Pagani', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche',
//   'Praga', 'RAM', 'Renault', 'Rimac', 'Rinspeed', 'Rolls-Royce', 'Rover', 'Saab', 'Saipa', 'Scania',
//   'SEAT', 'Seres', 'Sin Cars', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tata', 'Tesla',
//   'Toyota', 'Tatra', 'TVR', 'UAZ', 'Volkswagen', 'Volvo', 'Voyah', 'Wiesmann', 'Xpeng', 'Zeekr'
// ];

// Generate years array from 1900 to 2025
// const YEARS_OPTIONS = (() => {
//   const years = [];
//   for (let year = 2025; year >= 1900; year--) {
//     years.push(year);
//   }
//   return years;
// })();

// Price suggestions for Bulgarian market
// const PRICE_SUGGESTIONS = [
//   1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000,
//   35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000, 150000
// ];

// Sell Car Page Component
const SellCarPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    // Basic Info
    make: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    fuelType: '',
    transmission: '',
    engineSize: '',
    power: '',
    condition: '',
    color: '',
    bodyStyle: '',
    seats: '',
    doors: '',
    slidingDoor: false as boolean,
    paymentType: '',

    // Location
    city: '',
    region: '',
    postalCode: '',

    // Description
    title: '',
    description: '',
    features: [] as string[],
    extras: [] as string[],

    // Additional
    hasBulgarianRegistration: false,
    vinNumber: '',
    firstRegistrationDate: '',
    inspectionValidUntil: '',

    // Technical extra
    driveType: '',
    fuelConsumptionCombined: '',
    emissionSticker: '',
    emissionClass: '',
    particulateFilter: false as boolean,
    fuelTankVolumeL: '',
    weightKg: '',
    cylinders: '',

    // Exterior
    exteriorColorCategory: '',
    metallic: false as boolean,
    matte: false as boolean,
    towbar: '',
    trailerAssist: false as boolean,
    brakedTrailerLoadKg: '',
    unbrakedTrailerLoadKg: '',
    noseWeightKg: '',
    parkingAssist: [] as string[],
    cruiseControl: '',

    // Interior
    interiorColor: '',
    interiorMaterial: '',
    airbags: '',
    climateControl: '',

    // Offer details
    sellerType: '',
    sellerRating: '',
    withVideo: false as boolean,
    discountOffer: false as boolean,
    nonSmoker: false as boolean,
    taxi: false as boolean,
    vatReclaimable: false as boolean,
    warranty: false as boolean,
    damagedVehicles: '',
    commercial: false as boolean,
    approvedUsedProgramme: '',

    // Service & Ownership
    numberOfOwners: '',
    fullServiceHistory: false as boolean,
    roadworthy: false as boolean,
    newService: false as boolean,
    deliveryAvailable: false as boolean,
  });

  // Dynamic model options based on selected make
  const [modelsForMake, setModelsForMake] = useState<string[]>([]);
  useEffect(() => {
    if (!formData.make) { setModelsForMake([]); return; }
    let cancelled = false;
    bulgarianCarService.getModelsByMake(formData.make)
      .then(models => { if (!cancelled) setModelsForMake(models); })
      .catch(() => setModelsForMake([]));
    return () => { cancelled = true; };
  }, [formData.make]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle array checkbox groups (e.g., parkingAssist)
  const handleArrayCheckbox = (name: keyof typeof formData, value: string, checked: boolean) => {
    const current = (formData as any)[name] as string[];
    const next = checked ? [...current, value] : current.filter(v => v !== value);
    setFormData(prev => ({ ...prev, [name]: next }));
  };

  // Handle features
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      alert(t('sellCar.maxImages'));
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Option lists
  const BODY_STYLES = ['Cabriolet/Roadster', 'Estate Car', 'SUV', 'Saloon', 'Small Car', 'Sports Car/Coupe', 'Van/Minibus', 'Other'];
  const DRIVE_TYPES = [
    { value: '', label: t('search.allDriveTypes') },
    { value: 'awd', label: t('search.driveType.awd') },
    { value: 'fwd', label: t('search.driveType.fwd') },
    { value: 'rwd', label: t('search.driveType.rwd') }
  ];
  const EXTERIOR_COLOR_CATEGORIES = ['Black','Beige','Grey','Brown','White','Orange','Blue','Yellow','Red','Green','Silver','Gold','Purple'];
  const TOWBAR_OPTIONS = [
    { value: '', label: t('search.any') },
    { value: 'fixed', label: t('search.towbar.fixed') },
    { value: 'detachable', label: t('search.towbar.detachable') },
    { value: 'swiveling', label: t('search.towbar.swiveling') },
    { value: 'none', label: t('search.none') }
  ];
  const PARKING_ASSIST_OPTIONS = ['360° Camera','Camera','Front','Rear','Rear traffic alert','Self-steering systems'];
  const CRUISE_OPTIONS = [
    { value: '', label: t('search.any') },
    { value: 'none', label: t('search.cruise.none') },
    { value: 'cruise', label: t('search.cruise.cruise') },
    { value: 'adaptive', label: t('search.cruise.adaptive') }
  ];
  const INTERIOR_MATERIALS = ['Alcantara','Fabric','Imitation leather','Part leather','Full leather','Velour','Other'];
  const AIRBAGS_OPTIONS = ['Driver Airbag','Front Airbags','Front and Side Airbags','Front, Side and More Airbags'];
  const CLIMATE_OPTIONS = [
    'No climatisation',
    'Manual or automatic climatisation',
    'Automatic climatisation',
    'Automatic climatisation, 2 zones',
    'Automatic climatisation, 3 zones',
    'Automatic climatisation, 4 zones'
  ];
  const EMISSION_STICKER_OPTIONS = [
    { value: '', label: t('search.any') },
    { value: 'Green', label: t('search.emissionSticker.green','Green') },
    { value: 'Yellow', label: t('search.emissionSticker.yellow','Yellow') },
    { value: 'Red', label: t('search.emissionSticker.red','Red') }
  ];
  const EMISSION_CLASS_OPTIONS = ['', 'Euro 1','Euro 2','Euro 3','Euro 4','Euro 5','Euro 6','Euro 6c','Euro 6d-TEMP','Euro 6d'];
  const DAMAGED_VEHICLE_OPTIONS = [
    { value: '', label: t('search.any') },
    { value: 'None', label: t('search.damage.none','None') },
    { value: 'Accident', label: t('search.damage.accident','Accident vehicle') },
    { value: 'Damaged', label: t('search.damage.damaged','Damaged') },
    { value: 'Unrepaired', label: t('search.damage.unrepaired','Unrepaired') },
    { value: 'For parts', label: t('search.damage.forParts','For parts') },
    { value: 'Non-runner', label: t('search.damage.nonRunner','Non-runner') }
  ];
  const APPROVED_PROGRAMME_OPTIONS = [
    { value: '', label: t('search.any') },
    { value: 'Audi Approved :plus', label: 'Audi Approved :plus' },
    { value: 'BMW Premium Selection', label: 'BMW Premium Selection' },
    { value: 'Mercedes-Benz Certified', label: 'Mercedes-Benz Certified' },
    { value: 'Toyota Approved Used', label: 'Toyota Approved Used' },
    { value: 'Volkswagen Das WeltAuto', label: 'Volkswagen Das WeltAuto' },
    { value: 'Hyundai Promise', label: 'Hyundai Promise' },
    { value: 'Nissan Intelligent Choice', label: 'Nissan Intelligent Choice' },
    { value: 'Renault Selection', label: 'Renault Selection' },
    { value: 'Peugeot Approved Used', label: 'Peugeot Approved Used' },
    { value: 'Opel Certified', label: 'Opel Certified' },
    { value: 'Volvo Selekt', label: 'Volvo Selekt' },
    { value: 'Jaguar Approved', label: 'Jaguar Approved' },
    { value: 'Land Rover Approved', label: 'Land Rover Approved' },
    { value: 'Other', label: t('search.other','Other') }
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Create car data
      const carData: Omit<BulgarianCar, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'> = {
        ownerId: 'current-user-id', // This should come from auth context
        ownerName: 'Current User', // This should come from auth context
        ownerEmail: 'user@example.com', // This should come from auth context

        // Basic Info
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        price: parseInt(formData.price),
        currency: 'EUR', // Bulgarian market uses EUR
        fuelType: formData.fuelType as any,
        transmission: formData.transmission as any,
        engineSize: parseInt(formData.engineSize),
        power: parseInt(formData.power),
        condition: formData.condition as any,
        color: formData.color,
        bodyStyle: formData.bodyStyle || undefined,
        seats: formData.seats ? parseInt(formData.seats) : undefined,
        doors: formData.doors ? parseInt(formData.doors) : undefined,
        slidingDoor: formData.slidingDoor || undefined,
        paymentType: (formData.paymentType || undefined) as any,

        // Location
        location: {
          city: formData.city,
          region: formData.region,
          postalCode: formData.postalCode,
          country: 'Bulgaria'
        },

        // Description
        title: formData.title,
        description: formData.description,
        features: formData.features.filter(f => f.trim() !== ''),
        extras: formData.extras.filter(f => f.trim() !== ''),

        // Technical extras
        driveType: (formData.driveType || undefined) as any,
        fuelConsumptionCombined: formData.fuelConsumptionCombined ? parseFloat(formData.fuelConsumptionCombined) : undefined,
        emissionSticker: formData.emissionSticker || undefined,
        emissionClass: formData.emissionClass || undefined,
        particulateFilter: formData.particulateFilter || undefined,
        fuelTankVolumeL: formData.fuelTankVolumeL ? parseInt(formData.fuelTankVolumeL) : undefined,
        weightKg: formData.weightKg ? parseInt(formData.weightKg) : undefined,
        cylinders: formData.cylinders ? parseInt(formData.cylinders) : undefined,

        // Exterior
        exteriorColorCategory: formData.exteriorColorCategory || undefined,
        metallic: formData.metallic || undefined,
        matte: formData.matte || undefined,
        towbar: (formData.towbar || undefined) as any,
        trailerAssist: formData.trailerAssist || undefined,
        brakedTrailerLoadKg: formData.brakedTrailerLoadKg ? parseInt(formData.brakedTrailerLoadKg) : undefined,
        unbrakedTrailerLoadKg: formData.unbrakedTrailerLoadKg ? parseInt(formData.unbrakedTrailerLoadKg) : undefined,
        noseWeightKg: formData.noseWeightKg ? parseInt(formData.noseWeightKg) : undefined,
        parkingAssist: formData.parkingAssist,
        cruiseControl: (formData.cruiseControl || undefined) as any,

        // Interior
        interiorColor: formData.interiorColor || undefined,
        interiorMaterial: formData.interiorMaterial || undefined,
        airbags: formData.airbags || undefined,
        climateControl: formData.climateControl || undefined,

        // Status
        isActive: true,
        isSold: false,
        isFeatured: false,
        images: [],
        mainImage: '',

        // Bulgarian Specific
        hasBulgarianRegistration: formData.hasBulgarianRegistration,
        vinNumber: formData.vinNumber || undefined,
        firstRegistrationDate: formData.firstRegistrationDate ? new Date(formData.firstRegistrationDate) : undefined,
        inspectionValidUntil: formData.inspectionValidUntil ? new Date(formData.inspectionValidUntil) : undefined,
        numberOfOwners: formData.numberOfOwners ? parseInt(formData.numberOfOwners) : undefined,
        fullServiceHistory: formData.fullServiceHistory || undefined,
        roadworthy: formData.roadworthy || undefined,
        newService: formData.newService || undefined,
        deliveryAvailable: formData.deliveryAvailable || undefined,

        // Offer details
        sellerType: (formData.sellerType || undefined) as any,
        sellerRating: formData.sellerRating ? parseFloat(formData.sellerRating) : undefined,
        withVideo: formData.withVideo || undefined,
        discountOffer: formData.discountOffer || undefined,
        nonSmoker: formData.nonSmoker || undefined,
        taxi: formData.taxi || undefined,
        vatReclaimable: formData.vatReclaimable || undefined,
        warranty: formData.warranty || undefined,
        damagedVehicles: formData.damagedVehicles || undefined,
        commercial: formData.commercial || undefined,
        approvedUsedProgramme: formData.approvedUsedProgramme || undefined
      };

      // Create car listing
      const carId = await bulgarianCarService.createCarListing(carData);

      // Upload images if any
      if (images.length > 0) {
        const imageUrls = await bulgarianCarService.uploadCarImages(carId, images);

        // Update car with image URLs
        await bulgarianCarService.updateCarListing(carId, {
          images: imageUrls,
          mainImage: imageUrls[0]
        }, carData.ownerId);
      }

      setSuccess(true);

      // Redirect to car details after 2 seconds
      setTimeout(() => {
        navigate(`/cars/${carId}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating car listing:', error);
      alert(t('sellCar.error'));
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.make || !formData.model || !formData.year || !formData.price) {
      alert(t('sellCar.validation.required'));
      return false;
    }

    if (parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
      alert(t('sellCar.validation.year'));
      return false;
    }

    if (parseInt(formData.price) <= 0) {
      alert(t('sellCar.validation.price'));
      return false;
    }

    return true;
  };

  if (success) {
    return (
      <SellCarContainer>
        <PageContainer>
          <SuccessMessage>
            <h3>{t('sellCar.success.title')}</h3>
            <p>{t('sellCar.success.message')}</p>
          </SuccessMessage>
        </PageContainer>
      </SellCarContainer>
    );
  }

  return (
    <SellCarContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>{t('sellCar.title')}</h1>
          <p>{t('sellCar.subtitle')}</p>
        </PageHeader>

        {/* Form */}
        <FormContainer>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <FormSection>
              <h3>{t('sellCar.basicInfo')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('sellCar.make')} *</label>
                  <select name="make" value={formData.make} onChange={handleInputChange} required>
                    <option value="">{t('sellCar.selectMake')}</option>
                    {CAR_MAKES.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.model')} *</label>
                  {modelsForMake.length > 0 ? (
                    <select name="model" value={formData.model} onChange={handleInputChange} required disabled={!formData.make}>
                      <option value="">{t('sellCar.selectModel','Select model')}</option>
                      {modelsForMake.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder={t('sellCar.modelPlaceholder')}
                      required
                    />
                  )}
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.year')} *</label>
                  <select name="year" value={formData.year} onChange={handleInputChange} required>
                    <option value="">{t('sellCar.selectYear')}</option>
                    {YEARS_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.mileage')}</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="150000"
                    min="0"
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.price')} (€) *</label>
                  <select name="price" value={formData.price} onChange={handleInputChange} required>
                    <option value="">{t('sellCar.selectPrice')}</option>
                    {PRICE_SUGGESTIONS.map((price) => (
                      <option key={price} value={price}>
                        €{price.toLocaleString()}
                      </option>
                    ))}
                    <option value="custom">{t('sellCar.customPrice')}</option>
                  </select>
                  {formData.price === 'custom' && (
                    <input
                      type="number"
                      name="customPrice"
                      placeholder={t('sellCar.enterCustomPrice')}
                      min="0"
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.fuelType')}</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectFuelType')}</option>
                    <option value="petrol">{t('sellCar.fuelTypes.petrol')}</option>
                    <option value="diesel">{t('sellCar.fuelTypes.diesel')}</option>
                    <option value="electric">{t('sellCar.fuelTypes.electric')}</option>
                    <option value="hybrid">{t('sellCar.fuelTypes.hybrid')}</option>
                    <option value="gas">{t('sellCar.fuelTypes.gas')}</option>
                    <option value="lpg">{t('sellCar.fuelTypes.lpg')}</option>
                    <option value="cng">{t('sellCar.fuelTypes.cng')}</option>
                    <option value="hydrogen">{t('sellCar.fuelTypes.hydrogen')}</option>
                    <option value="ethanol">{t('sellCar.fuelTypes.ethanol')}</option>
                    <option value="biodiesel">{t('sellCar.fuelTypes.biodiesel')}</option>
                    <option value="other">{t('sellCar.fuelTypes.other')}</option>
                  </select>
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Technical Details */}
            <FormSection>
              <h3>{t('sellCar.technicalDetails')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('sellCar.transmission')}</label>
                  <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectTransmission')}</option>
                    <option value="manual">{t('sellCar.transmissions.manual')}</option>
                    <option value="automatic">{t('sellCar.transmissions.automatic')}</option>
                    <option value="semi-automatic">{t('sellCar.transmissions.semiAutomatic')}</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.engineSize')}</label>
                  <input
                    type="number"
                    name="engineSize"
                    value={formData.engineSize}
                    onChange={handleInputChange}
                    placeholder="2000"
                    min="0"
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.power')}</label>
                  <input
                    type="number"
                    name="power"
                    value={formData.power}
                    onChange={handleInputChange}
                    placeholder="150"
                    min="0"
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.condition')}</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectCondition')}</option>
                    <option value="new">{t('sellCar.conditions.new')}</option>
                    <option value="used">{t('sellCar.conditions.used')}</option>
                    <option value="damaged">{t('sellCar.conditions.damaged')}</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.color')}</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder={t('sellCar.colorPlaceholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('search.bodyStyle','Vehicle type')}</label>
                  <select name="bodyStyle" value={formData.bodyStyle} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    {BODY_STYLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('search.seats','Number of Seats')}</label>
                  <select name="seats" value={formData.seats} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectSeats','Select')}</option>
                    {[2,3,4,5,6,7,8,9].map(v => (
                      <option key={v} value={String(v)}>{v}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('search.doors','Number of doors')}</label>
                  <select name="doors" value={formData.doors} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectDoors','Select')}</option>
                    {[2,3,4,5].map(v => (
                      <option key={v} value={String(v)}>{v}</option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>{t('search.paymentType','Payment type')}</label>
                  <select name="paymentType" value={formData.paymentType} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    <option value="buy">{t('search.payment.buy','Buy')}</option>
                    <option value="leasing">{t('search.payment.leasing','Leasing')}</option>
                  </select>
                </FormGroup>

                <CheckboxGroup>
                  <input type="checkbox" id="slidingDoor" name="slidingDoor" checked={formData.slidingDoor} onChange={handleCheckboxChange} />
                  <label htmlFor="slidingDoor">{t('search.slidingDoor','Sliding door')}</label>
                </CheckboxGroup>
              </FormGrid>
            </FormSection>

            {/* Technical Extras */}
            <FormSection>
              <h3>{t('sellCar.technicalExtras','Technical details (extended)')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('search.driveType','Drive type')}</label>
                  <select name="driveType" value={formData.driveType} onChange={handleInputChange}>
                    {DRIVE_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.fuelConsumptionMax','Fuel consumption (combined)')}</label>
                  <select name="fuelConsumptionCombined" value={formData.fuelConsumptionCombined} onChange={handleInputChange}>
                    <option value="">{t('sellCar.selectFuelConsumption','Select')}</option>
                    {[5,6,7,8,9,10,12,15].map(v => (
                      <option key={v} value={String(v)}>{`≤ ${v} L/100km`}</option>
                    ))}
                    <option value="custom">{t('sellCar.customValue','Enter custom value')}</option>
                  </select>
                  {formData.fuelConsumptionCombined === 'custom' && (
                    <input
                      type="number"
                      name="fuelConsumptionCombinedCustom"
                      placeholder={t('sellCar.enterCustomFuelConsumption','Exact L/100km')}
                      min="0"
                      step="0.1"
                      onChange={(e) => setFormData(prev => ({ ...prev, fuelConsumptionCombined: e.target.value }))}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </FormGroup>
                <FormGroup>
                  <label>{t('search.emissionSticker','Emission Sticker')}</label>
                  <select name="emissionSticker" value={formData.emissionSticker} onChange={handleInputChange}>
                    {EMISSION_STICKER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.emissionClass','Emission Class')}</label>
                  <select name="emissionClass" value={formData.emissionClass} onChange={handleInputChange}>
                    {EMISSION_CLASS_OPTIONS.map(v => <option key={v} value={v}>{v || t('search.any')}</option>)}
                  </select>
                </FormGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="particulateFilter" name="particulateFilter" checked={formData.particulateFilter} onChange={handleCheckboxChange} />
                  <label htmlFor="particulateFilter">{t('search.particulateFilter','Particulate filter')}</label>
                </CheckboxGroup>
                <FormGroup>
                  <label>{t('search.fuelTank','Fuel tank volume (l)')}</label>
                  <input type="number" name="fuelTankVolumeL" value={formData.fuelTankVolumeL} onChange={handleInputChange} min={0} />
                </FormGroup>
                <FormGroup>
                  <label>{t('search.weight','Weight (kg)')}</label>
                  <input type="number" name="weightKg" value={formData.weightKg} onChange={handleInputChange} min={0} />
                </FormGroup>
                <FormGroup>
                  <label>{t('search.cylinders','Cylinders')}</label>
                  <input type="number" name="cylinders" value={formData.cylinders} onChange={handleInputChange} min={0} />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Exterior */}
            <FormSection>
              <h3>{t('sellCar.exterior','Exterior')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('search.exteriorColor','Exterior Colour')}</label>
                  <select name="exteriorColorCategory" value={formData.exteriorColorCategory} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    {EXTERIOR_COLOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="metallic" name="metallic" checked={formData.metallic} onChange={handleCheckboxChange} />
                  <label htmlFor="metallic">{t('search.metallic','Metallic')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="matte" name="matte" checked={formData.matte} onChange={handleCheckboxChange} />
                  <label htmlFor="matte">{t('search.matte','Matte')}</label>
                </CheckboxGroup>
                <FormGroup>
                  <label>{t('search.towbar','Trailer coupling')}</label>
                  <select name="towbar" value={formData.towbar} onChange={handleInputChange}>
                    {TOWBAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FormGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="trailerAssist" name="trailerAssist" checked={formData.trailerAssist} onChange={handleCheckboxChange} />
                  <label htmlFor="trailerAssist">{t('search.trailerAssist','Trailer assist')}</label>
                </CheckboxGroup>
                <FormGroup>
                  <label>{t('search.trailerLoadBraked','Trailer load braked (kg)')}</label>
                  <input type="number" name="brakedTrailerLoadKg" value={formData.brakedTrailerLoadKg} onChange={handleInputChange} min={0} />
                </FormGroup>
                <FormGroup>
                  <label>{t('search.trailerLoadUnbraked','Trailer load unbraked (kg)')}</label>
                  <input type="number" name="unbrakedTrailerLoadKg" value={formData.unbrakedTrailerLoadKg} onChange={handleInputChange} min={0} />
                </FormGroup>
                <FormGroup>
                  <label>{t('search.noseWeight','Nose Weight (kg)')}</label>
                  <input type="number" name="noseWeightKg" value={formData.noseWeightKg} onChange={handleInputChange} min={0} />
                </FormGroup>
                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <label>{t('search.parkingSensors','Parking sensors')}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {PARKING_ASSIST_OPTIONS.map(opt => (
                      <CheckboxGroup key={opt}>
                        <input
                          type="checkbox"
                          id={`pa-${opt}`}
                          checked={formData.parkingAssist.includes(opt)}
                          onChange={(e) => handleArrayCheckbox('parkingAssist', opt, e.target.checked)}
                        />
                        <label htmlFor={`pa-${opt}`}>{opt}</label>
                      </CheckboxGroup>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.cruiseControl','Cruise control')}</label>
                  <select name="cruiseControl" value={formData.cruiseControl} onChange={handleInputChange}>
                    {CRUISE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Interior */}
            <FormSection>
              <h3>{t('sellCar.interior','Interior')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('search.interiorColor','Interior Colour')}</label>
                  <select name="interiorColor" value={formData.interiorColor} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    {['Beige','Black','Blue','Brown','Grey','Red','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.interiorMaterial','Interior material')}</label>
                  <select name="interiorMaterial" value={formData.interiorMaterial} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    {INTERIOR_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.airbags','Airbags')}</label>
                  <select name="airbags" value={formData.airbags} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    {AIRBAGS_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.climateControl','Air conditioning')}</label>
                  <select name="climateControl" value={formData.climateControl} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    {CLIMATE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Offer Details */}
            <FormSection>
              <h3>{t('sellCar.offerDetails','Offer details')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('search.seller','Seller')}</label>
                  <select name="sellerType" value={formData.sellerType} onChange={handleInputChange}>
                    <option value="">{t('search.any')}</option>
                    <option value="dealer">{t('search.seller.dealer')}</option>
                    <option value="private">{t('search.seller.private')}</option>
                    <option value="company">{t('search.seller.company')}</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{t('search.sellerRatingMin','Dealer rating')}</label>
                  <input type="number" name="sellerRating" value={formData.sellerRating} onChange={handleInputChange} min={0} max={5} step={0.5} />
                </FormGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="withVideo" name="withVideo" checked={formData.withVideo} onChange={handleCheckboxChange} />
                  <label htmlFor="withVideo">{t('search.withVideo','With video')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="discountOffer" name="discountOffer" checked={formData.discountOffer} onChange={handleCheckboxChange} />
                  <label htmlFor="discountOffer">{t('search.discountOffers','Discount offers')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="nonSmoker" name="nonSmoker" checked={formData.nonSmoker} onChange={handleCheckboxChange} />
                  <label htmlFor="nonSmoker">{t('search.nonSmoker','Non-smoker vehicle')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="taxi" name="taxi" checked={formData.taxi} onChange={handleCheckboxChange} />
                  <label htmlFor="taxi">{t('search.taxi','Taxi')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="vatReclaimable" name="vatReclaimable" checked={formData.vatReclaimable} onChange={handleCheckboxChange} />
                  <label htmlFor="vatReclaimable">{t('search.vatReclaimable','VAT reclaimable')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="warranty" name="warranty" checked={formData.warranty} onChange={handleCheckboxChange} />
                  <label htmlFor="warranty">{t('search.warranty','Warranty')}</label>
                </CheckboxGroup>
                <FormGroup>
                  <label>{t('search.damagedVehicles','Damaged Vehicles')}</label>
                  <select name="damagedVehicles" value={formData.damagedVehicles} onChange={handleInputChange}>
                    {DAMAGED_VEHICLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FormGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="commercial" name="commercial" checked={formData.commercial} onChange={handleCheckboxChange} />
                  <label htmlFor="commercial">{t('search.commercial','Commercial')}</label>
                </CheckboxGroup>
                <FormGroup>
                  <label>{t('search.approvedUsedProgramme','Approved Used Programme')}</label>
                  <select name="approvedUsedProgramme" value={formData.approvedUsedProgramme} onChange={handleInputChange}>
                    {APPROVED_PROGRAMME_OPTIONS.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
                  </select>
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Ownership & Service */}
            <FormSection>
              <h3>{t('sellCar.serviceAndOwnership','Service & Ownership')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('sellCar.numberOfOwners','Number of owners')}</label>
                  <input type="number" name="numberOfOwners" value={formData.numberOfOwners} onChange={handleInputChange} min={0} />
                </FormGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="fullServiceHistory" name="fullServiceHistory" checked={formData.fullServiceHistory} onChange={handleCheckboxChange} />
                  <label htmlFor="fullServiceHistory">{t('sellCar.fullServiceHistory','Full service history')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="roadworthy" name="roadworthy" checked={formData.roadworthy} onChange={handleCheckboxChange} />
                  <label htmlFor="roadworthy">{t('sellCar.roadworthy','Roadworthy')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="newService" name="newService" checked={formData.newService} onChange={handleCheckboxChange} />
                  <label htmlFor="newService">{t('sellCar.newService','New service')}</label>
                </CheckboxGroup>
                <CheckboxGroup>
                  <input type="checkbox" id="deliveryAvailable" name="deliveryAvailable" checked={formData.deliveryAvailable} onChange={handleCheckboxChange} />
                  <label htmlFor="deliveryAvailable">{t('sellCar.deliveryAvailable','Delivery available')}</label>
                </CheckboxGroup>
              </FormGrid>
            </FormSection>
            {/* Location */}
            <FormSection>
              <h3>{t('sellCar.location')}</h3>
              <FormGrid>
                <FormGroup>
                  <label>{t('sellCar.city')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('sellCar.cityPlaceholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.region')}</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder={t('sellCar.regionPlaceholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.postalCode')}</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="1000"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Description */}
            <FormSection>
              <h3>{t('sellCar.description')}</h3>
              <FormGroup>
                <label>{t('sellCar.title')}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('sellCar.titlePlaceholder')}
                />
              </FormGroup>

              <FormGroup>
                <label>{t('sellCar.description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('sellCar.descriptionPlaceholder')}
                  rows={4}
                />
              </FormGroup>

              {/* Features */}
              <FormGroup>
                <label>{t('sellCar.features')}</label>
                {formData.features.map((feature, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={t('sellCar.featurePlaceholder')}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}
                >
                  {t('sellCar.addFeature')}
                </button>
              </FormGroup>
            </FormSection>

            {/* Images */}
            <FormSection>
              <h3>{t('sellCar.images')}</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <ImageUpload>
                  <span className="upload-icon">📷</span>
                  <div className="upload-text">{t('sellCar.uploadImages')}</div>
                  <div className="upload-hint">{t('sellCar.uploadHint')}</div>
                </ImageUpload>
              </label>

              {images.length > 0 && (
                <ImagePreview>
                  {images.map((image, index) => (
                    <ImageItem key={index}>
                      <img src={URL.createObjectURL(image)} alt={`Upload ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </ImageItem>
                  ))}
                </ImagePreview>
              )}
            </FormSection>

            {/* Bulgarian Specific */}
            <FormSection>
              <h3>{t('sellCar.bulgarianSpecific')}</h3>
              <CheckboxGroup>
                <input
                  type="checkbox"
                  name="hasBulgarianRegistration"
                  checked={formData.hasBulgarianRegistration}
                  onChange={handleCheckboxChange}
                  id="bulgarian-reg"
                />
                <label htmlFor="bulgarian-reg">{t('sellCar.hasBulgarianRegistration')}</label>
              </CheckboxGroup>

              <FormGrid>
                <FormGroup>
                  <label>{t('sellCar.vinNumber')}</label>
                  <input
                    type="text"
                    name="vinNumber"
                    value={formData.vinNumber}
                    onChange={handleInputChange}
                    placeholder={t('sellCar.vinPlaceholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.firstRegistrationDate')}</label>
                  <input
                    type="date"
                    name="firstRegistrationDate"
                    value={formData.firstRegistrationDate}
                    onChange={handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <label>{t('sellCar.inspectionValidUntil')}</label>
                  <input
                    type="date"
                    name="inspectionValidUntil"
                    value={formData.inspectionValidUntil}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Form Actions */}
            <FormActions>
              <ActionButton type="button" variant="secondary" onClick={() => navigate('/cars')}>
                {t('common.cancel')}
              </ActionButton>
              <ActionButton type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('sellCar.submit')}
              </ActionButton>
            </FormActions>
          </form>
        </FormContainer>
      </PageContainer>
    </SellCarContainer>
  );
};

export default SellCarPage;