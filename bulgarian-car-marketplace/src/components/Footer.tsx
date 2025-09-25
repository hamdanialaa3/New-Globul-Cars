import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Globe,
  Heart
} from 'lucide-react';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.background.paper};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  line-height: 1.5;
`;

const FooterContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const FooterContactIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const FooterSocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const FooterSocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  padding-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
`;

const FooterCopyright = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

const FooterBottomLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <FooterSectionTitle>{t('footer.about.title', 'About Us')}</FooterSectionTitle>
            <FooterText>
              {t('footer.about.description', 'Your trusted partner in finding the perfect car in Bulgaria. We connect buyers and sellers with quality vehicles and exceptional service.')}
            </FooterText>
            <FooterSocialLinks>
              <FooterSocialLink href="#" aria-label="Facebook">
                <Facebook size={20} />
              </FooterSocialLink>
              <FooterSocialLink href="#" aria-label="Twitter">
                <Twitter size={20} />
              </FooterSocialLink>
              <FooterSocialLink href="#" aria-label="Instagram">
                <Instagram size={20} />
              </FooterSocialLink>
              <FooterSocialLink href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </FooterSocialLink>
              <FooterSocialLink href="#" aria-label="YouTube">
                <Youtube size={20} />
              </FooterSocialLink>
            </FooterSocialLinks>
          </FooterSection>

          <FooterSection>
            <FooterSectionTitle>{t('footer.quickLinks.title', 'Quick Links')}</FooterSectionTitle>
            <FooterLink to="/">{t('footer.quickLinks.home', 'Home')}</FooterLink>
            <FooterLink to="/cars">{t('footer.quickLinks.cars', 'Cars')}</FooterLink>
            <FooterLink to="/sell">{t('footer.quickLinks.sell', 'Sell Car')}</FooterLink>
            <FooterLink to="/about">{t('footer.quickLinks.about', 'About')}</FooterLink>
            <FooterLink to="/contact">{t('footer.quickLinks.contact', 'Contact')}</FooterLink>
            <FooterLink to="/help">{t('footer.quickLinks.help', 'Help')}</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterSectionTitle>{t('footer.categories.title', 'Categories')}</FooterSectionTitle>
            <FooterLink to="/cars?category=sedan">{t('footer.categories.sedan', 'Sedan')}</FooterLink>
            <FooterLink to="/cars?category=suv">{t('footer.categories.suv', 'SUV')}</FooterLink>
            <FooterLink to="/cars?category=hatchback">{t('footer.categories.hatchback', 'Hatchback')}</FooterLink>
            <FooterLink to="/cars?category=coupe">{t('footer.categories.coupe', 'Coupe')}</FooterLink>
            <FooterLink to="/cars?category=convertible">{t('footer.categories.convertible', 'Convertible')}</FooterLink>
            <FooterLink to="/cars?category=wagon">{t('footer.categories.wagon', 'Wagon')}</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterSectionTitle>{t('footer.contact.title', 'Contact Info')}</FooterSectionTitle>
            <FooterContactItem>
              <FooterContactIcon>
                <MapPin size={16} />
              </FooterContactIcon>
              {t('footer.contact.address', 'Sofia, Bulgaria')}
            </FooterContactItem>
            <FooterContactItem>
              <FooterContactIcon>
                <Phone size={16} />
              </FooterContactIcon>
              {t('footer.contact.phone', '+359 2 123 4567')}
            </FooterContactItem>
            <FooterContactItem>
              <FooterContactIcon>
                <Mail size={16} />
              </FooterContactIcon>
              {t('footer.contact.email', 'info@globulcars.bg')}
            </FooterContactItem>
            <FooterContactItem>
              <FooterContactIcon>
                <Globe size={16} />
              </FooterContactIcon>
              {t('footer.contact.website', 'www.globulcars.bg')}
            </FooterContactItem>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <FooterCopyright>
            © 2024 Globul Cars. {t('footer.copyright.rights', 'All rights reserved.')} 
            <Heart size={16} color="#e53e3e" />
          </FooterCopyright>
          <FooterBottomLinks>
            <FooterBottomLink to="/privacy">{t('footer.legal.privacy', 'Privacy Policy')}</FooterBottomLink>
            <FooterBottomLink to="/terms">{t('footer.legal.terms', 'Terms of Service')}</FooterBottomLink>
            <FooterBottomLink to="/cookies">{t('footer.legal.cookies', 'Cookie Policy')}</FooterBottomLink>
            <FooterBottomLink to="/sitemap">{t('footer.legal.sitemap', 'Sitemap')}</FooterBottomLink>
          </FooterBottomLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;