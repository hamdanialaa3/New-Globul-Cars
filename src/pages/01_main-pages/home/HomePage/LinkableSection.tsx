/**
 * LinkableSection.tsx
 * Wrapper component for HomePage sections with "View All" link
 * 
 * Features:
 * - Professional container with modern design
 * - "View All" button that navigates to dedicated page
 * - Bilingual support (Arabic/English)
 * - Glassmorphism design
 * - Responsive layout
 */

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';

// ============================================================================
// TYPES
// ============================================================================

interface LinkableSectionProps {
  title: string;
  titleAr?: string;
  viewAllLink: string;
  viewAllText?: string;
  viewAllTextAr?: string;
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SectionContainer = styled.section`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  /* 🟣 Light purple border */
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.02);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(37, 99, 235, 0.25);
    background: rgba(37, 99, 235, 0.04);
    box-shadow: inset 0 0 12px rgba(37, 99, 235, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
  
  background: var(--btn-primary-bg);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ViewAllButton = styled.button<{ $isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  background: rgba(37, 99, 235, 0.1);
  border: 2px solid var(--primary-color, #2563EB);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Icon animation direction based on RTL */
  ${props => props.$isRTL && `
    flex-direction: row-reverse;
  `}
  
  &:hover {
    background: var(--primary-color, #2563EB);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 20px;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: ${props => props.$isRTL ? 'translateX(-4px)' : 'translateX(4px)'};
  }
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 14px;
    min-height: 48px;
    
    svg {
      font-size: 18px;
    }
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

// ============================================================================
// COMPONENT
// ============================================================================

const LinkableSection: React.FC<LinkableSectionProps> = ({
  title,
  titleAr,
  viewAllLink,
  viewAllText,
  viewAllTextAr,
  children,
  className
}) => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';
  
  // Determine display texts
  const displayTitle = isRTL && titleAr ? titleAr : title;
  const displayViewAllText = isRTL && viewAllTextAr ? viewAllTextAr : (viewAllText || 'View All');
  
  const handleViewAllClick = () => {
    navigate(viewAllLink);
  };
  
  return (
    <SectionContainer className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <SectionHeader>
        <SectionTitle>{displayTitle}</SectionTitle>
        <ViewAllButton 
          onClick={handleViewAllClick}
          $isRTL={isRTL}
          aria-label={displayViewAllText}
        >
          <span>{displayViewAllText}</span>
          {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
        </ViewAllButton>
      </SectionHeader>
      
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </SectionContainer>
  );
};

export default LinkableSection;

