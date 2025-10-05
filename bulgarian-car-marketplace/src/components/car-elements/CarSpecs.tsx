/**
 * 📊 Car Specifications Component
 * مكون مواصفات السيارة التفاعلي
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows, spacing, typography } from '../../design-system';
import { CarIcons } from '../icons/CarIcons';

interface CarSpec {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: keyof typeof CarIcons;
  category: 'engine' | 'performance' | 'comfort' | 'safety' | 'other';
}

interface CarSpecsProps {
  specs: CarSpec[];
  className?: string;
  variant?: 'grid' | 'list' | 'compact';
}

const SpecsContainer = styled.div<{ $variant: 'grid' | 'list' | 'compact' }>`
  ${props => {
    switch (props.$variant) {
      case 'grid':
        return `
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${spacing[4]};
        `;
      case 'list':
        return `
          display: flex;
          flex-direction: column;
          gap: ${spacing[3]};
        `;
      case 'compact':
        return `
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: ${spacing[3]};
        `;
      default:
        return `
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${spacing[4]};
        `;
    }
  }}
`;

const SpecCard = styled(motion.div)<{
  $category: string;
  $variant: 'grid' | 'list' | 'compact';
}>`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  padding: ${props => props.$variant === 'compact' ? spacing[3] : spacing[4]};
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.light};
  border-radius: ${spacing[3]};
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$category) {
      case 'engine':
        return `
          border-left: 4px solid ${colors.primary[500]};
          background: linear-gradient(135deg, ${colors.primary[50]}, ${colors.background.secondary});
        `;
      case 'performance':
        return `
          border-left: 4px solid ${colors.status.success};
          background: linear-gradient(135deg, ${colors.status.success}10, ${colors.background.secondary});
        `;
      case 'comfort':
        return `
          border-left: 4px solid ${colors.status.warning};
          background: linear-gradient(135deg, ${colors.status.warning}10, ${colors.background.secondary});
        `;
      case 'safety':
        return `
          border-left: 4px solid ${colors.status.error};
          background: linear-gradient(135deg, ${colors.status.error}10, ${colors.background.secondary});
        `;
      default:
        return `
          border-left: 4px solid ${colors.secondary[500]};
        `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.basic.md};
    border-color: ${colors.primary[300]};
  }
`;

const SpecIcon = styled.div<{ $category: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${spacing[2]};
  flex-shrink: 0;
  
  ${props => {
    switch (props.$category) {
      case 'engine':
        return `
          background: ${colors.primary[100]};
          color: ${colors.primary[600]};
        `;
      case 'performance':
        return `
          background: ${colors.status.success}20;
          color: ${colors.status.success};
        `;
      case 'comfort':
        return `
          background: ${colors.status.warning}20;
          color: ${colors.status.warning};
        `;
      case 'safety':
        return `
          background: ${colors.status.error}20;
          color: ${colors.status.error};
        `;
      default:
        return `
          background: ${colors.secondary[100]};
          color: ${colors.secondary[600]};
        `;
    }
  }}
`;

const SpecContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SpecLabel = styled.div`
  font-size: ${typography.sizes.sm};
  font-weight: ${typography.weights.medium};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[1]};
  line-height: 1.4;
`;

const SpecValue = styled.div`
  font-size: ${typography.sizes.base};
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  line-height: 1.3;
`;

const SpecUnit = styled.span`
  font-size: ${typography.sizes.sm};
  color: ${colors.text.light};
  margin-left: ${spacing[1]};
`;

const CategoryHeader = styled(motion.h3)`
  font-family: ${typography.fonts.heading};
  font-size: ${typography.sizes.lg};
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin: ${spacing[6]} 0 ${spacing[4]} 0;
  padding-bottom: ${spacing[2]};
  border-bottom: 2px solid ${colors.border.light};
  
  &:first-child {
    margin-top: 0;
  }
`;

const CompactSpec = styled(motion.div)<{ $category: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${spacing[3]};
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.light};
  border-radius: ${spacing[3]};
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$category) {
      case 'engine':
        return `
          border-top: 3px solid ${colors.primary[500]};
        `;
      case 'performance':
        return `
          border-top: 3px solid ${colors.status.success};
        `;
      case 'comfort':
        return `
          border-top: 3px solid ${colors.status.warning};
        `;
      case 'safety':
        return `
          border-top: 3px solid ${colors.status.error};
        `;
      default:
        return `
          border-top: 3px solid ${colors.secondary[500]};
        `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.basic.md};
  }
`;

const CompactIcon = styled.div<{ $category: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[2]};
  
  ${props => {
    switch (props.$category) {
      case 'engine':
        return `color: ${colors.primary[600]};`;
      case 'performance':
        return `color: ${colors.status.success};`;
      case 'comfort':
        return `color: ${colors.status.warning};`;
      case 'safety':
        return `color: ${colors.status.error};`;
      default:
        return `color: ${colors.secondary[600]};`;
    }
  }}
`;

const CompactLabel = styled.div`
  font-size: ${typography.sizes.xs};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing[1]};
  font-weight: ${typography.weights.medium};
`;

const CompactValue = styled.div`
  font-size: ${typography.sizes.sm};
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
`;

const CarSpecs: React.FC<CarSpecsProps> = ({
  specs,
  className,
  variant = 'grid',
}) => {
  const groupedSpecs = specs.reduce((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {} as Record<string, CarSpec[]>);

  const categoryNames = {
    engine: 'المحرك',
    performance: 'الأداء',
    comfort: 'الراحة',
    safety: 'الأمان',
    other: 'أخرى',
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engine': return CarIcons.Engine;
      case 'performance': return CarIcons.Speedometer;
      case 'comfort': return CarIcons.AirConditioning;
      case 'safety': return CarIcons.Safety;
      default: return CarIcons.Transmission;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (variant === 'compact') {
    return (
      <SpecsContainer $variant={variant} className={className}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'contents' }}
        >
          {specs.map((spec) => {
            const IconComponent = spec.icon ? CarIcons[spec.icon] : getCategoryIcon(spec.category);
            
            return (
              <CompactSpec
                key={spec.id}
                $category={spec.category}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CompactIcon $category={spec.category}>
                  <IconComponent size={16} />
                </CompactIcon>
                <CompactLabel>{spec.label}</CompactLabel>
                <CompactValue>
                  {spec.value}
                  {spec.unit && <SpecUnit>{spec.unit}</SpecUnit>}
                </CompactValue>
              </CompactSpec>
            );
          })}
        </motion.div>
      </SpecsContainer>
    );
  }

  return (
    <SpecsContainer $variant={variant} className={className}>
      {Object.entries(groupedSpecs).map(([category, categorySpecs]) => (
        <div key={category}>
          <CategoryHeader
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {categoryNames[category as keyof typeof categoryNames] || category}
          </CategoryHeader>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'contents' }}
          >
            {categorySpecs.map((spec) => {
              const IconComponent = spec.icon ? CarIcons[spec.icon] : getCategoryIcon(spec.category);
              
              return (
                <SpecCard
                  key={spec.id}
                  $category={spec.category}
                  $variant={variant}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SpecIcon $category={spec.category}>
                    <IconComponent size={20} />
                  </SpecIcon>
                  
                  <SpecContent>
                    <SpecLabel>{spec.label}</SpecLabel>
                    <SpecValue>
                      {spec.value}
                      {spec.unit && <SpecUnit>{spec.unit}</SpecUnit>}
                    </SpecValue>
                  </SpecContent>
                </SpecCard>
              );
            })}
          </motion.div>
        </div>
      ))}
    </SpecsContainer>
  );
};

export default CarSpecs;
