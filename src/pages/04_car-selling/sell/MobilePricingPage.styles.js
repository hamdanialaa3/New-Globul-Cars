import styled from 'styled-components';
import { mobileColors, mobileSpacing, mobileTypography, mobileBorderRadius, mobileAnimations, mobileMixins } from '../../../styles/mobile-design-system';
const PageWrapper = styled.div `
  min-height: 100vh;
  background: ${mobileColors.neutral.gray50};
  display: flex;
  flex-direction: column;
`;
const ContentWrapper = styled.div `
  flex: 1;
  padding: ${mobileSpacing.lg} 0;
  padding-bottom: 140px;
`;
const HeaderSection = styled.div `
  margin-bottom: ${mobileSpacing.xl};
`;
const PageTitle = styled.h1 `
  font-size: ${mobileTypography.display.xs.fontSize};
  line-height: ${mobileTypography.display.xs.lineHeight};
  font-weight: ${mobileTypography.display.xs.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;
const PageSubtitle = styled.p `
  font-size: ${mobileTypography.bodyLarge.fontSize};
  line-height: ${mobileTypography.bodyLarge.lineHeight};
  color: ${mobileColors.neutral.gray600};
  margin: 0;
`;
const Card = styled.div `
  background: ${mobileColors.surface.card};
  border: 1px solid ${mobileColors.surface.border};
  padding: ${mobileSpacing.lg};
  box-shadow: 0 1px 2px rgba(16,24,40,0.04);
  border-radius: ${mobileBorderRadius.lg};
`;
const FieldGroup = styled.div `
  ${mobileMixins.flexColumn};
  gap: ${mobileSpacing.xs};
  margin-bottom: ${mobileSpacing.lg};
`;
const Label = styled.label `
  font-size: ${mobileTypography.label.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  line-height: ${mobileTypography.label.lineHeight};
  color: ${mobileColors.neutral.gray700};
  &::after {
    content: ${props => (props.$required ? "' *'" : "''")};
    color: ${mobileColors.error.main};
  }
`;
const PriceInputWrapper = styled.div `
  position: relative;
  display: flex;
  align-items: center;
`;
const Input = styled.input `
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.sm} 80px ${mobileSpacing.sm} ${mobileSpacing.md};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  color: ${mobileColors.neutral.gray900};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  transition: ${mobileAnimations.transitions.default};
  
  &::placeholder { color: ${mobileColors.neutral.gray400}; }
  &:focus {
    outline: none;
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
  &[type='number'] { -moz-appearance: textfield; }
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;
const Currency = styled.div `
  position: absolute;
  right: ${mobileSpacing.md};
  font-size: ${mobileTypography.input.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  color: ${mobileColors.neutral.gray700};
  pointer-events: none;
`;
const FormattedPrice = styled.p `
  font-size: ${mobileTypography.h3.fontSize};
  font-weight: ${mobileTypography.h3.fontWeight};
  color: ${mobileColors.primary.main};
  margin: ${mobileSpacing.sm} 0 0 0;
`;
const CheckboxGroup = styled.div `
  display: flex;
  align-items: center;
  gap: ${mobileSpacing.sm};
  margin-bottom: ${mobileSpacing.md};
  padding: ${mobileSpacing.sm} 0;
`;
// ✅ Professional Toggle Switch for Mobile
const ToggleWrapper = styled.div `
  display: flex;
  align-items: center;
  gap: ${mobileSpacing.md};
  padding: ${mobileSpacing.md} 0;
`;
const ToggleSwitch = styled.label `
  position: relative;
  display: inline-block;
  width: 52px;
  height: 30px;
  cursor: pointer;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$checked ? '#22c55e' : '#cbd5e1'};
    border-radius: 30px;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$checked
    ? '0 3px 10px rgba(34, 197, 94, 0.35), inset 0 1px 3px rgba(0, 0, 0, 0.1)'
    : 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'};

    &::before {
      content: '';
      position: absolute;
      height: 24px;
      width: 24px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), 
                  0 1px 2px rgba(0, 0, 0, 0.1);
      transform: ${props => props.$checked ? 'translateX(22px)' : 'translateX(0)'};
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${props => props.$checked ? '100%' : '0%'};
      height: ${props => props.$checked ? '100%' : '0%'};
      background: radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
  }

  &:hover .toggle-slider {
    box-shadow: ${props => props.$checked
    ? '0 4px 14px rgba(34, 197, 94, 0.45), inset 0 1px 3px rgba(0, 0, 0, 0.1)'
    : '0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(0, 0, 0, 0.1)'};
  }

  &:active .toggle-slider::before {
    width: 28px;
  }
`;
const ToggleLabel = styled.label `
  font-size: ${mobileTypography.bodyMedium.fontSize};
  color: ${mobileColors.neutral.gray700};
  cursor: pointer;
  user-select: none;
  flex: 1;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${mobileColors.primary.main};
  }
`;
const Checkbox = styled.input `
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${mobileColors.primary.main};
`;
const CheckboxLabel = styled.label `
  font-size: ${mobileTypography.bodyMedium.fontSize};
  color: ${mobileColors.neutral.gray700};
  cursor: pointer;
  user-select: none;
`;
const InfoCard = styled.div `
  background: ${mobileColors.primary.pale};
  border: 1px solid ${mobileColors.primary.light};
  border-radius: ${mobileBorderRadius.lg};
  padding: ${mobileSpacing.md};
`;
const InfoTitle = styled.h3 `
  font-size: ${mobileTypography.h4.fontSize};
  font-weight: ${mobileTypography.h4.fontWeight};
  color: ${mobileColors.primary.main};
  margin: 0 0 ${mobileSpacing.xs} 0;
`;
const InfoText = styled.p `
  font-size: ${mobileTypography.bodySmall.fontSize};
  line-height: ${mobileTypography.bodySmall.lineHeight};
  color: ${mobileColors.neutral.gray700};
  margin: 0;
`;
const StickyFooter = styled.div `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${mobileColors.surface.background};
  border-top: 1px solid ${mobileColors.surface.divider};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  ${mobileMixins.safeAreaPadding}
`;
const PrimaryButton = styled.button `
  ${mobileMixins.touchTarget};
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchLarge};
  padding: ${mobileSpacing.md} ${mobileSpacing.xl};
  background: ${props => (props.$enabled ? mobileColors.primary.main : mobileColors.neutral.gray300)};
  color: #fff;
  border: none;
  border-radius: ${mobileBorderRadius.md};
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  letter-spacing: ${mobileTypography.button.letterSpacing};
  cursor: ${props => (props.$enabled ? 'pointer' : 'not-allowed')};
  transition: ${mobileAnimations.transitions.default};
  opacity: ${props => (props.$enabled ? 1 : 0.6)};
  &:active { transform: scale(0.98); }
`;
export const S = {
    PageWrapper,
    ContentWrapper,
    HeaderSection,
    PageTitle,
    PageSubtitle,
    Card,
    FieldGroup,
    Label,
    PriceInputWrapper,
    Input,
    Currency,
    FormattedPrice,
    CheckboxGroup,
    ToggleWrapper,
    ToggleSwitch,
    ToggleLabel,
    Checkbox,
    CheckboxLabel,
    InfoCard,
    InfoTitle,
    InfoText,
    StickyFooter,
    PrimaryButton,
};
