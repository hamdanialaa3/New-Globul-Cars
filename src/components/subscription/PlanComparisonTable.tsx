/**
 * Plan Comparison Table Component
 * Professional feature comparison for subscription plans
 * 
 * File: src/components/subscription/PlanComparisonTable.tsx
 * Created: January 8, 2026
 */

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Check, X, Crown, Star, Zap, Users, Car, Eye,
  MessageCircle, Shield, Headphones, Clock, Award,
  ChevronDown, ChevronUp, Sparkles, Rocket, Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
// ✅ CRITICAL: Import subscription plans for accurate pricing
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// ==================== STYLED COMPONENTS ====================

const TableContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 24px;
  border: 2px solid var(--border-primary);
  background: var(--bg-card);
  box-shadow: var(--shadow-xl);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const TableHead = styled.thead`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $highlight?: boolean }>`
  border-bottom: 1px solid var(--border-primary);
  animation: ${fadeIn} 0.5s ease-out;
  
  ${p => p.$highlight && css`
    background: rgba(102, 126, 234, 0.05);
  `}
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(102, 126, 234, 0.03);
  }
`;

const TableHeadCell = styled.th<{ $featured?: boolean; $first?: boolean }>`
  padding: 1.5rem 1rem;
  text-align: center;
  vertical-align: bottom;
  position: relative;
  
  ${p => p.$first && css`
    text-align: left;
    width: 35%;
  `}
  
  ${p => p.$featured && css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ffd700, #ffb347, #ffd700);
      background-size: 200% 100%;
      animation: ${shimmer} 2s linear infinite;
    }
  `}
`;

const PlanHeader = styled.div<{ $featured?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${p => p.$featured ? 'white' : 'var(--text-primary)'};
`;

const PlanIcon = styled.div<{ $color: string; $featured?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  
  ${p => p.$featured ? css`
    background: rgba(255, 255, 255, 0.2);
    svg { color: white; }
  ` : css`
    background: ${p.$color}20;
    svg { color: ${p.$color}; }
  `}
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const PlanName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
`;

const PlanPrice = styled.div<{ $featured?: boolean }>`
  font-size: 1.75rem;
  font-weight: 800;
  ${p => !p.$featured && css`
    color: var(--accent-primary);
  `}
`;

const PlanPriceUnit = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.8;
`;

const PopularBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  margin-top: 0.5rem;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const TableCell = styled.td<{ $first?: boolean; $featured?: boolean }>`
  padding: 1rem;
  text-align: center;
  
  ${p => p.$first && css`
    text-align: left;
    padding-left: 1.5rem;
  `}
  
  ${p => p.$featured && css`
    background: rgba(102, 126, 234, 0.03);
  `}
`;

const FeatureLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${p => p.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 18px;
    height: 18px;
    color: ${p => p.$color};
  }
`;

const FeatureText = styled.div``;

const FeatureName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const FeatureDesc = styled.div`
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
`;

const ValueCheck = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    color: #10b981;
  }
`;

const ValueX = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    color: #ef4444;
  }
`;

const ValueText = styled.div<{ $highlight?: boolean }>`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${p => p.$highlight ? 'var(--accent-primary)' : 'var(--text-primary)'};
`;

const ValueUnlimited = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--accent-primary);
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// Category Row
const CategoryRow = styled.tr`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
`;

const CategoryCell = styled.td`
  padding: 0.85rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// CTA Row
const CTARow = styled.tr`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
`;

const CTACell = styled.td<{ $featured?: boolean }>`
  padding: 1.5rem 1rem;
  text-align: center;
  
  ${p => p.$featured && css`
    background: rgba(102, 126, 234, 0.05);
  `}
`;

const CTAButton = styled.button<{ $featured?: boolean }>`
  padding: 0.85rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  ${p => p.$featured ? css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    animation: ${pulse} 2s infinite;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
    }
  ` : css`
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border-primary);
    
    &:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
  `}
`;

// ==================== TYPES ====================

interface Feature {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
  name: { bg: string; en: string };
  description?: { bg: string; en: string };
  free: string | boolean;
  dealer: string | boolean;
  company: string | boolean;
}

interface Category {
  id: string;
  name: { bg: string; en: string };
  icon: React.ReactNode;
  features: Feature[];
}

