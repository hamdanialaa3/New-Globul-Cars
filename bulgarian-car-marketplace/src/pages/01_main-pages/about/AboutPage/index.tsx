// src/pages/AboutPage.tsx
// About Us Page for Bulgarian Car Marketplace

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';
import { 
  Car, 
  Users, 
  Shield, 
  Award, 
  MapPin, 
  Clock,
  Heart,
  Star,
  CheckCircle
} from 'lucide-react';

// Styled Components
const AboutContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border-radius: 24px;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/hero-background.jpg') center/cover;
    opacity: 0.1;
    z-index: 0;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #3b82f6, #1e40af);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
  }

  .number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }

  .label {
    color: #64748b;
    font-weight: 500;
  }
`;

const ContentSection = styled.section`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #475569;
    margin-bottom: 1.5rem;
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const ValueCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;

  .icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #3b82f6, #1e40af);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: white;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  p {
    color: #64748b;
    line-height: 1.6;
  }
`;

const TeamSection = styled.section`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 3rem;
  border-radius: 20px;
  text-align: center;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .icon {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .content {
    h4 {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 0.25rem;
    }

    p {
      color: #64748b;
      margin: 0;
    }
  }
`;

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AboutContainer>
      <Container>
        <HeroSection>
          <h1>{t('about.title', 'About MOBILE-EU')}</h1>
          <p>
            {t('about.subtitle', 'Your trusted partner in finding the perfect car in Bulgaria. We connect buyers and sellers with quality vehicles and exceptional service.')}
          </p>
        </HeroSection>

        <StatsGrid>
          <StatCard>
            <div className="icon">
              <Car size={24} />
            </div>
            <div className="number">10,000+</div>
            <div className="label">{t('about.stats.cars', 'Cars Listed')}</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <Users size={24} />
            </div>
            <div className="number">50,000+</div>
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

        <ContentSection>
          <h2>
            <Heart size={24} />
            {t('about.mission.title', 'Our Mission')}
          </h2>
          <p>
            {t('about.mission.text', 'At MOBILE-EU, we believe that finding the perfect car should be simple, transparent, and enjoyable. Our mission is to revolutionize the car buying and selling experience in Bulgaria by providing a platform that prioritizes trust, quality, and customer satisfaction.')}
          </p>
        </ContentSection>

        <ValuesGrid>
          <ValueCard>
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

        <TeamSection>
          <h2>{t('about.team.title', 'Our Team')}</h2>
          <p>
            {t('about.team.text', 'We are a passionate team of automotive experts, technology enthusiasts, and customer service professionals dedicated to making car buying and selling in Bulgaria better for everyone.')}
          </p>
          
          <ContactInfo>
            <ContactItem>
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

