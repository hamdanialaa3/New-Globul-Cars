// MobileContactPage Styles
// Mobile-first design system implementation
// <300 lines enforced

import styled from 'styled-components';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '../../../styles/mobile-design-system';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${mobileColors.neutral.gray50};
  ${mobileMixins.safeAreaPadding};
`;

const ContentWrapper = styled.main`
  flex: 1;
  padding: ${mobileSpacing.lg} 0;
  padding-bottom: 140px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const HeaderSection = styled.header`
  margin-bottom: ${mobileSpacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${mobileTypography.display.xs.fontSize};
  line-height: ${mobileTypography.display.xs.lineHeight};
  font-weight: ${mobileTypography.display.xs.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.xs} 0;
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
  border-radius: ${mobileBorderRadius.lg};
  padding: ${mobileSpacing.lg};
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${mobileSpacing.lg};
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
  ${({ $required }) =>
    $required &&
    `
    &::after {
      content: ' *';
      color: ${mobileColors.error.main};
    }
  `}
`;

const Input = styled.input`
  ${mobileMixins.preventZoom};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.md};
  background: ${mobileColors.neutral.white};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  color: ${mobileColors.neutral.gray900};
  transition: all ${mobileAnimations.duration.normal} ${mobileAnimations.easing.easeInOut};
  
  &:focus {
    outline: none;
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
  
  &::placeholder {
    color: ${mobileColors.neutral.gray500};
  }
  
  &:disabled {
    background: ${mobileColors.neutral.gray100};
    color: ${mobileColors.neutral.gray500};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  ${mobileMixins.preventZoom};
  font-size: ${mobileTypography.input.fontSize};
  line-height: ${mobileTypography.input.lineHeight};
  width: 100%;
  min-height: 150px;
  padding: ${mobileSpacing.md};
  background: ${mobileColors.neutral.white};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  color: ${mobileColors.neutral.gray900};
  transition: all ${mobileAnimations.duration.normal} ${mobileAnimations.easing.easeInOut};
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
  }
  
  &::placeholder {
    color: ${mobileColors.neutral.gray500};
  }
  
  &:disabled {
    background: ${mobileColors.neutral.gray100};
    color: ${mobileColors.neutral.gray500};
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  font-size: ${mobileTypography.bodySmall.fontSize};
  line-height: ${mobileTypography.bodySmall.lineHeight};
  color: ${mobileColors.neutral.gray600};
  margin: 0;
`;

const InfoCard = styled.div`
  background: ${mobileColors.primary.pale};
  border-left: 4px solid ${mobileColors.primary.main};
  border-radius: ${mobileBorderRadius.md};
  padding: ${mobileSpacing.md};
`;

const InfoTitle = styled.h3`
  font-size: ${mobileTypography.h3.fontSize};
  line-height: ${mobileTypography.h3.lineHeight};
  font-weight: ${mobileTypography.h3.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.xs} 0;
`;

const InfoText = styled.p`
  font-size: ${mobileTypography.bodySmall.fontSize};
  line-height: ${mobileTypography.bodySmall.lineHeight};
  color: ${mobileColors.neutral.gray700};
  margin: 0;
`;

const StickyFooter = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${mobileColors.surface.card};
  padding: ${mobileSpacing.md};
  padding-bottom: calc(${mobileSpacing.md} + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
`;

const PrimaryButton = styled.button<{ $enabled: boolean }>`
  ${mobileMixins.touchTarget};
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  width: 100%;
  padding: ${mobileSpacing.md} ${mobileSpacing.lg};
  background: ${({ $enabled }) =>
    $enabled ? mobileColors.primary.main : mobileColors.neutral.gray300};
  color: ${({ $enabled }) =>
    $enabled ? mobileColors.neutral.white : mobileColors.neutral.gray600};
  border: none;
  border-radius: ${mobileBorderRadius.full};
  cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'not-allowed')};
  transition: all ${mobileAnimations.duration.normal} ${mobileAnimations.easing.easeInOut};
  
  ${({ $enabled }) =>
    $enabled &&
    `
    &:active {
      transform: scale(0.98);
      background: ${mobileColors.primary.dark};
    }
  `}
`;

export const S = {
  PageWrapper,
  ContentWrapper,
  HeaderSection,
  PageTitle,
  PageSubtitle,
  Card,
  Grid,
  FieldGroup,
  Label,
  Input,
  TextArea,
  HelpText,
  InfoCard,
  InfoTitle,
  InfoText,
  StickyFooter,
  PrimaryButton
};

export default S;
