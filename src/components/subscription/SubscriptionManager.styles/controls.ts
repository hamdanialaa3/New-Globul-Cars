import defaultStyled from 'styled-components';

const styled = defaultStyled;
import subscriptionTheme from '../subscription-theme';
import { fadeInUp, pulse } from './animations';

export const IntervalToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  background: var(--bg-card);
  padding: 0.5rem;
  border-radius: 60px;
  box-shadow: 
    var(--shadow-lg),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-primary);
  overflow: visible;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 62px;
    background: linear-gradient(135deg, 
      transparent 0%, 
      ${() => subscriptionTheme.backgrounds.overlay} 50%, 
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
  }
`;

export const IntervalButton = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  border: none;
  background: ${p => p.$active
    ? `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`
    : 'transparent'
  };
  color: ${p => p.$active ? 'white' : 'var(--text-secondary)'};
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${p => p.$active
    ? `0 8px 25px ${() => subscriptionTheme.shadows.medium}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
    : 'none'
  };
  z-index: ${p => p.$active ? '2' : '1'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.3px;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: ${p => p.$active ? 'scale(1.1) rotate(-5deg)' : 'scale(1.05)'};
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50px;
    background: ${p => p.$active
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)'
    : 'transparent'
  };
    opacity: ${p => p.$active ? '1' : '0'};
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: ${p => p.$active ? 'translateY(-3px) scale(1.02)' : 'translateY(-1px)'};
    box-shadow: ${p => p.$active
    ? `0 12px 35px ${() => subscriptionTheme.shadows.large}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
    : '0 4px 15px rgba(0, 0, 0, 0.15)'
  };
    background: ${p => p.$active
    ? `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`
    : subscriptionTheme.backgrounds.hover
  };
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50px;
    opacity: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
    transform: scale(0);
    transition: transform 0.5s ease, opacity 0.5s ease;
  }

  &:active::after {
    transform: scale(1);
    opacity: 1;
    transition: transform 0s, opacity 0s;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.75rem;
    font-size: 0.95rem;
  }
`;

export const SavingsBadge = styled.span`
  position: absolute;
  top: -18px;
  right: -15px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  padding: 0.45rem 1.1rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 
    0 4px 15px ${() => subscriptionTheme.shadows.medium},
    0 2px 8px ${() => subscriptionTheme.shadows.small},
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 10;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

export const CarouselArrow = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'left' ? 'left: -14px;' : 'right: -14px;')}
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;

  color: white;

  &:hover {
    background: rgba(0, 0, 0, 0.35);
    transform: translateY(-50%) scale(1.04);
  }

  &:disabled {
    opacity: 0.25;
    cursor: default;
    transform: translateY(-50%);
  }

  @media (min-width: 1201px) {
    display: none;
  }
`;