// ==================== COMPONENT ====================

export const PlanComparisonTable: React.FC = () => {
  const { language } = useLanguage();

  const t = {
    bg: {
      title: '📊 Сравни Плановете',
      subtitle: 'Избери най-добрия план за твоите нужди',
      free: 'Безплатен',
      dealer: 'Търговец',
      company: 'Компания',
      popular: 'Най-популярен',
      month: '/месец',
      getStarted: 'Започни',
      subscribe: 'Абонирай се',
      contactUs: 'Свържи се',
      unlimited: 'Неограничен',
      categories: {
        listings: 'Обяви',
        visibility: 'Видимост',
        support: 'Поддръжка',
        tools: 'Инструменти'
      }
    },
    en: {
      title: '📊 Compare Plans',
      subtitle: 'Choose the best plan for your needs',
      free: 'Free',
      dealer: 'Dealer',
      company: 'Company',
      popular: 'Most Popular',
      month: '/month',
      getStarted: 'Get Started',
      subscribe: 'Subscribe',
      contactUs: 'Contact Us',
      unlimited: 'Unlimited',
      categories: {
        listings: 'Listings',
        visibility: 'Visibility',
        support: 'Support',
        tools: 'Tools'
      }
    }
  };

  const text = t[language] || t.en;

  const categories: Category[] = [
    {
      id: 'listings',
      name: { bg: 'Обяви', en: 'Listings' },
      icon: <Car />,
      features: [
        {
          id: 'active_listings',
          icon: <Car />,
          iconColor: '#667eea',
          name: { bg: 'Активни обяви', en: 'Active Listings' },
          description: { bg: 'Максимален брой обяви', en: 'Maximum number of listings' },
          free: '3',
          dealer: '30',
          company: 'unlimited'
        },
        {
          id: 'photos_per_listing',
          icon: <Eye />,
          iconColor: '#10b981',
          name: { bg: 'Снимки на обява', en: 'Photos per Listing' },
          free: '10',
          dealer: '25',
          company: '50'
        },
        {
          id: 'video_upload',
          icon: <Rocket />,
          iconColor: '#f59e0b',
          name: { bg: 'Видео качване', en: 'Video Upload' },
          free: false,
          dealer: true,
          company: true
        }
      ]
    },
    {
      id: 'visibility',
      name: { bg: 'Видимост', en: 'Visibility' },
      icon: <Eye />,
      features: [
        {
          id: 'featured_listing',
          icon: <Star />,
          iconColor: '#ffd700',
          name: { bg: 'Промотирани обяви', en: 'Featured Listings' },
          free: false,
          dealer: '2/месец',
          company: '10/месец'
        },
        {
          id: 'top_search',
          icon: <Zap />,
          iconColor: '#ec4899',
          name: { bg: 'Топ в търсенето', en: 'Top in Search' },
          free: false,
          dealer: true,
          company: true
        },
        {
          id: 'badge',
          icon: <Award />,
          iconColor: '#8b5cf6',
          name: { bg: 'Верифициран бадж', en: 'Verified Badge' },
          free: false,
          dealer: true,
          company: true
        }
      ]
    },
    {
      id: 'support',
      name: { bg: 'Поддръжка', en: 'Support' },
      icon: <Headphones />,
      features: [
        {
          id: 'support_type',
          icon: <Headphones />,
          iconColor: '#06b6d4',
          name: { bg: 'Тип поддръжка', en: 'Support Type' },
          free: 'Email',
          dealer: 'Priority',
          company: 'Dedicated'
        },
        {
          id: 'response_time',
          icon: <Clock />,
          iconColor: '#6366f1',
          name: { bg: 'Време за отговор', en: 'Response Time' },
          free: '48h',
          dealer: '4h',
          company: '1h'
        },
        {
          id: 'account_manager',
          icon: <Users />,
          iconColor: '#14b8a6',
          name: { bg: 'Личен мениджър', en: 'Account Manager' },
          free: false,
          dealer: false,
          company: true
        }
      ]
    },
    {
      id: 'tools',
      name: { bg: 'Инструменти', en: 'Tools' },
      icon: <Shield />,
      features: [
        {
          id: 'analytics',
          icon: <Shield />,
          iconColor: '#84cc16',
          name: { bg: 'Разширена аналитика', en: 'Advanced Analytics' },
          free: false,
          dealer: true,
          company: true
        },
        {
          id: 'bulk_upload',
          icon: <Rocket />,
          iconColor: '#f97316',
          name: { bg: 'Масово качване', en: 'Bulk Upload' },
          free: false,
          dealer: true,
          company: true
        },
        {
          id: 'api_access',
          icon: <Zap />,
          iconColor: '#a855f7',
          name: { bg: 'API достъп', en: 'API Access' },
          free: false,
          dealer: false,
          company: true
        }
      ]
    }
  ];

  const renderValue = (value: string | boolean) => {
    if (value === true) {
      return <ValueCheck><Check /></ValueCheck>;
    }
    if (value === false) {
      return <ValueX><X /></ValueX>;
    }
    if (value === 'unlimited') {
      return (
        <ValueUnlimited>
          <Sparkles />
          {text.unlimited}
        </ValueUnlimited>
      );
    }
    return <ValueText $highlight>{value}</ValueText>;
  };

  return (
    <TableContainer>
      <Header>
        <Title>{text.title}</Title>
        <Subtitle>{text.subtitle}</Subtitle>
      </Header>

      <TableWrapper>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell $first />
              
              {/* Free Plan */}
              <TableHeadCell>
                <PlanHeader>
                  <PlanIcon $color="#6b7280">
                    <Star />
                  </PlanIcon>
                  <PlanName>{text.free}</PlanName>
                  <PlanPrice>0€<PlanPriceUnit>{text.month}</PlanPriceUnit></PlanPrice>
                </PlanHeader>
              </TableHeadCell>

              {/* Dealer Plan - Featured */}
              <TableHeadCell $featured>
                <PlanHeader $featured>
                  <PlanIcon $color="#667eea" $featured>
                    <Crown />
                  </PlanIcon>
                  <PlanName>{text.dealer}</PlanName>
                  <PlanPrice $featured>{SUBSCRIPTION_PLANS.dealer.price.monthly}€<PlanPriceUnit>{text.month}</PlanPriceUnit></PlanPrice>
                  <PopularBadge>
                    <Sparkles />
                    {text.popular}
                  </PopularBadge>
                </PlanHeader>
              </TableHeadCell>

              {/* Company Plan */}
              <TableHeadCell>
                <PlanHeader>
                  <PlanIcon $color="#8b5cf6">
                    <Building2 />
                  </PlanIcon>
                  <PlanName>{text.company}</PlanName>
                  <PlanPrice>{SUBSCRIPTION_PLANS.company.price.monthly}€<PlanPriceUnit>{text.month}</PlanPriceUnit></PlanPrice>
                </PlanHeader>
              </TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map(category => (
              <React.Fragment key={category.id}>
                {/* Category Header */}
                <CategoryRow>
                  <CategoryCell colSpan={4}>
                    {category.icon}
                    {category.name[language]}
                  </CategoryCell>
                </CategoryRow>

                {/* Features */}
                {category.features.map(feature => (
                  <TableRow key={feature.id}>
                    <TableCell $first>
                      <FeatureLabel>
                        <FeatureIcon $color={feature.iconColor}>
                          {feature.icon}
                        </FeatureIcon>
                        <FeatureText>
                          <FeatureName>{feature.name[language]}</FeatureName>
                          {feature.description && (
                            <FeatureDesc>{feature.description[language]}</FeatureDesc>
                          )}
                        </FeatureText>
                      </FeatureLabel>
                    </TableCell>
                    <TableCell>{renderValue(feature.free)}</TableCell>
                    <TableCell $featured>{renderValue(feature.dealer)}</TableCell>
                    <TableCell>{renderValue(feature.company)}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}

            {/* CTA Row */}
            <CTARow>
              <CTACell />
              <CTACell>
                <CTAButton>{text.getStarted}</CTAButton>
              </CTACell>
              <CTACell $featured>
                <CTAButton $featured>
                  <Crown size={18} />
                  {text.subscribe}
                </CTAButton>
              </CTACell>
              <CTACell>
                <CTAButton>{text.contactUs}</CTAButton>
              </CTACell>
            </CTARow>
          </TableBody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
};

export default PlanComparisonTable;
