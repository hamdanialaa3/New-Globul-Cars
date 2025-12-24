/**
 * Numeric Messaging Page
 * 🔢 Unified Messaging between Users by Numeric IDs
 * 
 * URLs:
 * - /messages/:senderNumericId/:recipientNumericId
 * - Example: /messages/1/2 (Conversation between User 1 and User 2)
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import styled, { keyframes, css } from 'styled-components';
import { Send, ArrowLeft, MoreVertical, Phone, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  numericMessagingSystemService,
  type NumericMessage
} from '../../services/numeric-messaging-system.service';
import { BulgarianProfileService } from '../../services/bulgarian-profile-service';
import { db } from '../../firebase/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { serviceLogger } from '../../services/logger-service';
import { logger } from '../../services/logger-service';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
    border-radius: 8px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`;

const UserNumericId = styled.span`
  font-size: 12px;
  color: #999;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div<{ $isSender: boolean }>`
  display: flex;
  justify-content: ${props => (props.$isSender ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div<{ $isSender: boolean }>`
  background: ${props => (props.$isSender ? '#ff8f10' : '#f0f0f0')};
  color: ${props => (props.$isSender ? 'white' : '#1a1a1a')};
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
`;

const MessageTime = styled.span`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const InputSection = styled.div`
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  max-height: 100px;

  &:focus {
    outline: none;
    border-color: #ff8f10;
  }
`;

const SendButton = styled.button`
  background: #ff8f10;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;

  &:hover {
    background: #ff7900;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;

  h2 {
    color: #d32f2f;
    margin-bottom: 16px;
  }

  p {
    color: #666;
  }
`;

interface NumericMessagingPageProps { }

const NumericMessagingPage: React.FC<NumericMessagingPageProps> = () => {
  const { senderNumericId, recipientNumericId } = useParams<{
    senderNumericId: string;
    recipientNumericId: string;
  }>();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<NumericMessage[]>([]);
  const [recipient, setRecipient] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [senderNumericId, recipientNumericId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Validate numeric IDs
      const senderNumId = parseInt(senderNumericId || '0', 10);
      const recipientNumId = parseInt(recipientNumericId || '0', 10);

      if (!senderNumId || !recipientNumId) {
        throw new Error('❌ Invalid numeric IDs');
      }

      // 2️⃣ Verify current user owns sender numeric ID
      if (!currentUser?.uid) {
        throw new Error('❌ Not authenticated');
      }

      const userProfile = await BulgarianProfileService.getUserProfile(currentUser.uid);

      if (!userProfile?.numericId || userProfile.numericId !== senderNumId) {
        throw new Error(`❌ You do not own numeric ID ${senderNumId}`);
      }

      // 3️⃣ Get recipient by numeric ID
      const recipientUserQuery = query(
        collection(db, 'users'),
        where('numericId', '==', recipientNumId)
      );

      const recipientSnapshot = await getDocs(recipientUserQuery);

      if (recipientSnapshot.empty) {
        throw new Error(`❌ User not found: numeric ID ${recipientNumId}`);
      }

      const recipientData = recipientSnapshot.docs[0].data();
      setRecipient(recipientData);

      // 4️⃣ Load conversation
      const messagesList = await numericMessagingSystemService.getConversation(
        senderNumId,
        recipientNumId
      );

      setMessages(messagesList);

      // 5️⃣ Resolve car context if provided (for system messages or highlights)
      const carNum = searchParams.get('car');
      if (carNum) {
        logger.info('Car context detected in numeric messaging', { carNumericId: carNum });
        // Optional: Add specialized UI logic here if needed
      }

      logger.info('✅ Conversation loaded', {
        senderNumId,
        recipientNumId,
        messageCount: messagesList.length
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      logger.error('Error loading conversation', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      toast.warning('Message cannot be empty');
      return;
    }

    if (!currentUser?.uid) {
      toast.error('Not authenticated');
      return;
    }

    try {
      setSending(true);

      const senderNumId = parseInt(senderNumericId || '0', 10);
      const recipientNumId = parseInt(recipientNumericId || '0', 10);

      const carNumericId = searchParams.get('car')
        ? parseInt(searchParams.get('car')!, 10)
        : undefined;

      const newMessage = await numericMessagingSystemService.sendMessage(
        senderNumId,
        recipientNumId,
        {
          type: 'general',
          subject: 'Message',
          content: messageInput.trim(),
          carNumericId: carNumericId
        }
      );

      setMessages([...messages, newMessage]);
      setMessageInput('');

      toast.success('✅ Message sent');

      logger.info('✅ Message sent', {
        messageId: newMessage.id,
        from: senderNumId,
        to: recipientNumId
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(errorMessage);
      logger.error('Error sending message', err as Error);
    } finally {
      setSending(false);
    }
  };

  // ✅ LOADING
  if (loading) {
    return (
      <PageContainer>
        <ErrorContainer>
          <span>⏳ Loading...</span>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // ✅ ERROR
  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <div>
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} style={{ marginTop: '16px', padding: '10px 20px' }}>
              Go Back
            </button>
          </div>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </BackButton>
          {recipient && (
            <UserInfo>
              <UserName>{recipient.displayName || 'User'}</UserName>
              <UserNumericId>👤 User #{recipient.numericId}</UserNumericId>
            </UserInfo>
          )}
        </HeaderLeft>
      </Header>

      <MessagesContainer>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}

        {messages.map(message => {
          const isSender = message.senderNumericId === parseInt(senderNumericId || '0', 10);

          return (
            <Message key={message.id} $isSender={isSender}>
              <div>
                <MessageBubble $isSender={isSender}>
                  <strong>{message.subject}</strong>
                  <p style={{ margin: '8px 0 0 0' }}>{message.content}</p>
                </MessageBubble>
                <MessageTime>
                  {new Date(message.createdAt).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')}
                </MessageTime>
              </div>
            </Message>
          );
        })}
      </MessagesContainer>

      <InputSection>
        <TextArea
          placeholder="Type a message..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={sending}
        />
        <SendButton onClick={handleSendMessage} disabled={sending || !messageInput.trim()}>
          <Send size={20} />
          {sending ? '...' : 'Send'}
        </SendButton>
      </InputSection>
    </PageContainer>
  );
};

export default NumericMessagingPage;
