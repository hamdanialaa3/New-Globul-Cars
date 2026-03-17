import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import SearchWidget from './SearchWidget';

const HeroShell = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 45%), linear-gradient(135deg, rgba(5, 11, 24, 0.4) 0%, rgba(12, 39, 64, 0.4) 55%, rgba(6, 17, 31, 0.4) 100%)'
    : 'radial-gradient(120% 120% at 20% 20%, rgba(0,51,102,0.08) 0%, rgba(255,255,255,0) 45%), linear-gradient(135deg, rgba(247, 250, 252, 0.4) 0%, rgba(232, 240, 247, 0.4) 55%, rgba(246, 248, 251, 0.4) 100%)'};
  color: ${props => props.$isDark ? '#e8eef7' : '#0f172a'};
  padding: 90px 18px 48px;
  overflow: hidden;
`;

const HeroGrid = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2.5rem;
  align-items: center;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.span<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${props => props.$isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,51,102,0.1)'};
  color: ${props => props.$isDark ? '#bcd4f6' : '#0c2b4a'};
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,51,102,0.2)'};
`;

const Title = styled.h1<{ $isDark: boolean }>`
  margin: 1rem 0 0.75rem;
  font-size: 3.2rem;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};

  span {
    color: ${props => props.$isDark ? '#5eb6ff' : '#0057b8'};
  }

  @media (max-width: 640px) {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  margin: 0 0 1.5rem;
  max-width: 620px;
  font-size: 1.05rem;
  line-height: 1.6;
  color: ${props => props.$isDark ? '#c9d6e8' : '#475569'};
`;

const CTAGroup = styled.div`
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const PrimaryButton = styled(motion.button)<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.95rem 1.6rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #0a5ed1 0%, #0c7ce8 100%)'
    : 'linear-gradient(135deg, #004b8d 0%, #006dcc 100%)'};
  color: #fff;
  box-shadow: 0 14px 40px rgba(0, 92, 181, 0.25);
`;

const SecondaryButton = styled(motion.button)<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.95rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.3)' : 'rgba(12,26,42,0.2)'};
  background: transparent;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.$isDark ? '#e8eef7' : '#0c1a2a'};
`;

const StatBar = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0.5rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: ${props => props.$isDark ? 'rgba(255,255,255,0.04)' : '#ffffff'};
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,26,42,0.08)'};
  box-shadow: ${props => props.$isDark ? 'none' : '0 14px 32px rgba(15,23,42,0.06)'};
`;

const StatValue = styled.div<{ $isDark: boolean }>`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$isDark ? '#c9d6e8' : '#52627a'};
`;

const HighlightCard = styled.div<{ $isDark: boolean }>`
  position: relative;
  padding: 1.6rem;
  border-radius: 18px;
  background: ${props => props.$isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' : 'linear-gradient(145deg, #ffffff, #f4f7fb)'};
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(12,26,42,0.08)'};
  box-shadow: ${props => props.$isDark ? '0 10px 40px rgba(0,0,0,0.35)' : '0 18px 48px rgba(15,23,42,0.08)'};
`;

const BadgeRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  span {
    padding: 0.35rem 0.75rem;
    border-radius: 10px;
    background: ${props => props.$isDark ? 'rgba(94,182,255,0.12)' : 'rgba(0,109,204,0.1)'};
    color: ${props => props.$isDark ? '#d3e7ff' : '#004b8d'};
    font-weight: 700;
    font-size: 0.85rem;
  }
`;

const HighlightList = styled.ul<{ $isDark: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.65rem;

  li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: ${props => props.$isDark ? '#d7e4f5' : '#1f2a3d'};
  }

  strong {
    color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
  }
`;

const SearchDock = styled(motion.div)<{ $isDark: boolean }>`
  margin-top: 1.5rem;
  background: ${props => props.$isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)'};
  border-radius: 18px;
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,26,42,0.06)'};
  box-shadow: ${props => props.$isDark ? '0 16px 50px rgba(0,0,0,0.4)' : '0 18px 60px rgba(12,26,42,0.08)'};
  padding: 12px;
`;

const NewHeroSection: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  const headline = isBg ? 'Елитната арена за продажба на автомобили' : 'The elite arena for selling cars';
  const subline = isBg
    ? 'Без компромиси в скоростта, доверието и дизайна. Намирате или продавате премиум автомобили за секунди.'
    : 'No compromises on speed, trust, or design. Find or sell premium vehicles in seconds.';

  return (
    <HeroShell $isDark={isDark}>
      <HeroGrid>
        <div>
          <Eyebrow $isDark={isDark}>{isBg ? 'Най-бързият премиум маркетплейс' : 'Fastest premium marketplace'}</Eyebrow>
          <Title $isDark={isDark}>{headline} <span>EU Grade</span></Title>
          <Subtitle $isDark={isDark}>{subline}</Subtitle>

          <CTAGroup>
            <PrimaryButton
              $isDark={isDark}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/search')}
            >
              <Car size={20} />
              {isBg ? 'Разгледай 24h нови' : 'Browse fresh arrivals'}
            </PrimaryButton>
            <SecondaryButton
              $isDark={isDark}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/sell/auto')}
            >
              <Send size={18} />
              {isBg ? 'Публикувай обява' : 'List your car'}
            </SecondaryButton>
          </CTAGroup>

          <StatBar $isDark={isDark}>
            <StatCard $isDark={isDark}>
              <StatValue $isDark={isDark}>24h</StatValue>
              <StatLabel $isDark={isDark}>{isBg ? 'нови обяви всеки ден' : 'new listings daily'}</StatLabel>
            </StatCard>
            <StatCard $isDark={isDark}>
              <StatValue $isDark={isDark}>8.2/10</StatValue>
              <StatLabel $isDark={isDark}>{isBg ? 'скорост на отговор' : 'response speed score'}</StatLabel>
            </StatCard>
            <StatCard $isDark={isDark}>
              <StatValue $isDark={isDark}>0% spam</StatValue>
              <StatLabel $isDark={isDark}>{isBg ? 'филтрирани заявки' : 'filtered inquiries'}</StatLabel>
            </StatCard>
          </StatBar>
        </div>

        <HighlightCard $isDark={isDark}>
          <BadgeRow $isDark={isDark}>
            <span>{isBg ? 'Дилърски контрол' : 'Dealer-grade control'}</span>
            <span>{isBg ? 'EV готовност' : 'EV ready'}</span>
          </BadgeRow>
          <HighlightList $isDark={isDark}>
            <li><strong>HPK</strong> {isBg ? 'архитектура за мигновен филтър по региони' : 'architecture for instant region filters'}</li>
            <li><strong>Algolia + Firestore</strong> {isBg ? 'хибридно търсене за милисекунди' : 'hybrid search in milliseconds'}</li>
            <li><strong>Secure chat</strong> {isBg ? 'всички заявки с цифров следа' : 'every inquiry carries a digital trail'}</li>
          </HighlightList>
        </HighlightCard>
      </HeroGrid>

      <SearchDock
        $isDark={isDark}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <SearchWidget />
      </SearchDock>
    </HeroShell>
  );
};

export default NewHeroSection;
