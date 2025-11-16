// Sell Page with Workflow Visualization
// صفحة البيع مع تصور الأتمتة - تصميم split screen
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Car, Sparkles, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import SplitScreenLayout from '../../components/SplitScreenLayout';
import { WorkflowFlow } from '@/components/WorkflowVisualization';
import WorkflowPersistenceService from '@/services/workflowPersistenceService';
import { getAllBrands, getFeaturedBrands, getModelsForBrand, getClassesForBrand, getModelsForBrandAndClass, getAllModelsForBrand } from '@/services/carBrandsService';
import { CAR_YEARS, FUEL_TYPES } from '@/data/dropdown-options';

const FIRST_REG_MONTHS = [
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

const DOOR_GROUPS = [
  { value: '2_3', labelBg: '2/3 врати', labelEn: '2/3 doors' },
  { value: '4_5', labelBg: '4/5 врати', labelEn: '4/5 doors' },
  { value: '6_7', labelBg: '6/7 врати', labelEn: '6/7 doors' }
];

const FUEL_CHIP_VALUES = ['lpg', 'petrol', 'diesel', 'electric', 'hybrid'];
const SALE_TYPE_OPTIONS: Array<'private' | 'commercial'> = ['private', 'commercial'];
const SALE_TIMELINE_OPTIONS: Array<'unknown' | 'soon' | 'months'> = ['unknown', 'soon', 'months'];
const ROADWORTHY_OPTIONS: Array<'yes' | 'no'> = ['yes', 'no'];

type ValidationState = 'valid' | 'invalid';

const validationBackground: Record<ValidationState, string> = {
  valid: 'rgba(34, 197, 94, 0.18)',
  invalid: 'rgba(239, 68, 68, 0.18)'
};

const getValidationBackground = (state?: ValidationState) =>
  validationBackground[state ?? 'invalid'];

interface ValidationProps {
  $validation?: ValidationState;
}

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  border: 1px solid rgba(255, 143, 16, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
  }
`;

const Title = styled.h1`
  font-size: 1.9rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #3c4a5d;
  margin: 0 0 1.75rem 0;
  line-height: 1.5;
`;

const SubtitleStrip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 143, 16, 0.12);
  border: 1px solid rgba(255, 143, 16, 0.35);
  color: #d26b00;
  font-weight: 600;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
  }
`;

const SmartButton = styled.button`
  background: white;
  color: #ff8f10;
  border: 2px solid #ff8f10;
  border-radius: 50px;
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #ff8f10, #005ca9);
    color: white;
  }

  svg {
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
  }
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.5rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 143, 16, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 143, 16, 0.15);
  }
`;

const FeatureTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const FeatureDescription = styled.p`
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
`;

const ListingSection = styled.section`
  background: #f7f9fc;
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid rgba(0, 20, 60, 0.05);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ListingHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListingTitle = styled.h2`
  font-size: 1.5rem;
  color: #111c2f;
  margin: 0;
`;

const ListingDescription = styled.p`
  margin: 0;
  color: #49566c;
  line-height: 1.5;
`;

const PopularBrandsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const PopularLabel = styled.div`
  font-weight: 600;
  color: #1d2a3b;
`;

const PopularSubtext = styled.p`
  margin: 0.25rem 0 0;
  color: #637189;
  font-size: 0.9rem;
`;

const BrandChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const BrandChip = styled.button<{ $active: boolean }>`
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#ff8f10' : 'rgba(20, 30, 55, 0.12)')};
  background: ${({ $active }) =>
    $active ? 'rgba(255, 143, 16, 0.12)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ $active }) => ($active ? '#d26b00' : '#1f2b3c')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8f10;
    color: #d26b00;
  }
`;

const MoreBrandsButton = styled.button`
  background: transparent;
  border: 1px dashed rgba(31, 43, 60, 0.4);
  border-radius: 999px;
  padding: 0.55rem 1.4rem;
  font-weight: 600;
  color: #1f2b3c;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8f10;
    color: #ff8f10;
  }
