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
const Grid = styled.div `
  display: grid;
  grid-template-columns: 1fr;
  gap: ${mobileSpacing.md};
`;
const CategoryCard = styled.button `
  ${mobileMixins.touchTarget};
  background: ${mobileColors.surface.card};
  border: 2px solid ${mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.lg};
  padding: ${mobileSpacing.lg};
  text-align: left;
  cursor: pointer;
  transition: ${mobileAnimations.transitions.default};
  
  &:active {
    transform: scale(0.98);
    border-color: ${mobileColors.primary.main};
    background: ${mobileColors.primary.pale};
  }
`;
const CategoryTitle = styled.h3 `
  font-size: ${mobileTypography.h4.fontSize};
  font-weight: ${mobileTypography.h4.fontWeight};
  color: ${mobileColors.neutral.gray900};
  margin: 0 0 ${mobileSpacing.xs} 0;
`;
const CategoryDescription = styled.p `
  font-size: ${mobileTypography.bodySmall.fontSize};
  line-height: ${mobileTypography.bodySmall.lineHeight};
  color: ${mobileColors.neutral.gray600};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;
const FeatureList = styled.ul `
  list-style: none;
  padding: 0;
  margin: 0;
`;
const FeatureItem = styled.li `
  font-size: ${mobileTypography.caption.fontSize};
  color: ${mobileColors.neutral.gray600};
  padding: ${mobileSpacing.xs} 0;
  
  &::before {
    content: '•';
    margin-right: ${mobileSpacing.xs};
    color: ${mobileColors.primary.main};
    font-weight: bold;
  }
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
    Grid,
    CategoryCard,
    CategoryTitle,
    CategoryDescription,
    FeatureList,
    FeatureItem,
    StickyFooter,
    SkipButton,
};
