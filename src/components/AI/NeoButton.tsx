import React from 'react';
import styled, { css } from 'styled-components';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeoButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger';
    glowColor?: string;
    children: React.ReactNode;
}

const ButtonContainer = styled(motion.button) <{ $variant: string; $glowColor?: string }>`
  position: relative;
  padding: 12px 24px;
  font-family: 'Exo 2', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.9rem;
  background: transparent;
  border: none;
  cursor: pointer;
  overflow: hidden;
  color: #fff;
  
  /* Cyberpunk Border */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid ${props => props.$glowColor || '#00f3ff'};
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    box-shadow: 0 0 10px ${props => props.$glowColor || '#00f3ff'}, inset 0 0 5px ${props => props.$glowColor || '#00f3ff'};
    transition: all 0.3s ease;
  }

  /* Inner Background */
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: ${props => props.$variant === 'primary' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)'};
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
    z-index: -1;
  }

  /* Hover Effect */
  &:hover::before {
    box-shadow: 0 0 20px ${props => props.$glowColor || '#00f3ff'}, inset 0 0 10px ${props => props.$glowColor || '#00f3ff'};
    background: ${props => props.$glowColor ? `${props.$glowColor}10` : '#00f3ff10'};
  }
`;

export const NeoButton: React.FC<NeoButtonProps> = ({
    variant = 'primary',
    glowColor,
    children,
    ...props
}) => {
    const defaultColor = variant === 'primary' ? '#00f3ff' : variant === 'secondary' ? '#ff00ff' : '#ff3333';
    const finalColor = glowColor || defaultColor;

    return (
        <ButtonContainer
            $variant={variant}
            $glowColor={finalColor}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </ButtonContainer>
    );
};
