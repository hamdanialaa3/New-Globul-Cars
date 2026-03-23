/**
 * HomePageLayout.tsx
 * 
 * Компонент за оформление на началната страница
 * HomePage Layout Component - Main layout wrapper for homepage
 * يتحكم في ترتيب الأقسام ويوفر نقطة واحدة لإدارة تدفق الصفحة
 * 
 * @purpose توحيد ترتيب الأقسام وتحسين إعادة استخدام المكونات
 * @architecture تقسيم الصفحة إلى 8 أقسام رئيسية منطقية
 * @performance lazy loading للأقسام الثقيلة
 */

import React, { Suspense, ReactNode } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';

import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const LayoutContainer = styled.main`
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  /* Performance optimizations */
  will-change: auto;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout style paint;
`;

const SectionWrapper = styled.section<{ $spacing?: 'small' | 'medium' | 'large' }>`
  width: 100%;
  padding: ${props => {
    switch (props.$spacing) {
      case 'small': return '20px 0';
      case 'large': return '60px 0';
      default: return '40px 0';
    }
  }};

  @media (max-width: 768px) {
    padding: ${props => {
      switch (props.$spacing) {
        case 'small': return '12px 0';
        case 'large': return '32px 0';
        default: return '24px 0';
      }
    }};
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background: var(--btn-primary-bg);
  opacity: 0.3;
  margin: 20px 0;
`;

// ============================================================================
// LOADING FALLBACK
// ============================================================================

const LoadingFallback = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 8px;
  margin: 20px;
  border: 1px solid var(--border-primary);
  font-size: 0.95rem;
  font-weight: 500;
`;

// ============================================================================
// TYPES
// ============================================================================

interface Section {
  id: string;
  component: ReactNode;
  spacing?: 'small' | 'medium' | 'large';
  showDivider?: boolean;
  lazy?: boolean;
}

interface HomePageLayoutProps {
  sections: Section[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HomePageLayout
 * 
 * المسؤوليات:
 * 1. عرض الأقسام بالترتيب الصحيح
 * 2. إدارة spacing بين الأقسام
 * 3. توفير lazy loading اختياري
 * 4. توحيد visual dividers
 * 
 * الفائدة:
 * - تغيير ترتيب الأقسام بسهولة من prop واحد
 * - إعادة استخدام logic التصميم
 * - أداء أفضل مع lazy loading
 */
const HomePageLayout: React.FC<HomePageLayoutProps> = ({ sections }) => {
  const { t } = useLanguage();
  return (
    <LayoutContainer>
      {sections.map((section, index) => (
        <React.Fragment key={section.id}>
          <SectionWrapper $spacing={section.spacing || 'medium'}>
            {section.lazy ? (
              <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
                {section.component}
              </Suspense>
            ) : (
              section.component
            )}
          </SectionWrapper>
          
          {section.showDivider && index < sections.length - 1 && (
            <SectionDivider />
          )}
        </React.Fragment>
      ))}
    </LayoutContainer>
  );
};

export default React.memo(HomePageLayout);
