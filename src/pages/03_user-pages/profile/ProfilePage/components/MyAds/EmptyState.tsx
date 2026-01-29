// EmptyState.tsx
// Beautiful empty state with SVG illustration

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Car, Plus } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';

interface EmptyStateProps {
  isOwnProfile: boolean;
  onAddNew: () => void;
  isDark?: boolean;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

const EmptyContainer = styled(motion.div)<{ $isDark?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: ${({ $isDark }) => $isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 24px;
  border: 2px dashed ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  min-height: 400px;

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    min-height: 300px;
  }
`;

const IconContainer = styled(motion.div)<{ $isDark?: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ $isDark }) => $isDark ? 'rgba(255, 143, 16, 0.1)' : 'rgba(255, 143, 16, 0.05)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;

  svg {
    width: 64px;
    height: 64px;
    color: #ff8f10;
  }
`;

const Title = styled.h2<{ $isDark?: boolean }>`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  margin: 0 0 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p<{ $isDark?: boolean }>`
  font-size: 1.125rem;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : '#64748b'};
  margin: 0 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled(motion.button)<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #ff8f10;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover {
    background: #ff7900;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ClearFiltersButton = styled.button<{ $isDark?: boolean }>`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : '#64748b'};
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    border-color: #ff8f10;
    color: #ff8f10;
  }
`;

// SVG Car Illustration Component
const CarIllustration: React.FC = () => (
  <svg
    width="200"
    height="150"
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Car Body */}
    <rect x="30" y="70" width="140" height="50" rx="8" fill="#ff8f10" opacity="0.2" />
    <rect x="40" y="80" width="120" height="30" rx="6" fill="#ff8f10" />
    
    {/* Windows */}
    <rect x="50" y="85" width="35" height="20" rx="2" fill="#ffffff" opacity="0.3" />
    <rect x="95" y="85" width="35" height="20" rx="2" fill="#ffffff" opacity="0.3" />
    
    {/* Wheels */}
    <circle cx="60" cy="120" r="12" fill="#1e293b" />
    <circle cx="60" cy="120" r="8" fill="#64748b" />
    <circle cx="140" cy="120" r="12" fill="#1e293b" />
    <circle cx="140" cy="120" r="8" fill="#64748b" />
    
    {/* Headlights */}
    <circle cx="165" cy="95" r="6" fill="#fbbf24" />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  isOwnProfile,
  onAddNew,
  isDark = false,
  isFiltered = false,
  onClearFilters
}) => {
  const { language } = useLanguage();

  if (isFiltered) {
    return (
      <EmptyContainer
        $isDark={isDark}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <IconContainer $isDark={isDark}>
          <Car size={64} />
        </IconContainer>
        <Title $isDark={isDark}>
          {language === 'bg' ? 'Няма резултати' : 'No Results'}
        </Title>
        <Subtitle $isDark={isDark}>
          {language === 'bg' 
            ? 'Няма обяви, които отговарят на избраните филтри. Опитайте да промените критериите за търсене.'
            : 'No listings match the selected filters. Try adjusting your search criteria.'}
        </Subtitle>
        {onClearFilters && (
          <ClearFiltersButton $isDark={isDark} onClick={onClearFilters}>
            {language === 'bg' ? 'Изчисти филтрите' : 'Clear Filters'}
          </ClearFiltersButton>
        )}
      </EmptyContainer>
    );
  }

  return (
    <EmptyContainer
      $isDark={isDark}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <IconContainer
        $isDark={isDark}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CarIllustration />
      </IconContainer>
      <Title $isDark={isDark}>
        {language === 'bg' ? 'Все още нямате обяви' : 'No Listings Yet'}
      </Title>
      <Subtitle $isDark={isDark}>
        {language === 'bg'
          ? 'Започнете да продавате своя автомобил днес! Създайте първата си обява и я споделете с хиляди потенциални купувачи.'
          : 'Start selling your car today! Create your first listing and share it with thousands of potential buyers.'}
      </Subtitle>
      {isOwnProfile && (
        <CTAButton
          $isDark={isDark}
          onClick={onAddNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          {language === 'bg' ? 'Добави първа обява' : 'Add First Listing'}
        </CTAButton>
      )}
    </EmptyContainer>
  );
};

