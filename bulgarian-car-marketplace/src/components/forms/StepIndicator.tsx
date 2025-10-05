/**
 * 📊 Step Indicator Component
 * مؤشر الخطوات مع التأشير الدائري
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { colors, spacing, shadows } from '../../design-system';

interface Step {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  active: boolean;
  disabled?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

const StepContainer = styled.div<{ $variant: 'horizontal' | 'vertical' }>`
  display: flex;
  ${props => props.$variant === 'horizontal' 
    ? 'flex-direction: row; justify-content: space-between; align-items: center;'
    : 'flex-direction: column; gap: 2rem;'
  }
  position: relative;
  width: 100%;
`;

const StepItem = styled(motion.div)<{
  $completed: boolean;
  $active: boolean;
  $disabled: boolean;
  $variant: 'horizontal' | 'vertical';
}>`
  display: flex;
  align-items: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  ${props => props.$variant === 'horizontal' 
    ? 'flex-direction: column; text-align: center; flex: 1;'
    : 'flex-direction: row; gap: 1rem;'
  }
`;

const StepCircle = styled(motion.div)<{
  $completed: boolean;
  $active: boolean;
  $disabled: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  position: relative;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.$completed) {
      return `
        background: linear-gradient(135deg, ${colors.status.success}, #059669);
        color: white;
        box-shadow: ${shadows.colored.success.md};
      `;
    } else if (props.$active) {
      return `
        background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
        color: white;
        box-shadow: ${shadows.colored.primary.md};
      `;
    } else {
      return `
        background: ${colors.background.secondary};
        color: ${colors.text.secondary};
        border: 2px solid ${colors.border.medium};
      `;
    }
  }}
  
  ${props => props.$disabled && `
    background: ${colors.background.primary};
    color: ${colors.text.light};
    border: 2px solid ${colors.border.light};
    box-shadow: none;
  `}
`;

const CheckIcon = styled(motion.div)`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '✓';
    font-size: 12px;
    font-weight: bold;
  }
`;

const StepContent = styled.div<{ $variant: 'horizontal' | 'vertical' }>`
  ${props => props.$variant === 'horizontal' 
    ? 'margin-top: 0.75rem;'
    : 'flex: 1;'
  }
`;

const StepTitle = styled.h3<{ $active: boolean; $completed: boolean }>`
  font-family: ${props => props.theme.typography?.fonts?.heading || "'Poppins', sans-serif"};
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: ${props => {
    if (props.$active) return colors.primary[500];
    if (props.$completed) return colors.text.primary;
    return colors.text.secondary;
  }};
`;

const StepDescription = styled.p<{ $active: boolean; $completed: boolean }>`
  font-size: 0.75rem;
  margin: 0;
  color: ${props => {
    if (props.$active) return colors.text.primary;
    return colors.text.light;
  }};
`;

const StepLine = styled(motion.div)<{
  $completed: boolean;
  $variant: 'horizontal' | 'vertical';
}>`
  position: absolute;
  background: ${props => props.$completed 
    ? `linear-gradient(135deg, ${colors.status.success}, #059669)`
    : colors.border.light
  };
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'horizontal' 
    ? `
      top: 20px;
      left: 20px;
      right: -20px;
      height: 2px;
      z-index: -1;
    `
    : `
      left: 19px;
      top: 40px;
      bottom: -32px;
      width: 2px;
    `
  }
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(135deg, ${colors.status.success}, #059669);
  border-radius: 1px;
`;

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
  variant = 'horizontal',
}) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  const checkVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.5, 
        ease: "backOut" 
      }
    },
  };

  return (
    <StepContainer $variant={variant} className={className}>
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          $completed={step.completed}
          $active={step.active}
          $disabled={step.disabled || false}
          $variant={variant}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          whileHover={!step.disabled ? "hover" : undefined}
          whileTap={!step.disabled ? "tap" : undefined}
          onClick={() => !step.disabled && onStepClick?.(index)}
        >
          <StepCircle
            $completed={step.completed}
            $active={step.active}
            $disabled={step.disabled || false}
          >
            {step.completed ? (
              <CheckIcon
                variants={checkVariants}
                initial="hidden"
                animate="visible"
              />
            ) : (
              <span>{index + 1}</span>
            )}
          </StepCircle>

          {variant === 'horizontal' && (
            <>
              {index < steps.length - 1 && (
                <StepLine
                  $completed={step.completed}
                  $variant={variant}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: step.completed ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              )}
            </>
          )}

          <StepContent $variant={variant}>
            <StepTitle
              $active={step.active}
              $completed={step.completed}
            >
              {step.title}
            </StepTitle>
            {step.description && (
              <StepDescription
                $active={step.active}
                $completed={step.completed}
              >
                {step.description}
              </StepDescription>
            )}
          </StepContent>

          {variant === 'vertical' && index < steps.length - 1 && (
            <StepLine
              $completed={step.completed}
              $variant={variant}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: step.completed ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          )}
        </StepItem>
      ))}
    </StepContainer>
  );
};

export default StepIndicator;
