// src/pages/AboutPage.tsx
// About Us Page for Koli One

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SOCIAL_LINKS } from '../../../../constants/socialLinks';
import {
  Car,
  Users,
  Shield,
  Award,
  MapPin,
  Clock,
  Heart,
  Star,
  CheckCircle,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter
} from 'lucide-react';

// Styled Components
const AboutContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.$isDark ? '#0F1419' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  padding: 40px 0;
  transition: background 0.3s ease;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeroSection = styled.section<{ $isDark: boolean }>`
  text-align: center;
  padding: 80px 40px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #1A1F2E 0%, #0F1419 100%)'
    : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'};
  color: white;
  border-radius: 24px;
  margin-bottom: 64px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    opacity: 0.2;
    z-index: 0;
  }

  h1 {
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 800;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${props => props.$isDark ? '#FF8C61' : 'white'};
  }

  p {
    font-size: 1.2rem;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)'};
    max-width: 650px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    font-weight: 500;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  box-shadow: ${props => props.$isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-5px);
  }

  .icon {
    width: 64px;
    height: 64px;
    background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #FF8C61 0%, #FF5C00 100%)'
    : 'linear-gradient(135deg, #3b82f6, #1e40af)'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    box-shadow: ${props => props.$isDark ? '0 4px 15px rgba(255, 140, 97, 0.3)' : 'none'};
  }

  .number {
    font-size: 2.5rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
    margin-bottom: 8px;
  }

  .label {
    color: #64748b;
    font-weight: 500;
  }
`;

