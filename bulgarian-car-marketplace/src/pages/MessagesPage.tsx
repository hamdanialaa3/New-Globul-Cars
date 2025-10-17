/**
 * Messages Page
 * Main page for P2P messaging system
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../context/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import { MessageCircle, ArrowLeft } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 80px;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 24px auto;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 0;
  height: calc(100vh - 180px);
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: calc(100vh - 160px);
  }
`;

const ConversationsPanel = styled.div<{ $hidden: boolean }>`
  border-right: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    display: ${props => props.$hidden ? 'none' : 'block'};
  }
`;

const ChatPanel = styled.div<{ $hidden: boolean }>`
  @media (max-width: 768px) {
    display: ${props => props.$hidden ? 'none' : 'block'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  padding: 40px 20px;
  text-align: center;
  
  h2 {
    margin: 16px 0 8px;
    color: #1a1a1a;
  }
  
  p {
    margin: 0;
    max-width: 400px;
  }
`;

const LoginPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 180px);
  text-align: center;
  padding: 40px 20px;
  
  h2 {
    margin: 0 0 16px;
    color: #1a1a1a;
  }
  
  p {
    margin: 0 0 24px;
    color: #666;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #FF7900 0%, #FF6600 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
`;

const MessagesPage: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [showChat, setShowChat] = useState(false);

  // Read conversation from URL and auto-open it
  useEffect(() => {
    const conversationFromUrl = searchParams.get('conversation');
    if (conversationFromUrl) {
      setActiveConversationId(conversationFromUrl);
      setShowChat(true);
    }
  }, [searchParams]);

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    setActiveConversationId(undefined);
  };

  if (!currentUser) {
    return (
      <Container>
        <PageHeader>
          <HeaderContent>
            <HeaderTitle>
              <MessageCircle size={28} />
              {language === 'bg' ? 'Съобщения' : 'Messages'}
            </HeaderTitle>
          </HeaderContent>
        </PageHeader>
        
        <LoginPrompt>
          <h2>
            {language === 'bg' 
              ? 'Влезте в профила си'
              : 'Sign in to your account'
            }
          </h2>
          <p>
            {language === 'bg'
              ? 'Трябва да влезете в профила си, за да видите съобщенията си'
              : 'You need to sign in to view your messages'
            }
          </p>
          <LoginButton onClick={() => navigate('/login')}>
            {language === 'bg' ? 'Вход' : 'Sign In'}
          </LoginButton>
        </LoginPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          {showChat && (
            <BackButton onClick={handleBackToList}>
              <ArrowLeft size={20} />
            </BackButton>
          )}
          <HeaderTitle>
            <MessageCircle size={28} />
            {language === 'bg' ? 'Съобщения' : 'Messages'}
          </HeaderTitle>
        </HeaderContent>
      </PageHeader>

      <ContentContainer>
        <ConversationsPanel $hidden={showChat}>
          <ConversationList
            activeConversationId={activeConversationId}
            onConversationSelect={handleConversationSelect}
          />
        </ConversationsPanel>

        <ChatPanel $hidden={!showChat && window.innerWidth <= 768}>
          {activeConversationId ? (
            <ChatWindow
              conversationId={activeConversationId}
              otherUserName={otherUserName}
            />
          ) : (
            <EmptyState>
              <MessageCircle size={64} color="#ccc" />
              <h2>
                {language === 'bg'
                  ? 'Изберете разговор'
                  : 'Select a conversation'
                }
              </h2>
              <p>
                {language === 'bg'
                  ? 'Изберете разговор от списъка, за да започнете да пишете съобщения'
                  : 'Select a conversation from the list to start messaging'
                }
              </p>
            </EmptyState>
          )}
        </ChatPanel>
      </ContentContainer>
    </Container>
  );
};

export default MessagesPage;
