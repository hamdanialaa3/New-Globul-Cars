// src/components/Profile/trust/TrustGaugeStyles.ts
// Trust Gauge Styled Components
// 🎨 Premium Aluminum & Orange Theme with Glassmorphism
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import styled from 'styled-components';
import { TrustLevel } from '../../../services/profile/trust-score-service';

// ==================== ANIMATIONS ====================

// ⚡ OPTIMIZED: Removed all infinite keyframes
// Using static effects and hover transitions instead

// ==================== STYLED COMPONENTS ====================

export const TrustContainer = styled.div`
  width: 100%;
  padding: 24px 20px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  
  /* 🎨 Premium Dark Glass with Aluminum Frame */
  background: linear-gradient(135deg,
    rgba(30, 41, 59, 0.95) 0%,
    rgba(15, 23, 42, 0.98) 50%,
    rgba(30, 41, 59, 0.95) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* Metallic Orange-Yellow Border */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.5) 0%,
      rgba(139, 92, 246, 0.7) 25%,
      rgba(255, 215, 0, 1) 50%,
      rgba(139, 92, 246, 0.7) 75%,
      rgba(192, 192, 192, 0.5) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Premium Shadows */
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.1) inset,
    0 -1px 0 rgba(0, 0, 0, 0.5) inset,
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
  
  color: white;
  
  /* Ambient Orange Glow */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
      rgba(139, 92, 246, 0.08) 0%,
      transparent 60%
    );
    /* ⚡ OPTIMIZED: Static radial gradient - no rotation */
    pointer-events: none;
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
  margin: 0 0 20px 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3.5px;
  text-align: center;
  
  /* Orange-Yellow Gradient Text */
  background: linear-gradient(90deg,
    rgba(139, 92, 246, 0.9) 0%,
    rgba(255, 215, 0, 1) 50%,
    rgba(139, 92, 246, 0.9) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
`;

export const GaugeOuter = styled.div`
  position: relative;
  /* ⚡ RESIZED: 90% of original (220px → 198px) */
  width: 198px;
  height: 198px;
  border-radius: 50%;
  padding: 18px;
  
  /* Dark Metallic Face */
  background: 
    radial-gradient(circle at 35% 35%,
      rgba(50, 50, 50, 1) 0%,
      rgba(30, 30, 30, 1) 40%,
      rgba(15, 15, 15, 1) 70%,
      rgba(10, 10, 10, 1) 100%
    );
  
  /* Premium Bezel System - Scaled proportionally */
  box-shadow: 
    /* Outer aluminum rings */
    0 0 0 5px rgba(70, 70, 70, 0.9),
    0 0 0 7px rgba(110, 110, 110, 0.4),
    0 0 0 9px rgba(140, 140, 140, 0.25),
    /* Orange-yellow glow rings */
    0 0 0 12px rgba(139, 92, 246, 0.25),
    0 0 0 14px rgba(255, 215, 0, 0.2),
    /* Inner depth */
    inset 0 4px 22px rgba(0, 0, 0, 0.9),
    inset 0 -4px 22px rgba(139, 92, 246, 0.08),
    /* Outer shadow */
    0 23px 45px rgba(0, 0, 0, 0.5);
  
  /* Gradient border */
  border: 1px solid rgba(255, 215, 0, 0.25);
`;

export const GaugeSVG = styled('svg')`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* ⚡ RESIZED: filter scaled */
  filter: drop-shadow(0 0 18px rgba(0, 0, 0, 0.6));
  z-index: 2;
`;

export const GaugeTrack = styled('circle')`
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  /* ⚡ RESIZED: stroke-width 16 → 14.4 */
  stroke-width: 14.4;
`;

export const GaugeTicks = styled('g')``;

export const TickMark = styled('line')<{ $isMajor: boolean }>`
  stroke: ${props => props.$isMajor 
    ? 'rgba(255, 215, 0, 0.6)'   /* Yellow for major ticks */
    : 'rgba(255, 255, 255, 0.2)'  /* White for minor ticks */
  };
  /* ⚡ RESIZED: major 3→2.7, minor 1.5→1.35 */
  stroke-width: ${props => props.$isMajor ? '2.7' : '1.35'};
  stroke-linecap: round;
  filter: ${props => props.$isMajor 
    ? 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))'
    : 'none'
  };
`;

