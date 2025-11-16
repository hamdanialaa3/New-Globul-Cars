// Unified Vehicle Data Page - Responsive Design
// صفحة بيانات السيارة الموحدة - تصميم متجاوب
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { SellProgressBar } from '@/components/SellWorkflow';
// removed WorkflowFlow usage with legacy brand/model section
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';
import { useVehicleDataForm } from './VehicleData/useVehicleDataForm';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useAuth } from '@/contexts/AuthProvider';
import BrandModelMarkdownDropdown from '@/components/BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import BulgariaLocationDropdown, { BulgariaLocationData } from '@/components/BulgariaLocationDropdown/BulgariaLocationDropdown';
import { Info, ShieldCheck, TrendingUp } from 'lucide-react';
// removed legacy structured brands import; new markdown-based dropdown is canonical

// removed legacy popular brands; new markdown-based dropdown replaces this UI

const DOOR_CHIP_OPTIONS = [
  { value: '2', label: '2/3' },
  { value: '4', label: '4/5' },
  { value: '6', label: '6/7' }
];

const FUEL_CHIP_OPTIONS: Array<'lpg' | 'petrol' | 'diesel' | 'electric' | 'hybrid'> = [
  'lpg',
  'petrol',
  'diesel',
  'electric',
  'hybrid'
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

const themeTokens = (props: { theme: DefaultTheme }) => props.theme as Record<string, any>;

type ValidationState = 'valid' | 'invalid';

const validationBackground: Record<ValidationState, string> = {
  valid: 'rgba(34, 197, 94, 0.18)',
  invalid: 'rgba(239, 68, 68, 0.18)'
};

// Debug flag via query param: ?debug=sell
// يظهر الـ overlay فقط عند إضافة ?debug=sell إلى رابط الصفحة
const useSellDebugFlag = () => {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search).get('debug') === 'sell', [location.search]);
};

const getValidationBackground = (state?: ValidationState) =>
  validationBackground[state ?? 'invalid'];

interface ValidationProps {
  $validation?: ValidationState;
}

// Mobile Styles
const MobileContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  ${props => themeTokens(props).mobileMixins?.safeAreaPadding || ''};
`;

const MobileContent = styled.div`
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
`;

const MobileHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => themeTokens(props).mobileSpacing?.lg || '1.5rem'};
`;

const MobileTitle = styled.h1`
  font-size: ${props => themeTokens(props).mobileTypography?.h2?.fontSize || '1.5rem'};
  font-weight: ${props => themeTokens(props).mobileTypography?.h2?.fontWeight || '600'};
  color: var(--text-primary);
  margin: 0;
`;

const MobileFieldGroup = styled.div`
  margin-bottom: ${props => themeTokens(props).mobileSpacing?.lg || '1.5rem'};
`;

const MobileLabel = styled.label`
  display: block;
  font-size: ${props => themeTokens(props).mobileTypography?.body?.fontSize || '1rem'};
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: ${props => themeTokens(props).mobileSpacing?.sm || '0.5rem'};
`;

const MobileSelect = styled.select.attrs<{ title?: string; 'aria-label'?: string }>(props => {
  const fallback = props.title ?? props['aria-label'] ?? 'Select option';
  return {
    title: fallback,
    'aria-label': props['aria-label'] ?? fallback
  };
})<ValidationProps>`
  width: 100%;
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  border: 1px solid var(--border);
  border-radius: ${props => themeTokens(props).mobileBorderRadius?.lg || '12px'};
  background: ${props => getValidationBackground(props.$validation)};
  color: var(--text-primary);
  font-size: ${props => themeTokens(props).mobileTypography?.body?.fontSize || '1rem'};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
  }
`;

const MobileInput = styled.input<ValidationProps>`
  width: 100%;
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  border: 1px solid var(--border);
  border-radius: ${props => themeTokens(props).mobileBorderRadius?.lg || '12px'};
  background: ${props => getValidationBackground(props.$validation)};
  color: var(--text-primary);
  font-size: ${props => themeTokens(props).mobileTypography?.body?.fontSize || '1rem'};

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
  }
`;

const MobileHint = styled.p`
  font-size: ${props => themeTokens(props).mobileTypography?.small?.fontSize || '0.875rem'};
  color: var(--text-muted);
  margin: ${props => themeTokens(props).mobileSpacing?.xs || '0.25rem'} 0 0 0;
`;

const MobileStickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  ${props => themeTokens(props).mobileMixins?.safeAreaPadding || ''};
`;

const MobilePrimaryButton = styled.button`
  width: 100%;
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: ${props => themeTokens(props).mobileBorderRadius?.lg || '12px'};
  font-weight: 600;
  font-size: ${props => themeTokens(props).mobileTypography?.body?.fontSize || '1rem'};
  cursor: pointer;

  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }
`;

// Desktop Styles
const DesktopContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
`;

const DesktopContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const DesktopHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const DesktopTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 1rem 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DesktopFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const DesktopFieldGroup = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const InsightsCard = styled.section<{ $isMobile?: boolean }>`
  background: var(--bg-card);
  border-radius: 22px;
  padding: ${({ $isMobile }) => ($isMobile ? '1.5rem' : '2rem')};
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 25px 55px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: ${({ $isMobile }) => ($isMobile ? '1rem' : '1.5rem')};
`;

const InsightsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const InsightsTitle = styled.h2`
  font-size: 1.4rem;
  color: var(--text-primary);
  margin: 0;
`;

const InsightsDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const PopularRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PopularLabel = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const PopularHint = styled.p`
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const ChipButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 143, 16, 0.15)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $active }) => ($active ? 'var(--accent-primary)' : 'var(--text-primary)')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const OutlineButton = styled.button`
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px dashed rgba(255, 255, 255, 0.25);
  background: transparent;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const BrandSelectionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
  gap: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const OrbitPanel = styled.div`
  background: linear-gradient(140deg, rgba(12, 17, 32, 0.95), rgba(20, 32, 52, 0.9));
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
`;

const OrbitHint = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const InlineFields = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.6rem;
`;

const InsightField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const VerticalFieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InsightLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const InsightSelect = styled.select.attrs<{ title?: string; 'aria-label'?: string }>(props => {
  const fallback = props.title ?? props['aria-label'] ?? 'Select option';
  return {
    title: fallback,
    'aria-label': props['aria-label'] ?? fallback
  };
})<ValidationProps>`
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.8rem 1rem;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const InsightInput = styled.input<ValidationProps>`
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.8rem 1rem;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const InputSuffixWrapper = styled.div<ValidationProps>`
  display: flex;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  background: ${({ $validation }) => getValidationBackground($validation)};
`;

const InputSuffix = styled.span`
  padding: 0.8rem 1rem;
  font-weight: 600;
  color: var(--text-muted);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  border-radius: 18px;
  padding: 1.2rem 1.3rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
`;

const StatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const StatText = styled.p`
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const SectionDivider = styled.hr`
  border: none;
  height: 1px;
  background: var(--border);
  opacity: 0.3;
`;

const SectionHeading = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PillButton = styled.button<{ $active: boolean }>`
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 143, 16, 0.2)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--accent-primary)' : 'var(--text-primary)')};
  font-weight: 600;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ToggleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const InsightToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const InsightToggleButton = styled.button<{ $active: boolean }>`
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 143, 16, 0.15)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--accent-primary)' : 'var(--text-primary)')};
  font-weight: 600;
  padding: 0.6rem 1.1rem;
  cursor: pointer;
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const InsightSummaryCard = styled.div`
  border-radius: 18px;
  padding: 1.2rem;
  background: linear-gradient(135deg, #08111f, #132035);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
`;

const InsightSummaryTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const InsightSummaryText = styled.p`
  margin: 0.4rem 0 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

const InsightsPrivacyNote = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
`;

const InfoNote = styled.p`
  background: rgba(14, 116, 144, 0.08);
  border: 1px solid rgba(14, 116, 144, 0.25);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0f3a4f;
  display: flex;
  gap: 0.45rem;
  align-items: flex-start;
`;

const UserMetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

const LoggedInLabel = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const DesktopFieldTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
`;

const DesktopLabel = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const DesktopSelect = styled.select.attrs<{ title?: string; 'aria-label'?: string }>(props => {
  const fallback = props.title ?? props['aria-label'] ?? 'Select option';
  return {
    title: fallback,
    'aria-label': props['aria-label'] ?? fallback
  };
})<ValidationProps>`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
  }
