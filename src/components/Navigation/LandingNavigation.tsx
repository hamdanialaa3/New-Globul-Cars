/**
 * Navigation Bar with New Landing Page Links
 * شريط التنقل مع روابط الصفحات الجديدة
 * 
 * @since January 17, 2026
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { navigationLinks } from '@/config/navigation-links'; // المسارات متاحة الآن

// ==================== STYLES ====================

const NavContainer = styled.nav`
  display: flex;
  gap: 8px;
  padding: 8px 0;
  flex-wrap: wrap;
`;

const NavLink = styled(Link)`
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// ==================== TYPES ====================

interface LandingNavProps {
  className?: string;
  compact?: boolean;
}

// ==================== COMPONENT ====================

export const LandingNavigation: React.FC<LandingNavProps> = ({ className }) => {
  const { language } = useLanguage();

  const labels = {
    bg: {
      whyUs: 'Защо избираме нас',
      launchOffer: 'Специално предложение',
      comparison: 'Сравнение',
      sell: 'Продайте вашия автомобил',
      browse: 'Преглед обяви'
    },
    en: {
      whyUs: 'Why Globul Cars',
      launchOffer: 'Launch Offer',
      comparison: 'Comparison',
      sell: 'Sell Your Car',
      browse: 'Browse Cars'
    }
  };

  const text = language === 'bg' ? labels.bg : labels.en;

  return (
    <NavContainer className={className}>
      <NavLink to={navigationLinks.public.search} title={text.browse}>
        {text.browse}
      </NavLink>
      <NavLink to={navigationLinks.public.whyUs} title={text.whyUs}>
        {text.whyUs}
      </NavLink>
      <NavLink to={navigationLinks.public.launchOffer} title={text.launchOffer}>
        {text.launchOffer}
      </NavLink>
      <NavLink to={navigationLinks.public.competitiveComparison} title={text.comparison}>
        {text.comparison}
      </NavLink>
      <NavLink to={navigationLinks.dealer.sell} title={text.sell}>
        {text.sell}
      </NavLink>
    </NavContainer>
  );
};

export default LandingNavigation;
