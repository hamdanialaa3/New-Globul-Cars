/**
 * 🚗 Speedometer Component
 * مكون عداد السرعة التفاعلي للسيارات
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows } from '../../design-system';

interface SpeedometerProps {
  value: number;
  max: number;
  unit?: string;
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}

const SpeedometerContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpeedometerSvg = styled.svg<{ $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  transform: rotate(-90deg);
`;

const SpeedometerTrack = styled.circle<{ $size: number }>`
  fill: none;
  stroke: ${colors.border.light};
  stroke-width: ${props => Math.max(props.$size / 50, 4)};
  cx: ${props => props.$size / 2};
  cy: ${props => props.$size / 2};
  r: ${props => (props.$size - 20) / 2};
`;

const SpeedometerProgress = styled(motion.circle)<{
  $size: number;
  $color: string;
}>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: ${props => Math.max(props.$size / 40, 6)};
  stroke-linecap: round;
  cx: ${props => props.$size / 2};
  cy: ${props => props.$size / 2};
  r: ${props => (props.$size - 20) / 2};
  filter: drop-shadow(0 0 8px ${props => props.$color}40);
`;

const SpeedometerCenter = styled(motion.div)<{ $size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$size / 6}px;
  height: ${props => props.$size / 6}px;
  background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
  border-radius: 50%;
  box-shadow: ${shadows.colored.primary.md};
  z-index: 10;
`;

const SpeedometerValue = styled(motion.div)<{ $size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: ${props => props.theme.typography?.fonts?.automotive || "'Orbitron', sans-serif"};
  font-size: ${props => Math.max(props.$size / 12, 14)}px;
  font-weight: 700;
  color: ${colors.text.primary};
  text-align: center;
  z-index: 20;
`;

const SpeedometerUnit = styled(motion.div)<{ $size: number }>`
  position: absolute;
  bottom: ${props => props.$size / 4}px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${props => Math.max(props.$size / 20, 10)}px;
  font-weight: 500;
  color: ${colors.text.secondary};
  text-align: center;
`;

const SpeedometerMarks = styled.div<{ $size: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Mark = styled.div<{
  $angle: number;
  $size: number;
  $isMajor: boolean;
}>`
  position: absolute;
  top: ${props => props.$size / 2}px;
  left: ${props => props.$size / 2}px;
  width: ${props => props.$isMajor ? 3 : 1}px;
  height: ${props => props.$isMajor ? 15 : 8}px;
  background: ${colors.text.secondary};
  transform-origin: 0 ${props => props.$size / 2}px;
  transform: rotate(${props => props.$angle}deg) translateY(-${props => props.$size / 2}px);
  border-radius: 1px;
`;

const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  max,
  unit = 'km/h',
  size = 200,
  className,
  animated = true,
  color = colors.primary[500],
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const marks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = (i / 10) * 180 - 180;
    marks.push(
      <Mark
        key={i}
        $angle={angle}
        $size={size}
        $isMajor={i % 2 === 0}
      />
    );
  }

  const progressVariants = {
    initial: { strokeDashoffset: circumference },
    animate: { 
      strokeDashoffset: circumference - progress,
      transition: { 
        duration: 2, 
        ease: "easeOut" 
      }
    },
  };

  const valueVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        delay: 0.5 
      }
    },
  };

  const centerVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: 1 
      }
    },
  };

  return (
    <SpeedometerContainer $size={size} className={className}>
      <SpeedometerSvg $size={size}>
        <SpeedometerTrack $size={size} />
        <SpeedometerProgress
          $size={size}
          $color={color}
          style={{
            strokeDasharray: circumference,
          }}
          variants={progressVariants}
          initial="initial"
          animate="animate"
        />
      </SpeedometerSvg>

      <SpeedometerMarks $size={size}>
        {marks}
      </SpeedometerMarks>

      <SpeedometerValue
        $size={size}
        variants={valueVariants}
        initial="initial"
        animate="animate"
      >
        {Math.round(displayValue)}
      </SpeedometerValue>

      <SpeedometerUnit
        $size={size}
        variants={valueVariants}
        initial="initial"
        animate="animate"
      >
        {unit}
      </SpeedometerUnit>

      <SpeedometerCenter
        $size={size}
        variants={centerVariants}
        initial="initial"
        animate="animate"
      />
    </SpeedometerContainer>
  );
};

export default Speedometer;
