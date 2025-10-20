// src/components/Profile/gauge/GaugeStyles.ts
// Gauge Styled Components - أنماط العداد الدائري
// 🎨 Premium Dark Aluminum Design with Orange-Yellow Theme
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import styled, { keyframes, css } from 'styled-components';

// ==================== ANIMATIONS ====================

// ⚡ OPTIMIZED: Removed all infinite keyframes
// Using static effects and hover interactions instead

// ==================== STYLED COMPONENTS ====================

export const CompletionContainer = styled.div`
  width: 100%;
  padding: 26px 22px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  
  /* 🎨 Premium Dark Glass with Metallic Frame */
  background: linear-gradient(135deg,
    rgba(45, 55, 72, 0.96) 0%,
    rgba(26, 32, 44, 0.98) 50%,
    rgba(45, 55, 72, 0.96) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* Metallic Orange-Yellow Border */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(45, 55, 72, 0.96), rgba(26, 32, 44, 0.98)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.5) 0%,
      rgba(255, 143, 16, 0.7) 25%,
      rgba(255, 215, 0, 1) 50%,
      rgba(255, 143, 16, 0.7) 75%,
      rgba(192, 192, 192, 0.5) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Premium Layered Shadows */
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.12) inset,
    0 -1px 0 rgba(0, 0, 0, 0.5) inset,
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
  
  color: white;
  
  /* Ambient Orange-Yellow Glow */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
      rgba(255, 215, 0, 0.06) 0%,
      rgba(255, 143, 16, 0.04) 40%,
      transparent 70%
    );
    /* ⚡ OPTIMIZED: Static radial gradient - no rotation */
    pointer-events: none;
  }
`;

export const GaugeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 22px;
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
    rgba(255, 143, 16, 0.85) 0%,
    rgba(255, 215, 0, 1) 30%,
    rgba(255, 235, 59, 1) 50%,
    rgba(255, 215, 0, 1) 70%,
    rgba(255, 143, 16, 0.85) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  /* ⚡ OPTIMIZED: Static glow - no shimmer */
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 4px rgba(255, 215, 0, 0.4));
  transition: filter 0.3s ease;
  
  &:hover {
    filter: drop-shadow(0 0 14px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
  }
`;

export const LEDRing = styled.div<{ $color: string }>`
  /* ⚡ DELETED: User requested removal of LED rings */
  display: none;
`;

export const GaugeOuter = styled.div`
  position: relative;
  /* ⚡ RESIZED: 90% of original (240px → 216px) */
  width: 216px;
  height: 216px;
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
    0 0 0 6px rgba(70, 70, 70, 0.9),
    0 0 0 8px rgba(110, 110, 110, 0.4),
    0 0 0 10px rgba(140, 140, 140, 0.25),
    /* Orange-yellow glow rings */
    0 0 0 12px rgba(255, 143, 16, 0.25),
    0 0 0 14px rgba(255, 215, 0, 0.2),
    /* Inner depth */
    inset 0 4px 22px rgba(0, 0, 0, 0.9),
    inset 0 -4px 22px rgba(255, 143, 16, 0.08),
    /* Outer shadow */
    0 25px 50px rgba(0, 0, 0, 0.5);
  
  /* Gradient border */
  border: 1px solid rgba(255, 215, 0, 0.25);
`;

export const GaugeSVG = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 24px rgba(0, 0, 0, 0.7));
  z-index: 2;
`;

export const GaugeTrack = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.04);
  /* ⚡ RESIZED: stroke-width 18 → 16.2 */
  stroke-width: 16.2;
