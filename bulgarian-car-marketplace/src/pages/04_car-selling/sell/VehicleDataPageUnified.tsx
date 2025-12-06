// Unified Vehicle Data Page - Responsive Design
// صفحة بيانات السيارة الموحدة - تصميم متجاوب
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { useUnifiedWorkflow } from '../../../hooks/useUnifiedWorkflow';
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

// ✅ NEW: Simple Continue Button - Always Enabled
const SimpleContinueButton = styled.button`
  width: 100%;
  padding: ${props => themeTokens(props).mobileSpacing?.md || '1rem'};
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: ${props => themeTokens(props).mobileBorderRadius?.lg || '12px'};
  font-weight: 600;
  font-size: ${props => themeTokens(props).mobileTypography?.body?.fontSize || '1rem'};
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
  position: relative;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 143, 16, 0.4);
  }

  &:active {
    transform: translateY(0);
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
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${({ $validation }) => $validation === 'valid' ? '#22c55e' : '#ef4444'};
    box-shadow: 0 0 10px ${({ $validation }) => $validation === 'valid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ $validation }) => $validation === 'valid' ? '#22c55e' : '#ef4444'};
    box-shadow: 0 0 15px ${({ $validation }) => $validation === 'valid' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  }
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
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ $validation }) => $validation === 'valid' ? '#22c55e' : '#ef4444'};
    box-shadow: 0 0 10px ${({ $validation }) => $validation === 'valid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ $validation }) => $validation === 'valid' ? '#22c55e' : '#ef4444'};
    box-shadow: 0 0 15px ${({ $validation }) => $validation === 'valid' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  }
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
  background: ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.2)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#22c55e' : 'var(--text-primary)')};
  font-weight: 600;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ $active }) => ($active ? '#22c55e' : '#ef4444')};
    background: ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.15)')};
    color: ${({ $active }) => ($active ? '#22c55e' : '#ef4444')};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)')};
  }
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
  background: ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.2)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#22c55e' : 'var(--text-primary)')};
  font-weight: 600;
  padding: 0.6rem 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ $active }) => ($active ? '#22c55e' : '#ef4444')};
    background: ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.15)')};
    color: ${({ $active }) => ($active ? '#22c55e' : '#ef4444')};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)')};
  }
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

// ✅ NEW: Simple Desktop Continue Button - Always Enabled
const SimpleDesktopContinueButton = styled.button`
  padding: 1rem 2.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
  position: relative;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 143, 16, 0.4);
  }

  &:active {
    transform: translateY(0);
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

// ✅ Auto-Save Timer Indicator Styles
const AutoSaveTimer = styled.div<{ $isMobile: boolean }>`
  position: fixed;
  top: ${props => props.$isMobile ? '10px' : '20px'};
  right: ${props => props.$isMobile ? '10px' : '20px'};
  z-index: 9999;
  background: linear-gradient(135deg, rgba(255, 143, 16, 0.95), rgba(220, 38, 38, 0.95));
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: ${props => props.$isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(255, 143, 16, 0.6); }
  }
`;

const TimerIcon = styled.div`
  font-size: 1.25rem;
  animation: rotate 3s linear infinite;

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const TimerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const TimerLabel = styled.div<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '0.65rem' : '0.7rem'};
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimerCountdown = styled.div<{ $isMobile: boolean }>`
  font-size: ${props => props.$isMobile ? '1rem' : '1.25rem'};
  font-weight: 700;
  color: #ffffff;
  font-family: 'Monaco', 'Courier New', monospace;
`;

const VehicleDataPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const [searchParams] = useSearchParams();

  // ✅ UNIFIED WORKFLOW: Use unified workflow system (Step 2)
  const { workflowData, updateData, timerState } = useUnifiedWorkflow(2);

  const {
    formData,
    handleInputChange,
    canContinue,
    buildURLSearchParams
  } = useVehicleDataForm();

  // 🐛 DEBUG: Log formData changes
  useEffect(() => {
    console.log('🚗 VehicleData formData updated:', {
      make: formData.make,
      model: formData.model,
      year: formData.year,
      firstRegistration: formData.firstRegistration
    });
  }, [formData.make, formData.model, formData.year, formData.firstRegistration]);

  // Validation state management
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);
  // Touched fields tracking - simple red → green on touch
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // ✅ NEW: Simple touch-based validation: red → green on touch/interaction
  // أحمر قبل اللمس، أخضر بعد اللمس - بهذه البساطة
  const getValidationState = useCallback(
    (fieldName: string): 'valid' | 'invalid' => {
      // If touched/clicked → green, otherwise → red
      return touchedFields.has(fieldName) ? 'valid' : 'invalid';
    },
    [touchedFields]
  );

  // Mark field as touched when user interacts with it
  const markFieldAsTouched = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  // ✅ UNIFIED WORKFLOW: Load saved data on mount
  useEffect(() => {
    if (workflowData) {
      // Restore all fields from workflow data
      Object.keys(workflowData).forEach(key => {
        const value = (workflowData as any)[key];
        if (value !== undefined && value !== null) {
          // ✅ FIX: Type-safe key handling
          const validKey = key as keyof typeof formData;
          if (validKey in formData) {
            handleInputChange(validKey, value);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // ✅ FIX: Load data from URL parameters and mark as touched
  useEffect(() => {
    const make = searchParams.get('mk');
    const model = searchParams.get('md');
    const year = searchParams.get('fy');

    if (make) {
      console.log('🔗 Loading from URL: make =', make);
      handleInputChange('make', make);
      markFieldAsTouched('make');
    }
    if (model) {
      console.log('🔗 Loading from URL: model =', model);
      handleInputChange('model', model);
      markFieldAsTouched('model');
    }
    if (year) {
      console.log('🔗 Loading from URL: year =', year);
      handleInputChange('year', year);
      handleInputChange('firstRegistration', year);
      markFieldAsTouched('year');
      markFieldAsTouched('registrationYear');
    }
  }, [searchParams, handleInputChange, markFieldAsTouched]);

  // ✅ UNIFIED WORKFLOW: Save formData on every change (AUTO-SAVE)
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      // Save ALL form data immediately to unified system
      updateData({
        make: formData.make,
        model: formData.model,
        year: formData.year,
        firstRegistration: formData.firstRegistration,
        mileage: formData.mileage,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        power: formData.power,
        color: formData.color,
        doors: formData.doors,
        // ✅ FIX: Convert null to undefined for roadworthy
        roadworthy: formData.roadworthy ?? undefined,
        saleType: formData.saleType,
        saleTimeline: formData.saleTimeline,
        region: formData.saleProvince,
        city: formData.saleCity,
        postalCode: formData.salePostalCode
      });
    }
  }, [formData, updateData]); // Save on EVERY formData change

  // Real-time validation on form data changes
  useEffect(() => {
    // ✅ FIX: Convert formData to validation format (year as number)
    const validationData = {
      ...formData,
      year: formData.year ? parseInt(formData.year, 10) : undefined
    };
    const result = carValidationService.validate(validationData as any, 'draft');
    setValidationResult(result);
  }, [formData]);

  // ✅ Define required fields for Vehicle Data step
  const REQUIRED_FIELDS = useMemo(() => [
    'make',              // Brand
    'model',             // Model
    'registrationYear',  // First Registration Year
    'registrationMonth', // First Registration Month
    'mileage',          // Mileage
    'fuelType',         // Fuel Type
    'transmission',     // Transmission
    'power',            // Power (HP)
    'color',            // Color
    'doors',            // Doors
    'roadworthy',       // Is roadworthy?
    'saleType',         // Type of sale
    'saleTimeline',     // When to sell
    'saleLocation'      // Sale location
  ], []);

  // ✅ Auto-complete step when ALL required fields are touched
  useEffect(() => {
    const allFieldsTouched = REQUIRED_FIELDS.every(field => touchedFields.has(field));
    
    if (allFieldsTouched) {
      // Mark step as completed (turns green in progress bar)
      SellWorkflowStepStateService.markCompleted('vehicle-data');
    } else {
      // Mark as pending if not all fields touched yet
      SellWorkflowStepStateService.markPending('vehicle-data');
    }
  }, [touchedFields, REQUIRED_FIELDS]);

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
      // ✅ Mark as touched when year is selected
      markFieldAsTouched('registrationYear');
      markFieldAsTouched('year');
    },
    [handleInputChange, updateFirstRegistration, markFieldAsTouched]
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

  // ✅ Timer now handled by GlobalWorkflowTimer component (no local render needed)

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

  // ✅ Mark fields with default values as touched on mount
  useEffect(() => {
    const fieldsToMarkAsTouched: string[] = [];
    
    // Mark roadworthy as touched if it has a value
    if (formData.roadworthy !== null && formData.roadworthy !== undefined) {
      fieldsToMarkAsTouched.push('roadworthy');
    }
    
    // Mark saleType as touched if it has a value
    if (formData.saleType) {
      fieldsToMarkAsTouched.push('saleType');
    }
    
    // Mark saleTimeline as touched if it has a value
    if (formData.saleTimeline) {
      fieldsToMarkAsTouched.push('saleTimeline');
    }
    
    // Mark doors as touched if it has a value
    if (formData.doors) {
      fieldsToMarkAsTouched.push('doors');
    }

    if (fieldsToMarkAsTouched.length > 0) {
      setTouchedFields(prev => {
        const updated = new Set(prev);
        fieldsToMarkAsTouched.forEach(field => updated.add(field));
        return updated;
      });
    }
  }, [formData.roadworthy, formData.saleType, formData.saleTimeline, formData.doors]);

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

    // Note: Step status is now auto-managed by touchedFields tracking
    // No need to manually set pending here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependencies - run once only

  // ✅ NEW: Simple navigation function - always works
  const goToNextPage = (e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Mark step as completed
      SellWorkflowStepStateService.markCompleted('vehicle-data');
      
      // Build URL params with all form data
      const params = buildURLSearchParams();
      
      // Ensure vehicleType is valid
      const validVehicleType = vehicleType || 'car';
      const targetPath = `/sell/inserat/${validVehicleType}/equipment?${params}`;
      
      console.log('🚀 Navigating to equipment page:', targetPath);
      
      // Navigate directly - no validation blocking
      navigate(targetPath);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      const errorMsg = language === 'bg' 
        ? 'Грешка при навигация. Моля опитайте отново.'
        : 'Navigation error. Please try again.';
      alert(errorMsg);
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
              onFocus={() => markFieldAsTouched('registrationYear')}
              aria-label={t('sell.vehicleData.year')}
              title={t('sell.vehicleData.year')}
              $validation={getValidationState('registrationYear')}
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
              onFocus={() => markFieldAsTouched('registrationMonth')}
              disabled={!registrationParts.year}
              aria-label={t('sell.listingSection.month')}
              title={t('sell.listingSection.month')}
              $validation={getValidationState('registrationMonth')}
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
          <InputSuffixWrapper $validation={getValidationState('mileage')}>
            <InsightInput
              type="number"
              value={formData.mileage}
              placeholder={t('sell.vehicleData.mileagePlaceholder')}
              onChange={event => handleInputChange('mileage', event.target.value)}
              onFocus={() => markFieldAsTouched('mileage')}
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
            onFocus={() => markFieldAsTouched('fuelType')}
            aria-label={t('sell.vehicleData.fuelType')}
            title={t('sell.vehicleData.fuelType')}
            $validation={getValidationState('fuelType')}
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
                onFocus={() => markFieldAsTouched('fuelTypeOther')}
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
            onFocus={() => markFieldAsTouched('transmission')}
            aria-label={t('sell.vehicleData.transmission')}
            title={t('sell.vehicleData.transmission')}
            $validation={getValidationState('transmission')}
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
          <InputSuffixWrapper $validation={getValidationState('power')}>
            <InsightInput
              type="number"
              value={formData.power}
              placeholder={t('sell.listingSection.powerPlaceholder')}
              onChange={event => {
                const value = event.target.value;
                // حد أقصى 999 حصان (3 خانات)
                if (value === '' || (Number(value) >= 0 && Number(value) <= 999)) {
                  handleInputChange('power', value);
                }
              }}
              onFocus={() => markFieldAsTouched('power')}
              min="0"
              max="999"
            />
            <InputSuffix>HP</InputSuffix>
          </InputSuffixWrapper>
        </InsightField>

        <InsightField>
          <InsightLabel>{t('sell.vehicleData.color')}</InsightLabel>
          <InsightSelect
            value={formData.color}
            onChange={event => handleInputChange('color', event.target.value)}
            onFocus={() => markFieldAsTouched('color')}
            aria-label={t('sell.vehicleData.color')}
            title={t('sell.vehicleData.color')}
            $validation={getValidationState('color')}
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
                onFocus={() => markFieldAsTouched('colorOther')}
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
                onClick={() => {
                  handleDoorSelect(option.value);
                  markFieldAsTouched('doors');
                }}
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
                onClick={() => {
                  handleRoadworthyChange(option);
                  markFieldAsTouched('roadworthy');
                }}
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
                onClick={() => {
                  handleSaleTypeChange(option);
                  markFieldAsTouched('saleType');
                }}
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
                onClick={() => {
                  handleSaleTimelineChange(option);
                  markFieldAsTouched('saleTimeline');
                }}
              >
                {t(`sell.listingSection.saleTimelineOptions.${option}`)}
              </InsightToggleButton>
            ))}
          </InsightToggleGroup>
        </ToggleRow>
      </InsightsGrid>

      <SectionDivider />

      {/* Purchase Information section removed */}

      <SectionDivider />

      {/* ✅ FIX: Removed duplicate exteriorColor field - already have 'color' in Basic Info */}
      <SectionHeading>{t('sell.exteriorDetails.title')}</SectionHeading>
      <InsightsGrid>
        {/* Trim level field removed */}
      </InsightsGrid>
    </InsightsCard>
  );

  if (isMobile) {
    return (
      <MobileContainer>
        {/* ✅ Auto-Save Timer (Fixed Position) */}
        {/* Timer handled globally by GlobalWorkflowTimer */}
        
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
              onBrandChange={(b) => {
                handleInputChange('make', b);
                markFieldAsTouched('make');
              }}
              onModelChange={(m) => {
                handleInputChange('model', m);
                markFieldAsTouched('model');
              }}
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
                markFieldAsTouched('saleLocation');
              }}
            />
          </MobileFieldGroup>
        </MobileContent>

        <MobileStickyFooter>
          <SimpleContinueButton
            onClick={(e) => goToNextPage(e)}
            type="button"
          >
            {t('common.continue')} →
          </SimpleContinueButton>
        </MobileStickyFooter>
      </MobileContainer>
    );
  }

  return (
    <DesktopContainer>
      {/* ✅ Auto-Save Timer (Fixed Position) */}
      {/* Timer handled globally by GlobalWorkflowTimer */}
      
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
            onBrandChange={(b) => {
              handleInputChange('make', b);
              markFieldAsTouched('make');
            }}
            onModelChange={(m) => {
              handleInputChange('model', m);
              markFieldAsTouched('model');
            }}
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
              markFieldAsTouched('saleLocation');
            }}
          />
        </DesktopFieldGroup>

        <DesktopActions>
          <DesktopButton onClick={handleBack} type="button">
            ← {t('common.back')}
          </DesktopButton>
          <SimpleDesktopContinueButton
            onClick={(e) => goToNextPage(e)}
            type="button"
          >
            {t('common.continue')} →
          </SimpleDesktopContinueButton>
        </DesktopActions>
      </DesktopContent>
    </DesktopContainer>
  );
};

export default VehicleDataPage;