`;

const DesktopInput = styled.input<ValidationProps>`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
  }
`;

const DesktopHint = styled.p`
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
`;

const DesktopActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

const DesktopButton = styled.button`
  padding: 1rem 2rem;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
`;

const DesktopPrimaryButton = styled.button`
  padding: 1rem 2.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
`;

const ProgressWrapper = styled.div<{ $isMobile: boolean }>`
  padding: ${props => (props.$isMobile ? '0.75rem 1rem 0' : '1rem 2rem 0')};
  max-width: ${props => (props.$isMobile ? 'none' : '1200px')};
  margin: 0 auto;
`;

const VehicleDataPage: React.FC = () => {
  const showSellDebug = useSellDebugFlag();
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const { user } = useAuth();

  const {
    formData,
    handleInputChange,
    canContinue,
    buildURLSearchParams
  } = useVehicleDataForm();

  // Validation state must match styled component prop type: 'valid' | 'invalid'
  const getValidationState = useCallback(
    (value?: string | number | null) => (value ? 'valid' : 'invalid'),
    []
  );

  const registrationParts = useMemo(() => {
    if (!formData.firstRegistration) {
      return { year: '', month: '' };
    }
    const [year, month] = formData.firstRegistration.split('-');
    return {
      year: year || '',
      month: month || ''
    };
  }, [formData.firstRegistration]);

  const registrationMonthOptions = useMemo(
    () => [
      ...FIRST_REGISTRATION_MONTHS.map(month => ({
        value: month.value,
        label: language === 'bg' ? month.labelBg : month.labelEn
      }))
    ],
    [language]
  );
  // Add an 'Other' month option for free-text
  // No 'Other' for registration months (use the calendar list). User requested no 'Other' here.

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
      if (!value) {
        updateFirstRegistration(registrationParts.year, undefined);
        return;
      }
      updateFirstRegistration(undefined, value);
    },
    [registrationParts.year, updateFirstRegistration]
  );

  const roadworthyChoice =
    formData.roadworthy === null || formData.roadworthy === undefined
      ? 'yes'
      : formData.roadworthy
        ? 'yes'
        : 'no';

  const saleTypeChoice = (formData.saleType as 'private' | 'commercial' | undefined) || 'private';
  const saleTimelineChoice =
    (formData.saleTimeline as 'unknown' | 'soon' | 'months' | undefined) || 'unknown';

  const demandText = useMemo(() => {
    const template = t('sell.listingSection.demandDefault');
    const brand = formData.make || 'Volkswagen';
    const model = formData.model || 'Arteon';
    return template.replace('{brand}', brand).replace('{model}', model);
  }, [formData.make, formData.model, t]);

  const sellingChanceText = t('sell.listingSection.sellingChanceDefault');

  const userDisplayName = user?.displayName || user?.email || 'Guest';

  // removed legacy popular brand chip handler; new markdown section handles selection

  const handleDoorSelect = useCallback(
    (value: string) => {
      handleInputChange('doors', value);
    },
    [handleInputChange]
  );

  const handleFuelSelect = useCallback(
    (value: string) => {
      handleInputChange('fuelType', value);
    },
    [handleInputChange]
  );

  const handleRoadworthyChange = useCallback(
    (value: 'yes' | 'no') => {
      handleInputChange('roadworthy', value === 'yes');
    },
    [handleInputChange]
  );

  const handleSaleTypeChange = useCallback(
    (value: 'private' | 'commercial') => {
      handleInputChange('saleType', value);
    },
    [handleInputChange]
  );

  const handleSaleTimelineChange = useCallback(
    (value: 'unknown' | 'soon' | 'months') => {
      handleInputChange('saleTimeline', value);
    },
    [handleInputChange]
  );

  // removed legacy brand orbit UI from old section

  useEffect(() => {
    SellWorkflowStepStateService.markPending('vehicle-data');

    // Check if previous steps are completed
    const vehicleSelectionCompleted = SellWorkflowStepStateService.isCompleted('vehicle-selection');

    if (!vehicleSelectionCompleted) {
      navigate('/sell');
    }
  }, [navigate, vehicleType]);

  const handleContinue = () => {
    if (canContinue) {
      SellWorkflowStepStateService.markCompleted('vehicle-data');
      const params = buildURLSearchParams();
      navigate(`/sell/inserat/${vehicleType}/equipment?${params}`);
    }
  };

  const handleBack = () => {
    navigate('/sell');
  };

  // removed legacy brand/model option builders; markdown-based dropdown is the source of truth

  const yearOptions = useMemo(() => [
    { value: '', label: t('sell.vehicleData.selectYear') },
    ...Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
      const year = (new Date().getFullYear() - i).toString();
      return { value: year, label: year };
    })
    // No 'Other' option for registration years
  ], [t]);

  const fuelOptions = useMemo(() => [
    { value: '', label: t('sell.vehicleData.selectFuel') },
    { value: 'petrol', label: t('sell.vehicleData.petrol') },
    { value: 'diesel', label: t('sell.vehicleData.diesel') },
    { value: 'electric', label: t('sell.vehicleData.electric') },
    { value: 'hybrid', label: t('sell.vehicleData.hybrid') },
    { value: 'lpg', label: t('sell.vehicleData.lpg') },
    { value: '__other__', label: t('sell.vehicleData.other') }
  ], [t]);

  const transmissionOptions = useMemo(() => [
    { value: '', label: t('sell.vehicleData.selectTransmission') },
    { value: 'manual', label: t('sell.vehicleData.manual') },
    { value: 'automatic', label: t('sell.vehicleData.automatic') }
  ], [t]);

  const colorOptions = useMemo(() => [
    { value: '', label: t('sell.vehicleData.selectColor') },
    { value: 'white', label: t('sell.vehicleData.white') },
    { value: 'black', label: t('sell.vehicleData.black') },
    { value: 'silver', label: t('sell.vehicleData.silver') },
    { value: 'gray', label: t('sell.vehicleData.gray') },
    { value: 'blue', label: t('sell.vehicleData.blue') },
    { value: 'red', label: t('sell.vehicleData.red') },
    { value: 'green', label: t('sell.vehicleData.green') },
    { value: 'other', label: t('sell.vehicleData.other') }
  ], [t]);

  const renderListingSection = (isMobileView: boolean) => (
    <InsightsCard $isMobile={isMobileView}>
      <InsightsHeader>
        <InsightsTitle>{t('sell.listingSection.title')}</InsightsTitle>
        <InsightsDescription>{t('sell.listingSection.description')}</InsightsDescription>
      </InsightsHeader>

      <VerticalFieldStack>

        <InsightField>
          <InsightLabel>{t('sell.listingSection.firstRegistration')}</InsightLabel>
          <InlineFields>
            <InsightSelect
              value={registrationParts.year}
              onChange={event => handleRegistrationYearChange(event.target.value)}
              aria-label={t('sell.vehicleData.year')}
              title={t('sell.vehicleData.year')}
              $validation={registrationParts.year ? 'valid' : 'invalid'}
            >
              <option value="">{t('sell.vehicleData.selectYear')}</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              {/* No 'Other' input for year (user requested full year list only) */}
            </InsightSelect>
            {/* Secondary debug block (registration area) gated */}
            {process.env.REACT_APP_SHOW_BRAND_DEBUG === 'true' && formData.make && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#888', lineHeight: '1.2' }}>
                <strong>DEBUG:</strong> brand={formData.make} models={availableModels.length} first=[{availableModels.slice(0, 6).join(', ')}]
              </div>
            )}
            <InsightSelect
              value={registrationParts.month}
              onChange={event => handleRegistrationMonthChange(event.target.value)}
              disabled={!registrationParts.year}
              aria-label={t('sell.listingSection.month')}
              title={t('sell.listingSection.month')}
              $validation={registrationParts.month ? 'valid' : 'invalid'}
            >
              <option value="">{t('sell.listingSection.month')}</option>
              {registrationMonthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              {/* No 'Other' input for month (user requested full month list only) */}
            </InsightSelect>
          </InlineFields>
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.listingSection.mileageLabel')}</InsightLabel>
          <InputSuffixWrapper $validation={formData.mileage ? 'valid' : 'invalid'}>
            <InsightInput
              type="number"
              value={formData.mileage}
              placeholder={t('sell.vehicleData.mileagePlaceholder')}
              onChange={event => handleInputChange('mileage', event.target.value)}
              $validation={formData.mileage ? 'valid' : 'invalid'}
            />
            <InputSuffix>{t('sell.listingSection.mileageUnitKm')}</InputSuffix>
          </InputSuffixWrapper>
        </InsightField>
      </VerticalFieldStack>

      <StatGrid>
        <StatCard>
          <StatTitle>
            <TrendingUp size={18} color="#0ea5e9" />
            {t('sell.listingSection.demandTitle')}
          </StatTitle>
          <StatText>{demandText}</StatText>
        </StatCard>
        <StatCard>
          <StatTitle>
            <ShieldCheck size={18} color="#22c55e" />
            {t('sell.listingSection.sellingChanceTitle')}
          </StatTitle>
          <StatText>{sellingChanceText}</StatText>
        </StatCard>
      </StatGrid>

      <SectionDivider />

      <SectionHeading>{t('sell.listingSection.modelDetailsTitle')}</SectionHeading>
      <InsightsGrid>
        <ToggleRow>
          <InsightLabel>{t('sell.listingSection.doorsLabel')}</InsightLabel>
          <PillRow>
            {DOOR_CHIP_OPTIONS.map(option => (
              <PillButton
                type="button"
                key={option.value}
                $active={formData.doors === option.value}
                onClick={() => handleDoorSelect(option.value)}
              >
                {option.label}
              </PillButton>
            ))}
          </PillRow>
        </ToggleRow>
      </InsightsGrid>

      <SectionHeading>{t('sell.listingSection.furtherInfoTitle')}</SectionHeading>
      <InsightsGrid>
        <ToggleRow>
          <InsightLabel>{t('sell.listingSection.roadworthyQuestion')}</InsightLabel>
          <InsightToggleGroup>
            {ROADWORTHY_CHOICES.map(option => (
              <InsightToggleButton
                type="button"
                key={option}
                $active={roadworthyChoice === option}
                onClick={() => handleRoadworthyChange(option)}
              >
                {t(`sell.listingSection.roadworthyOptions.${option}`)}
              </InsightToggleButton>
            ))}
          </InsightToggleGroup>
        </ToggleRow>

        <ToggleRow>
          <InsightLabel>{t('sell.listingSection.saleTypeQuestion')}</InsightLabel>
          <InsightToggleGroup>
            {SALE_TYPE_CHOICES.map(option => (
              <InsightToggleButton
                type="button"
                key={option}
                $active={saleTypeChoice === option}
                onClick={() => handleSaleTypeChange(option)}
              >
                {t(`sell.listingSection.saleTypeOptions.${option}`)}
              </InsightToggleButton>
            ))}
          </InsightToggleGroup>
        </ToggleRow>

        <ToggleRow>
          <InsightLabel>{t('sell.listingSection.saleTimelineQuestion')}</InsightLabel>
          <InsightToggleGroup>
            {SALE_TIMELINE_CHOICES.map(option => (
              <InsightToggleButton
                type="button"
                key={option}
                $active={saleTimelineChoice === option}
                onClick={() => handleSaleTimelineChange(option)}
              >
                {t(`sell.listingSection.saleTimelineOptions.${option}`)}
              </InsightToggleButton>
            ))}
          </InsightToggleGroup>
        </ToggleRow>
      </InsightsGrid>

      <ToggleRow>
        <InsightLabel>{t('sell.listingSection.saleLocationQuestion')}</InsightLabel>
        <BulgariaLocationDropdown
          value={{
            province: formData.saleProvince || '',
            city: formData.saleCity || '',
            postalCode: formData.salePostalCode || ''
          }}
          onChange={(location: BulgariaLocationData) => {
            handleInputChange('saleProvince', location.province);
            handleInputChange('saleCity', location.city);
            handleInputChange('salePostalCode', location.postalCode);
          }}
        />
      </ToggleRow>

      <InfoNote>
        <Info size={18} />
        {t('sell.listingSection.marketingNote')}
      </InfoNote>

      <UserMetaLine>
        <LoggedInLabel>{t('sell.listingSection.loggedInAs')}:</LoggedInLabel> {userDisplayName}{' '}
        <span>({t('sell.listingSection.changeAction')})</span>
      </UserMetaLine>

      <SummaryGrid>
        <InsightSummaryCard>
          <InsightSummaryTitle>{t('sell.listingSection.summaryTitle')}</InsightSummaryTitle>
          <InsightSummaryText>{t('sell.listingSection.summaryFootnote')}</InsightSummaryText>
        </InsightSummaryCard>
      </SummaryGrid>

      <InsightsPrivacyNote>{t('sell.listingSection.privacyNote')}</InsightsPrivacyNote>
    </InsightsCard>
  );

  if (isMobile) {
    return (
      <MobileContainer>
        <ProgressWrapper $isMobile={true}>
          <SellProgressBar currentStep="vehicle-data" />
        </ProgressWrapper>
        <MobileContent>
          <MobileHeader>
            <MobileTitle>{t('sell.vehicleData.title')}</MobileTitle>
          </MobileHeader>

          {/* Standalone brand→model dropdown from Markdown (mobile) - synced to form */}
          <div style={{ marginBottom: '1rem' }}>
            <BrandModelMarkdownDropdown
              brand={formData.make}
              model={formData.model}
              onBrandChange={(b) => handleInputChange('make', b)}
              onModelChange={(m) => handleInputChange('model', m)}
            />
          </div>

        {renderListingSection(true)}

          <MobileFieldGroup>
          <MobileLabel>{t('sell.vehicleData.fuelType')}</MobileLabel>
          <MobileSelect
            value={formData.fuelType}
            onChange={(e) => handleInputChange('fuelType', e.target.value)}
            aria-label={t('sell.vehicleData.fuelType')}
            title={t('sell.vehicleData.fuelType')}
            $validation={getValidationState(formData.fuelType)}
          >
              {fuelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </MobileSelect>
              {formData.fuelType === '__other__' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <MobileLabel>{t('sell.vehicleData.enterOtherLabel')}</MobileLabel>
                  <MobileInput
                    value={(formData as any).fuelTypeOther || ''}
                    onChange={e => handleInputChange('fuelTypeOther', e.target.value)}
                    placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                    aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                  />
                </div>
              )}
          </MobileFieldGroup>

          <MobileFieldGroup>
            <MobileLabel>{t('sell.vehicleData.mileage')}</MobileLabel>
            <MobileInput
              type="number"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', e.target.value)}
              placeholder={t('sell.vehicleData.mileagePlaceholder')}
            $validation={getValidationState(formData.mileage)}
            />
            <MobileHint>{t('sell.vehicleData.mileageHint')}</MobileHint>
          </MobileFieldGroup>

          <MobileFieldGroup>
            <MobileLabel>{t('sell.listingSection.powerLabel')}</MobileLabel>
            <MobileInput
              type="number"
              value={formData.power}
              onChange={(e) => handleInputChange('power', e.target.value)}
              placeholder={t('sell.listingSection.powerPlaceholder')}
              $validation={getValidationState(formData.power)}
            />
          </MobileFieldGroup>

          <MobileFieldGroup>
          <MobileLabel>{t('sell.vehicleData.transmission')}</MobileLabel>
          <MobileSelect
            value={formData.transmission}
            onChange={(e) => handleInputChange('transmission', e.target.value)}
            aria-label={t('sell.vehicleData.transmission')}
            title={t('sell.vehicleData.transmission')}
            $validation={getValidationState(formData.transmission)}
          >
              {transmissionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </MobileSelect>
          </MobileFieldGroup>

          <MobileFieldGroup>
          <MobileLabel>{t('sell.vehicleData.color')}</MobileLabel>
          <MobileSelect
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            aria-label={t('sell.vehicleData.color')}
            title={t('sell.vehicleData.color')}
            $validation={getValidationState(formData.color)}
          >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </MobileSelect>
            {formData.color === 'other' && (
              <div style={{ marginTop: '0.5rem' }}>
                <MobileLabel>{t('sell.vehicleData.enterOtherLabel')}</MobileLabel>
                <MobileInput
                  value={(formData as any).colorOther || ''}
                  onChange={e => handleInputChange('colorOther', e.target.value)}
                  placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                  aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                />
              </div>
            )}
          </MobileFieldGroup>
        </MobileContent>

        <MobileStickyFooter>
          <MobilePrimaryButton
            onClick={handleContinue}
            disabled={!canContinue}
          >
            {t('common.continue')}
          </MobilePrimaryButton>
        </MobileStickyFooter>
      </MobileContainer>
    );
  }

  return (
    <DesktopContainer>
      <ProgressWrapper $isMobile={false}>
        <SellProgressBar currentStep="vehicle-data" />
      </ProgressWrapper>
      <DesktopContent>
        {/* Debug banner removed with legacy brand/model section */}
        <DesktopHeader>
          <DesktopTitle>{t('sell.vehicleData.title')}</DesktopTitle>
        </DesktopHeader>

        {/* Standalone brand→model dropdown from Markdown (desktop) - synced to form */}
        <div style={{ marginBottom: '1rem' }}>
          <BrandModelMarkdownDropdown
            brand={formData.make}
            model={formData.model}
            onBrandChange={(b) => handleInputChange('make', b)}
            onModelChange={(m) => handleInputChange('model', m)}
          />
        </div>

        {renderListingSection(false)}

        <DesktopFormGrid>
          <DesktopFieldGroup>
            <DesktopFieldTitle>{t('sell.vehicleData.technicalDetails')}</DesktopFieldTitle>

            <DesktopLabel>{t('sell.vehicleData.fuelType')}</DesktopLabel>
            <DesktopSelect
              value={formData.fuelType}
              onChange={(e) => handleInputChange('fuelType', e.target.value)}
              aria-label={t('sell.vehicleData.fuelType')}
              title={t('sell.vehicleData.fuelType')}
              $validation={getValidationState(formData.fuelType)}
            >
              {fuelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </DesktopSelect>
            {formData.fuelType === '__other__' && (
              <div style={{ marginTop: '0.5rem' }}>
                <DesktopLabel>{t('sell.vehicleData.enterOtherLabel')}</DesktopLabel>
                <DesktopInput
                  value={(formData as any).fuelTypeOther || ''}
                  onChange={e => handleInputChange('fuelTypeOther', e.target.value)}
                  placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                  aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                />
              </div>
            )}

            <DesktopLabel>{t('sell.vehicleData.transmission')}</DesktopLabel>
            <DesktopSelect
              value={formData.transmission}
              onChange={(e) => handleInputChange('transmission', e.target.value)}
              aria-label={t('sell.vehicleData.transmission')}
              title={t('sell.vehicleData.transmission')}
              $validation={getValidationState(formData.transmission)}
            >
              {transmissionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </DesktopSelect>

            <DesktopLabel>{t('sell.vehicleData.mileage')}</DesktopLabel>
            <DesktopInput
              type="number"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', e.target.value)}
              placeholder={t('sell.vehicleData.mileagePlaceholder')}
              $validation={getValidationState(formData.mileage)}
            />
            <DesktopHint>{t('sell.vehicleData.mileageHint')}</DesktopHint>

            <DesktopLabel>{t('sell.listingSection.powerLabel')}</DesktopLabel>
            <DesktopInput
              type="number"
              value={formData.power}
              onChange={(e) => handleInputChange('power', e.target.value)}
              placeholder={t('sell.listingSection.powerPlaceholder')}
              $validation={getValidationState(formData.power)}
            />

            <DesktopLabel>{t('sell.vehicleData.color')}</DesktopLabel>
            <DesktopSelect
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              aria-label={t('sell.vehicleData.color')}
              title={t('sell.vehicleData.color')}
              $validation={getValidationState(formData.color)}
            >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </DesktopSelect>
            {formData.color === 'other' && (
              <div style={{ marginTop: '0.5rem' }}>
                <DesktopLabel>{t('sell.vehicleData.enterOtherLabel')}</DesktopLabel>
                <DesktopInput
                  value={(formData as any).colorOther || ''}
                  onChange={e => handleInputChange('colorOther', e.target.value)}
                  placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
                  aria-label={t('sell.vehicleData.enterOtherPlaceholder')}
                />
              </div>
            )}
          </DesktopFieldGroup>
        </DesktopFormGrid>

        <DesktopActions>
          <DesktopButton onClick={handleBack}>
            {t('common.back')}
          </DesktopButton>
          <DesktopPrimaryButton
            onClick={handleContinue}
            disabled={!canContinue}
          >
            {t('common.continue')}
          </DesktopPrimaryButton>
        </DesktopActions>
      </DesktopContent>
    </DesktopContainer>
  );
};

export default VehicleDataPage;