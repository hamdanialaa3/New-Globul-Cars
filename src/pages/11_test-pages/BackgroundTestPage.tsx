import React, { useState } from 'react';
import styled from 'styled-components';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';
import { useLanguage } from '../../contexts/LanguageContext';
import CentralLangSwitcher from '../../components/Navigation/CentralLangSwitcher';
import { Play, Pause, FastForward, Image as ImageIcon, Sparkles, Zap } from 'lucide-react';

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  color: white;
  text-align: center;
  background: #000;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  padding: 3rem;
  background: rgba(15, 20, 25, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 700px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  letter-spacing: -1px;
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  line-height: 1.6;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 2rem;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#8B5CF6' : 'white'};
  padding: 12px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TEST_IMAGES = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80'
];

const BackgroundTestPage: React.FC = () => {
  const { language } = useLanguage();
  const [interval, setIntervalTime] = useState(6000);

  const translations = {
    en: {
      title: "Cinematic Motion",
      desc: "Immersive high-fidelity transitions powered by advanced CSS hardware acceleration.",
      fast: "Fast",
      normal: "Normal",
      slow: "Slow",
      effects: "Effects On",
      pause: "Pause",
      play: "Play"
    },
    bg: {
      title: "Кинематографично движение",
      desc: "Потапящи преходи с висока точност, захранвани от усъвършенствано хардуерно ускорение на CSS.",
      fast: "Бързо",
      normal: "Нормално",
      slow: "Бавно",
      effects: "Ефекти Вкл",
      pause: "Пауза",
      play: "Старт"
    },
    ar: {
      title: "Cinematic Motion",
      desc: "Immersive high-precision transitions powered by advanced CSS hardware acceleration.",
      fast: "Fast",
      normal: "Normal",
      slow: "Slow",
      effects: "Effects",
      pause: "Pause",
      play: "Play"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <PageContainer>
      <BackgroundSlideshow images={TEST_IMAGES} interval={interval} />
      <Content>
        <Title>{t.title}</Title>
        <Description>{t.desc}</Description>

        <ControlsGrid>
          <ControlButton $active={interval === 3000} onClick={() => setIntervalTime(3000)}>
            <Zap />
            <span>{t.fast}</span>
          </ControlButton>
          <ControlButton $active={interval === 6000} onClick={() => setIntervalTime(6000)}>
            <Play />
            <span>{t.normal}</span>
          </ControlButton>
          <ControlButton $active={interval === 10000} onClick={() => setIntervalTime(10000)}>
            <Sparkles />
            <span>{t.slow}</span>
          </ControlButton>
        </ControlsGrid>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
          <CentralLangSwitcher />
        </div>
      </Content>
    </PageContainer>
  );
};

export default BackgroundTestPage;

