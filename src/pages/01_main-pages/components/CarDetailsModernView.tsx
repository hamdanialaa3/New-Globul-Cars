import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import StaticMapEmbed from '../../../components/StaticMapEmbed';
import { CarListing } from '../../../types/CarListing';
import CarSuggestionsList from './CarSuggestionsList';
import CarSuggestionsList from './CarSuggestionsList';

interface CarDetailsModernViewProps {
  car: CarListing;
  language: 'bg' | 'en';
  onBack: () => void;
  onEdit?: () => void;
  isOwner: boolean;
  onContact: (method: string) => void;
}

const translations = {
  bg: {
    back: 'Назад към резултатите',
    edit: 'Редактирай обявата',
    priceLabel: 'Обява за продажба',
    monthlyFrom: 'месечна вноска от',
    calculateFinancing: 'Изчисли финансиране',
    overview: 'Описание на автомобила',
    battery: 'Информация за батерията',
    batteryRange: 'Пробег (WLTP)',
    warranty: 'Гаранция',
    notSpecified: 'Няма информация',
    technical: 'Технически данни',
    mileage: 'Пробег',
    registration: 'Първа регистрация',
    power: 'Мощност',
    drive: 'Задвижване',
    transmission: 'Скоростна кутия',
    consumption: 'Разход (комб.)',
    co2: 'CO₂ емисии',
    seats: 'Брой места',
    doors: 'Врати',
    color: 'Цвят',
    features: 'Оборудване',
    sellerAbout: 'За дилъра',
    ratingHighlights: 'Клиентите оценяват',
    mapHeading: 'Локация на автомобила',
    additionalServices: 'Допълнителни услуги',
    evaluate: 'Оцени автомобила си',
    evaluateCta: 'Провери стойността',
    insurance: 'Застраховка автомобил',
    insuranceCta: 'Сравни оферти',
    contact: 'Свържи се с продавача',
    phone: 'Телефон',
    email: 'Имейл',
    whatsapp: 'WhatsApp',
    descriptionFallback: 'Продавачът не е добавил допълнително описание.',
    rangeUnit: 'км',
    km: 'км',
    hp: 'кс',
    kw: 'кВт',
    reportLabel: 'Подай сигнал за обявата',
    monthsUnit: 'месеца',
    included: 'Включена',
    noImage: 'Няма налична снимка',
  },
  en: {
    back: 'Back to results',
    edit: 'Edit listing',
    priceLabel: 'Listing price',
    monthlyFrom: 'monthly installment from',
    calculateFinancing: 'Calculate financing',
    overview: 'Vehicle description',
    battery: 'Battery information',
    batteryRange: 'Range (WLTP)',
    warranty: 'Warranty',
    notSpecified: 'Not specified',
    technical: 'Technical data',
    mileage: 'Mileage',
    registration: 'First registration',
    power: 'Power',
    drive: 'Drive type',
    transmission: 'Transmission',
    consumption: 'Energy consumption (comb.)',
    co2: 'CO₂ emissions',
    seats: 'Seats',
    doors: 'Doors',
    color: 'Colour',
    features: 'Features & equipment',
    sellerAbout: 'About this dealer',
    ratingHighlights: 'Customers highlight',
    mapHeading: 'Vehicle location',
    additionalServices: 'Additional services',
    evaluate: 'How much is your car worth?',
    evaluateCta: 'Evaluate now',
    insurance: 'Vehicle insurance cost',
    insuranceCta: 'Compare offers',
    contact: 'Contact seller',
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    descriptionFallback: 'The seller has not provided additional comments.',
    rangeUnit: 'km',
    km: 'km',
    hp: 'hp',
    kw: 'kW',
    reportLabel: 'Report this listing',
    monthsUnit: 'months',
    included: 'Included',
    noImage: 'No image available',
  },
} as const;

const normalizeValue = (value: string) =>
  value
    ? value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';

const TRANSMISSION_LABELS: Record<string, { bg: string; en: string }> = {
  manual: { bg: 'Ръчна', en: 'Manual' },
  automatic: { bg: 'Автоматична', en: 'Automatic' },
  semiautomatic: { bg: 'Полуавтоматична', en: 'Semi-automatic' },
  dualclutch: { bg: 'Двойно съединител', en: 'Dual-clutch' },
  cvt: { bg: 'CVT', en: 'CVT' },
};

