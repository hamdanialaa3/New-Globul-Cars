// src/components/NotFoundPage.tsx
// Professional 404 Not Found Page Component

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 4rem 2rem;
  text-align: center;
`;

const NotFoundTitle = styled.h1`
  font-size: 8rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 5rem;
  }
`;

const NotFoundSubtitle = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NotFoundDescription = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const HomeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary.main};
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <NotFoundContainer>
      <NotFoundTitle>{t('errors.notFound.title')}</NotFoundTitle>
      <NotFoundSubtitle>{t('errors.notFound.subtitle')}</NotFoundSubtitle>
      <NotFoundDescription>
        {t('errors.notFound.description')}
      </NotFoundDescription>
      
      <ButtonContainer>
        <HomeButton onClick={() => navigate('/')}>
          <Home size={20} />
          {t('errors.notFound.homeButton')}
        </HomeButton>
        
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          {t('common.back') || 'Back'}
        </BackButton>
      </ButtonContainer>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