`;

export const GaugeTicks = styled.g``;

export const GaugeArc = styled.path<{ $percentage: number; $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  /* ⚡ RESIZED: stroke-width 16 → 14.4 */
  stroke-width: 14.4;
  stroke-linecap: round;
  
  /* Enhanced Glow - Scaled */
  /* ⚡ OPTIMIZED: Static glow instead of pulsing */
  filter: 
    drop-shadow(0 0 9px ${props => props.$color})
    drop-shadow(0 0 13px ${props => props.$color}80);
  
  transition: stroke 0.6s ease, filter 0.3s ease;
  
  &:hover {
    filter: 
      drop-shadow(0 0 13px ${props => props.$color})
      drop-shadow(0 0 16px ${props => props.$color});
  }
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
  /* ⚡ RESIZED: border-radius 12px → 11px, padding 18px 26px → 16px 23px, min-width 145px → 130px */
  border-radius: 11px;
  padding: 16px 23px;
  min-width: 130px;
  
  /* Premium LCD Display Shadow */
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.9),
    inset 0 -2px 10px rgba(255, 143, 16, 0.1),
    0 4px 18px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 215, 0, 0.15);
  
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
    box-shadow: 0 0 6px rgba(255, 215, 0, 0.9);
    border-radius: 0 0 12px 12px;
  }
`;

export const PercentageDisplay = styled.div<{ $color: string }>`
  /* ⚡ RESIZED: font-size 3.8rem → 3.42rem */
  font-size: 3.42rem;
  font-weight: 700;
  line-height: 1;
  font-family: 'Courier New', monospace;
  color: ${props => props.$color};
  
  /* Enhanced Glow - Scaled */
  text-shadow: 
    0 0 14px ${props => props.$color},
    0 0 29px ${props => props.$color}80,
    0 0 43px ${props => props.$color}40,
    0 2px 4px rgba(0, 0, 0, 0.9);
  
  /* ⚡ RESIZED: letter-spacing -3px → -2.7px */
  letter-spacing: -2.7px;
  filter: brightness(1.25);
  
  &::after {
    content: '%';
    /* ⚡ RESIZED: font-size 2rem → 1.8rem, margin-left 6px → 5.4px */
    font-size: 1.8rem;
    margin-left: 5.4px;
    opacity: 0.85;
  }
`;

export const PercentageLabel = styled.div`
  /* ⚡ RESIZED: font-size 0.7rem → 0.63rem, margin-top 8px → 7.2px, letter-spacing 2.5px → 2.25px */
  font-size: 0.63rem;
  opacity: 0.6;
  margin-top: 7.2px;
  text-transform: uppercase;
  letter-spacing: 2.25px;
  font-weight: 600;
  
  /* Yellow-orange gradient */
  background: linear-gradient(90deg,
    rgba(255, 143, 16, 0.7) 0%,
    rgba(255, 215, 0, 0.9) 50%,
    rgba(255, 143, 16, 0.7) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const SpeedoText = styled.div`
  position: absolute;
  top: 78%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  
  /* Yellow-orange gradient */
  background: linear-gradient(90deg,
    rgba(255, 143, 16, 0.6) 0%,
    rgba(255, 215, 0, 0.85) 50%,
    rgba(255, 143, 16, 0.6) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.5));