const DRIVE_LABELS: Record<string, { bg: string; en: string }> = {
  frontwheeldrive: { bg: 'Предно задвижване', en: 'Front-wheel drive' },
  rearwheeldrive: { bg: 'Задно задвижване', en: 'Rear-wheel drive' },
  allwheeldrive: { bg: '4x4 (AWD)', en: 'All-wheel drive' },
  fourwheeldrive: { bg: '4x4 (4WD)', en: 'Four-wheel drive' },
  awd: { bg: '4x4 (AWD)', en: 'All-wheel drive' },
  fwd: { bg: 'Предно задвижване', en: 'Front-wheel drive' },
  rwd: { bg: 'Задно задвижване', en: 'Rear-wheel drive' },
};

const FUEL_LABELS: Record<string, { bg: string; en: string }> = {
  electric: { bg: 'Електрическа', en: 'Electric' },
  petrol: { bg: 'Бензин', en: 'Petrol' },
  diesel: { bg: 'Дизел', en: 'Diesel' },
  hybrid: { bg: 'Хибрид', en: 'Hybrid' },
  pluginhybrid: { bg: 'Plug-in хибрид', en: 'Plug-in hybrid' },
  lpg: { bg: 'Газ (LPG)', en: 'LPG' },
  cng: { bg: 'Газ (CNG)', en: 'CNG' },
};

const VEHICLE_TYPE_LABELS: Record<string, { bg: string; en: string }> = {
  smallcar: { bg: 'Компактен клас', en: 'Small car' },
  hatchback: { bg: 'Хечбек', en: 'Hatchback' },
  sedan: { bg: 'Седан', en: 'Sedan' },
  suv: { bg: 'SUV', en: 'SUV' },
  coupe: { bg: 'Купе', en: 'Coupé' },
  convertible: { bg: 'Кабриолет', en: 'Convertible' },
};

const FEATURE_CONFIG: Array<{
  keys: string[];
  label: { bg: string; en: string };
}> = [
  { keys: ['abs'], label: { bg: 'ABS', en: 'ABS' } },
  { keys: ['esp'], label: { bg: 'ESP', en: 'ESP' } },
  { keys: ['airbags'], label: { bg: 'Въздушни възглавници', en: 'Airbags' } },
  { keys: ['parkingsensors', 'parkingassist', 'parkassist'], label: { bg: 'Парктроник', en: 'Parking sensors' } },
  { keys: ['blindspotmonitor'], label: { bg: 'Система за мъртва точка', en: 'Blind spot monitor' } },
  { keys: ['collisionwarning'], label: { bg: 'Предупреждение за сблъсък', en: 'Collision warning' } },
  { keys: ['airconditioning', 'ac'], label: { bg: 'Климатик', en: 'Air conditioning' } },
  { keys: ['climatecontrol'], label: { bg: 'Климатроник', en: 'Climate control' } },
  { keys: ['heatedseats'], label: { bg: 'Подгряване на седалките', en: 'Heated seats' } },
  { keys: ['applecarplay', 'carplay'], label: { bg: 'Apple CarPlay', en: 'Apple CarPlay' } },
  { keys: ['androidauto'], label: { bg: 'Android Auto', en: 'Android Auto' } },
  { keys: ['xenonlights', 'xenon'], label: { bg: 'Ксенонови фарове', en: 'Xenon lights' } },
  { keys: ['ledlights'], label: { bg: 'LED светлини', en: 'LED lights' } },
  { keys: ['towhitch'], label: { bg: 'Теглич', en: 'Tow hitch' } },
  { keys: ['sportpackage'], label: { bg: 'Спортен пакет', en: 'Sport package' } },
  { keys: ['startstopsystem', 'startstop'], label: { bg: 'Старт/Стоп система', en: 'Start/stop system' } },
  { keys: ['keylessentry', 'keyless'], label: { bg: 'Безключов достъп', en: 'Keyless entry' } },
  { keys: ['daytimerunninglights', 'daylight'], label: { bg: 'Дневни светлини', en: 'Daytime running lights' } },
  { keys: ['voicecontrol'], label: { bg: 'Гласово управление', en: 'Voice control' } },
  { keys: ['navigation'], label: { bg: 'Навигация', en: 'Navigation' } },
  { keys: ['bluetooth'], label: { bg: 'Bluetooth', en: 'Bluetooth' } },
  { keys: ['emergencycallsystem'], label: { bg: 'Emergency Call', en: 'Emergency call system' } },
];

