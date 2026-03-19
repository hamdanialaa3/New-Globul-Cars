import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { WifiOff, Home, RefreshCw } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 40px 20px;
  text-align: center;
`;

const IconWrap = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fef9c3;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #64748b;
  max-width: 480px;
  margin: 0 0 32px;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : '1px solid #e2e8f0'};
  background: ${p => p.$primary ? '#eab308' : '#fff'};
  color: ${p => p.$primary ? '#fff' : '#334155'};
  transition: all 0.2s;
  &:hover { opacity: 0.85; transform: translateY(-1px); }
`;

const OfflinePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBg = language === 'bg';

  return (
    <Container>
      <IconWrap>
        <WifiOff size={40} color="#eab308" />
      </IconWrap>
      <Title>{isBg ? 'Офлайн' : 'Offline'}</Title>
      <Subtitle>
        {isBg
          ? 'Изглежда нямате интернет връзка. Проверете мрежовите си настройки и опитайте отново.'
          : 'You appear to be offline. Check your network settings and try again.'}
      </Subtitle>
      <Actions>
        <Btn onClick={() => window.location.reload()}>
          <RefreshCw size={18} /> {isBg ? 'Опитай отново' : 'Retry'}
        </Btn>
        <Btn $primary onClick={() => navigate('/')}>
          <Home size={18} /> {isBg ? 'Начална страница' : 'Go Home'}
        </Btn>
      </Actions>
    </Container>
  );
};

export default OfflinePage;
