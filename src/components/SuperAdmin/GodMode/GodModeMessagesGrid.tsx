import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, MessageSquare, Trash2, Search, RefreshCw, Eye, User, Lock } from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { logger } from '../../../services/logger-service';

// Reusing God Mode styles
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Container = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const Badge = styled.span`
  background: #9b59b6;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SearchInput = styled.input`
  background: #333;
  border: 1px solid #444;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  width: 300px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #333;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #111;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #111;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const Card = styled.div`
  background: #222;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #333;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: #555;
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  align-items: center;
`;

const TimeTag = styled.div`
  font-size: 11px;
  color: #666;
  font-family: monospace;
`;

const MessagePreview = styled.div`
  font-size: 14px;
  color: #ccc;
  margin-bottom: 16px;
  line-height: 1.5;
  background: #151515;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #333;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
`;

const Participants = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const ParticipantBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #333;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  color: #aaa;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  border-top: 1px solid #333;
  padding-top: 16px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  flex: 1;
  background: ${props => props.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.danger ? '#e74c3c' : '#fff'};
  border: 1px solid ${props => props.danger ? 'rgba(231, 76, 60, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.danger ? '#e74c3c' : '#fff'};
    color: ${props => props.danger ? '#fff' : '#000'};
  }
`;

interface GodModeMessagesGridProps {
  onClose: () => void;
}

export const GodModeMessagesGrid: React.FC<GodModeMessagesGridProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Get last 100 conversations
      const q = query(
        collection(db, 'conversations'),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(data);
    } catch (error) {
      logger.error('GodMode: Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (convoId: string) => {
    if (window.confirm(`⚠️ GOD MODE WARNING ⚠️\n\nAre you sure you want to PERMANENTLY DELETE this conversation?\n\nThis will remove all message history for all participants.`)) {
      try {
        await deleteDoc(doc(db, 'conversations', convoId));
        setMessages(prev => prev.filter(m => m.id !== convoId));
      } catch (error) {
        alert('Failed to delete conversation: ' + error);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const filteredMessages = messages.filter(msg =>
    msg.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.id.includes(searchTerm)
  );

  return (
    <Overlay>
      <Container>
        <Header>
          <Title>
            <MessageSquare size={28} />
            GOD MODE: INTERCEPTOR
            <Badge>{messages.length} CHANNELS</Badge>
          </Title>
          <Controls>
            <SearchInput
              placeholder="Search message content or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <CloseButton onClick={fetchMessages} title="Refresh Data">
              <RefreshCw size={20} />
            </CloseButton>
            <CloseButton onClick={onClose} title="Close God Mode">
              <X size={24} />
            </CloseButton>
          </Controls>
        </Header>

        <Grid>
          {loading ? (
            <div style={{ color: '#fff', gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
              <Lock size={40} style={{ marginBottom: 20 }} />
              <div>DECRYPTING COMMUNICATIONS...</div>
            </div>
          ) : filteredMessages.map(msg => (
            <Card key={msg.id}>
              <CardHeader>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#666' }}>ID: {msg.id.substring(0, 8)}...</span>
                </div>
                <TimeTag>{formatDate(msg.updatedAt)}</TimeTag>
              </CardHeader>

              <Participants>
                {msg.participants?.map((p: string) => (
                  <ParticipantBadge key={p}>
                    <User size={10} /> {p.substring(0, 6)}...
                  </ParticipantBadge>
                ))}
              </Participants>

              <MessagePreview>
                {msg.lastMessage?.text || 'No text content (Attachment/System)'}
              </MessagePreview>

              <Actions>
                <ActionButton onClick={() => window.open(`/messages?conversationId=${msg.id}`, '_blank')}>
                  <Eye size={14} /> SPY
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(msg.id)}>
                  <Trash2 size={14} /> PURGE
                </ActionButton>
              </Actions>
            </Card>
          ))}
        </Grid>
      </Container>
    </Overlay>
  );
};
