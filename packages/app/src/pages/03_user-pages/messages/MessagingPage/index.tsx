import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '@globul-cars/coreuseTranslation';
import ConversationsList from '@globul-cars/uimessaging/ConversationsList';
import ConversationView from '@globul-cars/uimessaging/ConversationView';
import { Conversation } from '@globul-cars/servicesmessaging/advanced-messaging-service';

// Facebook Messenger Style Components
const MessagingContainer = styled.div`
  height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const MessagingHeader = styled.div`
  background: #4267B2;
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const MessagingContent = styled.div`
  flex: 1;
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
`;

const ConversationsColumn = styled.div`
  width: 360px;
  background: white;
  border-right: 1px solid #e4e6ea;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    position: absolute;
    z-index: 20;
    height: 100%;
  }
`;

const ConversationColumn = styled.div<{ $showConversation?: boolean }>`
  flex: 1;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    display: ${props => props.$showConversation ? 'flex' : 'none'};
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #65676b;
  text-align: center;
  padding: 40px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1c1e21;
`;

const EmptyDescription = styled.p`
  font-size: 15px;
  margin: 0;
  color: #65676b;
`;

const MessagingPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConversation, setShowConversation] = useState(false);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversation(true);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversation(false);
  };

  return (
    <MessagingContainer>
      <MessagingHeader>
        <HeaderTitle>{t('messaging.title')}</HeaderTitle>
        <HeaderActions>
          <HeaderButton title="Search">
            🔍
          </HeaderButton>
          <HeaderButton title="New Message">
            ✏️
          </HeaderButton>
          <HeaderButton title="Options">
            ⋮
          </HeaderButton>
        </HeaderActions>
      </MessagingHeader>

      <MessagingContent>
        <ConversationsColumn>
          <ConversationsList
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversation?.id}
          />
        </ConversationsColumn>

        <ConversationColumn $showConversation={showConversation}>
          {selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              onBack={handleBackToConversations}
            />
          ) : (
            <EmptyState>
              <EmptyIcon>💬</EmptyIcon>
              <EmptyTitle>{t('messaging.selectConversation')}</EmptyTitle>
              <EmptyDescription>
                {t('messaging.selectConversationDescription')}
              </EmptyDescription>
            </EmptyState>
          )}
        </ConversationColumn>
      </MessagingContent>
    </MessagingContainer>
  );
};

export default MessagingPage;

