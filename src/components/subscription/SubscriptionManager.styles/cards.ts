import defaultStyled, { css } from 'styled-components';

const styled = defaultStyled;
import subscriptionTheme from '../subscription-theme';
import { fadeInUp, pulse, shimmer, rotateIn, scaleIn, float } from './animations';

export const Card = styled.div<{ $highlight?: boolean; $free?: boolean }>`
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: ${p => p.$highlight
    ? `0 20px 60px ${() => subscriptionTheme.shadows.small}`
    : 'var(--shadow-lg)'
  };
  border: ${p => p.$highlight ? '3px solid var(--accent-primary)' : '2px solid var(--border-primary)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out;
  transform-origin: center;
  overflow: hidden;
  color: var(--text-primary);

  ${p => p.$highlight && `
    transform: scale(1.05);
    z-index: 10;
  `}

  /* ✅ On touch devices, do NOT pre-scale the highlighted card */
  @media (hover: none), (pointer: coarse) {
    ${p => p.$highlight && `
      transform: none !important;
    `}
  }

  /* ✅ IMPORTANT: Prevent "tap = hover" zoom on touch devices */
  @media (hover: none), (pointer: coarse) {
    transform: none !important;
    &:hover {
      transform: none !important;
      box-shadow: ${p => p.$highlight
    ? `0 20px 60px ${() => subscriptionTheme.shadows.small}`
    : 'var(--shadow-lg)'
  };
    }
  }

  /* ✅ Only allow hover zoom on real mouse/trackpad devices */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: ${p => p.$highlight ? 'scale(1.08)' : 'scale(1.03)'};
      box-shadow: ${p => p.$highlight
    ? `0 25px 70px ${() => subscriptionTheme.shadows.small}`
    : 'var(--shadow-xl)'
  };
    }
  }

  /* Shimmer effect for popular plan */
  ${p => p.$highlight && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.15),
        transparent
      );
      animation: ${shimmer} 3s infinite;
    }
  `}
`;

export const Badge = styled.div`
  position: absolute;
  top: 20px;
  right: -35px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  padding: 0.5rem 3rem;
  font-weight: 700;
  font-size: 0.85rem;
  transform: rotate(45deg);
  box-shadow: 0 4px 15px ${() => subscriptionTheme.shadows.medium};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;

  svg {
    width: 14px;
    height: 14px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

export const IconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 25px ${() => subscriptionTheme.shadows.small};
  animation: ${rotateIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }

  &:hover {
    animation: ${float} 2s ease-in-out infinite;
  }
`;

export const PlanName = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.5rem;
`;

export const PlanDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  min-height: 40px;
`;

export const Price = styled.div<{ $free?: boolean }>`
  text-align: center;
  margin: 1.5rem 0;
  
  .amount {
    font-size: ${p => p.$free ? '2rem' : '2.75rem'};
    font-weight: 700;
    background: ${p => p.$free
    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
    : `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`
  };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .currency {
    font-size: 1.5rem;
    opacity: 0.8;
  }
  
  .period {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
    display: block;
    margin-top: 0.5rem;
  }

  .original-price {
    font-size: 1rem;
    color: #9ca3af;
    text-decoration: line-through;
    margin-top: 0.25rem;
  }
`;

export const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  min-height: 280px;
`;

export const FeatureItem = styled.li<{ $highlight?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.3s ease;
  
  svg {
    width: 18px;
    height: 18px;
    color: ${p => p.$highlight ? 'var(--accent-primary)' : 'var(--accent-secondary)'};
    flex-shrink: 0;
    margin-top: 1px;
    transition: all 0.3s ease;
  }

  &:hover {
    padding-left: 0.5rem;
    
    svg {
      transform: scale(1.2);
    }
  }

  ${p => p.$highlight && `
    font-weight: 600;
    color: var(--accent-primary);
  `}
`;

export const Button = styled.button<{ $selected?: boolean; $free?: boolean }>`
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  ${p => p.$selected ? `
    background: rgba(229, 231, 235, 0.5);
    color: #6c757d;
    cursor: default;
    border: 2px solid #e5e7eb;
  ` : p.$free ? `
    background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(107, 114, 128, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  ` : `
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
    box-shadow: 
      0 4px 20px ${() => subscriptionTheme.shadows.small},
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 2px solid transparent;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: width 0.4s ease, height 0.4s ease;
      pointer-events: none;
    }
    
    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 
        0 10px 30px ${() => subscriptionTheme.shadows.medium},
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      border-color: ${() => subscriptionTheme.borders.primary};
      
      &::before {
        width: 200px;
        height: 200px;
      }
      
      svg {
        transform: scale(1.15) translateX(3px);
      }
    }

    &:active {
      transform: translateY(-1px) scale(0.98);
      box-shadow: 
        0 4px 15px ${() => subscriptionTheme.shadows.small},
        inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
    pointer-events: none;
  }

  &:active::after {
    width: 300px;
    height: 300px;
  }
`;

export const MoneyBackGuarantee = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${() => subscriptionTheme.backgrounds.overlay};
  border-radius: 12px;
  color: var(--accent-primary);
  font-size: 0.9rem;
  font-weight: 600;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PopularityIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: #fbbf24;
    animation: ${scaleIn} 0.3s ease-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.1s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.3s; }
    &:nth-child(5) { animation-delay: 0.4s; }
  }
`;
