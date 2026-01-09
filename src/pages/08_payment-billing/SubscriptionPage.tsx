// src/pages/SubscriptionPage.tsx - ENHANCED VERSION
// World-Class Subscription Page for Bulgarian Car Marketplace

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import SubscriptionManager from '../../components/subscription/SubscriptionManager';
import { useAuth } from '../../contexts/AuthProvider';
import { subscriptionService } from '../../services/billing/subscription-service';
import { logger } from '../../services/logger-service';
import { toast } from 'react-toastify';
// ✅ استيراد ملف الإعدادات المركزي
import subscriptionTheme, { getPrimaryGradient, getPrimaryGradientWithMiddle, getShadowColor } from '../../components/subscription/subscription-theme';
import {
  Crown, ArrowLeft, Star, Shield, TrendingUp, Users,
  CheckCircle, Sparkles, Award, Zap, Clock, HeartHandshake,
  ChevronDown, Quote, MessageSquare, ThumbsUp, Rocket,
  BarChart3, HelpCircle, Target
} from 'lucide-react';

// ============================================================================
// ANIMATIONS
// ============================================================================

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

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const foggyBlur = keyframes`
  0%, 100% { 
    filter: blur(8px) brightness(0.9);
    opacity: 0.4;
  }
  50% { 
    filter: blur(12px) brightness(1.1);
    opacity: 0.6;
  }
`;

const smokeFloat = keyframes`
  0% { 
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
  33% { 
    transform: translateY(-20px) translateX(10px) scale(1.1);
    opacity: 0.5;
  }
  66% { 
    transform: translateY(-10px) translateX(-10px) scale(0.9);
    opacity: 0.4;
  }
  100% { 
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
`;

const imageTransition = keyframes`
  0% { opacity: 0; transform: scale(1.1); filter: blur(15px); }
  10% { opacity: 1; transform: scale(1); filter: blur(8px); }
  30% { opacity: 1; transform: scale(1); filter: blur(8px); }
  40% { opacity: 0; transform: scale(1.1); filter: blur(15px); }
  100% { opacity: 0; transform: scale(1.1); filter: blur(15px); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
  overflow-x: hidden;
`;

// Hero Header with Premium Design - صور متغيرة بايومشن ضبابي ودخاني
const HeroHeader = styled.header`
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-primary) 100%);
  background-size: 200% 200%;
  animation: ${shimmer} 8s linear infinite;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;

  /* Smoke effect overlay */
  & > * {
    position: relative;
    z-index: 2;
  }
`;

const HeroBackgroundImages = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
`;

const BackgroundImage = styled.div<{ $image: string; $delay: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${p => p.$image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  animation: ${imageTransition} 15s infinite ${p => p.$delay}s, ${smokeFloat} 12s ease-in-out infinite ${p => p.$delay}s;
  filter: blur(18px) brightness(0.5) contrast(1.2);
  transform: scale(1.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    animation: ${smokeFloat} 8s ease-in-out infinite ${p => p.$delay + 2}s;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
    animation: ${smokeFloat} 10s ease-in-out infinite reverse ${p => p.$delay + 4}s;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.5s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-5px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HeroTitleWrapper = styled.div`
  text-align: center;
  animation: ${fadeInUp} 0.8s ease;
`;

const HeroIconBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  margin: 0 auto 1rem;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: ${float} 3s ease-in-out infinite, ${foggyBlur} 6s ease-in-out infinite;

  svg {
    width: 26px;
    height: 26px;
    color: white;
    filter: drop-shadow(0 2px 8px rgba(255, 143, 16, 0.5)) blur(0.5px);
    opacity: 0.9;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  animation: ${fadeInUp} 1s ease 0.3s backwards;
`;

const StatItem = styled.div`
  text-align: center;
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  }

  .stat-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }
`;

// Trust Badges Section
const TrustSection = styled.section`
  background: var(--bg-card);
  padding: 1rem 0;
  box-shadow: var(--shadow-md);
  position: relative;
  z-index: 3;
  margin-top: -1.5rem;
  animation: ${fadeInUp} 0.8s ease 0.5s backwards;
`;

const TrustContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 143, 16, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 143, 16, 0.12);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 143, 16, 0.2);
  }

  svg {
    width: 18px;
    height: 18px;
    color: var(--accent-primary);
    filter: drop-shadow(0 0 6px rgba(255, 143, 16, 0.4)) blur(0.5px);
    opacity: 0.9;
    transition: all 0.3s ease;
  }

  &:hover svg {
    filter: drop-shadow(0 0 10px rgba(255, 143, 16, 0.6)) blur(0.3px);
    opacity: 1;
    transform: scale(1.1);
  }

  span {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.85rem;
  }
