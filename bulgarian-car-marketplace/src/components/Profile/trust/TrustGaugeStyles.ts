// src/components/Profile/trust/TrustGaugeStyles.ts
// Trust Gauge Styled Components
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import styled, { keyframes } from 'styled-components';
import { TrustLevel } from '../../../services/profile/trust-score-service';

// ==================== ANIMATIONS ====================

export const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px currentColor); }
  50% { filter: drop-shadow(0 0 20px currentColor); }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.08); opacity: 1; }
`;

export const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ==================== STYLED COMPONENTS ====================

export const TrustContainer = styled.div`
  width: 100%;
  padding: 28px 24px;
  background: 
    radial-gradient(circle at 30% 30%, #1e293b 0%, #0f172a 100%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
`;

export const GaugeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
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
`;

export const GaugeOuter = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, #1a1a1a 0%, #0a0a0a 70%, #000 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 0 8px rgba(0, 0, 0, 0.4),
    0 0 0 12px rgba(255, 255, 255, 0.06),
    inset 0 4px 20px rgba(0, 0, 0, 0.9),
    inset 0 -4px 20px rgba(255, 255, 255, 0.05),
    0 25px 50px rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

export const GaugeSVG = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.5));
`;

export const GaugeTrack = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 16;
`;

export const GaugeTicks = styled.g``;

export const TickMark = styled.line<{ $isMajor: boolean }>`
  stroke: ${props => props.$isMajor ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'};
  stroke-width: ${props => props.$isMajor ? '2.5' : '1.2'};
  stroke-linecap: round;
`;

export const GaugeArc = styled.path<{ $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 14;
  stroke-linecap: round;
  filter: drop-shadow(0 0 12px ${props => props.$color});
  animation: ${glow} 2.5s ease-in-out infinite;
`;

export const NumberLabel = styled.div<{ $angle: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.65);
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
  transform: 
    translate(-50%, -50%)
    rotate(${props => props.$angle}deg)
    translateY(-88px)
    rotate(${props => -props.$angle}deg);
  z-index: 3;
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
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px 14px;
  box-shadow: 
    inset 0 2px 6px rgba(0, 0, 0, 0.9),
    inset 0 -2px 6px rgba(255, 255, 255, 0.03),
    0 3px 12px rgba(0, 0, 0, 0.6);
  min-width: 90px;
`;

export const ScoreDisplay = styled.div<{ $color: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  font-family: 'Courier New', monospace;
  color: ${props => props.$color};
  text-shadow: 
    0 0 10px ${props => props.$color},
    0 0 20px ${props => props.$color},
    0 2px 4px rgba(0, 0, 0, 0.9);
  letter-spacing: -0.5px;
  filter: brightness(1.3);
`;

export const LevelLabel = styled.div<{ $color: string }>`
  font-size: 0.65rem;
  margin-bottom: 4px;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  color: ${props => props.$color};
  opacity: 0.85;
  font-weight: 500;
`;

export const TrustText = styled.div`
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  opacity: 0.35;
  text-transform: uppercase;
`;

export const NeedleContainer = styled.div<{ $score: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 75px;
  background: linear-gradient(to top, 
    #000 0%,
    #1a1a1a 12%,
    #ef4444 25%,
    #ff6b6b 55%,
    #fca5a5 100%
  );
  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(${props => (props.$score * 270) / 100 - 225}deg);
  transition: transform 2.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 0 18px rgba(239, 68, 68, 0.9),
    0 0 35px rgba(239, 68, 68, 0.5),
    inset 1px 0 0 rgba(255, 255, 255, 0.25);
  border-radius: 1.5px;
  z-index: 5;
  
  &::before {
    content: '';
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 14px solid #ff3333;
    filter: drop-shadow(0 0 10px rgba(255, 51, 51, 1));
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    background: radial-gradient(circle at 35% 35%, #ff9999 0%, #ff4444 35%, #cc0000 100%);
    border-radius: 50%;
    box-shadow: 
      0 0 0 3px rgba(0, 0, 0, 0.6),
      0 0 0 5px rgba(255, 255, 255, 0.08),
      0 3px 10px rgba(0, 0, 0, 0.6),
      inset -2px -2px 3px rgba(0, 0, 0, 0.6),
      inset 2px 2px 3px rgba(255, 255, 255, 0.15);
  }
`;

export const LEDRing = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 185px;
  height: 185px;
  border-radius: 50%;
  border: 1.5px solid ${props => props.$color};
  box-shadow: 
    0 0 8px ${props => props.$color},
    0 0 16px ${props => props.$color},
    inset 0 0 8px ${props => props.$color};
  opacity: 0.25;
  z-index: 1;
  animation: ${pulse} 3.5s ease-in-out infinite;
`;

export const GlassReflection = styled.div`
  position: absolute;
  top: 18%;
  left: 18%;
  width: 35%;
  height: 25%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 50%,
    transparent 100%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 8;
`;

export const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

export const BadgeItem = styled.div<{ $level?: TrustLevel }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  font-size: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  span.icon {
    font-size: 0.95rem;
    filter: drop-shadow(0 0 4px currentColor);
  }
  
  span.name {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }
`;

export const EmptyBadges = styled.div`
  text-align: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.7rem;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

