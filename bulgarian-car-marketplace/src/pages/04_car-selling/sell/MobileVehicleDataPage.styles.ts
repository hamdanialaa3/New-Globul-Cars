import styled from 'styled-components';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '@/styles/mobile-design-system';

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

const FieldGroup = styled.div`
  ${mobileMixins.flexColumn};
  gap: ${mobileSpacing.xs};
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

const Select = styled.select`
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.sm} ${mobileSpacing.md};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  color: ${mobileColors.neutral.gray900};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  transition: ${mobileAnimations.transitions.default};
  &:focus {
    outline: none;
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
`;

const Input = styled.input`
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.sm} ${mobileSpacing.md};
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

const Hint = styled.span`
  font-size: ${mobileTypography.caption.fontSize};
  color: ${mobileColors.neutral.gray600};
`;

const Card = styled.div`
  background: ${mobileColors.surface.card};
  border: 1px solid ${mobileColors.surface.border};
  padding: ${mobileSpacing.lg};
  box-shadow: ${'0 1px 2px rgba(16,24,40,0.04)'};
  border-radius: ${mobileBorderRadius.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${mobileSpacing.md};
`;

const StickyFooter = styled.div`
  position: fixed;
  bottom: 0; left: 0; right: 0;
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
  FieldGroup,
  Label,
  Select,
  Input,
  Hint,
  Card,
  Grid,
  StickyFooter,
  PrimaryButton,
};
