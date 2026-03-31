/**
 * Enhanced Pricing Page Components
 * Premium UI with Social Proof, Animations, and Conversion Optimization
 * 
 * File: src/components/subscription/PricingPageEnhanced.tsx
 * Created: January 8, 2026
 * Based on: AutoScout24, AutoTrader UK, Cars.com best practices
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Crown, Zap, Building2, Check, Star, TrendingUp, Users, 
  Shield, Sparkles, Clock, Gift, ArrowRight, ChevronDown,
  Award, Rocket, Heart, MessageCircle, Eye, Phone, Calendar,
  Gem, Car, Banknote, HelpCircle, X as XIcon, ChevronRight,
  Bot, Upload, FileSpreadsheet, BarChart3, Headphones
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';
import { useHomepageStats } from '@/hooks/useHomepageStats';
// ✅ CRITICAL: Import subscription plans for accurate pricing
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

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

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); }
`;

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, 
    var(--bg-primary) 0%, 
    var(--bg-secondary) 50%,
    var(--bg-primary) 100%
  );
  padding: 2rem 1rem;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

// ==================== LIVE STATS BAR ====================

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1) 0%, 
    rgba(118, 75, 162, 0.1) 100%
  );
  border-radius: 20px;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${countUp} 0.8s ease-out;
`;

const StatIcon = styled.span`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

// ==================== SOCIAL PROOF RIBBON ====================

const SocialProofRibbon = styled.div`
  overflow: hidden;
  background: linear-gradient(90deg, 
    var(--accent-primary) 0%, 
    var(--accent-secondary) 100%
  );
  padding: 0.75rem 0;
  margin-bottom: 2rem;
  border-radius: 12px;
`;

const SocialProofTrack = styled.div`
  display: flex;
  animation: ${slideIn} 20s linear infinite;
  gap: 3rem;
  white-space: nowrap;
`;

const SocialProofItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
`;

const MiniAvatar = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
`;

// ==================== HEADER SECTION ====================

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const MainTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TrustBadges = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);

  svg {
    color: var(--accent-primary);
  }
`;

// ==================== BILLING TOGGLE ====================

const BillingToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const BillingToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  padding: 0.5rem;
  border-radius: 60px;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--border-primary);
  position: relative;
`;

const BillingOption = styled.button<{ $active: boolean }>`
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  ${p => p.$active ? css`
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  ` : css`
    background: transparent;
    color: var(--text-secondary);
    
    &:hover {
      color: var(--text-primary);
    }
  `}
`;

const SavingsBadge = styled.span`
  position: absolute;
  top: -12px;
  right: -8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  animation: ${pulse} 2s ease-in-out infinite;
`;

// ==================== PRICING CARDS ====================

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 450px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const PricingCard = styled.div<{ $featured?: boolean; $delay?: number }>`
  background: var(--bg-card);
  border-radius: 24px;
  padding: 2rem;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out ${p => (p.$delay || 0) * 0.1}s both;
  
  ${p => p.$featured ? css`
    border: 3px solid var(--accent-primary);
    transform: scale(1.05);
    box-shadow: 0 25px 80px rgba(102, 126, 234, 0.25);
    animation: ${glow} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out ${(p.$delay || 0) * 0.1}s both;
    
    &::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 26px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      z-index: -1;
    }
  ` : css`
    border: 2px solid var(--border-primary);
    box-shadow: var(--shadow-lg);
  `}
  
  &:hover {
    transform: ${p => p.$featured ? 'scale(1.08) translateY(-5px)' : 'translateY(-8px)'};
    box-shadow: ${p => p.$featured 
      ? '0 35px 100px rgba(102, 126, 234, 0.35)' 
      : '0 25px 60px rgba(0, 0, 0, 0.15)'
    };
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
`;

const PlanIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  background: none;
  background-image: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: var(--text-primary);
  background-clip: unset;
  border: none;
  border-image: none;
`;

const PlanDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const PriceContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
`;

const Currency = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-secondary);
`;

const Amount = styled.span`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  background-color: transparent;
  border: none;
  border-image: none;
  
  &::before,
  &::after {
    display: none;
  }
`;

const Period = styled.span`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: var(--text-muted);
  text-decoration: line-through;
  margin-left: 0.5rem;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const FeatureItem = styled.li<{ $highlighted?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-secondary);
  font-size: 0.95rem;
  color: var(--text-primary);
  
  ${p => p.$highlighted && css`
    background: linear-gradient(90deg, 
      rgba(102, 126, 234, 0.1) 0%, 
      transparent 100%
    );
    margin: 0 -1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border-bottom: none;
    font-weight: 600;
  `}
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeatureIcon = styled.span<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${p => p.$color || 'var(--accent-primary)'};
  flex-shrink: 0;
  margin-top: 2px;
  
  svg {
    width: 12px;
    height: 12px;
    color: white;
  }
`;

const SubscribeButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  ${p => p.$primary ? css`
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
    }
  ` : css`
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 2px solid var(--border-primary);
    
    &:hover {
      border-color: var(--accent-primary);
      background: rgba(102, 126, 234, 0.1);
    }
  `}
  
  &:active {
    transform: translateY(-1px);
  }
`;

// ==================== TRIAL BANNER ====================

const TrialBanner = styled.div`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(5, 150, 105, 0.1) 100%
  );
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out 0.5s both;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const TrialContent = styled.div`
  flex: 1;
`;

const TrialIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
`;

const TrialTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.5rem;
`;

const TrialDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const TrialFeatures = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const TrialFeature = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
  
  svg {
    color: #10b981;
  }
`;

const TrialButton = styled.button`
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
  }
`;

// ==================== COMPARISON TABLE ====================

const ComparisonSection = styled.div`
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
`;

const ComparisonTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateY(3px);
  }
`;

const ComparisonTable = styled.div<{ $expanded: boolean }>`
  background: var(--bg-card);
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid var(--border-primary);
  max-height: ${p => p.$expanded ? '5000px' : '0'};
  opacity: ${p => p.$expanded ? 1 : 0};
  transition: all 0.5s ease;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableHeaderCell = styled.div`
  padding: 1.25rem 1.5rem;
  color: white;
  font-weight: 700;
  text-align: center;
  
  &:first-child {
    text-align: left;
  }
`;

const TableRow = styled.div<{ $highlighted?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--border-secondary);
  
  ${p => p.$highlighted && css`
    background: rgba(102, 126, 234, 0.05);
  `}
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(102, 126, 234, 0.08);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TableCell = styled.div<{ $feature?: boolean }>`
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: ${p => p.$feature ? 'flex-start' : 'center'};
  font-size: 0.95rem;
  color: var(--text-primary);
  
  ${p => p.$feature && css`
    font-weight: 500;
    gap: 0.75rem;
  `}
  
  @media (max-width: 768px) {
    justify-content: space-between;
    
    &::before {
      content: attr(data-label);
      font-weight: 600;
      color: var(--text-secondary);
    }
  }
`;

const CheckMark = styled.div<{ $included?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${p => p.$included ? css`
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    svg {
      color: white;
      width: 14px;
      height: 14px;
    }
  ` : css`
    background: var(--bg-tertiary);
    svg {
      color: var(--text-muted);
      width: 14px;
      height: 14px;
    }
  `}
`;

// ==================== TESTIMONIALS ====================

const TestimonialsSection = styled.div`
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out 0.7s both;
`;

const TestimonialsTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 2rem;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled.div`
  background: var(--bg-card);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid var(--border-primary);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-primary);
  }
`;

const TestimonialStars = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #fbbf24;
    fill: #fbbf24;
  }
`;

const TestimonialText = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const AuthorRole = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

// ==================== GUARANTEE SECTION ====================

const GuaranteeSection = styled.div`
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.05) 0%, 
    rgba(118, 75, 162, 0.05) 100%
  );
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  border: 2px solid var(--border-primary);
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
`;

const GuaranteeIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const GuaranteeTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const GuaranteeText = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
`;

// ==================== FAQ SECTION ====================

const FAQSection = styled.div`
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out 0.9s both;
`;

const FAQTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const FAQList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FAQItem = styled.div`
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-primary);
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: left;

  svg {
    flex-shrink: 0;
    transition: transform 0.3s ease;
    color: var(--accent-primary);
  }
`;

const FAQAnswer = styled.div<{ $expanded: boolean }>`
  max-height: ${p => p.$expanded ? '500px' : '0'};
  opacity: ${p => p.$expanded ? 1 : 0};
  overflow: hidden;
  transition: all 0.3s ease;
  padding: ${p => p.$expanded ? '0 1.5rem 1.25rem' : '0 1.5rem'};
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
`;

// ==================== MOBILE PLAN TABS ====================

const MobileTabsWrapper = styled.div`
  display: none;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-primary);
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-primary);

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
`;

const MobileTab = styled.button<{ $active: boolean }>`
  padding: 0.625rem 1.25rem;
  border: 2px solid ${p => p.$active ? 'var(--accent-primary)' : 'var(--border-primary)'};
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${p => p.$active 
    ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
    : 'var(--bg-card)'
  };
  color: ${p => p.$active ? 'white' : 'var(--text-secondary)'};
`;

// ==================== COMPARISON TABLE SECTIONS ====================

const ComparisonSectionHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: rgba(102, 126, 234, 0.08);
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border-secondary);

  &:hover {
    background: rgba(102, 126, 234, 0.12);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionHeaderCell = styled.div`
  padding: 0.875rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    &:not(:first-child) { display: none; }
  }
`;

// ==================== MAIN COMPONENT ====================

interface PricingPageEnhancedProps {
  onSelectPlan?: (planId: string, interval: 'monthly' | 'annual') => void;
}

export const PricingPageEnhanced: React.FC<PricingPageEnhancedProps> = ({
  onSelectPlan
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { stats: realStats } = useHomepageStats();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [mobileSelectedPlan, setMobileSelectedPlan] = useState<string>('dealer');
  
  // Animated counters
  const [stats, setStats] = useState({
    cars: 0,
    dealers: 0,
    sold: 0
  });
  
  useEffect(() => {
    // Animate stats on mount — use real data from Firestore
    const targets = {
      cars: realStats?.totalActiveCars || 0,
      dealers: realStats?.totalDealers || 0,
      sold: realStats?.carsListedThisWeek || 0
    };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setStats({
        cars: Math.round(targets.cars * eased),
        dealers: Math.round(targets.dealers * eased),
        sold: Math.round(targets.sold * eased)
      });
      
      if (step >= steps) clearInterval(timer);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [realStats]);

  const t = {
    bg: {
      mainTitle: 'Изберете Вашия Перфектен План',
      subtitle: `Присъединете се към ${realStats?.totalDealers || '...'} дилъри, които продават успешно`,
      monthly: 'Месечно',
      annual: 'Годишно',
      save20: 'Спести 20%',
      carsListed: 'коли обявени',
      activeDealers: 'активни дилъри',
      soldThisWeek: 'продадени тази седмица',
      trialTitle: 'Пробвайте Dealer план БЕЗПЛАТНО за 14 дни',
      trialDesc: 'Всички функции отключени. Без кредитна карта. Автоматично преминаване към безплатен план след изтичане.',
      noCreditCard: 'Без кредитна карта',
      allFeatures: 'Всички функции',
      autoDowngrade: 'Автоматично преминаване',
      startTrial: 'Започни безплатен пробен период',
      compareFeatures: 'Сравни всички функции',
      guaranteeTitle: '30-дневна гаранция за връщане на парите',
      guaranteeText: 'Ако не сте доволни от нашата услуга през първите 30 дни, ще ви върнем парите без въпроси.',
      subscribe: 'Абонирай се',
      currentPlan: 'Текущ план',
      bestValue: 'Най-добра стойност',
      popular: 'Най-популярен',
      freePlan: 'Безплатен',
      dealerPlan: 'Професионален Дилър',
      companyPlan: 'Компания',
      freeDesc: 'За хора, които продават личната си кола',
      dealerDesc: 'За независими търговци и малки автокъщи',
      companyDesc: 'За компании и големи автокъщи с неограничени нужди',
      perMonth: '/месец',
      listings: 'обяви',
      unlimited: 'Неограничено',
      testimonials: 'Какво казват нашите клиенти',
      // Smart CTAs
      ctaFree: 'Започни безплатно',
      ctaDealer: 'Започни 14-дневен пробен период',
      ctaCompany: 'Започни сега',
      // FAQ
      faqTitle: 'Често задавани въпроси',
      faq: [
        { q: 'Как мога да сменя плана си?', a: 'Можете да смените плана си по всяко време от настройките на акаунта. При ъпгрейд промените влизат в сила веднага. При даунгрейд промените влизат в сила в края на текущия платен период.' },
        { q: 'Какво става с обявите ми ако намаля плана?', a: 'При намаляване на плана, обявите надвишаващи новия лимит ще бъдат автоматично деактивирани, но няма да бъдат изтрити. Можете да ги активирате отново при ъпгрейд.' },
        { q: 'Как работи безплатният пробен период?', a: '14-дневният пробен период ви дава пълен достъп до всички функции на Dealer плана. Не е необходима кредитна карта. След изтичане на периода акаунтът ви автоматично преминава към безплатния план.' },
        { q: 'Какви са наличните начини на плащане?', a: 'Приемаме банкови преводи чрез Revolut (IBAN: LT44 3250 0419 1285 4116) и iCard (IBAN: BG98INTF40012039023344). След превод, изпратете потвърждение и ние ще активираме акаунта ви до 24 часа.' },
        { q: 'Мога ли да анулирам по всяко време?', a: 'Да, можете да анулирате плана си по всяко време. Ще продължите да имате достъп до платените функции до края на текущия платен период.' },
        { q: 'Какво е гаранцията за връщане на парите?', a: 'Предлагаме 30-дневна гаранция за връщане на парите. Ако не сте доволни от услугата през първите 30 дни, ще ви върнем парите без въпроси.' },
        { q: 'Какви са AI функциите?', a: 'AI анализ на автомобили автоматично оценява стойността на автомобила, открива потенциални проблеми и генерира оптимизирани описания. AI чатботът помага на клиентите ви 24/7. Тези функции са достъпни за Dealer и Company плановете.' },
        { q: 'Как работи VIP значката?', a: 'VIP значката показва до профила ви и обявите ви, маркирайки ви като проверен професионален дилър. Това повишава доверието на купувачите и увеличава кликовете върху обявите ви.' },
      ],
      // Comparison sections
      sectionBasic: 'Основни функции',
      sectionAI: 'AI инструменти',
      sectionSupport: 'Поддръжка и услуги',
      sectionReports: 'Отчети и данни',
    },
    en: {
      mainTitle: 'Choose Your Perfect Plan',
      subtitle: `Join ${realStats?.totalDealers || '...'} dealers selling successfully`,
      monthly: 'Monthly',
      annual: 'Annual',
      save20: 'Save 20%',
      carsListed: 'cars listed',
      activeDealers: 'active dealers',
      soldThisWeek: 'sold this week',
      trialTitle: 'Try Dealer plan FREE for 14 days',
      trialDesc: 'All features unlocked. No credit card required. Auto-downgrades to free after expiry.',
      noCreditCard: 'No credit card',
      allFeatures: 'All features',
      autoDowngrade: 'Auto downgrade',
      startTrial: 'Start free trial',
      compareFeatures: 'Compare all features',
      guaranteeTitle: '30-Day Money Back Guarantee',
      guaranteeText: "If you're not satisfied with our service in the first 30 days, we'll refund you, no questions asked.",
      subscribe: 'Subscribe',
      currentPlan: 'Current Plan',
      bestValue: 'Best Value',
      popular: 'Most Popular',
      freePlan: 'Free',
      dealerPlan: 'Professional Dealer',
      companyPlan: 'Company',
      freeDesc: 'For individuals selling their personal car',
      dealerDesc: 'For independent dealers and small car lots',
      companyDesc: 'For companies and large dealerships with unlimited needs',
      perMonth: '/month',
      listings: 'listings',
      unlimited: 'Unlimited',
      testimonials: 'What our customers say',
      // Smart CTAs
      ctaFree: 'Start Free',
      ctaDealer: 'Start 14-Day Free Trial',
      ctaCompany: 'Get Started',
      // FAQ
      faqTitle: 'Frequently Asked Questions',
      faq: [
        { q: 'How can I change my plan?', a: 'You can change your plan at any time from your account settings. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.' },
        { q: 'What happens to my listings if I downgrade?', a: 'When downgrading, listings exceeding the new limit will be automatically deactivated but not deleted. You can reactivate them upon upgrading.' },
        { q: 'How does the free trial work?', a: 'The 14-day free trial gives you full access to all Dealer plan features. No credit card required. After the trial ends, your account automatically downgrades to the free plan.' },
        { q: 'What payment methods are available?', a: 'We accept bank transfers via Revolut (IBAN: LT44 3250 0419 1285 4116) and iCard (IBAN: BG98INTF40012039023344). After transferring, send us confirmation and we will activate your account within 24 hours.' },
        { q: 'Can I cancel at any time?', a: 'Yes, you can cancel your plan at any time. You will continue to have access to paid features until the end of your current billing period.' },
        { q: 'What is the money-back guarantee?', a: 'We offer a 30-day money-back guarantee. If you are not satisfied with the service within the first 30 days, we will refund you, no questions asked.' },
        { q: 'What are the AI features?', a: 'AI car analysis automatically evaluates vehicle value, detects potential issues, and generates optimized descriptions. The AI chatbot helps your customers 24/7. These features are available for Dealer and Company plans.' },
        { q: 'How does the VIP badge work?', a: 'The VIP badge appears next to your profile and listings, marking you as a verified professional dealer. This increases buyer trust and boosts clicks on your listings.' },
      ],
      // Comparison sections
      sectionBasic: 'Core Features',
      sectionAI: 'AI Tools',
      sectionSupport: 'Support & Services',
      sectionReports: 'Reports & Data',
    }
  };
  
  const text = t[language] || t.en;
  
  // ✅ CRITICAL: Use SUBSCRIPTION_PLANS as single source of truth
  // ✅ 9A: Price Anchoring — Company (most expensive) first, Free last
  const plans = [
    {
      id: 'company',
      name: text.companyPlan,
      description: text.companyDesc,
      icon: <Building2 />,
      iconColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      price: SUBSCRIPTION_PLANS.company.price,
      listings: SUBSCRIPTION_PLANS.company.features.maxListings, // -1 (unlimited)
      featured: false,
      cta: text.ctaCompany,
      features: [
        { text: text.unlimited + ' ' + text.listings, highlighted: true },
        { text: language === 'bg' ? 'Всичко от Dealer' : 'Everything from Dealer' },
        { text: language === 'bg' ? 'Тعديل марка/модел' : 'Edit Make/Model' },
        { text: language === 'bg' ? 'Масово качване (Bulk Upload)' : 'Bulk Upload' },
        { text: language === 'bg' ? 'API достъп' : 'API access' },
        { text: language === 'bg' ? 'Персонален мениджър' : 'Dedicated manager' },
        { text: `${SUBSCRIPTION_PLANS.company.features.maxTeamMembers} ${language === 'bg' ? 'членове на екип' : 'team members'}` },
        { text: language === 'bg' ? 'Персонализиран брандинг' : 'Custom branding' }
      ]
    },
    {
      id: 'dealer',
      name: text.dealerPlan,
      description: text.dealerDesc,
      icon: <Crown />,
      iconColor: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
      price: SUBSCRIPTION_PLANS.dealer.price,
      listings: SUBSCRIPTION_PLANS.dealer.features.maxListings, // 20
      featured: true,
      cta: text.ctaDealer,
      features: [
        { text: `${SUBSCRIPTION_PLANS.dealer.features.maxListings} ${text.listings}`, highlighted: true },
        { text: language === 'bg' ? 'VIP значка' : 'VIP badge', highlighted: true },
        { text: language === 'bg' ? 'AI анализ на коли' : 'AI car analysis' },
        { text: language === 'bg' ? 'AI чатбот' : 'AI chatbot' },
        { text: language === 'bg' ? 'Приоритетна поддръжка' : 'Priority support' },
        { text: language === 'bg' ? 'Разширена аналитика' : 'Advanced analytics' },
        { text: `${SUBSCRIPTION_PLANS.dealer.features.maxTeamMembers} ${language === 'bg' ? 'членове на екип' : 'team members'}` }
      ]
    },
    {
      id: 'free',
      name: text.freePlan,
      description: text.freeDesc,
      icon: <Zap />,
      iconColor: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      price: SUBSCRIPTION_PLANS.free.price, // { monthly: 0, annual: 0 }
      listings: SUBSCRIPTION_PLANS.free.features.maxListings, // 3
      featured: false,
      cta: text.ctaFree,
      features: [
        { text: `${SUBSCRIPTION_PLANS.free.features.maxListings} ${text.listings}`, highlighted: true },
        { text: language === 'bg' ? 'Основни функции' : 'Basic features' },
        { text: language === 'bg' ? 'Стандартна поддръжка' : 'Standard support' }
      ]
    }
  ];

  const socialProofItems = [
    { name: 'Иван', action: language === 'bg' ? 'се абонира преди 5 мин' : 'subscribed 5 min ago', color: '#667eea' },
    { name: 'Мария', action: language === 'bg' ? 'продаде 3 коли днес' : 'sold 3 cars today', color: '#10b981' },
    { name: 'Петър', action: language === 'bg' ? 'качи 10 обяви' : 'uploaded 10 listings', color: '#f59e0b' },
    { name: 'Елена', action: language === 'bg' ? 'надгради до Dealer' : 'upgraded to Dealer', color: '#8b5cf6' }
  ];

  const testimonials = [
    {
      text: language === 'bg' 
        ? 'След преминаване към Dealer план, продажбите ми се увеличиха с 40%. Страхотна платформа!'
        : 'After switching to Dealer plan, my sales increased by 40%. Amazing platform!',
      author: language === 'bg' ? 'Георги Петров' : 'George Petrov',
      role: language === 'bg' ? 'Автокъща София' : 'Car Dealer Sofia',
      color: '#667eea'
    },
    {
      text: language === 'bg'
        ? 'VIP значката привлича много повече клиенти. Определено си струва инвестицията.'
        : 'VIP badge attracts much more customers. Definitely worth the investment.',
      author: language === 'bg' ? 'Мария Иванова' : 'Maria Ivanova',
      role: language === 'bg' ? 'Дилър Пловдив' : 'Dealer Plovdiv',
      color: '#10b981'
    },
    {
      text: language === 'bg'
        ? 'Най-добрата платформа за продажба на коли в България. Препоръчвам на всички!'
        : 'Best car selling platform in Bulgaria. Highly recommend to everyone!',
      author: language === 'bg' ? 'Стефан Димитров' : 'Stefan Dimitrov',
      role: language === 'bg' ? 'Автокъща Варна' : 'Car Dealer Varna',
      color: '#f59e0b'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    logger.info('Plan selected', { planId, interval: billingInterval });
    onSelectPlan?.(planId, billingInterval);
  };

  const handleStartTrial = () => {
    logger.info('Trial started');
    onSelectPlan?.('dealer', 'monthly');
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Live Stats Bar */}
        <StatsBar>
          <StatItem>
            <StatIcon><Car size={20} /></StatIcon>
            <StatValue>{stats.cars.toLocaleString()}</StatValue>
            <StatLabel>{text.carsListed}</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon><Users size={20} /></StatIcon>
            <StatValue>{stats.dealers.toLocaleString()}</StatValue>
            <StatLabel>{text.activeDealers}</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon><Banknote size={20} /></StatIcon>
            <StatValue>{stats.sold.toLocaleString()}</StatValue>
            <StatLabel>{text.soldThisWeek}</StatLabel>
          </StatItem>
        </StatsBar>

        {/* Social Proof Ribbon */}
        <SocialProofRibbon>
          <SocialProofTrack>
            {[...socialProofItems, ...socialProofItems].map((item, i) => (
              <SocialProofItem key={i}>
                <MiniAvatar $color={item.color}>{item.name[0]}</MiniAvatar>
                <span>{item.name} {item.action}</span>
              </SocialProofItem>
            ))}
          </SocialProofTrack>
        </SocialProofRibbon>

        {/* Header */}
        <Header>
          <MainTitle>{text.mainTitle}</MainTitle>
          <Subtitle>{text.subtitle}</Subtitle>
          <TrustBadges>
            <TrustBadge>
              <Shield size={18} />
              <span>{language === 'bg' ? 'SSL защита' : 'SSL Secure'}</span>
            </TrustBadge>
            <TrustBadge>
              <Award size={18} />
              <span>{language === 'bg' ? '#1 в България' : '#1 in Bulgaria'}</span>
            </TrustBadge>
            <TrustBadge>
              <Users size={18} />
              <span>{language === 'bg' ? `${realStats?.totalDealers || '...'}+ дилъри` : `${realStats?.totalDealers || '...'}+ dealers`}</span>
            </TrustBadge>
          </TrustBadges>
        </Header>

        {/* Billing Toggle */}
        <BillingToggleContainer>
          <BillingToggleWrapper>
            <BillingOption 
              $active={billingInterval === 'monthly'}
              onClick={() => setBillingInterval('monthly')}
            >
              {text.monthly}
            </BillingOption>
            <BillingOption 
              $active={billingInterval === 'annual'}
              onClick={() => setBillingInterval('annual')}
            >
              {text.annual}
              <SavingsBadge>{text.save20}</SavingsBadge>
            </BillingOption>
          </BillingToggleWrapper>
        </BillingToggleContainer>

        {/* Pricing Cards */}
        <PricingGrid>
          {plans.map((plan, index) => (
            <PricingCard 
              key={plan.id} 
              $featured={plan.featured}
              $delay={index + 1}
            >
              {plan.featured && (
                <FeaturedBadge>
                  <Sparkles size={16} />
                  {text.popular}
                </FeaturedBadge>
              )}
              
              <PlanIcon $color={plan.iconColor}>
                {plan.icon}
              </PlanIcon>
              
              <PlanName>{plan.name}</PlanName>
              <PlanDescription>{plan.description}</PlanDescription>
              
              <PriceContainer>
                <Price>
                  <Currency>€</Currency>
                  <Amount>
                    {billingInterval === 'monthly' 
                      ? plan.price.monthly 
                      : Math.round(plan.price.annual / 12)
                    }
                  </Amount>
                  <Period>{text.perMonth}</Period>
                  {billingInterval === 'annual' && plan.price.monthly > 0 && (
                    <OriginalPrice>€{plan.price.monthly}</OriginalPrice>
                  )}
                </Price>
              </PriceContainer>
              
              <FeaturesList>
                {plan.features.map((feature, i) => (
                  <FeatureItem key={i} $highlighted={feature.highlighted}>
                    <FeatureIcon $color={plan.featured ? 'var(--accent-primary)' : '#10b981'}>
                      <Check />
                    </FeatureIcon>
                    {feature.text}
                  </FeatureItem>
                ))}
              </FeaturesList>
              
              <SubscribeButton 
                $primary={plan.featured}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.cta}
                <ArrowRight size={20} />
              </SubscribeButton>
            </PricingCard>
          ))}
        </PricingGrid>

        {/* Trial Banner */}
        <TrialBanner>
          <TrialContent>
            <TrialIcon><Gift size={20} /></TrialIcon>
            <TrialTitle>{text.trialTitle}</TrialTitle>
            <TrialDescription>{text.trialDesc}</TrialDescription>
            <TrialFeatures>
              <TrialFeature>
                <Check size={16} />
                {text.noCreditCard}
              </TrialFeature>
              <TrialFeature>
                <Check size={16} />
                {text.allFeatures}
              </TrialFeature>
              <TrialFeature>
                <Check size={16} />
                {text.autoDowngrade}
              </TrialFeature>
            </TrialFeatures>
          </TrialContent>
          <TrialButton onClick={handleStartTrial}>
            <Rocket size={20} />
            {text.startTrial}
          </TrialButton>
        </TrialBanner>

        {/* Comparison Toggle */}
        <ComparisonSection>
          <ComparisonTitle onClick={() => setShowComparison(!showComparison)}>
            {text.compareFeatures}
            <ChevronDown 
              size={24} 
              style={{ transform: showComparison ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </ComparisonTitle>

          {/* Mobile Plan Tabs for comparison */}
          {showComparison && (
            <MobileTabsWrapper>
              <MobileTab 
                $active={mobileSelectedPlan === 'company'} 
                onClick={() => setMobileSelectedPlan('company')}
              >
                {text.companyPlan}
              </MobileTab>
              <MobileTab 
                $active={mobileSelectedPlan === 'dealer'} 
                onClick={() => setMobileSelectedPlan('dealer')}
              >
                {text.dealerPlan}
              </MobileTab>
              <MobileTab 
                $active={mobileSelectedPlan === 'free'} 
                onClick={() => setMobileSelectedPlan('free')}
              >
                {text.freePlan}
              </MobileTab>
            </MobileTabsWrapper>
          )}

          <ComparisonTable $expanded={showComparison}>
            <TableHeader>
              <TableHeaderCell>{language === 'bg' ? 'Функция' : 'Feature'}</TableHeaderCell>
              <TableHeaderCell>{text.companyPlan}</TableHeaderCell>
              <TableHeaderCell>{text.dealerPlan}</TableHeaderCell>
              <TableHeaderCell>{text.freePlan}</TableHeaderCell>
            </TableHeader>

            {/* Section: Core Features */}
            <ComparisonSectionHeader>
              <SectionHeaderCell>
                <Zap size={16} />
                {text.sectionBasic}
              </SectionHeaderCell>
              <SectionHeaderCell />
              <SectionHeaderCell />
              <SectionHeaderCell />
            </ComparisonSectionHeader>

            {[
              { feature: language === 'bg' ? 'Брой обяви' : 'Listings', company: '∞', dealer: '20', free: '3' },
              { feature: language === 'bg' ? 'VIP значка' : 'VIP Badge', company: true, dealer: true, free: false },
              { feature: language === 'bg' ? 'Обяви с приоритет' : 'Featured Listings', company: true, dealer: true, free: false },
              { feature: language === 'bg' ? 'Тعديل марка/модел' : 'Edit Make/Model', company: true, dealer: false, free: false },
              { feature: language === 'bg' ? 'Масово качване' : 'Bulk Upload', company: true, dealer: false, free: false },
            ].map((row, i) => (
              <TableRow key={`basic-${i}`} $highlighted={i % 2 === 0}>
                <TableCell $feature data-label="">{row.feature}</TableCell>
                <TableCell data-label={text.companyPlan}>
                  {typeof row.company === 'boolean' ? (
                    <CheckMark $included={row.company}><Check /></CheckMark>
                  ) : row.company}
                </TableCell>
                <TableCell data-label={text.dealerPlan}>
                  {typeof row.dealer === 'boolean' ? (
                    <CheckMark $included={row.dealer}><Check /></CheckMark>
                  ) : row.dealer}
                </TableCell>
                <TableCell data-label={text.freePlan}>
                  {typeof row.free === 'boolean' ? (
                    <CheckMark $included={row.free}><Check /></CheckMark>
                  ) : row.free}
                </TableCell>
              </TableRow>
            ))}

            {/* Section: AI Tools */}
            <ComparisonSectionHeader>
              <SectionHeaderCell>
                <Bot size={16} />
                {text.sectionAI}
              </SectionHeaderCell>
              <SectionHeaderCell />
              <SectionHeaderCell />
              <SectionHeaderCell />
            </ComparisonSectionHeader>

            {[
              { feature: language === 'bg' ? 'AI анализ на коли' : 'AI Car Analysis', company: true, dealer: true, free: false },
              { feature: language === 'bg' ? 'AI чатбот' : 'AI Chatbot', company: true, dealer: true, free: false },
              { feature: language === 'bg' ? 'Бързи отговори' : 'Quick Replies', company: true, dealer: true, free: false },
            ].map((row, i) => (
              <TableRow key={`ai-${i}`} $highlighted={i % 2 === 0}>
                <TableCell $feature data-label="">{row.feature}</TableCell>
                <TableCell data-label={text.companyPlan}>
                  <CheckMark $included={row.company}><Check /></CheckMark>
                </TableCell>
                <TableCell data-label={text.dealerPlan}>
                  <CheckMark $included={row.dealer}><Check /></CheckMark>
                </TableCell>
                <TableCell data-label={text.freePlan}>
                  <CheckMark $included={row.free}><Check /></CheckMark>
                </TableCell>
              </TableRow>
            ))}

            {/* Section: Support & Services */}
            <ComparisonSectionHeader>
              <SectionHeaderCell>
                <Headphones size={16} />
                {text.sectionSupport}
              </SectionHeaderCell>
              <SectionHeaderCell />
              <SectionHeaderCell />
              <SectionHeaderCell />
            </ComparisonSectionHeader>

            {[
              { feature: language === 'bg' ? 'Приоритетна поддръжка' : 'Priority Support', company: true, dealer: true, free: false },
              { feature: language === 'bg' ? 'Персонален мениджър' : 'Account Manager', company: true, dealer: false, free: false },
              { feature: language === 'bg' ? 'Членове на екип' : 'Team Members', company: `${SUBSCRIPTION_PLANS.company.features.maxTeamMembers}`, dealer: `${SUBSCRIPTION_PLANS.dealer.features.maxTeamMembers}`, free: '1' },
            ].map((row, i) => (
              <TableRow key={`support-${i}`} $highlighted={i % 2 === 0}>
                <TableCell $feature data-label="">{row.feature}</TableCell>
                <TableCell data-label={text.companyPlan}>
                  {typeof row.company === 'boolean' ? (
                    <CheckMark $included={row.company}><Check /></CheckMark>
                  ) : row.company}
                </TableCell>
                <TableCell data-label={text.dealerPlan}>
                  {typeof row.dealer === 'boolean' ? (
                    <CheckMark $included={row.dealer}><Check /></CheckMark>
                  ) : row.dealer}
                </TableCell>
                <TableCell data-label={text.freePlan}>
                  {typeof row.free === 'boolean' ? (
                    <CheckMark $included={row.free}><Check /></CheckMark>
                  ) : row.free}
                </TableCell>
              </TableRow>
            ))}

            {/* Section: Reports & Data */}
            <ComparisonSectionHeader>
              <SectionHeaderCell>
                <BarChart3 size={16} />
                {text.sectionReports}
              </SectionHeaderCell>
              <SectionHeaderCell />
              <SectionHeaderCell />
              <SectionHeaderCell />
            </ComparisonSectionHeader>

            {[
              { feature: language === 'bg' ? 'Разширена аналитика' : 'Advanced Analytics', company: true, dealer: true, free: false },
              { feature: language === 'bg' ? 'Тصدير CSV' : 'CSV Export', company: true, dealer: false, free: false },
              { feature: language === 'bg' ? 'API достъп' : 'API Access', company: true, dealer: false, free: false },
              { feature: language === 'bg' ? 'Персонализиран брандинг' : 'Custom Branding', company: true, dealer: false, free: false },
            ].map((row, i) => (
              <TableRow key={`reports-${i}`} $highlighted={i % 2 === 0}>
                <TableCell $feature data-label="">{row.feature}</TableCell>
                <TableCell data-label={text.companyPlan}>
                  <CheckMark $included={row.company as boolean}><Check /></CheckMark>
                </TableCell>
                <TableCell data-label={text.dealerPlan}>
                  <CheckMark $included={row.dealer as boolean}><Check /></CheckMark>
                </TableCell>
                <TableCell data-label={text.freePlan}>
                  <CheckMark $included={row.free as boolean}><Check /></CheckMark>
                </TableCell>
              </TableRow>
            ))}
          </ComparisonTable>
        </ComparisonSection>

        {/* Testimonials */}
        <TestimonialsSection>
          <TestimonialsTitle>{text.testimonials}</TestimonialsTitle>
          <TestimonialsGrid>
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i}>
                <TestimonialStars>
                  {[1,2,3,4,5].map(n => <Star key={n} />)}
                </TestimonialStars>
                <TestimonialText>"{testimonial.text}"</TestimonialText>
                <TestimonialAuthor>
                  <AuthorAvatar $color={testimonial.color}>
                    {testimonial.author[0]}
                  </AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>{testimonial.author}</AuthorName>
                    <AuthorRole>{testimonial.role}</AuthorRole>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </TestimonialsSection>

        {/* FAQ Section — 9D */}
        <FAQSection>
          <FAQTitle>
            <HelpCircle size={24} />
            {text.faqTitle}
          </FAQTitle>
          <FAQList>
            {text.faq.map((item, i) => (
              <FAQItem key={i}>
                <FAQQuestion onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                  {item.q}
                  <ChevronDown 
                    size={20} 
                    style={{ transform: openFAQ === i ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </FAQQuestion>
                <FAQAnswer $expanded={openFAQ === i}>
                  {item.a}
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQList>
        </FAQSection>

        {/* Guarantee Section */}
        <GuaranteeSection>
          <GuaranteeIcon>🛡️</GuaranteeIcon>
          <GuaranteeTitle>{text.guaranteeTitle}</GuaranteeTitle>
          <GuaranteeText>{text.guaranteeText}</GuaranteeText>
        </GuaranteeSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default PricingPageEnhanced;
