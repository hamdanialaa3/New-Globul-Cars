/**
 * 🃏 Professional Card Component
 * مكون البطاقات الاحترافي الموحد
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows, spacing } from '../../design-system';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

const CardContainer = styled(motion.div)<{
  $variant: 'default' | 'glass' | 'elevated' | 'outlined';
  $padding: 'sm' | 'md' | 'lg';
  $shadow: 'none' | 'sm' | 'md' | 'lg';
  $hover: boolean;
  $clickable: boolean;
}>`
  position: relative;
  border-radius: ${spacing[4]};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => {
    switch (props.$padding) {
      case 'sm':
        return `padding: ${spacing[4]};`;
      case 'md':
        return `padding: ${spacing[5]};`;
      case 'lg':
        return `padding: ${spacing[6]};`;
      default:
        return `padding: ${spacing[5]};`;
    }
  }}

  ${props => {
    switch (props.$variant) {
      case 'default':
        return `
          background: ${colors.background.secondary};
          border: 1px solid ${colors.border.light};
        `;
      
      case 'glass':
        return `
          background: ${colors.glass.light};
          backdrop-filter: blur(10px);
          border: 1px solid ${colors.glass.glass};
        `;
      
      case 'elevated':
        return `
          background: ${colors.background.secondary};
          border: none;
        `;
      
      case 'outlined':
        return `
          background: transparent;
          border: 2px solid ${colors.border.medium};
        `;
      
      default:
        return `
          background: ${colors.background.secondary};
          border: 1px solid ${colors.border.light};
        `;
    }
  }}

  ${props => {
    switch (props.$shadow) {
      case 'none':
        return `box-shadow: none;`;
      case 'sm':
        return `box-shadow: ${shadows.basic.sm};`;
      case 'md':
        return `box-shadow: ${shadows.basic.md};`;
      case 'lg':
        return `box-shadow: ${shadows.basic.lg};`;
      default:
        return `box-shadow: ${shadows.basic.md};`;
    }
  }}

  ${props => props.$clickable && `
    cursor: pointer;
  `}

  ${props => props.$hover && `
    &:hover {
      transform: translateY(-4px);
      
      ${props.$variant === 'glass' ? `
        background: ${colors.glass.medium};
        backdrop-filter: blur(15px);
      ` : `
        box-shadow: ${shadows.basic.xl};
      `}
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${spacing[4]};
`;

const CardTitle = styled.h3`
  font-family: ${props => props.theme.typography?.fonts?.heading || "'Poppins', sans-serif"};
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing[2]} 0;
  line-height: 1.3;
`;

const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const CardContent = styled.div`
  color: ${colors.text.primary};
  line-height: 1.6;
`;

const CardFooter = styled.div`
  margin-top: ${spacing[4]};
  padding-top: ${spacing[4]};
  border-top: 1px solid ${colors.border.light};
`;

const CardImage = styled.div<{ $src: string; $height?: string }>`
  width: 100%;
  height: ${props => props.$height || '200px'};
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin: -${spacing[5]} -${spacing[5]} ${spacing[4]} -${spacing[5]};
  border-radius: ${spacing[4]} ${spacing[4]} 0 0;
`;

const CardBadge = styled(motion.div)<{ $color: string }>`
  position: absolute;
  top: ${spacing[4]};
  right: ${spacing[4]};
  padding: ${spacing[1]} ${spacing[2]};
  background: ${props => props.$color};
  color: white;
  border-radius: ${spacing[2]};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 10;
`;

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick,
  className,
}) => {
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
  };

  return (
    <CardContainer
      $variant={variant}
      $padding={padding}
      $shadow={shadow}
      $hover={hover}
      $clickable={!!onClick}
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
    >
      {children}
    </CardContainer>
  );
};

// Compound components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Badge = CardBadge;

export default Card;
