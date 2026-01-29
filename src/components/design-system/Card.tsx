// ═══════════════════════════════════════════════════════════════════════════
// 🎴 Design System - Card Component
// نظام التصميم - مكون البطاقة
// 
// Philosophy: Flexible, Composable, Semantic Card Container
// المبدأ: بطاقة مرنة، قابلة للتركيب، دلالية
// 
// Created: December 7, 2025
// Based on: Material Design 3.0 + Apple Human Interface Guidelines
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import styled, { css } from 'styled-components';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 TYPE DEFINITIONS - تعريفات الأنواع
// ═══════════════════════════════════════════════════════════════════════════

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  
  /** Padding inside card */
  padding?: CardPadding;
  
  /** Enable hover effect */
  hoverable?: boolean;
  
  /** Clickable card (adds pointer cursor) */
  clickable?: boolean;
  
  /** Full width card */
  fullWidth?: boolean;
  
  /** Children components */
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 STYLED COMPONENTS - مكونات منمقة
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Variant Styles - أنماط المتغيرات
// ─────────────────────────────────────────────────────────────────────────
const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.surface.card};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    box-shadow: ${({ theme }) => theme.shadows.card};
  `,
  
  elevated: css`
    background: ${({ theme }) => theme.colors.surface.elevated};
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.md};
  `,
  
  outlined: css`
    background: ${({ theme }) => theme.colors.surface.card};
    border: 2px solid ${({ theme }) => theme.colors.border.medium};
    box-shadow: none;
  `,
  
  filled: css`
    background: ${({ theme }) => theme.colors.surface.hover};
    border: none;
    box-shadow: none;
  `,
};

// ─────────────────────────────────────────────────────────────────────────
// Padding Styles - أنماط الحشو
// ─────────────────────────────────────────────────────────────────────────
const paddingStyles = {
  none: css`
    padding: 0;
  `,
  
  sm: css`
    padding: ${({ theme }) => theme.spacing.sm};
  `,
  
  md: css`
    padding: ${({ theme }) => theme.spacing.md};
  `,
  
  lg: css`
    padding: ${({ theme }) => theme.spacing.lg};
  `,
};

// ─────────────────────────────────────────────────────────────────────────
// Main Card Component - مكون البطاقة الرئيسي
// ─────────────────────────────────────────────────────────────────────────
const StyledCard = styled.div<{
  $variant: CardVariant;
  $padding: CardPadding;
  $hoverable: boolean;
  $clickable: boolean;
  $fullWidth: boolean;
}>`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  transition: all 0.2s ease-in-out;
  
  /* Apply variant styles */
  ${({ $variant }) => variantStyles[$variant]}
  
  /* Apply padding styles */
  ${({ $padding }) => paddingStyles[$padding]}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Clickable */
  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
  `}
  
  /* Hoverable effect */
  ${({ $hoverable, theme }) => $hoverable && css`
    &:hover {
      box-shadow: ${theme.shadows.hover};
      transform: translateY(-2px);
    }
  `}
  
  /* Focus state (for clickable cards) */
  ${({ $clickable, theme }) => $clickable && css`
    &:focus-visible {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
    }
  `}
`;

// ─────────────────────────────────────────────────────────────────────────
// Card Header - رأس البطاقة
// ─────────────────────────────────────────────────────────────────────────
const StyledCardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.content.heading};
  }
`;

// ─────────────────────────────────────────────────────────────────────────
// Card Body - جسم البطاقة
// ─────────────────────────────────────────────────────────────────────────
const StyledCardBody = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.content.primary};
`;