`;

export const NeedleContainer = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 85px;
  
  /* Orange-to-Yellow Gradient Needle */
  background: linear-gradient(to top, 
    rgba(25, 25, 25, 1) 0%,
    rgba(60, 60, 60, 1) 8%,
    rgba(255, 102, 0, 1) 18%,   /* Dark orange base */
    rgba(255, 143, 16, 1) 40%,  /* Orange middle */
    rgba(255, 159, 42, 1) 70%,  /* Light orange */
    rgba(255, 215, 0, 1) 100%   /* Gold tip */
  );
  
  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(${props => (props.$percentage * 270) / 100 - 225}deg);
  transition: transform 2.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Multi-layer Glow */
  box-shadow: 
    0 0 16px rgba(255, 143, 16, 0.9),
    0 0 32px rgba(255, 143, 16, 0.5),
    0 0 48px rgba(255, 215, 0, 0.3),
    inset 1px 0 0 rgba(255, 255, 255, 0.35);
  
  border-radius: 2px;
  z-index: 5;
  
  /* Gold/Yellow Arrow Tip */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 20px solid #FFD700;  /* Pure gold */
    filter: drop-shadow(0 0 14px rgba(255, 215, 0, 1));
  }
  
  /* Metallic Orange-Gold Center Hub */
  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    
    /* Radial orange-gold gradient */
    background: 
      radial-gradient(circle at 35% 35%, 
        rgba(255, 235, 59, 1) 0%,     /* Bright yellow center */
        rgba(255, 215, 0, 1) 20%,     /* Gold */
        rgba(255, 143, 16, 1) 50%,    /* Orange */
        rgba(204, 85, 0, 1) 100%      /* Dark orange edge */
      );
    
    border-radius: 50%;
    
    /* Premium Bezel */
    box-shadow: 
      /* Aluminum rings */
      0 0 0 3px rgba(90, 90, 90, 0.9),
      0 0 0 5px rgba(130, 130, 130, 0.5),
      0 0 0 7px rgba(160, 160, 160, 0.25),
      /* Yellow glow ring */
      0 0 0 9px rgba(255, 215, 0, 0.2),
      /* Depth shadows */
      0 5px 14px rgba(0, 0, 0, 0.7),
      inset -3px -3px 5px rgba(0, 0, 0, 0.7),
      inset 3px 3px 5px rgba(255, 255, 255, 0.35);
  }
`;

export const TickMark = styled.line<{ $isMajor: boolean }>`
  stroke: ${props => props.$isMajor 
    ? 'rgba(255, 215, 0, 0.7)'    /* Gold for major ticks */
    : 'rgba(255, 255, 255, 0.25)'  /* White for minor ticks */
  };
  stroke-width: ${props => props.$isMajor ? '3.5' : '1.8'};
  stroke-linecap: round;
  filter: ${props => props.$isMajor 
    ? 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))'
    : 'none'
  };
`;

export const NumberLabel = styled.div<{ $angle: number; $value: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  
  /* Yellow-orange gradient for numbers */
  background: linear-gradient(135deg,
    rgba(255, 235, 59, 0.95) 0%,
    rgba(255, 215, 0, 1) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
  transform: 
    translate(-50%, -50%)
    rotate(${props => props.$angle}deg)
    translateY(-95px)
    rotate(${props => -props.$angle}deg);
  z-index: 3;
`;

export const GlassReflection = styled.div`
  position: absolute;
  top: 15%;
  left: 15%;
  width: 40%;
  height: 30%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 8;
  filter: blur(3px);
`;

export const ChecklistItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 0.8rem;
  border-radius: 8px;
  margin-bottom: 4px;
  
  /* Glassmorphic item */
  background: ${props => props.$completed
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(67, 160, 71, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
  };
  
  border: 1px solid ${props => props.$completed
    ? 'rgba(76, 175, 80, 0.25)'
    : 'rgba(255, 255, 255, 0.08)'
  };
  
  color: ${props => props.$completed
    ? 'rgba(255, 255, 255, 0.95)'
    : 'rgba(255, 255, 255, 0.5)'
  };
  
  opacity: ${props => props.$completed ? 1 : 0.6};
  
  box-shadow: ${props => props.$completed
    ? '0 2px 8px rgba(76, 175, 80, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
    : '0 1px 3px rgba(0, 0, 0, 0.2)'
  };
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Yellow left accent for completed */
  ${props => props.$completed && `
    border-left: 3px solid rgba(255, 215, 0, 0.6);
  `}
  
  svg {
    flex-shrink: 0;
    color: ${props => props.$completed
      ? '#4CAF50'
      : 'rgba(255, 255, 255, 0.3)'
    };
    filter: ${props => props.$completed
      ? 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.6))'
      : 'none'
    };
  }
  
  &:hover {
    opacity: 1;
    background: ${props => props.$completed
      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.22) 0%, rgba(67, 160, 71, 0.15) 100%)'
      : 'linear-gradient(135deg, rgba(255, 143, 16, 0.08) 0%, rgba(255, 215, 0, 0.05) 100%)'
    };
    transform: translateX(3px);
  }
`;
