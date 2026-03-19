import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

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
  background: #fef2f2;
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
  background: ${p => p.$primary ? '#dc2626' : '#fff'};
  color: ${p => p.$primary ? '#fff' : '#334155'};
  transition: all 0.2s;
  &:hover { opacity: 0.85; transform: translateY(-1px); }
`;

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBg = language === 'bg';

  return (
    <Container>
      <IconWrap>
        <ShieldX size={40} color="#dc2626" />
      </IconWrap>
      <Title>403</Title>
      <Subtitle>
        {isBg
          ? 'Нямате достъп до тази страница. Ако смятате, че това е грешка, свържете се с нас.'
          : 'You don\'t have permission to access this page. If you think this is a mistake, contact us.'}
      </Subtitle>
      <Actions>
        <Btn onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> {isBg ? 'Назад' : 'Go Back'}
        </Btn>
        <Btn $primary onClick={() => navigate('/')}>
          <Home size={18} /> {isBg ? 'Начална страница' : 'Go Home'}
        </Btn>
      </Actions>
    </Container>
  );
};

export default ForbiddenPage;