// ─────────────────────────────────────────────────────────────────────────
// Card Footer - تذييل البطاقة
// ─────────────────────────────────────────────────────────────────────────
const StyledCardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CARD COMPONENT - مكون البطاقة
// ═══════════════════════════════════════════════════════════════════════════

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  fullWidth = false,
  children,
  ...rest
}) => {
  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $hoverable={hoverable}
      $clickable={clickable}
      $fullWidth={fullWidth}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      {...rest}
    >
      {children}
    </StyledCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CARD SUB-COMPONENTS - المكونات الفرعية للبطاقة
// ═══════════════════════════════════════════════════════════════════════════

export const CardHeader: React.FC<CardHeaderProps> = ({ children, ...rest }) => {
  return <StyledCardHeader {...rest}>{children}</StyledCardHeader>;
};

export const CardBody: React.FC<CardBodyProps> = ({ children, ...rest }) => {
  return <StyledCardBody {...rest}>{children}</StyledCardBody>;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, ...rest }) => {
  return <StyledCardFooter {...rest}>{children}</StyledCardFooter>;
};

// ═══════════════════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLES - أمثلة الاستخدام
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ BASIC USAGE:
────────────────
import { Card, CardHeader, CardBody, CardFooter } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>This is the card content. You can put anything here.</p>
  </CardBody>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>


2️⃣ VARIANTS:
──────────────
<Card variant="default">Default Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="outlined">Outlined Card</Card>
<Card variant="filled">Filled Card</Card>


3️⃣ HOVERABLE CARD:
────────────────────
<Card hoverable>
  <CardBody>Hover over me!</CardBody>
</Card>


4️⃣ CLICKABLE CARD:
────────────────────
<Card clickable onClick={() => alert('Card clicked!')}>
  <CardBody>Click me!</CardBody>
</Card>


5️⃣ FULL WIDTH:
────────────────
<Card fullWidth>
  <CardBody>This card spans the full width</CardBody>
</Card>


6️⃣ CUSTOM PADDING:
────────────────────
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>


7️⃣ CAR LISTING CARD (Real Example):
─────────────────────────────────────
import { Card, CardHeader, CardBody, CardFooter } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

<Card variant="elevated" hoverable>
  <CardHeader>
    <h3>BMW 320d 2020</h3>
    <p>София, България</p>
  </CardHeader>
  
  <CardBody>
    <img src="/car.jpg" alt="BMW 320d" />
    <ul>
      <li>150,000 км</li>
      <li>Дизел</li>
      <li>Автоматик</li>
    </ul>
  </CardBody>
  
  <CardFooter>
    <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>€15,000</span>
    <Button variant="primary">Виж детайли</Button>
  </CardFooter>
</Card>


8️⃣ PROFILE CARD (Real Example):
─────────────────────────────────
<Card variant="outlined" fullWidth>
  <CardHeader>
    <h4>User Profile</h4>
  </CardHeader>
  
  <CardBody>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <img 
        src="/avatar.jpg" 
        alt="User" 
        style={{ width: 64, height: 64, borderRadius: '50%' }}
      />
      <div>
        <h5>Иван Петров</h5>
        <p>ivan@example.com</p>
        <p>Частно лице • София</p>
      </div>
    </div>
  </CardBody>
  
  <CardFooter>
    <Button variant="outline">Edit Profile</Button>
  </CardFooter>
</Card>


9️⃣ EMPTY STATE CARD:
──────────────────────
<Card variant="filled" padding="lg">
  <CardBody style={{ textAlign: 'center', padding: '2rem' }}>
    <h4>No results found</h4>
    <p>Try adjusting your filters</p>
    <Button style={{ marginTop: '1rem' }}>Clear Filters</Button>
  </CardBody>
</Card>

*/

// ═══════════════════════════════════════════════════════════════════════════
// ✅ DESIGN PRINCIPLES:
// مبادئ التصميم:
// 
// 1. Composability - قابلية التركيب (Header, Body, Footer)
// 2. Flexibility - مرونة (4 variants, 4 padding sizes)
// 3. Accessibility - إمكانية الوصول (tabIndex, role, focus states)
// 4. Semantic HTML - HTML دلالي (div with proper roles)
// 5. Visual Hierarchy - تسلسل بصري (shadows, borders, spacing)
// 6. Interaction States - حالات التفاعل (hover, click, focus)
// 7. Responsive - متجاوب (fullWidth option)
// ═══════════════════════════════════════════════════════════════════════════
