// src/pages/SitemapPage.tsx
// Sitemap Page for Koli One

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Map,
  Home,
  Car,
  Plus,
  Search,
  User,
  MessageCircle,
  BarChart3,
  Settings,
  Shield,
  HelpCircle,
  Mail,
  FileText,
  Cookie,
  Info,
  Wifi,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Styled Components
const SitemapContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.$isDark ? '#0F1419' : '#f8fafc'};
  padding: 40px 0;
  transition: background 0.3s ease;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.section<{ $isDark: boolean }>`
  text-align: center;
  padding: 80px 40px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #1A1F2E 0%, #0F1419 100%)'
    : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'};
  color: white;
  border-radius: 24px;
  margin-bottom: 48px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
  box-shadow: ${props => props.$isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(30, 64, 175, 0.2)'};

  h1 {
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 800;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    max-width: 650px;
    margin: 0 auto;
    font-weight: 500;
  }
`;

const SitemapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const SitemapSection = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : '#ffffff'};
  padding: 32px;
  border-radius: 20px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${props => props.$isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${props => props.$isDark ? '#2d3748' : '#f1f5f9'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LinkItem = styled.li`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SitemapLink = styled(Link) <{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-weight: 600;
  font-size: 0.95rem;

  &:hover {
    background: ${props => props.$isDark ? 'rgba(255, 140, 97, 0.1)' : '#f1f5f9'};
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    transform: translateX(8px);
    
    .chevron {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .link-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: ${props => props.$isDark ? '#4a5568' : '#94a3b8'};
  }
  
  .chevron {
    opacity: 0;
    transform: translateX(-5px);
    transition: all 0.3s ease;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
  }
`;

const ExternalLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: #f1f5f9;
    color: #1e40af;
    transform: translateX(5px);
  }

  .icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const InfoSection = styled.section<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : '#ffffff'};
  padding: 48px;
  border-radius: 24px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${props => props.$isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0, 0, 0, 0.05)'};
  text-align: center;
  margin-top: 48px;

  h2 {
    font-size: 2rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
    margin-bottom: 40px;
    line-height: 1.6;
    font-size: 1.1rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }

  .stat-item {
    background: ${props => props.$isDark ? '#0F1419' : '#f8fafc'};
    padding: 24px;
    border-radius: 16px;
    border: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
    transition: all 0.3s ease;

    &:hover {
      border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
      transform: translateY(-5px);
    }

    .number {
      font-size: 2rem;
      font-weight: 800;
      color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
      margin-bottom: 8px;
    }

    .label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${props => props.$isDark ? '#4a5568' : '#64748b'};
    }
  }