const PageWrapper = styled.div`
  background: #f5f5f8;
  min-height: 100vh;
  padding: 1.5rem 0 2.5rem;
  /* ✅ FIX: Prevent layout shifts */
  width: 100%;
  overflow-x: hidden;
`;

const Inner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1.5rem;
  /* ✅ FIX: Prevent container from changing width */
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 1rem;
    max-width: 100%;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  border: none;
  background: none;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    color: #111827;
  }
`;

const EditButton = styled.button`
  border: none;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2);

  &:hover {
    transform: translateY(-1px);
  }
`;

const Layout = styled.div`
  display: grid !important;
  grid-template-columns: 2fr 1fr !important;
  gap: 1.75rem;
  /* ✅ FIX: Prevent layout shifts */
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  /* ✅ FIX: Force desktop layout by default */
  position: relative;

  /* ✅ FIX: Only change to single column on mobile (≤768px) */
  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
    gap: 1.5rem;
  }

  /* ✅ FIX: Force 2-column layout on tablets and desktop (≥769px) - CRITICAL */
  @media (min-width: 769px) {
    grid-template-columns: 2fr 1fr !important;
  }

  /* ✅ FIX: Ensure desktop layout for all screens wider than 768px */
  @media (min-width: 769px) and (max-width: 9999px) {
    grid-template-columns: 2fr 1fr !important;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  padding: 1.75rem;
`;

const Gallery = styled(Card)`
  padding: 1.5rem;
  /* ✅ FIX: Prevent layout shifts */
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  flex: 1 1 300px;
`;

const VehicleTitle = styled.h1`
  font-size: 1.9rem;
  color: #111827;
  margin: 0 0 0.5rem;
`;

const VehicleMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
`;

const MainImage = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #101623;
  /* ✅ FIX: Fixed height for desktop to prevent layout shifts */
  height: 500px;
  max-height: 500px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* ✅ FIX: Prevent container from resizing */
  box-sizing: border-box;
  /* ✅ FIX: Force GPU acceleration and prevent reflow */
  will-change: auto;
  /* ✅ FIX: Prevent layout shifts during image load */
  contain: layout style paint;

  @media (max-width: 1024px) {
    height: 400px;
    max-height: 400px;
    min-height: 400px;
  }

  @media (max-width: 768px) {
    height: 280px;
    max-height: 280px;
    min-height: 280px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    flex-shrink: 0;
    /* ✅ FIX: Prevent reflow during image load */
    will-change: auto;
    min-width: 0;
    min-height: 0;
  }
`;

const ThumbnailStrip = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  overflow-x: auto;
`;

const ThumbnailButton = styled.button<{ $active: boolean }>`
  border: 2px solid ${(props) => (props.$active ? '#fb923c' : 'transparent')};
  border-radius: 12px;
  overflow: hidden;
  width: 88px;
  height: 66px;
  padding: 0;
  background: #f3f4f6;
  cursor: pointer;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Section = styled(Card)`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #111827;
`;

const Description = styled.p`
  color: #4b5563;
  line-height: 1.7;
  white-space: pre-line;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const SpecCell = styled.div`
  background: #f3f4f6;
  border-radius: 12px;
  padding: 0.85rem;
`;

const SpecLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  margin-bottom: 0.35rem;
`;

const SpecValue = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 0.98rem;
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem 1.25rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #4b5563;
  font-weight: 500;

  span {
    font-size: 0.95rem;
  }
`;

const CheckIcon = styled.span`
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
`;

const PriceCard = styled(Card)`
  position: sticky;
  top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LegacyLogoContainer = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  margin: -1rem auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: radial-gradient(circle at top, rgba(255, 121, 0, 0.25), transparent 68%);
`;

const LegacyLogoGlow = styled.div`
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 121, 0, 0.6), transparent 70%);
  filter: blur(12px);
  opacity: 0.8;
`;

const LegacyGlowRing = styled.div`
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
`;

const LegacyLogoImage = styled.img`
  position: relative;
  width: 120px;
  height: 120px;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 8px 18px rgba(17, 24, 39, 0.35));
`;

const LegacyBrandName = styled.div`
  text-align: center;
  font-weight: 700;
  color: #111827;
  font-size: 1.1rem;
  margin-top: 0.75rem;
`;

const PriceValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
`;

const PriceLabel = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
`;

const FinancingBadge = styled.div`
  background: #fef2f2;
  border-radius: 12px;
  padding: 0.85rem;
  border: 1px solid #fecaca;
`;

const FinancingLabel = styled.div`
  color: #b91c1c;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const FinancingValue = styled.div`
  color: #b91c1c;
  font-weight: 700;
`;

const FinancingLink = styled.button`
  background: none;
  border: none;
  color: #f97316;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const ContactCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ContactButton = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.$disabled ? '#e5e7eb' : '#d1d5db')};
  background: ${(props) => (props.$disabled ? '#f9fafb' : '#ffffff')};
  color: ${(props) => (props.$disabled ? '#9ca3af' : '#111827')};
  font-weight: 600;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: transform 0.15s ease;

  &:hover {
    transform: ${(props) => (props.$disabled ? 'none' : 'translateY(-1px)')};
  }
`;

const ServicesCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ServiceRow = styled.div`
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.25rem;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ServiceTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: #111827;
`;

const ServiceDescription = styled.p`
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
`;

const ServiceButton = styled.button`
  border: none;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  padding: 0.65rem 1.1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

const MapCard = styled(Section)`
  padding: 0;
  overflow: hidden;
`;

const MapHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const MapBody = styled.div`
  height: 280px;
  width: 100%;
`;

const ReportLink = styled.button`
  margin-top: 1rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    color: #111827;
  }
`;

const RatingHighlights = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #4b5563;
`;

const CarDetailsModernView: React.FC<CarDetailsModernViewProps> = ({
  car,
  language,
  onBack,
  onEdit,
  isOwner,
  onContact,
}) => {
  const text = translations[language] ?? translations.en;
  const [selectedImage, setSelectedImage] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);

  // ✅ FIX: Resolve images immediately to prevent layout shifts
  useEffect(() => {
    const cleanUp: string[] = [];
    const urls = (car.images || []).map((image) => {
      if (typeof image === 'string') {
        return image;
      }
      const url = URL.createObjectURL(image);
      cleanUp.push(url);
      return url;
    });
    // ✅ FIX: Set immediately, don't wait
    setResolvedImages(urls);
    return () => {
      cleanUp.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [car.images]);

  useEffect(() => {
    if (selectedImage >= resolvedImages.length) {
      setSelectedImage(0);
    }
  }, [resolvedImages, selectedImage]);

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', { style: 'currency', currency: car.currency || 'EUR' }),
    [car.currency, language]
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US'),
    [language]
  );

  const hasPrice = typeof car.price === 'number' && !Number.isNaN(car.price);

  const estimatedMonthly = useMemo(() => {
    if (!hasPrice) return null;
    const months = 60;
    return priceFormatter.format(car.price / months);
  }, [hasPrice, car.price, priceFormatter]);

  const carAny = car as Record<string, any>;

  const specs = useMemo(
    () =>
      [
        { label: text.mileage, value: car.mileage ? `${numberFormatter.format(car.mileage)} ${text.km}` : null },
        { label: text.registration, value: carAny.firstRegistration || car.year },
        { label: text.power, value: car.power ? `${car.power} ${text.kw}` : null },
        { label: text.drive, value: car.driveType },
        { label: text.transmission, value: car.transmission },
        { label: text.consumption, value: carAny.energyConsumption ? `${carAny.energyConsumption} kWh/100${text.km}` : null },
        { label: text.co2, value: typeof carAny.co2Emissions === 'number' ? `${carAny.co2Emissions} g/km` : null },
        { label: text.seats, value: car.seats || carAny.numberOfSeats },
        { label: text.doors, value: car.doors },
        { label: text.color, value: car.color },
      ].filter((item) => item.value),
    [car, carAny, numberFormatter, text]
  );

  const featureGroups = useMemo(() => {
    const booleans: { key: string; label: string }[] = [
      { key: 'abs', label: 'ABS' },
      { key: 'androidAuto', label: 'Android Auto' },
      { key: 'appleCarPlay', label: 'Apple CarPlay' },
      { key: 'bluetooth', label: 'Bluetooth' },
      { key: 'navigation', label: language === 'bg' ? 'Навигация' : 'Navigation' },
      { key: 'heatedSeats', label: language === 'bg' ? 'Подгряване на седалките' : 'Heated seats' },
      { key: 'parkAssist', label: language === 'bg' ? 'Парктроник' : 'Park assist' },
      { key: 'ledLights', label: language === 'bg' ? 'LED светлини' : 'LED lights' },
      { key: 'emergencyCallSystem', label: language === 'bg' ? 'Emergency call' : 'Emergency call' },
      { key: 'voiceControl', label: language === 'bg' ? 'Гласово управление' : 'Voice control' },
    ];

    const explicitFeatures = (car.features || [])
      .concat(car.safetyEquipment || [])
      .concat(car.comfortEquipment || [])
      .concat(car.infotainmentEquipment || [])
      .concat(car.exteriorEquipment || [])
      .concat(car.interiorEquipment || [])
      .concat(car.extras || []);

    const booleanFeatures = booleans
      .filter(({ key }) => Boolean(carAny[key]))
      .map(({ label }) => label);

    const merged = [...new Set([...booleanFeatures, ...explicitFeatures])];

    return merged.length > 0 ? merged : null;
  }, [car, carAny, language]);

  const description = car.description?.trim() || text.descriptionFallback;
  const batteryRange = carAny.electricRange ? `${carAny.electricRange} ${text.rangeUnit}` : null;
  const batteryWarranty = carAny.warrantyMonths
    ? `${carAny.warrantyMonths} ${text.monthsUnit}`
    : carAny.batteryWarranty || null;
  const formattedPrice = hasPrice ? priceFormatter.format(car.price) : text.notSpecified;

  return (
    <PageWrapper>
      <Inner>
        <TopBar>
          <BackButton onClick={onBack}>
            ← {text.back}
          </BackButton>
          {isOwner && onEdit ? (
            <EditButton onClick={onEdit}>
              ✎ {text.edit}
            </EditButton>
          ) : null}
        </TopBar>

        <Layout>
          <div>
            <Gallery>
              <TitleRow>
                <TitleBlock>
                  <VehicleTitle>
                    {car.make} {car.model} {car.year ? `· ${car.year}` : ''}
                  </VehicleTitle>
                  <VehicleMeta>
                    {car.vehicleType && <span>{car.vehicleType}</span>}
                    {car.fuelType && <span>{car.fuelType}</span>}
                    {car.power && <span>{car.power} {text.kw} ({Math.round(car.power * 1.341)} {text.hp})</span>}
                  </VehicleMeta>
                </TitleBlock>
              </TitleRow>

              <MainImage>
                {resolvedImages.length > 0 ? (
                  <img 
                    src={resolvedImages[selectedImage]} 
                    alt={`${car.make} ${car.model}`} 
                    loading={selectedImage === 0 ? "eager" : "lazy"}
                    decoding="sync"
                    onLoad={(e) => {
                      // ✅ FIX: Ensure image maintains size
                      const img = e.target as HTMLImageElement;
                      img.style.width = '100%';
                      img.style.height = '100%';
                      img.style.objectFit = 'cover';
                    }}
                  />
                ) : (
                  <div style={{ color: '#9ca3af', fontWeight: 600, fontSize: '1rem' }}>{text.noImage}</div>
                )}
              </MainImage>

              {resolvedImages.length > 1 && (
                <ThumbnailStrip>
                  {resolvedImages.map((src, index) => (
                    <ThumbnailButton
                      key={src + index}
                      $active={index === selectedImage}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <img src={src} alt={`${car.make} ${car.model} thumbnail ${index + 1}`} loading="lazy" />
                    </ThumbnailButton>
                  ))}
                </ThumbnailStrip>
              )}
            </Gallery>

            <Section>
              <SectionTitle>{text.overview}</SectionTitle>
              <Description>{description}</Description>
            </Section>

            <Section>
              <SectionTitle>{text.battery}</SectionTitle>
              <SpecsGrid>
                <SpecCell>
                  <SpecLabel>{text.batteryRange}</SpecLabel>
                  <SpecValue>{batteryRange || text.notSpecified}</SpecValue>
                </SpecCell>
                <SpecCell>
                  <SpecLabel>{text.warranty}</SpecLabel>
                  <SpecValue>{batteryWarranty || (car.warranty ? 'Included' : text.notSpecified)}</SpecValue>
                </SpecCell>
              </SpecsGrid>
            </Section>

            <Section>
              <SectionTitle>{text.technical}</SectionTitle>
              <SpecsGrid>
                {specs.map((spec) => (
                  <SpecCell key={spec.label}>
                    <SpecLabel>{spec.label}</SpecLabel>
                    <SpecValue>{spec.value}</SpecValue>
                  </SpecCell>
                ))}
              </SpecsGrid>
            </Section>

            {featureGroups && (
              <Section>
                <SectionTitle>{text.features}</SectionTitle>
                <FeaturesList>
                  {featureGroups.map((feature) => (
                    <FeatureItem key={feature}>
                      <CheckIcon>✓</CheckIcon>
                      <span>{feature}</span>
                    </FeatureItem>
                  ))}
                </FeaturesList>
              </Section>
            )}

            <MapCard>
              <MapHeader>
                <SectionTitle style={{ marginBottom: '0.25rem' }}>{text.mapHeading}</SectionTitle>
                <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
                  {car.locationData?.cityName}, {car.region}
                </div>
              </MapHeader>
              <MapBody>
                <StaticMapEmbed
                  location={{
                    city: car.locationData?.cityName,
                    region: car.region,
                    coordinates: car.coordinates,
                  }}
                />
              </MapBody>
            </MapCard>

            {/* ✅ NEW: Car Suggestions List (like PDF) */}
            {car && (car.id || (car as any).carId) && (
              <CarSuggestionsList
                currentCar={car}
                language={language}
                limit={6}
              />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PriceCard>
              {car.make && (
                <>
                  <LegacyLogoContainer>
                    <LegacyLogoGlow />
                    <LegacyGlowRing />
                    <LegacyLogoImage
                      src={`/assets/images/professional_car_logos/${car.make}.png`}
                      alt={car.make}
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        target.src = '/assets/images/professional_car_logos/mein_logo_rest.png';
                      }}
                    />
                  </LegacyLogoContainer>
                  <LegacyBrandName>{car.make}</LegacyBrandName>
                </>
              )}
              <div>
                <PriceLabel>{text.priceLabel}</PriceLabel>
                <PriceValue>{formattedPrice}</PriceValue>
              </div>
              {estimatedMonthly && (
                <FinancingBadge>
                  <FinancingLabel>{text.monthlyFrom.toUpperCase()}</FinancingLabel>
                  <FinancingValue>{estimatedMonthly}</FinancingValue>
                  <FinancingLink onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    {text.calculateFinancing} →
                  </FinancingLink>
                </FinancingBadge>
              )}

              <ContactCard>
                <div style={{ fontWeight: 700, color: '#111827' }}>{text.contact}</div>
                {[
                  { key: 'phone', label: text.phone, value: car.sellerPhone },
                  { key: 'email', label: text.email, value: car.sellerEmail },
                  { key: 'whatsapp', label: text.whatsapp, value: car.sellerPhone },
                ].map(({ key, label, value }) => (
                  <ContactButton
                    key={key}
                    onClick={() => (value ? onContact(key) : null)}
                    $disabled={!value}
                  >
                    <span style={{ width: 10 }}>•</span>
                    <span>{label}</span>
                    <span style={{ marginLeft: 'auto', color: '#6b7280', fontWeight: 500 }}>
                      {value || text.notSpecified}
                    </span>
                  </ContactButton>
                ))}
              </ContactCard>

              <Card>
                <SectionTitle style={{ marginBottom: '0.75rem' }}>{text.sellerAbout}</SectionTitle>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{car.companyName || car.sellerName}</div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {car.companyAddress || `${car.locationData?.cityName}, ${car.region}`}
                </div>
                <RatingHighlights>
                  <span>⭐ 4.7</span>
                  <span>•</span>
                  <span>{text.ratingHighlights}: {language === 'bg' ? 'професионално обслужване' : 'excellent advice'}</span>
                </RatingHighlights>
                <ReportLink onClick={() => window.open('mailto:support@koli.one?subject=Listing%20report')}>
                  ⚠ {text.reportLabel}
                </ReportLink>
              </Card>
            </PriceCard>

            <ServicesCard>
              <ServiceRow>
                <ServiceTitle>{text.evaluate}</ServiceTitle>
                <ServiceDescription>{language === 'bg' ? 'Бърза и безплатна оценка на автомобила ви.' : 'Fast, non-binding valuation for your current car.'}</ServiceDescription>
                <ServiceButton>{text.evaluateCta} →</ServiceButton>
              </ServiceRow>
              <ServiceRow>
                <ServiceTitle>{text.insurance}</ServiceTitle>
                <ServiceDescription>{language === 'bg' ? 'Намерете най-добрата застраховка за автомобила.' : 'Find the right insurance at the best price.'}</ServiceDescription>
                <ServiceButton>{text.insuranceCta} →</ServiceButton>
              </ServiceRow>
            </ServicesCard>
          </div>
        </Layout>
      </Inner>
    </PageWrapper>
  );
};

export default CarDetailsModernView;

