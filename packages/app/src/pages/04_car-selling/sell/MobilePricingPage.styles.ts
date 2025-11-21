import styled from 'styled-components';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '@globul-cars/ui/styles/mobile-design-system';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${mobileColors.neutral.gray50};
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${mobileSpacing.lg} 0;
  padding-bottom: 140px;
`;

const HeaderSection = styled.div`
  margin-bottom: ${mobileSpacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${mobileTypography.display.xs.fontSize};
  line-height: ${mobileTypography.display.xs.lineHeight};
  font-weight: ${mobileTypography.display.xs.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${mobileTypography.bodyLarge.fontSize};
  line-height: ${mobileTypography.bodyLarge.lineHeight};
  color: ${mobileColors.neutral.gray600};
  margin: 0;
`;

const Card = styled.div`
  background: ${mobileColors.surface.card};
  border: 1px solid ${mobileColors.surface.border};
  padding: ${mobileSpacing.lg};
  box-shadow: 0 1px 2px rgba(16,24,40,0.04);
  border-radius: ${mobileBorderRadius.lg};
`;

const FieldGroup = styled.div`
  ${mobileMixins.flexColumn};
  gap: ${mobileSpacing.xs};
  margin-bottom: ${mobileSpacing.lg};
`;

const Label = styled.label<{ $required?: boolean }>`
  font-size: ${mobileTypography.label.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  line-height: ${mobileTypography.label.lineHeight};
  color: ${mobileColors.neutral.gray700};
  &::after {
    content: ${props => (props.$required ? "' *'" : "''")};
    color: ${mobileColors.error.main};
  }
`;

const PriceInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
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

const Currency = styled.div`
  position: absolute;
  right: ${mobileSpacing.md};
  font-size: ${mobileTypography.input.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  color: ${mobileColors.neutral.gray700};
  pointer-events: none;
`;

const FormattedPrice = styled.p`
  font-size: ${mobileTypography.h3.fontSize};
  font-weight: ${mobileTypography.h3.fontWeight};
  color: ${mobileColors.primary.main};
  margin: ${mobileSpacing.sm} 0 0 0;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${mobileSpacing.sm};
  margin-bottom: ${mobileSpacing.md};
  padding: ${mobileSpacing.sm} 0;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${mobileColors.primary.main};
`;

const CheckboxLabel = styled.label`
  font-size: ${mobileTypography.bodyMedium.fontSize};
  color: ${mobileColors.neutral.gray700};
  cursor: pointer;
  user-select: none;
`;

const InfoCard = styled.div`
  background: ${mobileColors.primary.pale};
  border: 1px solid ${mobileColors.primary.light};
  border-radius: ${mobileBorderRadius.lg};
  padding: ${mobileSpacing.md};
`;

const InfoTitle = styled.h3`
  font-size: ${mobileTypography.h4.fontSize};
  font-weight: ${mobileTypography.h4.fontWeight};
  color: ${mobileColors.primary.main};
  margin: 0 0 ${mobileSpacing.xs} 0;
`;

const InfoText = styled.p`
  font-size: ${mobileTypography.bodySmall.fontSize};
  line-height: ${mobileTypography.bodySmall.lineHeight};
  color: ${mobileColors.neutral.gray700};
  margin: 0;
`;

const StickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${mobileColors.surface.background};
  border-top: 1px solid ${mobileColors.surface.divider};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  ${mobileMixins.safeAreaPadding}
`;

const PrimaryButton = styled.button<{ $enabled: boolean }>`
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
  Checkbox,
  CheckboxLabel,
  InfoCard,
  InfoTitle,
  InfoText,
  StickyFooter,
  PrimaryButton,
};
