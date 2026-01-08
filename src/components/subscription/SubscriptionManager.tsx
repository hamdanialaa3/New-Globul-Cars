import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Crown, TrendingUp, Building2, CheckCircle, Zap, Shield, Sparkles, Star, Car, Bot, TrendingUp as ChartUp, Target, Lightbulb, Users, MapPin, Plug, Palette, UserCog, Link2, FileText, Phone, CheckSquare, Camera, MessageSquare, Search, Image, Battery, BadgeCheck, BarChart3, Edit3, Headphones, Calendar, CalendarCheck, Eye, ArrowRight, ChevronLeft, ChevronRight, Check, Upload } from 'lucide-react';
import billingService from '../../features/billing/BillingService';
import type { BillingInterval, Plan } from '../../features/billing/types';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
// ✅ استيراد ملف الإعدادات المركزي
import subscriptionTheme, { getPrimaryGradient, getPrimaryGradientWithMiddle, getShadowColor, getBorderColor } from './subscription-theme';
import { logger } from '../../services/logger-service';


// ==================== ANIMATIONS ====================
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const rotateIn = keyframes`
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
`;

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const IntervalToggle = styled.div`
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

const IntervalButton = styled.button<{ $active: boolean }>`
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

const SavingsBadge = styled.span`
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

// ✅ Responsive horizontal plans layout (no wrapping)
// - Wide screens: 3 cards visible without scrolling
// - Narrow screens: horizontal carousel with scroll-snap + navigation arrows
const PlansCarousel = styled.div`
  position: relative;
  margin-top: 3rem;
`;

// ✅ Mobile "tap to expand" overlay (keeps subscribe button clickable)
const ExpandOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
`;

const ExpandSheet = styled.div`
  width: min(520px, 94vw);
  max-height: 90vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 18px;
`;

const ExpandHint = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
`;

const PlansViewport = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  overflow-y: visible;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 0.25rem 0.25rem 1rem;
  scroll-padding: 0.25rem;

  /* Hide scrollbar (cross-browser) */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Prevent vertical stacking at all widths */
  flex-wrap: nowrap;

  /* Desktop: keep 3 cards visible; still no wrap */
  @media (min-width: 1201px) {
    overflow-x: hidden;
    justify-content: center;
  }

  /* ✅ Mobile portrait: show ONE full card (no peeking) */
  @media (max-width: 600px) {
    gap: 0;
    padding: 0 0 1rem;
    scroll-padding: 0;
  }
`;

const CarouselItem = styled.div`
  flex: 0 0 360px;
  scroll-snap-align: center;
  scroll-snap-stop: always;

  @media (max-width: 900px) {
    flex-basis: 340px;
  }

  @media (max-width: 600px) {
    /* One card per viewport width */
    flex: 0 0 100%;
    scroll-snap-align: start;
  }
`;

const CarouselArrow = styled.button<{ $side: 'left' | 'right' }>`
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

const Card = styled.div<{ $highlight?: boolean; $free?: boolean }>`
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.75rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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

const Badge = styled.div`
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

const IconWrapper = styled.div<{ $color: string }>`
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

const PlanName = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.5rem;
`;

const PlanDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  min-height: 40px;
`;

const Price = styled.div<{ $free?: boolean }>`
  text-align: center;
  margin: 1.5rem 0;
  
  .amount {
    font-size: ${p => p.$free ? '2rem' : '2.75rem'};
    font-weight: 700;
    width: 100%;
    height: 100%;
    background: ${p => p.$free
    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
    : `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`
  };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-color: transparent;
    border: none;
    border-image: none;
    border-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    color: transparent;
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

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  min-height: 280px;
`;

