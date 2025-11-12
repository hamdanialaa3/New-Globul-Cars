// src/pages/SitemapPage.tsx
// Sitemap Page for Bulgarian Car Marketplace

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
  Zap
} from 'lucide-react';

// Styled Components
const SitemapContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.section`
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border-radius: 24px;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SitemapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const SitemapSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e2e8f0;
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

const SitemapLink = styled(Link)`
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

const InfoSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  p {
    color: #64748b;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .stat-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;

    .number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 0.25rem;
    }

    .label {
      font-size: 0.9rem;
      color: #64748b;
    }
  }
`;

const SitemapPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SitemapContainer>
      <Container>
        <Header>
          <h1>
            <Map size={40} />
            {t('sitemap.title', 'Sitemap')}
          </h1>
          <p>
            {t('sitemap.subtitle', 'Navigate through all pages and sections of our website.')}
          </p>
        </Header>

        <SitemapGrid>
          <SitemapSection>
            <h2>
              <Home size={24} />
              {t('sitemap.main.title', 'Main Pages')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/">
                  <Home className="icon" size={20} />
                  {t('sitemap.main.home', 'Home')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars">
                  <Car className="icon" size={20} />
                  {t('sitemap.main.cars', 'Browse Cars')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/sell">
                  <Plus className="icon" size={20} />
                  {t('sitemap.main.sell', 'Sell Car')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/advanced-search">
                  <Search className="icon" size={20} />
                  {t('sitemap.main.search', 'Advanced Search')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection>
            <h2>
              <User size={24} />
              {t('sitemap.user.title', 'User Account')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/login">
                  <User className="icon" size={20} />
                  {t('sitemap.user.login', 'Login')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/register">
                  <User className="icon" size={20} />
                  {t('sitemap.user.register', 'Register')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/profile">
                  <User className="icon" size={20} />
                  {t('sitemap.user.profile', 'Profile')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/dashboard">
                  <BarChart3 className="icon" size={20} />
                  {t('sitemap.user.dashboard', 'Dashboard')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/messages">
                  <MessageCircle className="icon" size={20} />
                  {t('sitemap.user.messages', 'Messages')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection>
            <h2>
              <Settings size={24} />
              {t('sitemap.features.title', 'Advanced Features')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/analytics">
                  <BarChart3 className="icon" size={20} />
                  {t('sitemap.features.analytics', 'Analytics')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/digital-twin">
                  <Settings className="icon" size={20} />
                  {t('sitemap.features.digitalTwin', 'Digital Twin')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/subscription">
                  <Settings className="icon" size={20} />
                  {t('sitemap.features.subscription', 'Subscription')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/iot-dashboard">
                  <Settings className="icon" size={20} />
                  {t('sitemap.features.iot', 'IoT Dashboard')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/car-tracking">
                  <Car className="icon" size={20} />
                  {t('sitemap.features.tracking', 'Car Tracking')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/iot-analytics">
                  <BarChart3 className="icon" size={20} />
                  {t('sitemap.features.iotAnalytics', 'IoT Analytics')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection>
            <h2>
              <Info size={24} />
              {t('sitemap.info.title', 'Information')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/about">
                  <Info className="icon" size={20} />
                  {t('sitemap.info.about', 'About Us')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/contact">
                  <Mail className="icon" size={20} />
                  {t('sitemap.info.contact', 'Contact')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/help">
                  <HelpCircle className="icon" size={20} />
                  {t('sitemap.info.help', 'Help Center')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection>
            <h2>
              <Shield size={24} />
              {t('sitemap.legal.title', 'Legal & Privacy')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/privacy-policy">
                  <Shield className="icon" size={20} />
                  {t('sitemap.legal.privacy', 'Privacy Policy')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/terms-of-service">
                  <FileText className="icon" size={20} />
                  {t('sitemap.legal.terms', 'Terms of Service')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cookie-policy">
                  <Cookie className="icon" size={20} />
                  {t('sitemap.legal.cookies', 'Cookie Policy')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/data-deletion">
                  <FileText className="icon" size={20} />
                  {t('sitemap.legal.dataDeletion', 'Data Deletion')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection>
            <h2>
              <Shield size={24} />
              {t('sitemap.admin.title', 'Admin & Management')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/admin">
                  <Settings className="icon" size={20} />
                  {t('sitemap.admin.dashboard', 'Admin Dashboard')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/admin/integration-status">
                  <Wifi className="icon" size={20} />
                  {t('sitemap.admin.integration', 'Integration Status')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/admin/setup">
                  <Zap className="icon" size={20} />
                  {t('sitemap.admin.setup', 'Quick Setup')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/super-admin">
                  <Shield className="icon" size={20} />
                  {t('sitemap.admin.superAdmin', 'Super Admin')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>

          <SitemapSection>
            <h2>
              <Car size={24} />
              {t('sitemap.categories.title', 'Car Categories')}
            </h2>
            <LinkList>
              <LinkItem>
                <SitemapLink to="/cars?category=sedan">
                  <Car className="icon" size={20} />
                  {t('sitemap.categories.sedan', 'Sedan')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=suv">
                  <Car className="icon" size={20} />
                  {t('sitemap.categories.suv', 'SUV')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=hatchback">
                  <Car className="icon" size={20} />
                  {t('sitemap.categories.hatchback', 'Hatchback')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=coupe">
                  <Car className="icon" size={20} />
                  {t('sitemap.categories.coupe', 'Coupe')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=convertible">
                  <Car className="icon" size={20} />
                  {t('sitemap.categories.convertible', 'Convertible')}
                </SitemapLink>
              </LinkItem>
              <LinkItem>
                <SitemapLink to="/cars?category=wagon">
                  <Car className="icon" size={20} />
                  {t('sitemap.categories.wagon', 'Wagon')}
                </SitemapLink>
              </LinkItem>
            </LinkList>
          </SitemapSection>
        </SitemapGrid>

        <InfoSection>
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

