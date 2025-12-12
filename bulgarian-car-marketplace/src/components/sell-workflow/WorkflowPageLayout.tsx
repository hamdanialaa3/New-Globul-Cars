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
  /* ✅ STANDARD: Same width for all pages */
  width: 100%;
  max-width: ${({ $isMobile }) => ($isMobile ? '100%' : '1200px')};
  margin: 0 auto;
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
  /* ✅ STANDARD: Consistent content wrapper */
  background: ${({ $isMobile }) => ($isMobile ? 'transparent' : 'var(--bg-primary, #ffffff)')};
  border-radius: ${({ $isMobile }) => ($isMobile ? '0' : '20px')};
  padding: ${({ $isMobile }) => ($isMobile ? '0' : '2rem')};
  
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
  /* ✅ STANDARD: Consistent content area */
  background: var(--bg-card, #ffffff);
  border-radius: ${({ $isMobile }) => ($isMobile ? '12px' : '20px')};
  padding: ${({ $isMobile }) => ($isMobile ? '1.5rem' : '2.5rem')};
  box-shadow: ${({ $isMobile }) => 
    $isMobile 
      ? '0 2px 8px rgba(0, 0, 0, 0.08)' 
      : '0 4px 16px rgba(0, 0, 0, 0.1)'};
  border: 1px solid var(--border, #e0e0e0);
  
  /* ✅ FIX: Consistent height */
  min-height: 400px;
  max-height: 800px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border, #e0e0e0);
    border-radius: 4px;
    transition: background 0.2s ease;
    
    &:hover {
      background: var(--text-tertiary, #999999);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    min-height: 300px;
    max-height: 600px;
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
