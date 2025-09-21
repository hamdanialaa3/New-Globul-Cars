// src/components/Footer.tsx
// Footer Component for Bulgarian Car Marketplace

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import logoImage from '../assets/logo.png';
import {
  ProfessionalFacebookIcon,
  ProfessionalInstagramIcon,
  ProfessionalTwitterIcon,
  ProfessionalLinkedInIcon
} from './CustomIcons';

// Styled Components
const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FooterSection = styled.div`
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: flex;
    align-items: center;
    
    img {
      height: 32px;
      width: auto;
      margin-right: 8px;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  a {
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    transition: color 0.2s ease-in-out, text-decoration-color 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: color 0.2s ease-in-out, text-decoration-color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrastText};
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  padding-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Copyright = styled.div`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;

  a {
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    transition: color 0.2s ease-in-out, text-decoration-color 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
`;

const BulgarianFlag = styled.div`
  width: 20px;
  height: 15px;
  background: linear-gradient(to bottom,
    ${({ theme }) => theme.colors.primary.main} 33%,
    white 33% 66%,
    ${({ theme }) => theme.colors.secondary.main} 66%
  );
  border-radius: 2px;
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing.xs};
  vertical-align: middle;
`;

// Footer Component
const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          {/* Company Info */}
          <FooterSection>
            <h3>
              <img src={logoImage} alt="Globul Cars" />
              Globul Cars
            </h3>
            <p>
              {t('footer.description')}
            </p>
            <SocialLinks>
              <SocialLink href="https://facebook.com/globulcars" target="_blank" rel="noopener noreferrer">
                <ProfessionalFacebookIcon size={20} />
              </SocialLink>
              <SocialLink href="https://instagram.com/globulcars" target="_blank" rel="noopener noreferrer">
                <ProfessionalInstagramIcon size={20} />
              </SocialLink>
              <SocialLink href="https://twitter.com/globulcars" target="_blank" rel="noopener noreferrer">
                <ProfessionalTwitterIcon size={20} />
              </SocialLink>
              <SocialLink href="https://linkedin.com/company/globulcars" target="_blank" rel="noopener noreferrer">
                <ProfessionalLinkedInIcon size={20} />
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection>
            <h3>{t('footer.quickLinks')}</h3>
            <ul>
              <li><FooterLink to="/">{t('nav.home')}</FooterLink></li>
              <li><FooterLink to="/cars">{t('nav.cars')}</FooterLink></li>
              <li><FooterLink to="/sell">{t('nav.sell')}</FooterLink></li>
              <li><FooterLink to="/about">{t('nav.about')}</FooterLink></li>
              <li><FooterLink to="/contact">{t('nav.contact')}</FooterLink></li>
            </ul>
          </FooterSection>

          {/* Services */}
          <FooterSection>
            <h3>{t('footer.services')}</h3>
            <ul>
              <li><FooterLink to="/services/car-valuation">{t('footer.carValuation')}</FooterLink></li>
              <li><FooterLink to="/services/financing">{t('footer.financing')}</FooterLink></li>
              <li><FooterLink to="/services/insurance">{t('footer.insurance')}</FooterLink></li>
              <li><FooterLink to="/services/maintenance">{t('footer.maintenance')}</FooterLink></li>
              <li><FooterLink to="/services/trade-in">{t('footer.tradeIn')}</FooterLink></li>
            </ul>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection>
            <h3>{t('footer.contact')}</h3>
            <ul>
              <li>
                <strong>{t('footer.phone')}:</strong><br />
                +359 2 123 4567
              </li>
              <li>
                <strong>{t('footer.email')}:</strong><br />
                info@globulcars.bg
              </li>
              <li>
                <strong>{t('footer.address')}:</strong><br />
                ул. Витоша 1<br />
                София 1000, България
              </li>
              <li>
                <strong>{t('footer.workingHours')}:</strong><br />
                Пн-Пт: 9:00-18:00<br />
                Сб: 10:00-16:00
              </li>
            </ul>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            <BulgarianFlag />
            © {currentYear} Globul Cars. {t('footer.copyright')}
          </Copyright>
          <FooterLinks>
            <a href="/privacy">{t('footer.privacy')}</a>
            <a href="/terms">{t('footer.terms')}</a>
            <a href="/cookies">{t('footer.cookies')}</a>
            <a href="/sitemap">{t('footer.sitemap')}</a>
          </FooterLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;