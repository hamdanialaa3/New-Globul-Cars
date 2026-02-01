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

// SVG Car Illustration Component - Professional Garage Theme
const CarIllustration: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => (
  <svg
    width="280"
    height="180"
    viewBox="0 0 280 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Garage Shape */}
    <rect x="20" y="30" width="240" height="120" rx="12" fill={isDark ? '#1e293b' : '#f1f5f9'} />
    <path d="M140 10L260 50V30H20V50L140 10Z" fill={isDark ? '#334155' : '#e2e8f0'} />
    
    {/* Garage Floor */}
    <rect x="30" y="130" width="220" height="20" rx="4" fill={isDark ? '#0f172a' : '#cbd5e1'} />
    
    {/* Center Parking Lines */}
    <rect x="90" y="135" width="4" height="10" rx="1" fill="#ff8f10" />
    <rect x="138" y="135" width="4" height="10" rx="1" fill="#ff8f10" />
    <rect x="186" y="135" width="4" height="10" rx="1" fill="#ff8f10" />
    
    {/* Empty Garage Symbol */}
    <circle cx="140" cy="85" r="35" fill={isDark ? '#334155' : '#e2e8f0'} stroke="#ff8f10" strokeWidth="3" strokeDasharray="8 4" />
    
    {/* Car Silhouette (Ghost/Placeholder) */}
    <g opacity="0.4">
      {/* Car Body */}
      <path 
        d="M95 95C95 91.6863 97.6863 89 101 89H179C182.314 89 185 91.6863 185 95V110C185 113.314 182.314 116 179 116H101C97.6863 116 95 113.314 95 110V95Z" 
        fill={isDark ? '#64748b' : '#94a3b8'} 
      />
      {/* Car Roof */}
      <path 
        d="M110 89L120 70H160L170 89H110Z" 
        fill={isDark ? '#64748b' : '#94a3b8'} 
      />
      {/* Windows */}
      <path 
        d="M122 72H158L166 87H114L122 72Z" 
        fill={isDark ? '#1e293b' : '#e2e8f0'} 
      />
    </g>
    
    {/* Plus Icon in Center */}
    <circle cx="140" cy="85" r="18" fill="#ff8f10" />
    <rect x="136" y="76" width="8" height="18" rx="2" fill="white" />
    <rect x="131" y="81" width="18" height="8" rx="2" fill="white" />
    
    {/* Decorative Elements */}
    <circle cx="55" cy="60" r="8" fill={isDark ? '#334155' : '#e2e8f0'} />
    <circle cx="225" cy="60" r="8" fill={isDark ? '#334155' : '#e2e8f0'} />
    
    {/* Tool Icons */}
    <rect x="50" y="56" width="10" height="2" rx="1" fill={isDark ? '#64748b' : '#94a3b8'} />
    <rect x="53" y="53" width="4" height="14" rx="1" fill={isDark ? '#64748b' : '#94a3b8'} />
    
    <rect x="220" y="56" width="10" height="2" rx="1" fill={isDark ? '#64748b' : '#94a3b8'} />
    <rect x="223" y="53" width="4" height="14" rx="1" fill={isDark ? '#64748b' : '#94a3b8'} />
    
    {/* Koli One Branding */}
    <text x="140" y="165" textAnchor="middle" fontSize="10" fontWeight="600" fill="#ff8f10">
      KOLI ONE GARAGE
    </text>
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
        <CarIllustration isDark={isDark} />
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

