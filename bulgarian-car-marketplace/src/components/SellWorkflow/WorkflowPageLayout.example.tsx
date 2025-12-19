/**
 * ✅ EXAMPLE: How to use WorkflowPageLayout in sell workflow pages
 * 
 * This file demonstrates the conversion from old layout to new unified layout
 * Created: December 11, 2025
 */

import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import { WorkflowPageLayout } from '../../../components/SellWorkflow/WorkflowPageLayout';
import { SellProgressBar } from '../../../components/SellWorkflow';
import styled from 'styled-components';

// ============================================================================
// BEFORE (Old inconsistent layout)
// ============================================================================

const OldExamplePage: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <OldContainer>
      {/* ❌ Different max-width per page (600px, 800px, 1200px, 1400px) */}
      <OldContent maxWidth="1400px">
        <OldHeader>
          {/* ❌ Different padding per page */}
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
            {t('sell.vehicleData.title')}
          </h1>
        </OldHeader>

        {/* ❌ Inconsistent content area */}
        <OldMainContent padding={isMobile ? '1rem' : '2rem'}>
          <p>Form fields here...</p>
        </OldMainContent>

        {/* ❌ Different button layouts per page */}
        <OldActions>
          <button>Back</button>
          <button>Next</button>
        </OldActions>
      </OldContent>
    </OldContainer>
  );
};

// ❌ OLD STYLES - Inconsistent across pages
const OldContainer = styled.div`
  width: 100%;
  padding: 1.5rem; /* Different per page */
`;

const OldContent = styled.div<{ maxWidth: string }>`
  max-width: ${props => props.maxWidth}; /* PROBLEM: Varies per page */
  margin: 0 auto;
`;

const OldHeader = styled.div`
  margin-bottom: 1.5rem; /* Different per page */
`;

const OldMainContent = styled.div<{ padding: string }>`
  padding: ${props => props.padding}; /* PROBLEM: Varies per page */
  min-height: 300px; /* PROBLEM: Different per page */
`;

const OldActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem; /* Different per page */
`;

// ============================================================================
// AFTER (New unified layout)
// ============================================================================

const NewExamplePage: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // ✅ Define content sections
  const progressBar = <SellProgressBar currentStep="vehicle-data" />;

  const pageContent = (
    <ContentGrid>
      <FormSection>
        <Label>{t('sell.vehicleData.make')}</Label>
        <Input type="text" placeholder="Mercedes-Benz" />
      </FormSection>

      <FormSection>
        <Label>{t('sell.vehicleData.model')}</Label>
        <Input type="text" placeholder="C-Class" />
      </FormSection>

      {/* Add more form fields... */}
    </ContentGrid>
  );

  const navigation = (
    <NavigationButtons>
      <BackButton>
        ← {t('common.back')}
      </BackButton>
      <NextButton>
        {t('common.next')} →
      </NextButton>
    </NavigationButtons>
  );

  // ✅ UNIFIED LAYOUT - Same structure for all pages
  return (
    <WorkflowPageLayout
      progressBar={progressBar}
      title={t('sell.vehicleData.title')}
      subtitle={t('sell.vehicleData.subtitle')}
      isMobile={isMobile}
    >
      {pageContent}
      {navigation}
    </WorkflowPageLayout>
  );
};

// ✅ NEW STYLES - Only page-specific styles, layout handled by WorkflowPageLayout
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-secondary);
  }
`;

const NextButton = styled.button`
  padding: 1rem 2rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-dark);
  }
`;

// ============================================================================
// BENEFITS SUMMARY
// ============================================================================

/**
 * ✅ BENEFITS OF NEW LAYOUT:
 * 
 * 1. **Consistency**
 *    - Same max-width (1200px) across all pages
 *    - Same padding (2rem desktop, 1.5rem mobile)
 *    - Same min-height (400px)
 * 
 * 2. **Maintainability**
 *    - Layout logic in ONE place (WorkflowPageLayout)
 *    - Pages only contain business logic
 *    - Easy to update design system-wide
 * 
 * 3. **Responsiveness**
 *    - Built-in mobile support
 *    - Automatic responsive adjustments
 *    - No need to duplicate mobile/desktop code
 * 
 * 4. **Performance**
 *    - Smaller component files
 *    - Reusable styled components
 *    - Better code splitting
 * 
 * 5. **Developer Experience**
 *    - Simple prop-based API
 *    - TypeScript support
 *    - Clear component boundaries
 */

export { OldExamplePage, NewExamplePage };
export default NewExamplePage;
