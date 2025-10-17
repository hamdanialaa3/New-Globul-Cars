// src/components/Profile/trust/TrustGaugeStyles.ts
// Trust Gauge Styled Components
// 🎨 Premium Aluminum & Orange Theme with Glassmorphism
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import styled, { keyframes, css } from 'styled-components';
import { TrustLevel } from '../../../services/profile/trust-score-service';

// ==================== ANIMATIONS ====================

export const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 12px currentColor); }
  50% { filter: drop-shadow(0 0 24px currentColor); }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.06); opacity: 0.9; }
`;

export const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

export const rotate = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

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
      rgba(255, 143, 16, 0.7) 25%,
      rgba(255, 215, 0, 1) 50%,
      rgba(255, 143, 16, 0.7) 75%,
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
      rgba(255, 143, 16, 0.08) 0%,
      transparent 60%
    );
    ${css`animation: ${rotate} 20s linear infinite;`}
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
    rgba(255, 143, 16, 0.9) 0%,
    rgba(255, 215, 0, 1) 50%,
    rgba(255, 143, 16, 0.9) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
`;

export const GaugeOuter = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  padding: 20px;
  
  /* Dark Metallic Face */
  background: 
    radial-gradient(circle at 35% 35%,
      rgba(40, 40, 40, 1) 0%,
      rgba(20, 20, 20, 1) 50%,
      rgba(10, 10, 10, 1) 100%
    );
  
  /* Layered Bezel */
  box-shadow: 
    /* Outer aluminum ring */
    0 0 0 6px rgba(60, 60, 60, 0.8),
    0 0 0 8px rgba(100, 100, 100, 0.3),
    /* Orange-yellow glow ring */
    0 0 0 10px rgba(255, 143, 16, 0.2),
    0 0 0 12px rgba(255, 215, 0, 0.15),
    /* Inner shadows */
    inset 0 4px 20px rgba(0, 0, 0, 0.9),
    inset 0 -4px 20px rgba(255, 143, 16, 0.05),
    /* Outer shadow */
    0 25px 50px rgba(0, 0, 0, 0.5);
  
  /* Border with gradient */
  border: 1px solid rgba(255, 215, 0, 0.2);
`;

export const GaugeSVG = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.6));
  z-index: 2;
`;

export const GaugeTrack = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 16;
`;

export const GaugeTicks = styled.g``;

export const TickMark = styled.line<{ $isMajor: boolean }>`
  stroke: ${props => props.$isMajor 
    ? 'rgba(255, 215, 0, 0.6)'   /* Yellow for major ticks */
    : 'rgba(255, 255, 255, 0.2)'  /* White for minor ticks */
  };
  stroke-width: ${props => props.$isMajor ? '3' : '1.5'};
  stroke-linecap: round;
  filter: ${props => props.$isMajor 
    ? 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))'
    : 'none'
  };
`;

export const GaugeArc = styled.path<{ $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 14;
  stroke-linecap: round;
  filter: drop-shadow(0 0 16px ${props => props.$color});
  ${css`animation: ${glow} 3s ease-in-out infinite;`}
  transition: stroke 0.5s ease;
`;

export const NumberLabel = styled.div<{ $angle: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  
  /* Yellow gradient for numbers */
  background: linear-gradient(135deg,
    rgba(255, 235, 59, 0.9) 0%,
    rgba(255, 215, 0, 1) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
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
  background: linear-gradient(180deg, 
    rgba(10, 10, 10, 0.95) 0%, 
    rgba(20, 20, 20, 1) 50%, 
    rgba(10, 10, 10, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.15);
  border-radius: 10px;
  padding: 10px 16px;
  min-width: 95px;
  
  /* Premium Display Shadow */
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.9),
    inset 0 -2px 8px rgba(255, 143, 16, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 215, 0, 0.1);
  
  /* Yellow bottom accent */
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: rgba(255, 215, 0, 0.6);
    box-shadow: 0 0 4px rgba(255, 215, 0, 0.8);
  }
`;

export const ScoreDisplay = styled.div<{ $color: string }>`
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  font-family: 'Courier New', monospace;
  color: ${props => props.$color};
  text-shadow: 
    0 0 12px ${props => props.$color},
    0 0 24px ${props => props.$color}80,
    0 2px 4px rgba(0, 0, 0, 0.9);
  letter-spacing: -1px;
  filter: brightness(1.3);
`;

export const LevelLabel = styled.div<{ $color: string }>`
  font-size: 0.7rem;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => props.$color};
  opacity: 0.9;
  font-weight: 600;
  filter: drop-shadow(0 0 6px ${props => props.$color}80);
`;

export const TrustText = styled.div`
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  
  /* Yellow-orange gradient */
  background: linear-gradient(90deg,
    rgba(255, 143, 16, 0.6) 0%,
    rgba(255, 215, 0, 0.8) 50%,
    rgba(255, 143, 16, 0.6) 100%
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
    rgba(255, 143, 16, 1) 50%,  /* Orange */
    rgba(255, 215, 0, 1) 100%   /* Yellow tip */
  );
  
  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(${props => (props.$score * 270) / 100 - 225}deg);
  transition: transform 2.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  box-shadow: 
    0 0 20px rgba(255, 143, 16, 0.8),
    0 0 40px rgba(255, 143, 16, 0.4),
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
        rgba(255, 143, 16, 1) 40%,    /* Orange */
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
  /* إصعاد بمقدار نصف حجمه (~90px) + حركة لليسار (~90px) */
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
  ${css`animation: ${pulse} 4s ease-in-out infinite;`}
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
    rgba(255, 143, 16, 0.12) 100%
  );
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg,
      rgba(255, 143, 16, 0.2) 0%,
      rgba(255, 215, 0, 0.15) 100%
    );
    border-color: rgba(255, 215, 0, 0.4);
    transform: translateY(-2px);
    box-shadow: 
      0 4px 12px rgba(255, 143, 16, 0.3),
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