`;

const SitemapPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SitemapContainer $isDark={isDark}>
      <Container>
        <Header $isDark={isDark}>
          <h1>
            <Map size={48} />
            {t('sitemap.title', 'Sitemap')}
          </h1>
          <p>
            {t('sitemap.subtitle', 'Navigate through all pages and sections of our website.')}
          </p>
        </Header>

        <SitemapGrid>
          <SitemapSection $isDark={isDark}>
            <h2>
              <Home size={24} />
              {t('sitemap.main.title', 'Main Pages')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/" $isDark={isDark}>
                  <div className="link-content">
                    <Home className="icon" size={20} />
                    {t('sitemap.main.home', 'Home')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.main.cars', 'Browse Cars')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/sell" $isDark={isDark}>
                  <div className="link-content">
                    <Plus className="icon" size={20} />
                    {t('sitemap.main.sell', 'Sell Car')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/advanced-search" $isDark={isDark}>
                  <div className="link-content">
                    <Search className="icon" size={20} />
                    {t('sitemap.main.search', 'Advanced Search')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection $isDark={isDark}>
            <h2>
              <User size={24} />
              {t('sitemap.user.title', 'User Account')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/login" $isDark={isDark}>
                  <div className="link-content">
                    <User className="icon" size={20} />
                    {t('sitemap.user.login', 'Login')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/register" $isDark={isDark}>
                  <div className="link-content">
                    <User className="icon" size={20} />
                    {t('sitemap.user.register', 'Register')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/profile" $isDark={isDark}>
                  <div className="link-content">
                    <User className="icon" size={20} />
                    {t('sitemap.user.profile', 'Profile')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/dashboard" $isDark={isDark}>
                  <div className="link-content">
                    <BarChart3 className="icon" size={20} />
                    {t('sitemap.user.dashboard', 'Dashboard')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/messages" $isDark={isDark}>
                  <div className="link-content">
                    <MessageCircle className="icon" size={20} />
                    {t('sitemap.user.messages', 'Messages')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection $isDark={isDark}>
            <h2>
              <Settings size={24} />
              {t('sitemap.features.title', 'Advanced Features')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/analytics" $isDark={isDark}>
                  <div className="link-content">
                    <BarChart3 className="icon" size={20} />
                    {t('sitemap.features.analytics', 'Analytics')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/digital-twin" $isDark={isDark}>
                  <div className="link-content">
                    <Settings className="icon" size={20} />
                    {t('sitemap.features.digitalTwin', 'Digital Twin')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/subscription" $isDark={isDark}>
                  <div className="link-content">
                    <Settings className="icon" size={20} />
                    {t('sitemap.features.subscription', 'Subscription')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/iot-dashboard" $isDark={isDark}>
                  <div className="link-content">
                    <Settings className="icon" size={20} />
                    {t('sitemap.features.iot', 'IoT Dashboard')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/car-tracking" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.features.tracking', 'Car Tracking')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/iot-analytics" $isDark={isDark}>
                  <div className="link-content">
                    <BarChart3 className="icon" size={20} />
                    {t('sitemap.features.iotAnalytics', 'IoT Analytics')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection $isDark={isDark}>
            <h2>
              <Info size={24} />
              {t('sitemap.info.title', 'Information')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/about" $isDark={isDark}>
                  <div className="link-content">
                    <Info className="icon" size={20} />
                    {t('sitemap.info.about', 'About Us')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/contact" $isDark={isDark}>
                  <div className="link-content">
                    <Mail className="icon" size={20} />
                    {t('sitemap.info.contact', 'Contact')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/help" $isDark={isDark}>
                  <div className="link-content">
                    <HelpCircle className="icon" size={20} />
                    {t('sitemap.info.help', 'Help Center')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection $isDark={isDark}>
            <h2>
              <Shield size={24} />
              {t('sitemap.legal.title', 'Legal & Privacy')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/privacy-policy" $isDark={isDark}>
                  <div className="link-content">
                    <Shield className="icon" size={20} />
                    {t('sitemap.legal.privacy', 'Privacy Policy')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/terms-of-service" $isDark={isDark}>
                  <div className="link-content">
                    <FileText className="icon" size={20} />
                    {t('sitemap.legal.terms', 'Terms of Service')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cookie-policy" $isDark={isDark}>
                  <div className="link-content">
                    <Cookie className="icon" size={20} />
                    {t('sitemap.legal.cookies', 'Cookie Policy')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/data-deletion" $isDark={isDark}>
                  <div className="link-content">
                    <FileText className="icon" size={20} />
                    {t('sitemap.legal.dataDeletion', 'Data Deletion')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection $isDark={isDark}>
            <h2>
              <Shield size={24} />
              {t('sitemap.admin.title', 'Admin & Management')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/admin" $isDark={isDark}>
                  <div className="link-content">
                    <Settings className="icon" size={20} />
                    {t('sitemap.admin.dashboard', 'Admin Dashboard')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/admin/integration-status" $isDark={isDark}>
                  <div className="link-content">
                    <Wifi className="icon" size={20} />
                    {t('sitemap.admin.integration', 'Integration Status')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/admin/setup" $isDark={isDark}>
                  <div className="link-content">
                    <Zap className="icon" size={20} />
                    {t('sitemap.admin.setup', 'Quick Setup')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/super-admin" $isDark={isDark}>
                  <div className="link-content">
                    <Shield className="icon" size={20} />
                    {t('sitemap.admin.superAdmin', 'Super Admin')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection $isDark={isDark}>
            <h2>
              <Car size={24} />
              {t('sitemap.categories.title', 'Car Categories')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/cars?category=sedan" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.categories.sedan', 'Sedan')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=suv" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.categories.suv', 'SUV')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=hatchback" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.categories.hatchback', 'Hatchback')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=coupe" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.categories.coupe', 'Coupe')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=convertible" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.categories.convertible', 'Convertible')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=wagon" $isDark={isDark}>
                  <div className="link-content">
                    <Car className="icon" size={20} />
                    {t('sitemap.categories.wagon', 'Wagon')}
                  </div>
                  <ChevronRight className="chevron" size={16} />
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>
        </SitemapGrid>

        <InfoSection $isDark={isDark}>
          <h2>{t('sitemap.stats.title', 'Website Statistics')}</h2>
          <p>
            {t('sitemap.stats.subtitle', 'Our platform continues to grow with more users and listings every day.')}
          </p>

          <div className="stats">
            <div className="stat-item">
              <div className="number">60+</div>
              <div className="label">{t('sitemap.stats.pages', 'Pages')}</div>
            </div>
            <div className="stat-item">
              <div className="number">10,000+</div>
              <div className="label">{t('sitemap.stats.listings', 'Car Listings')}</div>
            </div>
            <div className="stat-item">
              <div className="number">50,000+</div>
              <div className="label">{t('sitemap.stats.users', 'Users')}</div>
            </div>
            <div className="stat-item">
              <div className="number">28</div>
              <div className="label">{t('sitemap.stats.cities', 'Cities')}</div>
            </div>
          </div>
        </InfoSection>
      </Container>
    </SitemapContainer>
  );
};

export default SitemapPage;