export const GaugeArc = styled('path')<{ $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  /* ⚡ RESIZED: stroke-width 14 → 12.6 */
  stroke-width: 12.6;
  stroke-linecap: round;
  /* ⚡ OPTIMIZED: Static glow instead of pulsing - Scaled */
  filter: drop-shadow(0 0 9px ${props => props.$color}) drop-shadow(0 0 5px ${props => props.$color});
  transition: stroke 0.5s ease, filter 0.3s ease;
  
  &:hover {
    filter: drop-shadow(0 0 13px ${props => props.$color}) drop-shadow(0 0 7px ${props => props.$color});
  }
`;

export const NumberLabel = styled.div<{ $angle: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  /* ⚡ RESIZED: Font size scaled */
  font-size: 0.34rem;
  font-weight: 700;
  font-family: 'Martica', 'Arial', sans-serif;
  
  /* Yellow gradient for numbers */
  background: linear-gradient(135deg,
    rgba(255, 235, 59, 0.9) 0%,
    rgba(255, 215, 0, 1) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 0 0 4px rgba(255, 215, 0, 0.4);
  transform: 
    translate(-50%, -50%)
    rotate(${props => props.$angle}deg)
    /* ⚡ RESIZED: translateY scaled (88px → 35px) */
    translateY(-35px)
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
  background: linear-gradient(180deg, 
    rgba(12, 12, 12, 0.98) 0%, 
    rgba(22, 22, 22, 1) 50%, 
    rgba(12, 12, 12, 0.98) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.2);
  /* ⚡ RESIZED: border-radius 10px → 9px, padding 10px 16px → 9px 14px, min-width 95px → 86px */
  border-radius: 9px;
  padding: 9px 14px;
  min-width: 86px;
  
  /* Premium LCD Display Shadow */
  box-shadow: 
    /* Inner glow */
    inset 0 0 9px rgba(255, 215, 0, 0.15),
    inset 0 2px 5px rgba(0, 0, 0, 0.9),
    /* Outer shadow */
    0 4px 9px rgba(0, 0, 0, 0.8),
    0 0 14px rgba(139, 92, 246, 0.2);
  
  /* Yellow bottom glow */
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25%;
    right: 25%;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.8) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.9);
    border-radius: 0 0 9px 9px;
  }
`;

export const ScoreDisplay = styled.div<{ $color: string }>`
  /* ⚡ RESIZED: font-size 1.6rem → 1.44rem */
  font-size: 1.44rem;
  font-weight: 700;
  line-height: 1;
  font-family: 'Martica', 'Arial', sans-serif;
  color: ${props => props.$color};
  
  /* Enhanced Glow - Scaled */
  text-shadow: 
    0 0 14px ${props => props.$color},
    0 0 29px ${props => props.$color}80,
    0 0 43px ${props => props.$color}40,
    0 2px 4px rgba(0, 0, 0, 0.9);
  
  /* ⚡ RESIZED: letter-spacing -2.7px */
  letter-spacing: -2.7px;
  filter: brightness(1.25);
`;

export const LevelLabel = styled.div`
  /* ⚡ RESIZED: font-size 0.7rem → 0.63rem, margin-bottom 5px → 4.5px, letter-spacing 1px → 0.9px */
  font-size: 0.63rem;
  opacity: 0.6;
  margin-bottom: 4.5px;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  font-weight: 600;
  
  /* Yellow-orange gradient */
  background: linear-gradient(90deg,
    rgba(139, 92, 246, 0.7) 0%,
    rgba(255, 215, 0, 0.9) 50%,
    rgba(139, 92, 246, 0.7) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const TrustText = styled.div`
  /* ⚡ RESIZED: font-size 0.65rem → 0.585rem, letter-spacing 3px → 2.7px */
  font-size: 0.585rem;
  letter-spacing: 2.7px;
  text-transform: uppercase;
  opacity: 0.5;
  font-weight: 600;
  
  /* Yellow-orange gradient */
  background: linear-gradient(90deg,
    rgba(139, 92, 246, 0.6) 0%,
    rgba(255, 215, 0, 0.8) 50%,
    rgba(139, 92, 246, 0.6) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const SpeedoText = styled.div`
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translateX(-50%);
  /* ⚡ RESIZED: font-size scaled */
  font-size: 0.585rem;
  font-weight: 700;
  letter-spacing: 2.7px;
  text-transform: uppercase;
  
  /* Yellow-orange gradient */
  background: linear-gradient(90deg,
    rgba(139, 92, 246, 0.6) 0%,
    rgba(255, 215, 0, 0.8) 50%,
    rgba(139, 92, 246, 0.6) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const NeedleContainer = styled.div<{ $score: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3.5px;
  height: 75px;
  
  /* Orange-Red Gradient Needle */
  background: linear-gradient(to top, 
    rgba(20, 20, 20, 1) 0%,
    rgba(50, 50, 50, 1) 10%,
    rgba(255, 102, 0, 1) 20%,   /* Dark orange */
    rgba(139, 92, 246, 1) 50%,  /* Orange */
    rgba(255, 215, 0, 1) 100%   /* Yellow tip */
  );
  
  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(${props => (props.$score * 270) / 100 - 225}deg);
  transition: transform 2.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  box-shadow: 
    0 0 20px rgba(139, 92, 246, 0.8),
    0 0 40px rgba(139, 92, 246, 0.4),
    inset 1px 0 0 rgba(255, 255, 255, 0.3);
  
  border-radius: 2px;
  z-index: 5;
  
  /* Yellow Tip */
  &::before {
    content: '';
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 18px solid #FFD700;  /* Gold */
    filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1));
  }
  
  /* Center Hub */
  &::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 28px;
    
    /* Orange-gold metallic hub */
    background: 
      radial-gradient(circle at 35% 35%, 
        rgba(255, 215, 0, 1) 0%,      /* Yellow center */
        rgba(139, 92, 246, 1) 40%,    /* Orange */
        rgba(204, 85, 0, 1) 100%      /* Dark orange */
      );
    
    border-radius: 50%;
    box-shadow: 
      /* Aluminum outer ring */
      0 0 0 3px rgba(80, 80, 80, 0.8),
      0 0 0 5px rgba(120, 120, 120, 0.4),
      /* Yellow glow */
      0 0 0 7px rgba(255, 215, 0, 0.2),
      /* Shadows */
      0 4px 12px rgba(0, 0, 0, 0.6),
      inset -2px -2px 4px rgba(0, 0, 0, 0.6),
      inset 2px 2px 4px rgba(255, 255, 255, 0.3);
  }
`;

export const LEDRing = styled.div<{ $color: string }>`
  position: absolute;
  /* Slide up by half its height (~90px) + move left (~90px) */
  top: calc(50% - 90px);
  left: calc(50% - 90px);
  transform: translate(-50%, -50%);
  width: 185px;
  height: 185px;
  border-radius: 50%;
  border: 2px solid ${props => props.$color};
  
  /* LED Glow Effect */
  box-shadow: 
    0 0 10px ${props => props.$color},
    0 0 20px ${props => props.$color}80,
    0 0 30px ${props => props.$color}40,
    inset 0 0 10px ${props => props.$color}40;
  
  opacity: 0.35;
  z-index: 1;
  /* ⚡ OPTIMIZED: Static overlay - no pulse */
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.5;
  }
`;

export const GlassReflection = styled.div`
  position: absolute;
  top: 18%;
  left: 18%;
  width: 35%;
  height: 25%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 100%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 8;
  filter: blur(2px);
`;

export const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  
  /* Gradient separator */
  border-top: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)),
    linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 215, 0, 0.3) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
`;

export const BadgeItem = styled.div<{ $level?: TrustLevel }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  position: relative;
  
  /* Glassmorphic badge */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(139, 92, 246, 0.12) 100%
  );
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.2) 0%,
      rgba(255, 215, 0, 0.15) 100%
    );
    border-color: rgba(255, 215, 0, 0.4);
    transform: translateY(-2px);
    box-shadow: 
      0 4px 12px rgba(139, 92, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  span.icon {
    font-size: 1rem;
    filter: drop-shadow(0 0 6px currentColor);
  }
  
  span.name {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    letter-spacing: 0.2px;
  }
`;

export const EmptyBadges = styled.div`
  text-align: center;
  padding: 20px;
  margin-top: 20px;
  padding-top: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  
  /* Gradient separator */
  border-top: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)),
    linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 215, 0, 0.3) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  color: rgba(255, 215, 0, 0.5);
`;