const FeatureItem = styled.li<{ $highlight?: boolean }>`
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

const Button = styled.button<{ $selected?: boolean; $free?: boolean }>`
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
  
  /* ✅ FIX: إزالة الإطار الأسود وإضافة تصميم عين */
  
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
    /* ✅ تصميم جديد: شكل عين مع خلفية برتقالية */
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
      box-shadow: 
      0 4px 20px ${() => subscriptionTheme.shadows.small},
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 2px solid transparent;
    
    /* ✅ تأثير عين: دائرة في المنتصف */
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
      
      /* ✅ توسيع تأثير العين عند hover */
      &::before {
        width: 200px;
        height: 200px;
      }
      
      /* ✅ تحريك الأيقونة */
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

  /* ✅ أيقونة داخل الزر */
  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  /* Ripple effect */
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

const MoneyBackGuarantee = styled.div`
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

const PopularityIndicator = styled.div`
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

// ==================== COMPONENT ====================
const SubscriptionManagerEnhanced: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const isBg = language === 'bg';
  const plans = useMemo(() => billingService.getAvailablePlans(), []);

  // ✅ Carousel state (mobile/tablet): keep cards horizontal + arrows
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ✅ Tap-to-expand state (mobile)
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isCoarsePointer = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(pointer: coarse)').matches ?? false;
  }, []);

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  }, []);

  const scrollByOneCard = useCallback((direction: 'left' | 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    // ✅ Scroll by "one page" on mobile (full viewport), otherwise by one card
    const isMobile = window.matchMedia?.('(max-width: 600px)').matches ?? false;
    const delta = isMobile
      ? el.clientWidth * (direction === 'left' ? -1 : 1)
      : (360 + 32) * (direction === 'left' ? -1 : 1); // card + gap
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const closeExpanded = useCallback(() => setExpandedPlanId(null), []);
  const featureLabels: Record<string, { bg: string; en: string; icon: React.ReactNode }> = {
    bulk_upload: { bg: 'Групово качване', en: 'Bulk upload', icon: <Upload size={18} /> },
    featured_badge: { bg: 'Отличена обява', en: 'Featured badge', icon: <Star size={18} /> },
    basic_analytics: { bg: 'Основни анализи', en: 'Basic analytics', icon: <BarChart3 size={18} /> },
    advanced_analytics: { bg: 'Разширени анализи', en: 'Advanced analytics', icon: <ChartUp size={18} /> },
    api_access: { bg: 'API достъп', en: 'API access', icon: <Plug size={18} /> },
    webhooks: { bg: 'Webhooks', en: 'Webhooks', icon: <Link2 size={18} /> },
    campaigns: { bg: 'Кампании и имейл', en: 'Campaigns & email', icon: <Target size={18} /> },
    priority_support: { bg: 'Приоритетна поддръжка', en: 'Priority support', icon: <Headphones size={18} /> },
    account_manager: { bg: 'Личен мениджър', en: 'Account manager', icon: <UserCog size={18} /> },
    consultations: { bg: 'Консултации', en: 'Consultations', icon: <MessageSquare size={18} /> },
    custom_branding: { bg: 'Персонален брандинг', en: 'Custom branding', icon: <Palette size={18} /> },
    featured_listing: { bg: 'Премиум видимост', en: 'Premium visibility', icon: <Sparkles size={18} /> },
  };

  const getFeaturesList = (plan: Plan) => {
    const items: { icon: React.ReactNode; text: string }[] = [];

    // Listing cap
    const cap = plan.listingCap === -1
      ? (isBg ? 'Неограничени обяви' : 'Unlimited listings')
      : `${plan.listingCap} ${isBg ? 'обяви/месец' : 'listings/mo'}`;
    items.push({ icon: <Car size={18} />, text: cap });

    // Feature flags
    plan.features.forEach((key) => {
      const label = featureLabels[key];
      if (label) {
        items.push({ icon: label.icon, text: isBg ? label.bg : label.en });
      }
    });

    // Always include chat/contact
    items.push({ icon: <MessageSquare size={18} />, text: isBg ? 'Чат с купувачи' : 'Chat with buyers' });

    return items;
  };

  const onOverlayTouchStart = useCallback((e: React.TouchEvent) => {
    const t0 = e.touches?.[0];
    if (!t0) return;
    touchStartRef.current = { x: t0.clientX, y: t0.clientY };
  }, []);

  const onOverlayTouchMove = useCallback((e: React.TouchEvent) => {
    // ✅ Any small movement closes (as requested)
    const t0 = e.touches?.[0];
    const start = touchStartRef.current;
    if (!t0 || !start) return;
    const dx = Math.abs(t0.clientX - start.x);
    const dy = Math.abs(t0.clientY - start.y);
    if (dx > 6 || dy > 6) {
      closeExpanded();
    }
  }, [closeExpanded]);

  // Load current subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (currentUser) {
        const subscription = await billingService.getCurrentSubscription(currentUser.uid);
        if (subscription) {
          setCurrentPlan(subscription.planId);
        }
      }
    };
    loadSubscription();
  }, [currentUser]);

  // Keep carousel arrow state in sync with scroll/resize/interval changes
  useEffect(() => {
    updateScrollState();
    const el = viewportRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, interval]);

  // Close expanded on Escape (desktop/dev convenience)
  useEffect(() => {
    if (!expandedPlanId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExpanded();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedPlanId, closeExpanded]);

  const handleSubscribe = async (plan: Plan) => {
    if (!currentUser) {
      alert(isBg ? 'Моля, влезте в профила си' : 'Please log in first');
      return;
    }

    if (plan.id === 'free') {
      alert(isBg ? 'Това е безплатният план' : 'This is the free plan');
      return;
    }

    setLoading(true);
    try {
      const { url } = await billingService.createCheckoutSession(
        currentUser.uid,
        plan.id as any,
        interval
      );

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: unknown) {
      logger.error('Subscription error:', error as Error);
      alert(isBg
        ? 'Грешка при създаване на сесия. Опитайте отново.'
        : 'Error creating checkout session. Please try again.'
      );
      setLoading(false);
    }
  };





  const getPlanIcon = (planId: string) => {
    if (planId === 'free') return Crown;
    if (planId === 'dealer') return TrendingUp;
    return Building2;
  };

  const getPlanColor = (planId: string) => {
    if (planId === 'free') return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    if (planId === 'dealer') return `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`;
    return 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)';
  };

  const getOriginalPrice = (planId: string, interval: BillingInterval) => {
    if (planId === 'free') return null;
    if (interval === 'monthly') return null;

    if (planId === 'dealer') {
      return '€348'; // 29 * 12 = 348, now 300 (save 48)
    }
    if (planId === 'company') {
      return '€2,388'; // 199 * 12 = 2388, now 1600 (save 788)
    }
    return null;
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>
          {isBg ? 'Изберете вашия план' : 'Choose Your Plan'}
        </Title>
        <Subtitle>
          {isBg
            ? 'Продавайте повече автомобили с нашите професионални инструменти и AI анализи'
            : 'Sell more cars with our professional tools and AI analytics'
          }
        </Subtitle>
      </Header>

      {/* Interval Toggle */}
      <IntervalToggle>
        <IntervalButton
          $active={interval === 'monthly'}
          onClick={() => setInterval('monthly')}
        >
          <Calendar size={18} />
          {isBg ? 'Месечно' : 'Monthly'}
        </IntervalButton>
        <IntervalButton
          $active={interval === 'annual'}
          onClick={() => setInterval('annual')}
        >
          <CalendarCheck size={18} />
          {isBg ? 'Годишно' : 'Annual'}
          {interval === 'annual' && (
            <SavingsBadge>
              {isBg ? 'Спести до 33%' : 'Save up to 33%'}
            </SavingsBadge>
          )}
        </IntervalButton>
      </IntervalToggle>

      {/* Plans (always horizontal; carousel + arrows on small widths) */}
      <PlansCarousel>
        {/* ✅ Expanded mobile view */}
        <ExpandOverlay
          $open={!!expandedPlanId}
          onClick={closeExpanded}
          onTouchStart={onOverlayTouchStart}
          onTouchMove={onOverlayTouchMove}
          role="dialog"
          aria-modal="true"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ExpandSheet>
              {expandedPlanId && (() => {
                const plan = plans.find(p => p.id === expandedPlanId);
                if (!plan) return null;
                const isCurrent = currentPlan === plan.id;
                const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
                const features = getFeaturesList(plan);
                const Icon = getPlanIcon(plan.id);
                const originalPrice = getOriginalPrice(plan.id, interval);

                return (
                  <Card $highlight={plan.popular} $free={plan.id === 'free'} style={{ animationDelay: '0s' }}>
                    {plan.popular && (
                      <>
                        <Badge>
                          <Zap fill="white" />
                          {isBg ? 'Най-популярен' : 'Most Popular'}
                        </Badge>
                        <PopularityIndicator>
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                          <Star fill="#fbbf24" />
                        </PopularityIndicator>
                      </>
                    )}

                    <IconWrapper $color={getPlanColor(plan.id)}>
                      <Icon />
                    </IconWrapper>

                    <PlanName>
                      {isBg ? plan.name.bg : plan.name.en}
                    </PlanName>

                    <PlanDescription>
                      {isBg ? plan.description.bg : plan.description.en}
                    </PlanDescription>

                    <Price $free={plan.id === 'free'}>
                      {plan.id === 'free' ? (
                        <div className="amount">
                          {isBg ? 'Безплатно' : 'Free'}
                        </div>
                      ) : (
                        <>
                          <div className="amount">
                            <span className="currency">€</span>
                            {price}
                          </div>
                          <div className="period">
                            {isBg
                              ? (interval === 'monthly' ? 'на месец' : 'на година')
                              : (interval === 'monthly' ? 'per month' : 'per year')
                            }
                          </div>
                          {originalPrice && interval === 'annual' && (
                            <div className="original-price">
                              {isBg ? `Обикновено ${originalPrice}` : `Usually ${originalPrice}`}
                            </div>
                          )}
                        </>
                      )}
                    </Price>

                    <FeatureList>
                      {features.map((feature, idx) => (
                        <FeatureItem key={idx}>
                          {feature.icon}
                          <span>{feature.text}</span>
                        </FeatureItem>
                      ))}
                    </FeatureList>



                    <Button
                      $selected={isCurrent}
                      $free={plan.id === 'free'}
                      onClick={() => !isCurrent && handleSubscribe(plan)}
                      disabled={loading || isCurrent || plan.id === 'free'}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle size={20} />
                          {isBg ? 'Текущ план' : 'Current Plan'}
                        </>
                      ) : plan.id === 'free' ? (
                        <>
                          <Eye size={20} />
                          {isBg ? 'Започнете безплатно' : 'Start Free'}
                        </>
                      ) : loading ? (
                        <>
                          <Zap size={20} className="animate-spin" />
                          {isBg ? 'Зареждане...' : 'Loading...'}
                        </>
                      ) : (
                        <>
                          <Eye size={20} />
                          {isBg ? 'Избери план' : 'Select Plan'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </Button>

                    {plan.id !== 'free' && (
                      <MoneyBackGuarantee>
                        <Shield />
                        <span>{isBg ? '30-дневна гаранция за връщане на пари' : '30-Day Money-Back Guarantee'}</span>
                      </MoneyBackGuarantee>
                    )}
                  </Card>
                );
              })()}
            </ExpandSheet>
            <ExpandHint>
              {isBg ? 'Докоснете извън картата أو حرّك قليلاً للإغلاق' : 'Tap outside or move slightly to close'}
            </ExpandHint>
          </div>
        </ExpandOverlay>

        <CarouselArrow
          $side="left"
          onClick={() => scrollByOneCard('left')}
          disabled={!canScrollLeft}
          aria-label="Previous plan"
          type="button"
        >
          <ChevronLeft size={22} />
        </CarouselArrow>

        <CarouselArrow
          $side="right"
          onClick={() => scrollByOneCard('right')}
          disabled={!canScrollRight}
          aria-label="Next plan"
          type="button"
        >
          <ChevronRight size={22} />
        </CarouselArrow>

        <PlansViewport ref={viewportRef}>
          {plans.map((plan, index) => {
            const isCurrent = currentPlan === plan.id;
            const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
            const features = getFeaturesList(plan);
            const Icon = getPlanIcon(plan.id);
            const originalPrice = getOriginalPrice(plan.id, interval);

            return (
              <CarouselItem key={plan.id}>
                <Card
                  $highlight={plan.popular}
                  $free={plan.id === 'free'}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => {
                    if (isCoarsePointer) setExpandedPlanId(plan.id);
                  }}
                >
                  {plan.popular && (
                    <>
                      <Badge>
                        <Zap fill="white" />
                        {isBg ? 'Най-популярен' : 'Most Popular'}
                      </Badge>
                      <PopularityIndicator>
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                        <Star fill="#fbbf24" />
                      </PopularityIndicator>
                    </>
                  )}

                  <IconWrapper $color={getPlanColor(plan.id)}>
                    <Icon />
                  </IconWrapper>

                  <PlanName>
                    {isBg ? plan.name.bg : plan.name.en}
                  </PlanName>

                  <PlanDescription>
                    {isBg ? plan.description.bg : plan.description.en}
                  </PlanDescription>

                  <Price $free={plan.id === 'free'}>
                    {plan.id === 'free' ? (
                      <div className="amount">
                        {isBg ? 'Безплатно' : 'Free'}
                      </div>
                    ) : (
                      <>
                        <div className="amount">
                          <span className="currency">€</span>
                          {price}
                        </div>
                        <div className="period">
                          {isBg
                            ? (interval === 'monthly' ? 'на месец' : 'на година')
                            : (interval === 'monthly' ? 'per month' : 'per year')
                          }
                        </div>
                        {originalPrice && interval === 'annual' && (
                          <div className="original-price">
                            {isBg ? `Обикновено ${originalPrice}` : `Usually ${originalPrice}`}
                          </div>
                        )}
                      </>
                    )}
                  </Price>

                  <FeatureList>
                    {features.map((feature, idx) => (
                      <FeatureItem key={idx} $highlight={feature.highlight}>
                        {feature.highlight ? <Sparkles /> : <CheckCircle />}
                        <span>{feature.text}</span>
                      </FeatureItem>
                    ))}
                  </FeatureList>

                  <Button
                    $selected={isCurrent}
                    $free={plan.id === 'free'}
                    onClick={() => !isCurrent && handleSubscribe(plan)}
                    disabled={loading || isCurrent || plan.id === 'free'}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle size={20} />
                        {isBg ? 'Текущ план' : 'Current Plan'}
                      </>
                    ) : plan.id === 'free' ? (
                      <>
                        <Eye size={20} />
                        {isBg ? 'Започнете безплатно' : 'Start Free'}
                      </>
                    ) : loading ? (
                      <>
                        <Zap size={20} className="animate-spin" />
                        {isBg ? 'Зареждане...' : 'Loading...'}
                      </>
                    ) : (
                      <>
                        <Eye size={20} />
                        {isBg ? 'Избери план' : 'Select Plan'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>

                  {plan.id !== 'free' && (
                    <MoneyBackGuarantee>
                      <Shield />
                      <span>{isBg ? '30-дневна гаранция за връщане на пари' : '30-Day Money-Back Guarantee'}</span>
                    </MoneyBackGuarantee>
                  )}
                </Card>
              </CarouselItem>
            );
          })}
        </PlansViewport>
      </PlansCarousel>
    </Container>
  );
};

export default SubscriptionManagerEnhanced;
