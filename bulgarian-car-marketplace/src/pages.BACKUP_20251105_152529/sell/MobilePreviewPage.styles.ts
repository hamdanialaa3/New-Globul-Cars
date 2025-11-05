// Styles for MobilePreviewPage
import styled from 'styled-components';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileShadows,
  mobileMixins
} from '../../styles/mobile-design-system';

export const S = {
  Container: styled.div`
    padding: ${mobileSpacing.md};
    ${mobileMixins.safeAreaPadding};
    display: flex;
    flex-direction: column;
    gap: ${mobileSpacing.md};
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  Title: styled.h1`
    font-size: ${mobileTypography.h3.fontSize};
    line-height: ${mobileTypography.h3.lineHeight};
    font-weight: ${mobileTypography.h3.fontWeight};
    color: ${mobileColors.neutral.gray900};
    margin: 0;
  `,
  Card: styled.section`
    background: ${mobileColors.surface.card};
    border: 1px solid ${mobileColors.surface.border};
    border-radius: ${mobileBorderRadius.lg};
    box-shadow: ${mobileShadows.card};
    padding: ${mobileSpacing.md};
  `,
  CardTitle: styled.h2`
    font-size: ${mobileTypography.h4.fontSize};
    line-height: ${mobileTypography.h4.lineHeight};
    font-weight: ${mobileTypography.h4.fontWeight};
    color: ${mobileColors.neutral.gray900};
    margin: 0 0 ${mobileSpacing.sm};
  `,
  Row: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${mobileSpacing.sm};
    margin-top: ${mobileSpacing.xs};
  `,
  Label: styled.span`
    color: ${mobileColors.neutral.gray600};
    font-size: ${mobileTypography.caption.fontSize};
  `,
  Value: styled.span`
    color: ${mobileColors.neutral.gray900};
    font-weight: 600;
    font-size: ${mobileTypography.bodyMedium.fontSize};
    justify-self: end;
  `,
  ImagesGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${mobileSpacing.xs};
  `,
  Thumb: styled.img`
    width: 100%;
    height: 82px;
    object-fit: cover;
    border-radius: ${mobileBorderRadius.md};
    border: 1px solid ${mobileColors.surface.border};
    background: ${mobileColors.surface.backgroundAlt};
  `,
  Actions: styled.div`
    position: sticky;
    bottom: 0;
    ${mobileMixins.safeAreaPadding};
    background: ${mobileColors.surface.background};
    padding: ${mobileSpacing.md};
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${mobileSpacing.sm};
    border-top: 1px solid ${mobileColors.surface.border};
  `,
  Button: styled.button`
    ${mobileMixins.touchTarget};
    border-radius: ${mobileBorderRadius.lg};
    border: 1px solid ${mobileColors.surface.border};
    background: ${mobileColors.surface.card};
    color: ${mobileColors.neutral.gray900};
    font-weight: 600;
  `,
  PrimaryButton: styled.button`
    ${mobileMixins.touchTarget};
    border-radius: ${mobileBorderRadius.lg};
    border: none;
    background: ${mobileColors.primary.main};
    color: white;
    font-weight: 700;
  `
};