`;

const BrandSelectionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BrandOrbitWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: rgba(12, 20, 40, 0.55);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const BrandOrbitHint = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const VerticalFieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1c2536;
`;

const FieldSelect = styled.select.attrs<{ title?: string; 'aria-label'?: string }>(props => {
  const fallback = props.title ?? props['aria-label'] ?? 'Select option';
  return {
    title: fallback,
    'aria-label': props['aria-label'] ?? fallback
  };
})<ValidationProps>`
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  color: #1c2536;
  background: ${({ $validation }) => getValidationBackground($validation)};
  transition: border 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.15);
  }
`;

const FieldInput = styled.input<ValidationProps>`
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  color: #1c2536;
  background: ${({ $validation }) => getValidationBackground($validation)};
  transition: border 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.15);
  }
`;

const FieldHint = styled.span`
  font-size: 0.8rem;
  color: #6e7c91;
`;

const InlineFields = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const InputWrapper = styled.div<ValidationProps>`
  display: flex;
  align-items: center;
  border: 1px solid rgba(15, 23, 42, 0.15);
  border-radius: 14px;
  background: ${({ $validation }) => getValidationBackground($validation)};
  overflow: hidden;

  input {
    border: none;
    flex: 1;
    padding-right: 0;
  }

  &:focus-within {
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.15);
  }
`;

const InputSuffix = styled.span`
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: #5a6578;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const DemandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const DemandCard = styled.div`
  border-radius: 18px;
  padding: 1.25rem 1.4rem;
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
`;

const DemandTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
`;

const DemandText = styled.p`
  margin: 0;
  color: #4c566c;
  line-height: 1.45;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #111c2f;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const OptionGroupLabel = styled.span`
  font-weight: 600;
  color: #1d2738;
