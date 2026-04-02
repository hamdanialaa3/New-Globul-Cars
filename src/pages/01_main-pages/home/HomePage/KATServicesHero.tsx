import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink, FiZap } from 'react-icons/fi';

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const shine = keyframes`
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
`;

const HeroWrapper = styled.section`
  width: 100%;
  margin: 2.5rem 0;
  cursor: pointer;
  padding: 0 1rem;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  height: 320px;
  background: #0f172a;
  border: 1px solid var(--border-primary);

  @media (max-width: 768px) {
    height: 450px;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1);
  opacity: 0.7;

  ${Container}:hover & {
    transform: scale(1.05);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(15, 23, 42, 0.7) 40%,
    rgba(15, 23, 42, 0) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4rem;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 2.5rem;
    background: linear-gradient(0deg, 
      rgba(15, 23, 42, 0.95) 0%, 
      rgba(15, 23, 42, 0.2) 100%);
    justify-content: flex-end;
  }
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 0.5rem 1.2rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(37, 99, 235, 0.3);
  width: fit-content;
  backdrop-filter: blur(8px);
  animation: ${float} 4s ease-in-out infinite;

  svg { font-size: 1rem; }
`;

const Title = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  max-width: 600px;
  line-height: 1.1;
  font-family: 'Outfit', sans-serif;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #cbd5e1;
  max-width: 480px;
  line-height: 1.6;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const CTA = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: fit-content;

  span {
    position: relative;
    z-index: 1;
  }

  svg {
    transition: transform 0.3s ease;
  }

  ${Container}:hover & {
    color: #60a5fa;
    svg { transform: translateX(6px); }
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: ${shine} 3s infinite;
  }
`;

const KATServicesHero: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <HeroWrapper onClick={() => navigate('/KAT-R-BG')}>
      <Container>
        <HeroImage 
          src="/assets/images/home/kat-hero.webp" 
          alt="KAT Bulgaria Services"
          loading="eager"
          width={800}
          height={450}
        />
        <Overlay>
          <Badge>
            <FiZap /> {t('kat.officialPortal')}
          </Badge>
          <Title>{t('kat.pageTitle')}</Title>
          <Subtitle>{t('kat.pageSubtitle')}</Subtitle>
          <CTA>
            <span>{t('kat.btnVisit1')}</span>
            <FiExternalLink />
          </CTA>
        </Overlay>
      </Container>
    </HeroWrapper>
  );
};

export default KATServicesHero;
