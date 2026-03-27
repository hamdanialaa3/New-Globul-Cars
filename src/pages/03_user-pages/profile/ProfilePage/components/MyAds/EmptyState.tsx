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

const EmptyContainer = styled(motion.div) <{ $isDark?: boolean }>`
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

const IconContainer = styled(motion.div)`
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

const CTAButton = styled(motion.button) <{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #8B5CF6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
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
    border-color: #8B5CF6;
    color: #8B5CF6;
  }
`;

// Project Logo Component
const ProjectLogo: React.FC = () => (
  <img
    src="/assets/images/logo_last.png"
    alt="Koli One Logo"
    style={{ width: '160px', height: '160px' }}
  />
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  isOwnProfile,
  onAddNew,
  isDark = false,
  isFiltered = false,
  onClearFilters
}) => {
  const { language, t } = useLanguage();

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
          {t('common.noResults')}
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
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ProjectLogo />
      </IconContainer>
      <Title $isDark={isDark}>
        {language === 'bg' ? 'Няма коли в този гараж' : 'No cars in this garage'}
      </Title>
      <Subtitle $isDark={isDark}>
        {language === 'bg'
          ? 'Гаражът ви е празен. Добавете първата си кола и започнете да продавате на хиляди потенциални купувачи!'
          : 'Your garage is empty. Add your first car and start selling to thousands of potential buyers!'}
      </Subtitle>
      {isOwnProfile && (
        <CTAButton
          $isDark={isDark}
          onClick={onAddNew}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          {language === 'bg' ? 'Добави кола' : 'Add a Car'}
        </CTAButton>
      )}
    </EmptyContainer>
  );
};



