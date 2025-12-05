// Unified Vehicle Data Page - Responsive Design
// صفحة بيانات السيارة الموحدة - تصميم متجاوب
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellProgressBar } from '../../../components/SellWorkflow';
// removed WorkflowFlow usage with legacy brand/model section
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { carValidationService, ValidationResult } from '../../../services/validation/car-validation.service';
import { useVehicleDataForm } from './VehicleData/useVehicleDataForm';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import BrandModelMarkdownDropdown from '../../../components/BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import BulgariaLocationDropdown, { BulgariaLocationData } from '../../../components/BulgariaLocationDropdown/BulgariaLocationDropdown';
// removed legacy structured brands import; new markdown-based dropdown is canonical

// removed legacy popular brands; new markdown-based dropdown replaces this UI

const DOOR_CHIP_OPTIONS = [
  { value: '2', label: '2/3' },
  { value: '4', label: '4/5' },
  { value: '6', label: '6/7' }
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
  max-width: 450px;
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  border: 2px solid var(--border, #e2e8f0);
  border-radius: ${props => themeTokens(props).mobileBorderRadius?.lg || '12px'};
  min-height: 2.75rem;
  background: ${props => getValidationBackground(props.$validation)};
  color: var(--text-primary, #1e293b);
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
  max-width: 450px;
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  border: 2px solid var(--border, #e2e8f0);
  border-radius: ${props => themeTokens(props).mobileBorderRadius?.lg || '12px'};
  min-height: 2.75rem;
  background: ${props => getValidationBackground(props.$validation)};
  color: var(--text-primary, #1e293b);
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
  margin-bottom: 2rem;
`;

const DesktopTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const DesktopFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
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

const InsightsGrid = styled.div`
  display: flex;
  flex-direction: column;
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
  max-width: 450px;
  border-radius: 14px;
  border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
  padding: 0.8rem 1rem;
  min-height: 2.75rem;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary, #1e293b);
  font-size: 0.95rem;
`;

const InsightInput = styled.input<ValidationProps>`
  width: 100%;
  max-width: 450px;
  border-radius: 14px;
  border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
  padding: 0.8rem 1rem;
  min-height: 2.75rem;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary, #1e293b);
  font-size: 0.95rem;
`;

const InputSuffixWrapper = styled.div<ValidationProps>`
  display: flex;
  max-width: 450px;
  border-radius: 14px;
  border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
  min-height: 2.75rem;
  overflow: hidden;
  background: ${({ $validation }) => getValidationBackground($validation)};
`;

const InputSuffix = styled.span`
  padding: 0.8rem 1rem;
  font-weight: 600;
  color: #dc2626;
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
  max-width: 450px;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border, #e2e8f0);
  border-radius: 8px;
  min-height: 2.75rem;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary, #1e293b);
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
  max-width: 450px;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border, #e2e8f0);
  border-radius: 8px;
  min-height: 2.75rem;
  background: ${({ $validation }) => getValidationBackground($validation)};
  color: var(--text-primary, #1e293b);
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

// Quality Score Indicator Styles
const QualityScoreContainer = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => (props.$isMobile ? '0.5rem' : '1rem')};
  padding: ${props => (props.$isMobile ? '0.75rem' : '1rem')};
  margin: ${props => (props.$isMobile ? '1rem 0' : '1.5rem 0')};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const QualityScoreCircle = styled.div<{ $score: number }>`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    ${props => {
      const score = props.$score;
      const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
      return `${color} ${score * 3.6}deg, rgba(255, 255, 255, 0.1) ${score * 3.6}deg`;
    }}
  );
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--bg-primary);
  }
`;

const QualityScoreNumber = styled.div<{ $score: number }>`
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => {
    const score = props.$score;
    return score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  }};
`;

const QualityScoreText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const QualityScoreLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const QualityScoreHint = styled.div`
  font-size: 0.75rem;
  color: var(--text-muted);
`;

const ValidationErrorList = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
`;

const ValidationError = styled.div`
  font-size: 0.875rem;
  color: #ef4444;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠️';
  }
`;

const VehicleDataPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();

  const {
    formData,
    handleInputChange,
    canContinue,
    buildURLSearchParams
  } = useVehicleDataForm();

  // Validation state management
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);

  // Real-time validation on form data changes
  useEffect(() => {
    const result = carValidationService.validate(formData, 'draft');
    setValidationResult(result);
  }, [formData]);

  // ✅ FIX: Validation state shows: empty=invalid(red), filled=valid(green)
  // This encourages users to fill fields without blocking them
  const getValidationState = useCallback(
    (value?: string | number | null): 'valid' | 'invalid' => {
      // Empty = red (encourages filling), Filled = green (confirms completion)
      return value && String(value).trim() !== '' ? 'valid' : 'invalid';
    },
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

  // Render quality score indicator
  const renderQualityScore = useCallback(() => {
    if (!validationResult) return null;

    const score = validationResult.score;
    const scoreText = language === 'bg' 
      ? 'Качество на обявата'
      : 'Listing Quality';
    const scoreHint = language === 'bg'
      ? `${score >= 80 ? 'Отлично' : score >= 60 ? 'Добро' : 'Може да се подобри'} - Попълнете още полета за по-висок рейтинг`
      : `${score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Can be improved'} - Fill more fields for higher rating`;

    return (
      <QualityScoreContainer $isMobile={isMobile}>
        <QualityScoreCircle $score={score}>
          <QualityScoreNumber $score={score}>{score}</QualityScoreNumber>
        </QualityScoreCircle>
        <QualityScoreText>
          <QualityScoreLabel>{scoreText}</QualityScoreLabel>
          <QualityScoreHint>{scoreHint}</QualityScoreHint>
        </QualityScoreText>
      </QualityScoreContainer>
    );
  }, [validationResult, isMobile, language]);

  // Get field-specific validation error
  const getFieldError = useCallback((fieldName: string): string | null => {
    if (!validationResult) return null;
    const error = validationResult.errors.find(err => err.field === fieldName);
    return error ? error.message : null;
  }, [validationResult]);

  // Render field error message
  const renderFieldError = useCallback((fieldName: string) => {
    const error = getFieldError(fieldName);
    if (!error) return null;
    
    return (
      <ValidationError>{error}</ValidationError>
    );
  }, [getFieldError]);

  const roadworthyChoice =
    formData.roadworthy === null || formData.roadworthy === undefined
      ? 'yes'
      : formData.roadworthy
        ? 'yes'
        : 'no';

  const saleTypeChoice = (formData.saleType as 'private' | 'commercial' | undefined) || 'private';
  const saleTimelineChoice =
    (formData.saleTimeline as 'unknown' | 'soon' | 'months' | undefined) || 'unknown';

  // removed legacy popular brand chip handler; new markdown section handles selection

  const handleDoorSelect = useCallback(
    (value: string) => {
      handleInputChange('doors', value);
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
    // ✅ FIX: Run only once on mount to prevent infinite loop
    const vehicleSelectionCompleted = SellWorkflowStepStateService.isCompleted('vehicle-selection');

    if (!vehicleSelectionCompleted) {
      navigate('/sell');
      return;
    }

    SellWorkflowStepStateService.markPending('vehicle-data');
  }, []); // Empty dependencies - run once only

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
              $validation={getValidationState(registrationParts.year)}
            >
              <option value="">{t('sell.vehicleData.selectYear')}</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              {/* No 'Other' input for year (user requested full year list only) */}
            </InsightSelect>
            <InsightSelect
              value={registrationParts.month}
              onChange={event => handleRegistrationMonthChange(event.target.value)}
              disabled={!registrationParts.year}
              aria-label={t('sell.listingSection.month')}
              title={t('sell.listingSection.month')}
              $validation={getValidationState(registrationParts.month)}
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
          <InputSuffixWrapper $validation={getValidationState(formData.mileage)}>
            <InsightInput
              type="number"
              value={formData.mileage}
              placeholder={t('sell.vehicleData.mileagePlaceholder')}
              onChange={event => handleInputChange('mileage', event.target.value)}
            />
            <InputSuffix>{t('sell.listingSection.mileageUnitKm')}</InputSuffix>
          </InputSuffixWrapper>
        </InsightField>

        {/* Technical Details */}
        <InsightField>
          <InsightLabel>{t('sell.vehicleData.fuelType')}</InsightLabel>
          <InsightSelect
            value={formData.fuelType}
            onChange={event => handleInputChange('fuelType', event.target.value)}
            aria-label={t('sell.vehicleData.fuelType')}
            title={t('sell.vehicleData.fuelType')}
            $validation={getValidationState(formData.fuelType)}
          >
            {fuelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </InsightSelect>
          {formData.fuelType === '__other__' && (
            <div style={{ marginTop: '0.5rem' }}>
              <InsightLabel>{t('sell.vehicleData.enterOtherLabel')}</InsightLabel>
              <InsightInput
                value={(formData as any).fuelTypeOther || ''}
                onChange={e => handleInputChange('fuelTypeOther', e.target.value)}
                placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
              />
            </div>
          )}
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.vehicleData.transmission')}</InsightLabel>
          <InsightSelect
            value={formData.transmission}
            onChange={event => handleInputChange('transmission', event.target.value)}
            aria-label={t('sell.vehicleData.transmission')}
            title={t('sell.vehicleData.transmission')}
            $validation={getValidationState(formData.transmission)}
          >
            {transmissionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </InsightSelect>
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.listingSection.powerLabel')}</InsightLabel>
          <InputSuffixWrapper $validation={getValidationState(formData.power)}>
            <InsightInput
              type="number"
              value={formData.power}
              placeholder={t('sell.listingSection.powerPlaceholder')}
              onChange={event => handleInputChange('power', event.target.value)}
            />
            <InputSuffix>HP</InputSuffix>
          </InputSuffixWrapper>
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.vehicleData.color')}</InsightLabel>
          <InsightSelect
            value={formData.color}
            onChange={event => handleInputChange('color', event.target.value)}
            aria-label={t('sell.vehicleData.color')}
            title={t('sell.vehicleData.color')}
            $validation={getValidationState(formData.color)}
          >
            {colorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </InsightSelect>
          {formData.color === 'other' && (
            <div style={{ marginTop: '0.5rem' }}>
              <InsightLabel>{t('sell.vehicleData.enterOtherLabel')}</InsightLabel>
              <InsightInput
                value={(formData as any).colorOther || ''}
                onChange={e => handleInputChange('colorOther', e.target.value)}
                placeholder={t('sell.vehicleData.enterOtherPlaceholder')}
              />
            </div>
          )}
        </InsightField>
      </VerticalFieldStack>

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

      <SectionDivider />

      <SectionHeading>{t('sell.purchaseInformation.title')}</SectionHeading>
      <InsightsGrid>
        <InsightField>
          <InsightLabel>{t('sell.purchaseInformation.whenPurchased')}</InsightLabel>
          <InlineFields>
            <InsightSelect
              value={formData.purchaseMonth}
              onChange={event => handleInputChange('purchaseMonth', event.target.value)}
              aria-label={t('sell.purchaseInformation.purchaseMonth')}
              title={t('sell.purchaseInformation.purchaseMonth')}
            >
              <option value="">{t('sell.purchaseInformation.purchaseMonth')}</option>
              {FIRST_REGISTRATION_MONTHS.map(option => (
                <option key={option.value} value={option.value}>
                  {language === 'bg' ? option.labelBg : option.labelEn}
                </option>
              ))}
            </InsightSelect>
            <InsightSelect
              value={formData.purchaseYear}
              onChange={event => handleInputChange('purchaseYear', event.target.value)}
              aria-label={t('sell.purchaseInformation.purchaseYear')}
              title={t('sell.purchaseInformation.purchaseYear')}
            >
              <option value="">{t('sell.purchaseInformation.purchaseYear')}</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </InsightSelect>
          </InlineFields>
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.purchaseInformation.purchaseMileage')}</InsightLabel>
          <InputSuffixWrapper>
            <InsightInput
              type="number"
              value={formData.purchaseMileage}
              placeholder={t('sell.purchaseInformation.purchaseMileagePlaceholder')}
              onChange={event => handleInputChange('purchaseMileage', event.target.value)}
            />
            <InputSuffix>km</InputSuffix>
          </InputSuffixWrapper>
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.purchaseInformation.annualMileage')}</InsightLabel>
          <InsightSelect
            value={formData.annualMileage}
            onChange={event => handleInputChange('annualMileage', event.target.value)}
            aria-label={t('sell.purchaseInformation.annualMileage')}
            title={t('sell.purchaseInformation.annualMileage')}
          >
            <option value="">{t('sell.purchaseInformation.annualMileage')}</option>
            <option value="5000">{t('sell.purchaseInformation.annualMileageOptions.5000')}</option>
            <option value="10000">{t('sell.purchaseInformation.annualMileageOptions.10000')}</option>
            <option value="15000">{t('sell.purchaseInformation.annualMileageOptions.15000')}</option>
            <option value="20000">{t('sell.purchaseInformation.annualMileageOptions.20000')}</option>
            <option value="25000">{t('sell.purchaseInformation.annualMileageOptions.25000')}</option>
            <option value="30000">{t('sell.purchaseInformation.annualMileageOptions.30000')}</option>
            <option value="40000">{t('sell.purchaseInformation.annualMileageOptions.40000')}</option>
            <option value="50000">{t('sell.purchaseInformation.annualMileageOptions.50000')}</option>
          </InsightSelect>
        </InsightField>

        <ToggleRow>
          <InsightLabel>{t('sell.purchaseInformation.soleUser')}</InsightLabel>
          <InsightToggleGroup>
            <InsightToggleButton
              type="button"
              $active={formData.isSoleUser === true}
              onClick={() => handleInputChange('isSoleUser', true)}
            >
              {t('sell.purchaseInformation.soleUserOptions.yes')}
            </InsightToggleButton>
            <InsightToggleButton
              type="button"
              $active={formData.isSoleUser === false}
              onClick={() => handleInputChange('isSoleUser', false)}
            >
              {t('sell.purchaseInformation.soleUserOptions.no')}
            </InsightToggleButton>
          </InsightToggleGroup>
        </ToggleRow>
      </InsightsGrid>

      <SectionDivider />

      {/* ✅ FIX: Removed duplicate exteriorColor field - already have 'color' in Basic Info */}
      <SectionHeading>{t('sell.exteriorDetails.title')}</SectionHeading>
      <InsightsGrid>
        <InsightField>
          <InsightLabel>{t('sell.exteriorDetails.trimLevel')}</InsightLabel>
          <InsightInput
            type="text"
            value={formData.trimLevel}
            placeholder={t('sell.exteriorDetails.trimLevelPlaceholder')}
            onChange={event => handleInputChange('trimLevel', event.target.value)}
            $validation={getValidationState(formData.trimLevel)}
          />
        </InsightField>
      </InsightsGrid>
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

          {/* Quality Score Indicator */}
          {renderQualityScore()}

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

          {/* Sale Location - Moved to end before footer */}
          <MobileFieldGroup>
            <MobileLabel>{t('sell.listingSection.saleLocationQuestion')}</MobileLabel>
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

        {/* Quality Score Indicator */}
        {renderQualityScore()}

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

        {/* Sale Location - Moved to end before footer */}
        <DesktopFieldGroup style={{ maxWidth: '600px', margin: '2rem auto 0' }}>
          <DesktopLabel>{t('sell.listingSection.saleLocationQuestion')}</DesktopLabel>
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
        </DesktopFieldGroup>

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