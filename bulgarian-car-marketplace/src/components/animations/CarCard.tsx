/**
 * 🚗 CarCard Component with Professional Animations
 * بطاقة السيارة مع الرسوم المتحركة الاحترافية
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows, spacing, animations } from '../../design-system';
import FadeInImage from './FadeInImage';

interface CarCardProps {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    images: string[];
    location: string;
    status: 'active' | 'sold' | 'draft';
  };
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
  showActions?: boolean;
}

const CardContainer = styled(motion.div)<{
  $variant: 'default' | 'featured' | 'compact';
  $featured: boolean;
}>`
  position: relative;
  background: ${props => props.$featured 
    ? `linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.glass.primary} 100%)`
    : colors.background.secondary
  };
  border-radius: ${props => props.$variant === 'compact' ? '12px' : '16px'};
  box-shadow: ${props => props.$featured 
    ? shadows.colored.primary.lg 
    : shadows.basic.md
  };
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${colors.border.light};

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${props => props.$featured 
      ? shadows.colored.primary.xl 
      : shadows.basic.xl
    };
    border-color: ${colors.primary[500]};
  }

  &:active {
    transform: translateY(-4px) scale(1.01);
  }
`;

const ImageContainer = styled.div<{ $variant: string }>`
  position: relative;
  width: 100%;
  height: ${props => props.$variant === 'compact' ? '200px' : '240px'};
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const StatusBadge = styled(motion.div)<{ $status: string }>`
  position: absolute;
  top: ${spacing[4]};
  right: ${spacing[4]};
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: ${spacing[3]};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 10;
  
  background: ${props => {
    switch (props.$status) {
      case 'active': return colors.status.success;
      case 'sold': return colors.status.error;
      case 'draft': return colors.status.warning;
      default: return colors.secondary[500];
    }
  }};
  
  color: white;
  box-shadow: ${shadows.basic.md};
`;

const FeaturedBadge = styled(motion.div)`
  position: absolute;
  top: ${spacing[4]};
  left: ${spacing[4]};
  padding: ${spacing[2]} ${spacing[3]};
  background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
  color: white;
  border-radius: ${spacing[3]};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 10;
  box-shadow: ${shadows.colored.primary.md};
`;

const ContentContainer = styled.div<{ $variant: string }>`
  padding: ${props => props.$variant === 'compact' ? spacing[4] : spacing[5]};
`;

const CarTitle = styled(motion.h3)`
  font-family: ${props => props.theme.typography?.fonts?.automotive || "'Orbitron', sans-serif"};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing[2]} 0;
  line-height: 1.3;
  letter-spacing: 0.02em;
`;

const CarSubtitle = styled(motion.p)`
  font-size: 1rem;
  font-weight: 500;
  color: ${colors.text.secondary};
  margin: 0 0 ${spacing[4]} 0;
  line-height: 1.4;
`;

const SpecsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing[3]};
  margin-bottom: ${spacing[4]};
`;

const SpecItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  font-size: 0.875rem;
  color: ${colors.text.secondary};
`;

const SpecIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary[500]};
`;

const PriceContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing[4]};
`;

const Price = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.primary[500]};
  letter-spacing: 0.01em;
`;

const Location = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  font-size: 0.875rem;
  color: ${colors.text.light};
`;

const ActionButtons = styled(motion.div)`
  display: flex;
  gap: ${spacing[3]};
  margin-top: ${spacing[4]};
`;

const ActionButton = styled(motion.button)<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${spacing[3]} ${spacing[4]};
  border-radius: ${spacing[3]};
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
    color: white;
    box-shadow: ${shadows.colored.primary.sm};
    
    &:hover {
      background: linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]});
      box-shadow: ${shadows.colored.primary.md};
      transform: translateY(-1px);
    }
  ` : `
    background: ${colors.background.secondary};
    color: ${colors.text.primary};
    border: 1px solid ${colors.border.medium};
    
    &:hover {
      background: ${colors.background.primary};
      border-color: ${colors.border.dark};
      transform: translateY(-1px);
    }
  `}
`;

const HoverOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 121, 0, 0.1) 0%,
    rgba(44, 62, 80, 0.1) 100%
  );
  opacity: 0;
  pointer-events: none;
  z-index: 5;
`;

const CarCard: React.FC<CarCardProps> = ({
  car,
  onClick,
  className,
  variant = 'default',
  showActions = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isFeatured = variant === 'featured';

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.2,
      },
    },
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'متاح';
      case 'sold': return 'مباع';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  const getSpecIcon = (type: string) => {
    switch (type) {
      case 'year': return '📅';
      case 'mileage': return '🛣️';
      case 'fuel': return '⛽';
      case 'transmission': return '⚙️';
      default: return '🔧';
    }
  };

  return (
    <CardContainer
      $variant={variant}
      $featured={isFeatured}
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      layout
    >
      <ImageContainer $variant={variant}>
        <FadeInImage
          src={car.images[0] || '/placeholder-car.jpg'}
          alt={`${car.make} ${car.model} ${car.year}`}
          width="100%"
          height="100%"
          objectFit="cover"
          carAnimation={true}
        />
        
        {isFeatured && (
          <FeaturedBadge
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            مميز
          </FeaturedBadge>
        )}
        
        <StatusBadge
          $status={car.status}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {getStatusText(car.status)}
        </StatusBadge>
      </ImageContainer>

      <ContentContainer $variant={variant}>
        <motion.div variants={contentVariants}>
          <CarTitle
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {car.make} {car.model}
          </CarTitle>
          
          <CarSubtitle
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {car.year} • {car.transmission}
          </CarSubtitle>

          <SpecsContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <SpecItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <SpecIcon>{getSpecIcon('year')}</SpecIcon>
              {car.year}
            </SpecItem>
            
            <SpecItem
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <SpecIcon>{getSpecIcon('mileage')}</SpecIcon>
              {car.mileage.toLocaleString()} كم
            </SpecItem>
            
            <SpecItem
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              <SpecIcon>{getSpecIcon('fuel')}</SpecIcon>
              {car.fuelType}
            </SpecItem>
            
            <SpecItem
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              <SpecIcon>{getSpecIcon('transmission')}</SpecIcon>
              {car.transmission}
            </SpecItem>
          </SpecsContainer>

          <PriceContainer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.3 }}
          >
            <Price>€{car.price.toLocaleString()}</Price>
            <Location>
              📍 {car.location}
            </Location>
          </PriceContainer>

          {showActions && (
            <ActionButtons
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.3 }}
            >
              <ActionButton $variant="primary">
                عرض التفاصيل
              </ActionButton>
              <ActionButton $variant="secondary">
                حفظ
              </ActionButton>
            </ActionButtons>
          )}
        </motion.div>
      </ContentContainer>

      <AnimatePresence>
        {isHovered && (
          <HoverOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </CardContainer>
  );
};

export default CarCard;
