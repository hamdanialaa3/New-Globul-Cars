import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import ConversationsList from '../components/messaging/ConversationsList';
import ConversationView from '../components/messaging/ConversationView';
import { Conversation } from '../services/messagingService';

// Styled Components
const MessagingContainer = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 25%, #2A2A2A 50%, #1A1A1A 75%, #0A0A0A 100%),
    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 50%);
  position: relative;
  overflow-x: hidden;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.1) 50%, transparent 70%);
    opacity: 0.1;
    pointer-events: none;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #FFFFFF, #00D4FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    text-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
    position: relative;
    z-index: 1;
  }

  p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
`;

const MessagingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  height: 70vh;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const ConversationsColumn = styled.div`
  @media (max-width: 1024px) {
    height: 50vh;
  }
`;

const ConversationColumn = styled.div`
  @media (max-width: 1024px) {
    height: 50vh;
  }
`;

const MessagingPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  return (
    <MessagingContainer>
      <Container>
        <Header>
          <h1>{t('messaging.title')}</h1>
          <p>{t('messaging.subtitle')}</p>
        </Header>

        <MessagingGrid>
          <ConversationsColumn>
            <ConversationsList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
            />
          </ConversationsColumn>

          <ConversationColumn>
            <ConversationView
              conversation={selectedConversation}
              onBack={handleBackToConversations}
            />
          </ConversationColumn>
        </MessagingGrid>
      </Container>
    </MessagingContainer>
  );
};

export default MessagingPage;

