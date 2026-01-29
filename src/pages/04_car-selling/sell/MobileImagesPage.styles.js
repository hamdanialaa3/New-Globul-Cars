import styled from 'styled-components';
import { mobileColors, mobileSpacing, mobileTypography, mobileBorderRadius, mobileAnimations, mobileMixins } from '@/styles/mobile-design-system';
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
const InfoCard = styled.div `
  background: ${mobileColors.primary.pale};
  border: 1px solid ${mobileColors.primary.light};
  border-radius: ${mobileBorderRadius.lg};
  padding: ${mobileSpacing.md};
  margin-bottom: ${mobileSpacing.lg};
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
const UploadArea = styled.div `
  position: relative;
  margin-bottom: ${mobileSpacing.lg};
`;
const FileInput = styled.input `
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
`;
const UploadLabel = styled.label `
  ${mobileMixins.touchTarget};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 2px dashed ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.lg};
  background: ${mobileColors.surface.card};
  cursor: pointer;
  transition: ${mobileAnimations.transitions.default};
  padding: ${mobileSpacing.xl};
  
  &:active {
    border-color: ${mobileColors.primary.main};
    background: ${mobileColors.primary.pale};
  }
`;
const UploadIcon = styled.div `
  font-size: 3rem;
  color: ${mobileColors.primary.main};
  margin-bottom: ${mobileSpacing.sm};
  line-height: 1;
`;
const UploadText = styled.p `
  font-size: ${mobileTypography.h4.fontSize};
  font-weight: ${mobileTypography.h4.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.xs} 0;
`;
const UploadHint = styled.p `
  font-size: ${mobileTypography.caption.fontSize};
  color: ${mobileColors.neutral.gray600};
  margin: 0;
`;
const ImagesGrid = styled.div `
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${mobileSpacing.md};
  margin-bottom: ${mobileSpacing.lg};
`;
const ImageCard = styled.div `
  position: relative;
  aspect-ratio: 1;
  border-radius: ${mobileBorderRadius.md};
  overflow: hidden;
  background: ${mobileColors.neutral.gray200};
`;
const ImagePreview = styled.img `
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const RemoveButton = styled.button `
  position: absolute;
  top: ${mobileSpacing.xs};
  right: ${mobileSpacing.xs};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${mobileAnimations.transitions.default};
  
  &:active {
    transform: scale(0.9);
    background: rgba(0, 0, 0, 0.9);
  }
`;
const Counter = styled.p `
  font-size: ${mobileTypography.bodySmall.fontSize};
  color: ${mobileColors.neutral.gray600};
  text-align: center;
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
  background: ${props => props.disabled ? mobileColors.neutral.gray300 : mobileColors.primary.main};
  color: #fff;
  border: none;
  border-radius: ${mobileBorderRadius.md};
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  letter-spacing: ${mobileTypography.button.letterSpacing};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${mobileAnimations.transitions.default};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
const SkipButton = styled.button `
  ${mobileMixins.touchTarget};
  ${mobileMixins.preventZoom};
  width: 100%;
  min-height: ${mobileSpacing.touchLarge};
  padding: ${mobileSpacing.md} ${mobileSpacing.xl};
  background: ${mobileColors.neutral.gray200};
  color: ${mobileColors.neutral.gray700};
  border: none;
  border-radius: ${mobileBorderRadius.md};
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  letter-spacing: ${mobileTypography.button.letterSpacing};
  cursor: pointer;
  transition: ${mobileAnimations.transitions.default};
  
  &:active {
    transform: scale(0.98);
    background: ${mobileColors.neutral.gray300};
  }
`;
export const S = {
    PageWrapper,
    ContentWrapper,
    HeaderSection,
    PageTitle,
    PageSubtitle,
    InfoCard,
    InfoTitle,
    InfoText,
    UploadArea,
    FileInput,
    UploadLabel,
    UploadIcon,
    UploadText,
    UploadHint,
    ImagesGrid,
    ImageCard,
    ImagePreview,
    RemoveButton,
    Counter,
    StickyFooter,
    PrimaryButton,
    SkipButton,
};