const ContentSection = styled.section<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 48px;
  border-radius: 24px;
  box-shadow: ${props => props.$isDark ? '0 15px 40px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  margin-bottom: 48px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};

  h2 {
    font-size: 2.2rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 1.15rem;
    line-height: 1.8;
    color: ${props => props.$isDark ? '#cbd5e1' : '#475569'};
    margin-bottom: 24px;
    font-weight: 500;
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const ValueCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1A1F2E' : 'white'};
  padding: 32px;
  border-radius: 20px;
  box-shadow: ${props => props.$isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border-left: 6px solid ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
  border-top: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
  border-right: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
  border-bottom: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    border-left-width: 10px;
  }

  .icon {
    width: 56px;
    height: 56px;
    background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #FF8C61 0%, #FF5C00 100%)'
    : 'linear-gradient(135deg, #3b82f6, #1e40af)'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: white;
    box-shadow: ${props => props.$isDark ? '0 4px 15px rgba(255, 140, 97, 0.2)' : 'none'};
  }

  h3 {
    font-size: 1.4rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
    line-height: 1.6;
    font-weight: 500;
  }
`;

const TeamSection = styled.section<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? '#1A1F2E'
    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'};
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 1.2rem;
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
    max-width: 600px;
    margin: 0 auto 32px;
    font-weight: 500;
  }
`;

const SocialSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const SocialIconButton = styled.a<{ $color?: string; $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: ${props => props.$isDark ? '#0F1419' : 'white'};
  border-radius: 50%;
  color: ${props => props.$color || '#3b82f6'};
  box-shadow: ${props => props.$isDark ? '0 4px 15px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
  
  &:hover {
    transform: translateY(-8px) scale(1.1);
    background: ${props => props.$color || (props.$isDark ? '#FF8C61' : '#3b82f6')};
    color: white;
    box-shadow: ${props => props.$isDark
    ? `0 10px 25px ${props.$color}55`
    : '0 8px 25px rgba(0, 0, 0, 0.2)'};
    border-color: transparent;
  }
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ContactItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.$isDark ? '#0F1419' : 'white'};
  border-radius: 12px;
  box-shadow: ${props => props.$isDark ? '0 5px 15px rgba(0, 0, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
    transform: scale(1.02);
  }

  .icon {
    width: 44px;
    height: 44px;
    background: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: ${props => props.$isDark ? '0 2px 10px rgba(255, 140, 97, 0.3)' : 'none'};
  }

  .content {
    h4 {
      font-weight: 700;
      color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
    }

    p {
      color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
      margin: 0;
      font-weight: 600;
      font-size: 1rem;
    }
  }
`;

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AboutContainer $isDark={isDark}>
      <Container>
        <HeroSection $isDark={isDark}>
          <h1>{t('about.title', 'About Koli One')}</h1>
          <p>
            {t('about.subtitle', 'Your trusted partner in finding the perfect car in Bulgaria. We connect buyers and sellers with quality vehicles and exceptional service.')}
          </p>
        </HeroSection>

        <StatsGrid>
          <StatCard $isDark={isDark}>
            <div className="icon">
              <Car size={24} />
            </div>
            <div className="number">15,000+</div>
            <div className="label">{t('about.stats.cars', 'Cars Listed')}</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <Users size={24} />
            </div>
            <div className="number">8,500+</div>
            <div className="label">{t('about.stats.users', 'Happy Customers')}</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <Award size={24} />
            </div>
            <div className="number">98%</div>
            <div className="label">{t('about.stats.satisfaction', 'Satisfaction Rate')}</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <MapPin size={24} />
            </div>
            <div className="number">28</div>
            <div className="label">{t('about.stats.cities', 'Cities Covered')}</div>
          </StatCard>
        </StatsGrid>

        <ContentSection $isDark={isDark}>
          <h2>
            <Heart size={24} />
            {t('about.mission.title', 'Our Mission')}
          </h2>
          <p>
            {t('about.mission.text', 'At Koli One, we believe that finding the perfect car should be simple, transparent, and enjoyable. Our mission is to revolutionize the car buying and selling experience in Bulgaria by providing a platform that prioritizes trust, quality, and customer satisfaction.')}
          </p>
        </ContentSection>

        <ValuesGrid>
          <ValueCard $isDark={isDark}>
            <div className="icon">
              <Shield size={24} />
            </div>
            <h3>{t('about.values.trust.title', 'Trust & Safety')}</h3>
            <p>
              {t('about.values.trust.text', 'Every car listing is verified and every seller is authenticated to ensure a safe and secure transaction.')}
            </p>
          </ValueCard>
          <ValueCard>
            <div className="icon">
              <Star size={24} />
            </div>
            <h3>{t('about.values.quality.title', 'Quality Assurance')}</h3>
            <p>
              {t('about.values.quality.text', 'We maintain high standards for all listings, ensuring that only quality vehicles make it to our platform.')}
            </p>
          </ValueCard>
          <ValueCard>
            <div className="icon">
              <CheckCircle size={24} />
            </div>
            <h3>{t('about.values.service.title', 'Exceptional Service')}</h3>
            <p>
              {t('about.values.service.text', 'Our dedicated support team is always ready to help you with any questions or concerns.')}
            </p>
          </ValueCard>
        </ValuesGrid>

        <TeamSection $isDark={isDark}>
          <h2>{t('about.follow.title', 'Follow Us')}</h2>
          <p>
            {t('about.follow.text', 'Stay connected with Koli One on social media for the latest car listings, automotive tips, and community updates.')}
          </p>

          <SocialSection>
            <SocialIconButton href={SOCIAL_LINKS.facebook} target="_blank" $color="#1877F2" title="Facebook" $isDark={isDark}>
              <Facebook size={24} />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.instagram} target="_blank" $color="#E4405F" title="Instagram" $isDark={isDark}>
              <Instagram size={24} />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.tiktok} target="_blank" $color="#000000" title="TikTok" $isDark={isDark}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.youtube} target="_blank" $color="#FF0000" title="YouTube" $isDark={isDark}>
              <Youtube size={24} />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.threads} target="_blank" $color="#000000" title="Threads" $isDark={isDark}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.057-1.83.339-2.43.84-.537.449-.827 1.014-.794 1.546.032.496.296.936.764 1.273.555.4 1.27.574 2.068.527 1.06-.058 1.857-.4 2.37-1.016.45-.54.73-1.314.833-2.3-.73-.244-1.485-.43-2.252-.555-2.81-.457-5.03.196-6.61 1.942-1.298 1.437-1.946 3.305-1.875 5.403.07 2.098.948 3.834 2.541 5.02 1.412.952 3.14 1.43 5.14 1.43 3.302 0 5.83-1.218 7.513-3.619 1.31-1.869 1.972-4.302 1.972-7.236 0-2.933-.663-5.366-1.972-7.236-1.683-2.401-4.21-3.619-7.513-3.619z" />
              </svg>
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.linkedin} target="_blank" $color="#0077B5" title="LinkedIn" $isDark={isDark}>
              <Linkedin size={24} />
            </SocialIconButton>
            <SocialIconButton href={SOCIAL_LINKS.twitter} target="_blank" $color="#000000" title="X (Twitter)" $isDark={isDark}>
              <Twitter size={24} />
            </SocialIconButton>
          </SocialSection>

          <ContactInfo>
            <ContactItem $isDark={isDark}>
              <div className="icon">
                <MapPin size={20} />
              </div>
              <div className="content">
                <h4>{t('about.contact.location', 'Location')}</h4>
                <p>{t('about.contact.address', 'Sofia, Bulgaria')}</p>
              </div>
            </ContactItem>
            <ContactItem>
              <div className="icon">
                <Clock size={20} />
              </div>
              <div className="content">
                <h4>{t('about.contact.hours', 'Working Hours')}</h4>
                <p>{t('about.contact.schedule', 'Mon-Fri: 9:00-18:00')}</p>
              </div>
            </ContactItem>
            <ContactItem>
              <div className="icon">
                <Heart size={20} />
              </div>
              <div className="content">
                <h4>{t('about.contact.founded', 'Founded')}</h4>
                <p>{t('about.contact.year', '2024')}</p>
              </div>
            </ContactItem>
          </ContactInfo>
        </TeamSection>
      </Container>
    </AboutContainer>
  );
};

export default AboutPage;
