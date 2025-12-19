import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

const Container = styled.div`
  padding: 100px 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
  color: #1e293b;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #64748b;
`;

const SharedInboxPage: React.FC = () => {
    const { language } = useLanguage();

    return (
        <Container>
            <Title>{language === 'bg' ? 'Споделена поща' : 'Shared Inbox'}</Title>
            <Description>
                {language === 'bg'
                    ? 'Тази функционалност е в процес на разработка.'
                    : 'This feature is currently under development.'}
            </Description>
        </Container>
    );
};

export default SharedInboxPage;
