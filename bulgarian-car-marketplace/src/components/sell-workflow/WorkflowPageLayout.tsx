import React, { ReactNode } from 'react';
import styled from 'styled-components';

/**
 * ✅ P0-6: Unified Workflow Page Layout Component
 * 
 * Purpose: Standardize layout across all sell workflow pages
 * - Consistent max-width: 1200px
 * - Consistent padding: 2rem (desktop), 1.5rem (mobile)
 * - Consistent min-height: 400px
 * - Responsive design with mobile-first approach
 * 
 * Created: December 11, 2025
 * Resolves: P0-6 Page Layout Consistency
 */

interface WorkflowPageLayoutProps {
  /** Show progress bar section */
  progressBar?: ReactNode;
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Main content area */
  children: ReactNode;
  /** Navigation buttons (back, next, etc.) */
  navigation: ReactNode;
  /** Is mobile view */
  isMobile?: boolean;
  /** Custom className for styling overrides */
  className?: string;
}

export const WorkflowPageLayout: React.FC<WorkflowPageLayoutProps> = ({
  progressBar,
  title,
  subtitle,
  children,
  navigation,
  isMobile = false,
  className,
}) => {
  return (
    <PageContainer $isMobile={isMobile} className={className}>
      {progressBar && <ProgressSection>{progressBar}</ProgressSection>}

      <ContentWrapper $isMobile={isMobile}>
        <HeaderSection $isMobile={isMobile}>
          <PageTitle $isMobile={isMobile}>{title}</PageTitle>
          {subtitle && <PageSubtitle $isMobile={isMobile}>{subtitle}</PageSubtitle>}
        </HeaderSection>

        <ContentSection $isMobile={isMobile}>{children}</ContentSection>

        <NavigationSection>{navigation}</NavigationSection>
      </ContentWrapper>
    </PageContainer>
  );
};

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled.div<{ $isMobile: boolean }>`
  /* ✅ Removed max-width restriction - content can use full width */
  width: 100%;
  margin: 0;
  padding: ${({ $isMobile }) => ($isMobile ? '1rem' : '2rem')};
  
  /* ✅ FIX: Prevent horizontal overflow */
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const ContentWrapper = styled.main<{ $isMobile: boolean }>`
  /* ✅ Removed frame - transparent background, no borders */
  background: transparent;
  border-radius: 0;
  padding: ${({ $isMobile }) => ($isMobile ? '0' : '0')};
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const HeaderSection = styled.header<{ $isMobile: boolean }>`
  margin-bottom: ${({ $isMobile }) => ($isMobile ? '1.5rem' : '2rem')};
  text-align: ${({ $isMobile }) => ($isMobile ? 'center' : 'left')};
`;

const PageTitle = styled.h1<{ $isMobile: boolean }>`
  font-size: ${({ $isMobile }) => ($isMobile ? '1.75rem' : '2.25rem')};
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  font-family: 'Martica', 'Arial', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageSubtitle = styled.p<{ $isMobile: boolean }>`
  font-size: ${({ $isMobile }) => ($isMobile ? '0.95rem' : '1rem')};
  color: var(--text-secondary, #666666);
  margin: 0;
  line-height: 1.5;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const ContentSection = styled.div<{ $isMobile: boolean }>`
  /* ✅ Removed frame restrictions - transparent background, no borders, no height limits */
  background: transparent;
  border-radius: 0;
  padding: ${({ $isMobile }) => ($isMobile ? '1.5rem' : '2.5rem')};
  box-shadow: none;
  border: none;
  
  /* ✅ Removed height restrictions - content can grow naturally */
  min-height: auto;
  max-height: none;
  overflow-y: visible;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const NavigationSection = styled.nav`
  /* ✅ STANDARD: Same button layout for all pages */
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
    
    /* Mobile: Full-width buttons */
    > * {
      width: 100%;
    }
  }
`;

// ============================================================================
// Export default
// ============================================================================

export default WorkflowPageLayout;
