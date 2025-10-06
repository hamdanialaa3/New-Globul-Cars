// src/components/Profile/gauge/GaugeStyles.ts
// Gauge Styled Components - أنماط العداد
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import styled, { keyframes } from 'styled-components';

// ==================== ANIMATIONS ====================

export const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px currentColor); }
  50% { filter: drop-shadow(0 0 16px currentColor); }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

// ==================== STYLED COMPONENTS ====================

export const CompletionContainer = styled.div`
  width: 100%;
  padding: 28px 24px;
  background: 
    radial-gradient(circle at 30% 30%, #2d3748 0%, #1a202c 100%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

export const GaugeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
`;

export const GaugeTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  opacity: 0.6;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

export const LEDRing = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px solid ${props => props.$color};
  box-shadow: 
    0 0 10px ${props => props.$color},
    0 0 20px ${props => props.$color},
    inset 0 0 10px ${props => props.$color};
  opacity: 0.3;
  z-index: 1;
  animation: ${pulse} 3s ease-in-out infinite;
`;

export const GaugeOuter = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  background: 
    radial-gradient(circle, #1a1a1a 0%, #0a0a0a 70%, #000 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 0 8px rgba(0, 0, 0, 0.3),
    0 0 0 12px rgba(255, 255, 255, 0.05),
    inset 0 4px 20px rgba(0, 0, 0, 0.8),
    inset 0 -4px 20px rgba(255, 255, 255, 0.05),
    0 30px 60px rgba(0, 0, 0, 0.4);
  padding: 20px;
`;

export const GaugeSVG = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5));
`;

export const GaugeTrack = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.03);
  stroke-width: 18;
`;

export const GaugeTicks = styled.g``;

export const GaugeArc = styled.path<{ $percentage: number; $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 16;
  stroke-linecap: round;
  filter: drop-shadow(0 0 12px ${props => props.$color});
  animation: ${glow} 2s ease-in-out infinite;
  transition: stroke 0.5s ease;
`;

export const GaugeCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
`;

export const DigitalDisplay = styled.div`
  background: 
    linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.8),
    inset 0 -2px 8px rgba(255, 255, 255, 0.05),
    0 4px 16px rgba(0, 0, 0, 0.5);
  min-width: 140px;
`;

export const PercentageDisplay = styled.div<{ $color: string }>`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  font-family: 'Courier New', monospace;
  color: ${props => props.$color};
  text-shadow: 
    0 0 20px ${props => props.$color},
    0 0 40px ${props => props.$color},
    0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: -2px;
  filter: brightness(1.2);
  position: relative;
  
  &::after {
    content: '%';
    font-size: 1.8rem;
    margin-left: 4px;
    opacity: 0.8;
  }
`;

export const PercentageLabel = styled.div`
  font-size: 0.65rem;
  opacity: 0.5;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.6);
`;

export const SpeedoText = styled.div`
  position: absolute;
  top: 78%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 3px;
  opacity: 0.4;
  text-transform: uppercase;
`;

export const NeedleContainer = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 85px;
  background: linear-gradient(to top, 
    #000 0%,
    #1a1a1a 10%,
    #ef4444 20%,
    #ff6b6b 50%,
    #fca5a5 100%
  );
  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(${props => (props.$percentage * 270) / 100 - 225}deg);
  transition: transform 2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 0 20px rgba(239, 68, 68, 0.8),
    0 0 40px rgba(239, 68, 68, 0.4),
    inset 1px 0 0 rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  z-index: 5;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 16px solid #ff4444;
    filter: drop-shadow(0 0 8px rgba(255, 68, 68, 1));
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 28px;
    background: 
      radial-gradient(circle at 35% 35%, #ff8888 0%, #ff4444 30%, #cc0000 100%);
    border-radius: 50%;
    box-shadow: 
      0 0 0 4px rgba(0, 0, 0, 0.5),
      0 0 0 6px rgba(255, 255, 255, 0.1),
      0 4px 12px rgba(0, 0, 0, 0.5),
      inset -2px -2px 4px rgba(0, 0, 0, 0.5),
      inset 2px 2px 4px rgba(255, 255, 255, 0.2);
  }
`;

export const NumberLabel = styled.div<{ $angle: number; $value: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  transform: 
    translate(-50%, -50%)
    rotate(${props => props.$angle}deg)
    translateY(-95px)
    rotate(${props => -props.$angle}deg);
  z-index: 3;
`;

export const TickMark = styled.line<{ $isMajor: boolean }>`
  stroke: ${props => props.$isMajor ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  stroke-width: ${props => props.$isMajor ? '3' : '1.5'};
  stroke-linecap: round;
`;

export const GlassReflection = styled.div`
  position: absolute;
  top: 15%;
  left: 15%;
  width: 40%;
  height: 30%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 8;
`;

export const ChecklistItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 0.75rem;
  opacity: ${props => props.$completed ? 1 : 0.5};
  transition: all 0.3s ease;
  
  svg {
    flex-shrink: 0;
  }
  
  &:hover {
    opacity: 1;
  }
`;


