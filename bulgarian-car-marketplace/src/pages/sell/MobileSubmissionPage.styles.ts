// Styles for MobileSubmissionPage
import styled from 'styled-components';
import { css } from 'styled-components';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileMixins,
  mobileAnimations
} from '../../styles/mobile-design-system';

// Button pattern
const buttonPattern = css`
  min-height: 48px;
  padding: 12px 20px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
`;

export const S = {
  Container: styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${mobileColors.surface.background};
    ${mobileMixins.safeAreaPadding};
  `,
  Content: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${mobileSpacing.xl};
    text-align: center;
  `,
  LoadingSpinner: styled.div`
    width: 64px;
    height: 64px;
    border: 4px solid ${mobileColors.neutral.gray200};
    border-top-color: ${mobileColors.primary.main};
    border-radius: ${mobileBorderRadius.full};
    animation: spin 1s linear infinite;
    margin-bottom: ${mobileSpacing.lg};

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  SuccessIcon: styled.div`
    width: 80px;
    height: 80px;
    border-radius: ${mobileBorderRadius.full};
    background: ${mobileColors.success.light};
    ${mobileMixins.flexCenter};
    margin: 0 auto ${mobileSpacing.lg};
    font-size: 40px;
    color: ${mobileColors.success.main};
  `,
  ErrorIcon: styled.div`
    width: 80px;
    height: 80px;
    border-radius: ${mobileBorderRadius.full};
    background: ${mobileColors.error.light};
    ${mobileMixins.flexCenter};
    margin: 0 auto ${mobileSpacing.lg};
    font-size: 40px;
    color: ${mobileColors.error.main};
  `,
  Title: styled.h1`
    font-size: ${mobileTypography.h2.fontSize};
    line-height: ${mobileTypography.h2.lineHeight};
    font-weight: ${mobileTypography.h2.fontWeight};
    color: ${mobileColors.neutral.gray900};
    margin: 0 0 ${mobileSpacing.sm};
  `,
  Message: styled.p`
    font-size: ${mobileTypography.bodyLarge.fontSize};
    line-height: ${mobileTypography.bodyLarge.lineHeight};
    color: ${mobileColors.neutral.gray600};
    margin: 0 0 ${mobileSpacing.xl};
  `,
  Actions: styled.div`
    display: flex;
    flex-direction: column;
    gap: ${mobileSpacing.sm};
    width: 100%;
    max-width: 400px;
  `,
  PrimaryButton: styled.button`
    ${mobileMixins.touchTarget};
    ${buttonPattern}
    background: ${mobileColors.primary.main};
    color: white;
    border: none;
    border-radius: ${mobileBorderRadius.lg};
    font-weight: 700;
    transition: ${mobileAnimations.transitions.default};

    &:active {
      background: ${mobileColors.primary.dark};
    }
  `,
  SecondaryButton: styled.button`
    ${mobileMixins.touchTarget};
    ${buttonPattern}
    background: transparent;
    color: ${mobileColors.primary.main};
    border: 2px solid ${mobileColors.primary.main};
    border-radius: ${mobileBorderRadius.lg};
    font-weight: 600;
    transition: ${mobileAnimations.transitions.default};

    &:active {
      background: ${mobileColors.primary.pale};
    }
  `
};
