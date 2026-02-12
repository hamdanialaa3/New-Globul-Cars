// Professional Typography System - Global Standards
// نظام الطباعة الاحترافي - معايير عالمية
// Inspired by: Mobile.de, AutoScout24, Cars.com

import { css } from 'styled-components';

// ==================== BASE CONFIGURATION ====================

export const TYPOGRAPHY_CONFIG = {
  // Base font size (always 16px for accessibility)
  baseFontSize: '16px',
  
  // Font families
  fontFamily: {
    primary: "'Inter', 'Segoe UI', 'Arial', sans-serif",
    secondary: "'Helvetica Neue', 'Arial', sans-serif",
    monospace: "'JetBrains Mono', 'Courier New', monospace"
  },
  
  // Font sizes - Using rem for scalability
  fontSize: {
    // Micro (for very small labels only)
    micro: '0.625rem',    // 10px - Toggle labels, badges
    
    // Extra Small
    xs: '0.75rem',        // 12px - Hints, captions, footnotes
    
    // Small
    sm: '0.875rem',       // 14px - Form labels, small buttons, nav items
    
    // Base (default body text)
    base: '1rem',         // 16px - Body text, inputs, standard buttons
    
    // Medium
    md: '0.938rem',       // 15px - Navigation links
    
    // Large
    lg: '1.125rem',       // 18px - Large body text, subtitles
    
    // Extra Large
    xl: '1.25rem',        // 20px - H3, card titles
    
    // 2X Large
    '2xl': '1.5rem',      // 24px - H2, section headers
    
    // 3X Large
    '3xl': '1.75rem',     // 28px - H1, page titles
    
    // 4X Large
    '4xl': '2rem',        // 32px - Hero titles (rare use)
    
    // 5X Large
    '5xl': '2.5rem',      // 40px - Landing page heroes only
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,           // Headings
    snug: 1.4,            // Dense content
    normal: 1.6,          // Body text (most comfortable)
    relaxed: 1.8,         // Long-form content
    loose: 2.0            // Very spacious
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// ==================== HEADING STYLES ====================

export const H1Style = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize['3xl']};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.bold};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.tight};
  color: #2c3e50;
  letter-spacing: ${TYPOGRAPHY_CONFIG.letterSpacing.tight};
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: ${TYPOGRAPHY_CONFIG.fontSize['2xl']};
  }
  
  @media (max-width: 480px) {
    font-size: ${TYPOGRAPHY_CONFIG.fontSize.xl};
  }
`;

export const H2Style = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.tight};
  color: #2c3e50;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: ${TYPOGRAPHY_CONFIG.fontSize.xl};
  }
`;

export const H3Style = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.xl};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.snug};
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

export const H4Style = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.lg};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.snug};
  color: #2c3e50;
`;

// ==================== TEXT STYLES ====================

export const BodyTextStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.base};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.normal};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.normal};
  color: #495057;
`;

export const SubtitleStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.base};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.normal};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.normal};
  color: #7f8c8d;
`;

export const LabelStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.sm};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.snug};
  color: #495057;
`;

export const HintTextStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.xs};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.normal};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.snug};
  color: #6c757d;
`;

export const MicroTextStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.micro};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.bold};
  line-height: ${TYPOGRAPHY_CONFIG.lineHeight.tight};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY_CONFIG.letterSpacing.wide};
`;

// ==================== BUTTON STYLES ====================

export const ButtonTextStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.base};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: 1;
`;

export const ButtonSmallTextStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.sm};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: 1;
`;

export const ButtonLargeTextStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.lg};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: 1;
`;

// ==================== NAVIGATION STYLES ====================

export const NavLinkStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.md};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.medium};
  line-height: 1.5;
`;

export const MenuItemStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.sm};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.medium};
  line-height: 1.5;
`;

export const SectionTitleStyle = css`
  font-size: ${TYPOGRAPHY_CONFIG.fontSize.xs};
  font-weight: ${TYPOGRAPHY_CONFIG.fontWeight.semibold};
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY_CONFIG.letterSpacing.wider};
  color: #6c757d;
`;

// ==================== UTILITY MIXINS ====================

export const truncateText = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const clampLines = (lines: number) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// ==================== RESPONSIVE TEXT ====================

export const responsiveText = (
  desktop: string,
  tablet?: string,
  mobile?: string
) => css`
  font-size: ${desktop};
  
  ${tablet && css`
    @media (max-width: 768px) {
      font-size: ${tablet};
    }
  `}
  
  ${mobile && css`
    @media (max-width: 480px) {
      font-size: ${mobile};
    }
  `}
`;

// ==================== EXPORT ALL ====================

export default TYPOGRAPHY_CONFIG;