`;

const OptionPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PillButton = styled.button<{ $active: boolean }>`
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#ff8f10' : 'rgba(15, 23, 42, 0.15)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 143, 16, 0.15)' : 'white')};
  padding: 0.55rem 1.1rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#d26900' : '#1f2b3c')};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const FurtherInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  border-radius: 12px;
  padding: 0.65rem 1.1rem;
  border: 1px solid ${({ $active }) => ($active ? '#0ea5e9' : 'rgba(15, 23, 42, 0.15)')};
  background: ${({ $active }) => ($active ? 'rgba(14, 165, 233, 0.12)' : 'white')};
  color: ${({ $active }) => ($active ? '#0b7fb3' : '#1c2536')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const InfoNote = styled.p`
  background: rgba(14, 116, 144, 0.08);
  border: 1px solid rgba(14, 116, 144, 0.25);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0f3a4f;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const UserMetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.95rem;
  color: #1c2536;
`;

const LoggedInLabel = styled.span`
  font-weight: 600;
  color: #0f172a;
`;

const SummaryStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled.div`
  background: #0f172a;
  color: white;
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const SummaryTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
`;

const SummaryFootnote = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
`;

const PrivacyNote = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #5b6476;
`;

const SellPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const brandSelectRef = useRef<HTMLSelectElement>(null);

  const brandOptions = useMemo(() => getAllBrands(), []);
  const popularBrands = useMemo(() => getFeaturedBrands().slice(0, 6), []);

  const [formState, setFormState] = useState({
    brand: '',
    class: '',
    model: '',
    brandOther: '',
    classOther: '',
    modelOther: '',
    firstRegYear: '',
    firstRegMonth: '',
    mileage: '',
    fuelType: '',
    fuelTypeOther: '',
    doors: '',
    power: '',
    roadworthy: 'yes' as 'yes' | 'no',
    saleType: 'private' as 'private' | 'commercial',
    saleTimeline: 'unknown' as 'unknown' | 'soon' | 'months',
    postalCode: '',
    country: '',
    saleLocation: ''
  });

  const classOptions = useMemo(() => {
    if (!formState.brand) return [];
    return getClassesForBrand(formState.brand);
  }, [formState.brand]);

  const modelOptions = useMemo(() => {
    console.log('Calculating modelOptions for brand:', formState.brand, 'class:', formState.class);
    if (!formState.brand) return [];

    // If a class is selected, show models for that class
    if (formState.class) {
      const models = getModelsForBrandAndClass(formState.brand, formState.class);
      console.log('Models for class:', models);
      return models.length > 0 ? [...models, '__other__'] : models;
    }

    // If no class is selected, show all models for the brand
    const allModels = getAllModelsForBrand(formState.brand);
    console.log('All models for brand:', allModels);
    return allModels.length > 0 ? [...allModels, '__other__'] : allModels;
  }, [formState.brand, formState.class]);

  const yearOptions = useMemo(
    () =>
      CAR_YEARS.map(option => ({
        value: option.value,
        label: language === 'bg' ? option.label : option.labelEn || option.label
      })),
    [language]
  );

  const monthOptions = useMemo(
    () =>
      FIRST_REG_MONTHS.map(option => ({
        value: option.value,
        label: language === 'bg' ? option.labelBg : option.labelEn
      })),
    [language]
  );

  const fuelOptions = useMemo(
    () =>
      FUEL_TYPES.filter(option => FUEL_CHIP_VALUES.includes(option.value)).map(option => ({
        value: option.value,
        label: language === 'bg' ? option.label : option.labelEn || option.label
      })),
    [language]
  );

  const doorOptions = useMemo(
    () =>
      DOOR_GROUPS.map(option => ({
        value: option.value,
        label: language === 'bg' ? option.labelBg : option.labelEn
      })),
    [language]
  );

  const handleFormChange = useCallback(
    (field: keyof typeof formState, value: string) => {
      setFormState(prev => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  const handleBrandSelect = useCallback(
    (value: string) => {
      console.log('handleBrandSelect called with brand:', value);
      setFormState(prev => ({
        ...prev,
        brand: value,
        brandOther: value === '__other__' ? prev.brandOther : '',
        class: '',
        model: ''
      }));
    },
    []
  );

  const handleClassSelect = useCallback(
    (value: string) => {
      console.log('handleClassSelect called with:', value);
      setFormState(prev => ({
        ...prev,
        classOther: value === '__other__' ? prev.classOther : '',
        class: value,
        model: ''
      }));
      console.log('formState updated, class:', value);
    },
    []
  );

  const workflowPrefill = useMemo(() => {
    const payload: Record<string, any> = {};
    if (formState.brand) payload.make = formState.brand === '__other__' ? formState.brandOther : formState.brand;
    if (formState.model) payload.model = formState.model === '__other__' ? formState.modelOther : formState.model;
    if (formState.firstRegYear) payload.year = formState.firstRegYear;
    if (formState.firstRegMonth) payload.registrationMonth = formState.firstRegMonth;
    if (formState.mileage) payload.mileage = formState.mileage;
    if (formState.fuelType) payload.fuelType = formState.fuelType === '__other__' ? formState.fuelTypeOther : formState.fuelType;
    if (formState.doors) payload.doors = formState.doors;
    if (formState.power) payload.power = formState.power;
    if (formState.postalCode) payload.salePostalCode = formState.postalCode;
    if (formState.country) payload.saleCountry = formState.country;
    if (formState.saleLocation) payload.saleLocation = formState.saleLocation;
    payload.saleTimeline = formState.saleTimeline;
    payload.saleType = formState.saleType;
    payload.roadworthy = formState.roadworthy === 'yes';
    payload.prefilledFromHero = true;
    return payload;
  }, [formState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (Object.keys(workflowPrefill).length === 0) {
      return;
    }
    WorkflowPersistenceService.clearAutoSaveTimeout();
    const existing = WorkflowPersistenceService.loadState();
    const mergedData = { ...(existing?.data || {}), ...workflowPrefill };
    WorkflowPersistenceService.autoSave(mergedData, existing?.currentStep || 'vehicle-data');
    return () => {
      WorkflowPersistenceService.clearAutoSaveTimeout();
    };
  }, [workflowPrefill]);

  const persistImmediately = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const existing = WorkflowPersistenceService.loadState();
    const mergedData = { ...(existing?.data || {}), ...workflowPrefill };
    WorkflowPersistenceService.saveState(mergedData, existing?.currentStep || 'vehicle-data');
  }, [workflowPrefill]);

  const handleStartJourney = useCallback(() => {
    persistImmediately();
    navigate('/sell/auto');
  }, [navigate, persistImmediately]);

  const demandText = useMemo(() => {
    const brand = formState.brand || 'Volkswagen';
    const model = formState.model || 'Arteon';
    return t('sell.listingSection.demandDefault')
      .replace('{brand}', brand)
      .replace('{model}', model);
  }, [formState.brand, formState.model, t]);

  const sellingChanceText = t('sell.listingSection.sellingChanceDefault');

  const brandOrbit = useMemo(
    () => (
      <WorkflowFlow
        variant="inline"
        currentStepIndex={0}
        totalSteps={5}
        carBrand={formState.brand || undefined}
        language={language}
      />
    ),
    [formState.brand, language]
  );

  const userDisplayName = user?.displayName || user?.email || 'Guest';

  const leftContent = (
    <ContentSection>
      <HeaderCard>
        <Title>{t('sell.hero.title')}</Title>
        <Subtitle>
          <SubtitleStrip>{t('sell.hero.subtitle')}</SubtitleStrip>
        </Subtitle>

        <ButtonsContainer>
          <StartButton onClick={handleStartJourney}>
            <Car size={20} />
            {t('sell.hero.startNow')}
          </StartButton>

          <SmartButton onClick={() => alert(t('sell.hero.smartAddDescription'))}>
            <Sparkles size={20} />
            {t('sell.hero.smartAdd')}
            <Badge>Soon</Badge>
          </SmartButton>
        </ButtonsContainer>
      </HeaderCard>

      <FeaturesGrid>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.fast.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.fast.description')}</FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.mobile.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.mobile.description')}</FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.secure.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.secure.description')}</FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.free.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.free.description')}</FeatureDescription>
        </FeatureCard>
      </FeaturesGrid>

      <ListingSection>
        <ListingHeader>
          <ListingTitle>{t('sell.listingSection.title')}</ListingTitle>
          <ListingDescription>{t('sell.listingSection.description')}</ListingDescription>
        </ListingHeader>

        <PopularBrandsHeader>
          <div>
            <PopularLabel>{t('sell.listingSection.popularLabel')}</PopularLabel>
            <PopularSubtext>{t('sell.listingSection.popularSubtext')}</PopularSubtext>
          </div>
          <MoreBrandsButton onClick={() => brandSelectRef.current?.focus()}>
            {t('sell.listingSection.moreBrands')}
          </MoreBrandsButton>
        </PopularBrandsHeader>

        <BrandChips>
          {popularBrands.map(brand => (
            <BrandChip
              key={brand}
              $active={formState.brand === brand}
              onClick={() => handleBrandSelect(brand)}
            >
              {brand}
            </BrandChip>
          ))}
        </BrandChips>

        <BrandSelectionRow>
          <FieldGroup>
            <FieldLabel>{t('sell.vehicleData.brand')}</FieldLabel>
            <FieldSelect
              ref={brandSelectRef}
              value={formState.brand}
              onChange={event => handleBrandSelect(event.target.value)}
              aria-label={t('sell.vehicleData.brand')}
              title={t('sell.vehicleData.brand')}
              $validation={formState.brand ? 'valid' : 'invalid'}
            >
              <option value="">{t('sell.vehicleData.selectBrand')}</option>
              {brandOptions.map((brand: string) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
              {/* Allow a free-text 'Other' choice */}
              <option value="__other__">{t('sell.vehicleData.other')}</option>
            </FieldSelect>
            {formState.brand === '__other__' && (
              <div style={{ marginTop: '0.5rem' }}>
                <FieldLabel>{t('sell.vehicleData.enterOtherLabel')}</FieldLabel>
                <FieldInput
                  value={formState.brandOther}
                  onChange={e => handleFormChange('brandOther', e.target.value)}
                  placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                  aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                />
              </div>
            )}
          </FieldGroup>

          <BrandOrbitWrapper>
            {brandOrbit}
            <BrandOrbitHint>
              {formState.brand || t('sell.listingSection.selectBrandHint')}
            </BrandOrbitHint>
          </BrandOrbitWrapper>
        </BrandSelectionRow>

        <VerticalFieldStack>
          <FieldGroup>
            <FieldLabel>{t('sell.vehicleData.class')}</FieldLabel>
            <FieldSelect
              value={formState.class}
              onChange={event => handleClassSelect(event.target.value)}
              disabled={!formState.brand}
              aria-label={t('sell.vehicleData.class')}
              title={t('sell.vehicleData.class')}
              $validation={formState.class ? 'valid' : 'invalid'}
            >
              <option value="">{t('sell.vehicleData.selectClass')}</option>
              {classOptions.map((className: string) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
              <option value="__other__">{t('sell.vehicleData.other')}</option>
            </FieldSelect>
            {formState.class === '__other__' && (
              <div style={{ marginTop: '0.5rem' }}>
                <FieldLabel>{t('sell.vehicleData.enterOtherLabel')}</FieldLabel>
                <FieldInput
                  value={formState.classOther}
                  onChange={e => handleFormChange('classOther', e.target.value)}
                  placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                  aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                />
              </div>
            )}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>{t('sell.vehicleData.model')}</FieldLabel>
            <FieldSelect
              value={formState.model}
              onChange={event => handleFormChange('model', event.target.value)}
              disabled={!formState.brand}
              aria-label={t('sell.vehicleData.model')}
              title={t('sell.vehicleData.model')}
              $validation={formState.model ? 'valid' : 'invalid'}
            >
              <option value="">{t('sell.vehicleData.selectModel')}</option>
              {modelOptions.map((model: string) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
              {/* 'Other' option is appended to modelOptions when available (keeps manual input fallback). */}
            </FieldSelect>
            {/* If user chose Other for model - show inline input */}
            {formState.model === '__other__' && (
              <div style={{ marginTop: '0.5rem' }}>
                <FieldLabel>{t('sell.vehicleData.enterOtherLabel')}</FieldLabel>
                <FieldInput
                  value={formState.modelOther}
                  onChange={e => handleFormChange('modelOther', e.target.value)}
                  placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                  aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                />
              </div>
            )}
            {/* If the brand is selected but no models are found, allow manual input */}
            {formState.brand && modelOptions.length === 0 && formState.model !== '__other__' && (
              <div style={{ marginTop: '0.5rem' }}>
                <FieldLabel>{t('sell.vehicleData.enterModelManuallyLabel')}</FieldLabel>
                <FieldInput
                  value={formState.model}
                  onChange={e => handleFormChange('model', e.target.value)}
                  placeholder={t('sell.vehicleData.enterModelManually')}
                  aria-label={t('sell.vehicleData.enterModelManually')}
                />
              </div>
            )}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>{t('sell.listingSection.firstRegistration')}</FieldLabel>
            <InlineFields>
              <FieldSelect
                value={formState.firstRegYear}
                onChange={event => handleFormChange('firstRegYear', event.target.value)}
                aria-label={t('sell.vehicleData.year')}
                title={t('sell.vehicleData.year')}
                $validation={formState.firstRegYear ? 'valid' : 'invalid'}
              >
                <option value="">{t('sell.vehicleData.selectYear')}</option>
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {/* No 'Other' option for first registration years (user request) */}
              </FieldSelect>
              {/* No 'Other' option for first registration years */}
              <FieldSelect
                value={formState.firstRegMonth}
                onChange={event => handleFormChange('firstRegMonth', event.target.value)}
                aria-label={t('sell.listingSection.month')}
                title={t('sell.listingSection.month')}
                $validation={formState.firstRegMonth ? 'valid' : 'invalid'}
                disabled={!formState.firstRegYear}
              >
                <option value="">{t('sell.listingSection.month')}</option>
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {/* No 'Other' option for first registration months (user request) */}
              </FieldSelect>
              {/* No 'Other' option for first registration months */}
            </InlineFields>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>{t('sell.listingSection.mileageLabel')}</FieldLabel>
            <InputWrapper $validation={formState.mileage ? 'valid' : 'invalid'}>
              <FieldInput
                type="number"
                value={formState.mileage}
                placeholder={t('sell.vehicleData.mileagePlaceholder')}
                onChange={event => handleFormChange('mileage', event.target.value)}
                $validation={formState.mileage ? 'valid' : 'invalid'}
              />
              <InputSuffix>{t('sell.listingSection.mileageUnitKm')}</InputSuffix>
            </InputWrapper>
            <FieldHint>{t('sell.vehicleData.mileageHint')}</FieldHint>
          </FieldGroup>
        </VerticalFieldStack>

        <DemandGrid>
          <DemandCard>
            <DemandTitle>
              <TrendingUp size={18} color="#047857" />
              {t('sell.listingSection.demandTitle')}
            </DemandTitle>
            <DemandText>{demandText}</DemandText>
          </DemandCard>
          <DemandCard>
            <DemandTitle>
              <ShieldCheck size={18} color="#0f5ad1" />
              {t('sell.listingSection.sellingChanceTitle')}
            </DemandTitle>
            <DemandText>{sellingChanceText}</DemandText>
          </DemandCard>
        </DemandGrid>

        <SectionTitle>{t('sell.listingSection.modelDetailsTitle')}</SectionTitle>
        <FormGrid>
          <OptionGroup>
            <OptionGroupLabel>{t('sell.listingSection.doorsLabel')}</OptionGroupLabel>
            <OptionPills>
              {doorOptions.map(option => (
                <PillButton
                  key={option.value}
                  $active={formState.doors === option.value}
                  onClick={() => handleFormChange('doors', option.value)}
                >
                  {option.label}
                </PillButton>
              ))}
            </OptionPills>
          </OptionGroup>

          <OptionGroup>
            <OptionGroupLabel>{t('sell.listingSection.fuelLabel')}</OptionGroupLabel>
            <OptionPills>
              {fuelOptions.map(option => (
                <PillButton
                  key={option.value}
                  $active={formState.fuelType === option.value}
                  onClick={() => handleFormChange('fuelType', option.value)}
                >
                  {option.label}
                </PillButton>
              ))}
              {/* Add 'Other' pill for free text fuel type */}
              <PillButton
                $active={formState.fuelType === '__other__'}
                onClick={() => handleFormChange('fuelType', '__other__')}
              >
                {t('sell.vehicleData.other')}
              </PillButton>
            </OptionPills>
          </OptionGroup>
          {formState.fuelType === '__other__' && (
            <FieldGroup>
              <FieldLabel>{t('sell.vehicleData.enterOtherLabel')}</FieldLabel>
              <FieldInput
                value={formState.fuelTypeOther}
                onChange={event => handleFormChange('fuelTypeOther', event.target.value)}
                placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
              />
            </FieldGroup>
          )}

          <FieldGroup>
            <FieldLabel>{t('sell.listingSection.powerLabel')}</FieldLabel>
            <FieldInput
              type="number"
              value={formState.power}
              placeholder={t('sell.listingSection.powerPlaceholder')}
              onChange={event => handleFormChange('power', event.target.value)}
              $validation={formState.power ? 'valid' : 'invalid'}
            />
          </FieldGroup>
        </FormGrid>

        <SectionTitle>{t('sell.listingSection.furtherInfoTitle')}</SectionTitle>
        <FurtherInfoGrid>
          <OptionGroup>
            <OptionGroupLabel>{t('sell.listingSection.roadworthyQuestion')}</OptionGroupLabel>
            <ToggleGroup>
              {ROADWORTHY_OPTIONS.map(option => (
                <ToggleButton
                  key={option}
                  $active={formState.roadworthy === option}
                  onClick={() => handleFormChange('roadworthy', option)}
                >
                  {t(`sell.listingSection.roadworthyOptions.${option}`)}
                </ToggleButton>
              ))}
            </ToggleGroup>
          </OptionGroup>

          <OptionGroup>
            <OptionGroupLabel>{t('sell.listingSection.saleTypeQuestion')}</OptionGroupLabel>
            <ToggleGroup>
              {SALE_TYPE_OPTIONS.map(option => (
                <ToggleButton
                  key={option}
                  $active={formState.saleType === option}
                  onClick={() => handleFormChange('saleType', option)}
                >
                  {t(`sell.listingSection.saleTypeOptions.${option}`)}
                </ToggleButton>
              ))}
            </ToggleGroup>
          </OptionGroup>

          <OptionGroup>
            <OptionGroupLabel>{t('sell.listingSection.saleTimelineQuestion')}</OptionGroupLabel>
            <ToggleGroup>
              {SALE_TIMELINE_OPTIONS.map(option => (
                <ToggleButton
                  key={option}
                  $active={formState.saleTimeline === option}
                  onClick={() => handleFormChange('saleTimeline', option)}
                >
                  {t(`sell.listingSection.saleTimelineOptions.${option}`)}
                </ToggleButton>
              ))}
            </ToggleGroup>
          </OptionGroup>
        </FurtherInfoGrid>

        <FieldGroup>
          <FieldLabel>{t('sell.listingSection.saleLocationQuestion')}</FieldLabel>
          <InlineFields>
            <FieldInput
              value={formState.postalCode}
              placeholder={t('sell.listingSection.postalPlaceholder')}
              onChange={event => handleFormChange('postalCode', event.target.value)}
            $validation={formState.postalCode ? 'valid' : 'invalid'}
            />
            <FieldInput
              value={formState.country}
              placeholder={t('sell.listingSection.countryPlaceholder')}
              onChange={event => handleFormChange('country', event.target.value)}
            $validation={formState.country ? 'valid' : 'invalid'}
            />
            <FieldInput
              value={formState.saleLocation}
              placeholder={t('sell.listingSection.locationPlaceholder')}
              onChange={event => handleFormChange('saleLocation', event.target.value)}
            $validation={formState.saleLocation ? 'valid' : 'invalid'}
            />
          </InlineFields>
        </FieldGroup>

        <InfoNote>
          <Info size={18} color="#0f3a4f" />
          {t('sell.listingSection.marketingNote')}
        </InfoNote>

        <UserMetaLine>
          <LoggedInLabel>{t('sell.listingSection.loggedInAs')}:</LoggedInLabel> {userDisplayName}
          <span>({t('sell.listingSection.changeAction')})</span>
        </UserMetaLine>

        <SummaryStack>
          <SummaryCard>
            <SummaryTitle>{t('sell.listingSection.summaryTitle')}</SummaryTitle>
            <SummaryFootnote>{t('sell.listingSection.summaryFootnote')}</SummaryFootnote>
          </SummaryCard>
        </SummaryStack>

        <PrivacyNote>{t('sell.listingSection.privacyNote')}</PrivacyNote>
      </ListingSection>
    </ContentSection>
  );

  return <SplitScreenLayout leftContent={leftContent} />;
};

export default SellPageNew;