`;

// Main Content
const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 2rem 4rem;
`;

// Section Title Component
const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--accent-primary);
    filter: drop-shadow(0 0 12px rgba(255, 143, 16, 0.4)) blur(0.5px);
    opacity: 0.9;
    transition: all 0.3s ease;
  }

  &:hover svg {
    filter: drop-shadow(0 0 16px rgba(255, 143, 16, 0.6)) blur(0.3px);
    opacity: 1;
    transform: scale(1.05);
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  color: var(--text-secondary);
  margin: 0 0 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

// Comparison Table Section
const ComparisonSection = styled.section`
  margin: 5rem 0;
  padding: 4rem 0;
  background: linear-gradient(135deg, 
    rgba(255, 143, 16, 0.08) 0%, 
    rgba(255, 215, 0, 0.05) 50%,
    transparent 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  animation: ${fadeIn} 1s ease;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
`;

const ComparisonTable = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, 
    rgba(255, 143, 16, 0.15) 0%, 
    rgba(255, 215, 0, 0.12) 50%, 
    rgba(255, 143, 16, 0.15) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const TableRow = styled.div<{ $highlight?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  ${p => p.$highlight && `
    background: linear-gradient(135deg, 
      rgba(255, 143, 16, 0.08) 0%, 
      rgba(255, 215, 0, 0.05) 100%
    );
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  `}

  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 143, 16, 0.12) 0%, 
      rgba(255, 215, 0, 0.08) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const FeatureCell = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 20px;
    height: 20px;
    color: var(--accent-primary);
    filter: drop-shadow(0 0 8px rgba(255, 143, 16, 0.4));
    opacity: 0.85;
    transition: all 0.3s ease;
  }

  &:hover svg {
    filter: drop-shadow(0 0 12px rgba(255, 143, 16, 0.6));
    opacity: 1;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ValueCell = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-weight: 500;

  svg {
    width: 20px;
    height: 20px;
    color: var(--accent-primary);
    margin: 0 auto;
    filter: drop-shadow(0 0 8px rgba(255, 143, 16, 0.4)) blur(0.5px);
    opacity: 0.85;
    transition: all 0.3s ease;
  }

  &:hover svg {
    filter: drop-shadow(0 0 12px rgba(255, 143, 16, 0.6)) blur(0.3px);
    opacity: 1;
    transform: scale(1.15);
  }
`;

// Testimonials Section
const TestimonialsSection = styled.section`
  margin: 5rem 0;
  animation: ${fadeInUp} 1s ease;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const TestimonialCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
  animation: ${scaleIn} 0.6s ease backwards;
  animation-delay: calc(var(--index) * 0.1s);

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 0 30px rgba(255, 143, 16, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const QuoteIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, 
    rgba(255, 143, 16, 0.3) 0%, 
    rgba(255, 215, 0, 0.25) 100%
  );
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 
    0 4px 15px rgba(255, 143, 16, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: ${foggyBlur} 5s ease-in-out infinite;

  svg {
    width: 24px;
    height: 24px;
    color: var(--accent-primary);
    filter: drop-shadow(0 0 8px rgba(255, 143, 16, 0.5)) blur(0.5px);
    opacity: 0.9;
  }
`;

const TestimonialText = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.25rem;
`;

const AuthorInfo = styled.div`
  .name {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .role {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;

  svg {
    width: 16px;
    height: 16px;
    fill: #fbbf24;
    color: #fbbf24;
    filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.5)) blur(0.3px);
    opacity: 0.9;
    transition: all 0.3s ease;
  }

  &:hover svg {
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.7)) blur(0.2px);
    opacity: 1;
    transform: scale(1.1);
  }
`;

// FAQ Section
const FAQSection = styled.section`
  margin: 5rem 0;
  animation: ${fadeInUp} 1s ease;
`;

const FAQList = styled.div`
  max-width: 800px;
  margin: 3rem auto 0;
`;

const FAQItem = styled.div<{ $isOpen: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  ${p => p.$isOpen && `
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 
      0 4px 20px ${() => subscriptionTheme.shadows.small},
      0 0 25px rgba(255, 143, 16, 0.15);
    border-color: rgba(255, 255, 255, 0.15);
  `}
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.5rem;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    color: var(--accent-primary);
  }

  svg {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
    color: var(--accent-primary);
    filter: drop-shadow(0 0 8px rgba(255, 143, 16, 0.4)) blur(0.5px);
    opacity: 0.85;
  }

  &:hover svg {
    filter: drop-shadow(0 0 12px rgba(255, 143, 16, 0.6)) blur(0.3px);
    opacity: 1;
  }
`;

const FAQAnswer = styled.div<{ $isOpen: boolean }>`
  max-height: ${p => p.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s ease;
  padding: ${p => p.$isOpen ? '0 1.5rem 1.5rem' : '0 1.5rem'};
  color: var(--text-secondary);
  line-height: 1.7;
`;

// CTA Section
const CTASection = styled.section`
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  padding: 4rem 2rem;
  border-radius: 30px;
  text-align: center;
  margin: 5rem 0;
  position: relative;
  overflow: hidden;
  animation: ${scaleIn} 1s ease;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${float} 6s ease-in-out infinite;
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  svg {
    width: 2.5rem;
    height: 2.5rem;
    color: white;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 2rem;
`;

const CTAButton = styled.button`
  padding: 1.25rem 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--accent-primary);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(255, 143, 16, 0.3);
  filter: drop-shadow(0 0 10px rgba(255, 143, 16, 0.2));

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 30px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(255, 143, 16, 0.4);
    background: rgba(255, 255, 255, 1);
    filter: drop-shadow(0 0 15px rgba(255, 143, 16, 0.4));
  }

  &:active {
    transform: translateY(0);
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null); // Track which plan is loading
  const isBg = language === 'bg';

  const handleSubscribe = async (planId: 'dealer' | 'company', interval: 'monthly' | 'annual' = 'monthly') => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    try {
      setLoadingPlan(planId);
      
      // ✅ UPDATED: Redirect to manual bank transfer checkout
      toast.info(isBg 
        ? 'Преминаваме към страница за банков превод...' 
        : 'Redirecting to bank transfer page...'
      );

      // Navigate to manual checkout page with plan details
      navigate(`/billing/manual-checkout?plan=${planId}&interval=${interval}&type=subscription`);
      
    } catch (error) {
      logger.error('Failed to navigate to checkout', error as Error);
      toast.error(isBg ? 'Грешка при преминаване към плащане' : 'Failed to navigate to payment');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        if (isVisible) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: 'Иван Петров',
      role: isBg ? 'Автокъща София' : 'Car Dealership Sofia',
      text: isBg
        ? 'С Dealer плана продажбите ни се увеличиха с 40%. AI оценките са невероятно точни!'
        : 'With the Dealer plan, our sales increased by 40%. AI valuations are incredibly accurate!',
      avatar: 'ИП',
      rating: 5
    },
    {
      name: 'Мария Георгиева',
      role: isBg ? 'Частен продавач' : 'Private Seller',
      text: isBg
        ? 'Безплатният план ми позволи да продам колата си за 2 дни. Лесна употреба!'
        : 'The free plan allowed me to sell my car in 2 days. Easy to use!',
      avatar: 'МГ',
      rating: 5
    },
    {
      name: 'Стоян Николов',
      role: isBg ? 'Fleet Manager' : 'Fleet Manager',
      text: isBg
        ? 'Company планът е идеален за нашия fleet. Неограничените AI функции спестяват часове!'
        : 'The Company plan is perfect for our fleet. Unlimited AI features save hours!',
      avatar: 'СН',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: isBg ? 'Какво включва безплатният план?' : 'What does the free plan include?',
      answer: isBg
        ? 'Безплатният план ви позволява да публикувате до 5 автомобила месечно с основни функции - директни съобщения, до 10 снимки на кола и видимост в търсачката.'
        : 'The free plan allows you to post up to 5 cars per month with basic features - direct messaging, up to 10 photos per car, and search visibility.'
    },
    {
      question: isBg ? 'Как работят AI функциите?' : 'How do AI features work?',
      answer: isBg
        ? 'Нашите AI функции използват машинно обучение за анализ на пазарни данни, определяне на конкурентни цени и предоставяне на интелигентни препоръки за вашите обяви.'
        : 'Our AI features use machine learning to analyze market data, determine competitive pricing, and provide intelligent recommendations for your listings.'
    },
    {
      question: isBg ? 'Мога ли да сменя плана си по всяко време?' : 'Can I change my plan anytime?',
      answer: isBg
        ? 'Да! Можете да надградите или понижите плана си по всяко време. При надграждане, ще получите пропорционален кредит за неизползваното време.'
        : 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll receive prorated credit for unused time.'
    },
    {
      question: isBg ? 'Какво означава "неограничени AI функции"?' : 'What does "unlimited AI" mean?',
      answer: isBg
        ? 'С Company плана получавате неограничен достъп до всички AI инструменти - оценка на цени, анализ на пазара, оптимизация на обяви, подобряване на снимки и много други.'
        : 'With the Company plan, you get unlimited access to all AI tools - price valuation, market analysis, listing optimization, photo enhancement, and more.'
    },
    {
      question: isBg ? 'Има ли скрити такси?' : 'Are there any hidden fees?',
      answer: isBg
        ? 'Не! Цената която виждате е цената която плащате. Без скрити такси, без изненади. Прозрачни и честни цени.'
        : 'No! The price you see is the price you pay. No hidden fees, no surprises. Transparent and fair pricing.'
    }
  ];

  const comparisonFeatures = [
    {
      feature: isBg ? 'Брой обяви месечно' : 'Monthly listings',
      free: '3',
      dealer: '30',
      company: isBg ? 'Неограничено' : 'Unlimited'
    },
    {
      feature: isBg ? 'Анализи' : 'Analytics',
      free: '—',
      dealer: isBg ? 'Основни' : 'Basic',
      company: isBg ? 'Разширени' : 'Advanced'
    },
    {
      feature: isBg ? 'Групово качване' : 'Bulk upload',
      free: '—',
      dealer: '✓',
      company: '✓'
    },
    {
      feature: isBg ? 'Отличаване/Badge' : 'Featured badge',
      free: '—',
      dealer: '✓',
      company: '✓'
    },
    {
      feature: isBg ? 'Управление на екип' : 'Team management',
      free: '0',
      dealer: '3',
      company: '10'
    },
    {
      feature: isBg ? 'API достъп' : 'API access',
      free: '—',
      dealer: '—',
      company: '✓'
    },
    {
      feature: isBg ? 'Приоритетна поддръжка' : 'Priority support',
      free: '—',
      dealer: '✓',
      company: '✓'
    },
    {
      feature: isBg ? 'Маркетинг кампании' : 'Marketing campaigns',
      free: '—',
      dealer: '5',
      company: isBg ? 'Неограничено' : 'Unlimited'
    }
  ];

  return (
    <PageContainer>
      {/* Hero Header */}
      <HeroHeader>
        <HeroBackgroundImages>
          <BackgroundImage $image="/assets/images/seller-cards/private.png" $delay={0} />
          <BackgroundImage $image="/assets/images/seller-cards/dealer.png" $delay={5} />
          <BackgroundImage $image="/assets/images/seller-cards/company.png" $delay={10} />
        </HeroBackgroundImages>
        <HeroContent>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft />
            <span>{isBg ? 'Назад' : 'Back'}</span>
          </BackButton>

          <HeroTitleWrapper>
            <HeroIconBadge>
              <Crown />
            </HeroIconBadge>

            <HeroTitle>
              {isBg ? 'Изберете перфектния план' : 'Choose Your Perfect Plan'}
            </HeroTitle>

            <HeroSubtitle>
              {isBg
                ? 'Продавайте повече автомобили с интелигентни инструменти и AI технологии от световна класа'
                : 'Sell more cars with intelligent tools and world-class AI technology'}
            </HeroSubtitle>

            <HeroStats>
              <StatItem>
                <div className="stat-number">10,000+</div>
                <div className="stat-label">{isBg ? 'Продадени коли' : 'Cars Sold'}</div>
              </StatItem>
              <StatItem>
                <div className="stat-number">98%</div>
                <div className="stat-label">{isBg ? 'Доволни клиенти' : 'Happy Customers'}</div>
              </StatItem>
              <StatItem>
                <div className="stat-number">24/7</div>
                <div className="stat-label">{isBg ? 'Поддръжка' : 'Support'}</div>
              </StatItem>
            </HeroStats>
          </HeroTitleWrapper>
        </HeroContent>
      </HeroHeader>

      {/* Trust Badges */}
      <TrustSection>
        <TrustContent>
          <TrustBadge>
            <Shield />
            <span>{isBg ? 'SSL Защита' : 'SSL Secure'}</span>
          </TrustBadge>
          <TrustBadge>
            <Award />
            <span>{isBg ? 'Най-добра платформа 2025' : 'Best Platform 2025'}</span>
          </TrustBadge>
          <TrustBadge>
            <HeartHandshake />
            <span>{isBg ? '30 дни гаранция' : '30-Day Guarantee'}</span>
          </TrustBadge>
          <TrustBadge>
            <Clock />
            <span>{isBg ? 'Бърза активация' : 'Instant Activation'}</span>
          </TrustBadge>
        </TrustContent>
      </TrustSection>

      {/* Main Content */}
      <MainContent>
        {/* Plans - Managed by SubscriptionManager */}
        <SubscriptionManager />

        {/* Comparison Table */}
        <ComparisonSection data-animate>
          <SectionTitle>
            <BarChart3 />
            {isBg ? 'Подробно сравнение' : 'Detailed Comparison'}
          </SectionTitle>
          <SectionSubtitle>
            {isBg
              ? 'Вижте какво получавате с всеки план'
              : 'See what you get with each plan'}
          </SectionSubtitle>

          <ComparisonTable>
            <TableHeader>
              <div>{isBg ? 'Функция' : 'Feature'}</div>
              <div>{isBg ? 'Безплатен' : 'Free'}</div>
              <div>{isBg ? 'Търговец' : 'Dealer'}</div>
              <div>{isBg ? 'Компания' : 'Company'}</div>
            </TableHeader>

            {comparisonFeatures.map((item, index) => (
              <TableRow key={index} $highlight={index % 2 === 0}>
                <FeatureCell>
                  <Sparkles />
                  {item.feature}
                </FeatureCell>
                <ValueCell>
                  {item.free === '✓' ? <CheckCircle /> : item.free}
                </ValueCell>
                <ValueCell>
                  {item.dealer === '✓' ? <CheckCircle /> : item.dealer}
                </ValueCell>
                <ValueCell>
                  {item.company === '✓' ? <CheckCircle /> : item.company}
                </ValueCell>
              </TableRow>
            ))}
          </ComparisonTable>
        </ComparisonSection>

        {/* Testimonials */}
        <TestimonialsSection data-animate>
          <SectionTitle>
            <MessageSquare />
            {isBg ? 'Какво казват нашите клиенти' : 'What Our Customers Say'}
          </SectionTitle>
          <SectionSubtitle>
            {isBg
              ? 'Истории на успех от хора като вас'
              : 'Success stories from people like you'}
          </SectionSubtitle>

          <TestimonialsGrid>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                style={{ '--index': index } as React.CSSProperties}
              >
                <QuoteIcon>
                  <Quote />
                </QuoteIcon>
                <Stars>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} />
                  ))}
                </Stars>
                <TestimonialText>"{testimonial.text}"</TestimonialText>
                <TestimonialAuthor>
                  <AuthorAvatar>{testimonial.avatar}</AuthorAvatar>
                  <AuthorInfo>
                    <div className="name">{testimonial.name}</div>
                    <div className="role">{testimonial.role}</div>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </TestimonialsSection>

        {/* FAQ */}
        <FAQSection data-animate>
          <SectionTitle>
            <HelpCircle />
            {isBg ? 'Често задавани въпроси' : 'Frequently Asked Questions'}
          </SectionTitle>
          <SectionSubtitle>
            {isBg
              ? 'Всичко което трябва да знаете'
              : 'Everything you need to know'}
          </SectionSubtitle>

          <FAQList>
            {faqs.map((faq, index) => (
              <FAQItem key={index} $isOpen={openFAQ === index}>
                <FAQQuestion onClick={() => setOpenFAQ(openFAQ === index ? null : index)}>
                  <span>{faq.question}</span>
                  <ChevronDown
                    style={{
                      transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0)'
                    }}
                  />
                </FAQQuestion>
                <FAQAnswer $isOpen={openFAQ === index}>
                  {faq.answer}
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQList>
        </FAQSection>

        {/* CTA Section */}
        <CTASection data-animate>
          <CTAContent>
            <CTATitle>
              <Target />
              {isBg ? 'Готови да започнете?' : 'Ready to Get Started?'}
            </CTATitle>
            <CTAText>
              {isBg
                ? 'Присъединете се към хиляди доволни клиенти днес'
                : 'Join thousands of happy customers today'}
            </CTAText>
            <CTAButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {isBg ? 'Изберете план сега' : 'Choose Plan Now'}
            </CTAButton>
          </CTAContent>
        </CTASection>
      </MainContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
