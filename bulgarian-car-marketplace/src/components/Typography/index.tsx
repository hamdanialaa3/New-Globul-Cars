// Typography Components - Reusable Text Components
// مكونات النصوص الموحدة للاستخدام عبر التطبيق

import styled, { css } from 'styled-components';

// Base Typography Styles
const baseTextStyles = css`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Heading 1 - Page Titles
export const H1 = styled.h1`
  ${baseTextStyles}
  font-size: 2rem;           // 32px desktop
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;      // 28px tablet
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;       // 24px mobile
  }
`;

// Heading 2 - Section Titles
export const H2 = styled.h2`
  ${baseTextStyles}
  font-size: 1.75rem;        // 28px desktop
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  letter-spacing: -0.025em;
  margin-bottom: 0.875rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;       // 24px tablet
  }
  
  @media (max-width: 480px) {
    font-size: 1.375rem;     // 22px mobile
  }
`;

// Heading 3 - Subsection Titles
export const H3 = styled.h3`
  ${baseTextStyles}
  font-size: 1.5rem;         // 24px desktop
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 1.375rem;     // 22px tablet
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;      // 20px mobile
  }
`;

// Heading 4 - Card Titles
export const H4 = styled.h4`
  ${baseTextStyles}
  font-size: 1.25rem;        // 20px desktop
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;     // 18px tablet/mobile
  }
`;

// Heading 5 - Small Headings
export const H5 = styled.h5`
  ${baseTextStyles}
  font-size: 1.125rem;       // 18px desktop
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;         // 16px tablet/mobile
  }
`;

// Heading 6 - Micro Headings
export const H6 = styled.h6`
  ${baseTextStyles}
  font-size: 1rem;           // 16px
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.9375rem;    // 15px tablet/mobile
  }
`;

// Body Text Variants
export const BodyLarge = styled.p`
  ${baseTextStyles}
  font-size: 1.125rem;       // 18px
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: 1rem;
`;

export const Body = styled.p`
  ${baseTextStyles}
  font-size: 1rem;           // 16px - Perfect for readability
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-bottom: 1rem;
`;

export const BodySmall = styled.p`
  ${baseTextStyles}
  font-size: 0.875rem;       // 14px
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-bottom: 0.75rem;
`;

export const Caption = styled.p`
  ${baseTextStyles}
  font-size: 0.75rem;        // 12px
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

// Labels
export const Label = styled.label`
  ${baseTextStyles}
  display: block;
  font-size: 0.875rem;       // 14px
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  letter-spacing: 0.025em;
  margin-bottom: 0.375rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const SmallLabel = styled.label`
  ${baseTextStyles}
  display: block;
  font-size: 0.75rem;        // 12px
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Emphasized Text
export const Strong = styled.strong`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Bold = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

export const Italic = styled.em`
  font-style: italic;
`;

// Link Text
export const LinkText = styled.span`
  ${baseTextStyles}
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.dark};
    text-decoration: underline;
  }
`;

// Error Text
export const ErrorText = styled.span`
  ${baseTextStyles}
  font-size: 0.875rem;       // 14px
  color: ${({ theme }) => theme.colors.error.main};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-top: 0.25rem;
`;

// Success Text
export const SuccessText = styled.span`
  ${baseTextStyles}
  font-size: 0.875rem;       // 14px
  color: ${({ theme }) => theme.colors.success.main};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-top: 0.25rem;
`;

// Warning Text
export const WarningText = styled.span`
  ${baseTextStyles}
  font-size: 0.875rem;       // 14px
  color: ${({ theme }) => theme.colors.warning.main};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-top: 0.25rem;
`;

// Info Text
export const InfoText = styled.span`
  ${baseTextStyles}
  font-size: 0.875rem;       // 14px
  color: ${({ theme }) => theme.colors.info.main};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-top: 0.25rem;
`;

// Truncated Text (with ellipsis)
export const TruncatedText = styled.span<{ lines?: number }>`
  ${baseTextStyles}
  display: -webkit-box;
  -webkit-line-clamp: ${({ lines = 1 }) => lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Monospace Text (for codes, numbers)
export const Code = styled.code`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: 0.875em;
  background-color: ${({ theme }) => theme.colors.grey[100]};
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Price Text - Special formatting for car prices
export const PriceText = styled.span<{ size?: 'sm' | 'md' | 'lg' }>`
  ${baseTextStyles}
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return css`font-size: 1rem;`;
      case 'lg':
        return css`font-size: 1.5rem;`;
      default:
        return css`font-size: 1.25rem;`;
    }
  }}
`;

// Badge Text
export const BadgeText = styled.span<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
  ${baseTextStyles}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;        // 12px
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  white-space: nowrap;
  
  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background-color: ${theme.colors.grey[100]};
          color: ${theme.colors.text.secondary};
        `;
      case 'success':
        return css`
          background-color: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.warning.light};
          color: ${theme.colors.warning.dark};
        `;
      case 'error':
        return css`
          background-color: ${theme.colors.error.light};
          color: ${theme.colors.error.dark};
        `;
      default:
        return css`
          background-color: ${theme.colors.primary.light};
          color: ${theme.colors.primary.contrastText};
        `;
    }
  }}
`;

// Export all components
const Typography = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  BodyLarge,
  Body,
  BodySmall,
  Caption,
  Label,
  SmallLabel,
  Strong,
  Bold,
  Italic,
  LinkText,
  ErrorText,
  SuccessText,
  WarningText,
  InfoText,
  TruncatedText,
  Code,
  PriceText,
  BadgeText,
};

export default Typography;
