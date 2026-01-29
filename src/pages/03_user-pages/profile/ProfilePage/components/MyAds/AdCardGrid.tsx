// AdCardGrid.tsx
// Grid view with animations

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CompactCarCard from '../../../../../../components/CarCards/CompactCarCard';
import { UnifiedCar } from '../../../../../../services/car';

interface AdCardGridProps {
  cars: UnifiedCar[];
  isOwnProfile: boolean;
  onView: (car: UnifiedCar) => void;
  onEdit: (car: UnifiedCar) => void;
  onClone?: (carId: string) => void;
}

const GridContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 641px) and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  @media (min-width: 1025px) and (max-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }

  @media (min-width: 1441px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }
`;

const GridItem = styled(motion.div)`
  width: 100%;
`;

export const AdCardGrid: React.FC<AdCardGridProps> = ({
  cars,
  isOwnProfile,
  onView,
  onEdit,
  onClone
}) => {
  return (
    <GridContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {cars.map((car, index) => {
        const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
        const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId;

        return (
          <GridItem
            key={car.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <CompactCarCard
              car={car}
              isOwnProfile={isOwnProfile}
              showStatus={true}
              onView={(carId) => {
                if (sellerNumericId && carNumericId) {
                  window.open(`/car/${sellerNumericId}/${carNumericId}`, '_blank');
                } else {
                  onView(car);
                }
              }}
              onEdit={(carId) => {
                onEdit(car);
              }}
              onClone={onClone}
            />
          </GridItem>
        );
      })}
    </GridContainer>
  );
};

