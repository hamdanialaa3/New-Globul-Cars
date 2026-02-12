// src/components/Profile/AnimatedCard.tsx
// Animated Card Component - بطاقة متحركة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { fadeIn, slideUp, scaleIn } from '../../styles/animations';

// ==================== STYLED COMPONENTS ====================

const Card = styled.div<{ 
  $animation?: 'fade' | 'slide' | 'scale';
  $delay?: number;
}>`
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  ${props => {
    if (props.$animation === 'fade') {
      return `animation: ${fadeIn} 0.5s ease-out ${props.$delay || 0}s;`;
    }
    if (props.$animation === 'slide') {
      return `animation: ${slideUp} 0.5s ease-out ${props.$delay || 0}s;`;
    }
    if (props.$animation === 'scale') {
      return `animation: ${scaleIn} 0.5s ease-out ${props.$delay || 0}s;`;
    }
    return '';
  }}
  
  animation-fill-mode: both;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div`
  padding: 20px 20px 0;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    color: #333;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
  }
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardFooter = styled.div`
  padding: 0 20px 20px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
`;

// ==================== COMPONENT ====================

interface AnimatedCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  delay?: number;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  title,
  description,
  footer,
  animation = 'fade',
  delay = 0,
  onClick
}) => {
  return (
    <Card 
      $animation={animation} 
      $delay={delay}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {(title || description) && (
        <CardHeader>
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </CardHeader>
      )}
      
      <CardContent>{children}</CardContent>
      
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default AnimatedCard;
