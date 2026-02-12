// Styles for MobileSubmissionPage
import styled from 'styled-components';
import { css } from 'styled-components';
import { mobileSpacing, mobileTypography, mobileBorderRadius, mobileMixins, mobileAnimations } from '../../../styles/mobile-design-system';
// Button pattern
const buttonPattern = css `
  min-height: 48px;
  padding: 12px 20px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
`;
export const S = {
    Container: styled.div `
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    ${mobileMixins.safeAreaPadding};
  `,
    Content: styled.div `
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${mobileSpacing.xl};
    text-align: center;
  `,
    LoadingSpinner: styled.div `
    width: 64px;
    height: 64px;
    border: 4px solid var(--border-primary);
    border-top-color: var(--accent-primary);
    border-radius: ${mobileBorderRadius.full};
    animation: spin 1s linear infinite;
    margin-bottom: ${mobileSpacing.lg};

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
    SuccessIcon: styled.div `
    width: 80px;
    height: 80px;
    border-radius: ${mobileBorderRadius.full};
    background: var(--bg-success);
    ${mobileMixins.flexCenter};
    margin: 0 auto ${mobileSpacing.lg};
    font-size: 40px;
    color: var(--text-success);
  `,
    ErrorIcon: styled.div `
    width: 80px;
    height: 80px;
    border-radius: ${mobileBorderRadius.full};
    background: var(--bg-error);
    ${mobileMixins.flexCenter};
    margin: 0 auto ${mobileSpacing.lg};
    font-size: 40px;
    color: var(--text-error);
  `,
    Title: styled.h1 `
    font-size: ${mobileTypography.h2.fontSize};
    line-height: ${mobileTypography.h2.lineHeight};
    font-weight: ${mobileTypography.h2.fontWeight};
    color: var(--text-primary);
    margin: 0 0 ${mobileSpacing.sm};
  `,
    Message: styled.p `
    font-size: ${mobileTypography.bodyLarge.fontSize};
    line-height: ${mobileTypography.bodyLarge.lineHeight};
    color: var(--text-secondary);
    margin: 0 0 ${mobileSpacing.xl};
  `,
    Actions: styled.div `
    display: flex;
    flex-direction: column;
    gap: ${mobileSpacing.sm};
    width: 100%;
    max-width: 400px;
  `,
    PrimaryButton: styled.button `
    ${mobileMixins.touchTarget};
    ${buttonPattern}
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: ${mobileBorderRadius.lg};
    font-weight: 700;
    transition: ${mobileAnimations.transitions.default};

    &:active {
      background: var(--accent-secondary);
    }
  `,
    SecondaryButton: styled.button `
    ${mobileMixins.touchTarget};
    ${buttonPattern}
    background: transparent;
    color: var(--accent-primary);
    border: 2px solid var(--accent-primary);
    border-radius: ${mobileBorderRadius.lg};
    font-weight: 600;
    transition: ${mobileAnimations.transitions.default};

    &:active {
      background: var(--accent-secondary);
    }
  `
};
